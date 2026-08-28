import { api } from 'aws-blocks';

async function main() {
  console.log('🧹 Clearing demo match records from database...');
  try {
    const result = await api.clearDemoMatches();
    console.log(`✅ Successfully cleared ${result.count} demo matches from database!`);
  } catch (err: any) {
    console.error('❌ Failed to clear demo matches:', err.message || err);
    process.exit(1);
  }
}

main();
