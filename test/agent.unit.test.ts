import test from 'node:test';
import assert from 'node:assert/strict';
import {
  booksAgent,
  activeInventory,
  demandBoard,
  buildInteractiveOtherGradesPayload,
  buildInteractiveYearSubjectsPayload,
  buildParentActivitySummary,
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
  const found = allItems.find(i => i.itemId === testItemId);
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
  const found = allDemands.find(d => d.demandId === testDemandId);
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

  const rowIds = payload.action.sections[0].rows.map(r => r.id);
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
  const generalSubjects = generalPayload.action.sections[0].rows.map(r => r.title);
  assert.strictEqual(generalSubjects.length, 2);
  assert.ok(generalSubjects.includes('Computing'));
  assert.ok(generalSubjects.includes('Social Studies'));

  // 2. Querying 'other' returns all 5 books in overflow grades with grade tags
  const otherPayload = buildInteractiveYearSubjectsPayload('other', mockInventory, 'en');
  assert.strictEqual(otherPayload.action.sections[0].rows.length, 5);
  const otherTitles = otherPayload.action.sections[0].rows.map(r => r.title);
  assert.ok(otherTitles.some(t => t.includes('Chemistry (Year 11)')));
  assert.ok(otherTitles.some(t => t.includes('Physics (Year 12)')));
  assert.ok(otherTitles.some(t => t.includes('Biology (Year 13)')));
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
    assert.ok(summaryEn.includes('Books on Sale (1)'), `Should list 1 book on sale, got: ${summaryEn}`);
    assert.ok(summaryEn.includes('Year 5 Mathematics'));
    assert.ok(summaryEn.includes('Exchanges in Progress (1)'), 'Should list 1 exchange in progress');
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
    assert.ok(emptySummary.includes('You do not have any books listed, sold, bought, or requested yet'));
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

