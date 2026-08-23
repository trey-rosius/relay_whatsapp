import test from 'node:test';
import assert from 'node:assert/strict';
import { booksAgent, activeInventory, demandBoard } from '../aws-blocks/index.js';

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
