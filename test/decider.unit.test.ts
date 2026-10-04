import test from 'node:test';
import assert from 'node:assert/strict';
import {
  triageParentRequestWithDecider,
  triageParentRequestWithJev,
  setCustomDeciderClient,
  getStrandsDeciderClient,
  parseParentMessageIntentsWithLLM,
  booksAgent,
  api,
  strandsDeciderEndpointSetting,
  strandsDeciderModelSetting,
  StrandsDeciderClient,
} from '../aws-blocks/index.js';

test('strands decider: app settings are registered in aws-blocks scope', async () => {
  assert.ok(strandsDeciderEndpointSetting, 'strandsDeciderEndpointSetting should be defined');
  assert.ok(strandsDeciderModelSetting, 'strandsDeciderModelSetting should be defined');

  const endpoint = await strandsDeciderEndpointSetting.get();
  assert.strictEqual(typeof endpoint, 'string');

  const model = await strandsDeciderModelSetting.get();
  assert.ok(model.includes('decider-2B'));
});

test('strands decider fallback: accurately triages parent requests without decider server', async () => {
  setCustomDeciderClient(null);

  // 1. Offer with explicit school year (Terminale C)
  const offerRes = await triageParentRequestWithDecider("J'ai Terminale C Physique à donner");
  assert.strictEqual(offerRes.intent, 'offer');
  assert.strictEqual(offerRes.lang, 'fr');
  assert.strictEqual(offerRes.isGradeMissing, false, 'Terminale C has an explicit grade');
  assert.strictEqual(offerRes.source, 'fallback');
  assert.ok(offerRes.confidence >= 0.85);
  assert.ok(offerRes.latencyMs >= 0);

  // 2. Demand with missing grade
  const demandMissingGrade = await triageParentRequestWithDecider('I need Chemistry textbook');
  assert.strictEqual(demandMissingGrade.intent, 'demand');
  assert.strictEqual(demandMissingGrade.lang, 'en');
  assert.strictEqual(demandMissingGrade.isGradeMissing, true, 'Grade is missing');

  // 3. Demand with explicit grade
  const demandWithGrade = await triageParentRequestWithDecider('Looking for Year 8 Maths');
  assert.strictEqual(demandWithGrade.intent, 'demand');
  assert.strictEqual(demandWithGrade.lang, 'en');
  assert.strictEqual(demandWithGrade.isGradeMissing, false, 'Year 8 has an explicit grade');

  // 4. Parent activity inquiry
  const activityRes = await triageParentRequestWithDecider('mes livres');
  assert.strictEqual(activityRes.intent, 'parent_activity');
  assert.strictEqual(activityRes.lang, 'fr');

  // 5. Contact inquiry
  const contactRes = await triageParentRequestWithDecider('who has the book');
  assert.strictEqual(contactRes.intent, 'contact_inquiry');
  assert.strictEqual(contactRes.lang, 'en');

  // 6. Confirm handover
  const handoverRes = await triageParentRequestWithDecider('livre remis au parent');
  assert.strictEqual(handoverRes.intent, 'confirm_handover');
  assert.strictEqual(handoverRes.lang, 'fr');

  // 7. Catalog inquiry
  const catalogRes = await triageParentRequestWithDecider('catalogue');
  assert.strictEqual(catalogRes.intent, 'catalog');
  assert.strictEqual(catalogRes.lang, 'fr');

  // 8. Demand board inquiry
  const boardRes = await triageParentRequestWithDecider('wishlist');
  assert.strictEqual(boardRes.intent, 'demand_board');
  assert.strictEqual(boardRes.lang, 'en');

  // 9. Other grades inquiry
  const otherRes = await triageParentRequestWithDecider('autres classes');
  assert.strictEqual(otherRes.intent, 'other_grades');
  assert.strictEqual(otherRes.lang, 'fr');
});

test('strands decider client: processes mock Strands Decider 2B response with calibrated scores', async () => {
  // Mock StrandsDeciderClient simulating the 2B pointer head inference
  const mockClient = {
    systemOne: async (req: any) => {
      assert.ok(req.state.parent_message, 'State must contain parent_message');
      assert.ok(req.questions.intent, 'Questions must contain intent choice');
      assert.ok(req.questions.language, 'Questions must contain language choice');
      assert.ok(req.questions.is_grade_missing, 'Questions must contain is_grade_missing noul');

      const text = req.state.parent_message.toLowerCase();

      if (text.includes('mes livres') || text.includes('my books')) {
        return {
          model: 'StrandsAgents/strands-decider-2B-hobson-v19',
          answers: {
            intent: {
              type: 'choice',
              choice: 'parent_activity',
              confidence: 0.985,
              probabilities: { parent_activity: 0.985, greeting: 0.008, other: 0.007 },
            },
            language: {
              type: 'choice',
              choice: text.includes('mes livres') ? 'fr' : 'en',
              confidence: 0.992,
              probabilities: { fr: 0.992, en: 0.008 },
            },
            is_grade_missing: {
              type: 'noul',
              noul: 0.94,
            },
          },
          usage: { input_tokens: 42, output_tokens: 0 },
          latency_ms: 112,
        };
      }

      if (text.includes('terminale c physique')) {
        return {
          model: 'StrandsAgents/strands-decider-2B-hobson-v19',
          answers: {
            intent: {
              type: 'choice',
              choice: 'offer',
              confidence: 0.965,
              probabilities: { offer: 0.965, demand: 0.015, catalog: 0.02 },
            },
            language: {
              type: 'choice',
              choice: 'fr',
              confidence: 0.994,
              probabilities: { fr: 0.994, en: 0.006 },
            },
            is_grade_missing: {
              type: 'noul',
              noul: 0.02, // Explicit grade present
            },
          },
          usage: { input_tokens: 38, output_tokens: 0 },
          latency_ms: 108,
        };
      }

      return {
        model: 'StrandsAgents/strands-decider-2B-hobson-v19',
        answers: {
          intent: {
            type: 'choice',
            choice: 'greeting',
            confidence: 0.94,
            probabilities: { greeting: 0.94, catalog: 0.06 },
          },
          language: {
            type: 'choice',
            choice: 'en',
            confidence: 0.96,
            probabilities: { en: 0.96, fr: 0.04 },
          },
          is_grade_missing: {
            type: 'noul',
            noul: 0.88,
          },
        },
        usage: { input_tokens: 25, output_tokens: 0 },
        latency_ms: 95,
      };
    },
  } as unknown as StrandsDeciderClient;

  setCustomDeciderClient(mockClient);

  try {
    // 1. Parent activity via Strands Decider
    const res1 = await triageParentRequestWithDecider('mes livres');
    assert.strictEqual(res1.source, 'decider');
    assert.strictEqual(res1.model, 'StrandsAgents/strands-decider-2B-hobson-v19');
    assert.strictEqual(res1.intent, 'parent_activity');
    assert.strictEqual(res1.lang, 'fr');
    assert.strictEqual(res1.confidence, 0.985);
    assert.strictEqual(res1.isGradeMissing, true);
    assert.ok(res1.probabilities.parent_activity >= 0.95);

    // 2. High confidence offer with school year via Strands Decider
    const res2 = await triageParentRequestWithDecider("J'ai Terminale C Physique");
    assert.strictEqual(res2.source, 'decider');
    assert.strictEqual(res2.intent, 'offer');
    assert.strictEqual(res2.lang, 'fr');
    assert.strictEqual(res2.confidence, 0.965);
    assert.strictEqual(res2.isGradeMissing, false);

    // 3. Integration with parseParentMessageIntentsWithLLM
    // When Strands Decider resolves with high confidence (>= 0.85),
    // parseParentMessageIntentsWithLLM returns immediate System 1 intent without Bedrock Nova
    const fastIntents = await parseParentMessageIntentsWithLLM('mes livres');
    assert.strictEqual(fastIntents.length, 1);
    assert.strictEqual(fastIntents[0].intent, 'parent_activity');
    assert.strictEqual(fastIntents[0].lang, 'fr');
    assert.strictEqual(fastIntents[0].title, 'Mes Livres');

    // 4. Backward-compatible triageParentRequestWithJev alias
    const jevAliasRes = await triageParentRequestWithJev('mes livres');
    assert.strictEqual(jevAliasRes.source, 'decider');
    assert.strictEqual(jevAliasRes.intent, 'parent_activity');
  } finally {
    setCustomDeciderClient(null);
  }
});

test('strands decider error resilience: falls back gracefully when Decider server fails', async () => {
  const failingClient = {
    systemOne: async () => {
      throw new Error('Connection refused: http://localhost:8000/v1/systemone');
    },
  } as unknown as StrandsDeciderClient;

  setCustomDeciderClient(failingClient);

  try {
    const res = await triageParentRequestWithDecider('Looking for Year 8 Maths');
    // Must gracefully fall back without throwing
    assert.strictEqual(res.source, 'fallback');
    assert.strictEqual(res.intent, 'demand');
    assert.strictEqual(res.lang, 'en');
    assert.strictEqual(res.isGradeMissing, false);
  } finally {
    setCustomDeciderClient(null);
  }
});

test('strands agent tool: triageParentIntent uses Strands Decider 2B and is callable', async () => {
  assert.ok(booksAgent, 'booksAgent should be defined');

  // Verify the API triage method works
  const apiHandlers = typeof (api as any) === 'function' ? (api as any)() : api;
  assert.ok(typeof apiHandlers.triageParentRequest === 'function');

  const result = await apiHandlers.triageParentRequest('I have Year 5 Science');
  assert.strictEqual(result.intent, 'offer');
  assert.strictEqual(result.lang, 'en');
  assert.strictEqual(result.isGradeMissing, false);
});
