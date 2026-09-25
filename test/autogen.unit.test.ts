import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  processWhatsAppInbound,
  curriculumTable,
} from '../aws-blocks/index.js';
import { CURRICULUM_LESSONS } from '../aws-blocks/learningCurriculum.js';
import {
  autogenerateCurriculumForSubject,
  getSubjectDisplayName,
  normalizeSubjectName,
  getLatestAutogenJob,
  listAutogenJobs,
} from '../aws-blocks/curriculumGenerator.js';
import {
  synthesizeShapesDiagram,
  synthesizeFractionsDiagram,
  synthesizeBinaryDotCards,
  synthesizeSlopeGraph,
  saveLessonImage,
} from '../aws-blocks/imageGenerator.js';

// ─── 1. Subject Normalization & Bilingual Display Names ───────────────────────

test('autogen: normalizeSubjectName accurately maps user input keywords and aliases', () => {
  assert.equal(normalizeSubjectName('shapes'), 'math_shapes');
  assert.equal(normalizeSubjectName('2d geometry'), 'math_shapes');
  assert.equal(normalizeSubjectName('math'), 'math_foundations');
  assert.equal(normalizeSubjectName('fractions'), 'math_foundations');
  assert.equal(normalizeSubjectName('cs'), 'cs_unplugged');
  assert.equal(normalizeSubjectName('binary'), 'cs_unplugged');
  assert.equal(normalizeSubjectName('digital'), 'digital_literacy');
  assert.equal(normalizeSubjectName('safety'), 'digital_literacy');
  assert.equal(normalizeSubjectName('stem'), 'stem_openstax');
  assert.equal(normalizeSubjectName('calculus'), 'stem_openstax');
  assert.equal(normalizeSubjectName('all'), 'all');
  assert.equal(normalizeSubjectName('everything'), 'all');
});

test('autogen: getSubjectDisplayName returns formatted English and French titles', () => {
  const nameEn = getSubjectDisplayName('math_shapes', 'en');
  assert.ok(nameEn.includes('Shapes'));
  assert.ok(nameEn.includes('Geometry'));

  const nameFr = getSubjectDisplayName('math_shapes', 'fr');
  assert.ok(nameFr.includes('Formes'));
  assert.ok(nameFr.includes('Géométrie'));

  const allEn = getSubjectDisplayName('all', 'en');
  assert.ok(allEn.includes('All Subjects'));
});

// ─── 2. Educational Visual Diagram Synthesizers ───────────────────────────────

test('image synthesis: creates valid JPEG buffers and SVG markup for all subjects', () => {
  const synthesizers = [
    { name: 'shapes', fn: synthesizeShapesDiagram },
    { name: 'fractions', fn: synthesizeFractionsDiagram },
    { name: 'binary', fn: synthesizeBinaryDotCards },
    { name: 'slope', fn: synthesizeSlopeGraph },
  ];

  for (const { name, fn } of synthesizers) {
    const res = fn();
    assert.ok(res.jpeg.length > 5000, `${name} JPEG buffer must be > 5KB`);
    // Verify standard JPEG magic bytes: 0xFF, 0xD8, 0xFF
    assert.equal(res.jpeg[0], 0xff, `${name} magic byte 0 must be 0xFF`);
    assert.equal(res.jpeg[1], 0xd8, `${name} magic byte 1 must be 0xD8`);
    assert.equal(res.jpeg[2], 0xff, `${name} magic byte 2 must be 0xFF`);

    // Verify SVG markup
    assert.ok(res.svg.startsWith('<svg'), `${name} SVG must start with <svg`);
    assert.ok(res.svg.includes('</svg>'), `${name} SVG must close with </svg>`);
  }
});

test('image synthesis: saveLessonImage writes files into public and static hosting dirs', () => {
  const testDiagram = synthesizeShapesDiagram();
  const filename = 'autogen_test_spec.jpg';
  const saveResult = saveLessonImage(filename, testDiagram.jpeg, testDiagram.svg);

  assert.equal(saveResult.relativePath, `/lessons/${filename}`);

  const publicPath = path.resolve(process.cwd(), 'public/lessons', filename);
  assert.ok(fs.existsSync(publicPath), 'Public file should exist');

  const stat = fs.statSync(publicPath);
  assert.ok(stat.size > 5000);

  // Clean up test file
  try {
    fs.unlinkSync(publicPath);
    fs.unlinkSync(publicPath.replace(/\.jpg$/, '.svg'));
  } catch {}
});

// ─── 3. Background Curriculum Generator Engine ────────────────────────────────

test('autogen engine: generates complete lesson with Socratic tasks and visual image for math_shapes', async () => {
  const job = await autogenerateCurriculumForSubject('shapes', {
    runInBackground: false,
    syncDynamoDB: true,
    generateImages: true,
  });

  assert.equal(job.status, 'completed');
  assert.equal(job.normalizedTrack, 'math_shapes');
  assert.ok(job.lessonsGenerated >= 1);
  assert.ok(job.tasksGenerated >= 3);
  assert.ok(job.imagesGenerated >= 1);

  // Verify registered in CURRICULUM_LESSONS
  const liveLesson = CURRICULUM_LESSONS['math_shapes_polygons_autogen'];
  assert.ok(liveLesson, 'Lesson should be registered in CURRICULUM_LESSONS');
  assert.equal(liveLesson.track, 'math_shapes');
  assert.equal(liveLesson.tasks.length, 3);

  // Verify each task has 4 choices A, B, C, D
  for (const task of liveLesson.tasks) {
    assert.equal(task.optionsEn.length, 4, 'Task must have 4 options');
    assert.equal(task.optionsFr.length, 4, 'Task must have 4 French options');
    assert.ok(task.correctIndex >= 0 && task.correctIndex <= 3);
    assert.ok(task.hint1En.length > 0);
    assert.ok(task.workedExampleEn.length > 0);
  }

  // Verify visual diagram image was generated and linked
  const visualTask = liveLesson.tasks[0];
  assert.ok(visualTask.imageUrl?.includes('.jpg'));
  assert.ok(visualTask.imageUrl?.includes('https://d3cdc2mtpqk5ut.cloudfront.net/lessons/'));
});

test('autogen engine: generates all subjects at once when "all" is requested', async () => {
  const job = await autogenerateCurriculumForSubject('all', {
    runInBackground: false,
    syncDynamoDB: true,
    generateImages: true,
  });

  assert.equal(job.status, 'completed');
  assert.equal(job.normalizedTrack, 'all');
  assert.ok(job.lessonsGenerated >= 5, 'Should generate lessons across all 5 tracks');
  assert.ok(job.tasksGenerated >= 10, 'Should generate 10+ Socratic tasks');
  assert.ok(job.imagesGenerated >= 5, 'Should generate 5+ visual diagrams');
});

// ─── 4. In-Chat WhatsApp Commands (#generate & #autogen) ──────────────────────

test('whatsapp in-chat command: "#generate" without arguments returns full command guide', async () => {
  const phone = '+15550007711';
  const res = await processWhatsAppInbound({
    from_phone: phone,
    message_text: '#generate',
  });

  assert.equal(res.status, 'processed');
  const reply = res.replyMessage || '';
  assert.ok(reply.includes('CURRICULUM AUTOGENERATOR'));
  assert.ok(reply.includes('#generate shapes'));
  assert.ok(reply.includes('#generate math'));
  assert.ok(reply.includes('#generate cs'));
  assert.ok(reply.includes('#generate all'));
  assert.ok(reply.includes('#autogen status'));
});

test('whatsapp in-chat command: "#generate cs" launches background generation and confirms immediately', async () => {
  const phone = '+15550007722';
  const res = await processWhatsAppInbound({
    from_phone: phone,
    message_text: '#generate cs',
  });

  assert.equal(res.status, 'processed');
  const reply = res.replyMessage || '';
  assert.ok(reply.includes('BACKGROUND AUTOGENERATOR ACTIVATED'));
  assert.ok(reply.includes('CS Unplugged'));
  assert.ok(reply.includes('Open-Source Educational Repositories'));
  assert.ok(reply.includes('background asynchronously'));
});

test('whatsapp in-chat command: "#autogen status" returns real-time progress scorecard', async () => {
  const phone = '+15550007733';
  const res = await processWhatsAppInbound({
    from_phone: phone,
    message_text: '#autogen status',
  });

  assert.equal(res.status, 'processed');
  const reply = res.replyMessage || '';
  assert.ok(reply.includes('CURRICULUM AUTOGENERATOR STATUS'));
  assert.ok(reply.includes('Job ID:'));
  assert.ok(reply.includes('Lessons Created:'));
  assert.ok(reply.includes('Questions Generated:'));
  assert.ok(reply.includes('Visual Diagrams:'));
  assert.ok(reply.includes('DynamoDB curriculumTable'));
});

test('whatsapp in-chat command: bilingual French "#generer maths" delivers French response', async () => {
  const phone = '+33611224455';
  const res = await processWhatsAppInbound({
    from_phone: phone,
    message_text: '#generer maths',
  });

  assert.equal(res.status, 'processed');
  const reply = res.replyMessage || '';
  assert.ok(reply.includes('AUTOGÉNÉRATEUR DE COURS ACTIVÉ') || reply.includes('Mathématiques Essentielles'));
  assert.ok(reply.includes('arrière-plan'));
});

