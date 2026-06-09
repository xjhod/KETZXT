// ============================================================
// KET 阅读理解模块 - 数据文件
// 包含 KET Reading Part 1–5 共 5 大题型
// ============================================================

// ==================== 类型定义 ====================

/** Part 1: 看图配对 — 5 张图 + 8 个文本选项，选出每张图对应的句子 */
export interface Part1Question {
  id: string;
  /** 图片描述（用 emoji 或文字表示图片内容） */
  imageDesc: string;
  /** 图片 emoji */
  emoji: string;
  options: string[];       // 8 个句子选项（含干扰项）
  answer: string;          // 正确的句子
}

export interface Part1Article {
  id: string;
  title: string;
  titleZh: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  questions: Part1Question[];
}

/** Part 2: 信息匹配 — 5 个人物 + 8 则信息，匹配谁需要什么 */
export interface PersonProfile {
  id: string;              // A, B, C, D, E
  name: string;
  age?: number;
  description: string;     // 人物描述（英文）
  descriptionZh: string;   // 中文翻译
}

export interface InfoPiece {
  id: string;              // 1-8
  text: string;            // 信息文本
  textZh: string;          // 中文
}

export interface Part2Article {
  id: string;
  title: string;
  titleZh: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  people: PersonProfile[];
  infoPieces: InfoPiece[];
  answers: Record<string, string>; // personId -> infoId
}

/** Part 3-1: 完形填空 — 短文 + 6 个空格，三选一 */
export interface ClozeBlank {
  id: string;              // blank id
  position: number;        // 在文章中的顺序位置
  options: string[];       // 3 个选项
  answer: string;          // 正确答案
  explanation: string;     // 解析
}

export interface Part3ClozeArticle {
  id: string;
  title: string;
  titleZh: string;
  passage: string;         // 完整短文（空格用 ____ 表示）
  passageFull: string;     // 完整短文（填好答案，用于展示解析）
  blanks: ClozeBlank[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

/** Part 3-2: 阅读理解选择题 — 文章 + 7 道四选一 */
export interface ReadingChoice {
  id: string;
  question: string;
  questionZh: string;
  options: string[];       // 4 个选项 A/B/C/D
  answer: string;          // 正确答案字母或文字
  explanation: string;     // 解析
}

export interface Part3RCArticle {
  id: string;
  title: string;
  titleZh: string;
  article: string;         // 文章正文
  articleZh: string;       // 中文参考译文
  questions: ReadingChoice[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

/** Part 4/5: 正误判断 — 长文 + T/F/DN 陈述 */
export interface TFStatement {
  id: string;
  statement: string;       // 陈述句
  statementZh: string;     // 中文
  answer: 'T' | 'F' | 'DN'; // True / False / Does Not Say
  evidence: string;        // 依据（T/F 时给出原文定位）
  explanation: string;     // 解析
}

export interface Part4TFArticle {
  id: string;
  title: string;
  titleZh: string;
  article: string;         // 文章正文
  articleZh: string;       // 中文参考译文
  statements: TFStatement[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

/** 统一的阅读题目格式（用于综合测验） */
export interface ReadingQuizItem {
  id: string;
  partType: 1 | 2 | '3c' | '3r' | 4;
  articleId: string;
  questionData: any;      // 各题型的具体数据
}

// ==================== Part 1: 看图配对数据 ====================

export const part1Articles: Part1Article[] = [
  {
    id: 'p1-001',
    title: 'Daily Activities',
    titleZh: '日常活动',
    difficulty: 'easy',
    topic: '日常生活',
    questions: [
      {
        id: 'p1q001-1', emoji: '🏃', imageDesc: '一个男孩正在跑步',
        options: [
          'The boy is swimming in the pool.',
          'The boy is running in the park.',
          'The boy is riding a bicycle.',
          'A girl is playing football.',
          'They are having breakfast.',
          'The man is reading a book.',
          'She is cooking dinner.',
          'It is raining heavily.',
        ],
        answer: 'The boy is running in the park.',
      },
      {
        id: 'p1q001-2', emoji: '📚', imageDesc: '一个女孩在图书馆看书',
        options: [
          'The girl is playing the piano.',
          'The girl is studying in the library.',
          'The girl is eating an apple.',
          'The boy is playing basketball.',
          'They are watching TV.',
          'She is sleeping in bed.',
          'The cat is on the table.',
          'It is a sunny day.',
        ],
        answer: 'The girl is studying in the library.',
      },
      {
        id: 'p1q001-3', emoji: '🍎', imageDesc: '一个苹果',
        options: [
          'There is a banana.',
          'There is an apple.',
          'There is an orange.',
          'There is a watermelon slice.',
          'There is a pineapple.',
          'There is a bunch of grapes.',
          'There is a strawberry.',
        ],
        answer: 'There is an apple.',
      },
      {
        id: 'p1q001-4', emoji: '⚽', imageDesc: '一个男孩在打乒乓球',
        options: [
          'The boy is playing football.',
          'The boy is playing table tennis.',
          'The boy is playing basketball.',
          'The girl is dancing.',
          'They are playing badminton.',
          'He is swimming.',
          'She is running.',
          'They are playing volleyball.',
        ],
        answer: 'The boy is playing table tennis.',
      },
      {
        id: 'p1q001-5', emoji: '🐱', imageDesc: '一只猫在睡觉',
        options: [
          'The dog is running.',
          'The cat is sleeping.',
          'The bird is flying.',
          'The fish is swimming.',
          'The rabbit is eating.',
          'The horse is running.',
          'The duck is swimming.',
        ],
        answer: 'The cat is sleeping.',
      },
      {
        id: 'p1q001-6', emoji: '🏠', imageDesc: '一座房子',
        options: [
          'This is a school.',
          'This is a house.',
          'This is a shop.',
          'This is a park.',
          'This is a library.',
          'This is a hospital.',
          'This is a restaurant.',
        ],
        answer: 'This is a house.',
      },
      {
        id: 'p1q001-7', emoji: '🌧️', imageDesc: '正在下雨',
        options: [
          'It is sunny.',
          'It is raining.',
          'It is snowing.',
          'It is windy.',
          'It is cloudy.',
          'It is hot.',
          'It is cold.',
        ],
        answer: 'It is raining.',
      },
      {
        id: 'p1q001-8', emoji: '🍕', imageDesc: '一个披萨',
        options: [
          'There is a hamburger.',
          'There is a pizza.',
          'There is a sandwich.',
          'There is a cake.',
          'There is a salad.',
          'There is a bowl of rice.',
          'There is a plate of noodles.',
          'There is a piece of bread.',
        ],
        answer: 'There is a pizza.',
      },
    ],
  },
];

// ==================== Part 2: 信息匹配数据 ====================

export const part2Articles: Part2Article[] = [
  {
    id: 'p2-001',
    title: 'After-School Clubs',
    titleZh: '课外俱乐部',
    difficulty: 'easy',
    topic: '兴趣爱好',
    people: [
      { id: 'A', name: 'Anna', age: 12, description: 'Anna loves being outdoors. She wants to learn a new sport that she can do with her friends after school.', descriptionZh: 'Anna 喜欢户外活动，想学一项能和朋友一起做的运动。' },
      { id: 'B', name: 'Ben', age: 13, description: 'Ben enjoys working with his hands. He would like to make things using wood and tools.', descriptionZh: 'Ben 喜欢动手做东西，想用木材和工具制作物品。' },
      { id: 'C', name: 'Clara', age: 11, description: 'Clara is good at drawing. She wants to join a club where she can use colours and paint pictures.', descriptionZh: 'Clara 擅长画画，想加入能用颜料画画的社团。' },
      { id: 'D', name: 'David', age: 14, description: 'David likes helping people. He is interested in learning about first aid and keeping safe.', descriptionZh: 'David 喜欢帮助他人，对急救和安全知识感兴趣。' },
      { id: 'E', name: 'Emma', age: 12, description: 'Emma loves music and can play the piano a little. She wants to get better at it.', descriptionZh: 'Emma 热爱音乐，会一点钢琴，想提高水平。' },
    ],
    infoPieces: [
      { id: '1', text: 'Learn to make beautiful things from wood like boxes and toys.', textZh: '用木材制作盒子和玩具等精美物品。' },
      { id: '2', text: 'Practise passing, shooting and scoring goals in team games.', textZh: '练习传球、射门和在团队比赛中得分。' },
      { id: '3', text: 'Bring your own instrument and learn songs with other students.', textZh: '带上你的乐器，和其他学生一起学歌曲。' },
      { id: '4', text: 'Find out what to do when someone is hurt or not feeling well.', textZh: '了解当有人受伤或不适时该怎么做。' },
      { id: '5', text: 'Create colourful paintings using different art materials.', textZh: '使用不同的艺术材料创作彩色绘画。' },
      { id: '6', text: 'Learn how to use a camera and take great photos.', textZh: '学习如何使用相机并拍出好照片。' },
      { id: '7', text: 'Practice speaking English with native speakers after school.', textZh: '放学后和母语者练习说英语。' },
      { id: '8', text: 'Learn to cook simple dishes and bake cookies.', textZh: '学习烹饪简单的菜肴和烤饼干。' },
    ],
    answers: { A: '2', B: '1', C: '5', D: '4', E: '3' },
  },
];

// ==================== Part 3-1: 完形填空数据 ====================

export const part3ClozeArticles: Part3ClozeArticle[] = [
  {
    id: 'p3c-001',
    title: 'A Day at School',
    titleZh: '学校的一天',
    passage: `My name is Tom and I am 12 years old. I go to Greenwood School. Every morning, I ____ (1) up at 7 o'clock. I have breakfast with my family and then I ____ (2) to school. School ____ (3) at 8:30 am. My favourite ____ (4) is English because I like reading books. After school, I usually ____ (5) football with my friends. I ____ (6) home at 5 pm.`,
    passageFull: `My name is Tom and I am 12 years old. I go to Greenwood School. Every morning, I get (1) up at 7 o'clock. I have breakfast with my family and then I go (2) to school. School starts (3) at 8:30 am. My favourite subject (4) is English because I like reading books. After school, I usually play (5) football with my friends. I arrive (6) home at 5 pm.`,
    blanks: [
      { id: 'b001-1', position: 1, options: ['get', 'sit', 'stand'], answer: 'get', explanation: 'get up 是固定搭配，意为"起床"' },
      { id: 'b001-2', position: 2, options: ['walk', 'go', 'run'], answer: 'go', explanation: 'go to school 是常用表达' },
      { id: 'b001-3', position: 3, options: ['starts', 'finishes', 'breaks'], answer: 'starts', explanation: '学校早上8:30开始上课' },
      { id: 'b001-4', position: 4, options: ['teacher', 'subject', 'classroom'], answer: 'subject', explanation: 'English 是一门学科(subject)' },
      { id: 'b001-5', position: 5, options: ['play', 'watch', 'study'], answer: 'play', explanation: 'play football 是固定搭配' },
      { id: 'b001-6', position: 6, options: ['arrive', 'leave', 'stay'], answer: 'arrive', explanation: '下午5点到达家' },
    ],
    difficulty: 'easy',
    topic: '学校生活',
  },
];

// ==================== Part 3-2: 阅读理解选择题数据 ====================

export const part3RCArticles: Part3RCArticle[] = [
  {
    id: 'p3r-001',
    title: 'My Family',
    titleZh: '我的家庭',
    article: `I live in a small house with my family. There are four people in my family: my dad, my mum, my sister and me. My dad is a teacher. He teaches maths at a secondary school. My mum is a doctor. She works at the local hospital. My sister is 16 years old and she loves music. She can play the guitar and sings in the school choir. I am 12 years old and I like sports. My favourite sport is swimming. Every Saturday, our family goes to the park. We have a picnic and play games together. I love my family very much.`,
    articleZh: `我住在一个小房子里，和我的家人一起。我家有四口人：爸爸、妈妈、姐姐和我。我爸爸是老师。他在一所中学教数学。我妈妈是医生。她在当地医院工作。我姐姐16岁了，她热爱音乐。她会弹吉他，还在学校合唱团唱歌。我12岁，喜欢运动。我最喜欢的运动是游泳。每个星期六，我们家会去公园。我们野餐，一起玩游戏。我非常爱我的家人。`,
    questions: [
      { id: 'rc001-1', question: 'How many people are in the writer\'s family?', questionZh: '作者家有几口人？', options: ['Three', 'Four', 'Five', 'Six'], answer: 'Four', explanation: '原文明确提到四口人：dad, mum, sister, me。' },
      { id: 'rc001-2', question: 'What does the writer\'s dad teach?', questionZh: '作者的爸爸教什么？', options: ['English', 'Science', 'Maths', 'History'], answer: 'Maths', explanation: '原文说"He teaches maths at a secondary school"。' },
      { id: 'rc001-3', question: 'Where does the writer\'s mum work?', questionZh: '作者的妈妈在哪里工作？', options: ['At a school', 'At a hospital', 'At a shop', 'At a park'], answer: 'At a hospital', explanation: '原文说"She works at the local hospital"。' },
      { id: 'rc001-4', question: 'How old is the writer\'s sister?', questionZh: '作者的姐姐几岁？', options: ['12', '14', '16', '18'], answer: '16', explanation: '原文说"My sister is 16 years old"。' },
      { id: 'rc001-5', question: 'What is the writer\'s favourite sport?', questionZh: '作者最喜欢的运动是什么？', options: ['Football', 'Basketball', 'Swimming', 'Tennis'], answer: 'Swimming', explanation: '原文说"My favourite sport is swimming"。' },
      { id: 'rc001-6', question: 'What do they do every Saturday?', questionZh: '他们每个星期六做什么？', options: ['Go to school', 'Go to the park', 'Go shopping', 'Go to the cinema'], answer: 'Go to the park', explanation: '原文说"Every Saturday, our family goes to the park"。' },
      { id: 'rc001-7', question: 'What can the writer\'s sister do?', questionZh: '作者的姐姐会做什么？', options: ['Play the piano', 'Play the guitar', 'Play basketball', 'Play football'], answer: 'Play the guitar', explanation: '原文说"She can play the guitar"。' },
    ],
    difficulty: 'easy',
    topic: '家庭生活',
  },
];

// ==================== Part 4/5: 正误判断数据 ====================

export const part4TFArticles: Part4TFArticle[] = [
  {
    id: 'p4-001',
    title: 'Sarahs Summer Job',
    titleZh: 'Sarah 的暑期工作',
    article: `During the summer holidays, Sarah decided to get a job. She was fifteen years old and wanted to earn some money to buy a new bike.

Sarah found a job at a pet shop called "Happy Pets". The owner, Mr Thompson, needed someone to help on Saturday mornings and all day Sunday. Sarah loves animals, so she thought this job would be perfect for her.

Her job included feeding the animals, cleaning their cages, and talking to customers who wanted to buy a pet. Sometimes she also helped bathe small dogs. Mr Thompson paid her £6 per hour. She worked about 16 hours each weekend, so she earned almost £100 every week.

Working at the pet shop taught Sarah many things. She learned how to take care of different animals – rabbits, hamsters, birds, and fish. She also became more confident when talking to adults. By the end of August, Sarah had saved enough money for her new bike. But she decided to keep working at the pet shop because she enjoyed it so much.`,
    articleZh: `暑假期间，Sarah 决定找份工作。她15岁了，想赚点钱买辆新自行车。

Sarah 在一家叫"快乐宠物"的宠物店找到了一份工作。店主 Thompson 先生需要有人在周六上午和周日全天帮忙。Sarah 喜欢动物，所以觉得这份工作非常适合她。

她的工作包括喂动物、打扫笼子和想买宠物的顾客交谈。有时她还帮忙给小狗洗澡。Thompson 先生每小时付她6英镑。她每个周末大约工作16小时，所以每周差不多赚100英镑。

在宠物店工作教会了 Sarah 很多事。她学会了如何照顾不同的动物——兔子、仓鼠、鸟和鱼。她在和大人交谈时也更自信了。到八月底，Sarah 存够了买新自行车的钱。但她决定继续在宠物店工作，因为她太喜欢这份工作了。`,
    statements: [
      { id: 'tf001-1', statement: 'Sarah wanted to buy a new car.', statementZh: 'Sarah 想买一辆新车。', answer: 'F', evidence: 'wanted to earn some money to buy a new bike', explanation: '原文说的是"buy a new bike"（自行车），不是 car（汽车）。' },
      { id: 'tf001-2', statement: 'Happy Pets is the name of a pet shop.', statementZh: '"快乐宠物"是一家宠物店的名字。', answer: 'T', evidence: 'found a job at a pet shop called "Happy Pets"', explanation: '原文明确提到"pet shop called Happy Pets"。' },
      { id: 'tf001-3', statement: 'Mr Thompson is Sarahs uncle.', statementZh: 'Thompson 先生是 Sarah 的叔叔。', answer: 'F', evidence: 'The owner, Mr Thompson', explanation: '原文只说他是店主(owner)，没有说是 Sarah 的亲戚。' },
      { id: 'tf001-4', statement: 'Sarah worked 16 hours every week.', statementZh: 'Sarah 每周工作16小时。', answer: 'F', evidence: 'worked about 16 hours each weekend', explanation: '原文说的是"每个周末"(each weekend)16小时，不是每周都工作。' },
      { id: 'tf001-5', statement: 'Sarah can cook three dishes.', statementZh: 'Sarah 会做三道菜了。', answer: 'F', evidence: 'can cook three dishes', explanation: '这是在说另一篇文章的内容，不是 Sarah 的故事。' },
      { id: 'tf001-6', statement: 'The writer wants to be a teacher.', statementZh: '作者想当老师。', answer: 'F', evidence: 'want to be a photographer', explanation: '原文说想当"摄影师"(photographer)，不是老师。' },
    ],
    difficulty: 'easy',
    topic: '日常生活',
  },
];

// ==================== 所有阅读文章汇总 ====================

export const allReadingArticles = {
  part1: part1Articles,
  part2: part2Articles,
  part3Cloze: part3ClozeArticles,
  part3RC: part3RCArticles,
  part4TF: part4TFArticles,
};
