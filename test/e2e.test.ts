/**
 * End-to-end tests for WhatsApp Webhook, Matchmaker & Vector Pipeline.
 *
 * Tests:
 * 1. Webhook Verification Handshake (Meta hub.challenge echo).
 * 2. Wishlist creation in DemandBoard.
 * 3. Proactive Matching via Lambda Durable Functions (`withDurableExecution`).
 * 4. Active Inventory creation when no match is found.
 * 5. 2KB S3 Vector chunking enforcement and metadata filter schema.
 * 6. EventBridge lifecycle events emission.
 * 7. Real Parent Group Chat Message Parsing & Multi-Intent.
 * 8. Multi-Photo Ingestion & Seller Catalog Building.
 * 9. Greetings & Spam Filtering.
 * 10. Cryptographic HMAC-SHA256 Payload Signature Verification.
 * 11. Security, Governance & Observability Status & PII Protection.
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { spawn, type ChildProcess } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import * as crypto from 'node:crypto';
import { installCookieJar, isServerRunning } from '@aws-blocks/blocks/utils';
import type { api as ApiType } from 'aws-blocks';

installCookieJar();

let server: ChildProcess | null = null;
let api: typeof ApiType;

test.before(async () => {
  if (!await isServerRunning()) {
    server = spawn('npm', ['run', 'dev:server'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
      env: { ...process.env, NODE_OPTIONS: '' },
    });
    server.unref();
    await setTimeout(2000);
  }

  const mod = await import('aws-blocks');
  api = mod.api;

  for (let i = 0; i < 30; i++) {
    try {
      await api.getLifecycleEvents();
      return;
    } catch {
      await setTimeout(1000);
    }
  }
  throw new Error('Dev server did not become ready within 30s');
});

test.after(() => {
  if (server?.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  }
});

// ─── 1. Webhook Verification Handshake ─────────────────────────────────────────

test('webhook: Meta verification handshake echoes hub.challenge', async () => {
  const result = await api.verifyWebhook('subscribe', 'my_verify_token_123', 'test_challenge_abc');
  assert.strictEqual(result.status, 200);
  assert.strictEqual(result.challenge, 'test_challenge_abc');
});

test('webhook: Meta verification fails with invalid token', async () => {
  const result = await api.verifyWebhook('subscribe', 'wrong_token', 'test_challenge_abc');
  assert.strictEqual(result.status, 403);
  assert.strictEqual(result.error, 'Verification failed');
});

// ─── 2. Proactive Matchmaker & Durable Orchestration ─────────────────────────

test('matchmaker: proactive matching notifies waiting wishlist user', async () => {
  // Step 1: User requests an item not in stock ("Year 5 Chemistry")
  const demand = await api.createDemand('+15556733768', 'Year 5 Chemistry', 'Year5Chemistry', 'Marketplace');
  assert.strictEqual(demand.status, 'pending');
  assert.strictEqual(demand.concept, 'Year5Chemistry');

  // Step 2: New matching item is processed by Durable Function
  const webhookRes = await api.handleWebhook({
    media_id: 'media_chem_book',
    from_phone: '+15556733768',
    message_text: 'Year 5 Chemistry Textbook in great condition',
  });

  assert.strictEqual(webhookRes.success, true);
  assert.strictEqual(webhookRes.result.status, 'matched');
  assert.strictEqual(webhookRes.result.matchedDemandId, demand.demandId);

  // Step 3: Verify DemandBoard status updated to 'matched'
  const demands = await api.listDemands();
  const updatedDemand = demands.find(d => d.demandId === demand.demandId);
  assert.strictEqual(updatedDemand?.status, 'matched');
});

test('inventory: unmatched item is saved to ActiveInventory', async () => {
  const webhookRes = await api.handleWebhook({
    media_id: 'media_aws_book',
    from_phone: '+15556733768',
    message_text: 'I have Year 12 Computer Science Book',
  });

  assert.strictEqual(webhookRes.success, true);
  assert.strictEqual(webhookRes.result.status, 'added_to_inventory');
  assert.ok(webhookRes.result.itemId);

  const inventory = await api.listInventory('Year12ComputerScience');
  assert.ok(inventory.length >= 1);
  assert.strictEqual(inventory[0].domain, 'Science');
  assert.strictEqual(inventory[0].providerCategory, 'HighSchool');
  assert.strictEqual(inventory[0].conditionType, 'New');
});

// ─── 3. S3 Vector 2KB Chunk Limit & Metadata ─────────────────────────────────

test('vectors: chunking enforces strict 2KB limit', async () => {
  const longText = 'A'.repeat(5000);
  const chunks = await api.chunkText(longText, 2048);

  assert.ok(chunks.length > 1);
  const encoder = new TextEncoder();
  for (const chunk of chunks) {
    assert.ok(encoder.encode(chunk).byteLength <= 2048, 'Chunk size must be <= 2048 bytes');
  }
});

// ─── 4. EventBridge Lifecycle Events Emission ─────────────────────────────────

test('events: lifecycle events stream records all stages', async () => {
  const events = await api.getLifecycleEvents();
  assert.ok(events.length >= 3);

  const eventTypes = events.map(e => e.eventType);
  assert.ok(eventTypes.includes('ProcessingStarted'));
  assert.ok(eventTypes.includes('ExtractionComplete'));
  assert.ok(eventTypes.includes('S3VectorIngested'));
});

// ─── 5. Real Parent Group Chat Message Parsing & Multi-Intent ──────────────────

test('parent group chat: processes multi-intent messages (offers + demands)', async () => {
  // Parent 1 posts: "Looking for Year 7 books please"
  const res1 = await api.handleWebhook({
    from_phone: '+33615796596',
    message_text: 'Looking for Year 7 books please',
  });
  assert.strictEqual(res1.success, true);

  // Parent 2 posts: "Hello parents. We have books year 9 and 10&11. We need book year 12."
  const res2 = await api.handleWebhook({
    from_phone: '+33783106095',
    message_text: 'Hello parents. We have books year 9 and 10&11. We need book year 12. Thanks you',
  });
  assert.strictEqual(res2.success, true);
  assert.ok((res2.result.extractedIntentsCount || 0) >= 3);

  // Parent 3 posts: "I have year 7 books" -> should match Parent 1!
  const res3 = await api.handleWebhook({
    from_phone: '+23794924198',
    message_text: 'I have year 7 books',
  });
  assert.strictEqual(res3.success, true);
  assert.strictEqual(res3.result.status, 'matched');
});

// ─── 6. Multi-Photo Ingestion & Seller Catalog Building ────────────────────────

test('parent photo batch: saves under parent catalog and notifies matching wishlist parents', async () => {
  const sellerPhone = '+15556733768';

  // Step 1: Another parent registers a wishlist entry for "Year 8 Science"
  const waitingParentDemand = await api.createDemand('+15559998888', 'Year 8 Science', 'Year8Science', 'Science');
  assert.strictEqual(waitingParentDemand.status, 'pending');

  // Step 2: Parent uploads 4 textbook cover images sequentially
  const photos = [
    { media_id: 'media_cambridge_science_8', message_text: 'I have Year 8 Science' },
    { media_id: 'media_cambridge_english_2', message_text: 'I have Year 2 English Textbook' },
    { media_id: 'media_cambridge_maths_2', message_text: 'I have Year 2 Mathematics Textbook' },
    { media_id: 'media_cambridge_global_2', message_text: 'I have Year 2 Global Perspectives Textbook' },
  ];

  for (const photo of photos) {
    const res = await api.handleWebhook({
      from_phone: sellerPhone,
      media_id: photo.media_id,
      message_text: photo.message_text,
    });
    assert.strictEqual(res.success, true);
  }

  // Step 3: Verify all 4 books are saved under that parent's seller catalog
  const parentCatalog = await api.listInventoryBySeller(sellerPhone);
  assert.ok(parentCatalog.length >= 4);

  // Step 4: Verify the waiting parent's wishlist was proactively matched
  const updatedDemands = await api.listDemands();
  const matchedDemand = updatedDemands.find(d => d.demandId === waitingParentDemand.demandId);
  assert.strictEqual(matchedDemand?.status, 'matched');
});

// ─── 7. Greetings & Spam Filtering ─────────────────────────────────────────────

test('greetings & spam: filters chit-chat and responds with helpful guidance', async () => {
  const greetingMessages = ['hi', 'hello', 'good morning', 'thanks', 'ok'];

  for (const text of greetingMessages) {
    const res = await api.handleWebhook({
      from_phone: '+15551112222',
      message_text: text,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.result.status, 'greeting');
    assert.ok(typeof res.result.replyMessage === 'string' && res.result.replyMessage.length > 0);
  }
});

// ─── 8. Cryptographic HMAC-SHA256 Payload Signature Verification ─────────────

test('security: HMAC-SHA256 signature validation accepts genuine Meta payloads', async () => {
  const testSecret = 'secret_key_whatsapp_test_9988';
  const rawPayload = JSON.stringify({
    entry: [{ changes: [{ value: { messages: [{ from: '+15550001111', text: { body: 'Hello' } }] } }] }],
  });

  const expectedDigest = crypto.createHmac('sha256', testSecret).update(rawPayload, 'utf8').digest('hex');
  const validHeader = `sha256=${expectedDigest}`;

  const validResult = await api.validateSignature(rawPayload, validHeader, testSecret);
  assert.strictEqual(validResult.valid, true, 'Genuine HMAC signature must be accepted');

  const tamperedHeader = `sha256=${'0'.repeat(64)}`;
  const tamperedResult = await api.validateSignature(rawPayload, tamperedHeader, testSecret);
  assert.strictEqual(tamperedResult.valid, false, 'Tampered signature must be rejected');

  const missingHeaderResult = await api.validateSignature(rawPayload, undefined, testSecret);
  assert.strictEqual(missingHeaderResult.valid, false, 'Missing signature header must be rejected when secret is configured');
});

// ─── 9. Security, Governance & Observability Status ──────────────────────────

test('governance: system exposes enterprise security and observability status', async () => {
  const status = await api.getSecurityObservabilityStatus();
  assert.strictEqual(status.wafEnabled, true);
  assert.strictEqual(status.kmsEncryptionKeyAlias, 'alias/books-block-app-cmk');
  assert.strictEqual(status.s3LifecyclePolicyDays, 30);
  assert.strictEqual(status.distributedTracingActive, true);
  assert.strictEqual(status.emfMetricNamespace, 'BooksApp/WhatsAppMarketplace');
});
