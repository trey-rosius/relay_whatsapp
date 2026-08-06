import { DynamoDBClient, ScanCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const ddb = new DynamoDBClient({ region: 'us-east-1' });
const s3 = new S3Client({ region: 'us-east-1' });

const INVENTORY_TABLE = 'books-block-app-4f687b-prod-wm-active-inventory';
const DEMAND_TABLE = 'books-block-app-4f687b-prod-wm-demand-board';
const KB_BUCKET = 'books-block-app-4f687b-prod-wmkbdata87a4f489-hcsjbotgcmci';
const WEBHOOK_URL = 'https://0bur1ooy7b.execute-api.us-east-1.amazonaws.com/prod/webhook';

async function clearTable(tableName: string) {
  console.log(`Clearing ${tableName}...`);
  const scan = await ddb.send(new ScanCommand({ TableName: tableName }));
  const items = scan.Items || [];
  console.log(`Found ${items.length} items to delete.`);
  for (const item of items) {
    const keyObj: any = {};
    if (item['pk']) keyObj['pk'] = item['pk'];
    if (item['sk']) keyObj['sk'] = item['sk'];
    if (item['itemId']) keyObj['itemId'] = item['itemId'];
    if (item['demandId']) keyObj['demandId'] = item['demandId'];

    await ddb.send(new DeleteItemCommand({
      TableName: tableName,
      Key: keyObj
    }));
  }
}

async function clearBucket(bucketName: string) {
  console.log(`Clearing ${bucketName}...`);
  const list = await s3.send(new ListObjectsV2Command({ Bucket: bucketName }));
  const objects = list.Contents || [];
  console.log(`Found ${objects.length} objects to delete.`);
  if (objects.length > 0) {
    await s3.send(new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: objects.map(o => ({ Key: o.Key! }))
      }
    }));
  }
}

async function seedData() {
  const messages = [
    { phone: '+237699380597', text: 'Hello dear I have year 7 books need year 8' },
    { phone: '+23777551919', text: 'Hello dear parents I have Year 9 books' },
    { phone: '+23711111111', text: 'Need year 10 books please' },
    { phone: '+23777378065', text: 'Hi i have year 12 , 10 , 2' },
    { phone: '+33783106095', text: 'I m interested year 12' },
    { phone: '+23777656614', text: 'Hello. I have ; Year 3 Year 4 Year 5 and Year 11/12/13 science textbooks' },
    { phone: '+23772870000', text: "Hello All I've books of year 8 & 10" }
  ];

  for (const msg of messages) {
    console.log(`Sending webhook for ${msg.phone}: "${msg.text}"...`);
    const payload = {
      from_phone: msg.phone,
      message_text: msg.text
    };
    
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log(`Result: ${res.status} ${await res.text()}`);
    // Sleep to allow sequential processing
    await new Promise(r => setTimeout(r, 2000));
  }
}

async function run() {
  try {
    await clearTable(INVENTORY_TABLE);
    await clearTable(DEMAND_TABLE);
    await clearBucket(KB_BUCKET);
    await seedData();
    console.log('Done!');
  } catch (err) {
    console.error(err);
  }
}

run();
