/**
 * Curriculum & Socratic Task Engine — aws-blocks/learningCurriculum.ts
 *
 * Micro-pedagogy & CS Unplugged Learning Architecture:
 * - Bite-sized micro-lessons (maximum 2-3 sentences)
 * - Visual progress bars in ASCII/emojis [ 🟩 🟩 ⬜ ⬜ ⬜ ]
 * - 3-choice interactive WhatsApp questions (A, B, C)
 * - 3-tier Socratic hint escalation (never gives away the direct answer)
 * - Growth mindset / metacognition support for math anxiety (TaRL framework)
 * - Gamified streak and XP tracking
 */

export const TRACK_TYPES = [
  'math_shapes',
  'cs_unplugged',
  'math_foundations',
  'digital_literacy',
  'stem_openstax',
] as const;
export type TrackType = (typeof TRACK_TYPES)[number];

export interface StudyTask {
  taskId: string;
  conceptKey: string;
  explanationEn: string;
  explanationFr: string;
  questionEn: string;
  questionFr: string;
  optionsEn: string[]; // 3 or 4 options
  optionsFr: string[];
  correctIndex: number;
  imageUrl?: string; // Multimodal image URL for visual geometry/CS lessons
  hint1En: string;
  hint1Fr: string;
  hint2En: string;
  hint2Fr: string;
  workedExampleEn: string;
  workedExampleFr: string;
  xp: number;
}

export interface StudyLesson {
  lessonId: string;
  track: TrackType;
  titleEn: string;
  titleFr: string;
  sourceRepo: string;
  sourcePath: string;
  license: string;
  vectorDocRef: string;
  workedExample?: {
    bodyEn: string;
    bodyFr: string;
  };
  tasks: StudyTask[];
}

// ─── 1. Accredited Open-Source Curricula (CS Unplugged, OSSU, Literacy for Kids, OpenStax) ───

export const CURRICULUM_LESSONS: Record<string, StudyLesson> = {
  // ── Track 0: Visual Geometry & Everyday Shapes (Multimodal CPA Pattern) ───
  math_shapes_1: {
    lessonId: 'math_shapes_1',
    track: 'math_shapes',
    titleEn: '2-D Shapes in Everyday Life',
    titleFr: 'Formes 2D dans la Vie Quotidienne',
    sourceRepo: 'https://github.com/ossu/precollege-math',
    sourcePath: 'geometry/2d-shapes-everyday.md',
    license: 'CC BY-SA 4.0',
    vectorDocRef: 'knowledge/ossu_precollege_mathematics.md',
    workedExample: {
      bodyEn:
        "Let's warm up before we start! 🔢\n\nIn this lesson, we will learn about 2-D shapes that we see in everyday life.\n\n• Square: 4 equal sides\n• Rectangle: opposite sides equal with 90° corners\n• Circle: round with no corners\n• Triangle: 3 straight sides\n\nLet's find the answers together! 💪",
      bodyFr:
        "Échauffons-nous avant de commencer ! 🔢\n\nDans cette leçon, nous découvrons les formes 2D de la vie quotidienne.\n\n• Carré : 4 côtés égaux\n• Rectangle : côtés opposés égaux avec angles droits\n• Cercle : rond sans aucun coin\n• Triangle : 3 côtés droits\n\nTrouvons les réponses ensemble ! 💪",
    },
    tasks: [
      {
        taskId: 'math_shapes_1_task_1',
        conceptKey: 'identify_2d_diagram',
        imageUrl: 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/shapes_2d.jpg',
        explanationEn:
          '2-D shapes are flat shapes that have only length and width. Look at the labeled shapes diagram! 📐',
        explanationFr:
          'Les formes 2D sont des figures plates avec seulement une longueur et une largeur. Regardez le schéma ! 📐',
        questionEn: 'Look at the diagram. Which shape has exactly 3 straight sides?',
        questionFr: 'Regardez le schéma. Quelle forme a exactement 3 côtés droits ?',
        optionsEn: ['A) Triangle', 'B) Circle', 'C) Square', 'D) Rectangle'],
        optionsFr: ['A) Triangle', 'B) Cercle', 'C) Carré', 'D) Rectangle'],
        correctIndex: 0,
        hint1En: 'Count the sides of each shape: Square has 4, Circle has 0 straight sides, Triangle has 3.',
        hint1Fr: 'Comptez les côtés : le carré en a 4, le cercle 0 côté droit, le triangle en a 3.',
        hint2En: '"Tri-" means three! Which shape name starts with Tri?',
        hint2Fr: '« Tri- » signifie trois ! Quelle forme commence par Tri ?',
        workedExampleEn: 'A triangle always has exactly 3 sides and 3 angles! 📐',
        workedExampleFr: 'Un triangle a toujours exactement 3 côtés et 3 angles ! 📐',
        xp: 15,
      },
      {
        taskId: 'math_shapes_1_task_2',
        conceptKey: 'identify_everyday_biscuit',
        imageUrl: 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/biscuit_circle.jpg',
        explanationEn:
          'We see 2-D shapes in everyday objects and snacks around us all the time! 🍪',
        explanationFr:
          'Nous voyons des formes 2D dans les objets et les goûters qui nous entourent ! 🍪',
        questionEn: 'Look at the image. What geometric shape does the given object look like?',
        questionFr: 'Regardez l’image. À quelle forme géométrique ressemble cet objet ?',
        optionsEn: ['A) Circle', 'B) Square', 'C) Rectangle', 'D) Triangle'],
        optionsFr: ['A) Cercle', 'B) Carré', 'C) Rectangle', 'D) Triangle'],
        correctIndex: 0,
        hint1En: 'Does the biscuit have sharp corners, or is it completely round and curved all around? 🍪',
        hint1Fr: 'Le biscuit a-t-il des coins pointus, ou est-il parfaitement rond tout autour ? 🍪',
        hint2En: 'A shape with a continuous round curved line and no straight sides is a circle.',
        hint2Fr: 'Une forme avec une ligne courbe continue sans côté droit est un cercle.',
        workedExampleEn:
          'Spot on! The round Marie biscuit has a continuous curved boundary and no corners — it is a circle! 🍪',
        workedExampleFr:
          'Bravo ! Le biscuit rond a un bord courbe continu sans aucun coin : c’est un cercle ! 🍪',
        xp: 15,
      },
      {
        taskId: 'math_shapes_1_task_3',
        conceptKey: 'identify_everyday_notebook',
        imageUrl: 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/notebook_rectangle.jpg',
        explanationEn:
          'Rectangles have 4 straight sides: 2 long sides and 2 short sides, meeting at 90° corners. 📝',
        explanationFr:
          'Les rectangles ont 4 côtés droits : 2 côtés longs et 2 courts, avec des angles à 90°. 📝',
        questionEn: 'Look at the image. What geometric shape does the given object look like?',
        questionFr: 'Regardez l’image. À quelle forme géométrique ressemble cet objet ?',
        optionsEn: ['A) Circle', 'B) Square', 'C) Rectangle', 'D) Triangle'],
        optionsFr: ['A) Cercle', 'B) Carré', 'C) Rectangle', 'D) Triangle'],
        correctIndex: 2,
        hint1En: 'Notice the height of the paper is longer than its width. Which 4-sided shape is that? 📝',
        hint1Fr: 'Remarquez que la hauteur de la feuille est plus grande que sa largeur. Quelle forme est-ce ? 📝',
        hint2En: 'A shape with 4 right angles and unequal adjacent sides is a rectangle.',
        hint2Fr: 'Une figure à 4 angles droits dont les côtés adjacents ne sont pas égaux est un rectangle.',
        workedExampleEn:
          'Spot on! The lined notebook page has 2 long sides and 2 short sides — it is a rectangle! 📝',
        workedExampleFr:
          'Bravo ! La page de cahier a 2 côtés longs et 2 côtés courts : c’est un rectangle ! 📝',
        xp: 15,
      },
    ],
  },

  // ── Track: Statistics & Mean (Worked Example Warmup Pattern) ─────────────
  math_statistics_mean: {
    lessonId: 'math_statistics_mean',
    track: 'math_foundations',
    titleEn: 'Mean, Median and Mode',
    titleFr: 'Moyenne, Médiane et Mode',
    sourceRepo: 'https://github.com/ossu/precollege-math',
    sourcePath: 'statistics/mean-median-mode.md',
    license: 'MIT',
    vectorDocRef: 'knowledge/ossu_precollege_mathematics.md',
    workedExample: {
      bodyEn:
        "In this set, we'll work on finding the mean of given data.\nWatch how it's done 👇\n\nFind the mean of 7, 2, 3\nMean = (7 + 2 + 3) ÷ 3 = 4\n\nGot it? Great! Now let's solve quick questions! 🚀",
      bodyFr:
        "Dans cette série, nous allons calculer la moyenne d'un ensemble de nombres.\nRegardez l'exemple 👇\n\nCalculer la moyenne de 7, 2, 3\nMoyenne = (7 + 2 + 3) ÷ 3 = 4\n\nCompris ? Super ! Résolvons quelques questions rapides ! 🚀",
    },
    tasks: [
      {
        taskId: 'math_statistics_mean_task_1',
        conceptKey: 'calculate_mean_basic',
        explanationEn:
          'The mean is the average: add all numbers together, then divide by how many numbers there are! 📊',
        explanationFr:
          'La moyenne s’obtient en additionnant tous les nombres, puis en divisant par le nombre total d’éléments ! 📊',
        questionEn: 'Find the mean of the given data:\n5, 11, 14',
        questionFr: 'Calculez la moyenne des nombres suivants :\n5, 11, 14',
        optionsEn: ['A) 10', 'B) 12', 'C) 15', 'D) 8'],
        optionsFr: ['A) 10', 'B) 12', 'C) 15', 'D) 8'],
        correctIndex: 0,
        hint1En: 'Step 1: Add 5 + 11 + 14 = ? Step 2: Divide that total by 3.',
        hint1Fr: 'Étape 1 : Calculez 5 + 11 + 14 = ? Étape 2 : Divisez ce total par 3.',
        hint2En: '5 + 11 + 14 = 30. What is 30 divided by 3?',
        hint2Fr: '5 + 11 + 14 = 30. Combien fait 30 divisé par 3 ?',
        workedExampleEn: '5 + 11 + 14 = 30. Then 30 ÷ 3 = 10. The mean is 10! 🎯',
        workedExampleFr: '5 + 11 + 14 = 30. Puis 30 ÷ 3 = 10. La moyenne est 10 ! 🎯',
        xp: 20,
      },
      {
        taskId: 'math_statistics_mean_task_2',
        conceptKey: 'calculate_mean_consecutive',
        explanationEn:
          'When numbers have an even spread, the mean is right in the center! ⚖️',
        explanationFr:
          'Lorsque les nombres sont espacés régulièrement, la moyenne se trouve pile au centre ! ⚖️',
        questionEn: 'Find the mean of the numbers:\n6, 8, 10',
        questionFr: 'Calculez la moyenne des nombres :\n6, 8, 10',
        optionsEn: ['A) 7', 'B) 8', 'C) 9', 'D) 10'],
        optionsFr: ['A) 7', 'B) 8', 'C) 9', 'D) 10'],
        correctIndex: 1,
        hint1En: 'Add 6 + 8 + 10 = ? and divide by 3.',
        hint1Fr: 'Calculez 6 + 8 + 10 = ? et divisez par 3.',
        hint2En: '6 + 8 + 10 = 24. What is 24 divided by 3?',
        hint2Fr: '6 + 8 + 10 = 24. Combien fait 24 divisé par 3 ?',
        workedExampleEn: '6 + 8 + 10 = 24. 24 ÷ 3 = 8. The mean is 8! 🎯',
        workedExampleFr: '6 + 8 + 10 = 24. 24 ÷ 3 = 8. La moyenne est 8 ! 🎯',
        xp: 20,
      },
    ],
  },

  // ── Track 1: CS Unplugged (Computational Thinking) ──────────────────────
  cs_binary_1: {
    lessonId: 'cs_binary_1',
    track: 'cs_unplugged',
    titleEn: 'Binary Dot Cards (Counting Like Computers)',
    titleFr: 'Cartes à Points Binaires (Compter comme un ordinateur)',
    sourceRepo: 'https://github.com/uccser/cs-unplugged',
    sourcePath: 'csunplugged/topics/content/en/binary-numbers/lessons/how-binary-digits-work.md',
    license: 'CC BY-SA 4.0',
    vectorDocRef: 'knowledge/cs_unplugged_binary.md',
    tasks: [
      {
        taskId: 'cs_binary_1_task_1',
        conceptKey: 'binary_addition_basic',
        explanationEn:
          'Computers only use two digits: 0 and 1! 💡 Imagine 4 cards with dots: [8] [4] [2] [1]. To make 5, you turn ON the 4-card and 1-card (4 + 1 = 5).',
        explanationFr:
          'Les ordinateurs ne comptent qu’avec 0 et 1 ! 💡 Imaginez 4 cartes à points : [8] [4] [2] [1]. Pour faire 5, on allume la carte 4 et la carte 1 (4 + 1 = 5).',
        questionEn: 'Which cards do you turn ON to make the number 6?',
        questionFr: 'Quelles cartes allumez-vous pour faire le nombre 6 ?',
        optionsEn: ['A) 4 + 2', 'B) 4 + 1', 'C) 8 + 2'],
        optionsFr: ['A) 4 + 2', 'B) 4 + 1', 'C) 8 + 2'],
        correctIndex: 0,
        hint1En: 'Look closely at [8, 4, 2, 1]. Which two numbers add up to exactly 6? 🧐',
        hint1Fr: 'Regardez [8, 4, 2, 1]. Quels sont les deux nombres dont la somme fait exactement 6 ? 🧐',
        hint2En: 'Try adding 4 and 2 together: 4 + 2 = ? Does that equal 6?',
        hint2Fr: 'Essayez d’additionner 4 et 2 : 4 + 2 = ? Est-ce égal à 6 ?',
        workedExampleEn: '4 + 2 = 6! In binary with 4 bits [8,4,2,1], that is written as 0110.',
        workedExampleFr: '4 + 2 = 6 ! En binaire avec 4 bits [8,4,2,1], cela s’écrit 0110.',
        xp: 10,
      },
      {
        taskId: 'cs_binary_1_task_2',
        conceptKey: 'binary_doubling_pattern',
        explanationEn:
          'In binary, each card going left has DOUBLE the dots of the previous card: 1, 2, 4, 8...',
        explanationFr:
          'En binaire, chaque carte vers la gauche a le DOUBLE de points de la précédente : 1, 2, 4, 8...',
        questionEn: 'If we add a 5th card to the left of the 8-card, how many dots will it have?',
        questionFr: 'Si on ajoute une 5ème carte à gauche de la carte 8, combien de points aura-t-elle ?',
        optionsEn: ['A) 10 dots', 'B) 12 dots', 'C) 16 dots'],
        optionsFr: ['A) 10 points', 'B) 12 points', 'C) 16 points'],
        correctIndex: 2,
        hint1En: 'Remember the doubling rule: 1 doubled is 2, 2 doubled is 4, 4 doubled is 8...',
        hint1Fr: 'Rappelez-vous la règle du double : 1 doublé fait 2, 2 doublé fait 4, 4 doublé fait 8...',
        hint2En: 'What is 8 multiplied by 2?',
        hint2Fr: 'Combien fait 8 multiplié par 2 ?',
        workedExampleEn: '8 x 2 = 16! The sequence of binary values is 1, 2, 4, 8, 16, 32, 64...',
        workedExampleFr: '8 x 2 = 16 ! La suite binaire est 1, 2, 4, 8, 16, 32, 64...',
        xp: 15,
      },
      {
        taskId: 'cs_binary_1_task_3',
        conceptKey: 'binary_representation_reading',
        explanationEn:
          'A "1" means the card is face UP (counted), and "0" means face DOWN (hidden).',
        explanationFr:
          'Un "1" signifie que la carte est VISIBLE (comptée), et "0" signifie CACHÉE.',
        questionEn: 'What number does the binary code 1001 represent on cards [8, 4, 2, 1]?',
        questionFr: 'Quel nombre représente le code binaire 1001 sur les cartes [8, 4, 2, 1] ?',
        optionsEn: ['A) 9', 'B) 11', 'C) 5'],
        optionsFr: ['A) 9', 'B) 11', 'C) 5'],
        correctIndex: 0,
        hint1En: 'The first card (8) is 1, and the last card (1) is 1. The 4 and 2 cards are 0 (turned off).',
        hint1Fr: 'La première carte (8) est à 1, et la dernière (1) est à 1. Les cartes 4 et 2 sont à 0.',
        hint2En: 'Add only the cards that are ON: 8 + 1 = ?',
        hint2Fr: 'Additionnez seulement les cartes allumées : 8 + 1 = ?',
        workedExampleEn: 'The 8-card and 1-card are ON. 8 + 1 = 9! So 1001 binary = 9 decimal.',
        workedExampleFr: 'La carte 8 et la carte 1 sont allumées. 8 + 1 = 9 ! Donc 1001 = 9.',
        xp: 20,
      },
    ],
  },

  cs_crypto_1: {
    lessonId: 'cs_crypto_1',
    track: 'cs_unplugged',
    titleEn: 'Secret Codes & Caesar Ciphers',
    titleFr: 'Codes Secrets et Chiffre de César',
    sourceRepo: 'https://github.com/uccser/cs-unplugged',
    sourcePath: 'csunplugged/topics/content/en/binary-numbers/lessons/codes-for-letters-using-binary-representation.md',
    license: 'CC BY-SA 4.0',
    vectorDocRef: 'knowledge/cs_unplugged_binary.md',
    tasks: [
      {
        taskId: 'cs_crypto_1_task_1',
        conceptKey: 'caesar_shift_forward',
        explanationEn:
          'Julius Caesar protected messages by shifting every letter forward by a secret key! 🕵️‍♂️ If the key is +1: A becomes B, and B becomes C.',
        explanationFr:
          'Jules César protégeait ses messages en décalant chaque lettre d’une clé secrète ! 🕵️‍♂️ Si la clé est +1 : A devient B, B devient C.',
        questionEn: 'If you shift the secret word "CAT" with key +1, what do you get?',
        questionFr: 'Si vous chiffrez le mot "CAT" avec la clé +1, qu’obtenez-vous ?',
        optionsEn: ['A) DBU', 'B) BBS', 'C) DAE'],
        optionsFr: ['A) DBU', 'B) BBS', 'C) DAE'],
        correctIndex: 0,
        hint1En: 'Shift each letter forward by one letter in the alphabet: C -> ?, A -> ?, T -> ?',
        hint1Fr: 'Avancez chaque lettre d’un cran dans l’alphabet : C -> ?, A -> ?, T -> ?',
        hint2En: 'C becomes D. A becomes B. What letter comes after T in the alphabet?',
        hint2Fr: 'C devient D. A devient B. Quelle lettre vient après T dans l’alphabet ?',
        workedExampleEn: 'C+1=D, A+1=B, T+1=U. The encrypted message is "DBU"!',
        workedExampleFr: 'C+1=D, A+1=B, T+1=U. Le message codé est "DBU" !',
        xp: 15,
      },
    ],
  },

  cs_searching_1: {
    lessonId: 'cs_searching_1',
    track: 'cs_unplugged',
    titleEn: 'Searching: Linear vs. Binary Search',
    titleFr: 'Recherche : Linéaire vs. Binaire',
    sourceRepo: 'https://github.com/uccser/cs-unplugged',
    sourcePath: 'csunplugged/topics/content/en/searching-algorithms/lessons/how-many-guesses.md',
    license: 'CC BY-SA 4.0',
    vectorDocRef: 'knowledge/cs_unplugged_algorithms.md',
    tasks: [
      {
        taskId: 'cs_searching_1_task_1',
        conceptKey: 'binary_search_divide_and_conquer',
        explanationEn:
          'In a sorted phonebook of 1,000,000 names, opening the middle and halving each time (binary search) finds any name in at most 20 guesses! 🔍',
        explanationFr:
          'Dans un annuaire trié de 1 000 000 de noms, ouvrir au milieu et diviser par deux à chaque étape (recherche binaire) trouve n’importe qui en 20 essais maximum ! 🔍',
        questionEn: 'Why MUST a list be sorted before you can use binary search?',
        questionFr: 'Pourquoi une liste DOIT-ELLE être triée pour utiliser la recherche binaire ?',
        optionsEn: [
          'A) To know which half to eliminate',
          'B) To make computer memory run faster',
          'C) It is not required to be sorted',
        ],
        optionsFr: [
          'A) Pour savoir quelle moitié éliminer',
          'B) Pour que la mémoire aille plus vite',
          'C) Le tri n’est pas obligatoire',
        ],
        correctIndex: 0,
        hint1En: 'If names are in random disorder, checking the middle tells you nothing about where the target is hiding.',
        hint1Fr: 'Si la liste est dans le désordre, regarder le milieu n’indique pas de quel côté chercher.',
        hint2En: 'Only when sorted does "greater than" or "less than" let you discard half the remaining search space.',
        hint2Fr: 'Seul le tri permet de déduire avec certitude dans quelle moitié se trouve le mot recherché.',
        workedExampleEn: 'Correct! By comparing against the middle item of a sorted list, you safely eliminate the irrelevant half!',
        workedExampleFr: 'Bravo ! Grâce au tri, comparer à l’élément du milieu permet d’éliminer d’un coup la moitié inutile !',
        xp: 20,
      },
    ],
  },

  // ── Track 2: Math Foundations (OSSU Pre-College Math) ──────
  math_fractions_1: {
    lessonId: 'math_fractions_1',
    track: 'math_foundations',
    titleEn: 'Pizza Fractions & Proportions',
    titleFr: 'Fractions de Pizza et Proportions',
    sourceRepo: 'https://github.com/ossu/precollege-math',
    sourcePath: 'README.md#arithmetic-and-fractions',
    license: 'MIT',
    vectorDocRef: 'knowledge/ossu_precollege_mathematics.md',
    tasks: [
      {
        taskId: 'math_fractions_1_task_1',
        conceptKey: 'fraction_subtraction_visual',
        explanationEn:
          'Imagine a delicious pizza cut into 4 equal slices. 🍕 If you eat 1 slice, you ate 1/4 of the pizza!',
        explanationFr:
          'Imaginez une délicieuse pizza découpée en 4 parts égales. 🍕 Si vous mangez 1 part, vous avez mangé 1/4 de la pizza !',
        questionEn: 'How much of the pizza is LEFT OVER in the box?',
        questionFr: 'Combien de pizza RESTE-T-IL dans la boîte ?',
        optionsEn: ['A) 1/4', 'B) 2/4', 'C) 3/4'],
        optionsFr: ['A) 1/4', 'B) 2/4', 'C) 3/4'],
        correctIndex: 2,
        hint1En: 'The whole pizza has 4 slices. If you take away 1 slice, how many slices are left? 🍕',
        hint1Fr: 'La pizza entière a 4 parts. Si vous en enlevez 1, combien de parts reste-t-il ? 🍕',
        hint2En: '4 slices minus 1 slice = 3 slices. Out of 4 slices total, what fraction is that?',
        hint2Fr: '4 parts moins 1 part = 3 parts. Sur 4 parts au total, quelle fraction cela représente-t-il ?',
        workedExampleEn: '4/4 - 1/4 = 3/4. Exactly three quarters of the pizza remain!',
        workedExampleFr: '4/4 - 1/4 = 3/4. Il reste exactement trois quarts de la pizza !',
        xp: 10,
      },
      {
        taskId: 'math_fractions_1_task_2',
        conceptKey: 'equivalent_fractions',
        explanationEn:
          'Equivalent fractions have different numbers but represent the EXACT same amount of food! ⚖️',
        explanationFr:
          'Les fractions équivalentes ont des nombres différents mais représentent EXACTEMENT la même quantité ! ⚖️',
        questionEn: 'Which fraction is equal to 1/2 (one half)?',
        questionFr: 'Quelle fraction est égale à 1/2 (la moitié) ?',
        optionsEn: ['A) 2/4', 'B) 1/4', 'C) 3/4'],
        optionsFr: ['A) 2/4', 'B) 1/4', 'C) 3/4'],
        correctIndex: 0,
        hint1En: 'If a pizza has 4 slices, how many slices do you eat to eat exactly half the pizza?',
        hint1Fr: 'Si une pizza a 4 parts, combien de parts mangez-vous pour manger la moitié ?',
        hint2En: 'Divide 4 by 2: 4 / 2 = 2. So 2 out of 4 is the same as half!',
        hint2Fr: 'Divisez 4 par 2 : 4 / 2 = 2. Donc 2 parts sur 4, c’est la moitié !',
        workedExampleEn: '2/4 simplifies to 1/2 by dividing top and bottom by 2. They are equal!',
        workedExampleFr: '2/4 se simplifie en 1/2 en divisant haut et bas par 2. Elles sont équivalentes !',
        xp: 15,
      },
      {
        taskId: 'math_fractions_1_task_3',
        conceptKey: 'fraction_of_a_set',
        explanationEn:
          'Fractions also work for groups of items, like fruits at the local market! 🥭',
        explanationFr:
          'Les fractions s’appliquent aussi à des groupes d’objets, comme des fruits au marché ! 🥭',
        questionEn: 'Amadou has 12 oranges. He gives 1/3 of them to his sister. How many oranges does Fatima get?',
        questionFr: 'Amadou a 12 oranges. Il en donne 1/3 à sa sœur. Combien d’oranges Fatima reçoit-elle ?',
        optionsEn: ['A) 3 oranges', 'B) 4 oranges', 'C) 6 oranges'],
        optionsFr: ['A) 3 oranges', 'B) 4 oranges', 'C) 6 oranges'],
        correctIndex: 1,
        hint1En: 'Finding 1/3 of 12 means dividing the 12 oranges into 3 equal piles.',
        hint1Fr: 'Calculer 1/3 de 12, c’est partager 12 oranges en 3 tas égaux.',
        hint2En: 'What is 12 divided by 3? 12 ÷ 3 = ?',
        hint2Fr: 'Combien fait 12 divisé par 3 ? 12 ÷ 3 = ?',
        workedExampleEn: '12 ÷ 3 = 4 oranges! Fatima receives 4 oranges (1/3 of 12).',
        workedExampleFr: '12 ÷ 3 = 4 oranges ! Fatima reçoit 4 oranges (1/3 de 12).',
        xp: 20,
      },
    ],
  },

  math_money_1: {
    lessonId: 'math_money_1',
    track: 'math_foundations',
    titleEn: 'Smart Market Math & Discounts',
    titleFr: 'Calcul Malin au Marché et Remises',
    sourceRepo: 'https://github.com/literacy-for-kids/financial_literacy_for_kids',
    sourcePath: 'website/docs/week10-budgeting.md',
    license: 'CC BY-NC-SA 4.0',
    vectorDocRef: 'knowledge/digital_literacy_for_kids.md',
    tasks: [
      {
        taskId: 'math_money_1_task_1',
        conceptKey: 'percentage_discount_cfa',
        explanationEn:
          'At the school store, a mathematics notebook costs 2,000 FCFA. The shop offers a 50% discount! 🏷️',
        explanationFr:
          'À la papeterie scolaire, un cahier de maths coûte 2 000 FCFA. Le magasin offre 50% de réduction ! 🏷️',
        questionEn: 'How much do you pay after the 50% discount?',
        questionFr: 'Combien payez-vous après la remise de 50% ?',
        optionsEn: ['A) 1,000 FCFA', 'B) 1,500 FCFA', 'C) 500 FCFA'],
        optionsFr: ['A) 1 000 FCFA', 'B) 1 500 FCFA', 'C) 500 FCFA'],
        correctIndex: 0,
        hint1En: 'A 50% discount means exactly HALF PRICE! 💸',
        hint1Fr: 'Une réduction de 50% signifie exactement la MOITIÉ du prix ! 💸',
        hint2En: 'What is half of 2,000 FCFA? 2,000 ÷ 2 = ?',
        hint2Fr: 'Combien vaut la moitié de 2 000 FCFA ? 2 000 ÷ 2 = ?',
        workedExampleEn: '50% of 2,000 FCFA is 1,000 FCFA. You save 1,000 FCFA and pay 1,000 FCFA!',
        workedExampleFr: '50% de 2 000 FCFA font 1 000 FCFA. Vous payez donc 1 000 FCFA !',
        xp: 15,
      },
    ],
  },

  // ── Track 3: Digital Literacy & Safety (Literacy for Kids) ───────────────
  digital_safety_1: {
    lessonId: 'digital_safety_1',
    track: 'digital_literacy',
    titleEn: 'Spotting Scams & Internet Safety',
    titleFr: 'Détecter les Arnaques et Sécurité en Ligne',
    sourceRepo: 'https://github.com/literacy-for-kids/computer_literacy_for_kids',
    sourcePath: 'website/docs/digital-habits-and-safety.md',
    license: 'CC BY-NC-SA 4.0',
    vectorDocRef: 'knowledge/digital_literacy_for_kids.md',
    tasks: [
      {
        taskId: 'digital_safety_1_task_1',
        conceptKey: 'phishing_detection',
        explanationEn:
          'A stranger on WhatsApp texts you: "Congratulations! You won 100,000 FCFA! Send 5,000 FCFA registration fee to claim your prize." 🚨',
        explanationFr:
          'Un inconnu vous envoie un message sur WhatsApp : "Félicitations ! Vous avez gagné 100 000 FCFA ! Envoyez 5 000 FCFA de frais pour retirer le lot." 🚨',
        questionEn: 'What is the SAFEST action to take?',
        questionFr: 'Quelle est la réaction la plus SÛRE ?',
        optionsEn: [
          'A) Send the 5,000 FCFA fee',
          'B) Block and report the sender',
          'C) Ask your friend to test it',
        ],
        optionsFr: [
          'A) Envoyer les 5 000 FCFA de frais',
          'B) Bloquer et signaler l’expéditeur',
          'C) Demander à un ami de tester',
        ],
        correctIndex: 1,
        hint1En: 'Legitimate lotteries and contests NEVER ask you to pay money to receive a prize.',
        hint1Fr: 'Les concours légitimes ne vous demandent JAMAIS d’argent pour recevoir un gain.',
        hint2En: 'This is an advance-fee scam. Protecting yourself means avoiding payment and stopping contact.',
        hint2Fr: 'C’est une tentative d’escroquerie. La meilleure protection est d’arrêter le contact.',
        workedExampleEn: 'Correct! Blocking and reporting immediately protects you and your community from financial fraud.',
        workedExampleFr: 'Bravo ! Bloquer et signaler protège immédiatement votre argent et votre communauté.',
        xp: 15,
      },
    ],
  },

  digital_trade_1: {
    lessonId: 'digital_trade_1',
    track: 'digital_literacy',
    titleEn: 'Trade, Barter & Community Value',
    titleFr: 'Commerce, Troc et Valeur Communautaire',
    sourceRepo: 'https://github.com/literacy-for-kids/financial_literacy_for_kids',
    sourcePath: 'website/docs/week02-trade-and-barter.md',
    license: 'CC BY-NC-SA 4.0',
    vectorDocRef: 'knowledge/digital_literacy_for_kids.md',
    tasks: [
      {
        taskId: 'digital_trade_1_task_1',
        conceptKey: 'barter_double_coincidence',
        explanationEn:
          'In community barter, two people exchange goods directly without cash (like trading a science book for a French dictionary). 📚🔄',
        explanationFr:
          'Dans le troc communautaire, deux personnes échangent directement des biens sans argent liquide (comme échanger un livre de sciences contre un dictionnaire de français). 📚🔄',
        questionEn: 'What is the biggest challenge of direct 1-to-1 barter?',
        questionFr: 'Quelle est la difficulté principale du troc direct 1-à-1 ?',
        optionsEn: [
          'A) Both people must want what the other has',
          'B) Books are not allowed to be traded',
          'C) Barter only works with physical gold coins',
        ],
        optionsFr: [
          'A) Il faut que chacun désire exactement ce que l’autre possède',
          'B) Les livres ne peuvent pas être échangés',
          'C) Le troc nécessite obligatoirement des pièces d’or',
        ],
        correctIndex: 0,
        hint1En: 'Economists call this the "double coincidence of wants".',
        hint1Fr: 'Les économistes appellent cela la "double coïncidence des besoins".',
        hint2En: 'If Sarah has a math book and wants chemistry, but Paul only has physics, they cannot trade directly unless an app matches them.',
        hint2Fr: 'Si Sarah a un livre de maths et veut de la chimie, mais que Paul n’a que de la physique, l’échange direct bloque.',
        workedExampleEn: 'Correct! Direct barter requires a double coincidence of wants, which is why Relay solves this with algorithmic multi-parent matching!',
        workedExampleFr: 'Bravo ! Le troc direct bloque si les besoins ne concordent pas exactement, d’où l’utilité d’un moteur de mise en relation comme Relay !',
        xp: 20,
      },
    ],
  },

  // ── Track 4: STEM OpenStax (Secondary & High School) ──────────────────────
  stem_openstax_1: {
    lessonId: 'stem_openstax_1',
    track: 'stem_openstax',
    titleEn: 'Rates of Change & Real-World Slope',
    titleFr: 'Taux de Variation et Pente Réelle',
    sourceRepo: 'https://github.com/philschatz/calculus-book',
    sourcePath: 'contents/m53576.md',
    license: 'CC BY 4.0',
    vectorDocRef: 'knowledge/openstax_stem_calculus.md',
    tasks: [
      {
        taskId: 'stem_openstax_1_task_1',
        conceptKey: 'rate_of_change_velocity',
        explanationEn:
          'If a bus travels 120 kilometers in 2 hours along the Douala-Yaoundé highway, its average rate of change (velocity) is distance divided by time. 🚌',
        explanationFr:
          'Si un autocar parcourt 120 kilomètres en 2 heures sur l’axe lourd Douala-Yaoundé, son taux de variation moyen (vitesse) est la distance divisée par le temps. 🚌',
        questionEn: 'What was the bus’s average speed?',
        questionFr: 'Quelle était la vitesse moyenne de l’autocar ?',
        optionsEn: ['A) 60 km/h', 'B) 120 km/h', 'C) 240 km/h'],
        optionsFr: ['A) 60 km/h', 'B) 120 km/h', 'C) 240 km/h'],
        correctIndex: 0,
        hint1En: 'Divide 120 km by 2 hours: 120 ÷ 2 = ?',
        hint1Fr: 'Divisez 120 km par 2 heures : 120 ÷ 2 = ?',
        hint2En: 'Half of 120 is 60.',
        hint2Fr: 'La moitié de 120 est 60.',
        workedExampleEn: '120 km ÷ 2 h = 60 km/h! In calculus and physics, velocity is the rate of change of position over time.',
        workedExampleFr: '120 km ÷ 2 h = 60 km/h ! En calcul et physique, la vitesse est le taux de variation de la position.',
        xp: 15,
      },
    ],
  },
};

// ─── 2. Socratic Progress Bar & WhatsApp Message Builders ────────────────

export function buildProgressBar(taskIndex: number, totalTasks: number): string {
  const completed = Math.min(taskIndex, totalTasks);
  const remaining = Math.max(0, totalTasks - completed);
  const percent = Math.round((completed / totalTasks) * 100);
  return `[ ${'🟩 '.repeat(completed)}${'⬜ '.repeat(remaining)}] ${percent}%`;
}

export function formatStudyTaskMessage(params: {
  track: TrackType;
  lesson: StudyLesson;
  taskIndex: number;
  totalTasks: number;
  task: StudyTask;
  streakDays: number;
  points: number;
  lang?: 'en' | 'fr';
}): {
  text: string;
  imageUrl?: string;
  interactive?: {
    type: 'button';
    body: { text: string };
    action: {
      buttons: Array<{
        type: 'reply';
        reply: { id: string; title: string };
      }>;
    };
  };
} {
  const isFr = params.lang === 'fr';
  const trackEmoji =
    params.track === 'math_shapes'
      ? '📐'
      : params.track === 'cs_unplugged'
        ? '💻'
        : params.track === 'math_foundations'
          ? '🔢'
          : '💡';
  const trackTitle =
    params.track === 'math_shapes'
      ? isFr ? 'Formes & Géométrie' : 'Everyday Shapes'
      : params.track === 'cs_unplugged'
        ? isFr ? 'Informatique Sans Ordinateur' : 'CS Unplugged'
        : params.track === 'math_foundations'
          ? isFr ? 'Maths Essentielles' : 'Math Mastery'
          : isFr ? 'Compétences Numériques' : 'Digital Literacy';

  const lessonTitle = isFr ? params.lesson.titleFr : params.lesson.titleEn;
  const explanation = isFr ? params.task.explanationFr : params.task.explanationEn;
  const question = isFr ? params.task.questionFr : params.task.questionEn;
  const options = isFr ? params.task.optionsFr : params.task.optionsEn;

  const bar = buildProgressBar(params.taskIndex + 1, params.totalTasks);
  const streakText = isFr
    ? `Série : 🔥 ${params.streakDays} jour${params.streakDays > 1 ? 's' : ''}`
    : `Streak: 🔥 ${params.streakDays} day${params.streakDays > 1 ? 's' : ''}`;

  const header = [
    '━━━━━━━━━━━━━━━━━━━━━━',
    `${trackEmoji} *${trackTitle} • ${lessonTitle}*`,
    `${bar} • ${streakText}`,
    '━━━━━━━━━━━━━━━━━━━━━━',
  ].join('\n');

  const optionHint =
    options.length > 3
      ? isFr
        ? '👇 _Répondez A, B, C ou D (ou appuyez ci-dessous)_\n_Astuce : Tapez "aide" si vous hésitez !_'
        : '👇 _Reply A, B, C, or D (or tap a button below)_\n_Tip: Type "hint" if you are stuck!_'
      : isFr
        ? '👇 _Cliquez sur un bouton ci-dessous, ou répondez A, B ou C_\n_Astuce : Tapez "aide" si vous hésitez !_'
        : '👇 _Tap a button below, or reply A, B, or C_\n_Tip: Type "hint" if you are stuck!_';

  const body = [
    header,
    '',
    explanation,
    '',
    `❓ *${isFr ? 'Question :' : 'Task:'}*`,
    question,
    '',
    options.join('\n'),
    '',
    optionHint,
  ].join('\n');

  // WhatsApp Button titles are strictly limited to 20 characters, max 3 reply buttons
  const buttons = options.slice(0, 3).map((opt, idx) => {
    const title = opt.length > 20 ? opt.slice(0, 17) + '...' : opt;
    return {
      type: 'reply' as const,
      reply: { id: `learn_opt_${idx}`, title },
    };
  });

  return {
    text: body,
    imageUrl: params.task.imageUrl,
    interactive: {
      type: 'button',
      body: { text: body },
      action: { buttons },
    },
  };
}

export function formatStudyCorrectFeedback(params: {
  task: StudyTask;
  earnedXp: number;
  totalPoints: number;
  streakDays: number;
  hasNextTask: boolean;
  lang?: 'en' | 'fr';
}): { text: string; interactiveButton?: { id: string; title: string } } {
  const isFr = params.lang === 'fr';
  const worked = isFr ? params.task.workedExampleFr : params.task.workedExampleEn;

  const msg = [
    `🎉 *${isFr ? 'EXCELLENT ! C’est la bonne réponse !' : 'SPOT ON! That is correct!'}* 👏`,
    '',
    `💡 *${isFr ? 'Explication :' : 'Why it works:'}*`,
    worked,
    '',
    `🌟 *+${params.earnedXp} ${isFr ? 'Points gagnés !' : 'Points earned!'}* (${isFr ? 'Total :' : 'Total:'} ${params.totalPoints} pts)`,
    `🔥 *${isFr ? 'Série active :' : 'Active Streak:'}* ${params.streakDays} ${isFr ? 'jour(s) d’affilée' : 'day(s) in a row'}!`,
    '',
    params.hasNextTask
      ? isFr
        ? 'Prêt pour le défi suivant ? 🚀'
        : 'Ready for the next challenge? 🚀'
      : isFr
        ? '🏆 Félicitations ! Vous avez terminé cette leçon avec brio !'
        : '🏆 Congratulations! You have completed this lesson with mastery!',
  ].join('\n');

  const buttonTitle = params.hasNextTask
    ? isFr ? 'Suivant 🚀' : 'Next Task 🚀'
    : isFr ? 'Autre matière 📚' : 'Explore Tracks 📚';

  const buttonId = params.hasNextTask ? 'learn_next' : 'learn_menu';

  return {
    text: msg,
    interactiveButton: { id: buttonId, title: buttonTitle },
  };
}

export function formatStudyIncorrectFeedback(params: {
  task: StudyTask;
  attemptCount: number;
  lang?: 'en' | 'fr';
}): string {
  const isFr = params.lang === 'fr';
  const hint =
    params.attemptCount === 1
      ? isFr ? params.task.hint1Fr : params.task.hint1En
      : isFr ? params.task.hint2Fr : params.task.hint2En;

  const encouragement =
    params.attemptCount === 1
      ? isFr
        ? 'Encourageant ! 💡 Ne vous découragez pas :'
        : 'Good effort! 💡 Do not give up :'
      : isFr
        ? 'Presque ! 🧐 Regardons cela ensemble :'
        : 'Almost there! 🧐 Let’s break it down :';

  const options = isFr ? params.task.optionsFr : params.task.optionsEn;

  return [
    `🤔 *${encouragement}*`,
    '',
    hint,
    '',
    `👉 *${isFr ? 'Réessayez !' : 'Try again!'}*`,
    options.join('\n'),
    '',
    isFr
      ? '_Répondez A, B ou C, ou tapez "aide" pour un indice supplémentaire._'
      : '_Reply with A, B, or C, or type "hint" for more guidance._',
  ].join('\n');
}

export function formatStudyHintMessage(task: StudyTask, attemptCount: number, lang: 'en' | 'fr' = 'en'): string {
  const isFr = lang === 'fr';
  const hint = attemptCount <= 1
    ? isFr ? task.hint1Fr : task.hint1En
    : isFr ? task.hint2Fr : task.hint2En;

  return [
    `💡 *${isFr ? 'Indice Socratique :' : 'Socratic Hint:'}*`,
    '',
    hint,
    '',
    isFr
      ? 'Prenez votre temps pour réfléchir, puis tapez votre choix (A, B ou C) !'
      : 'Take your time to think it through, then reply with your choice (A, B, or C)!',
  ].join('\n');
}

export function formatGrowthMindsetMessage(lang: 'en' | 'fr' = 'en'): string {
  if (lang === 'fr') {
    return [
      '🌟 *Respirez un grand coup ! Vous en êtes tout à fait capable.*',
      '',
      'Le cerveau fonctionne exactement comme un muscle : il grandit et se renforce précisément chaque fois qu’on hésite ou qu’on se trompe sur un problème nouveau !',
      '',
      'Personne ne naît génie des maths ou du code. Tout s’acquiert avec de la pratique et de la patience. Faisons ce défi ensemble pas à pas ! 💪',
      '',
      'Tapez *"continuer"* ou votre réponse quand vous êtes prêt !',
    ].join('\n');
  }

  return [
    '🌟 *Take a deep breath! You are completely capable of mastering this.*',
    '',
    'Your brain works just like a muscle: it gets stronger and sharper every single time you struggle through a problem that feels new or difficult!',
    '',
    'Nobody is born an instant math genius or programmer. It comes with small daily practice. Let’s tackle this challenge together step by step! 💪',
    '',
    'Reply with *"continue"* or your answer whenever you are ready!',
  ].join('\n');
}

export function buildTrackSelectionInteractive(lang: 'en' | 'fr' = 'en') {
  const isFr = lang === 'fr';
  const bodyText = isFr
    ? '👋 *Bienvenue sur Relay Learn !*\n\nChoisissez la matière que vous souhaitez explorer aujourd’hui avec votre tuteur IA :'
    : '👋 *Welcome to Relay Learn!*\n\nChoose what you would like to explore today with your personal AI tutor:';

  return {
    type: 'button' as const,
    body: { text: bodyText },
    action: {
      buttons: [
        {
          type: 'reply' as const,
          reply: {
            id: 'learn_track_shapes',
            title: isFr ? '1️⃣ Formes 2D 📐' : '1️⃣ Shapes & 2D 📐',
          },
        },
        {
          type: 'reply' as const,
          reply: {
            id: 'learn_track_math',
            title: isFr ? '2️⃣ Maths Essent. 🍕' : '2️⃣ Math Mastery 🍕',
          },
        },
        {
          type: 'reply' as const,
          reply: {
            id: 'learn_track_cs',
            title: isFr ? '3️⃣ Informatique 💻' : '3️⃣ CS Unplugged 💻',
          },
        },
      ],
    },
  };
}

export function buildOnboardingWelcomeInteractive(lang: 'en' | 'fr' = 'en') {
  const isFr = lang === 'fr';
  const text = isFr
    ? `👋 *Bienvenue sur Relay Learn !*\n\nVotre tuteur IA Socratique *gratuit* sur WhatsApp, avec explications pas à pas du primaire au lycée !\n\nVoici ce que vous pouvez faire :\n📚 *Menu des cours* (Formes, Maths, Informatique)\n📝 *Test de niveau* (Trouvez votre niveau)\n💬 *Tuteur Socratique* (Aide pas à pas)\n📊 *Rapport de progrès* (Séries & points)\n🔍 *Recherche par thème*\n\nPrêt à commencer ?`
    : `👋 *Welcome to Relay Learn!*\n\nYour *free* personal Socratic AI Tutor on WhatsApp, providing personalized guidance from primary through high school!\n\nHere is what you can do:\n📚 *Curriculum Menu* (Shapes, Math, CS)\n📝 *Level Finder Quiz* (Find your level)\n💬 *AI Socratic Tutor* (Step-by-step help)\n📊 *Progress Report* (Streaks & badges)\n🔍 *Topic Finder* (Search topics)\n\nReady to get started?`;

  return {
    type: 'button' as const,
    body: { text },
    action: {
      buttons: [
        { type: 'reply' as const, reply: { id: 'onboard_start', title: isFr ? 'C’est parti ! 🚀' : "Let's go! 🚀" } },
        { type: 'reply' as const, reply: { id: 'onboard_start', title: isFr ? 'Compris 👍' : 'Got it 👍' } },
      ],
    },
  };
}

export function buildRoleSelectionInteractive(lang: 'en' | 'fr' = 'en') {
  const isFr = lang === 'fr';
  const text = isFr
    ? `Ravis de vous accueillir ! 🎉\n\nPour commencer, complétons deux sections rapides :\n📍 *Consentement* & *Profil élève*\n\nPremière étape : quel rôle vous décrit le mieux ?`
    : `We're excited too! 🎉\n\nTo get started, we need to complete two quick sections:\n📍 *Consent* & *Student Profile*\n\nFirst things first, which role describes you best?`;

  return {
    type: 'button' as const,
    body: { text },
    action: {
      buttons: [
        { type: 'reply' as const, reply: { id: 'onboard_role_student', title: isFr ? 'Élève' : 'Student' } },
        { type: 'reply' as const, reply: { id: 'onboard_role_parent', title: isFr ? 'Parent/Tuteur' : 'Parent/Guardian' } },
        { type: 'reply' as const, reply: { id: 'onboard_role_tutor', title: isFr ? 'Enseignant' : 'Tutor/School' } },
      ],
    },
  };
}

export function buildAgeVerificationInteractive(lang: 'en' | 'fr' = 'en') {
  const isFr = lang === 'fr';
  const text = isFr
    ? `Merci ! 😊 Nous devons nous assurer de respecter les règles de sécurité.\n\nBienvenue ! Avez-vous plus de 18 ans ?`
    : `Thanks! 😊 We just need to make sure we have proper safety permission.\n\nWelcome! Are you over 18?`;

  return {
    type: 'button' as const,
    body: { text },
    action: {
      buttons: [
        { type: 'reply' as const, reply: { id: 'onboard_age_yes', title: isFr ? 'Oui' : 'Yes' } },
        { type: 'reply' as const, reply: { id: 'onboard_age_no', title: isFr ? 'Non' : 'No' } },
      ],
    },
  };
}

export function buildPhoneOwnershipInteractive(lang: 'en' | 'fr' = 'en') {
  const isFr = lang === 'fr';
  const text = isFr
    ? `D’accord, merci d’avoir confirmé 👍\n\nUne question rapide : à qui appartient le téléphone que vous utilisez ?`
    : `Awesome! 😊 Just a quick one — whose phone are you currently using?`;

  return {
    type: 'button' as const,
    body: { text },
    action: {
      buttons: [
        { type: 'reply' as const, reply: { id: 'onboard_phone_self', title: isFr ? 'Mon téléphone' : 'My phone' } },
        { type: 'reply' as const, reply: { id: 'onboard_phone_parent', title: isFr ? 'Tél. parent' : "Parent's phone" } },
        { type: 'reply' as const, reply: { id: 'onboard_phone_other', title: isFr ? 'Autre personne' : "Someone Else's" } },
      ],
    },
  };
}

export function buildGoalSelectionInteractive(lang: 'en' | 'fr' = 'en') {
  const isFr = lang === 'fr';
  const text = isFr
    ? `Merci pour le partage ! 📱 Pourquoi souhaitez-vous utiliser Relay Learn ?\n\nVous souhaitez :`
    : `Thank you for sharing! 📱 Now, why do you want to use Relay Learn? Are you looking to:`;

  return {
    type: 'button' as const,
    body: { text },
    action: {
      buttons: [
        { type: 'reply' as const, reply: { id: 'onboard_goal_marks', title: isFr ? 'Améliorer notes 💯' : 'Improve marks 💯' } },
        { type: 'reply' as const, reply: { id: 'onboard_goal_exams', title: isFr ? 'Préparer examens 📚' : 'Prepare exams 📚' } },
        { type: 'reply' as const, reply: { id: 'onboard_goal_fun', title: isFr ? 'Pour le plaisir ! 🥳' : 'Just for fun! 🥳' } },
      ],
    },
  };
}

export function buildConsentInteractive(lang: 'en' | 'fr' = 'en') {
  const isFr = lang === 'fr';
  const text = isFr
    ? `Super ! 💪 Pour utiliser Relay Learn en toute sécurité, acceptez-vous notre Politique de Confidentialité et d’échanger sur ce numéro WhatsApp ?`
    : `Great! 💪 To use Relay Learn safely, do you accept our Terms of Use & Privacy Policy and agree to chat on this WhatsApp number?`;

  return {
    type: 'button' as const,
    body: { text },
    action: {
      buttons: [
        { type: 'reply' as const, reply: { id: 'onboard_consent_yes', title: isFr ? 'Oui ✅' : 'Yes ✅' } },
        { type: 'reply' as const, reply: { id: 'onboard_consent_no', title: isFr ? 'Non ❌' : 'No ❌' } },
      ],
    },
  };
}

export function formatWarmupMessage(lesson: StudyLesson, lang: 'en' | 'fr' = 'en'): {
  text: string;
  interactive: {
    type: 'button';
    body: { text: string };
    action: { buttons: Array<{ type: 'reply'; reply: { id: string; title: string } }> };
  };
} {
  const isFr = lang === 'fr';
  const body =
    (isFr ? lesson.workedExample?.bodyFr : lesson.workedExample?.bodyEn) ||
    (isFr ? 'Prêt à commencer cette leçon ?' : 'Ready to start this lesson?');

  return {
    text: body,
    interactive: {
      type: 'button',
      body: { text: body },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'learn_warmup_start', title: isFr ? 'Commencer ! 🚀' : 'Start lesson! 🚀' } },
          { type: 'reply', reply: { id: 'learn_warmup_start', title: isFr ? 'D’accord 👍' : 'Sounds good 😊' } },
        ],
      },
    },
  };
}

export function formatProgressReport(params: {
  phone: string;
  points: number;
  streakDays: number;
  totalAnswered: number;
  totalCorrect: number;
  level?: number;
  lang?: 'en' | 'fr';
}): string {
  const isFr = params.lang === 'fr';
  const clean = params.phone.replace(/\D/g, '');
  const accuracy =
    params.totalAnswered > 0 ? Math.round((params.totalCorrect / params.totalAnswered) * 100) : 0;
  const levelNum = params.level || 2;
  const levelLabel =
    levelNum === 1
      ? isFr ? 'Niveau 1 (Fondations)' : 'Level 1 (Foundations)'
      : levelNum === 2
        ? isFr ? 'Niveau 2 (Intermédiaire)' : 'Level 2 (Intermediate)'
        : isFr ? 'Niveau 3 (Avancé)' : 'Level 3 (Advanced)';

  return isFr
    ? [
        '📊 *RELAY LEARN • RAPPORT DE PROGRESSION*',
        '',
        `👤 *Élève :* Élève ${clean.slice(-4) || 'Apprenant'}`,
        `🏆 *Niveau actuel :* ${levelLabel}`,
        `🔥 *Série active :* ${params.streakDays} jour(s) consécutif(s) !`,
        `🌟 *Points XP :* ${params.points} pts`,
        `🎯 *Précision :* ${accuracy}% (${params.totalCorrect}/${params.totalAnswered} correctes)`,
        '',
        '📚 *Matières en cours :*',
        '• 📐 Formes & Géométrie 2D (Visuel)',
        '• 🍕 Fractions & Proportions (OSSU Math)',
        '• 💻 Binaire & Algorithmes (CS Unplugged)',
        '',
        '_Tapez "menu" pour choisir un cours, ou "stop" pour terminer aujourd’hui !_',
      ].join('\n')
    : [
        '📊 *RELAY LEARN • PROGRESS REPORT*',
        '',
        `👤 *Learner:* Student ${clean.slice(-4) || 'Learner'}`,
        `🏆 *Current Level:* ${levelLabel}`,
        `🔥 *Active Streak:* ${params.streakDays} day(s) in a row!`,
        `🌟 *Total XP:* ${params.points} pts`,
        `🎯 *Accuracy:* ${accuracy}% (${params.totalCorrect}/${params.totalAnswered} correct)`,
        '',
        '📚 *Current Active Tracks:*',
        '• 📐 2-D Everyday Shapes (Visual)',
        '• 🍕 Pizza Fractions & Proportions (OSSU Math)',
        '• 💻 Binary Dot Cards & Logic (CS Unplugged)',
        '',
        '_Tip: Type "menu" to pick a lesson, or "stop" to finish for the day!_',
      ].join('\n');
}

export function formatStopSessionMessage(streakDays: number, lang: 'en' | 'fr' = 'en'): string {
  const isFr = lang === 'fr';
  return isFr
    ? [
        '🏁 *PROGRÈS ENREGISTRÉ !*',
        '',
        `Super travail aujourd’hui ! Votre série est verrouillée à 🔥 *${streakDays} jour(s)*.`,
        'Reposez-vous bien et tapez *"learn"* demain pour continuer votre série ! 💪',
      ].join('\n')
    : [
        '🏁 *PROGRESS SAVED!*',
        '',
        `Awesome work today! Your streak is safely locked in at 🔥 *${streakDays} day(s)*.`,
        'Take a well-deserved break and reply *"learn"* tomorrow to keep your streak alive! 💪',
      ].join('\n');
}
