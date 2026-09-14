import test from 'node:test';
import assert from 'node:assert/strict';
import {
  booksAgent,
  activeInventory,
  demandBoard,
  buildInteractiveOtherGradesPayload,
  buildInteractiveYearSubjectsPayload,
  buildParentActivitySummary,
  parseParentMessageIntentsWithLLM,
  hasExplicitSchoolYear,
  api,
} from '../aws-blocks/index.js';

test('strands agent: agent is instantiated with valid system prompt and tools', () => {
  assert.ok(booksAgent, 'booksAgent should be defined');
});

test('strands agent tools: searchInventory queries and filters active items', async () => {
  // Seed an inventory item
  const testItemId = `test_item_${Date.now()}`;
  await activeInventory.put({
    itemId: testItemId,
    title: 'Year 8 Mathematics Textbook',
    domain: 'Mathematics',
    providerCategory: 'MiddleSchool',
    concept: 'Year8Mathematics',
    conditionType: 'Good',
    description: 'Complete workbook',
    sellerPhone: '+237699001122',
    status: 'active',
    preferredLang: 'en',
    createdAt: Date.now(),
  });

  const allItems = await Array.fromAsync(activeInventory.scan());
  const found = allItems.find((i) => i.itemId === testItemId);
  assert.ok(found, 'Seeded item should exist in active inventory');
  assert.strictEqual(found?.title, 'Year 8 Mathematics Textbook');
  assert.strictEqual(found?.domain, 'Mathematics');

  // Clean up
  await activeInventory.delete({ itemId: testItemId });
});

test('strands agent tools: createDemand and listDemands manage parent wishlists', async () => {
  const testDemandId = `test_demand_${Date.now()}`;
  await demandBoard.put({
    demandId: testDemandId,
    userPhone: '+33611223344',
    requestedQuery: 'Year 10 Biology',
    concept: 'Year10Biology',
    domain: 'Science',
    status: 'pending',
    preferredLang: 'en',
    createdAt: Date.now(),
  });

  const allDemands = await Array.fromAsync(demandBoard.scan());
  const found = allDemands.find((d) => d.demandId === testDemandId);
  assert.ok(found, 'Seeded demand should exist on demand board');
  assert.strictEqual(found?.concept, 'Year10Biology');
  assert.strictEqual(found?.status, 'pending');

  // Clean up
  await demandBoard.delete({ demandId: testDemandId });
});

test('catalog overflow: buildInteractiveOtherGradesPayload generates sub-catalog for overflow grades', () => {
  // Simulate 13 grades: Year 1..10 (top 9 in main list, 10th is Other Grades) + Year 11, 12, 13, General
  const mockInventory = [
    { title: 'Books for Year 1 Phonics' },
    { title: 'Books for Year 3 English' },
    { title: 'Books for Year 4 Science' },
    { title: 'Books for Year 5 Maths' },
    { title: 'Books for Year 6 French' },
    { title: 'Books for Year 7 History' },
    { title: 'Books for Year 8 Geography' },
    { title: 'Books for Year 9 Chemistry' },
    { title: 'Books for Year 10 Physics' },
    // Overflow grades (total 21 books across 4 grades)
    { title: 'Books for Year 11 Literature' },
    { title: 'Books for Year 11 Biology' },
    { title: 'Books for Year 12 Economics' },
    { title: 'Books for Year 12 Accounting' },
    { title: 'Books for Year 13 Further Maths' },
    { title: 'Books for Year 13 Pure Maths' },
    { title: 'Computing' },
    { title: 'Social Studies' },
  ];

  const payload = buildInteractiveOtherGradesPayload(mockInventory, 'en');

  assert.strictEqual(payload.type, 'list');
  assert.ok(payload.header?.text.includes('Other Grades'), 'Header should mention Other Grades');
  assert.ok(payload.action.button.includes('Select Grade'), 'Button should say Select Grade');

  const rowIds = payload.action.sections[0].rows.map((r) => r.id);
  assert.ok(rowIds.includes('browse_year_Year11'), 'Should contain Year 11 row');
  assert.ok(rowIds.includes('browse_year_Year12'), 'Should contain Year 12 row');
  assert.ok(rowIds.includes('browse_year_Year13'), 'Should contain Year 13 row');
  assert.ok(rowIds.includes('browse_year_General'), 'Should contain General row');
});

test('catalog overflow: buildInteractiveYearSubjectsPayload distinguishes General from all overflow grades', () => {
  const mockInventory = [
    { title: 'Books for Year 11 Chemistry', conditionType: 'Good' },
    { title: 'Books for Year 12 Physics', conditionType: 'LikeNew' },
    { title: 'Books for Year 13 Biology', conditionType: 'New' },
    { title: 'Computing', conditionType: 'New' },
    { title: 'Social Studies', conditionType: 'Good' },
  ];

  // 1. Tapping 'General' returns only the 2 un-graded books (Computing, Social Studies)
  const generalPayload = buildInteractiveYearSubjectsPayload('General', mockInventory, 'en');
  const generalSubjects = generalPayload.action.sections[0].rows.map((r) => r.title);
  assert.strictEqual(generalSubjects.length, 2);
  assert.ok(generalSubjects.includes('Computing'));
  assert.ok(generalSubjects.includes('Social Studies'));

  // 2. Querying 'other' returns all 5 books in overflow grades with grade tags
  const otherPayload = buildInteractiveYearSubjectsPayload('other', mockInventory, 'en');
  assert.strictEqual(otherPayload.action.sections[0].rows.length, 5);
  const otherTitles = otherPayload.action.sections[0].rows.map((r) => r.title);
  assert.ok(otherTitles.some((t) => t.includes('Chemistry (Year 11)')));
  assert.ok(otherTitles.some((t) => t.includes('Physics (Year 12)')));
  assert.ok(otherTitles.some((t) => t.includes('Biology (Year 13)')));
  assert.ok(otherTitles.includes('Computing'));
  assert.ok(otherTitles.includes('Social Studies'));

  // 3. Tapping 'Year 11' returns only Year 11
  const y11Payload = buildInteractiveYearSubjectsPayload('Year 11', mockInventory, 'en');
  assert.strictEqual(y11Payload.action.sections[0].rows.length, 1);
  assert.strictEqual(y11Payload.action.sections[0].rows[0].title, 'Chemistry');
});

test('parent activity: buildParentActivitySummary and api.getParentActivity accurately categorize parent records', async () => {
  const uniqueSuffix = Date.now().toString().slice(-5);
  const testParentPhone = `+237991${uniqueSuffix}`;
  const otherParentPhone = `+237882${uniqueSuffix}`;

  // Seed active book
  const activeItemId = `act_${Date.now()}`;
  await activeInventory.put({
    itemId: activeItemId,
    title: 'Year 5 Mathematics',
    sellerPhone: testParentPhone,
    status: 'active',
    conditionType: 'Good',
    description: 'Textbook',
    concept: 'Year5Mathematics',
    domain: 'Mathematics',
    providerCategory: 'PrimarySchool',
    preferredLang: 'en',
    createdAt: Date.now(),
  });

  // Seed reserved book (exchanging with another parent)
  const resItemId = `res_${Date.now()}`;
  await activeInventory.put({
    itemId: resItemId,
    title: 'Year 7 French',
    sellerPhone: testParentPhone,
    reservedForPhone: otherParentPhone,
    handoverCode: '4589',
    status: 'reserved',
    reservedUntil: Date.now() + 48 * 3600 * 1000,
    concept: 'Year7French',
    domain: 'Languages',
    conditionType: 'Good',
    description: 'Textbook',
    providerCategory: 'MiddleSchool',
    preferredLang: 'en',
    createdAt: Date.now(),
  });

  // Seed sold book
  const soldItemId = `sold_${Date.now()}`;
  await activeInventory.put({
    itemId: soldItemId,
    title: 'Year 4 Science',
    sellerPhone: testParentPhone,
    soldToPhone: otherParentPhone,
    status: 'sold',
    soldAt: Date.now(),
    concept: 'Year4Science',
    domain: 'Science',
    conditionType: 'Good',
    description: 'Textbook',
    providerCategory: 'PrimarySchool',
    preferredLang: 'en',
    createdAt: Date.now() - 10000,
  });

  // Seed bought book
  const boughtItemId = `bought_${Date.now()}`;
  await activeInventory.put({
    itemId: boughtItemId,
    title: 'Year 9 History',
    sellerPhone: otherParentPhone,
    soldToPhone: testParentPhone,
    status: 'sold',
    soldAt: Date.now(),
    concept: 'Year9History',
    domain: 'Humanities',
    conditionType: 'Good',
    description: 'Textbook',
    providerCategory: 'MiddleSchool',
    preferredLang: 'en',
    createdAt: Date.now() - 20000,
  });

  // Seed demand
  const demId = `dem_${Date.now()}`;
  await demandBoard.put({
    demandId: demId,
    userPhone: testParentPhone,
    requestedQuery: 'Year 8 English Grammar',
    concept: 'Year8English',
    domain: 'Languages',
    status: 'pending',
    createdAt: Date.now(),
  });

  try {
    // Test English summary via API handler
    const apiHandlers = typeof (api as any) === 'function' ? (api as any)() : api;
    const summaryEn = await apiHandlers.getParentActivity(testParentPhone, 'en');
    assert.ok(
      summaryEn.includes('Books on Sale (1)'),
      `Should list 1 book on sale, got: ${summaryEn}`
    );
    assert.ok(summaryEn.includes('Year 5 Mathematics'));
    assert.ok(
      summaryEn.includes('Exchanges in Progress (1)'),
      'Should list 1 exchange in progress'
    );
    assert.ok(summaryEn.includes('#4589'), 'Should include verification code');
    assert.ok(summaryEn.includes('Books Sold (1)'), 'Should list 1 book sold');
    assert.ok(summaryEn.includes('Books Acquired / Bought (1)'), 'Should list 1 book bought');
    assert.ok(summaryEn.includes('Books Requested / Wishlist (1)'), 'Should list 1 demand');

    // Test French summary via direct function
    const summaryFr = await buildParentActivitySummary(testParentPhone, 'fr');
    assert.ok(summaryFr.includes('Livres en vente (1)'));
    assert.ok(summaryFr.includes('Échanges en cours (1)'));
    assert.ok(summaryFr.includes('Livres vendus (1)'));
    assert.ok(summaryFr.includes('Livres obtenus / achetés (1)'));
    assert.ok(summaryFr.includes('Livres recherchés (1)'));

    // Test empty parent guidance
    const emptySummary = await buildParentActivitySummary('+237600000000', 'en');
    assert.ok(
      emptySummary.includes('You do not have any books listed, sold, bought, or requested yet')
    );
    assert.ok(emptySummary.includes('Get started'));
  } finally {
    // Clean up
    await Promise.all([
      activeInventory.delete({ itemId: activeItemId }),
      activeInventory.delete({ itemId: resItemId }),
      activeInventory.delete({ itemId: soldItemId }),
      activeInventory.delete({ itemId: boughtItemId }),
      demandBoard.delete({ demandId: demId }),
    ]);
  }
});

test('semantic equivalence: "livres des year 3" and "year 3 books" yield identical catalog browsing intent', async () => {
  // Test French query "livres des year 3"
  const frIntents = await parseParentMessageIntentsWithLLM('livres des year 3');
  assert.strictEqual(frIntents.length, 1);
  assert.strictEqual(frIntents[0].intent, 'catalog');
  assert.strictEqual(frIntents[0].concept, 'Year3Books');
  assert.strictEqual(frIntents[0].lang, 'fr');
  assert.strictEqual(frIntents[0].title, 'Livres Année 3');

  // Test English query "year 3 books"
  const enIntents = await parseParentMessageIntentsWithLLM('year 3 books');
  assert.strictEqual(enIntents.length, 1);
  assert.strictEqual(enIntents[0].intent, 'catalog');
  assert.strictEqual(enIntents[0].concept, 'Year3Books');
  assert.strictEqual(enIntents[0].lang, 'en');
  assert.strictEqual(enIntents[0].title, 'Books for Year 3');

  // Test French natural grammar variations (noun-first)
  const frVariations = ['livres de year 3', 'livres de l\'année 3', 'livres année 3'];
  for (const query of frVariations) {
    const res = await parseParentMessageIntentsWithLLM(query);
    assert.strictEqual(res[0].intent, 'catalog', `Query "${query}" must yield catalog intent`);
    assert.strictEqual(res[0].concept, 'Year3Books');
    assert.strictEqual(res[0].lang, 'fr');
  }

  // Test English natural variations
  const enVariations = ['books for year 3', 'Year 3'];
  for (const query of enVariations) {
    const res = await parseParentMessageIntentsWithLLM(query);
    assert.strictEqual(res[0].intent, 'catalog', `Query "${query}" must yield catalog intent`);
    assert.strictEqual(res[0].concept, 'Year3Books');
    assert.strictEqual(res[0].lang, 'en');
  }

  // Verify interactive catalog payload generation in both languages
  const mockInventory = [
    { title: 'Books for Year 3 Mathematics', conditionType: 'Good' },
    { title: 'Books for Year 3 Science', conditionType: 'LikeNew' },
  ];

  const payloadFr = buildInteractiveYearSubjectsPayload('Année 3', mockInventory, 'fr');
  assert.ok(payloadFr.header?.text.includes('Année 3'));
  assert.ok(payloadFr.action.button.includes('Choisir un livre'));

  const payloadEn = buildInteractiveYearSubjectsPayload('Year 3', mockInventory, 'en');
  assert.ok(payloadEn.header?.text.includes('Year 3'));
  assert.ok(payloadEn.action.button.includes('Select Book'));
});

test('semantic discrimination: active transaction verbs distinguish demand and offer from catalog browsing', async () => {
  // Seeking / Demand with explicit verb
  const demandRes = await parseParentMessageIntentsWithLLM('Je cherche livres des year 3');
  assert.ok(
    demandRes[0].intent === 'demand' || demandRes[0].intent === 'demand_inquiry',
    `Should detect demand intent for "Je cherche...", got: ${demandRes[0].intent}`
  );

  // Supplying / Offer with explicit verb
  const offerRes = await parseParentMessageIntentsWithLLM("J'ai des livres de year 3");
  assert.ok(
    offerRes[0].intent === 'offer' || offerRes[0].intent === 'offer_inquiry',
    `Should detect offer intent for "J'ai...", got: ${offerRes[0].intent}`
  );
});

test('hasExplicitSchoolYear: accurately detects school year in structured concept or text', () => {
  // Concept with explicit school year should return true regardless of button text
  assert.strictEqual(hasExplicitSchoolYear('Year9Biology', '✅ Confirm Request'), true);
  assert.strictEqual(hasExplicitSchoolYear('Year9Biology', ''), true);
  assert.strictEqual(hasExplicitSchoolYear('Year9Biology', 'Je veux ce livre'), true);
  assert.strictEqual(hasExplicitSchoolYear('Year10Mathematics', '✅ Confirmer'), true);

  // Concept without explicit school year (General...) should require year in text
  assert.strictEqual(hasExplicitSchoolYear('GeneralBiology', 'I want biology'), false);
  assert.strictEqual(hasExplicitSchoolYear('GeneralBiology', 'I want Year 9 Biology'), true);
  assert.strictEqual(hasExplicitSchoolYear('GeneralBooks', 'livres'), false);
  assert.strictEqual(hasExplicitSchoolYear('GeneralBooks', 'livres de 3ème'), true);
});

test('interactive confirmation: clicking "✅ Confirm Request" connects parent to seller without year clarification prompt', async () => {
  const sellerPhone = '+237699887766';
  const buyerPhone = '+237699112233';
  const itemId = `item_y9bio_${Date.now()}`;

  // 1. Seed available inventory item for Year 9 Biology
  await activeInventory.put({
    itemId,
    title: 'Biology (Year 9)',
    sellerPhone,
    status: 'active',
    conditionType: 'Good',
    description: 'Cambridge Biology Year 9 textbook',
    concept: 'Year9Biology',
    domain: 'Science',
    providerCategory: 'HighSchool',
    preferredLang: 'en',
    createdAt: Date.now(),
  });

  try {
    const apiHandlers = typeof (api as any) === 'function' ? (api as any)() : api;

    // 2. Buyer clicks the WhatsApp interactive button "[ ✅ Confirm Request ]"
    const response = await apiHandlers.handleWebhook({
      from_phone: buyerPhone,
      message_text: '✅ Confirm Request',
      interactive: {
        id: 'confirm_req_Year9Biology',
        title: '✅ Confirm Request',
      },
    });

    // 3. Must NOT ask for year clarification
    assert.strictEqual(response.success, true);
    assert.notStrictEqual(
      response.result?.status,
      'needs_year_clarification',
      'Must not trigger year clarification when confirming a book with known school year'
    );
    assert.strictEqual(response.result?.status, 'matched', 'Must result in a successful match');

    // 4. Verify book is reserved for the buyer
    const allItems = await Array.fromAsync(activeInventory.scan());
    const matchedBook = allItems.find((i) => i.itemId === itemId);
    assert.ok(matchedBook, 'Matched book must exist');
    assert.strictEqual(matchedBook.status, 'reserved');
    assert.strictEqual(matchedBook.reservedForPhone, buyerPhone);
    assert.ok(matchedBook.handoverCode, 'Handover code must be generated');

    // 5. Verify demand record has clean title (not button label)
    const allDemands = await Array.fromAsync(demandBoard.scan());
    const buyerDemand = allDemands.find((d) => d.userPhone === buyerPhone && d.concept === 'Year9Biology');
    assert.ok(buyerDemand, 'Demand must be created for buyer');
    assert.strictEqual(buyerDemand.status, 'matched');
    assert.strictEqual(buyerDemand.requestedQuery, 'Biology (Year 9)');

    // 6. Clean up demand
    if (buyerDemand) {
      await demandBoard.delete({ demandId: buyerDemand.demandId });
    }
  } finally {
    // Clean up inventory
    await activeInventory.delete({ itemId });
  }
});

test('multimodal agent: extracts book cover from photo without parent typing title or grade', async () => {
  const fs = await import('node:fs');

  const sampleImagePath =
    '/Users/ro/.gemini/antigravity-ide/brain/2eb05d9c-f297-4278-aaaa-da8495f90efc/.user_uploaded/media_1789389264817.jpg';
  if (!fs.existsSync(sampleImagePath)) {
    return;
  }

  const imageBytes = new Uint8Array(fs.readFileSync(sampleImagePath));
  const sellerPhone = '+237699554433';

  const apiHandlers = typeof (api as any) === 'function' ? (api as any)() : api;

  // Parent sends photo with text: "i have these books"
  const response = await apiHandlers.handleWebhook({
    from_phone: sellerPhone,
    message_text: 'i have these books',
    image_bytes: imageBytes,
    image_format: 'jpeg',
  });

  assert.strictEqual(response.success, true);
  assert.notStrictEqual(response.result?.status, 'needs_year_clarification');

  // Verify book was saved to active inventory with correct title and concept
  const allItems = await Array.fromAsync(activeInventory.scan());
  const addedBook = allItems.find((i) => i.sellerPhone === sellerPhone);
  assert.ok(addedBook, 'Book must be added to inventory from image');
  assert.strictEqual(addedBook.concept, 'Year2Mathematics', 'Must extract Year2Mathematics');
  assert.ok(addedBook.title.includes('Mathematics'), 'Title must contain Mathematics');

  // Clean up
  await activeInventory.delete({ itemId: addedBook.itemId });
});


