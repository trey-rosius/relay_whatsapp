#!/usr/bin/env tsx
/**
 * CLI command to autogenerate curriculum lessons, Socratic questions,
 * bilingual explanations, 4 choices, and visual diagrams in the background.
 *
 * Usage:
 *   npm run autogen
 *   npm run autogen math
 *   npm run autogen shapes
 *   npm run autogen cs
 *   npm run autogen digital
 *   npm run autogen stem
 *   npm run autogen all
 *   npm run autogen -- --subject cs_unplugged
 */
import {
  autogenerateCurriculumForSubject,
  getSubjectDisplayName,
  normalizeSubjectName,
} from '../curriculumGenerator.js';

async function main() {
  const args = process.argv.slice(2);
  let subjectArg = 'all';

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--subject' || a === '-s') {
      subjectArg = args[i + 1] || 'all';
      i++;
    } else if (!a.startsWith('-')) {
      subjectArg = a;
    }
  }

  const track = normalizeSubjectName(subjectArg);
  const displayName = getSubjectDisplayName(track, 'en');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚡ RELAY LEARN • CURRICULUM & IMAGE AUTOGENERATOR ⚡');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎯 Target Subject : ${displayName}`);
  console.log(`📂 Knowledge Base : S3 Vectors & Open-Source Markdown Sources`);
  console.log(`🎨 Visual Assets   : Public/Hosting Static Directories`);
  console.log(`💾 Target DB      : DynamoDB curriculumTable`);
  console.log('-----------------------------------------------------');
  console.log('⏳ Generating lessons, questions, and visual assets in the background...');

  const startTime = Date.now();
  const job = await autogenerateCurriculumForSubject(subjectArg, {
    runInBackground: false,
    syncDynamoDB: true,
    generateImages: true,
  });

  const durationMs = Date.now() - startTime;

  if (job.status === 'completed') {
    console.log('-----------------------------------------------------');
    console.log('✅ AUTOGENERATION COMPLETED SUCCESSFULLY!');
    console.log(`⏱️ Duration           : ${durationMs}ms`);
    console.log(`📚 Lessons Created    : ${job.lessonsGenerated}`);
    console.log(`❓ Questions Generated : ${job.tasksGenerated}`);
    console.log(`🖼️ Visual Images Made : ${job.imagesGenerated}`);
    console.log('-----------------------------------------------------');
    console.log('📝 Generation Log:');
    for (const detail of job.details) {
      console.log(`  • ${detail}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } else {
    console.error('❌ AUTOGENERATION FAILED:', job.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal autogen error:', err);
  process.exit(1);
});
