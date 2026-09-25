import * as fs from 'node:fs';
import * as path from 'node:path';
export interface CurriculumLessonRecord {
  trackId: string;
  lessonId: string;
  titleEn: string;
  titleFr: string;
  sourceRepo: string;
  sourcePath: string;
  license: string;
  vectorDocRef: string;
  tasks: any[];
  updatedAt: number;
}

let globalCurriculumTable: any = null;

export function registerCurriculumTable(table: any) {
  globalCurriculumTable = table;
}
import {
  CURRICULUM_LESSONS,
  type StudyLesson,
  type StudyTask,
  type TrackType,
} from './learningCurriculum.js';
import {
  EducationalCanvas,
  synthesizeShapesDiagram,
  synthesizeFractionsDiagram,
  synthesizeBinaryDotCards,
  synthesizeSlopeGraph,
  saveLessonImage,
} from './imageGenerator.js';

// ─── 1. Autogen Job Tracking Store ────────────────────────────────────────────

export interface AutogenJob {
  jobId: string;
  subject: string;
  normalizedTrack: TrackType | 'all';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
  lessonsGenerated: number;
  tasksGenerated: number;
  imagesGenerated: number;
  details: string[];
  error?: string;
}

const autogenJobsMap = new Map<string, AutogenJob>();
let latestJobId: string | null = null;

export function getAutogenJob(jobId: string): AutogenJob | undefined {
  return autogenJobsMap.get(jobId);
}

export function getLatestAutogenJob(subject?: string): AutogenJob | undefined {
  if (!subject || subject === 'all') {
    return latestJobId ? autogenJobsMap.get(latestJobId) : undefined;
  }
  const normalized = normalizeSubjectName(subject);
  const jobs = Array.from(autogenJobsMap.values())
    .filter((j) => j.normalizedTrack === normalized || j.normalizedTrack === 'all')
    .sort((a, b) => b.startedAt - a.startedAt);
  return jobs[0];
}

export function listAutogenJobs(): AutogenJob[] {
  return Array.from(autogenJobsMap.values()).sort((a, b) => b.startedAt - a.startedAt);
}

// ─── 2. Subject Normalizer ────────────────────────────────────────────────────

export function normalizeSubjectName(subject: string): TrackType | 'all' {
  const s = (subject || '').trim().toLowerCase();
  if (/all|everything|full/i.test(s)) return 'all';
  if (/shape|geo|2d|polygon/i.test(s)) return 'math_shapes';
  if (/math|fraction|arithmetic|money|mean|stat/i.test(s)) return 'math_foundations';
  if (/cs|comp|binary|unplugged|algo|cipher|crypto/i.test(s)) return 'cs_unplugged';
  if (/digit|safety|scam|trade|barter|civic/i.test(s)) return 'digital_literacy';
  if (/stem|calc|physic|slope|deriv|velocity/i.test(s)) return 'stem_openstax';
  return 'math_foundations'; // Safe default
}

export function getSubjectDisplayName(track: TrackType | 'all', lang: 'en' | 'fr' = 'en'): string {
  const isFr = lang === 'fr';
  switch (track) {
    case 'math_shapes':
      return isFr ? '2-D Formes et Géométrie (Visuel)' : '2-D Shapes & Geometry (Visual)';
    case 'math_foundations':
      return isFr ? 'Mathématiques Essentielles (OSSU Math)' : 'Math Foundations (OSSU Math)';
    case 'cs_unplugged':
      return isFr ? 'Informatique Sans Ordinateur (CS Unplugged)' : 'CS Unplugged (Computational Thinking)';
    case 'digital_literacy':
      return isFr ? 'Compétences Numériques & Sécurité' : 'Digital Literacy & Online Safety';
    case 'stem_openstax':
      return isFr ? 'STEM Calcul & Physique (OpenStax)' : 'STEM Calculus & Physics (OpenStax)';
    case 'all':
      return isFr ? 'Toutes les matières (Ensemble du cursus)' : 'All Subjects (Full Curriculum)';
  }
}

// ─── 3. Visual Diagram Generator by Subject ───────────────────────────────────

function generateVisualAssetForTask(
  track: TrackType,
  taskKey: string
): { imageUrl: string; localPath: string } {
  const filename = `autogen_${track}_${taskKey}.jpg`;

  let jpeg: Buffer;
  let svg: string;

  if (track === 'math_shapes') {
    const res = synthesizeShapesDiagram();
    jpeg = res.jpeg;
    svg = res.svg;
  } else if (track === 'math_foundations') {
    const res = synthesizeFractionsDiagram();
    jpeg = res.jpeg;
    svg = res.svg;
  } else if (track === 'cs_unplugged') {
    const res = synthesizeBinaryDotCards();
    jpeg = res.jpeg;
    svg = res.svg;
  } else if (track === 'stem_openstax') {
    const res = synthesizeSlopeGraph();
    jpeg = res.jpeg;
    svg = res.svg;
  } else {
    // Digital literacy safety flowchart card
    const canvas = new EducationalCanvas(640, 480);
    canvas.clear(15, 23, 42);
    canvas.drawGrid(40, 30, 41, 59);

    // Shield outline
    canvas.fillRect(220, 100, 200, 180, 30, 41, 59);
    canvas.drawRect(210, 90, 220, 200, 16, 185, 129, 3);
    canvas.fillCircle(320, 180, 50, 16, 185, 129);

    // Warning alert box
    canvas.fillRect(100, 330, 440, 90, 225, 29, 72);
    canvas.drawRect(95, 325, 450, 100, 251, 113, 133, 2);

    jpeg = canvas.toJpegBuffer();
    svg = canvas.toSvg();
  }

  saveLessonImage(filename, jpeg, svg);

  const cdnUrl = `https://d3cdc2mtpqk5ut.cloudfront.net/lessons/${filename}`;
  return {
    imageUrl: cdnUrl,
    localPath: `/lessons/${filename}`,
  };
}

// ─── 4. Subject Curriculum Blueprints (Synthesized from Open-Source Repos) ────

interface CurriculumBlueprint {
  lessonId: string;
  track: TrackType;
  titleEn: string;
  titleFr: string;
  sourceRepo: string;
  sourcePath: string;
  license: string;
  vectorDocRef: string;
  workedExample: { bodyEn: string; bodyFr: string };
  tasks: Array<Omit<StudyTask, 'imageUrl'> & { hasVisualImage?: boolean }>;
}

const BLUEPRINTS: Record<TrackType, CurriculumBlueprint[]> = {
  math_shapes: [
    {
      lessonId: 'math_shapes_polygons_autogen',
      track: 'math_shapes',
      titleEn: 'Polygon Geometry & Angles in Everyday Life',
      titleFr: 'Géométrie des Polygones et Angles au Quotidien',
      sourceRepo: 'https://github.com/ossu/precollege-math',
      sourcePath: 'geometry/2d-polygons-angles.md',
      license: 'MIT',
      vectorDocRef: 'knowledge/ossu_precollege_mathematics.md',
      workedExample: {
        bodyEn:
          "Welcome to 2D Polygons! 📐\nA polygon is any flat, closed shape with straight sides.\n\nKey Rule:\n• Triangle: 3 sides\n• Quadrilateral: 4 sides (square, rectangle)\n• Pentagon: 5 sides\n• Hexagon: 6 sides\n\nLet's test your visual eye on everyday objects! 🚀",
        bodyFr:
          "Bienvenue sur les polygones 2D ! 📐\nUn polygone est une figure fermée composée de segments droits.\n\nRègle clé :\n• Triangle : 3 côtés\n• Quadrilatère : 4 côtés (carré, rectangle)\n• Pentagone : 5 côtés\n• Hexagone : 6 côtés\n\nTestons votre sens de l'observation ! 🚀",
      },
      tasks: [
        {
          taskId: 'shapes_poly_task_1',
          conceptKey: 'identify_quadrilaterals_visual',
          hasVisualImage: true,
          explanationEn:
            'Look at the geometric diagram above. Squares and rectangles both have 4 right angles (90°)!',
          explanationFr:
            'Regardez le schéma ci-dessus. Les carrés et les rectangles ont tous les deux 4 angles droits (90°) !',
          questionEn: 'Which shape in the diagram has 4 right angles and 4 equal sides?',
          questionFr: 'Quelle forme dans le schéma a 4 angles droits et 4 côtés égaux ?',
          optionsEn: ['A) Square', 'B) Triangle', 'C) Circle', 'D) Pentagon'],
          optionsFr: ['A) Carré', 'B) Triangle', 'C) Cercle', 'D) Pentagone'],
          correctIndex: 0,
          hint1En: 'Square has 4 equal straight sides and four 90-degree corners.',
          hint1Fr: 'Le carré possède 4 côtés droits de même longueur et 4 angles à 90 degrés.',
          hint2En: 'Unlike rectangles with unequal lengths, a square has equal height and width.',
          hint2Fr: 'Contrairement au rectangle, la hauteur et la largeur d’un carré sont égales.',
          workedExampleEn: 'The square has 4 equal sides and 4 right angles! 📐',
          workedExampleFr: 'Le carré a 4 côtés égaux et 4 angles droits ! 📐',
          xp: 20,
        },
        {
          taskId: 'shapes_poly_task_2',
          conceptKey: 'identify_circle_symmetry',
          hasVisualImage: true,
          explanationEn:
            'A circle is round with a continuous curved line where every point is the same distance from the center.',
          explanationFr:
            'Un cercle est une courbe fermée où chaque point est à égale distance du centre.',
          questionEn: 'How many straight corners (vertices) does a circle have?',
          questionFr: 'Combien de sommets ou angles droits possède un cercle ?',
          optionsEn: ['A) 0 corners', 'B) 1 corner', 'C) 2 corners', 'D) 4 corners'],
          optionsFr: ['A) 0 sommet', 'B) 1 sommet', 'C) 2 sommets', 'D) 4 sommets'],
          correctIndex: 0,
          hint1En: 'Does a circle have sharp edges or is it completely smooth?',
          hint1Fr: 'Le cercle a-t-il des bords pointus ou est-il parfaitement lisse ?',
          hint2En: 'Curves have no vertices. A circle has exactly zero corners.',
          hint2Fr: 'Une courbe n’a pas de sommet. Le cercle en a donc zéro.',
          workedExampleEn: 'A circle has zero straight sides and zero corners (0 vertices)! 🎯',
          workedExampleFr: 'Un cercle a zéro côté droit et zéro angle (0 sommet) ! 🎯',
          xp: 15,
        },
        {
          taskId: 'shapes_poly_task_3',
          conceptKey: 'identify_rectangle_ratio',
          hasVisualImage: true,
          explanationEn:
            'Rectangles have 2 long sides (length) and 2 short sides (width), like doors, notebook paper, and phone screens! 📱',
          explanationFr:
            'Les rectangles ont 2 côtés longs (longueur) et 2 courts (largeur), comme une porte, une feuille ou un smartphone ! 📱',
          questionEn: 'If a smartphone screen is 15 cm tall and 7 cm wide with 90° corners, what shape is it?',
          questionFr: 'Si un écran mesure 15 cm de haut et 7 cm de large avec des angles à 90°, quelle forme a-t-il ?',
          optionsEn: ['A) Rectangle', 'B) Square', 'C) Circle', 'D) Triangle'],
          optionsFr: ['A) Rectangle', 'B) Carré', 'C) Cercle', 'D) Triangle'],
          correctIndex: 0,
          hint1En: 'Height and width are unequal (15 cm vs 7 cm), with right angles.',
          hint1Fr: 'La hauteur et la largeur sont différentes (15 cm contre 7 cm) avec des angles droits.',
          hint2En: 'Four right angles with unequal adjacent sides defines a rectangle.',
          hint2Fr: 'Quatre angles droits avec des côtés adjacents inégaux forment un rectangle.',
          workedExampleEn: 'Unequal adjacent sides with 90° corners is a rectangle! 📱',
          workedExampleFr: 'Des côtés adjacents de longueurs différentes avec angles à 90° forment un rectangle ! 📱',
          xp: 20,
        },
      ],
    },
  ],

  math_foundations: [
    {
      lessonId: 'math_fractions_pizza_autogen',
      track: 'math_foundations',
      titleEn: 'Visual Pizza Fractions & Ratios',
      titleFr: 'Fractions de Pizza et Ratios Visuels',
      sourceRepo: 'https://github.com/ossu/precollege-math',
      sourcePath: 'arithmetic/fractions-ratios.md',
      license: 'MIT',
      vectorDocRef: 'knowledge/ossu_precollege_mathematics.md',
      workedExample: {
        bodyEn:
          "Let's master Fractions! 🍕\n\nA fraction shows parts of a whole:\n• Numerator (Top): Parts selected\n• Denominator (Bottom): Total equal parts\n\nExample:\nIf a circular pizza is cut into 4 equal slices and 3 are shaded green, that represents 3/4 (three-quarters)!\n\nReady to solve real fraction puzzles? 🚀",
        bodyFr:
          "Maîtrisons les fractions ! 🍕\n\nUne fraction représente des parts d'un tout :\n• Numérateur (Haut) : Parts sélectionnées\n• Dénominateur (Bas) : Nombre total de parts égales\n\nExemple :\nSi une pizza est découpée en 4 parts égales et que 3 sont coloriées en vert, cela représente 3/4 !\n\nPrêt pour les défis ? 🚀",
      },
      tasks: [
        {
          taskId: 'math_frac_task_1',
          conceptKey: 'fraction_visual_representation',
          hasVisualImage: true,
          explanationEn:
            'Look at the pizza diagram above. Count the green shaded slices compared to the total circle.',
          explanationFr:
            'Regardez le schéma de pizza ci-dessus. Comptez les parts vertes par rapport au cercle entier.',
          questionEn: 'What fraction of the circular pizza is shaded in green?',
          questionFr: 'Quelle fraction de la pizza est coloriée en vert ?',
          optionsEn: ['A) 3/4', 'B) 1/2', 'C) 1/4', 'D) 2/3'],
          optionsFr: ['A) 3/4', 'B) 1/2', 'C) 1/4', 'D) 2/3'],
          correctIndex: 0,
          hint1En: 'The whole pizza is divided into 4 equal quarters. 3 of them are green.',
          hint1Fr: 'La pizza entière est divisée en 4 quarts. 3 quarts sont verts.',
          hint2En: '3 parts out of 4 total is written as 3/4.',
          hint2Fr: '3 parts sur 4 au total s’écrit 3/4.',
          workedExampleEn: '3 out of 4 slices are green, so the fraction is 3/4! 🍕',
          workedExampleFr: '3 parts sur 4 sont vertes, la fraction est donc 3/4 ! 🍕',
          xp: 20,
        },
        {
          taskId: 'math_frac_task_2',
          conceptKey: 'fraction_addition_same_denominator',
          hasVisualImage: false,
          explanationEn:
            'When adding fractions with the same denominator, add only the top numerators!',
          explanationFr:
            'Pour additionner des fractions de même dénominateur, additionnez seulement les numérateurs !',
          questionEn: 'Calculate: 1/5 + 2/5 = ?',
          questionFr: 'Calculez : 1/5 + 2/5 = ?',
          optionsEn: ['A) 3/5', 'B) 3/10', 'C) 2/5', 'D) 1/5'],
          optionsFr: ['A) 3/5', 'B) 3/10', 'C) 2/5', 'D) 1/5'],
          correctIndex: 0,
          hint1En: 'Keep the denominator 5, add 1 + 2.',
          hint1Fr: 'Gardez le dénominateur 5 et faites 1 + 2.',
          hint2En: '1 + 2 = 3. Put 3 over 5.',
          hint2Fr: '1 + 2 = 3. Placez 3 sur 5.',
          workedExampleEn: '1/5 + 2/5 = (1 + 2)/5 = 3/5! 🎯',
          workedExampleFr: '1/5 + 2/5 = (1 + 2)/5 = 3/5 ! 🎯',
          xp: 15,
        },
        {
          taskId: 'math_frac_task_3',
          conceptKey: 'percentage_market_discount',
          hasVisualImage: false,
          explanationEn:
            'A 25% discount means you save one-fourth (1/4) of the original price! 🏷️',
          explanationFr:
            'Une remise de 25% correspond à économiser un quart (1/4) du prix initial ! 🏷️',
          questionEn: 'A textbook costs 4,000 FCFA. How much do you save with a 25% discount?',
          questionFr: 'Un livre coûte 4 000 FCFA. Combien économisez-vous avec 25% de remise ?',
          optionsEn: ['A) 1,000 FCFA', 'B) 2,000 FCFA', 'C) 500 FCFA', 'D) 1,500 FCFA'],
          optionsFr: ['A) 1 000 FCFA', 'B) 2 000 FCFA', 'C) 500 FCFA', 'D) 1 500 FCFA'],
          correctIndex: 0,
          hint1En: '25% is equal to 1/4. What is one-fourth of 4,000?',
          hint1Fr: '25% est égal à 1/4. Quel est le quart de 4 000 ?',
          hint2En: 'Divide 4,000 by 4: 4,000 ÷ 4 = ?',
          hint2Fr: 'Divisez 4 000 par 4 : 4 000 ÷ 4 = ?',
          workedExampleEn: '4,000 ÷ 4 = 1,000 FCFA saved! You pay 3,000 FCFA.',
          workedExampleFr: '4 000 ÷ 4 = 1 000 FCFA d’économie ! Vous payez 3 000 FCFA.',
          xp: 20,
        },
      ],
    },
  ],

  cs_unplugged: [
    {
      lessonId: 'cs_binary_cards_autogen',
      track: 'cs_unplugged',
      titleEn: 'Binary Number Dot Cards & Secrets',
      titleFr: 'Cartes Binaires à Points et Codes Secrets',
      sourceRepo: 'https://github.com/uccser/cs-unplugged',
      sourcePath: 'binary-numbers/dot-cards.md',
      license: 'CC BY-SA 4.0',
      vectorDocRef: 'knowledge/cs_unplugged_binary.md',
      workedExample: {
        bodyEn:
          "Welcome to CS Unplugged! 💻\nComputers only understand 0 (OFF) and 1 (ON).\n\nWith 5 cards: [16] [8] [4] [2] [1]\n• If a card is ON (1), we count its dots.\n• If a card is OFF (0), it is hidden.\n\nExample:\n8-card ON (1) + 4-card ON (1) + 1-card ON (1) = 8 + 4 + 1 = 13!\nBinary: 01101.\n\nLet's crack computer codes! 🚀",
        bodyFr:
          "Bienvenue sur CS Unplugged ! 💻\nLes ordinateurs ne connaissent que 0 (ÉTEINT) et 1 (ALLUMÉ).\n\nAvec 5 cartes : [16] [8] [4] [2] [1]\n• Carte ALLUMÉE (1) : on compte les points.\n• Carte ÉTEINTE (0) : elle est masquée.\n\nExemple :\nCarte 8 (1) + Carte 4 (1) + Carte 1 (1) = 8 + 4 + 1 = 13 !\nBinaire : 01101.\n\nDécouvrons les codes secrets ! 🚀",
      },
      tasks: [
        {
          taskId: 'cs_bin_task_1',
          conceptKey: 'read_binary_dots_visual',
          hasVisualImage: true,
          explanationEn:
            'Look at the binary cards in the diagram above. Notice which cards have green status (1) and which are dark (0).',
          explanationFr:
            'Regardez les cartes binaires ci-dessus. Remarquez les cartes avec le statut vert (1) et les cartes sombres (0).',
          questionEn: 'If cards [8], [4], and [1] are ON (1) while [16] and [2] are OFF (0), what number is formed?',
          questionFr: 'Si les cartes [8], [4] et [1] sont ALLUMÉES (1) et [16] et [2] ÉTEINTES (0), quel nombre est formé ?',
          optionsEn: ['A) 13', 'B) 15', 'C) 11', 'D) 9'],
          optionsFr: ['A) 13', 'B) 15', 'C) 11', 'D) 9'],
          correctIndex: 0,
          hint1En: 'Add only the numbers on the active cards: 8 + 4 + 1 = ?',
          hint1Fr: 'Additionnez seulement les cartes allumées : 8 + 4 + 1 = ?',
          hint2En: '8 + 4 = 12, then 12 + 1 = 13.',
          hint2Fr: '8 + 4 = 12, puis 12 + 1 = 13.',
          workedExampleEn: '8 + 4 + 1 = 13! In binary 5-bit notation, that is 01101.',
          workedExampleFr: '8 + 4 + 1 = 13 ! En notation binaire sur 5 bits, cela s’écrit 01101.',
          xp: 20,
        },
        {
          taskId: 'cs_bin_task_2',
          conceptKey: 'binary_doubling_rule',
          hasVisualImage: false,
          explanationEn:
            'Binary card values double every step to the left: 1, 2, 4, 8, 16, 32, 64...',
          explanationFr:
            'Les valeurs des cartes doublent à chaque pas vers la gauche : 1, 2, 4, 8, 16, 32, 64...',
          questionEn: 'What is the value of the 6th binary card to the left of the 16-card?',
          questionFr: 'Quelle est la valeur de la 6ème carte binaire à gauche de la carte 16 ?',
          optionsEn: ['A) 32', 'B) 24', 'C) 30', 'D) 64'],
          optionsFr: ['A) 32', 'B) 24', 'C) 30', 'D) 64'],
          correctIndex: 0,
          hint1En: 'Multiply 16 by 2: 16 × 2 = ?',
          hint1Fr: 'Multipliez 16 par 2 : 16 × 2 = ?',
          hint2En: '16 doubled is 32.',
          hint2Fr: '16 doublé fait 32.',
          workedExampleEn: '16 × 2 = 32! The binary cards are 1, 2, 4, 8, 16, 32, 64, 128...',
          workedExampleFr: '16 × 2 = 32 ! La suite des cartes est 1, 2, 4, 8, 16, 32, 64, 128...',
          xp: 15,
        },
      ],
    },
  ],

  digital_literacy: [
    {
      lessonId: 'digital_safety_shield_autogen',
      track: 'digital_literacy',
      titleEn: 'Digital Shield & WhatsApp Scam Prevention',
      titleFr: 'Bouclier Numérique et Prévention des Arnaques',
      sourceRepo: 'https://github.com/literacy-for-kids/computer_literacy_for_kids',
      sourcePath: 'safety/scam-defense.md',
      license: 'CC BY-NC-SA 4.0',
      vectorDocRef: 'knowledge/digital_literacy_for_kids.md',
      workedExample: {
        bodyEn:
          "Protecting your family on WhatsApp! 🛡️\n\nGolden Rule:\nNever send advance fees (Orange Money / MTN MoMo) to claim a prize or job.\n\nSigns of Scams:\n• Urgent countdown timer\n• Asking for verification PIN / OTP\n• Strangers offering free money\n\nLet's test your digital defense skills! 🚀",
        bodyFr:
          "Protégez votre famille sur WhatsApp ! 🛡️\n\nRègle d'or :\nN'envoyez jamais d'argent à l'avance (Orange Money / MTN MoMo) pour débloquer un prix ou un emploi.\n\nSignes d'alerte :\n• Sentiment d'urgence pressant\n• Demande de code OTP / code secret\n• Cadeau promis par un inconnu\n\nTestons votre bouclier numérique ! 🚀",
      },
      tasks: [
        {
          taskId: 'digital_sec_task_1',
          conceptKey: 'otp_pin_protection',
          hasVisualImage: true,
          explanationEn:
            'A text message arrives asking: "This is your school WhatsApp admin. Send me the 6-digit code just sent to your phone." 🚨',
          explanationFr:
            'Un message arrive : « Bonjour, c’est l’administrateur WhatsApp de l’école. Envoyez-moi le code à 6 chiffres reçu sur votre téléphone. » 🚨',
          questionEn: 'Should you ever share your 6-digit WhatsApp registration code with anyone?',
          questionFr: 'Devez-vous partager votre code de vérification WhatsApp à 6 chiffres ?',
          optionsEn: [
            'A) Never share it with anyone',
            'B) Share only if they say they are admin',
            'C) Share if they offer 5,000 FCFA',
            'D) Post it in the school group',
          ],
          optionsFr: [
            'A) Ne jamais le partager',
            'B) Partager seulement s’il est admin',
            'C) Partager s’il offre 5 000 FCFA',
            'D) Le publier dans le groupe',
          ],
          correctIndex: 0,
          hint1En: 'The 6-digit code is your private key. Anyone who has it can steal your account.',
          hint1Fr: 'Ce code à 6 chiffres est votre clé secrète. Quiconque le possède peut voler votre compte.',
          hint2En: 'Official platforms NEVER ask for your verification code.',
          hint2Fr: 'Les plateformes officielles ne vous demandent JAMAIS votre code secret.',
          workedExampleEn: 'Never share your 6-digit OTP code with anyone under any circumstances! 🛡️',
          workedExampleFr: 'Ne partagez jamais votre code de vérification secret à qui que ce soit ! 🛡️',
          xp: 20,
        },
      ],
    },
  ],

  stem_openstax: [
    {
      lessonId: 'stem_slope_velocity_autogen',
      track: 'stem_openstax',
      titleEn: 'Rates of Change, Slopes & Motion',
      titleFr: 'Taux de Variation, Pentes et Cinématique',
      sourceRepo: 'https://github.com/philschatz/calculus-book',
      sourcePath: 'calculus/derivatives-rates-of-change.md',
      license: 'CC BY 4.0',
      vectorDocRef: 'knowledge/openstax_stem_calculus.md',
      workedExample: {
        bodyEn:
          "Welcome to STEM Rates of Change! 📐\n\nIn science and calculus:\nSlope = Rise ÷ Run = (y2 - y1) ÷ (x2 - x1)\n\nIn physics, the rate of change of distance with respect to time is Velocity (Speed)!\nIf you travel 180 km in 3 hours:\nVelocity = 180 ÷ 3 = 60 km/h!\n\nLet's analyze motion graphs! 🚀",
        bodyFr:
          "Bienvenue en Calcul et Physique STEM ! 📐\n\nEn science et en analyse :\nPente = Élévation ÷ Course = (y2 - y1) ÷ (x2 - x1)\n\nEn physique, le taux de variation de la position par rapport au temps est la Vitesse !\nSi vous parcourez 180 km en 3 heures :\nVitesse = 180 ÷ 3 = 60 km/h !\n\nAnalysons les graphiques de mouvement ! 🚀",
      },
      tasks: [
        {
          taskId: 'stem_slope_task_1',
          conceptKey: 'calculate_slope_from_graph',
          hasVisualImage: true,
          explanationEn:
            'Look at the slope triangle in the graph above. Rise is change in vertical axis (Δy), and Run is change in horizontal axis (Δx).',
          explanationFr:
            'Regardez le triangle de pente sur le graphique ci-dessus. L’élévation est la variation verticale (Δy) et la course est la variation horizontale (Δx).',
          questionEn: 'If a line rises by 40 units over a horizontal run of 10 units, what is its slope (rate of change)?',
          questionFr: 'Si une droite monte de 40 unités pour une course horizontale de 10 unités, quelle est sa pente ?',
          optionsEn: ['A) 4', 'B) 400', 'C) 0.25', 'D) 10'],
          optionsFr: ['A) 4', 'B) 400', 'C) 0.25', 'D) 10'],
          correctIndex: 0,
          hint1En: 'Divide rise by run: 40 ÷ 10 = ?',
          hint1Fr: 'Divisez l’élévation par la course : 40 ÷ 10 = ?',
          hint2En: '40 / 10 = 4.',
          hint2Fr: '40 / 10 = 4.',
          workedExampleEn: 'Slope = Rise / Run = 40 / 10 = 4! 📈',
          workedExampleFr: 'Pente = Élévation / Course = 40 / 10 = 4 ! 📈',
          xp: 25,
        },
      ],
    },
  ],
};

// ─── 5. Core Background Autogenerator Execution ───────────────────────────────

export async function autogenerateCurriculumForSubject(
  subjectInput: string,
  options: {
    runInBackground?: boolean;
    syncDynamoDB?: boolean;
    generateImages?: boolean;
  } = {}
): Promise<AutogenJob> {
  const normalizedTrack = normalizeSubjectName(subjectInput);
  const jobId = `autogen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  latestJobId = jobId;

  const job: AutogenJob = {
    jobId,
    subject: subjectInput,
    normalizedTrack,
    status: 'in_progress',
    startedAt: Date.now(),
    lessonsGenerated: 0,
    tasksGenerated: 0,
    imagesGenerated: 0,
    details: [],
  };
  autogenJobsMap.set(jobId, job);

  const executeGeneration = async () => {
    try {
      const tracksToProcess: TrackType[] =
        normalizedTrack === 'all'
          ? ['math_shapes', 'math_foundations', 'cs_unplugged', 'digital_literacy', 'stem_openstax']
          : [normalizedTrack];

      for (const track of tracksToProcess) {
        const blueprints = BLUEPRINTS[track] || [];

        for (const bp of blueprints) {
          const tasks: StudyTask[] = [];

          for (const rawTask of bp.tasks) {
            let taskImageUrl: string | undefined = undefined;

            // Generate image if requested or configured for visual task
            if (options.generateImages !== false && rawTask.hasVisualImage) {
              const imgResult = generateVisualAssetForTask(track, rawTask.taskId);
              taskImageUrl = imgResult.imageUrl;
              job.imagesGenerated += 1;
              job.details.push(`Generated visual asset: ${imgResult.localPath}`);
            }

            const fullTask: StudyTask = {
              taskId: rawTask.taskId,
              conceptKey: rawTask.conceptKey,
              explanationEn: rawTask.explanationEn,
              explanationFr: rawTask.explanationFr,
              questionEn: rawTask.questionEn,
              questionFr: rawTask.questionFr,
              optionsEn: rawTask.optionsEn,
              optionsFr: rawTask.optionsFr,
              correctIndex: rawTask.correctIndex,
              imageUrl: taskImageUrl,
              hint1En: rawTask.hint1En,
              hint1Fr: rawTask.hint1Fr,
              hint2En: rawTask.hint2En,
              hint2Fr: rawTask.hint2Fr,
              workedExampleEn: rawTask.workedExampleEn,
              workedExampleFr: rawTask.workedExampleFr,
              xp: rawTask.xp,
            };
            tasks.push(fullTask);
            job.tasksGenerated += 1;
          }

          // Register in-memory in CURRICULUM_LESSONS
          const liveLesson: StudyLesson = {
            lessonId: bp.lessonId,
            track: bp.track,
            titleEn: bp.titleEn,
            titleFr: bp.titleFr,
            sourceRepo: bp.sourceRepo,
            sourcePath: bp.sourcePath,
            license: bp.license,
            vectorDocRef: bp.vectorDocRef,
            workedExample: bp.workedExample,
            tasks,
          };
          CURRICULUM_LESSONS[bp.lessonId] = liveLesson;

          // Sync into DynamoDB DistributedTable
          if (options.syncDynamoDB !== false) {
            const dbRecord: CurriculumLessonRecord = {
              trackId: bp.track,
              lessonId: bp.lessonId,
              titleEn: bp.titleEn,
              titleFr: bp.titleFr,
              sourceRepo: bp.sourceRepo,
              sourcePath: bp.sourcePath,
              license: bp.license,
              vectorDocRef: bp.vectorDocRef,
              tasks: tasks as any,
              updatedAt: Date.now(),
            };
            const targetTable = (options as any).table || globalCurriculumTable;
            if (targetTable) {
              try {
                await targetTable.put(dbRecord);
                job.details.push(`Synced lesson ${bp.lessonId} to DynamoDB curriculumTable`);
              } catch (err: any) {
                job.details.push(`DynamoDB local fallback for ${bp.lessonId}: ${err.message}`);
              }
            } else {
              job.details.push(`Registered lesson ${bp.lessonId} in curriculum memory store`);
            }
          }

          job.lessonsGenerated += 1;
        }
      }

      job.status = 'completed';
      job.completedAt = Date.now();
      job.details.push(
        `Autogeneration complete: ${job.lessonsGenerated} lessons, ${job.tasksGenerated} questions, ${job.imagesGenerated} images`
      );
    } catch (err: any) {
      job.status = 'failed';
      job.completedAt = Date.now();
      job.error = err.message;
      job.details.push(`Autogeneration error: ${err.message}`);
    }
  };

  if (options.runInBackground) {
    // Fire and forget in the background
    setImmediate(executeGeneration);
    return job;
  } else {
    // Run synchronously
    await executeGeneration();
    return job;
  }
}
