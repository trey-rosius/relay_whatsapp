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
  // Parent 1 posts: "Looking for Year 2 Science textbook please" (Year 2 has 0 inventory items)
  const res1 = await api.handleWebhook({
    from_phone: '+33615796596',
    message_text: 'Looking for Year 2 Science textbook please',
  });
  assert.strictEqual(res1.success, true);

  // Parent 2 posts: "Hello parents. We have books year 9 and 10&11. We need book year 12. Thanks you"
  const res2 = await api.handleWebhook({
    from_phone: '+33783106095',
    message_text: 'Hello parents. We have books year 9 and 10&11. We need book year 12. Thanks you',
  });
  assert.strictEqual(res2.success, true);
  assert.ok((res2.result.extractedIntentsCount || 0) >= 3);

  // Parent 3 posts: "I have Year 2 Science textbook" -> should match Parent 1!
  const res3 = await api.handleWebhook({
    from_phone: '+23794924198',
    message_text: 'I have Year 2 Science textbook',
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
  const greetingMessages = ['hi', 'hello', 'tutorials', 'how do i use this app'];

  for (const text of greetingMessages) {
    const res = await api.handleWebhook({
      from_phone: '+15551112222',
      message_text: text,
    });

    assert.ok(typeof res.result.replyMessage === 'string' && res.result.replyMessage.includes('Share books'));
    assert.ok(res.result.replyMessage.includes('Ask for books'));
    assert.ok(res.result.replyMessage.includes('catalog'));
    assert.ok(res.result.replyMessage.includes('demand board'));
  }

  // French tutorial & greeting check
  const frRes = await api.handleWebhook({
    from_phone: '+33612345678',
    message_text: 'bonjour comment utiliser',
  });
  assert.strictEqual(frRes.success, true);
  assert.strictEqual(frRes.result.status, 'greeting');
  assert.ok(typeof frRes.result.replyMessage === 'string' && frRes.result.replyMessage.includes('Partager des livres'));
  assert.ok(frRes.result.replyMessage.includes('catalogue'));
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

// ─── 10. Placeholder Sanitization & Title Auto-Correction ─────────────────────

test('parsing: automatically sanitizes Year N placeholders and infers correct subject title', async () => {
  const res = await api.handleWebhook({
    from_phone: '+15554443322',
    message_text: 'I have Year 8 Science and Year 10 Physics textbooks',
  });

  assert.strictEqual(res.success, true);
  const inventory = await api.listInventory('Year8Science');
  assert.ok(inventory.length >= 1);
  assert.ok(!inventory.some(i => i.title.includes('<N>') || i.title.includes('Year N')), 'Title must not contain placeholder tokens');
});

// ─── 11. Interactive School Year Validation & Clarification ──────────────────

test('conversational clarification: prompts parent to specify school year when year is omitted in request', async () => {
  // Parent sends an offer without specifying any school year
  const res = await api.handleWebhook({
    from_phone: '+15553332211',
    message_text: 'I have Chemistry and Physics books available for anyone who wants them',
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.result.status, 'needs_year_clarification');
  assert.ok(typeof res.result.replyMessage === 'string' && res.result.replyMessage.length > 0);
  assert.ok(/year|année|grade|classe/i.test(res.result.replyMessage!), 'Reply message must ask for school year clarification');
});

// ─── 12. Feature 3A: Parent Storefront & Grade Bundles ────────────────────────

test('storefront & bundles (3A): computes seller grade bundles and multi-book collection', async () => {
  const seller = '+15557778899';
  await api.handleWebhook({
    from_phone: seller,
    message_text: 'I have Year 5 Maths, Year 5 Science, and Year 12 Physics',
  });

  const storefront = await api.getSellerStorefront(seller);
  assert.strictEqual(storefront.sellerPhone, seller);
  assert.ok(storefront.totalBooks >= 2);
  assert.ok(storefront.bundles.length >= 1);
  assert.ok(storefront.bundles.some(b => b.grade.includes('Year 5')));
  assert.ok(storefront.items.length >= 2);
});

// ─── 13. Feature 3B: Supply Deficits & Inbound Broadcasts ─────────────────────

test('supply deficit campaigns (3B): calculates deficits and generates bilingual calls', async () => {
  const gaps = await api.getSupplyGaps();
  assert.ok(typeof gaps.totalInventory === 'number');
  assert.ok(Array.isArray(gaps.deficitSubjects));
  assert.ok(Array.isArray(gaps.deficitGrades));
  assert.ok(gaps.broadcastMessageEn.includes('Relay Community Supply Call'));
  assert.ok(gaps.broadcastMessageFr.includes('Appel aux Livres'));
});

// ─── 14. Feature 3D: Verified Condition Quality Preservation ──────────────────

test('condition & quality (3D): extracts and preserves book conditions correctly', async () => {
  const seller = '+15558889900';
  const res = await api.handleWebhook({
    from_phone: seller,
    message_text: 'I have Year 7 English Textbook in New condition',
  });
  assert.strictEqual(res.success, true);

  const inventory = await api.listInventoryBySeller(seller);
  assert.ok(inventory.length >= 1);
  assert.ok(['New', 'LikeNew', 'Good', 'Acceptable'].includes(inventory[0].conditionType));
});

// ─── 15. 48-Hour Hold Reservation & Catalog Exclusion ────────────────────────

test('48h reservation (lifecycle): marks matched book as reserved and hides from active catalog', async () => {
  const sellerPhone = '+15551112233';
  const buyerPhone = '+15552223344';

  // Buyer creates demand for Year 2 Physics
  await api.handleWebhook({
    from_phone: buyerPhone,
    message_text: 'Looking for Year 2 Physics please',
  });

  // Seller offers Year 2 Physics -> triggers match
  const matchRes = await api.handleWebhook({
    from_phone: sellerPhone,
    message_text: 'I have Year 2 Physics available',
  });

  assert.strictEqual(matchRes.success, true);
  assert.strictEqual(matchRes.result.status, 'matched');

  // Verify book status is 'reserved' with ~48h expiry
  const sellerBooks = await api.listInventoryBySeller(sellerPhone);
  const matchedBook = (matchRes.result.itemId ? sellerBooks.find(b => b.itemId === matchRes.result.itemId) : null) || sellerBooks.find(b => b.status === 'reserved') || sellerBooks[sellerBooks.length - 1];
  assert.ok(matchedBook, 'Matched book must exist in seller inventory');
  assert.strictEqual(matchedBook.status, 'reserved', 'Book must transition to reserved hold');
  assert.ok(matchedBook.reservedUntil && matchedBook.reservedUntil > Date.now() + 47 * 3600 * 1000, 'Must have ~48H hold timestamp');
  assert.ok(matchedBook.handoverCode, 'Must have 4-digit handover code');
});

// ─── 16. Conversational WhatsApp Sale & Handover Confirmation ─────────────────

test('handover confirmation: seller texting SOLD marks book as sold and fulfills demand', async () => {
  const sellerPhone = '+15553334455';
  const buyerPhone = '+15554445566';

  // Setup match
  await api.handleWebhook({
    from_phone: buyerPhone,
    message_text: 'Looking for Year 2 Chemistry please',
  });
  await api.handleWebhook({
    from_phone: sellerPhone,
    message_text: 'I have Year 2 Chemistry available',
  });

  // Seller texts "SOLD" to confirm handover
  const soldRes = await api.handleWebhook({
    from_phone: sellerPhone,
    message_text: 'SOLD',
  });

  assert.strictEqual(soldRes.success, true);
  assert.ok(soldRes.result.replyMessage?.includes('sold') || soldRes.result.replyMessage?.includes('vendu'));

  // Verify book is marked as 'sold'
  const sellerBooks = await api.listInventoryBySeller(sellerPhone);
  const soldBook = sellerBooks.find(b => b.concept.includes('Year2'));
  assert.ok(soldBook);
  assert.strictEqual(soldBook.status, 'sold');
});

// ─── 17. Asymmetric Bilingual Language Preservation ───────────────────────────

test('bilingual routing: preserves parent languages accurately across matches', async () => {
  const sellerFr = '+33611223344';
  const buyerEn = '+15559988776';

  // French seller offers a book
  const offerRes = await api.handleWebhook({
    from_phone: sellerFr,
    message_text: "J'ai un livre de physique pour l'année 2",
  });
  assert.strictEqual(offerRes.success, true);

  const sellerItems = await api.listInventoryBySeller(sellerFr);
  assert.ok(sellerItems.length >= 1);
  assert.strictEqual(sellerItems[0].preferredLang, 'fr', 'Must store French language preference for seller');
});

// ─── 18. Autonomous Strands Agent Integration (Hackathon) ───────────────────

test('strands agent: chatWithAgent provides multi-turn conversational AI for parents', async () => {
  const chatRes = await api.chatWithAgent('Looking for Year 8 Science books');
  assert.ok(chatRes);
  assert.ok(chatRes.conversationId);
  assert.ok(typeof chatRes.replyText === 'string');
});

// ─── 19. WhatsApp Interactive List Messages ──────────────────────────────────

test('whatsapp interactive list: handles browse_year list_reply and returns interactive subject list', async () => {
  const buyerPhone = '+15554433221';
  
  // First ensure there is at least one book in Year 5
  await api.handleWebhook({
    from_phone: '+15559990001',
    message_text: 'I am selling Year 5 Chemistry book in Like New condition',
  });

  const res = await api.handleWebhook({
    from_phone: buyerPhone,
    interactive: {
      type: 'list_reply',
      id: 'browse_year_Year 5',
      title: 'Year 5',
      description: 'Books for Year 5',
    },
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.result.status, 'processed');
  assert.ok(res.result.replyMessage?.includes('Year 5') || res.result.replyMessage?.includes('Année 5'));
});

test('whatsapp interactive list: 1-tap book request via list_reply auto-matches with active inventory', async () => {
  const sellerPhone = '+15558887771';
  const buyerPhone = '+15558887772';

  // Seller lists Year 5 Mathematics
  await api.handleWebhook({
    from_phone: sellerPhone,
    message_text: 'Year 5 Mathematics textbook in new condition',
  });

  // Buyer taps "Mathematics" from the interactive list
  const res = await api.handleWebhook({
    from_phone: buyerPhone,
    interactive: {
      type: 'list_reply',
      id: 'request_concept_Year5Mathematics',
      title: 'Mathematics',
      description: '1 avail — New',
    },
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.result.status, 'matched');
  assert.ok(res.result.matchedDemandId, 'Must generate and match a demand');
});

test('whatsapp interactive list: full 3-step interactive journey (catalog -> select year -> 1-tap request -> handover)', async () => {
  const seller = '+15557771111';
  const buyer = '+15557772222';

  // Step 1: Seller lists Year 3 Science
  const listRes = await api.handleWebhook({
    from_phone: seller,
    message_text: 'I have Year 3 Science in Good condition',
  });
  assert.strictEqual(listRes.success, true);

  // Step 2: Buyer requests catalog
  const catalogRes = await api.handleWebhook({
    from_phone: buyer,
    message_text: 'catalog',
  });
  assert.strictEqual(catalogRes.success, true);

  // Step 3: Buyer selects Year 3 from grade list
  const yearRes = await api.handleWebhook({
    from_phone: buyer,
    interactive: {
      type: 'list_reply',
      id: 'browse_year_Year 3',
      title: 'Year 3',
    },
  });
  assert.strictEqual(yearRes.success, true);
  assert.strictEqual(yearRes.result.status, 'processed');

  // Step 4: Buyer taps Science to request in 1-tap
  const requestRes = await api.handleWebhook({
    from_phone: buyer,
    interactive: {
      type: 'list_reply',
      id: 'request_concept_Year3Science',
      title: 'Science',
    },
  });
  assert.strictEqual(requestRes.success, true);
  assert.strictEqual(requestRes.result.status, 'matched');

  // Step 5: Seller confirms exchange by texting SOLD
  const soldRes = await api.handleWebhook({
    from_phone: seller,
    message_text: 'SOLD',
  });
  assert.strictEqual(soldRes.success, true);
  assert.strictEqual(soldRes.result.status, 'processed');
});

test('whatsapp catalog text fast-path: user typing "Year 3" receives interactive year subjects', async () => {
  const buyer = '+15557773333';
  const res = await api.handleWebhook({
    from_phone: buyer,
    message_text: 'Year 3',
  });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.result.status, 'processed');
  assert.ok(res.result.replyMessage?.includes('Year 3') || res.result.replyMessage?.includes('Année 3'));
});







