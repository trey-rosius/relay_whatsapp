import { api } from 'aws-blocks';

async function main() {
  console.log('🌱 Seeding 22 demo match records into database...');
  try {
    const result = await api.seedDemoMatches();
    console.log(`✅ Successfully seeded ${result.count} demo matches in active 48-hour hold state!`);
    console.log('Open the Web App dashboard to inspect the matches tab: https://d3cdc2mtpqk5ut.cloudfront.net');
  } catch (err: any) {
    console.error('❌ Failed to seed demo matches:', err.message || err);
    process.exit(1);
  }
}

main();
