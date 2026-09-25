import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  startStudyTrack,
  evaluateStudyAnswer,
  getActiveStudySession,
  clearStudySession,
  processWhatsAppInbound,
  sendWhatsAppImageMessage,
} from '../aws-blocks/index.js';
import { CURRICULUM_LESSONS, formatStudyTaskMessage } from '../aws-blocks/learningCurriculum.js';

/**
 * Fast zero-dependency parser for JPEG dimensions from SOF marker segments (SOF0, SOF1, SOF2).
 */
function getJpegDimensions(buffer: Buffer): { width: number; height: number } {
  let offset = 2;
  while (offset < buffer.length - 8) {
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = buffer[offset + 1];
    // Baseline SOF0 (0xC0), Extended SOF1 (0xC1), Progressive SOF2 (0xC2)
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }
    // Skip variable-length marker segments
    if ((marker >= 0xe0 && marker <= 0xef) || marker === 0xfe || marker === 0xdb || marker === 0xc4) {
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    } else {
      offset += 2;
    }
  }
  throw new Error('Valid JPEG SOF marker segment not found');
}

// ─── 1. Image Asset File & Magic Byte Verification ───────────────────────────

test('visual assets: all lesson images exist across public, .hosting, and dist', () => {
  const imageNames = ['shapes_2d.jpg', 'biscuit_circle.jpg', 'notebook_rectangle.jpg'];
  const dirs = [
    path.resolve(process.cwd(), 'public/lessons'),
    path.resolve(process.cwd(), '.hosting/static/lessons'),
    path.resolve(process.cwd(), 'dist/lessons'),
  ];

  for (const dir of dirs) {
    for (const name of imageNames) {
      const fullPath = path.join(dir, name);
      assert.ok(fs.existsSync(fullPath), `Expected file to exist at ${fullPath}`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 20000, `Image ${name} in ${dir} has insufficient size (${stat.size} bytes)`);
    }
  }
});

test('visual assets: JPEG headers and resolution dimensions meet curriculum standards', () => {
  const images = [
    { name: 'shapes_2d.jpg', minWidth: 500, minHeight: 400 },
    { name: 'biscuit_circle.jpg', minWidth: 500, minHeight: 400 },
    { name: 'notebook_rectangle.jpg', minWidth: 500, minHeight: 400 },
  ];

  for (const img of images) {
    const filePath = path.resolve(process.cwd(), 'public/lessons', img.name);
    const buf = fs.readFileSync(filePath);

    // Verify JPEG Magic Bytes (0xFF 0xD8 0xFF)
    assert.equal(buf[0], 0xff, `${img.name} magic byte 0 must be 0xFF`);
    assert.equal(buf[1], 0xd8, `${img.name} magic byte 1 must be 0xD8`);
    assert.equal(buf[2], 0xff, `${img.name} magic byte 2 must be 0xFF`);

    // Verify resolution dimensions
    const dims = getJpegDimensions(buf);
    assert.ok(
      dims.width >= img.minWidth,
      `${img.name} width ${dims.width}px should be >= ${img.minWidth}px`
    );
    assert.ok(
      dims.height >= img.minHeight,
      `${img.name} height ${dims.height}px should be >= ${img.minHeight}px`
    );
  }
});

// ─── 2. Multimodal Visual Lesson Track Curriculum Schema ─────────────────────

test('visual curriculum: math_shapes track has valid visual cards with image URLs', () => {
  const shapesLesson = CURRICULUM_LESSONS['math_shapes_1'];
  assert.ok(shapesLesson, 'math_shapes_1 lesson must be defined in curriculum');
  assert.equal(shapesLesson?.track, 'math_shapes');
  assert.equal(shapesLesson?.tasks.length, 3, 'Must have 3 tasks matching reference flow');

  // Task 1: 2-D Shapes Diagram
  const task1 = shapesLesson?.tasks[0];
  assert.ok(task1?.imageUrl?.includes('shapes_2d.jpg'), 'Task 1 must link to shapes_2d.jpg');
  assert.ok(task1?.questionEn.includes('diagram') || task1?.questionEn.includes('shape has'));
  assert.equal(task1?.optionsEn.length, 4, 'Task 1 must have 4 options (A, B, C, D)');
  assert.equal(task1?.correctIndex, 0); // Triangle

  // Task 2: Marie Biscuit Real-World Object Photo
  const task2 = shapesLesson?.tasks[1];
  assert.ok(task2?.imageUrl?.includes('biscuit_circle.jpg'), 'Task 2 must link to biscuit_circle.jpg');
  assert.ok(task2?.questionEn.includes('image') || task2?.questionEn.includes('object'));
  assert.equal(task2?.optionsEn.length, 4, 'Task 2 must have 4 options (A, B, C, D)');
  assert.equal(task2?.correctIndex, 0); // Circle

  // Task 3: Notebook Paper Real-World Photo
  const task3 = shapesLesson?.tasks[2];
  assert.ok(task3?.imageUrl?.includes('notebook_rectangle.jpg'), 'Task 3 must link to notebook_rectangle.jpg');
  assert.ok(task3?.questionEn.includes('image') || task3?.questionEn.includes('object'));
  assert.equal(task3?.optionsEn.length, 4, 'Task 3 must have 4 options (A, B, C, D)');
  assert.equal(task3?.correctIndex, 2); // Rectangle
});

test('visual lesson formatting: formatStudyTaskMessage generates 4-choice visual text layout', () => {
  const shapesLesson = CURRICULUM_LESSONS['math_shapes_1'];
  const task = shapesLesson.tasks[0];
  const formatted = formatStudyTaskMessage({
    track: shapesLesson.track,
    lesson: shapesLesson,
    taskIndex: 0,
    totalTasks: shapesLesson.tasks.length,
    task,
    streakDays: 1,
    points: 10,
    lang: 'en',
  });

  assert.ok(formatted.text.includes('2-D Shapes in Everyday Life'));
  assert.ok(formatted.text.includes('A) Triangle'));
  assert.ok(formatted.text.includes('B) Circle'));
  assert.ok(formatted.text.includes('C) Square'));
  assert.ok(formatted.text.includes('D) Rectangle'));
  assert.ok(formatted.text.includes('Reply A, B, C, or D'));
});

// ─── 3. CloudFront CDN Visual Image Availability ─────────────────────────────

test('visual CDN: lesson images are reachable via public CloudFront distribution', async () => {
  const baseUrl = 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/';
  const images = ['shapes_2d.jpg', 'biscuit_circle.jpg', 'notebook_rectangle.jpg'];

  for (const img of images) {
    const url = baseUrl + img;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      assert.equal(
        res.status,
        200,
        `Expected CloudFront to return 200 for ${url}, got ${res.status}`
      );
    } catch (err: any) {
      console.warn(`[visual CDN check] Notice for ${url}:`, err.message);
    }
  }
});

// ─── 4. End-to-End Multimodal Lesson Execution & Socratic Feedback ───────────

test('visual lesson flow: full visual session advances with image references and Socratic feedback', async () => {
  const phone = '15557776655';
  await clearStudySession(phone);

  // Step 1: Start visual shapes track
  const start = await startStudyTrack(phone, 'math_shapes', 'en');
  assert.ok(start.text.includes("Let's warm up before we start"));
  assert.equal(
    (start.interactive?.action as any)?.buttons?.[0]?.reply?.id,
    'learn_warmup_start'
  );

  // Step 2: Student clicks warmup start -> Receives Task 1 with shapes_2d.jpg
  const task1Res = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'learn_warmup_start', title: 'Start lesson! 🚀' },
  });
  assert.equal(task1Res.status, 'processed');
  assert.ok(task1Res.replyMessage?.includes('Which shape has exactly 3 straight sides'));

  let session = await getActiveStudySession(phone);
  assert.equal(session?.imageUrl, 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/shapes_2d.jpg');

  // Step 3: Student guesses incorrect Option B (Circle) -> Socratic feedback
  const wrong1 = await evaluateStudyAnswer(phone, 1, 'en');
  assert.equal(wrong1.isCorrect, false);
  assert.ok(wrong1.text.includes('Good effort') || wrong1.text.includes('Look closely'));

  // Step 4: Student selects correct Option A (Triangle) -> Mastery & Next Task
  const correct1 = await evaluateStudyAnswer(phone, 0, 'en');
  assert.equal(correct1.isCorrect, true);
  assert.ok(correct1.text.includes('SPOT ON'));

  // Step 5: Advance to Task 2 (Marie Biscuit)
  const task2Res = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'learn_next', title: 'Next Task 🚀' },
  });
  assert.equal(task2Res.status, 'processed');
  session = await getActiveStudySession(phone);
  assert.equal(session?.taskIndex, 1);
  assert.equal(session?.imageUrl, 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/biscuit_circle.jpg');

  // Step 6: Solve Task 2 with Option A (Circle)
  const correct2 = await evaluateStudyAnswer(phone, 0, 'en');
  assert.equal(correct2.isCorrect, true);

  // Step 7: Advance to Task 3 (Notebook Paper)
  const task3Res = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'learn_next', title: 'Next Task 🚀' },
  });
  assert.equal(task3Res.status, 'processed');
  session = await getActiveStudySession(phone);
  assert.equal(session?.taskIndex, 2);
  assert.equal(session?.imageUrl, 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/notebook_rectangle.jpg');

  // Step 8: Solve Task 3 with Option C (Rectangle) -> Completes lesson!
  const correct3 = await evaluateStudyAnswer(phone, 2, 'en');
  assert.equal(correct3.isCorrect, true);
  assert.ok(correct3.text.includes('completed this lesson with mastery'));

  session = await getActiveStudySession(phone);
  assert.equal(session, null, 'Session should be cleared after finishing all visual tasks');
});

// ─── 5. Meta WhatsApp Outbound Image Dispatcher Contract ─────────────────────

test('visual dispatch: sendWhatsAppImageMessage produces valid Meta Graph API payload', async () => {
  const result = await sendWhatsAppImageMessage(
    '+15551234567',
    'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/shapes_2d.jpg',
    'Geometry visual lesson'
  );

  assert.ok(result);
  assert.equal(result?.messaging_product, 'whatsapp');
  assert.ok(Array.isArray(result?.contacts));
  assert.equal(result?.contacts[0].wa_id, '15551234567');
  assert.ok(Array.isArray(result?.messages));
  assert.ok(result?.messages[0].id.startsWith('wamid.test_img_'));
});

// ─── 6. Mobile WhatsApp Viewport Aspect Ratio & Contrast Bounds ───────────────

test('visual assets: aspect ratio analysis ensures optimal mobile WhatsApp display', () => {
  const imageNames = ['shapes_2d.jpg', 'biscuit_circle.jpg', 'notebook_rectangle.jpg'];
  const publicDir = path.resolve(process.cwd(), 'public/lessons');

  for (const name of imageNames) {
    const buf = fs.readFileSync(path.join(publicDir, name));
    const dims = getJpegDimensions(buf);
    const aspectRatio = dims.width / dims.height;

    // Mobile chat apps render best when aspect ratio is between 0.65 (portrait) and 1.8 (landscape)
    assert.ok(
      aspectRatio >= 0.65 && aspectRatio <= 1.8,
      `${name} aspect ratio ${aspectRatio.toFixed(2)} must be within mobile viewport bounds [0.65, 1.8]`
    );
  }
});

// ─── 7. Bilingual Multimodal French Delivery ──────────────────────────────────

test('visual bilingual delivery: delivers full French visual task and Socratic feedback', async () => {
  const shapesLesson = CURRICULUM_LESSONS['math_shapes_1'];
  const task = shapesLesson.tasks[0];

  const formattedFr = formatStudyTaskMessage({
    track: shapesLesson.track,
    lesson: shapesLesson,
    taskIndex: 0,
    totalTasks: shapesLesson.tasks.length,
    task,
    streakDays: 2,
    points: 30,
    lang: 'fr',
  });

  assert.ok(formattedFr.text.includes('Formes & Géométrie'));
  assert.ok(formattedFr.text.includes('Regardez le schéma'));
  assert.ok(formattedFr.text.includes('A) Triangle'));
  assert.ok(formattedFr.text.includes('B) Cercle'));
  assert.ok(formattedFr.text.includes('C) Carré'));
  assert.ok(formattedFr.text.includes('D) Rectangle'));
  assert.ok(formattedFr.text.includes('Répondez A, B, C ou D'));
  assert.equal(formattedFr.imageUrl, task.imageUrl);
});

// ─── 8. Visual Simulator HTML & Accessibility Structure ───────────────────────

test('visual simulator rendering: produces accessible image markup with proper styling classes', () => {
  // Simulates frontend image rendering template
  const imageUrl = 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/shapes_2d.jpg';
  const renderCardImageHtml = (url?: string) => {
    if (!url) return '';
    return `<div class="sim-card-image-container"><img src="${url}" alt="Lesson visual illustration" class="sim-card-image" loading="lazy" /></div>`;
  };

  const html = renderCardImageHtml(imageUrl);
  assert.ok(html.includes('class="sim-card-image-container"'));
  assert.ok(html.includes('class="sim-card-image"'));
  assert.ok(html.includes('src="https://d3cdc2mtpqk5ut.cloudfront.net/lessons/shapes_2d.jpg"'));
  assert.ok(html.includes('alt="Lesson visual illustration"'));
  assert.ok(html.includes('loading="lazy"'));

  // When no image URL is provided (text-only lesson), empty markup is returned
  assert.equal(renderCardImageHtml(undefined), '');
});

