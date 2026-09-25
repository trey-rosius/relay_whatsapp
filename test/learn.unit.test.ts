import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  startStudyTrack,
  evaluateStudyAnswer,
  getActiveStudySession,
  clearStudySession,
  getOrCreateStudentProfile,
  resetStudentProfileForTesting,
  getLearningDashboardStats,
  processWhatsAppInbound,
  sendWhatsAppImageMessage,
} from '../aws-blocks/index.js';
import {
  buildProgressBar,
  formatGrowthMindsetMessage,
  formatStudyHintMessage,
  formatProgressReport,
  formatStopSessionMessage,
  formatWarmupMessage,
  formatStudyTaskMessage,
  CURRICULUM_LESSONS,
} from '../aws-blocks/learningCurriculum.js';

test('progress bar: accurately renders ASCII emoji progress', () => {
  const bar1 = buildProgressBar(1, 5);
  assert.ok(bar1.includes('🟩'));
  assert.ok(bar1.includes('⬜'));
  assert.ok(bar1.includes('20%'));

  const bar5 = buildProgressBar(5, 5);
  assert.ok(bar5.includes('100%'));
  assert.ok(!bar5.includes('⬜'));
});

test('growth mindset: generates encouraging metacognitive message for math anxiety', () => {
  const msgEn = formatGrowthMindsetMessage('en');
  assert.ok(msgEn.includes('muscle'));
  assert.ok(msgEn.includes('capable'));

  const msgFr = formatGrowthMindsetMessage('fr');
  assert.ok(msgFr.includes('muscle'));
  assert.ok(msgFr.includes('capable'));
});

test('relay learn tutor: starts CS Unplugged binary lesson with 3 options and progress bar', async () => {
  const phone = '15550001122';
  await clearStudySession(phone);

  const res = await startStudyTrack(phone, 'cs_unplugged', 'en');
  assert.ok(res.text.includes('CS Unplugged'));
  assert.ok(res.text.includes('Binary'));
  assert.ok(res.text.includes('A) 4 + 2'));
  assert.ok(res.interactive);
  assert.equal((res.interactive?.action as any)?.buttons?.length, 3);

  const session = await getActiveStudySession(phone);
  assert.ok(session);
  assert.equal(session?.track, 'cs_unplugged');
  assert.equal(session?.taskIndex, 0);
  assert.equal(session?.correctIndex, 0); // Option A is 4 + 2
});

test('socratic loop: incorrect answer provides gentle hint and does not advance task', async () => {
  const phone = '15550001122';
  // Submit incorrect option B (index 1)
  const evalRes = await evaluateStudyAnswer(phone, 1, 'en');
  assert.equal(evalRes.isCorrect, false);
  assert.ok(evalRes.text.includes('Good effort') || evalRes.text.includes('Look closely'));

  const session = await getActiveStudySession(phone);
  assert.equal(session?.taskIndex, 0); // Task index still 0
  assert.equal(session?.attemptCount, 1);
});

test('socratic loop: second incorrect answer escalates to guided breakdown', async () => {
  const phone = '15550001122';
  const evalRes = await evaluateStudyAnswer(phone, 2, 'en'); // Option C
  assert.equal(evalRes.isCorrect, false);
  assert.ok(evalRes.text.includes('Almost there') || evalRes.text.includes('Try adding 4 and 2'));

  const session = await getActiveStudySession(phone);
  assert.equal(session?.taskIndex, 0);
  assert.equal(session?.attemptCount, 2);
});

test('socratic loop: correct answer awards points, increments streak, and advances task', async () => {
  const phone = '15550001122';
  const evalRes = await evaluateStudyAnswer(phone, 0, 'en'); // Option A (Correct!)
  assert.equal(evalRes.isCorrect, true);
  assert.ok(evalRes.text.includes('SPOT ON') || evalRes.text.includes('correct'));
  assert.ok(evalRes.text.includes('Points'));
  assert.equal(evalRes.interactiveButton?.id, 'learn_next');

  const profile = await getOrCreateStudentProfile(phone);
  assert.ok(profile.points >= 10);

  const session = await getActiveStudySession(phone);
  assert.equal(session?.taskIndex, 1); // Advanced to Task 2!
});

test('dashboard stats: aggregates metrics across students for Zero to Shipped hackathon', async () => {
  const stats = await getLearningDashboardStats();
  assert.ok(stats.totalStudents >= 1);
  assert.ok(stats.totalQuestions >= 1);
  assert.ok(stats.activeTracks.length >= 3);
  assert.ok(stats.accuracyRate > 0);
});

test('processWhatsAppInbound: user typing "#learn" receives track menu', async () => {
  const result = await processWhatsAppInbound({
    from_phone: '15550003344',
    message_text: '#learn',
  });
  assert.equal(result.status, 'processed');
  const msg = result.replyMessage || '';
  assert.ok(msg.includes('Relay Learn') || msg.includes('explore') || msg.includes('Bienvenue'));
});

test('processWhatsAppInbound: user typing "I am dumb" receives growth mindset message', async () => {
  const result = await processWhatsAppInbound({
    from_phone: '15550003344',
    message_text: "I am dumb at this, I can't do this",
  });
  assert.equal(result.status, 'processed');
  const msg = result.replyMessage || '';
  assert.ok(msg.includes('muscle') || msg.includes('capable'));
});

test('processWhatsAppInbound: user typing "#books" returns cleanly to book barter', async () => {
  const result = await processWhatsAppInbound({
    from_phone: '15550003344',
    message_text: '#books',
  });
  assert.equal(result.status, 'processed');
  const msg = result.replyMessage || '';
  assert.ok(msg.includes('BOOK BARTER') || msg.includes('Community Book Exchange'));
});

test('curriculum database & S3 vector sources: verifies authentic open source repository attribution', async () => {
  const { ensureCurriculumSeededInDynamoDB, searchCurriculumS3Vectors } = await import('../aws-blocks/index.js');
  const seeded = await ensureCurriculumSeededInDynamoDB();
  assert.ok(seeded.length >= 4);

  // Verify open-source repos are accredited
  const csLesson = seeded.find((s) => s.trackId === 'cs_unplugged');
  assert.ok(csLesson?.sourceRepo.includes('uccser/cs-unplugged'));
  assert.equal(csLesson?.license, 'CC BY-SA 4.0');

  const mathLesson = seeded.find((s) => s.trackId === 'math_foundations');
  assert.ok(mathLesson?.sourceRepo.includes('ossu/precollege-math') || mathLesson?.sourceRepo.includes('literacy-for-kids'));

  // Test S3 vector retrieval method
  const vectorSearch = await searchCurriculumS3Vectors('binary numbers');
  assert.ok(vectorSearch.length > 0);
  assert.ok(vectorSearch[0].content.length > 0);
});

// ─── 1. Complete Multi-step Onboarding Flow Tests ─────────────────────────────

test('onboarding flow: new student progresses through role, age, phone ownership, goal, and consent', async () => {
  const phone = '15559998877';
  await resetStudentProfileForTesting(phone);
  await clearStudySession(phone);
  const clean = phone.replace(/\D/g, '');

  // Step 1: Initial "learn" triggers welcome showcase
  const step1 = await processWhatsAppInbound({
    from_phone: phone,
    message_text: 'learn',
  });
  assert.equal(step1.status, 'processed');
  assert.ok(step1.replyMessage?.includes('Welcome to Relay Learn'));
  assert.ok(step1.replyMessage?.includes('Curriculum Menu'));

  // Step 2: User taps "Let's go! 🚀" (onboard_start)
  const step2 = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'onboard_start', title: "Let's go! 🚀" },
  });
  assert.equal(step2.status, 'processed');
  assert.ok(step2.replyMessage?.includes('which role describes you best'));
  const profile2 = await getOrCreateStudentProfile(clean);
  assert.equal(profile2.onboardingStage, 'role');

  // Step 3: User selects "Student" role (onboard_role_student)
  const step3 = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'onboard_role_student', title: 'Student' },
  });
  assert.equal(step3.status, 'processed');
  assert.ok(step3.replyMessage?.includes('Are you over 18'));
  const profile3 = await getOrCreateStudentProfile(clean);
  assert.equal(profile3.role, 'student');
  assert.equal(profile3.onboardingStage, 'age');

  // Step 4: User selects under 18 (onboard_age_no)
  const step4 = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'onboard_age_no', title: 'No' },
  });
  assert.equal(step4.status, 'processed');
  assert.ok(step4.replyMessage?.includes('whose phone are you currently using'));
  const profile4 = await getOrCreateStudentProfile(clean);
  assert.equal(profile4.isOver18, false);
  assert.equal(profile4.onboardingStage, 'phone');

  // Step 5: User indicates shared phone ownership (onboard_phone_parent)
  const step5 = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'onboard_phone_parent', title: "Parent's phone" },
  });
  assert.equal(step5.status, 'processed');
  assert.ok(step5.replyMessage?.includes('why do you want to use Relay Learn'));
  const profile5 = await getOrCreateStudentProfile(clean);
  assert.equal(profile5.phoneOwner, 'parent_phone');
  assert.equal(profile5.onboardingStage, 'goal');

  // Step 6: User selects learning goal (onboard_goal_marks)
  const step6 = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'onboard_goal_marks', title: 'Improve marks 💯' },
  });
  assert.equal(step6.status, 'processed');
  assert.ok(step6.replyMessage?.includes('Terms of Use & Privacy Policy'));
  const profile6 = await getOrCreateStudentProfile(clean);
  assert.equal(profile6.learningGoal, 'improve_marks');
  assert.equal(profile6.onboardingStage, 'consent');

  // Step 7: User accepts consent (onboard_consent_yes) -> transitions to diagnostic quiz
  const step7 = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'onboard_consent_yes', title: 'Yes ✅' },
  });
  assert.equal(step7.status, 'processed');
  assert.ok(step7.replyMessage?.includes('3268 + 5707 = _____'));
  const profile7 = await getOrCreateStudentProfile(clean);
  assert.equal(profile7.onboardingStage, 'diagnostic');
});

test('onboarding consent: user saying No receives polite book exchange fallback', async () => {
  const phone = '15559998866';
  const result = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'onboard_consent_no', title: 'No ❌' },
  });
  assert.equal(result.status, 'processed');
  assert.ok(result.replyMessage?.includes('Community Book Exchange'));
  assert.ok(result.replyMessage?.includes('books'));
});

// ─── 2. Diagnostic Level Finder Arithmetic Quiz & Non-Numeric Recovery ────────

test('diagnostic quiz: non-numeric text triggers friendly input recovery guidance', async () => {
  const phone = '15559998877';
  const clean = phone.replace(/\D/g, '');
  const profile = await getOrCreateStudentProfile(clean);
  profile.onboardingStage = 'diagnostic';

  const result = await processWhatsAppInbound({
    from_phone: phone,
    message_text: "I don't know the answer",
  });
  assert.equal(result.status, 'processed');
  assert.ok(result.replyMessage?.includes('Please type your answer with a number'));
  assert.ok(result.replyMessage?.includes('3268 + 5707'));

  const updatedProfile = await getOrCreateStudentProfile(clean);
  assert.equal(updatedProfile.onboardingStage, 'diagnostic'); // Remains in diagnostic stage
});

test('diagnostic quiz: correct arithmetic 8975 places student in Level 3 (Advanced)', async () => {
  const phone = '15559998877';
  const clean = phone.replace(/\D/g, '');
  const profile = await getOrCreateStudentProfile(clean);
  profile.onboardingStage = 'diagnostic';

  const result = await processWhatsAppInbound({
    from_phone: phone,
    message_text: '8975',
  });
  assert.equal(result.status, 'processed');
  assert.ok(result.replyMessage?.includes('8975 is spot on'));
  assert.ok(result.replyMessage?.includes('Level 3 (Advanced)'));

  const updatedProfile = await getOrCreateStudentProfile(clean);
  assert.equal(updatedProfile.placedLevel, 3);
  assert.equal(updatedProfile.onboardingStage, 'ready');
  assert.ok(updatedProfile.points >= 20);
});

test('diagnostic quiz: approximate or alternative number places student in Level 2 (Intermediate)', async () => {
  const phone = '15558887766';
  const clean = phone.replace(/\D/g, '');
  const p = await getOrCreateStudentProfile(clean);
  p.onboardingStage = 'diagnostic';

  const result = await processWhatsAppInbound({
    from_phone: phone,
    message_text: '8970',
  });
  assert.equal(result.status, 'processed');
  assert.ok(result.replyMessage?.includes('Level 2 (Intermediate)'));

  const profile = await getOrCreateStudentProfile(clean);
  assert.equal(profile.placedLevel, 2);
  assert.equal(profile.onboardingStage, 'ready');
});

// ─── 3. Universal Navigation Keywords (menu, progress, stop) ──────────────────

test('universal commands: "menu" displays track selection interactive', async () => {
  const result = await processWhatsAppInbound({
    from_phone: '15550003344',
    message_text: 'menu',
  });
  assert.equal(result.status, 'processed');
  assert.ok(result.replyMessage?.includes('Welcome to Relay Learn'));
  assert.ok(result.replyMessage?.includes('Choose what you would like to explore'));
});

test('universal commands: "progress" displays comprehensive student scorecard', async () => {
  const phone = '15550001122';
  const result = await processWhatsAppInbound({
    from_phone: phone,
    message_text: 'progress',
  });
  assert.equal(result.status, 'processed');
  assert.ok(result.replyMessage?.includes('PROGRESS REPORT'));
  assert.ok(result.replyMessage?.includes('Active Streak:'));
  assert.ok(result.replyMessage?.includes('Total XP:'));
  assert.ok(result.replyMessage?.includes('Accuracy:'));
});

test('universal commands: "stop" locks in streak and closes active session', async () => {
  const phone = '15550001122';
  const result = await processWhatsAppInbound({
    from_phone: phone,
    message_text: 'stop',
  });
  assert.equal(result.status, 'processed');
  assert.ok(result.replyMessage?.includes('PROGRESS SAVED'));
  assert.ok(result.replyMessage?.includes('streak is safely locked in'));

  const session = await getActiveStudySession(phone);
  assert.equal(session, null); // Session is cleared
});

// ─── 4. Image-Based Visual Lessons & Multimodal Tasks ─────────────────────────

test('image-based visual lessons: math_shapes track starts with worked example warmup', async () => {
  const phone = '15554443322';
  await clearStudySession(phone);

  const res = await startStudyTrack(phone, 'math_shapes', 'en');
  assert.ok(res.text.includes("Let's warm up before we start"));
  assert.ok(res.text.includes('Square: 4 equal sides'));
  assert.ok(res.text.includes('Circle: round with no corners'));
  assert.ok(res.interactive);

  const session = await getActiveStudySession(phone);
  assert.ok(session);
  assert.equal(session?.track, 'math_shapes');
  assert.equal(session?.lessonId, 'math_shapes_1');
  assert.equal(session?.showingWarmup, true);
});

test('image-based visual lessons: student starts lesson and receives Task 1 with 2D shapes diagram', async () => {
  const phone = '15554443322';
  const startRes = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'learn_warmup_start', title: 'Start lesson! 🚀' },
  });

  assert.equal(startRes.status, 'processed');
  assert.ok(startRes.replyMessage?.includes('2-D Shapes in Everyday Life'));
  assert.ok(startRes.replyMessage?.includes('Which shape has exactly 3 straight sides'));
  assert.ok(startRes.replyMessage?.includes('A) Triangle'));
  assert.ok(startRes.replyMessage?.includes('D) Rectangle'));
  assert.ok(startRes.replyMessage?.includes('Reply A, B, C, or D'));

  const session = await getActiveStudySession(phone);
  assert.equal(session?.taskIndex, 0);
  assert.equal(session?.imageUrl, 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/shapes_2d.jpg');
});

test('image-based visual lessons: answering Task 1 correctly advances to Task 2 (Marie Biscuit photo)', async () => {
  const phone = '15554443322';
  // Option A (index 0) = Triangle
  const evalRes = await evaluateStudyAnswer(phone, 0, 'en');
  assert.equal(evalRes.isCorrect, true);
  assert.ok(evalRes.text.includes('SPOT ON'));
  assert.ok(evalRes.text.includes('3 sides and 3 angles'));

  // Request next task
  const nextRes = await processWhatsAppInbound({
    from_phone: phone,
    interactive: { type: 'button_reply', id: 'learn_next', title: 'Next Task 🚀' },
  });
  assert.equal(nextRes.status, 'processed');
  assert.ok(nextRes.replyMessage?.includes('What geometric shape does the given object look like'));
  assert.ok(nextRes.replyMessage?.includes('A) Circle'));

  const session = await getActiveStudySession(phone);
  assert.equal(session?.taskIndex, 1);
  assert.equal(session?.imageUrl, 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/biscuit_circle.jpg');
});

test('image-based visual lessons: answering Task 2 correctly advances to Task 3 (Lined Notebook photo)', async () => {
  const phone = '15554443322';
  // Option A (index 0) = Circle (Marie biscuit)
  const evalRes = await evaluateStudyAnswer(phone, 0, 'en');
  assert.equal(evalRes.isCorrect, true);
  assert.ok(evalRes.text.includes('SPOT ON'));

  // Advance to Task 3
  const nextRes = await processWhatsAppInbound({
    from_phone: phone,
    message_text: 'next',
  });
  assert.equal(nextRes.status, 'processed');
  assert.ok(nextRes.replyMessage?.includes('What geometric shape does the given object look like'));

  const session = await getActiveStudySession(phone);
  assert.equal(session?.taskIndex, 2);
  assert.equal(session?.imageUrl, 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/notebook_rectangle.jpg');
});

test('image-based visual lessons: Task 3 supports 4 choices and option D (Rectangle vs Triangle)', async () => {
  const phone = '15554443322';

  // Test Option D (index 3 = Triangle, incorrect for notebook)
  const wrongRes = await evaluateStudyAnswer(phone, 3, 'en');
  assert.equal(wrongRes.isCorrect, false);
  assert.ok(wrongRes.text.includes('Good effort'));

  // Test Option C (index 2 = Rectangle, correct for notebook)
  const correctRes = await evaluateStudyAnswer(phone, 2, 'en');
  assert.equal(correctRes.isCorrect, true);
  assert.ok(correctRes.text.includes('SPOT ON'));
  assert.ok(correctRes.text.includes('rectangle'));
  assert.ok(correctRes.text.includes('completed this lesson with mastery'));

  // Verify session marked inactive upon completion
  const session = await getActiveStudySession(phone);
  assert.equal(session, null);
});

// ─── 5. Visual Asset Integrity & Binary Verification Tests ─────────────────────

test('visual assets: all lesson images exist in static hosting with valid JPEG headers', () => {
  const publicDir = path.resolve(process.cwd(), 'public/lessons');
  const requiredFiles = ['shapes_2d.jpg', 'biscuit_circle.jpg', 'notebook_rectangle.jpg'];

  for (const filename of requiredFiles) {
    const fullPath = path.join(publicDir, filename);
    assert.ok(fs.existsSync(fullPath), `Missing lesson image: ${fullPath}`);

    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 10000, `Image file ${filename} is suspiciously small: ${stat.size} bytes`);

    // Verify JPEG Magic Bytes (0xFF, 0xD8, 0xFF)
    const fd = fs.openSync(fullPath, 'r');
    const header = Buffer.alloc(3);
    fs.readSync(fd, header, 0, 3, 0);
    fs.closeSync(fd);

    assert.equal(header[0], 0xff, `${filename} magic byte 0 should be 0xFF`);
    assert.equal(header[1], 0xd8, `${filename} magic byte 1 should be 0xD8`);
    assert.equal(header[2], 0xff, `${filename} magic byte 2 should be 0xFF`);
  }
});

test('outbound image dispatch: sendWhatsAppImageMessage handles test recipient safely', async () => {
  const testPhone = '15550009988';
  const imageUrl = 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/biscuit_circle.jpg';
  const result = await sendWhatsAppImageMessage(testPhone, imageUrl, '2D shapes lesson');

  assert.ok(result);
  assert.equal(result?.messaging_product, 'whatsapp');
  assert.ok(result?.messages[0].id.startsWith('wamid.test_img_'));
});

test('interactive navigation: clicking Shapes & 2D from menu starts Shapes warmup instead of answering previous session', async () => {
  const phone = '15557771234';
  await resetStudentProfileForTesting(phone);
  await clearStudySession(phone);

  // 1. Simulate user previously being in Math Foundations (fractions where Option A is 2/4)
  await startStudyTrack(phone, 'math_foundations', 'en');
  const initialSession = await getActiveStudySession(phone);
  assert.equal(initialSession?.track, 'math_foundations');

  // 2. User types "Menu"
  const menuRes = await processWhatsAppInbound({
    from_phone: phone,
    message_text: 'Menu',
  });
  assert.equal(menuRes.status, 'processed');
  assert.ok(menuRes.replyMessage?.includes('Welcome to Relay Learn') || menuRes.replyMessage?.includes('Choose what you would like to explore'));

  // 3. User taps "1️⃣ Shapes & 2D 📐" (button reply with id learn_track_shapes)
  const trackSelectRes = await processWhatsAppInbound({
    from_phone: phone,
    message_text: '1️⃣ Shapes & 2D 📐',
    interactive: {
      type: 'button_reply',
      id: 'learn_track_shapes',
      title: '1️⃣ Shapes & 2D 📐',
    },
  });

  assert.equal(trackSelectRes.status, 'processed');
  // CRITICAL: MUST NOT evaluate as correct answer to fractions!
  assert.ok(!trackSelectRes.replyMessage?.includes('SPOT ON'));
  assert.ok(!trackSelectRes.replyMessage?.includes('2/4'));
  assert.ok(!trackSelectRes.replyMessage?.includes('Why it works'));

  // MUST present the Shapes & 2D warmup!
  assert.ok(trackSelectRes.replyMessage?.includes('Visual Warmup') || trackSelectRes.replyMessage?.includes('2-D shapes') || trackSelectRes.replyMessage?.includes('warm up'));

  const newSession = await getActiveStudySession(phone);
  assert.equal(newSession?.track, 'math_shapes');
  assert.equal(newSession?.lessonId, 'math_shapes_1');
  assert.equal(newSession?.showingWarmup, true);

  // 4. User taps "Start lesson! 🚀" (learn_warmup_start)
  const startWarmupRes = await processWhatsAppInbound({
    from_phone: phone,
    interactive: {
      type: 'button_reply',
      id: 'learn_warmup_start',
      title: 'Start lesson! 🚀',
    },
  });

  assert.equal(startWarmupRes.status, 'processed');
  assert.ok(startWarmupRes.replyMessage?.includes('Which shape has exactly 3 straight sides'));

  const task1Session = await getActiveStudySession(phone);
  assert.equal(task1Session?.showingWarmup, false);
  assert.equal(task1Session?.imageUrl, 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/shapes_2d.jpg');
});

test('text navigation: typing "1️⃣ Shapes & 2D 📐" starts shapes track instead of answering question', async () => {
  const phone = '15557775678';
  await resetStudentProfileForTesting(phone);
  await clearStudySession(phone);

  // 1. Simulate prior fractions question
  await startStudyTrack(phone, 'math_foundations', 'en');

  // 2. User sends text string copied from button: "1️⃣ Shapes & 2D 📐"
  const textSelectRes = await processWhatsAppInbound({
    from_phone: phone,
    message_text: '1️⃣ Shapes & 2D 📐',
  });

  assert.equal(textSelectRes.status, 'processed');
  assert.ok(!textSelectRes.replyMessage?.includes('SPOT ON'));
  assert.ok(!textSelectRes.replyMessage?.includes('2/4'));
  assert.ok(textSelectRes.replyMessage?.includes('2-D shapes') || textSelectRes.replyMessage?.includes('warm up'));

  const session = await getActiveStudySession(phone);
  assert.equal(session?.track, 'math_shapes');
});

