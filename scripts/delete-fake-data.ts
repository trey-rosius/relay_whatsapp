import { DynamoDBClient, ScanCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({ region: 'us-east-1' });
const INVENTORY_TABLE = 'books-block-app-4f687b-prod-wm-active-inventory';

async function run() {
  const scan = await ddb.send(new ScanCommand({ TableName: INVENTORY_TABLE }));
  const items = scan.Items || [];
  
  let deletedCount = 0;
  for (const item of items) {
    if (item['sellerPhone']?.S === '+15556733768') {
      await ddb.send(new DeleteItemCommand({
        TableName: INVENTORY_TABLE,
        Key: { itemId: item['itemId'] }
      }));
      deletedCount++;
    }
  }
  console.log(`Deleted ${deletedCount} fake items.`);
}

run().catch(console.error);
