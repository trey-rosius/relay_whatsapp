import test from 'node:test';
import assert from 'node:assert/strict';
import {
  triageParentRequestWithJev,
  setCustomTypeSafeClient,
  getTypeSafeClient,
  parseParentMessageIntentsWithLLM,
  booksAgent,
  api,
  typesafeApiKeySetting,
} from '../aws-blocks/index.js';
import { TypeSafeClient } from '@typesafe-ai/sdk';

test('jev system one: typesafeApiKeySetting is registered in aws-blocks scope', async () => {
  assert.ok(typesafeApiKeySetting, 'typesafeApiKeySetting should be defined');
  const key = await typesafeApiKeySetting.get();
  assert.strictEqual(typeof key, 'string');
});

test('jev system one fallback: accurately triages parent requests without api key', async () => {
  const savedKey = process.env.TYPESAFE_API_KEY;
  delete process.env.TYPESAFE_API_KEY;
  setCustomTypeSafeClient(null);

  try {
    // 1. Offer with grade specified
    const offerRes = await triageParentRequestWithJev("J'ai Terminale C Physique à donner");
    assert.strictEqual(offerRes.intent, 'offer');
    assert.strictEqual(offerRes.lang, 'fr');
    assert.strictEqual(offerRes.isGradeMissing, false, 'Terminale C has an explicit grade');
    assert.strictEqual(offerRes.source, 'fallback');
    assert.ok(offerRes.confidence >= 0.85);
    assert.ok(offerRes.latencyMs >= 0);

    // 2. Demand with missing grade
    const demandMissingGrade = await triageParentRequestWithJev('I need Chemistry textbook');
    assert.strictEqual(demandMissingGrade.intent, 'demand');
    assert.strictEqual(demandMissingGrade.lang, 'en');
    assert.strictEqual(demandMissingGrade.isGradeMissing, true, 'Grade is missing');

    // 3. Demand with grade specified
    const demandWithGrade = await triageParentRequestWithJev('Looking for Year 8 Maths');
    assert.strictEqual(demandWithGrade.intent, 'demand');
    assert.strictEqual(demandWithGrade.lang, 'en');
    assert.strictEqual(demandWithGrade.isGradeMissing, false, 'Year 8 has an explicit grade');

    // 4. Parent activity inquiry
    const activityRes = await triageParentRequestWithJev('mes livres');
    assert.strictEqual(activityRes.intent, 'parent_activity');
    assert.strictEqual(activityRes.lang, 'fr');

    // 5. Contact inquiry
    const contactRes = await triageParentRequestWithJev('who has the book');
    assert.strictEqual(contactRes.intent, 'contact_inquiry');
    assert.strictEqual(contactRes.lang, 'en');

    // 6. Confirm handover
    const handoverRes = await triageParentRequestWithJev('livre remis au parent');
    assert.strictEqual(handoverRes.intent, 'confirm_handover');
    assert.strictEqual(handoverRes.lang, 'fr');

    // 7. Catalog inquiry
    const catalogRes = await triageParentRequestWithJev('catalogue');
    assert.strictEqual(catalogRes.intent, 'catalog');
    assert.strictEqual(catalogRes.lang, 'fr');

    // 8. Demand board
    const boardRes = await triageParentRequestWithJev('wishlist');
    assert.strictEqual(boardRes.intent, 'demand_board');
    assert.strictEqual(boardRes.lang, 'en');

    // 9. Other grades
    const otherRes = await triageParentRequestWithJev('autres classes');
    assert.strictEqual(otherRes.intent, 'other_grades');
    assert.strictEqual(otherRes.lang, 'fr');
  } finally {
    if (savedKey) {
      process.env.TYPESAFE_API_KEY = savedKey;
    }
  }
});

test('jev system one live: executes real-time TypeSafe Jev model when TYPESAFE_API_KEY is present', async () => {
  if (!process.env.TYPESAFE_API_KEY) {
    return; // Skip if no live key is configured
  }

  setCustomTypeSafeClient(null);

  // 1. Live offer triage
  const offer = await triageParentRequestWithJev("J'ai Terminale C Physique à donner");
  assert.strictEqual(offer.source, 'jev');
  assert.strictEqual(offer.intent, 'offer');
  assert.strictEqual(offer.lang, 'fr');
  assert.strictEqual(offer.isGradeMissing, false);
  assert.ok(offer.confidence >= 0.9);
  assert.ok(offer.model.includes('jev'));

  // 2. Live demand with missing grade triage
  const demandMissing = await triageParentRequestWithJev('I need Chemistry');
  assert.strictEqual(demandMissing.source, 'jev');
  assert.strictEqual(demandMissing.intent, 'demand');
  assert.strictEqual(demandMissing.isGradeMissing, true);
  assert.ok(demandMissing.confidence >= 0.85);

  // 3. Live parent activity triage
  const activity = await triageParentRequestWithJev('mes livres');
  assert.strictEqual(activity.source, 'jev');
  assert.strictEqual(activity.intent, 'parent_activity');
  assert.strictEqual(activity.lang, 'fr');
  assert.ok(activity.confidence >= 0.9);
});

test('jev system one client: processes mock TypeSafe AI response with calibrated probabilities', async () => {
  // Create a mock TypeSafeClient that simulates Jev's parallel choice & noul evaluation
  const mockClient = {
    systemOne: async (req: any) => {
      assert.ok(req.state.parent_message, 'State must contain parent_message');
      assert.ok(req.questions.intent, 'Questions must contain intent choice');
      assert.ok(req.questions.language, 'Questions must contain language choice');
      assert.ok(req.questions.is_grade_missing, 'Questions must contain is_grade_missing noul');

      const text = req.state.parent_message.toLowerCase();

      if (text.includes('mes livres') || text.includes('my books')) {
        return {
          model: 'jev-latest',
          answers: {
            intent: {
              type: 'choice',
              choice: 'parent_activity',
              confidence: 0.98,
              probabilities: { parent_activity: 0.98, greeting: 0.01, other: 0.01 },
            },
            language: {
              type: 'choice',
              choice: text.includes('mes livres') ? 'fr' : 'en',
              confidence: 0.99,
              probabilities: { fr: 0.99, en: 0.01 },
            },
            is_grade_missing: {
              type: 'noul',
              noul: 0.95,
            },
          },
          usage: { input_tokens: 42, output_tokens: 0 },
        };
      }

      if (text.includes('terminale c physique')) {
        return {
          model: 'jev-latest',
          answers: {
            intent: {
              type: 'choice',
              choice: 'offer',
              confidence: 0.96,
              probabilities: { offer: 0.96, demand: 0.02, catalog: 0.02 },
            },
            language: {
              type: 'choice',
              choice: 'fr',
              confidence: 0.99,
              probabilities: { fr: 0.99, en: 0.01 },
            },
            is_grade_missing: {
              type: 'noul',
              noul: 0.03, // Explicit grade present
            },
          },
          usage: { input_tokens: 38, output_tokens: 0 },
        };
      }

      return {
        model: 'jev-latest',
        answers: {
          intent: {
            type: 'choice',
            choice: 'greeting',
            confidence: 0.92,
            probabilities: { greeting: 0.92, catalog: 0.08 },
          },
          language: {
            type: 'choice',
            choice: 'en',
            confidence: 0.95,
            probabilities: { en: 0.95, fr: 0.05 },
          },
          is_grade_missing: {
            type: 'noul',
            noul: 0.9,
          },
        },
        usage: { input_tokens: 25, output_tokens: 0 },
      };
    },
  } as unknown as TypeSafeClient;

  setCustomTypeSafeClient(mockClient);

  try {
    // Test 1: Parent Activity via Jev System 1
    const res1 = await triageParentRequestWithJev('mes livres');
    assert.strictEqual(res1.source, 'jev');
    assert.strictEqual(res1.model, 'jev-latest');
    assert.strictEqual(res1.intent, 'parent_activity');
    assert.strictEqual(res1.lang, 'fr');
    assert.strictEqual(res1.confidence, 0.98);
    assert.strictEqual(res1.isGradeMissing, true);
    assert.ok(res1.probabilities.parent_activity >= 0.9);

    // Test 2: High confidence offer with school year via Jev System 1
    const res2 = await triageParentRequestWithJev("J'ai Terminale C Physique");
    assert.strictEqual(res2.source, 'jev');
    assert.strictEqual(res2.intent, 'offer');
    assert.strictEqual(res2.lang, 'fr');
    assert.strictEqual(res2.confidence, 0.96);
    assert.strictEqual(res2.isGradeMissing, false);

    // Test 3: Integration with parseParentMessageIntentsWithLLM
    // When Jev resolves with high confidence (>= 0.85), parseParentMessageIntentsWithLLM
    // uses the System 1 decision without falling back to Bedrock Nova!
    const fastIntents = await parseParentMessageIntentsWithLLM('mes livres');
    assert.strictEqual(fastIntents.length, 1);
    assert.strictEqual(fastIntents[0].intent, 'parent_activity');
    assert.strictEqual(fastIntents[0].lang, 'fr');
    assert.strictEqual(fastIntents[0].title, 'Mes Livres');
  } finally {
    // Reset custom client
    setCustomTypeSafeClient(null);
  }
});

test('jev system one error resilience: falls back gracefully when TypeSafe API fails', async () => {
  // Mock client that throws an error (simulating network error / rate limit)
  const failingClient = {
    systemOne: async () => {
      throw new Error('TypeSafe API 503 Service Unavailable');
    },
  } as unknown as TypeSafeClient;

  setCustomTypeSafeClient(failingClient);

  try {
    const res = await triageParentRequestWithJev('Looking for Year 8 Maths');
    // Must gracefully fall back without throwing
    assert.strictEqual(res.source, 'fallback');
    assert.strictEqual(res.intent, 'demand');
    assert.strictEqual(res.lang, 'en');
    assert.strictEqual(res.isGradeMissing, false);
  } finally {
    setCustomTypeSafeClient(null);
  }
});

test('strands agent tool: triageParentIntent tool is registered and callable by booksAgent', async () => {
  assert.ok(booksAgent, 'booksAgent should be defined');

  // Verify the API triage method works
  const apiHandlers = typeof (api as any) === 'function' ? (api as any)() : api;
  assert.ok(typeof apiHandlers.triageParentRequest === 'function');

  const result = await apiHandlers.triageParentRequest('I have Year 5 Science');
  assert.strictEqual(result.intent, 'offer');
  assert.strictEqual(result.lang, 'en');
  assert.strictEqual(result.isGradeMissing, false);
});
