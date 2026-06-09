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


  // ==================== 新增 medium 难度文章 ====================
  // 生成于 2026-06-09
  // 共10篇：p3c-011 到 p3c-020

// ==================== 新增完形填空(medium难度) ====================
// 生成于 2026-06-09
// 共10篇：p3c-011 到 p3c-020

  {
    id: 'p3c-011',
    title: 'A School Trip to the Museum',
    titleZh: '学校博物馆之旅',
    passage: `Last week, our class went on a trip to the (1) ____. We left school at 8 o'clock in the morning. The (2) ____ took one hour. When we arrived, we saw many interesting things. First, we saw old (3) ____ from thousands of years ago. Then we saw dinosaur bones. They were huge! After that, we went to the art (4) ____ and saw beautiful paintings. My favourite was a painting of a sunset. At the (5) ____ of the trip, we bought souvenirs from the gift shop. I bought a (6) ____. I learned a lot from this trip.`,
    passageFull: `Last week, our class went on a trip to the museum (1). We left school at 8 o'clock in the morning. The journey (2) took one hour. When we arrived, we saw many interesting things. First, we saw old coins (3) from thousands of years ago. Then we saw dinosaur bones. They were huge! After that, we went to the art section (4) and saw beautiful paintings. My favourite was a painting of a sunset. At the end (5) of the trip, we bought souvenirs from the gift shop. I bought a postcard (6). I learned a lot from this trip.`,
    blanks: [
      {
        id: 'b011-1',
        position: 1,
        options: ["museum", "park", "zoo", "beach"],
        answer: 'museum',
        explanation: '根据下文，是去博物馆',
      },
      {
        id: 'b011-2',
        position: 2,
        options: ["journey", "bus", "car", "bike"],
        answer: 'journey',
        explanation: '旅程花了一小时',
      },
      {
        id: 'b011-3',
        position: 3,
        options: ["coins", "books", "toys", "clothes"],
        answer: 'coins',
        explanation: '几千年前古硬币',
      },
      {
        id: 'b011-4',
        position: 4,
        options: ["section", "room", "hall", "shop"],
        answer: 'section',
        explanation: '艺术区(art section)',
      },
      {
        id: 'b011-5',
        position: 5,
        options: ["end", "beginning", "middle", "start"],
        answer: 'end',
        explanation: '在旅行结束时',
      },
      {
        id: 'b011-6',
        position: 6,
        options: ["postcard", "book", "map", "photo"],
        answer: 'postcard',
        explanation: '买了一张明信片',
      },
    ],
    difficulty: 'medium',
    topic: '学校生活',
  },
  // ==================== 下一篇 ====================
  {
    id: 'p3c-012',
    title: 'My Favourite Hobby',
    titleZh: '我最喜欢的爱好',
    passage: `My favourite hobby is (1) ____. I got my first camera when I was ten years (2) ____. Now I am thirteen and I have a much better camera. I take photos of people, (3) ____, and landscapes. My favourite place to take photos is the (4) ____ near my house. There are many beautiful flowers and trees there. Sometimes, I (5) ____ photography competitions. Last month, I won a prize for my photo of a (6) ____. I was very happy.`,
    passageFull: `My favourite hobby is photography (1). I got my first camera when I was ten years old (2). Now I am thirteen and I have a much better camera. I take photos of people, animals (3), and landscapes. My favourite place to take photos is the park (4) near my house. There are many beautiful flowers and trees there. Sometimes, I enter (5) photography competitions. Last month, I won a prize for my photo of a sunset (6). I was very happy.`,
    blanks: [
      {
        id: 'b012-1',
        position: 1,
        options: ["photography", "painting", "drawing", "singing"],
        answer: 'photography',
        explanation: '根据下文，是摄影',
      },
      {
        id: 'b012-2',
        position: 2,
        options: ["old", "young", "new", "big"],
        answer: 'old',
        explanation: '十岁时(ten years old)',
      },
      {
        id: 'b012-3',
        position: 3,
        options: ["animals", "books", "cars", "toys"],
        answer: 'animals',
        explanation: '拍人、动物和风景的照片',
      },
      {
        id: 'b012-4',
        position: 4,
        options: ["park", "zoo", "museum", "school"],
        answer: 'park',
        explanation: '家附近的公园',
      },
      {
        id: 'b012-5',
        position: 5,
        options: ["enter", "watch", "visit", "clean"],
        answer: 'enter',
        explanation: '参加摄影比赛',
      },
      {
        id: 'b012-6',
        position: 6,
        options: ["sunset", "cat", "dog", "car"],
        answer: 'sunset',
        explanation: '日落照片获奖',
      },
    ],
    difficulty: 'medium',
    topic: '兴趣爱好',
  },
  // ==================== 下一篇 ====================
  {
    id: 'p3c-013',
    title: 'A Letter to My Penfriend',
    titleZh: '给笔友的信',
    passage: `Dear Lisa, How are (1) ____? I am writing to tell you about my holiday. Last week, I (2) ____ to London with my family. We travelled by (3) ____. It was a long journey - three hours! We stayed in a hotel near Hyde (4) ____. On the first day, we visited the British Museum. It was amazing. On the second day, we went to the London (5) ____. We could see the whole city from the top. On the last day, we went (6) ____ on Oxford Street. I bought some souvenirs for you.`,
    passageFull: `Dear Lisa, How are you (1)? I am writing to tell you about my holiday. Last week, I went (2) to London with my family. We travelled by train (3). It was a long journey - three hours! We stayed in a hotel near Hyde Park (4). On the first day, we visited the British Museum. It was amazing. On the second day, we went to the London Eye (5). We could see the whole city from the top. On the last day, we went shopping (6) on Oxford Street. I bought some souvenirs for you.`,
    blanks: [
      {
        id: 'b013-1',
        position: 1,
        options: ["you", "your", "yours", "yourself"],
        answer: 'you',
        explanation: '你好吗？(How are you?)',
      },
      {
        id: 'b013-2',
        position: 2,
        options: ["went", "go", "come", "walk"],
        answer: 'went',
        explanation: '过去时，去(went)',
      },
      {
        id: 'b013-3',
        position: 3,
        options: ["train", "bus", "car", "plane"],
        answer: 'train',
        explanation: '乘火车旅行',
      },
      {
        id: 'b013-4',
        position: 4,
        options: ["Park", "Shop", "School", "Hospital"],
        answer: 'Park',
        explanation: '海德公园(Hyde Park)',
      },
      {
        id: 'b013-5',
        position: 5,
        options: ["Eye", "Bridge", "Tower", "Museum"],
        answer: 'Eye',
        explanation: '伦敦眼(London Eye)',
      },
      {
        id: 'b013-6',
        position: 6,
        options: ["shopping", "swimming", "running", "sleeping"],
        answer: 'shopping',
        explanation: '去购物(go shopping)',
      },
    ],
    difficulty: 'medium',
    topic: '旅行',
  },
  // ==================== 下一篇 ====================
  {
    id: 'p3c-014',
    title: 'Healthy Eating',
    titleZh: '健康饮食',
    passage: `Eating (1) ____ food is important for everyone. A healthy diet should include fruits, (2) ____, grains, protein and dairy. Fruits and vegetables give us vitamins and (3) ____. Grains like bread, rice and pasta give us (4) ____. Protein helps our muscles grow. Meat, fish, eggs and beans are good (5) ____ of protein. Dairy products like milk, cheese and yoghurt make our bones (6) ____.`,
    passageFull: `Eating healthy (1) food is important for everyone. A healthy diet should include fruits, vegetables (2), grains, protein and dairy. Fruits and vegetables give us vitamins and minerals (3). Grains like bread, rice and pasta give us energy (4). Protein helps our muscles grow. Meat, fish, eggs and beans are good sources (5) of protein. Dairy products like milk, cheese and yoghurt make our bones strong (6).`,
    blanks: [
      {
        id: 'b014-1',
        position: 1,
        options: ["healthy", "fast", "junk", "sweet"],
        answer: 'healthy',
        explanation: '吃健康的食物',
      },
      {
        id: 'b014-2',
        position: 2,
        options: ["vegetables", "biscuits", "chips", "cakes"],
        answer: 'vegetables',
        explanation: '水果和蔬菜',
      },
      {
        id: 'b014-3',
        position: 3,
        options: ["minerals", "sugar", "salt", "fat"],
        answer: 'minerals',
        explanation: '维生素和矿物质',
      },
      {
        id: 'b014-4',
        position: 4,
        options: ["energy", "water", "air", "light"],
        answer: 'energy',
        explanation: '谷物给我们能量',
      },
      {
        id: 'b014-5',
        position: 5,
        options: ["sources", "tastes", "colours", "smells"],
        answer: 'sources',
        explanation: '蛋白质的良好来源',
      },
      {
        id: 'b014-6',
        position: 6,
        options: ["strong", "long", "big", "heavy"],
        answer: 'strong',
        explanation: '使骨骼强壮',
      },
    ],
    difficulty: 'medium',
    topic: '健康',
  },
  // ==================== 下一篇 ====================
  {
    id: 'p3c-015',
    title: 'The Importance of Sleep',
    titleZh: '睡眠的重要性',
    passage: `Sleep is very (1) ____ for our health. Children need about 10 hours of sleep every (2) ____. Teenagers need about 8 to 9 hours. When we sleep, our bodies (3) ____ and repair themselves. Sleep also helps our brains to work (4) ____. If we do not get enough sleep, we may feel tired, grumpy and find it (5) ____ to concentrate. To sleep well, we should go to bed at the same time every night. We should also avoid using phones or (6) ____ before bedtime.`,
    passageFull: `Sleep is very important (1) for our health. Children need about 10 hours of sleep every night (2). Teenagers need about 8 to 9 hours. When we sleep, our bodies rest (3) and repair themselves. Sleep also helps our brains to work properly (4). If we do not get enough sleep, we may feel tired, grumpy and find it hard (5) to concentrate. To sleep well, we should go to bed at the same time every night. We should also avoid using phones or computers (6) before bedtime.`,
    blanks: [
      {
        id: 'b015-1',
        position: 1,
        options: ["important", "boring", "funny", "scary"],
        answer: 'important',
        explanation: '睡眠很重要',
      },
      {
        id: 'b015-2',
        position: 2,
        options: ["night", "morning", "afternoon", "week"],
        answer: 'night',
        explanation: '每晚需要10小时睡眠',
      },
      {
        id: 'b015-3',
        position: 3,
        options: ["rest", "run", "jump", "swim"],
        answer: 'rest',
        explanation: '身体休息并自我修复',
      },
      {
        id: 'b015-4',
        position: 4,
        options: ["properly", "slowly", "quietly", "badly"],
        answer: 'properly',
        explanation: '大脑正常工作',
      },
      {
        id: 'b015-5',
        position: 5,
        options: ["hard", "easy", "interesting", "exciting"],
        answer: 'hard',
        explanation: '发现很难集中注意力',
      },
      {
        id: 'b015-6',
        position: 6,
        options: ["computers", "books", "pencils", "bags"],
        answer: 'computers',
        explanation: '避免在睡前使用手机或电脑',
      },
    ],
    difficulty: 'medium',
    topic: '健康',
  },
  // ==================== 下一篇 ====================
  {
    id: 'p3c-016',
    title: 'The Internet',
    titleZh: '互联网',
    passage: `The Internet is a useful (1) ____ that connects people all over the world. We can use the Internet to find (2) ____, communicate with others, and entertain ourselves. Search engines like Google (3) ____ us to find information quickly. We can also use email and social (4) ____ to stay in touch with friends and family. Online shopping is another popular (5) ____ of the Internet. We can buy almost anything online and have it (6) ____ to our homes.`,
    passageFull: `The Internet is a useful tool (1) that connects people all over the world. We can use the Internet to find information (2), communicate with others, and entertain ourselves. Search engines like Google help (3) us to find information quickly. We can also use email and social media (4) to stay in touch with friends and family. Online shopping is another popular use (5) of the Internet. We can buy almost anything online and have it delivered (6) to our homes.`,
    blanks: [
      {
        id: 'b016-1',
        position: 1,
        options: ["tool", "toy", "book", "game"],
        answer: 'tool',
        explanation: '互联网是有用的工具',
      },
      {
        id: 'b016-2',
        position: 2,
        options: ["information", "money", "food", "water"],
        answer: 'information',
        explanation: '查找信息',
      },
      {
        id: 'b016-3',
        position: 3,
        options: ["help", "stop", "hate", "forget"],
        answer: 'help',
        explanation: '搜索引擎帮助我们快速找到信息',
      },
      {
        id: 'b016-4',
        position: 4,
        options: ["media", "studies", "clubs", "teams"],
        answer: 'media',
        explanation: '社交媒体(social media)',
      },
      {
        id: 'b016-5',
        position: 5,
        options: ["use", "user", "useful", "useless"],
        answer: 'use',
        explanation: '互联网的另一种流行用途',
      },
      {
        id: 'b016-6',
        position: 6,
        options: ["delivered", "taken", "brought", "carried"],
        answer: 'delivered',
        explanation: '送货上门',
      },
    ],
    difficulty: 'medium',
    topic: '科技',
  },
  // ==================== 下一篇 ====================
  {
    id: 'p3c-017',
    title: 'Environmental Protection',
    titleZh: '环境保护',
    passage: `Protecting the (1) ____ is everyone's responsibility. There are many simple things we can do to help the environment. First, we should reduce, reuse and (2) ____. We should use less plastic and more reusable bags and (3) ____. Second, we should save energy. We can turn off lights and electronic (4) ____ when we are not using them. Third, we should save water. We can take shorter (5) ____ and fix leaking taps. Finally, we should plant more (6) ____. Trees absorb carbon dioxide and produce oxygen.`,
    passageFull: `Protecting the environment (1) is everyone's responsibility. There are many simple things we can do to help the environment. First, we should reduce, reuse and recycle (2). We should use less plastic and more reusable bags and bottles (3). Second, we should save energy. We can turn off lights and electronic devices (4) when we are not using them. Third, we should save water. We can take shorter showers (5) and fix leaking taps. Finally, we should plant more trees (6). Trees absorb carbon dioxide and produce oxygen.`,
    blanks: [
      {
        id: 'b017-1',
        position: 1,
        options: ["environment", "computer", "book", "house"],
        answer: 'environment',
        explanation: '保护环境',
      },
      {
        id: 'b017-2',
        position: 2,
        options: ["recycle", "repair", "refuse", "return"],
        answer: 'recycle',
        explanation: '减少、重复使用和回收',
      },
      {
        id: 'b017-3',
        position: 3,
        options: ["bottles", "boxes", "books", "pens"],
        answer: 'bottles',
        explanation: '可重复使用的袋子和瓶子',
      },
      {
        id: 'b017-4',
        position: 4,
        options: ["devices", "toys", "pens", "cars"],
        answer: 'devices',
        explanation: '电子设备',
      },
      {
        id: 'b017-5',
        position: 5,
        options: ["showers", "walks", "runs", "sleeps"],
        answer: 'showers',
        explanation: '洗 shorter 的淋浴',
      },
      {
        id: 'b017-6',
        position: 6,
        options: ["trees", "flowers", "grasses", "stones"],
        answer: 'trees',
        explanation: '种更多的树',
      },
    ],
    difficulty: 'medium',
    topic: '环境',
  },
  // ==================== 下一篇 ====================
  {
    id: 'p3c-018',
    title: 'My Dream Job',
    titleZh: '我的梦想工作',
    passage: `Everyone has a dream (1) ____. My dream job is to be a (2) ____. I want to help sick people and make them (3) ____. To become a doctor, I need to study very (4) ____. I must get good grades in all my subjects, especially (5) ____ and chemistry. I also need to go to a medical school for many years. It will be (6) ____, but I think it will be worth it.`,
    passageFull: `Everyone has a dream job (1). My dream job is to be a doctor (2). I want to help sick people and make them better (3). To become a doctor, I need to study very hard (4). I must get good grades in all my subjects, especially biology (5) and chemistry. I also need to go to a medical school for many years. It will be difficult (6), but I think it will be worth it.`,
    blanks: [
      {
        id: 'b018-1',
        position: 1,
        options: ["job", "toy", "book", "game"],
        answer: 'job',
        explanation: '梦想工作(dream job)',
      },
      {
        id: 'b018-2',
        position: 2,
        options: ["doctor", "teacher", "driver", "cook"],
        answer: 'doctor',
        explanation: '想成为医生',
      },
      {
        id: 'b018-3',
        position: 3,
        options: ["better", "worse", "bigger", "smaller"],
        answer: 'better',
        explanation: '使病人好转',
      },
      {
        id: 'b018-4',
        position: 4,
        options: ["hard", "slowly", "quietly", "badly"],
        answer: 'hard',
        explanation: '非常努力地学习',
      },
      {
        id: 'b018-5',
        position: 5,
        options: ["biology", "history", "geography", "art"],
        answer: 'biology',
        explanation: '生物和化学',
      },
      {
        id: 'b018-6',
        position: 6,
        options: ["difficult", "easy", "interesting", "funny"],
        answer: 'difficult',
        explanation: '将会很困难',
      },
    ],
    difficulty: 'medium',
    topic: '职业',
  },
  // ==================== 下一篇 ====================
  {
    id: 'p3c-019',
    title: 'A Day in My Life',
    titleZh: '我生活中的一天',
    passage: `I usually get up at 7 o'clock every (1) ____. I have breakfast with my family and then I (2) ____ to school. School starts at 8:30 am and (3) ____ at 3:30 pm. My favourite subject is (4) ____ because I like reading books. After school, I usually play football with my (5) ____. I arrive home at 5 pm. In the evening, I do my homework and then I (6) ____ TV for one hour.`,
    passageFull: `I usually get up at 7 o'clock every morning (1). I have breakfast with my family and then I go (2) to school. School starts at 8:30 am and finishes (3) at 3:30 pm. My favourite subject is English (4) because I like reading books. After school, I usually play football with my friends (5). I arrive home at 5 pm. In the evening, I do my homework and then I watch (6) TV for one hour.`,
    blanks: [
      {
        id: 'b019-1',
        position: 1,
        options: ["morning", "afternoon", "evening", "night"],
        answer: 'morning',
        explanation: '每天早上7点起床',
      },
      {
        id: 'b019-2',
        position: 2,
        options: ["go", "come", "run", "jump"],
        answer: 'go',
        explanation: '去上学(go to school)',
      },
      {
        id: 'b019-3',
        position: 3,
        options: ["finishes", "starts", "breaks", "opens"],
        answer: 'finishes',
        explanation: '下午3:30放学',
      },
      {
        id: 'b019-4',
        position: 4,
        options: ["English", "maths", "history", "geography"],
        answer: 'English',
        explanation: '根据下文，最喜欢英语',
      },
      {
        id: 'b019-5',
        position: 5,
        options: ["friends", "teachers", "parents", "sisters"],
        answer: 'friends',
        explanation: '和朋友们一起踢足球',
      },
      {
        id: 'b019-6',
        position: 6,
        options: ["watch", "read", "listen", "write"],
        answer: 'watch',
        explanation: '看电视(watch TV)',
      },
    ],
    difficulty: 'medium',
    topic: '学校生活',
  },
  // ==================== 下一篇 ====================
  {
    id: 'p3c-020',
    title: 'Weekend Activities',
    titleZh: '周末活动',
    passage: `On (1) ____, I usually get up later than on weekdays. I have a relaxed breakfast and then I decide what to (2) ____. Sometimes I go to the park with my family. We might have a (3) ____ there. Other times, I meet my friends in the (4) ____. We might go to the cinema or go shopping. In the evening, my family and I have dinner (5) ____. We talk about our week and (6) ____ funny stories.`,
    passageFull: `On weekends (1), I usually get up later than on weekdays. I have a relaxed breakfast and then I decide what to do (2). Sometimes I go to the park with my family. We might have a picnic (3) there. Other times, I meet my friends in the city (4). We might go to the cinema or go shopping. In the evening, my family and I have dinner together (5). We talk about our week and share (6) funny stories.`,
    blanks: [
      {
        id: 'b020-1',
        position: 1,
        options: ["weekends", "Mondays", "Fridays", "Sundays"],
        answer: 'weekends',
        explanation: '在周末',
      },
      {
        id: 'b020-2',
        position: 2,
        options: ["do", "eat", "drink", "sleep"],
        answer: 'do',
        explanation: '决定做什么',
      },
      {
        id: 'b020-3',
        position: 3,
        options: ["picnic", "party", "meeting", "class"],
        answer: 'picnic',
        explanation: '在公园野餐',
      },
      {
        id: 'b020-4',
        position: 4,
        options: ["city", "park", "school", "library"],
        answer: 'city',
        explanation: '在城里见朋友',
      },
      {
        id: 'b020-5',
        position: 5,
        options: ["together", "alone", "separately", "quietly"],
        answer: 'together',
        explanation: '一起吃晚饭',
      },
      {
        id: 'b020-6',
        position: 6,
        options: ["share", "tell", "write", "draw"],
        answer: 'share',
        explanation: '分享有趣的故事',
      },
    ],
    difficulty: 'medium',
    topic: '日常生活',
  },/** Part 3-2: 阅读理解选择题 — 文章 + 7 道四选一 */
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

/** Part 5: 选词填空 — 短文 + 选词框 + 10 个空 */
export interface Part5Gap {
  id: string;
  position: number;
  wordBox: string[];   // 15 个单词选项
  answer: string;      // 正确答案（单词）
  explanation: string;
}

export interface Part5Article {
  id: string;
  title: string;
  titleZh: string;
  text: string;         // 短文（用 ____ 表示空）
  textFull: string;     // 填好答案的完整短文
  gaps: Part5Gap[];
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
  // ==================== p1-002 ====================
  {
    id: 'p1-002',
    title: 'School Life',
    titleZh: '学校生活',
    difficulty: 'easy',
    topic: '学校生活',
    questions: [
      {
        id: 'p1q002-1', emoji: '🏫', imageDesc: '一所学校',
        options: [
          'This is a park.',
          'This is a school.',
          'This is a library.',
          'This is a hospital.',
          'This is a shop.',
          'This is a restaurant.',
          'This is a museum.',
        ],
        answer: 'This is a school.',
      },
      {
        id: 'p1q002-2', emoji: '📖', imageDesc: '一个男孩在读书',
        options: [
          'The boy is playing football.',
          'The boy is reading a book.',
          'The boy is eating lunch.',
          'The girl is dancing.',
          'The teacher is writing.',
          'They are singing.',
          'He is sleeping.',
        ],
        answer: 'The boy is reading a book.',
      },
      {
        id: 'p1q002-3', emoji: '🎒', imageDesc: '一个书包',
        options: [
          'There is a pencil case.',
          'There is a schoolbag.',
          'There is a lunch box.',
          'There is a water bottle.',
          'There is a book.',
          'There is a ruler.',
          'There is an eraser.',
        ],
        answer: 'There is a schoolbag.',
      },
      {
        id: 'p1q002-4', emoji: '🍎', imageDesc: '一个苹果（学校午餐）',
        options: [
          'The boy is eating a banana.',
          'The girl is drinking milk.',
          'They are having lunch.',
          'The teacher is eating an apple.',
          'She is cooking dinner.',
          'He is making a sandwich.',
          'They are eating pizza.',
        ],
        answer: 'They are having lunch.',
      },
      {
        id: 'p1q002-5', emoji: '⚽', imageDesc: '孩子们在踢足球',
        options: [
          'They are playing basketball.',
          'They are playing football.',
          'They are playing tennis.',
          'They are swimming.',
          'They are running.',
          'They are dancing.',
          'They are singing.',
        ],
        answer: 'They are playing football.',
      },
    ],
  },
  // ==================== p1-003 ====================
  {
    id: 'p1-003',
    title: 'Food and Drinks',
    titleZh: '食物和饮料',
    difficulty: 'easy',
    topic: '食物',
    questions: [
      {
        id: 'p1q003-1', emoji: '🍎', imageDesc: '一个苹果',
        options: [
          'There is a banana.',
          'There is an apple.',
          'There is an orange.',
          'There is a hamburger.',
          'There is a pizza.',
          'There is a sandwich.',
          'There is a cake.',
        ],
        answer: 'There is an apple.',
      },
      {
        id: 'p1q003-2', emoji: '🥤', imageDesc: '一杯饮料',
        options: [
          'The boy is drinking water.',
          'The boy is drinking juice.',
          'The girl is drinking milk.',
          'They are drinking tea.',
          'He is drinking coffee.',
          'She is drinking cola.',
          'They are drinking juice.',
        ],
        answer: 'The boy is drinking juice.',
      },
      {
        id: 'p1q003-3', emoji: '🍕', imageDesc: '一个披萨',
        options: [
          'There is a hamburger.',
          'There is a pizza.',
          'There is a sandwich.',
          'There is a cake.',
          'There is a salad.',
          'There is a bowl of rice.',
          'There is a piece of bread.',
        ],
        answer: 'There is a pizza.',
      },
      {
        id: 'p1q003-4', emoji: '🍰', imageDesc: '一个蛋糕',
        options: [
          'The girl is eating a cake.',
          'The boy is eating a hamburger.',
          'They are eating pizza.',
          'She is eating an apple.',
          'He is eating a sandwich.',
          'They are eating bread.',
          'The girl is eating ice cream.',
        ],
        answer: 'The girl is eating a cake.',
      },
      {
        id: 'p1q003-5', emoji: '🥗', imageDesc: '一份沙拉',
        options: [
          'There is a hamburger.',
          'There is a pizza.',
          'There is a sandwich.',
          'There is a salad.',
          'There is a cake.',
          'There is a bowl of rice.',
          'There is a piece of bread.',
        ],
        answer: 'There is a salad.',
      },
    ],
  },

  {
    id: 'p1-004',
    title: 'Sports and Games',
    titleZh: '运动和游戏',
    difficulty: 'easy',
    topic: '体育运动',
    questions: [
      {
        id: 'p1q004-1', emoji: '⚽', imageDesc: '一个男孩在踢足球',
        options: [
          'The boy is playing football.',
          'The boy is playing basketball.',
          'The boy is playing tennis.',
          'The girl is dancing.',
          'They are swimming.',
          'He is running.',
          'She is playing volleyball.',
        ],
        answer: 'The boy is playing football.',
      },
      {
        id: 'p1q004-2', emoji: '🏀', imageDesc: '一个女孩在打篮球',
        options: [
          'The girl is playing football.',
          'The girl is playing basketball.',
          'The girl is playing tennis.',
          'The boy is swimming.',
          'They are running.',
          'She is dancing.',
          'He is playing badminton.',
        ],
        answer: 'The girl is playing basketball.',
      },
      {
        id: 'p1q004-3', emoji: '🎾', imageDesc: '两个人在打网球',
        options: [
          'They are playing football.',
          'They are playing basketball.',
          'They are playing tennis.',
          'They are swimming.',
          'They are running.',
          'They are dancing.',
          'They are playing volleyball.',
        ],
        answer: 'They are playing tennis.',
      },
      {
        id: 'p1q004-4', emoji: '🏊', imageDesc: '一个女孩在游泳',
        options: [
          'The girl is running.',
          'The girl is swimming.',
          'The girl is dancing.',
          'The boy is playing football.',
          'They are playing basketball.',
          'She is playing tennis.',
          'He is swimming.',
        ],
        answer: 'The girl is swimming.',
      },
      {
        id: 'p1q004-5', emoji: '🚴', imageDesc: '一个男孩在骑自行车',
        options: [
          'The boy is running.',
          'The boy is swimming.',
          'The boy is riding a bicycle.',
          'The girl is dancing.',
          'They are playing football.',
          'He is playing basketball.',
          'She is riding a bicycle.',
        ],
        answer: 'The boy is riding a bicycle.',
      },
    ],
  },

  {
    id: 'p1-005',
    title: 'Animals at the Zoo',
    titleZh: '动物园里的动物',
    difficulty: 'easy',
    topic: '动物',
    questions: [
      {
        id: 'p1q005-1', emoji: '🦁', imageDesc: '一头狮子',
        options: [
          'This is a tiger.',
          'This is a lion.',
          'This is an elephant.',
          'This is a monkey.',
          'This is a giraffe.',
          'This is a zebra.',
          'This is a bear.',
        ],
        answer: 'This is a lion.',
      },
      {
        id: 'p1q005-2', emoji: '🐘', imageDesc: '一头大象',
        options: [
          'This is a lion.',
          'This is a tiger.',
          'This is an elephant.',
          'This is a monkey.',
          'This is a giraffe.',
          'This is a zebra.',
          'This is a bear.',
        ],
        answer: 'This is an elephant.',
      },
      {
        id: 'p1q005-3', emoji: '🐒', imageDesc: '一只猴子',
        options: [
          'This is a lion.',
          'This is a tiger.',
          'This is an elephant.',
          'This is a monkey.',
          'This is a giraffe.',
          'This is a zebra.',
          'This is a bear.',
        ],
        answer: 'This is a monkey.',
      },
      {
        id: 'p1q005-4', emoji: '🦒', imageDesc: '一只长颈鹿',
        options: [
          'This is a lion.',
          'This is a tiger.',
          'This is an elephant.',
          'This is a monkey.',
          'This is a giraffe.',
          'This is a zebra.',
          'This is a bear.',
        ],
        answer: 'This is a giraffe.',
      },
      {
        id: 'p1q005-5', emoji: '🐯', imageDesc: '一只老虎',
        options: [
          'This is a lion.',
          'This is a tiger.',
          'This is an elephant.',
          'This is a monkey.',
          'This is a giraffe.',
          'This is a zebra.',
          'This is a bear.',
        ],
        answer: 'This is a tiger.',
      },
    ],
  },

  {
    id: 'p1-006',
    title: 'Weather and Seasons',
    titleZh: '天气和季节',
    difficulty: 'easy',
    topic: '天气',
    questions: [
      {
        id: 'p1q006-1', emoji: '☀️', imageDesc: '晴天',
        options: [
          'It is sunny.',
          'It is raining.',
          'It is snowing.',
          'It is windy.',
          'It is cloudy.',
          'It is hot.',
          'It is cold.',
        ],
        answer: 'It is sunny.',
      },
      {
        id: 'p1q006-2', emoji: '🌧️', imageDesc: '下雨天',
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
        id: 'p1q006-3', emoji: '❄️', imageDesc: '下雪天',
        options: [
          'It is sunny.',
          'It is raining.',
          'It is snowing.',
          'It is windy.',
          'It is cloudy.',
          'It is hot.',
          'It is cold.',
        ],
        answer: 'It is snowing.',
      },
      {
        id: 'p1q006-4', emoji: '🌬️', imageDesc: '刮风天',
        options: [
          'It is sunny.',
          'It is raining.',
          'It is snowing.',
          'It is windy.',
          'It is cloudy.',
          'It is hot.',
          'It is cold.',
        ],
        answer: 'It is windy.',
      },
      {
        id: 'p1q006-5', emoji: '☁️', imageDesc: '多云天',
        options: [
          'It is sunny.',
          'It is raining.',
          'It is snowing.',
          'It is windy.',
          'It is cloudy.',
          'It is hot.',
          'It is cold.',
        ],
        answer: 'It is cloudy.',
      },
    ],
  },

  {
    id: 'p1-007',
    title: 'Family Members',
    titleZh: '家庭成员',
    difficulty: 'easy',
    topic: '家庭',
    questions: [
      {
        id: 'p1q007-1', emoji: '👨', imageDesc: '一个男人（爸爸）',
        options: [
          'This is a father.',
          'This is a mother.',
          'This is a brother.',
          'This is a sister.',
          'This is a grandfather.',
          'This is a grandmother.',
          'This is a baby.',
        ],
        answer: 'This is a father.',
      },
      {
        id: 'p1q007-2', emoji: '👩', imageDesc: '一个女人（妈妈）',
        options: [
          'This is a father.',
          'This is a mother.',
          'This is a brother.',
          'This is a sister.',
          'This is a grandfather.',
          'This is a grandmother.',
          'This is a baby.',
        ],
        answer: 'This is a mother.',
      },
      {
        id: 'p1q007-3', emoji: '👦', imageDesc: '一个男孩（兄弟）',
        options: [
          'This is a father.',
          'This is a mother.',
          'This is a brother.',
          'This is a sister.',
          'This is a grandfather.',
          'This is a grandmother.',
          'This is a baby.',
        ],
        answer: 'This is a brother.',
      },
      {
        id: 'p1q007-4', emoji: '👧', imageDesc: '一个女孩（姐妹）',
        options: [
          'This is a father.',
          'This is a mother.',
          'This is a brother.',
          'This is a sister.',
          'This is a grandfather.',
          'This is a grandmother.',
          'This is a baby.',
        ],
        answer: 'This is a sister.',
      },
      {
        id: 'p1q007-5', emoji: '👶', imageDesc: '一个婴儿',
        options: [
          'This is a father.',
          'This is a mother.',
          'This is a brother.',
          'This is a sister.',
          'This is a grandfather.',
          'This is a grandmother.',
          'This is a baby.',
        ],
        answer: 'This is a baby.',
      },
    ],
  },

  {
    id: 'p1-008',
    title: 'Food and Drinks',
    titleZh: '食物和饮料',
    difficulty: 'medium',
    topic: '食物',
    questions: [
      {
        id: 'p1q008-1', emoji: '🍔', imageDesc: '一个汉堡',
        options: [
          'There is a hamburger.',
          'There is a pizza.',
          'There is a sandwich.',
          'There is a cake.',
          'There is a salad.',
          'There is a hot dog.',
          'There is a bowl of rice.',
        ],
        answer: 'There is a hamburger.',
      },
      {
        id: 'p1q008-2', emoji: '🍕', imageDesc: '一个披萨',
        options: [
          'There is a hamburger.',
          'There is a pizza.',
          'There is a sandwich.',
          'There is a cake.',
          'There is a salad.',
          'There is a hot dog.',
          'There is a bowl of rice.',
        ],
        answer: 'There is a pizza.',
      },
      {
        id: 'p1q008-3', emoji: '🥤', imageDesc: '一杯饮料',
        options: [
          'There is water.',
          'There is juice.',
          'There is milk.',
          'There is tea.',
          'There is coffee.',
          'There is cola.',
          'There is lemonade.',
        ],
        answer: 'There is juice.',
      },
      {
        id: 'p1q008-4', emoji: '🍰', imageDesc: '一个蛋糕',
        options: [
          'There is a hamburger.',
          'There is a pizza.',
          'There is a sandwich.',
          'There is a cake.',
          'There is a salad.',
          'There is a hot dog.',
          'There is a bowl of rice.',
        ],
        answer: 'There is a cake.',
      },
      {
        id: 'p1q008-5', emoji: '🍎', imageDesc: '一个苹果',
        options: [
          'There is a banana.',
          'There is an apple.',
          'There is an orange.',
          'There is a watermelon.',
          'There is a pineapple.',
          'There is a grape.',
          'There is a strawberry.',
        ],
        answer: 'There is an apple.',
      },
    ],
  },

  {
    id: 'p1-009',
    title: 'School Subjects',
    titleZh: '学校科目',
    difficulty: 'medium',
    topic: '学校',
    questions: [
      {
        id: 'p1q009-1', emoji: '📐', imageDesc: '数学课',
        options: [
          'This is a maths class.',
          'This is an English class.',
          'This is a science class.',
          'This is a history class.',
          'This is an art class.',
          'This is a music class.',
          'This is a PE class.',
        ],
        answer: 'This is a maths class.',
      },
      {
        id: 'p1q009-2', emoji: '📚', imageDesc: '英语课',
        options: [
          'This is a maths class.',
          'This is an English class.',
          'This is a science class.',
          'This is a history class.',
          'This is an art class.',
          'This is a music class.',
          'This is a PE class.',
        ],
        answer: 'This is an English class.',
      },
      {
        id: 'p1q009-3', emoji: '🔬', imageDesc: '科学课',
        options: [
          'This is a maths class.',
          'This is an English class.',
          'This is a science class.',
          'This is a history class.',
          'This is an art class.',
          'This is a music class.',
          'This is a PE class.',
        ],
        answer: 'This is a science class.',
      },
      {
        id: 'p1q009-4', emoji: '🎨', imageDesc: '艺术课',
        options: [
          'This is a maths class.',
          'This is an English class.',
          'This is a science class.',
          'This is a history class.',
          'This is an art class.',
          'This is a music class.',
          'This is a PE class.',
        ],
        answer: 'This is an art class.',
      },
      {
        id: 'p1q009-5', emoji: '⚽', imageDesc: '体育课',
        options: [
          'This is a maths class.',
          'This is an English class.',
          'This is a science class.',
          'This is a history class.',
          'This is an art class.',
          'This is a music class.',
          'This is a PE class.',
        ],
        answer: 'This is a PE class.',
      },
    ],
  },

  {
    id: 'p1-010',
    title: 'Daily Routines',
    titleZh: '日常生活',
    difficulty: 'medium',
    topic: '日常生活',
    questions: [
      {
        id: 'p1q010-1', emoji: '🌅', imageDesc: '起床',
        options: [
          'The boy is getting up.',
          'The boy is having breakfast.',
          'The boy is going to school.',
          'The boy is having lunch.',
          'The boy is doing homework.',
          'The boy is watching TV.',
          'The boy is sleeping.',
        ],
        answer: 'The boy is getting up.',
      },
      {
        id: 'p1q010-2', emoji: '🍳', imageDesc: '吃早餐',
        options: [
          'The boy is getting up.',
          'The boy is having breakfast.',
          'The boy is going to school.',
          'The boy is having lunch.',
          'The boy is doing homework.',
          'The boy is watching TV.',
          'The boy is sleeping.',
        ],
        answer: 'The boy is having breakfast.',
      },
      {
        id: 'p1q010-3', emoji: '🏫', imageDesc: '去学校',
        options: [
          'The boy is getting up.',
          'The boy is having breakfast.',
          'The boy is going to school.',
          'The boy is having lunch.',
          'The boy is doing homework.',
          'The boy is watching TV.',
          'The boy is sleeping.',
        ],
        answer: 'The boy is going to school.',
      },
      {
        id: 'p1q010-4', emoji: '📖', imageDesc: '做作业',
        options: [
          'The boy is getting up.',
          'The boy is having breakfast.',
          'The boy is going to school.',
          'The boy is having lunch.',
          'The boy is doing homework.',
          'The boy is watching TV.',
          'The boy is sleeping.',
        ],
        answer: 'The boy is doing homework.',
      },
      {
        id: 'p1q010-5', emoji: '🛌', imageDesc: '睡觉',
        options: [
          'The boy is getting up.',
          'The boy is having breakfast.',
          'The boy is going to school.',
          'The boy is having lunch.',
          'The boy is doing homework.',
          'The boy is watching TV.',
          'The boy is sleeping.',
        ],
        answer: 'The boy is sleeping.',
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
  // ==================== p2-002 ====================
  {
    id: 'p2-002',
    title: 'Weekend Plans',
    titleZh: '周末计划',
    difficulty: 'easy',
    topic: '日常生活',
    people: [
      { id: 'A', name: 'John', age: 14, description: 'John likes sports and wants to join a team.', descriptionZh: 'John 喜欢运动，想加入一个团队。' },
      { id: 'B', name: 'Mary', age: 13, description: 'Mary enjoys art and wants to learn to paint.', descriptionZh: 'Mary 喜欢艺术，想学画画。' },
      { id: 'C', name: 'Peter', age: 15, description: 'Peter is interested in music and can play guitar.', descriptionZh: 'Peter 对音乐感兴趣，会弹吉他。' },
      { id: 'D', name: 'Lucy', age: 12, description: 'Lucy loves animals and wants to help them.', descriptionZh: 'Lucy 热爱动物，想帮助它们。' },
      { id: 'E', name: 'Tom', age: 14, description: 'Tom enjoys cooking and wants to learn new recipes.', descriptionZh: 'Tom 喜欢烹饪，想学习新食谱。' },
    ],
    infoPieces: [
      { id: '1', text: 'Join our football team and practice every Wednesday.', textZh: '加入我们的足球队，每周三练习。' },
      { id: '2', text: 'Art class for beginners. Learn to draw and paint.', textZh: '初级艺术课，学习画画。' },
      { id: '3', text: 'Guitar lessons for all levels. Bring your own guitar.', textZh: '各级吉他课，自带吉他。' },
      { id: '4', text: 'Volunteer at the animal shelter on weekends.', textZh: '周末在动物收容所做志愿者。' },
      { id: '5', text: 'Cooking class: learn to make pasta and pizza.', textZh: '烹饪课：学习制作意大利面和披萨。' },
      { id: '6', text: 'Basketball practice every Saturday morning.', textZh: '每周六上午篮球练习。' },
      { id: '7', text: 'Join the school band and play an instrument.', textZh: '加入学校乐队，演奏乐器。' },
      { id: '8', text: 'Swimming lessons at the local pool.', textZh: '在当地游泳池上游泳课。' },
    ],
    answers: { A: '1', B: '2', C: '3', D: '4', E: '5' },
  },
  // ==================== p2-003 ====================
  {
    id: 'p2-003',
    title: 'Summer Camp',
    titleZh: '夏令营',
    difficulty: 'medium',
    topic: '户外活动',
    people: [
      { id: 'A', name: 'Alex', age: 13, description: 'Alex loves water sports and wants to learn to surf.', descriptionZh: 'Alex 热爱水上运动，想学冲浪。' },
      { id: 'B', name: 'Bella', age: 12, description: 'Bella enjoys nature and wants to learn about plants.', descriptionZh: 'Bella 喜欢大自然，想了解植物。' },
      { id: 'C', name: 'Chris', age: 14, description: 'Chris likes adventure and wants to try rock climbing.', descriptionZh: 'Chris 喜欢冒险，想尝试攀岩。' },
      { id: 'D', name: 'Diana', age: 13, description: 'Diana loves animals and wants to help at the farm.', descriptionZh: 'Diana 热爱动物，想在农场帮忙。' },
      { id: 'E', name: 'Evan', age: 12, description: 'Evan enjoys cooking and wants to learn to make camp food.', descriptionZh: 'Evan 喜欢烹饪，想学习做露营食物。' },
    ],
    infoPieces: [
      { id: '1', text: 'Learn to surf on the beach with professional instructors.', textZh: '在专业教练指导下在海滩上学习冲浪。' },
      { id: '2', text: 'Explore the forest and identify different plants and flowers.', textZh: '探索森林，识别不同的植物和花朵。' },
      { id: '3', text: 'Climb natural rock formations with safety equipment.', textZh: '使用安全设备攀爬天然岩层。' },
      { id: '4', text: 'Help feed and care for farm animals every morning.', textZh: '每天早上帮忙喂养和照顾农场动物。' },
      { id: '5', text: 'Learn to cook outdoors and make delicious camp meals.', textZh: '学习户外烹饪，制作美味的露营餐。' },
      { id: '6', text: 'Play team sports like volleyball and football on the beach.', textZh: '在海滩上玩团队运动，如排球和足球。' },
      { id: '7', text: 'Stargaze at night and learn about constellations.', textZh: '晚上观星，学习星座知识。' },
      { id: '8', text: 'Make crafts using natural materials like wood and stones.', textZh: '用木材和石头等天然材料制作手工艺品。' },
    ],
    answers: { A: '1', B: '2', C: '3', D: '4', E: '5' },
  },

  {
    id: 'p2-004',
    title: 'Hobbies and Interests',
    titleZh: '爱好和兴趣',
    difficulty: 'easy',
    topic: '兴趣爱好',
    people: [
      {
        id: 'A', name: 'Lily', age: 11, description: 'Lily loves music and can play the piano.', descriptionZh: 'Lily 热爱音乐，会弹钢琴。',
      },
      {
        id: 'B', name: 'Jack', age: 12, description: 'Jack enjoys sports and plays football every weekend.', descriptionZh: 'Jack 喜欢运动，每个周末都踢足球。',
      },
      {
        id: 'C', name: 'Sophie', age: 13, description: 'Sophie likes art and enjoys painting in her free time.', descriptionZh: 'Sophie 喜欢艺术，空闲时喜欢画画。',
      },
      {
        id: 'D', name: 'Mike', age: 12, description: 'Mike is good at maths and enjoys solving puzzles.', descriptionZh: 'Mike 擅长数学，喜欢解谜。',
      },
      {
        id: 'E', name: 'Emma', age: 11, description: 'Emma loves reading books and goes to the library every week.', descriptionZh: 'Emma 热爱读书，每周都去图书馆。',
      },
    ],
    infoPieces: [
      {
        id: '1', text: 'Join the school football team and practice every Tuesday.', textZh: '加入学校足球队，每周二练习。',
      },
      {
        id: '2', text: 'Art class for beginners. Learn to draw and paint.', textZh: '初级艺术课，学习画画。',
      },
      {
        id: '3', text: 'Piano lessons for all levels. Bring your own piano book.', textZh: '各级钢琴课，自带钢琴书。',
      },
      {
        id: '4', text: 'Maths club: solve fun puzzles and play number games.', textZh: '数学俱乐部：解有趣的谜题，玩数字游戏。',
      },
      {
        id: '5', text: 'Reading group: share your favourite books with others.', textZh: '阅读小组：与他人分享你最喜欢的书。',
      },
      {
        id: '6', text: 'Swimming lessons at the local pool every Saturday.', textZh: '每周六在当地游泳池上游泳课。',
      },
      {
        id: '7', text: 'Dancing class: learn ballet, hip-hop and jazz.', textZh: '舞蹈课：学习芭蕾、街舞和爵士舞。',
      },
      {
        id: '8', text: 'Cooking class: learn to make simple dishes and desserts.', textZh: '烹饪课：学习制作简单的菜肴和甜点。',
      },
    ],
    answers: {"A": "3", "B": "1", "C": "2", "D": "4", "E": "5"},
  },

  {
    id: 'p2-005',
    title: 'Free Time Activities',
    titleZh: '空闲时间活动',
    difficulty: 'easy',
    topic: '日常生活',
    people: [
      {
        id: 'A', name: 'Tom', age: 14, description: 'Tom likes watching movies and goes to the cinema every Friday.', descriptionZh: 'Tom 喜欢看电影，每周五都去电影院。',
      },
      {
        id: 'B', name: 'Lucy', age: 13, description: 'Lucy enjoys playing video games with her friends online.', descriptionZh: 'Lucy 喜欢和朋友在线玩视频游戏。',
      },
      {
        id: 'C', name: 'Peter', age: 15, description: 'Peter loves outdoor activities like hiking and camping.', descriptionZh: 'Peter 热爱户外活动，如徒步和露营。',
      },
      {
        id: 'D', name: 'Anna', age: 12, description: 'Anna likes cooking and often bakes cookies at home.', descriptionZh: 'Anna 喜欢烹饪，经常在家烤饼干。',
      },
      {
        id: 'E', name: 'David', age: 14, description: 'David enjoys taking photos and wants to learn photography.', descriptionZh: 'David 喜欢拍照，想学习摄影。',
      },
    ],
    infoPieces: [
      {
        id: '1', text: 'Cinema club: watch and discuss different types of movies.', textZh: '电影俱乐部：观看并讨论不同类型的电影。',
      },
      {
        id: '2', text: 'Video game tournament: compete with other players every weekend.', textZh: '视频游戏锦标赛：每周末与其他玩家竞技。',
      },
      {
        id: '3', text: 'Hiking trip: explore nature and camp under the stars.', textZh: '徒步旅行：探索大自然，在星空下露营。',
      },
      {
        id: '4', text: 'Cooking workshop: learn to bake bread and make desserts.', textZh: '烹饪工作坊：学习烤面包和制作甜点。',
      },
      {
        id: '5', text: 'Photography class: learn to take better photos with your camera.', textZh: '摄影课：学习用相机拍出更好的照片。',
      },
      {
        id: '6', text: 'Music band: join a group and play an instrument together.', textZh: '音乐乐队：加入一个小组，一起演奏乐器。',
      },
      {
        id: '7', text: 'Book club: read and talk about interesting books.', textZh: '读书俱乐部：阅读并讨论有趣的书。',
      },
      {
        id: '8', text: 'Swimming competition: practice and compete with others.', textZh: '游泳比赛：练习并与其他人竞争。',
      },
    ],
    answers: {"A": "1", "B": "2", "C": "3", "D": "4", "E": "5"},
  },

  {
    id: 'p2-006',
    title: 'School Subjects',
    titleZh: '学校科目',
    difficulty: 'medium',
    topic: '学校生活',
    people: [
      {
        id: 'A', name: 'Amy', age: 12, description: 'Amy is good at maths and enjoys solving problems.', descriptionZh: 'Amy 擅长数学，喜欢解决问题。',
      },
      {
        id: 'B', name: 'Ben', age: 13, description: 'Ben loves science and wants to be a scientist.', descriptionZh: 'Ben 热爱科学，想成为一名科学家。',
      },
      {
        id: 'C', name: 'Clara', age: 11, description: 'Clara enjoys art and likes drawing pictures.', descriptionZh: 'Clara 喜欢艺术，喜欢画画。',
      },
      {
        id: 'D', name: 'Daniel', age: 14, description: 'Daniel is interested in history and likes learning about the past.', descriptionZh: 'Daniel 对历史感兴趣，喜欢了解过去。',
      },
      {
        id: 'E', name: 'Eva', age: 12, description: 'Eva loves music and can play the violin.', descriptionZh: 'Eva 热爱音乐，会拉小提琴。',
      },
    ],
    infoPieces: [
      {
        id: '1', text: 'Maths competition: test your problem-solving skills.', textZh: '数学竞赛：测试你的解决问题能力。',
      },
      {
        id: '2', text: 'Science club: do experiments and learn about nature.', textZh: '科学俱乐部：做实验，了解大自然。',
      },
      {
        id: '3', text: 'Art class: learn to paint and draw beautiful pictures.', textZh: '艺术课：学习绘画，画出美丽的图画。',
      },
      {
        id: '4', text: 'History group: discover interesting stories from the past.', textZh: '历史小组：发现过去有趣的故事。',
      },
      {
        id: '5', text: 'Music lessons: learn to play an instrument or sing.', textZh: '音乐课：学习演奏乐器或唱歌。',
      },
      {
        id: '6', text: 'English drama: act in plays and improve your English.', textZh: '英语戏剧：演戏并提高你的英语。',
      },
      {
        id: '7', text: 'Sports team: join a team and play together.', textZh: '运动队：加入一个团队，一起比赛。',
      },
      {
        id: '8', text: 'Cooking class: learn to cook healthy meals.', textZh: '烹饪课：学习烹饪健康的饭菜。',
      },
    ],
    answers: {"A": "1", "B": "2", "C": "3", "D": "4", "E": "5"},
  },

  {
    id: 'p2-007',
    title: 'Weekend Plans',
    titleZh: '周末计划',
    difficulty: 'medium',
    topic: '日常生活',
    people: [
      {
        id: 'A', name: 'Frank', age: 15, description: 'Frank wants to go to the beach and swim in the sea.', descriptionZh: 'Frank 想去海滩，在海里游泳。',
      },
      {
        id: 'B', name: 'Grace', age: 14, description: 'Grace plans to visit her grandparents in the countryside.', descriptionZh: 'Grace 计划去乡下看望她的祖父母。',
      },
      {
        id: 'C', name: 'Henry', age: 13, description: 'Henry hopes to go to the shopping mall with his friends.', descriptionZh: 'Henry 希望和朋友一起去购物中心。',
      },
      {
        id: 'D', name: 'Iris', age: 12, description: 'Iris wants to stay at home and read her new books.', descriptionZh: 'Iris 想待在家里读她的新书。',
      },
      {
        id: 'E', name: 'Jack', age: 14, description: 'Jack is going to the cinema to watch a new film.', descriptionZh: 'Jack 要去电影院看一部新电影。',
      },
    ],
    infoPieces: [
      {
        id: '1', text: 'Beach trip: enjoy the sun, sand and sea.', textZh: '海滩之旅：享受阳光、沙滩和大海。',
      },
      {
        id: '2', text: 'Visit grandparents: spend time with family in the village.', textZh: '看望祖父母：在村里与家人共度时光。',
      },
      {
        id: '3', text: 'Shopping with friends: buy clothes and enjoy food at the mall.', textZh: '与朋友购物：在商场买衣服，享受美食。',
      },
      {
        id: '4', text: 'Reading at home: relax with a good book.', textZh: '在家阅读：读一本好书放松。',
      },
      {
        id: '5', text: 'Watch a new film: enjoy the latest movie at the cinema.', textZh: '观看新电影：在电影院欣赏最新电影。',
      },
      {
        id: '6', text: 'Play sports: join a game of football or basketball.', textZh: '做运动：参加足球或篮球比赛。',
      },
      {
        id: '7', text: 'Go to a concert: listen to your favourite band live.', textZh: '去听音乐会：现场听你最喜欢的乐队演奏。',
      },
      {
        id: '8', text: 'Have a picnic: eat outdoors with family or friends.', textZh: '野餐：与家人或朋友在户外用餐。',
      },
    ],
    answers: {"A": "1", "B": "2", "C": "3", "D": "4", "E": "5"},
  },

  {
    id: 'p2-008',
    title: 'Holiday Activities',
    titleZh: '假日活动',
    difficulty: 'medium',
    topic: '旅行',
    people: [
      {
        id: 'A', name: 'Kate', age: 13, description: 'Kate loves travelling and wants to visit a new city.', descriptionZh: 'Kate 热爱旅行，想参观一个新城市。',
      },
      {
        id: 'B', name: 'Leo', age: 14, description: 'Leo enjoys camping and sleeping in a tent.', descriptionZh: 'Leo 喜欢露营，睡在帐篷里。',
      },
      {
        id: 'C', name: 'Mia', age: 12, description: 'Mia likes visiting museums and learning about history.', descriptionZh: 'Mia 喜欢参观博物馆，学习历史。',
      },
      {
        id: 'D', name: 'Noah', age: 15, description: 'Noah loves amusement parks and riding roller coasters.', descriptionZh: 'Noah 热爱游乐园，喜欢坐过山车。',
      },
      {
        id: 'E', name: 'Olivia', age: 13, description: 'Olivia enjoys trying local food when she travels.', descriptionZh: 'Olivia 旅行时喜欢尝试当地食物。',
      },
    ],
    infoPieces: [
      {
        id: '1', text: 'City tour: visit famous places and learn about the culture.', textZh: '城市游览：参观著名景点，了解文化。',
      },
      {
        id: '2', text: 'Camping trip: sleep under the stars and enjoy nature.', textZh: '露营之旅：在星空下睡觉，享受大自然。',
      },
      {
        id: '3', text: 'Museum visit: discover art, history and science exhibits.', textZh: '参观博物馆：发现艺术、历史和科学展览。',
      },
      {
        id: '4', text: 'Amusement park: ride exciting roller coasters and play games.', textZh: '游乐园：乘坐刺激的过山车，玩游戏。',
      },
      {
        id: '5', text: 'Food tour: taste local dishes and learn to cook them.', textZh: '美食之旅：品尝当地菜肴，学习烹饪。',
      },
      {
        id: '6', text: 'Beach holiday: relax on the sand and swim in the sea.', textZh: '海滩假期：在沙滩上放松，在海里游泳。',
      },
      {
        id: '7', text: 'Mountain hiking: climb hills and enjoy the view.', textZh: '山地徒步：爬山，欣赏风景。',
      },
      {
        id: '8', text: 'Zoo visit: see animals from all over the world.', textZh: '参观动物园：看来自世界各地的动物。',
      },
    ],
    answers: {"A": "1", "B": "2", "C": "3", "D": "4", "E": "5"},
  },

  {
    id: 'p2-009',
    title: 'After-School Clubs',
    titleZh: '课外俱乐部',
    difficulty: 'easy',
    topic: '学校生活',
    people: [
      {
        id: 'A', name: 'Paul', age: 12, description: 'Paul wants to learn to play chess and improve his skills.', descriptionZh: 'Paul 想学习下棋，提高他的技能。',
      },
      {
        id: 'B', name: 'Quinn', age: 13, description: 'Quinn enjoys dancing and wants to learn new moves.', descriptionZh: 'Quinn 喜欢跳舞，想学习新动作。',
      },
      {
        id: 'C', name: 'Ruby', age: 11, description: 'Ruby loves animals and wants to help at the animal shelter.', descriptionZh: 'Ruby 热爱动物，想在动物收容所帮忙。',
      },
      {
        id: 'D', name: 'Sam', age: 14, description: 'Sam is good at computers and wants to learn programming.', descriptionZh: 'Sam 擅长电脑，想学习编程。',
      },
      {
        id: 'E', name: 'Tina', age: 12, description: 'Tina enjoys writing stories and wants to join a writing group.', descriptionZh: 'Tina 喜欢写故事，想加入写作小组。',
      },
    ],
    infoPieces: [
      {
        id: '1', text: 'Chess club: learn strategies and play games with others.', textZh: '国际象棋俱乐部：学习策略，与他人对弈。',
      },
      {
        id: '2', text: 'Dance class: learn different styles like hip-hop and ballet.', textZh: '舞蹈课：学习不同风格，如街舞和芭蕾。',
      },
      {
        id: '3', text: 'Animal volunteer: help take care of dogs and cats.', textZh: '动物志愿者：帮忙照顾狗和猫。',
      },
      {
        id: '4', text: 'Computer coding: learn to create your own games and apps.', textZh: '计算机编程：学习创建自己的游戏和应用。',
      },
      {
        id: '5', text: 'Writing group: share your stories and get feedback.', textZh: '写作小组：分享你的故事，获得反馈。',
      },
      {
        id: '6', text: 'Photography club: learn to take great photos.', textZh: '摄影俱乐部：学习拍出好照片。',
      },
      {
        id: '7', text: 'Music band: play an instrument and perform.', textZh: '音乐乐队：演奏乐器并表演。',
      },
      {
        id: '8', text: 'Cooking class: learn to make healthy snacks.', textZh: '烹饪课：学习制作健康零食。',
      },
    ],
    answers: {"A": "1", "B": "2", "C": "3", "D": "4", "E": "5"},
  },

  {
    id: 'p2-010',
    title: 'Dream Jobs',
    titleZh: '梦想工作',
    difficulty: 'medium',
    topic: '职业',
    people: [
      {
        id: 'A', name: 'Uma', age: 14, description: 'Uma wants to be a doctor and help sick people.', descriptionZh: 'Uma 想成为一名医生，帮助生病的人。',
      },
      {
        id: 'B', name: 'Victor', age: 15, description: 'Victor loves animals and wants to be a vet.', descriptionZh: 'Victor 热爱动物，想成为一名兽医。',
      },
      {
        id: 'C', name: 'Wendy', age: 13, description: 'Wendy enjoys writing and wants to be a journalist.', descriptionZh: 'Wendy 喜欢写作，想成为一名记者。',
      },
      {
        id: 'D', name: 'Xavier', age: 14, description: 'Xavier is good at maths and wants to be an engineer.', descriptionZh: 'Xavier 擅长数学，想成为一名工程师。',
      },
      {
        id: 'E', name: 'Yara', age: 12, description: 'Yara loves painting and wants to be an artist.', descriptionZh: 'Yara 热爱绘画，想成为一名艺术家。',
      },
    ],
    infoPieces: [
      {
        id: '1', text: 'Medical club: learn about the human body and first aid.', textZh: '医学俱乐部：了解人体和急救知识。',
      },
      {
        id: '2', text: 'Animal care: volunteer at a vet clinic and learn to help animals.', textZh: '动物护理：在兽医诊所做志愿者，学习帮助动物。',
      },
      {
        id: '3', text: 'School newspaper: write articles and interview people.', textZh: '校报：写文章并采访人们。',
      },
      {
        id: '4', text: 'Robotics club: build robots and learn engineering skills.', textZh: '机器人俱乐部：制造机器人，学习工程技能。',
      },
      {
        id: '5', text: 'Art class: improve your painting and drawing skills.', textZh: '艺术课：提高你的绘画技能。',
      },
      {
        id: '6', text: 'Music lessons: learn to play an instrument professionally.', textZh: '音乐课：学习专业地演奏乐器。',
      },
      {
        id: '7', text: 'Sports team: train hard and become a professional athlete.', textZh: '运动队：努力训练，成为职业运动员。',
      },
      {
        id: '8', text: 'Cooking class: learn to cook like a professional chef.', textZh: '烹饪课：学习像专业厨师一样烹饪。',
      },
    ],
    answers: {"A": "1", "B": "2", "C": "3", "D": "4", "E": "5"},
  },
];



// ==================== Part 3-1: 完形填空数据 =============================
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
  // ==================== p3c-002 ====================
  {
    id: 'p3c-002',
    title: 'My Weekend',
    titleZh: '我的周末',
    passage: `Last weekend, I ____ (1) to the park with my family. We ____ (2) a picnic there. The weather ____ (3) sunny and warm. I ____ (4) football with my dad. My mum ____ (5) some photos. We ____ (6) home at 5 pm.`,
    passageFull: `Last weekend, I went (1) to the park with my family. We had (2) a picnic there. The weather was (3) sunny and warm. I played (4) football with my dad. My mum took (5) some photos. We went (6) home at 5 pm.`,
    blanks: [
      { id: 'b002-1', position: 1, options: ['went', 'go', 'come'], answer: 'went', explanation: 'last weekend 是过去时，用 went' },
      { id: 'b002-2', position: 2, options: ['had', 'have', 'make'], answer: 'had', explanation: 'have a picnic 野餐，过去时用 had' },
      { id: 'b002-3', position: 3, options: ['is', 'was', 'are'], answer: 'was', explanation: '过去时，weather 不可数，用 was' },
      { id: 'b002-4', position: 4, options: ['play', 'played', 'plays'], answer: 'played', explanation: '过去时，用 played' },
      { id: 'b002-5', position: 5, options: ['took', 'take', 'takes'], answer: 'took', explanation: 'take photos 拍照，过去时用 took' },
      { id: 'b002-6', position: 6, options: ['went', 'go', 'walk'], answer: 'went', explanation: 'go home 回家，过去时用 went' },
    ],
    difficulty: 'easy',
    topic: '日常生活',
  },
  // ==================== p3c-003 ====================
  {
    id: 'p3c-003',
    title: 'My Hobbies',
    titleZh: '我的爱好',
    passage: `I have many hobbies. I like ____ (1) books in my free time. My sister likes ____ (2) to music. We both enjoy ____ (3) films together. On weekends, I often ____ (4) swimming. My sister ____ (5) to join a music club. We ____ (6) very happy.`,
    passageFull: `I have many hobbies. I like reading (1) books in my free time. My sister likes listening (2) to music. We both enjoy watching (3) films together. On weekends, I often go (4) swimming. My sister wants (5) to join a music club. We feel (6) very happy.`,
    blanks: [
      { id: 'b003-1', position: 1, options: ['reading', 'watch', 'play'], answer: 'reading', explanation: 'like doing sth. 喜欢做某事，读书用 reading' },
      { id: 'b003-2', position: 2, options: ['listening', 'look', 'see'], answer: 'listening', explanation: 'listen to music 听音乐' },
      { id: 'b003-3', position: 3, options: ['watching', 'read', 'listen'], answer: 'watching', explanation: 'watch films 看电影' },
      { id: 'b003-4', position: 4, options: ['go', 'play', 'do'], answer: 'go', explanation: 'go swimming 去游泳' },
      { id: 'b003-5', position: 5, options: ['wants', 'like', 'enjoy'], answer: 'wants', explanation: 'want to do sth. 想要做某事' },
      { id: 'b003-6', position: 6, options: ['feel', 'are', 'is'], answer: 'feel', explanation: 'feel happy 感到快乐' },
    ],
    difficulty: 'easy',
    topic: '兴趣爱好',
  },

  {
    id: 'p3c-004',
    title: 'My School Day',
    titleZh: '我的上学日',
    passage: `I get up at 7 o'clock every morning. I have breakfast and then I ____ (1) to school. School starts at 8:30. My favourite ____ (2) is English. I have lunch at school with my ____ (3). After school, I usually play ____ (4) with my friends. I ____ (5) home at 5 pm. I have dinner with my family and then I ____ (6) my homework.`,
    passageFull: `I get up at 7 o'clock every morning. I have breakfast and then I go (1) to school. School starts at 8:30. My favourite subject (2) is English. I have lunch at school with my friends (3). After school, I usually play football (4) with my friends. I arrive (5) home at 5 pm. I have dinner with my family and then I do (6) my homework.`,
    blanks: [
      {
        id: 'b004-1', position: 1, options: [
          'go',
          'come',
          'walk',
        ],
        answer: 'go', explanation: 'go to school 去上学',
      },
      {
        id: 'b004-2', position: 2, options: [
          'subject',
          'teacher',
          'classroom',
        ],
        answer: 'subject', explanation: 'English 是一门学科',
      },
      {
        id: 'b004-3', position: 3, options: [
          'friends',
          'teachers',
          'parents',
        ],
        answer: 'friends', explanation: '和朋友们一起吃午饭',
      },
      {
        id: 'b004-4', position: 4, options: [
          'football',
          'piano',
          'games',
        ],
        answer: 'football', explanation: 'play football 踢足球',
      },
      {
        id: 'b004-5', position: 5, options: [
          'arrive',
          'reach',
          'get',
        ],
        answer: 'arrive', explanation: 'arrive home 到家',
      },
      {
        id: 'b004-6', position: 6, options: [
          'do',
          'make',
          'finish',
        ],
        answer: 'do', explanation: 'do homework 做作业',
      },
    ],
    difficulty: 'easy',
    topic: '学校生活',
  },

  {
    id: 'p3c-005',
    title: 'My Family',
    titleZh: '我的家庭',
    passage: `I live with my ____ (1). There are four people in my family: my dad, my mum, my sister and ____ (2). My dad is a teacher. He ____ (3) maths. My mum is a doctor. She ____ (4) at a hospital. My sister is 16 years ____ (5) and she loves music. I am 12 years old and I like ____ (6).`,
    passageFull: `I live with my family (1). There are four people in my family: my dad, my mum, my sister and me (2). My dad is a teacher. He teaches (3) maths. My mum is a doctor. She works (4) at a hospital. My sister is 16 years old (5) and she loves music. I am 12 years old and I like sports (6).`,
    blanks: [
      {
        id: 'b005-1', position: 1, options: [
          'family',
          'friends',
          'school',
        ],
        answer: 'family', explanation: '和家人住在一起',
      },
      {
        id: 'b005-2', position: 2, options: [
          'me',
          'him',
          'her',
        ],
        answer: 'me', explanation: '我和我的家人',
      },
      {
        id: 'b005-3', position: 3, options: [
          'teaches',
          'learns',
          'studies',
        ],
        answer: 'teaches', explanation: '爸爸教数学',
      },
      {
        id: 'b005-4', position: 4, options: [
          'works',
          'teaches',
          'studies',
        ],
        answer: 'works', explanation: '妈妈在医院工作',
      },
      {
        id: 'b005-5', position: 5, options: [
          'old',
          'young',
          'big',
        ],
        answer: 'old', explanation: '16 years old 16岁',
      },
      {
        id: 'b005-6', position: 6, options: [
          'sports',
          'music',
          'books',
        ],
        answer: 'sports', explanation: '喜欢运动',
      },
    ],
    difficulty: 'easy',
    topic: '家庭生活',
  },

  {
    id: 'p3c-006',
    title: 'My Favourite Animal',
    titleZh: '我最喜欢的动物',
    passage: `My favourite animal is the ____ (1). It has a long ____ (2) and big ears. It is very ____ (3) and friendly. Elephants live in ____ (4). They eat ____ (5) and leaves. I think elephants are ____ (6) animals.`,
    passageFull: `My favourite animal is the elephant (1). It has a long trunk (2) and big ears. It is very smart (3) and friendly. Elephants live in groups (4). They eat grass (5) and leaves. I think elephants are amazing (6) animals.`,
    blanks: [
      {
        id: 'b006-1', position: 1, options: [
          'elephant',
          'tiger',
          'lion',
        ],
        answer: 'elephant', explanation: '根据下文描述，是大象',
      },
      {
        id: 'b006-2', position: 2, options: [
          'trunk',
          'nose',
          'tail',
        ],
        answer: 'trunk', explanation: '大象有长鼻子（trunk）',
      },
      {
        id: 'b006-3', position: 3, options: [
          'smart',
          'slow',
          'small',
        ],
        answer: 'smart', explanation: '大象很聪明',
      },
      {
        id: 'b006-4', position: 4, options: [
          'groups',
          'houses',
          'trees',
        ],
        answer: 'groups', explanation: '大象群居',
      },
      {
        id: 'b006-5', position: 5, options: [
          'grass',
          'meat',
          'fish',
        ],
        answer: 'grass', explanation: '大象吃草',
      },
      {
        id: 'b006-6', position: 6, options: [
          'amazing',
          'dangerous',
          'scary',
        ],
        answer: 'amazing', explanation: '大象是令人惊叹的动物',
      },
    ],
    difficulty: 'easy',
    topic: '动物',
  },

  {
    id: 'p3c-007',
    title: 'A Trip to the Zoo',
    titleZh: '动物园之旅',
    passage: `Last Sunday, my family and I went to the ____ (1). We saw many animals there. First, we saw the ____ (2). They were very tall. Then we saw the ____ (3). They were sleeping. After that, we saw the ____ (4). They were eating bamboo. We took many ____ (5). We had a ____ (6) day.`,
    passageFull: `Last Sunday, my family and I went to the zoo (1). We saw many animals there. First, we saw the giraffes (2). They were very tall. Then we saw the lions (3). They were sleeping. After that, we saw the pandas (4). They were eating bamboo. We took many photos (5). We had a great (6) day.`,
    blanks: [
      {
        id: 'b007-1', position: 1, options: [
          'zoo',
          'park',
          'school',
        ],
        answer: 'zoo', explanation: '根据下文，是去动物园',
      },
      {
        id: 'b007-2', position: 2, options: [
          'giraffes',
          'elephants',
          'monkeys',
        ],
        answer: 'giraffes', explanation: '长颈鹿很高',
      },
      {
        id: 'b007-3', position: 3, options: [
          'lions',
          'tigers',
          'bears',
        ],
        answer: 'lions', explanation: '狮子在睡觉',
      },
      {
        id: 'b007-4', position: 4, options: [
          'pandas',
          'koalas',
          'kangaroos',
        ],
        answer: 'pandas', explanation: '熊猫吃竹子',
      },
      {
        id: 'b007-5', position: 5, options: [
          'photos',
          'books',
          'pictures',
        ],
        answer: 'photos', explanation: 'take photos 拍照',
      },
      {
        id: 'b007-6', position: 6, options: [
          'great',
          'bad',
          'tiring',
        ],
        answer: 'great', explanation: '度过愉快的一天',
      },
    ],
    difficulty: 'easy',
    topic: '旅行',
  },

  {
    id: 'p3c-008',
    title: 'My Best Friend',
    titleZh: '我最好的朋友',
    passage: `Emma is my best ____ (1). We have known each other for six ____ (2). She is very ____ (3) at sports. Every Sunday, we go to the park ____ (4). Emma helps me with my maths ____ (5). I help her with English because I like ____ (6) books.`,
    passageFull: `Emma is my best friend (1). We have known each other for six years (2). She is very good (3) at sports. Every Sunday, we go to the park together (4). Emma helps me with my maths homework (5). I help her with English because I like reading (6) books.`,
    blanks: [
      {
        id: 'b008-1', position: 1, options: [
          'friend',
          'sister',
          'classmate',
        ],
        answer: 'friend', explanation: '最好的朋友',
      },
      {
        id: 'b008-2', position: 2, options: [
          'years',
          'months',
          'days',
        ],
        answer: 'years', explanation: 'for six years 六年',
      },
      {
        id: 'b008-3', position: 3, options: [
          'good',
          'better',
          'best',
        ],
        answer: 'good', explanation: 'be good at 擅长',
      },
      {
        id: 'b008-4', position: 4, options: [
          'together',
          'alone',
          'separately',
        ],
        answer: 'together', explanation: '一起去公园',
      },
      {
        id: 'b008-5', position: 5, options: [
          'homework',
          'class',
          'lesson',
        ],
        answer: 'homework', explanation: 'maths homework 数学作业',
      },
      {
        id: 'b008-6', position: 6, options: [
          'reading',
          'writing',
          'drawing',
        ],
        answer: 'reading', explanation: 'like reading books 喜欢读书',
      },
    ],
    difficulty: 'easy',
    topic: '友谊',
  },

  {
    id: 'p3c-009',
    title: 'My Favourite Season',
    titleZh: '我最喜欢的季节',
    passage: `My favourite season is ____ (1). It is hot and sunny. I can ____ (2) swimming in the sea. I like eating ____ (3) cream. I also enjoy playing ____ (4) with my friends. In summer, school is ____ (5). I have a lot of ____ (6).`,
    passageFull: `My favourite season is summer (1). It is hot and sunny. I can go (2) swimming in the sea. I like eating ice (3) cream. I also enjoy playing football (4) with my friends. In summer, school is closed (5). I have a lot of free (6) time.`,
    blanks: [
      {
        id: 'b009-1', position: 1, options: [
          'summer',
          'winter',
          'spring',
        ],
        answer: 'summer', explanation: '根据下文，是夏天',
      },
      {
        id: 'b009-2', position: 2, options: [
          'go',
          'play',
          'do',
        ],
        answer: 'go', explanation: 'go swimming 去游泳',
      },
      {
        id: 'b009-3', position: 3, options: [
          'ice',
          'cream',
          'cake',
        ],
        answer: 'ice', explanation: 'ice cream 冰淇淋',
      },
      {
        id: 'b009-4', position: 4, options: [
          'football',
          'piano',
          'games',
        ],
        answer: 'football', explanation: 'play football 踢足球',
      },
      {
        id: 'b009-5', position: 5, options: [
          'closed',
          'open',
          'finished',
        ],
        answer: 'closed', explanation: '学校放假',
      },
      {
        id: 'b009-6', position: 6, options: [
          'free',
          'busy',
          'happy',
        ],
        answer: 'free', explanation: 'free time 空闲时间',
      },
    ],
    difficulty: 'easy',
    topic: '季节',
  },

  {
    id: 'p3c-010',
    title: 'A Birthday Party',
    titleZh: '生日派对',
    passage: `Yesterday was my ____ (1) birthday. My friends came to my ____ (2). We had a big cake. It was ____ (3). We played games and ____ (4) music. I got many ____ (5). I was very ____ (6).`,
    passageFull: `Yesterday was my 12th (1) birthday. My friends came to my party (2). We had a big cake. It was delicious (3). We played games and listened (4) to music. I got many presents (5). I was very happy (6).`,
    blanks: [
      {
        id: 'b010-1', position: 1, options: [
          '12th',
          '11th',
          '13th',
        ],
        answer: '12th', explanation: '根据上下文，是12岁生日',
      },
      {
        id: 'b010-2', position: 2, options: [
          'party',
          'school',
          'house',
        ],
        answer: 'party', explanation: '生日派对',
      },
      {
        id: 'b010-3', position: 3, options: [
          'delicious',
          'big',
          'sweet',
        ],
        answer: 'delicious', explanation: '蛋糕很美味',
      },
      {
        id: 'b010-4', position: 4, options: [
          'listened',
          'played',
          'sang',
        ],
        answer: 'listened', explanation: 'listened to music 听音乐',
      },
      {
        id: 'b010-5', position: 5, options: [
          'presents',
          'cakes',
          'cards',
        ],
        answer: 'presents', explanation: '收到很多礼物',
      },
      {
        id: 'b010-6', position: 6, options: [
          'happy',
          'tired',
          'excited',
        ],
        answer: 'happy', explanation: '非常开心',
      },
    ],
    difficulty: 'easy',
    topic: '庆祝',
  },
];



// ==================== Part 3-2: 阅读理解选择题数据 ========================
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
  // ==================== p3r-002 ====================
  {
    id: 'p3r-002',
    title: 'A School Trip',
    titleZh: '学校旅行',
    article: `Last week, my class went on a trip to the zoo. We left school at 8 o'clock in the morning. The bus journey took one hour. At the zoo, we saw many animals: lions, elephants, monkeys and giraffes. My favourite animal was the giraffe because it was very tall. We had a picnic for lunch. After lunch, we visited the reptile house and saw snakes and lizards. We took many photos. The trip was fun and I want to go again.`,
    articleZh: `上周，我的班级去了动物园旅行。我们早上8点离开学校。公交车程花了一小时。在动物园，我们看到了很多动物：狮子、大象、猴子和长颈鹿。我最喜欢的动物是长颈鹿，因为它非常高。我们午饭吃了野餐。午饭后，我们参观了爬行动物馆，看到了蛇和蜥蜴。我们拍了很多照片。这次旅行很有趣，我想再去一次。`,
    questions: [
      { id: 'rc002-1', question: 'What time did they leave school?', questionZh: '他们几点离开学校？', options: ['7 o\'clock', '8 o\'clock', '9 o\'clock', '10 o\'clock'], answer: '8 o\'clock', explanation: '原文说"They left school at 8 o\'clock"。' },
      { id: 'rc002-2', question: 'How long was the bus journey?', questionZh: '公交车程花了多长时间？', options: ['30 minutes', 'One hour', 'Two hours', 'One and a half hours'], answer: 'One hour', explanation: '原文说"The bus journey took one hour"。' },
      { id: 'rc002-3', question: 'What was the writer\'s favourite animal?', questionZh: '作者最喜欢的动物是什么？', options: ['Lion', 'Elephant', 'Giraffe', 'Monkey'], answer: 'Giraffe', explanation: '原文说"My favourite animal was the giraffe"。' },
      { id: 'rc002-4', question: 'What did they have for lunch?', questionZh: '他们午饭吃了什么？', options: ['A restaurant meal', 'A picnic', 'Sandwiches', 'Pizza'], answer: 'A picnic', explanation: '原文说"We had a picnic for lunch"。' },
      { id: 'rc002-5', question: 'What did they see in the reptile house?', questionZh: '他们在爬行动物馆看到了什么？', options: ['Birds and fish', 'Snakes and lizards', 'Monkeys and tigers', 'Lions and elephants'], answer: 'Snakes and lizards', explanation: '原文说"saw snakes and lizards"。' },
      { id: 'rc002-6', question: 'What did they do at the zoo?', questionZh: '他们在动物园做了什么？', options: ['Took photos', 'Rode a bus', 'Fed the animals', 'Played games'], answer: 'Took photos', explanation: '原文说"We took many photos"。' },
      { id: 'rc002-7', question: 'How did the writer feel about the trip?', questionZh: '作者对这次旅行感觉如何？', options: ['Boring', 'Fun', 'Tiring', 'Scary'], answer: 'Fun', explanation: '原文说"The trip was fun"。' },
    ],
    difficulty: 'easy',
    topic: '学校生活',
  },
  // ==================== p3r-003 ====================
  {
    id: 'p3r-003',
    title: 'My Best Friend',
    titleZh: '我最好的朋友',
    article: `Emma is my best friend. She lives next door to me. We have known each other for six years. Emma is fourteen years old and I am thirteen. She is very good at sports, especially swimming and tennis. Every Sunday, we go to the park together. Emma helps me with my maths homework because she is very clever. I help her with English because I like reading books. We sometimes have sleepovers at each other\'s houses. Emma is like a sister to me.`,
    articleZh: `Emma 是我最好的朋友。她住在我隔壁。我们认识彼此已经六年了。Emma 十四岁，我十三岁。她非常擅长运动，特别是游泳和网球。每个星期天，我们一起去公园。Emma 帮我做数学作业，因为她很聪明。我帮她学英语，因为我喜欢读书。我们有时在彼此家里过夜。Emma 对我来说就像姐姐一样。`,
    questions: [
      { id: 'rc003-1', question: 'How long have they known each other?', questionZh: '他们认识彼此多久了？', options: ['Three years', 'Five years', 'Six years', 'Ten years'], answer: 'Six years', explanation: '原文说"We have known each other for six years"。' },
      { id: 'rc003-2', question: 'How old is Emma?', questionZh: 'Emma 几岁？', options: ['12', '13', '14', '15'], answer: '14', explanation: '原文说"Emma is fourteen years old"。' },
      { id: 'rc003-3', question: 'What sports is Emma good at?', questionZh: 'Emma 擅长什么运动？', options: ['Fotball and basketball', 'Swimming and tennis', 'Running and jumping', 'Table tennis and badminton'], answer: 'Swimming and tennis', explanation: '原文说"She is very good at sports, especially swimming and tennis"。' },
      { id: 'rc003-4', question: 'What do they do every Sunday?', questionZh: '他们每个星期天做什么？', options: ['Go to school', 'Go to the park', 'Go shopping', 'Go to the cinema'], answer: 'Go to the park', explanation: '原文说"Every Sunday, we go to the park together"。' },
      { id: 'rc003-5', question: 'What does Emma help the writer with?', questionZh: 'Emma 帮作者做什么？', options: ['English', 'Maths', 'Science', 'History'], answer: 'Maths', explanation: '原文说"Emma helps me with my maths homework"。' },
      { id: 'rc003-6', question: 'What does the writer help Emma with?', questionZh: '作者帮 Emma 做什么？', options: ['Maths', 'English', 'Music', 'Art'], answer: 'English', explanation: '原文说"I help her with English"。' },
      { id: 'rc003-7', question: 'How does the writer feel about Emma?', questionZh: '作者觉得 Emma 怎么样？', options: ['She is like a teacher', 'She is like a sister', 'She is like a cousin', 'She is like a classmate'], answer: 'She is like a sister', explanation: '原文说"Emma is like a sister to me"。' },
    ],
    difficulty: 'easy',
    topic: '友谊',
  },

  {
    id: 'p3r-004',
    title: 'My Favourite Sport',
    titleZh: '我最喜欢的运动',
    article: `Football is my favourite sport. I play football every Saturday with my friends. We have a small team and we practice at the local park. Our coach is Mr Brown. He is very kind and teaches us new skills. Last month, we had a match with another school. We won 3-1! I was very happy. Football is not just a sport to me, it is my passion. I want to be a professional football player when I grow up.`,
    articleZh: `足球是我最喜欢的运动。我每周六都和朋友们踢足球。我们有一个小队，在当地的公园练习。我们的教练是 Brown 先生。他非常友善，教我们新技能。上个月，我们和另一所学校进行了一场比赛。我们3比1赢了！我非常开心。足球对我来说不仅是一项运动，它是我的热情所在。我长大后想成为一名职业足球运动员。`,
    questions: [
      {
        id: 'rc004-1', question: 'When does the writer play football?', questionZh: '作者什么时候踢足球？',
        options: [
          'Every Friday',
          'Every Saturday',
          'Every Sunday',
          'Every Monday',
        ],
        answer: 'Every Saturday', explanation: '原文说"I play football every Saturday"。',
      },
      {
        id: 'rc004-2', question: 'Where do they practice?', questionZh: '他们在哪里练习？',
        options: [
          'At school',
          'At the local park',
          'At home',
          'At the gym',
        ],
        answer: 'At the local park', explanation: '原文说"practice at the local park"。',
      },
      {
        id: 'rc004-3', question: 'Who is their coach?', questionZh: '他们的教练是谁？',
        options: [
          'Mr Smith',
          'Mr Brown',
          'Mr Jones',
          'Mr White',
        ],
        answer: 'Mr Brown', explanation: '原文说"Our coach is Mr Brown"。',
      },
      {
        id: 'rc004-4', question: 'What was the score of the match?', questionZh: '比赛的比分是多少？',
        options: [
          '2-1',
          '3-1',
          '3-2',
          '4-1',
        ],
        answer: '3-1', explanation: '原文说"We won 3-1!"。',
      },
      {
        id: 'rc004-5', question: 'What does the writer want to be?', questionZh: '作者想成为什么？',
        options: [
          'A teacher',
          'A doctor',
          'A professional football player',
          'A coach',
        ],
        answer: 'A professional football player', explanation: '原文说"want to be a professional football player"。',
      },
      {
        id: 'rc004-6', question: 'How does the writer feel about football?', questionZh: '作者对足球感觉如何？',
        options: [
          'It is just a sport',
          'It is his passion',
          'It is boring',
          'It is difficult',
        ],
        answer: 'It is his passion', explanation: '原文说"Football is not just a sport to me, it is my passion。"。',
      },
      {
        id: 'rc004-7', question: 'How many people are in the team?', questionZh: '队伍里有多少人？',
        options: [
          'A big team',
          'A small team',
          'A medium team',
          'Not mentioned',
        ],
        answer: 'A small team', explanation: '原文说"We have a small team"。',
      },
    ],
    difficulty: 'easy',
    topic: '体育运动',
  },

  {
    id: 'p3r-005',
    title: 'A Day at the Beach',
    titleZh: '海滩的一天',
    article: `Last summer, my family went to the beach. The weather was sunny and hot. We left home at 8 o'clock in the morning. The journey took two hours by car. When we arrived, we put up our umbrellas and changed into our swimsuits. My dad and I played beach volleyball. My mum read a book under the umbrella. My sister built a sandcastle. We had a picnic for lunch. In the afternoon, we went swimming in the sea. The water was cold but fun. We went home at 6 pm. It was a wonderful day.`,
    articleZh: `去年夏天，我的家人去了海滩。天气晴朗炎热。我们早上8点离开家。车程花了两小时。当我们到达时，我们撑起伞，换上泳衣。我爸爸和我打沙滩排球。我妈妈在伞下看书。我姐姐建了一个沙堡。我们午饭吃了野餐。下午，我们去海里游泳。水很冷但很有趣。我们下午6点回家。那是美好的一天。`,
    questions: [
      {
        id: 'rc005-1', question: 'When did they go to the beach?', questionZh: '他们什么时候去的海滩？',
        options: [
          'Last winter',
          'Last summer',
          'Last spring',
          'Last autumn',
        ],
        answer: 'Last summer', explanation: '原文说"Last summer, my family went to the beach。"。',
      },
      {
        id: 'rc005-2', question: 'What time did they leave home?', questionZh: '他们几点离开家？',
        options: [
          "7 o'clock",
          "8 o'clock",
          "9 o'clock",
          "10 o'clock",
        ],
        answer: "8 o'clock", explanation: '原文说"We left home at 8 o\'clock"。',
      },
      {
        id: 'rc005-3', question: 'How long was the journey?', questionZh: '车程花了多长时间？',
        options: [
          'One hour',
          'Two hours',
          'Three hours',
          'Four hours',
        ],
        answer: 'Two hours', explanation: '原文说"The journey took two hours"。',
      },
      {
        id: 'rc005-4', question: 'What did the writer\'s dad do?', questionZh: '作者的爸爸做了什么？',
        options: [
          'Read a book',
          'Played beach volleyball',
          'Built a sandcastle',
          'Went swimming',
        ],
        answer: 'Played beach volleyball', explanation: '原文说"My dad and I played beach volleyball。"。',
      },
      {
        id: 'rc005-5', question: 'What did they have for lunch?', questionZh: '他们午饭吃了什么？',
        options: [
          'A restaurant meal',
          'A picnic',
          'Sandwiches',
          'Pizza',
        ],
        answer: 'A picnic', explanation: '原文说"We had a picnic for lunch。"。',
      },
      {
        id: 'rc005-6', question: 'How was the water?', questionZh: '水怎么样？',
        options: [
          'Warm and fun',
          'Cold but fun',
          'Cold and scary',
          'Warm but boring',
        ],
        answer: 'Cold but fun', explanation: '原文说"The water was cold but fun。"。',
      },
      {
        id: 'rc005-7', question: 'What time did they go home?', questionZh: '他们几点回家？',
        options: [
          '4 pm',
          '5 pm',
          '6 pm',
          '7 pm',
        ],
        answer: '6 pm', explanation: '原文说"We went home at 6 pm。"。',
      },
    ],
    difficulty: 'easy',
    topic: '旅行',
  },

  {
    id: 'p3r-006',
    title: 'My Favourite Subject',
    titleZh: '我最喜欢的科目',
    article: `My favourite subject at school is science. I love learning about plants, animals, and the human body. Our science teacher, Mrs Green, is very interesting. She does experiments in class and we learn by doing. Last week, we did an experiment with plants. We planted seeds and watched them grow. It was amazing to see the little plants come out of the soil. I want to be a scientist when I grow up. I hope to discover new things and help the world.`,
    articleZh: `我在学校最喜欢的科目是科学。我热爱学习关于植物、动物和人体的知识。我们的科学老师 Green 夫人非常有趣。她在课上做实验，我们通过实践学习。上周，我们做了一个关于植物的实验。我们种下种子，看着它们生长。看到小植物从土壤里长出来真是太神奇了。我长大后想成为一名科学家。我希望发现新事物，帮助世界。`,
    questions: [
      {
        id: 'rc006-1', question: 'What is the writer\'s favourite subject?', questionZh: '作者最喜欢的科目是什么？',
        options: [
          'Maths',
          'English',
          'Science',
          'History',
        ],
        answer: 'Science', explanation: '原文说"My favourite subject at school is science。"。',
      },
      {
        id: 'rc006-2', question: 'Who is the science teacher?', questionZh: '科学老师是谁？',
        options: [
          'Mr Brown',
          'Mrs Green',
          'Miss Smith',
          'Mrs White',
        ],
        answer: 'Mrs Green', explanation: '原文说"Our science teacher, Mrs Green"。',
      },
      {
        id: 'rc006-3', question: 'What did they do last week?', questionZh: '上周他们做了什么？',
        options: [
          'A maths test',
          'A science experiment',
          'A history project',
          'An English presentation',
        ],
        answer: 'A science experiment', explanation: '原文说"we did an experiment with plants"。',
      },
      {
        id: 'rc006-4', question: 'What did they plant?', questionZh: '他们种了什么？',
        options: [
          'Flowers',
          'Trees',
          'Seeds',
          'Vegetables',
        ],
        answer: 'Seeds', explanation: '原文说"We planted seeds"。',
      },
      {
        id: 'rc006-5', question: 'What does the writer want to be?', questionZh: '作者想成为什么？',
        options: [
          'A teacher',
          'A doctor',
          'A scientist',
          'An engineer',
        ],
        answer: 'A scientist', explanation: '原文说"want to be a scientist"。',
      },
      {
        id: 'rc006-6', question: 'How does the writer feel about science?', questionZh: '作者对科学感觉如何？',
        options: [
          'Boring',
          'Difficult',
          'Amazing',
          'Easy',
        ],
        answer: 'Amazing', explanation: '原文说"It was amazing"。',
      },
      {
        id: 'rc006-7', question: 'How do they learn science?', questionZh: '他们如何学习科学？',
        options: [
          'By reading books',
          'By watching videos',
          'By doing experiments',
          'By listening to the teacher',
        ],
        answer: 'By doing experiments', explanation: '原文说"we learn by doing"。',
      },
    ],
    difficulty: 'easy',
    topic: '学校生活',
  },

  {
    id: 'p3r-007',
    title: 'A Visit to the Museum',
    titleZh: '参观博物馆',
    article: `Last Saturday, my class went on a trip to the museum. We saw many interesting things there. First, we saw old coins and tools from thousands of years ago. Then, we saw dinosaur bones. They were huge! After that, we went to the art section and saw beautiful paintings. My favourite was a painting of a sunset. At the end of the trip, we bought souvenirs from the gift shop. I bought a postcard. I learned a lot from this trip and I want to go again.`,
    articleZh: `上周六，我的班级去博物馆旅行。我们在那里看到了很多有趣的东西。首先，我们看到了几千年前的古硬币和工具。然后，我们看到了恐龙骨头。它们巨大！之后，我们去了艺术区，看到了美丽的画作。我最喜欢的是一幅日落画。在旅行结束时，我们从礼品店买了纪念品。我买了一张明信片。我从这次旅行中学到了很多，我想再去一次。`,
    questions: [
      {
        id: 'rc007-1', question: 'When did they visit the museum?', questionZh: '他们什么时候参观博物馆的？',
        options: [
          'Last Friday',
          'Last Saturday',
          'Last Sunday',
          'Last Monday',
        ],
        answer: 'Last Saturday', explanation: '原文说"Last Saturday, my class went on a trip to the museum。"。',
      },
      {
        id: 'rc007-2', question: 'What did they see first?', questionZh: '他们首先看到了什么？',
        options: [
          'Dinosaur bones',
          'Old coins and tools',
          'Beautiful paintings',
          'Souvenirs',
        ],
        answer: 'Old coins and tools', explanation: '原文说"First, we saw old coins and tools"。',
      },
      {
        id: 'rc007-3', question: 'What were huge?', questionZh: '什么很巨大？',
        options: [
          'The paintings',
          'The coins',
          'The dinosaur bones',
          'The tools',
        ],
        answer: 'The dinosaur bones', explanation: '原文说"dinosaur bones. They were huge!"。',
      },
      {
        id: 'rc007-4', question: 'What was the writer\'s favourite?', questionZh: '作者最喜欢什么？',
        options: [
          'A dinosaur bone',
          'An old coin',
          'A painting of a sunset',
          'A souvenir',
        ],
        answer: 'A painting of a sunset', explanation: '原文说"My favourite was a painting of a sunset。"。',
      },
      {
        id: 'rc007-5', question: 'What did the writer buy?', questionZh: '作者买了什么？',
        options: [
          'A book',
          'A souvenir',
          'A postcard',
          'A painting',
        ],
        answer: 'A postcard', explanation: '原文说"I bought a postcard。"。',
      },
      {
        id: 'rc007-6', question: 'How did the writer feel about the trip?', questionZh: '作者对这次旅行感觉如何？',
        options: [
          'Boring',
          'Tiring',
          'Learned a lot',
          'Scary',
        ],
        answer: 'Learned a lot', explanation: '原文说"I learned a lot from this trip"。',
      },
      {
        id: 'rc007-7', question: 'Where did they buy souvenirs?', questionZh: '他们在哪里买纪念品？',
        options: [
          'At the entrance',
          'At the gift shop',
          'At the art section',
          'At the dinosaur section',
        ],
        answer: 'At the gift shop', explanation: '原文说"from the gift shop"。',
      },
    ],
    difficulty: 'easy',
    topic: '学校生活',
  },

  {
    id: 'p3r-008',
    title: 'My Favourite Food',
    titleZh: '我最喜欢的食物',
    article: `My favourite food is pizza. I like pizza because it is delicious and easy to eat. My favourite topping is pepperoni. I also like cheese and mushrooms. My mum sometimes makes pizza at home. She uses flour, tomato sauce, cheese, and different toppings. We put the pizza in the oven and wait for 20 minutes. When it is ready, we eat it with salad. I also like to drink cola with my pizza. Pizza is the best food in the world!`,
    articleZh: `我最喜欢的食物是披萨。我喜欢披萨，因为它美味且容易吃。我最喜欢的配料是意大利辣香肠。我也喜欢奶酪和蘑菇。我妈妈有时在家做披萨。她用面粉、番茄酱、奶酪和不同的配料。我们把披萨放进烤箱，等20分钟。当披萨做好时，我们配着沙拉吃。我也喜欢配可乐喝。披萨是世界上最好的食物！`,
    questions: [
      {
        id: 'rc008-1', question: 'What is the writer\'s favourite food?', questionZh: '作者最喜欢的食物是什么？',
        options: [
          'Hamburger',
          'Pizza',
          'Sandwich',
          'Cake',
        ],
        answer: 'Pizza', explanation: '原文说"My favourite food is pizza。"。',
      },
      {
        id: 'rc008-2', question: 'What is the writer\'s favourite topping?', questionZh: '作者最喜欢的配料是什么？',
        options: [
          'Cheese',
          'Mushrooms',
          'Pepperoni',
          'Tomato',
        ],
        answer: 'Pepperoni', explanation: '原文说"My favourite topping is pepperoni。"。',
      },
      {
        id: 'rc008-3', question: 'Who makes pizza at home?', questionZh: '谁在家做披萨？',
        options: [
          'The writer',
          'The writer\'s dad',
          'The writer\'s mum',
          'The writer\'s sister',
        ],
        answer: 'The writer\'s mum', explanation: '原文说"My mum sometimes makes pizza at home。"。',
      },
      {
        id: 'rc008-4', question: 'How long do they wait for the pizza?', questionZh: '他们等披萨多长时间？',
        options: [
          '10 minutes',
          '15 minutes',
          '20 minutes',
          '30 minutes',
        ],
        answer: '20 minutes', explanation: '原文说"wait for 20 minutes"。',
      },
      {
        id: 'rc008-5', question: 'What do they eat with pizza?', questionZh: '他们配什么吃披萨？',
        options: [
          'Chips',
          'Salad',
          'Rice',
          'Bread',
        ],
        answer: 'Salad', explanation: '原文说"eat it with salad"。',
      },
      {
        id: 'rc008-6', question: 'What does the writer drink with pizza?', questionZh: '作者配什么喝披萨？',
        options: [
          'Water',
          'Juice',
          'Milk',
          'Cola',
        ],
        answer: 'Cola', explanation: '原文说"drink cola with my pizza"。',
      },
      {
        id: 'rc008-7', question: 'How does the writer feel about pizza?', questionZh: '作者对披萨感觉如何？',
        options: [
          'It is okay',
          'It is the best food',
          'It is too expensive',
          'It is unhealthy',
        ],
        answer: 'It is the best food', explanation: '原文说"Pizza is the best food in the world!"。',
      },
    ],
    difficulty: 'easy',
    topic: '食物',
  },

  {
    id: 'p3r-009',
    title: 'My Pet',
    titleZh: '我的宠物',
    article: `I have a pet dog. His name is Max. He is a golden retriever and he is three years old. Max is very friendly and loves playing with me. Every day, I take him for a walk in the park. He likes chasing balls and playing with other dogs. Max also likes eating. His favourite food is dog biscuits. Sometimes, he steals food from the table! At night, Max sleeps in a basket in my bedroom. I love my dog very much. He is my best friend.`,
    articleZh: `我有一只宠物狗。他的名字叫 Max。他是一只金毛寻回犬，三岁。Max 非常友好，喜欢和我一起玩。每天，我带他去公园散步。他喜欢追球和与其他狗玩。Max 也喜欢吃东西。他最喜欢的食物是狗饼干。有时，他从桌子上偷食物！晚上，Max 睡在我卧室的篮子里。我非常爱我的狗。他是我最好的朋友。`,
    questions: [
      {
        id: 'rc009-1', question: 'What is the dog\'s name?', questionZh: '狗的名字是什么？',
        options: [
          'Buddy',
          'Max',
          'Charlie',
          'Rocky',
        ],
        answer: 'Max', explanation: '原文说"His name is Max。"。',
      },
      {
        id: 'rc009-2', question: 'How old is the dog?', questionZh: '狗几岁了？',
        options: [
          'Two years old',
          'Three years old',
          'Four years old',
          'Five years old',
        ],
        answer: 'Three years old', explanation: '原文说"he is three years old"。',
      },
      {
        id: 'rc009-3', question: 'What breed is the dog?', questionZh: '狗是什么品种？',
        options: [
          'Labrador',
          'Golden retriever',
          'German shepherd',
          'Husky',
        ],
        answer: 'Golden retriever', explanation: '原文说"He is a golden retriever"。',
      },
      {
        id: 'rc009-4', question: 'What does the dog like doing?', questionZh: '狗喜欢做什么？',
        options: [
          'Sleeping',
          'Eating and playing',
          'Running and jumping',
          'Barking',
        ],
        answer: 'Eating and playing', explanation: '原文说"loves playing"和"likes eating"。',
      },
      {
        id: 'rc009-5', question: 'What is the dog\'s favourite food?', questionZh: '狗最喜欢的食物是什么？',
        options: [
          'Meat',
          'Dog biscuits',
          'Bones',
          'Vegetables',
        ],
        answer: 'Dog biscuits', explanation: '原文说"His favourite food is dog biscuits。"。',
      },
      {
        id: 'rc009-6', question: 'Where does the dog sleep?', questionZh: '狗睡在哪里？',
        options: [
          'In the garden',
          'In the kitchen',
          'In a basket in the bedroom',
          'In the living room',
        ],
        answer: 'In a basket in the bedroom', explanation: '原文说"sleeps in a basket in my bedroom"。',
      },
      {
        id: 'rc009-7', question: 'How does the writer feel about the dog?', questionZh: '作者对狗感觉如何？',
        options: [
          'He is just a pet',
          'He is his best friend',
          'He is sometimes annoying',
          'He is too big',
        ],
        answer: 'He is his best friend', explanation: '原文说"He is my best friend。"。',
      },
    ],
    difficulty: 'easy',
    topic: '宠物',
  },

  {
    id: 'p3r-010',
    title: 'My Favourite Book',
    titleZh: '我最喜欢的书',
    article: `My favourite book is "Harry Potter and the Philosopher's Stone". I have read it five times! The story is about a young boy called Harry who discovers he is a wizard. He goes to Hogwarts School of Witchcraft and Wizardry. There, he makes two best friends: Ron and Hermione. Together, they have many adventures. My favourite character is Hermione because she is smart and brave. I like the book because it is exciting and magical. I hope to read all the Harry Potter books one day.`,
    articleZh: `我最喜欢的书是《哈利·波特与魔法石》。我已经读了五遍了！这个故事是关于一个叫哈利的年轻男孩，他发现自己是个巫师。他去霍格沃茨魔法学校上学。在那里，他交了两个最好的朋友：Ron 和 Hermione。他们一起经历了许多冒险。我最喜欢的角色是 Hermione，因为她聪明勇敢。我喜欢这本书，因为它激动人心且充满魔力。我希望有一天能读完所有的哈利·波特书。`,
    questions: [
      {
        id: 'rc010-1', question: 'What is the writer\'s favourite book?', questionZh: '作者最喜欢的书是什么？',
        options: [
          'The Lord of the Rings',
          'Harry Potter and the Philosopher\'s Stone',
          'The Hobbit',
          'Alice in Wonderland',
        ],
        answer: 'Harry Potter and the Philosopher\'s Stone', explanation: '原文说"My favourite book is Harry Potter and the Philosopher\'s Stone。"。',
      },
      {
        id: 'rc010-2', question: 'How many times has the writer read it?', questionZh: '作者读了多少遍了？',
        options: [
          'Three times',
          'Four times',
          'Five times',
          'Six times',
        ],
        answer: 'Five times', explanation: '原文说"I have read it five times!"。',
      },
      {
        id: 'rc010-3', question: 'What is Harry?', questionZh: '哈利是什么？',
        options: [
          'A wizard',
          'A teacher',
          'A soldier',
          'A doctor',
        ],
        answer: 'A wizard', explanation: '原文说"discovers he is a wizard"。',
      },
      {
        id: 'rc010-4', question: 'What are the names of Harry\'s friends?', questionZh: '哈利的朋友叫什么名字？',
        options: [
          'Ron and Hermione',
          'Harry and Ron',
          'Hermione and Harry',
          'Ron and Draco',
        ],
        answer: 'Ron and Hermione', explanation: '原文说"he makes two best friends: Ron and Hermione。"。',
      },
      {
        id: 'rc010-5', question: 'Who is the writer\'s favourite character?', questionZh: '作者最喜欢的角色是谁？',
        options: [
          'Harry',
          'Ron',
          'Hermione',
          'Dumbledore',
        ],
        answer: 'Hermione', explanation: '原文说"My favourite character is Hermione"。',
      },
      {
        id: 'rc010-6', question: 'Why does the writer like the book?', questionZh: '作者为什么喜欢这本书？',
        options: [
          'It is funny',
          'It is exciting and magical',
          'It is scary',
          'It is educational',
        ],
        answer: 'It is exciting and magical', explanation: '原文说"because it is exciting and magical"。',
      },
      {
        id: 'rc010-7', question: 'What does the writer hope to do?', questionZh: '作者希望做什么？',
        options: [
          'Write a book',
          'Read all the Harry Potter books',
          'Meet the author',
          'Watch the movies',
        ],
        answer: 'Read all the Harry Potter books', explanation: '原文说"hope to read all the Harry Potter books one day"。',
      },
    ],
    difficulty: 'medium',
    topic: '阅读',
  },

// =================== 新增阅读选择(medium难度) ===================
// 生成于 2026-06-09
// 共10篇：p3r-011 到 p3r-020
// 已修正重复ID问题

  {
    id: 'p3r-011',
    title: 'A School Science Project',
    titleZh: '学校科学项目',
    article: `Last month, Class 7B did a science project about plants. Their teacher, Mrs Green, asked them to grow their own plants from seeds. Each student got a small pot, some soil, and three bean seeds.

The students had to water their plants every day and write down what they saw. Tom's plant grew very fast. After two weeks, it was 30 cm tall! But Lucy's plant did not grow at all. She was sad, but Mrs Green said, "Don't worry. Sometimes seeds don't grow."

At the end of the project, the class had a small exhibition. Parents came to see the plants. Tom's plant won a prize for being the tallest. Tom was very happy and decided to be a gardener when he grows up.`,
    articleZh: `上个月，7B班做了一个关于植物的科学项目。他们的老师Green夫人让他们自己从种子开始种植物。每个学生得到一个花盆、一些土壤和三颗豆子种子。

学生们必须每天给植物浇水，并写下他们看到的情况。Tom的植物长得非常快。两周后，它有30厘米高！但Lucy的植物根本没长。她很伤心，但Green夫人说："别担心，有时种子不会发芽。"

项目结束时，班级举办了一个小型展览。家长们来看植物。Tom的植物因为最高而获奖。Tom非常高兴，决定长大后当一名园丁。`,
    questions: [
      {
        id: 'rc011-1',
        question: 'What did Class 7B do last month?',
        questionZh: '7B班上个月做了什么？',
        options: ["A maths test", "A science project", "A history presentation", "An English play"],
        answer: 'A science project',
        explanation: '原文说"Class 7B did a science project"',
      },
      {
        id: 'rc011-2',
        question: 'What did each student get?',
        questionZh: '每个学生得到了什么？',
        options: ["A small pot, soil and seeds", "A book about plants", "A small tree", "A bag of fruits"],
        answer: 'A small pot, soil and seeds',
        explanation: '原文说"each student got a small pot, some soil, and three bean seeds"',
      },
      {
        id: 'rc011-3',
        question: 'How tall was Tom\'s plant after two weeks?',
        questionZh: '两周后Tom的植物有多高？',
        options: ["10 cm", "20 cm", "30 cm", "40 cm"],
        answer: '30 cm',
        explanation: '原文说"it was 30 cm tall"',
      },
      {
        id: 'rc011-4',
        question: 'Why was Lucy sad?',
        questionZh: 'Lucy为什么伤心？',
        options: ["Her plant grew too fast", "Her plant did not grow", "She lost her seeds", "She forgot to water her plant"],
        answer: 'Her plant did not grow',
        explanation: '原文说"Lucy\'s plant did not grow at all"',
      },
      {
        id: 'rc011-5',
        question: 'What prize did Tom\'s plant win?',
        questionZh: 'Tom的植物获得了什么奖？',
        options: ["The most beautiful", "The tallest", "The smallest", "The oldest"],
        answer: 'The tallest',
        explanation: '原文说"Tom\'s plant won a prize for being the tallest"',
      },
      {
        id: 'rc011-6',
        question: 'What does Tom want to be when he grows up?',
        questionZh: 'Tom长大后想成为什么？',
        options: ["A teacher", "A doctor", "A gardener", "A scientist"],
        answer: 'A gardener',
        explanation: '原文说"decided to be a gardener"',
      },
      {
        id: 'rc011-7',
        question: 'Who is the science teacher?',
        questionZh: '科学老师是谁？',
        options: ["Mr Brown", "Mrs Green", "Miss White", "Mrs Black"],
        answer: 'Mrs Green',
        explanation: '原文说"Their teacher, Mrs Green"',
      },
    ],
    difficulty: 'medium',
    topic: '学校生活',
  },
  // =================== 下一篇 ===================
  {
    id: 'p3r-012',
    title: 'A Visit to the Zoo',
    titleZh: '参观动物园',
    article: `Last Sunday, my family and I went to the zoo. We saw many animals there. First, we saw the giraffes. They were very tall. Then we saw the lions. They were sleeping. After that, we saw the pandas. They were eating bamboo. We took many photos. We had a picnic for lunch. In the afternoon, we went to the aquarium. We saw many fish and sea animals. My favourite was the dolphin show. The dolphins were very clever and could do many tricks. We went home at 6 pm. It was a wonderful day.`,
    articleZh: `上周日，我的家人和我去了动物园。我们在那里看到了很多动物。首先，我们看到了长颈鹿。它们非常高。然后我们看到了狮子。它们在睡觉。之后，我们看到了熊猫。它们在吃竹子。我们拍了很多照片。我们午饭吃了野餐。下午，我们去了水族馆。我们看到了很多鱼和海洋动物。我最喜欢的是海豚表演。海豚非常聪明，会做很多把戏。我们下午6点回家。那是美好的一天。`,
    questions: [
      {
        id: 'rc012-1',
        question: 'When did they visit the zoo?',
        questionZh: '他们什么时候参观的动物园？',
        options: ["Last Saturday", "Last Sunday", "Last Friday", "Last Monday"],
        answer: 'Last Sunday',
        explanation: '原文说"Last Sunday, my family and I went to the zoo"',
      },
      {
        id: 'rc012-2',
        question: 'What animals were very tall?',
        questionZh: '什么动物非常高？',
        options: ["Lions", "Pandas", "Giraffes", "Dolphins"],
        answer: 'Giraffes',
        explanation: '原文说"the giraffes. They were very tall"',
      },
      {
        id: 'rc012-3',
        question: 'What were the lions doing?',
        questionZh: '狮子在做什么？',
        options: ["Eating bamboo", "Sleeping", "Playing", "Swimming"],
        answer: 'Sleeping',
        explanation: '原文说"They were sleeping"',
      },
      {
        id: 'rc012-4',
        question: 'What did they see in the afternoon?',
        questionZh: '他们下午看到了什么？',
        options: ["The giraffes", "The lions", "The pandas", "The aquarium"],
        answer: 'The aquarium',
        explanation: '原文说"we went to the aquarium"',
      },
      {
        id: 'rc012-5',
        question: 'What was the writer\'s favourite?',
        questionZh: '作者最喜欢什么？',
        options: ["The giraffe", "The lion", "The panda", "The dolphin show"],
        answer: 'The dolphin show',
        explanation: '原文说"My favourite was the dolphin show"',
      },
      {
        id: 'rc012-6',
        question: 'Why were the dolphins clever?',
        questionZh: '为什么海豚很聪明？',
        options: ["They could swim fast", "They could do many tricks", "They could jump high", "They could sing"],
        answer: 'They could do many tricks',
        explanation: '原文说"could do many tricks"',
      },
      {
        id: 'rc012-7',
        question: 'What time did they go home?',
        questionZh: '他们几点回家的？',
        options: ["4 pm", "5 pm", "6 pm", "7 pm"],
        answer: '6 pm',
        explanation: '原文说"We went home at 6 pm"',
      },
    ],
    difficulty: 'medium',
    topic: '旅行',
  },
  // =================== 下一篇 ===================
  {
    id: 'p3r-013',
    title: 'My Best Friend Emma',
    titleZh: '我最好的朋友Emma',
    article: `Emma is my best friend. She lives next door to me. We have known each other for six years. Emma is fourteen years old and I am thirteen. She is very good at sports, especially swimming and tennis. Every Sunday, we go to the park together. Emma helps me with my maths homework because she is very clever. I help her with English because I like reading books. We sometimes have sleepovers at each other's houses. Emma is like a sister to me. She always listens to my problems and gives me good advice.`,
    articleZh: `Emma是我最好的朋友。她住在我隔壁。我们认识彼此已经六年了。Emma十四岁，我十三岁。她非常擅长运动，特别是游泳和网球。每个星期天，我们一起去公园。Emma帮我做数学作业，因为她很聪明。我帮她学英语，因为我喜欢读书。我们有时在彼此家里过夜。Emma对我来说就像姐姐一样。她总是听我的问题，并给我好建议。`,
    questions: [
      {
        id: 'rc013-1',
        question: 'How long have they known each other?',
        questionZh: '他们认识彼此多久了？',
        options: ["Three years", "Five years", "Six years", "Ten years"],
        answer: 'Six years',
        explanation: '原文说"We have known each other for six years"',
      },
      {
        id: 'rc013-2',
        question: 'How old is Emma?',
        questionZh: 'Emma几岁？',
        options: ["12", "13", "14", "15"],
        answer: '14',
        explanation: '原文说"Emma is fourteen years old"',
      },
      {
        id: 'rc013-3',
        question: 'What sports is Emma good at?',
        questionZh: 'Emma擅长什么运动？',
        options: ["Football and basketball", "Swimming and tennis", "Running and jumping", "Table tennis and badminton"],
        answer: 'Swimming and tennis',
        explanation: '原文说"She is very good at sports, especially swimming and tennis"',
      },
      {
        id: 'rc013-4',
        question: 'What do they do every Sunday?',
        questionZh: '他们每个星期天做什么？',
        options: ["Go to school", "Go to the park", "Go shopping", "Go to the cinema"],
        answer: 'Go to the park',
        explanation: '原文说"Every Sunday, we go to the park together"',
      },
      {
        id: 'rc013-5',
        question: 'What does Emma help the writer with?',
        questionZh: 'Emma帮作者做什么？',
        options: ["English", "Maths", "Science", "History"],
        answer: 'Maths',
        explanation: '原文说"Emma helps me with my maths homework"',
      },
      {
        id: 'rc013-6',
        question: 'What does the writer help Emma with?',
        questionZh: '作者帮Emma做什么？',
        options: ["Maths", "English", "Music", "Art"],
        answer: 'English',
        explanation: '原文说"I help her with English"',
      },
      {
        id: 'rc013-7',
        question: 'How does the writer feel about Emma?',
        questionZh: '作者对Emma感觉如何？',
        options: ["She is like a teacher", "She is like a sister", "She is like a cousin", "She is like a classmate"],
        answer: 'She is like a sister',
        explanation: '原文说"Emma is like a sister to me"',
      },
    ],
    difficulty: 'medium',
    topic: '友谊',
  },
  // =================== 下一篇 ===================
  {
    id: 'p3r-014',
    title: 'The Importance of Sleep',
    titleZh: '睡眠的重要性',
    article: `Sleep is very important for our health. Children need about 10 hours of sleep every night. Teenagers need about 8 to 9 hours. When we sleep, our bodies rest and repair themselves. Sleep also helps our brains to work properly. If we do not get enough sleep, we may feel tired, grumpy and find it hard to concentrate. To sleep well, we should go to bed at the same time every night. We should also avoid using phones or computers before bedtime. A dark, quiet room is best for sleeping. Good sleep habits help us to stay healthy and happy.`,
    articleZh: `睡眠对我们的健康非常重要。儿童每晚需要约10小时的睡眠。青少年需要约8到9小时。当我们睡觉时，我们的身体休息并自我修复。睡眠还帮助我们的大脑正常工作。如果我们没有获得足够的睡眠，我们可能会感到疲倦、暴躁，并且发现很难集中注意力。为了睡得好，我们应该每晚在同一时间上床睡觉。我们还应该避免在睡前使用手机或电脑。黑暗、安静的房间最适合睡觉。良好的睡眠习惯帮助我们保持健康和快乐。`,
    questions: [
      {
        id: 'rc014-1',
        question: 'How many hours of sleep do children need?',
        questionZh: '儿童需要多少小时的睡眠？',
        options: ["6-7 hours", "8-9 hours", "About 10 hours", "12 hours"],
        answer: 'About 10 hours',
        explanation: '原文说"Children need about 10 hours of sleep every night"',
      },
      {
        id: 'rc014-2',
        question: 'How many hours of sleep do teenagers need?',
        questionZh: '青少年需要多少小时的睡眠？',
        options: ["6-7 hours", "8-9 hours", "10 hours", "12 hours"],
        answer: '8-9 hours',
        explanation: '原文说"Teenagers need about 8 to 9 hours"',
      },
      {
        id: 'rc014-3',
        question: 'What happens to our bodies when we sleep?',
        questionZh: '当我们睡觉时，我们的身体发生什么？',
        options: ["They stop working", "They rest and repair themselves", "They become stronger", "They become weaker"],
        answer: 'They rest and repair themselves',
        explanation: '原文说"our bodies rest and repair themselves"',
      },
      {
        id: 'rc014-4',
        question: 'What happens if we don\'t get enough sleep?',
        questionZh: '如果我们没有获得足够的睡眠会怎样？',
        options: ["We feel happy", "We feel tired and grumpy", "We feel energetic", "We feel hungry"],
        answer: 'We feel tired and grumpy',
        explanation: '原文说"we may feel tired, grumpy and find it hard to concentrate"',
      },
      {
        id: 'rc014-5',
        question: 'What should we avoid before bedtime?',
        questionZh: '我们应该在睡前避免什么？',
        options: ["Drinking water", "Using phones or computers", "Reading books", "Listening to music"],
        answer: 'Using phones or computers',
        explanation: '原文说"avoid using phones or computers before bedtime"',
      },
      {
        id: 'rc014-6',
        question: 'What is the best room for sleeping?',
        questionZh: '什么样的房间最适合睡觉？',
        options: ["A bright, noisy room", "A dark, quiet room", "A warm, crowded room", "A cold, wet room"],
        answer: 'A dark, quiet room',
        explanation: '原文说"A dark, quiet room is best for sleeping"',
      },
      {
        id: 'rc014-7',
        question: 'What do good sleep habits help us do?',
        questionZh: '良好的睡眠习惯帮助我们做什么？',
        options: ["Stay healthy and happy", "Become smarter", "Grow taller", "Become stronger"],
        answer: 'Stay healthy and happy',
        explanation: '原文说"Good sleep habits help us to stay healthy and happy"',
      },
    ],
    difficulty: 'medium',
    topic: '健康',
  },
  // =================== 下一篇 ===================
  {
    id: 'p3r-015',
    title: 'The Internet',
    titleZh: '互联网',
    article: `The Internet is a useful tool that connects people all over the world. We can use the Internet to find information, communicate with others, and entertain ourselves. Search engines like Google help us to find information quickly. We can also use email and social media to stay in touch with friends and family. Online shopping is another popular use of the Internet. We can buy almost anything online and have it delivered to our homes. However, we should be careful when using the Internet. We should not share personal information with strangers. We should also be aware of fake news and cyberbullying. Used wisely, the Internet can greatly improve our lives.`,
    articleZh: `互联网是一个有用的工具，连接着全世界的人们。我们可以使用互联网查找信息、与他人交流以及娱乐。像谷歌这样的搜索引擎帮助我们快速找到信息。我们还可以使用电子邮件和社交媒体与朋友和家人保持联系。在线购物是互联网的另一个流行用途。我们几乎可以在网上购买任何东西，并让它送到我们家。然而，我们在使用互联网时应该小心。我们不应该与陌生人分享个人信息。我们还应该警惕假新闻和网络欺凌。明智地使用，互联网可以极大地改善我们的生活。`,
    questions: [
      {
        id: 'rc015-1',
        question: 'What is the Internet?',
        questionZh: '什么是互联网？',
        options: ["A useful tool", "A dangerous place", "A waste of time", "A type of computer"],
        answer: 'A useful tool',
        explanation: '原文说"The Internet is a useful tool"',
      },
      {
        id: 'rc015-2',
        question: 'What do search engines help us do?',
        questionZh: '搜索引擎帮助我们做什么？',
        options: ["Find information quickly", "Buy things online", "Communicate with others", "Play games"],
        answer: 'Find information quickly',
        explanation: '原文说"Search engines like Google help us to find information quickly"',
      },
      {
        id: 'rc015-3',
        question: 'What can we use to stay in touch with friends?',
        questionZh: '我们可以使用什么与朋友保持联系？',
        options: ["Only phones", "Email and social media", "Only letters", "Only visits"],
        answer: 'Email and social media',
        explanation: '原文说"use email and social media to stay in touch with friends and family"',
      },
      {
        id: 'rc015-4',
        question: 'What is online shopping?',
        questionZh: '什么是在线购物？',
        options: ["Buying things in shops", "Buying almost anything on the Internet", "Selling things to others", "Making things ourselves"],
        answer: 'Buying almost anything on the Internet',
        explanation: '原文说"We can buy almost anything online"',
      },
      {
        id: 'rc015-5',
        question: 'What should we not share online?',
        questionZh: '我们应该不在网上分享什么？',
        options: ["Our favourite books", "Personal information with strangers", "Our hobbies", "Our favourite foods"],
        answer: 'Personal information with strangers',
        explanation: '原文说"We should not share personal information with strangers"',
      },
      {
        id: 'rc015-6',
        question: 'What should we be aware of online?',
        questionZh: '我们应该在网上注意什么？',
        options: ["Only good news", "Fake news and cyberbullying", "Only happy people", "Only interesting videos"],
        answer: 'Fake news and cyberbullying',
        explanation: '原文说"be aware of fake news and cyberbullying"',
      },
      {
        id: 'rc015-7',
        question: 'How can the Internet improve our lives?',
        questionZh: '互联网如何改善我们的生活？',
        options: ["Only if we use it wisely", "Only if we use it for work", "Only if we use it for study", "Only if we use it for games"],
        answer: 'Only if we use it wisely',
        explanation: '原文说"Used wisely, the Internet can greatly improve our lives"',
      },
    ],
    difficulty: 'medium',
    topic: '科技',
  },
  // =================== 下一篇 ===================
  {
    id: 'p3r-016',
    title: 'A School Trip to the Farm',
    titleZh: '学校农场之旅',
    article: `Last week, Class 6A went on a trip to Oak Tree Farm. The farm is about 20 kilometres from the school. The students travelled by bus and the journey took 40 minutes. At the farm, the farmer, Mr Jenkins, showed them around. They saw cows, sheep, pigs and chickens. Some students helped to feed the animals. Lucy gave some bread to the ducks. After that, the students had a picnic lunch in the field. Before they left, Mr Jenkins gave each student a small bag of apples from the farm shop. The trip was both fun and educational.`,
    articleZh: `上周，6A班去橡树农场旅行。农场距离学校约20公里。学生们乘公交车前往，车程40分钟。在农场，农民Jenkins先生带他们参观。他们看到了牛、羊、猪和鸡。一些学生帮忙喂动物。Lucy给鸭子喂了一些面包。之后，学生们在田野里吃了野餐午餐。在他们离开之前，Jenkins先生给每个学生一袋来自农场商店的苹果。这次旅行既有趣又有教育意义。`,
    questions: [
      {
        id: 'rc016-1',
        question: 'How far is the farm from the school?',
        questionZh: '农场距离学校有多远？',
        options: ["10 kilometres", "20 kilometres", "30 kilometres", "40 kilometres"],
        answer: '20 kilometres',
        explanation: '原文说"The farm is about 20 kilometres from the school。"',
      },
      {
        id: 'rc016-2',
        question: 'How did they travel to the farm?',
        questionZh: '他们怎么去农场的？',
        options: ["By train", "By bus", "By car", "By bike"],
        answer: 'By bus',
        explanation: '原文说"The students travelled by bus"',
      },
      {
        id: 'rc016-3',
        question: 'Who showed them around the farm?',
        questionZh: '谁带他们参观农场？',
        options: ["Mr Brown", "Mr Jenkins", "Mrs Green", "Mrs White"],
        answer: 'Mr Jenkins',
        explanation: '原文说"the farmer, Mr Jenkins, showed them around"',
      },
      {
        id: 'rc016-4',
        question: 'What did Lucy give to the ducks?',
        questionZh: 'Lucy给了鸭子什么？',
        options: ["Some bread", "Some cake", "Some rice", "Some fruit"],
        answer: 'Some bread',
        explanation: '原文说"Lucy gave some bread to the ducks"',
      },
      {
        id: 'rc016-5',
        question: 'What did they have for lunch?',
        questionZh: '他们午饭吃了什么？',
        options: ["A restaurant meal", "A picnic", "Sandwiches", "Pizza"],
        answer: 'A picnic',
        explanation: '原文说"had a picnic lunch"',
      },
      {
        id: 'rc016-6',
        question: 'What did Mr Jenkins give them?',
        questionZh: 'Jenkins先生给了他们什么？',
        options: ["A small bag of apples", "A small bag of oranges", "A small bag of books", "A small bag of pens"],
        answer: 'A small bag of apples',
        explanation: '原文说"gave each student a small bag of apples"',
      },
      {
        id: 'rc016-7',
        question: 'How was the trip?',
        questionZh: '这次旅行怎么样？',
        options: ["Boring", "Tiring", "Fun and educational", "Scary"],
        answer: 'Fun and educational',
        explanation: '原文说"The trip was both fun and educational"',
      },
    ],
    difficulty: 'medium',
    topic: '学校生活',
  },
  // =================== 下一篇 ===================
  {
    id: 'p3r-017',
    title: 'My Favourite Hobby',
    titleZh: '我最喜欢的爱好',
    article: `My favourite hobby is photography. I got my first camera when I was ten years old. Now I am thirteen and I have a much better camera. I take photos of people, animals, and landscapes. My favourite place to take photos is the park near my house. There are many beautiful flowers and trees there. Sometimes, I enter photography competitions. Last month, I won a prize for my photo of a sunset. I was very happy. I want to be a professional photographer when I grow up.`,
    articleZh: `我最喜欢的爱好是摄影。我十岁时得到了我的第一台相机。现在我十三岁，我有一台更好的相机。我拍人、动物和风景的照片。我最喜欢拍照的地方是我家附近的公园。那里有许多美丽的花朵和树木。有时，我参加摄影比赛。上个月，我的一张日落照片获奖了。我非常开心。我长大后想成为一名专业摄影师。`,
    questions: [
      {
        id: 'rc017-1',
        question: 'When did the writer get his first camera?',
        questionZh: '作者什么时候得到他的第一台相机？',
        options: ["At age 8", "At age 10", "At age 12", "At age 13"],
        answer: 'At age 10',
        explanation: '原文说"I got my first camera when I was ten years old"',
      },
      {
        id: 'rc017-2',
        question: 'How old is the writer now?',
        questionZh: '作者现在几岁？',
        options: ["10", "11", "12", "13"],
        answer: '13',
        explanation: '原文说"Now I am thirteen"',
      },
      {
        id: 'rc017-3',
        question: 'What does the writer take photos of?',
        questionZh: '作者拍什么的照片？',
        options: ["Only people", "Only animals", "People, animals and landscapes", "Only buildings"],
        answer: 'People, animals and landscapes',
        explanation: '原文说"I take photos of people, animals, and landscapes"',
      },
      {
        id: 'rc017-4',
        question: 'Where is the writer\'s favourite place to take photos?',
        questionZh: '作者最喜欢在哪里拍照？',
        options: ["At the zoo", "At the park near his house", "At the school", "At the beach"],
        answer: 'At the park near his house',
        explanation: '原文说"My favourite place to take photos is the park near my house"',
      },
      {
        id: 'rc017-5',
        question: 'What prize did the writer win last month?',
        questionZh: '作者上个月获得了什么奖？',
        options: ["A prize for a photo of a cat", "A prize for a photo of a dog", "A prize for a photo of a sunset", "A prize for a photo of a sunrise"],
        answer: 'A prize for a photo of a sunset',
        explanation: '原文说"I won a prize for my photo of a sunset"',
      },
      {
        id: 'rc017-6',
        question: 'What does the writer want to be when he grows up?',
        questionZh: '作者长大后想成为什么？',
        options: ["A teacher", "A doctor", "A professional photographer", "A farmer"],
        answer: 'A professional photographer',
        explanation: '原文说"I want to be a professional photographer when I grow up"',
      },
      {
        id: 'rc017-7',
        question: 'How did the writer feel when he won the prize?',
        questionZh: '作者获奖时感觉如何？',
        options: ["Sad", "Angry", "Very happy", "Tired"],
        answer: 'Very happy',
        explanation: '原文说"I was very happy"',
      },
    ],
    difficulty: 'medium',
    topic: '兴趣爱好',
  },
  // =================== 下一篇 ===================
  {
    id: 'p3r-018',
    title: 'A Letter to a Penfriend',
    titleZh: '给笔友的信',
    article: `Dear Lisa,
    How are you? I am writing to tell you about my holiday. Last week, I went to London with my family. We travelled by train. It was a long journey – three hours! We stayed in a hotel near Hyde Park. On the first day, we visited the British Museum. It was amazing. On the second day, we went to the London Eye. We could see the whole city from the top. On the last day, we went shopping on Oxford Street. I bought some souvenirs for you. I hope you like them.
    Write back soon!
    Love, Emma`,
    articleZh: `亲爱的Lisa，
    你好吗？我写信告诉你关于我的假期。上周，我和家人去了伦敦。我们乘火车旅行。那是一段漫长的旅程——三小时！我们住在海德公园附近的一家酒店。第一天，我们参观了大英博物馆。那太棒了。第二天，我们去了伦敦眼。从顶部我们可以看到整个城市。最后一天，我们在牛津街购物。我为你买了一些纪念品。我希望你喜欢它们。
    尽快回信！
    爱你的，Emma`,
    questions: [
      {
        id: 'rc018-1',
        question: 'Where did Emma go last week?',
        questionZh: 'Emma上周去了哪里？',
        options: ["Paris", "London", "New York", "Tokyo"],
        answer: 'London',
        explanation: '原文说"I went to London with my family"',
      },
      {
        id: 'rc018-2',
        question: 'How did they travel to London?',
        questionZh: '他们怎么去伦敦的？',
        options: ["By plane", "By train", "By bus", "By car"],
        answer: 'By train',
        explanation: '原文说"We travelled by train"',
      },
      {
        id: 'rc018-3',
        question: 'How long was the journey?',
        questionZh: '旅程花了多长时间？',
        options: ["Two hours", "Three hours", "Four hours", "Five hours"],
        answer: 'Three hours',
        explanation: '原文说"It was a long journey – three hours"',
      },
      {
        id: 'rc018-4',
        question: 'Where did they stay in London?',
        questionZh: '他们在伦敦住在哪里？',
        options: ["In a hotel near the British Museum", "In a hotel near Hyde Park", "In a hotel near the London Eye", "In a hotel near Oxford Street"],
        answer: 'In a hotel near Hyde Park',
        explanation: '原文说"We stayed in a hotel near Hyde Park"',
      },
      {
        id: 'rc018-5',
        question: 'What did they visit on the first day?',
        questionZh: '他们第一天参观了什么？',
        options: ["The London Eye", "The British Museum", "Hyde Park", "Oxford Street"],
        answer: 'The British Museum',
        explanation: '原文说"On the first day, we visited the British Museum"',
      },
      {
        id: 'rc018-6',
        question: 'What did they do on the second day?',
        questionZh: '他们第二天做了什么？',
        options: ["They went shopping", "They visited the British Museum", "They went to the London Eye", "They stayed at the hotel"],
        answer: 'They went to the London Eye',
        explanation: '原文说"On the second day, we went to the London Eye"',
      },
      {
        id: 'rc018-7',
        question: 'What did Emma buy for Lisa?',
        questionZh: 'Emma为Lisa买了什么？',
        options: ["Some books", "Some food", "Some souvenirs", "Some clothes"],
        answer: 'Some souvenirs',
        explanation: '原文说"I bought some souvenirs for you"',
      },
    ],
    difficulty: 'medium',
    topic: '旅行',
  },
  // =================== 下一篇 ===================
  {
    id: 'p3r-019',
    title: 'A Birthday Party',
    titleZh: '生日派对',
    article: `Last Saturday was my twelfth birthday. My parents organised a surprise party for me. They invited all my friends from school and our neighbours. When I came home from the cinema, I saw many colourful balloons and a big "Happy Birthday" banner in the living room. My friends shouted, "Surprise!" I was very happy. My mum made a chocolate cake. It was delicious. We played games like musical chairs and charades. My best friend, John, gave me a book about space as a present. I love reading about stars and planets. It was the best birthday ever!`,
    articleZh: `上周六是我的十二岁生日。我的父母为我组织了一个惊喜派对。他们邀请了我校的所有朋友和我们的邻居。当我从电影院回家时，我看到了客厅里许多彩色的气球和一个大大的"生日快乐"横幅。我的朋友们喊道："惊喜！"我非常开心。我妈妈做了一个巧克力蛋糕。它很好吃。我们玩了像抢椅子和中途认输的游戏。我最好的朋友John给了我一本关于太空的书作为礼物。我喜欢阅读关于恒星和行星的内容。那是有史以来最好的生日！`,
    questions: [
      {
        id: 'rc019-1',
        question: 'When was the writer\'s birthday?',
        questionZh: '作者的生日是什么时候？',
        options: ["Last Friday", "Last Saturday", "Last Sunday", "Last Monday"],
        answer: 'Last Saturday',
        explanation: '原文说"Last Saturday was my twelfth birthday"',
      },
      {
        id: 'rc019-2',
        question: 'How old is the writer now?',
        questionZh: '作者现在几岁？',
        options: ["10", "11", "12", "13"],
        answer: '12',
        explanation: '原文说"my twelfth birthday"',
      },
      {
        id: 'rc019-3',
        question: 'What did the writer see in the living room?',
        questionZh: '作者在客厅看到了什么？',
        options: ["A Christmas tree", "Colourful balloons and a banner", "A swimming pool", "A cinema screen"],
        answer: 'Colourful balloons and a banner',
        explanation: '原文说"saw many colourful balloons and a big \"Happy Birthday\" banner"',
      },
      {
        id: 'rc019-4',
        question: 'What did the writer\'s mum make?',
        questionZh: '作者的妈妈做了什么？',
        options: ["A chocolate cake", "A fruit salad", "A pizza", "A sandwich"],
        answer: 'A chocolate cake',
        explanation: '原文说"My mum made a chocolate cake"',
      },
      {
        id: 'rc019-5',
        question: 'What games did they play?',
        questionZh: '他们玩了什么游戏？',
        options: ["Football and basketball", "Musical chairs and charades", "Hide and seek", "Video games"],
        answer: 'Musical chairs and charades',
        explanation: '原文说"We played games like musical chairs and charades"',
      },
      {
        id: 'rc019-6',
        question: 'What present did John give the writer?',
        questionZh: 'John给了作者什么礼物？',
        options: ["A toy car", "A book about space", "A football", "A computer game"],
        answer: 'A book about space',
        explanation: '原文说"gave me a book about space as a present"',
      },
      {
        id: 'rc019-7',
        question: 'Why did the writer like the present?',
        questionZh: '为什么作者喜欢这个礼物？',
        options: ["He loves reading about stars and planets", "He loves playing football", "He loves eating cake", "He loves watching films"],
        answer: 'He loves reading about stars and planets',
        explanation: '原文说"I love reading about stars and planets"',
      },
    ],
    difficulty: 'medium',
    topic: '庆祝活动',
  },
  // =================== 下一篇 ===================
  {
    id: 'p3r-020',
    title: 'Keeping Fit and Healthy',
    titleZh: '保持健康',
    article: `Keeping fit and healthy is important for everyone. There are many ways to stay healthy. First, we should eat a balanced diet with plenty of fruits and vegetables. We should also drink enough water every day. Second, we should exercise regularly. Exercise can be as simple as walking, cycling, or playing a sport. It is recommended that children exercise for at least 60 minutes every day. Third, we should get enough sleep. Sleep helps our bodies to rest and recover. Finally, we should avoid bad habits like smoking and drinking too much coffee. By following these simple steps, we can all enjoy a healthier life.`,
    articleZh: `保持健康对每个人都很重要。有很多方法可以保持健康。首先，我们应该吃均衡的饮食，包含大量的水果和蔬菜。我们还应该每天喝足够的水。其次，我们应该规律锻炼。锻炼可以简单到散步、骑自行车或玩一项运动。建议儿童每天至少锻炼60分钟。第三，我们应该获得足够的睡眠。睡眠帮助我们的身体休息和恢复。最后，我们应该避免坏习惯，如吸烟和喝太多咖啡。通过遵循这些简单的步骤，我们都可以享受更健康的生活。`,
    questions: [
      {
        id: 'rc020-1',
        question: 'What is important for everyone?',
        questionZh: '什么对每个人都很重要？',
        options: ["Keeping fit and healthy", "Eating only vegetables", "Sleeping all day", "Drinking only water"],
        answer: 'Keeping fit and healthy',
        explanation: '原文说"Keeping fit and healthy is important for everyone"',
      },
      {
        id: 'rc020-2',
        question: 'What should we eat?',
        questionZh: '我们应该吃什么？',
        options: ["Only meat", "A balanced diet with fruits and vegetables", "Only fast food", "Only sweets"],
        answer: 'A balanced diet with fruits and vegetables',
        explanation: '原文说"eat a balanced diet with plenty of fruits and vegetables"',
      },
      {
        id: 'rc020-3',
        question: 'How much should children exercise every day?',
        questionZh: '儿童每天应该锻炼多少？',
        options: ["At least 30 minutes", "At least 60 minutes", "At least 90 minutes", "At least 120 minutes"],
        answer: 'At least 60 minutes',
        explanation: '原文说"children exercise for at least 60 minutes every day"',
      },
      {
        id: 'rc020-4',
        question: 'What can exercise be?',
        questionZh: '锻炼可以是什么？',
        options: ["Only going to the gym", "As simple as walking, cycling, or playing a sport", "Only running marathons", "Only swimming"],
        answer: 'As simple as walking, cycling, or playing a sport',
        explanation: '原文说"Exercise can be as simple as walking, cycling, or playing a sport"',
      },
      {
        id: 'rc020-5',
        question: 'What does sleep help our bodies do?',
        questionZh: '睡眠帮助我们的身体做什么？',
        options: ["Become stronger", "Rest and recover", "Become taller", "Become thinner"],
        answer: 'Rest and recover',
        explanation: '原文说"Sleep helps our bodies to rest and recover"',
      },
      {
        id: 'rc020-6',
        question: 'What bad habits should we avoid?',
        questionZh: '我们应该避免什么坏习惯？',
        options: ["Eating fruits", "Smoking and drinking too much coffee", "Drinking water", "Exercising"],
        answer: 'Smoking and drinking too much coffee',
        explanation: '原文说"avoid bad habits like smoking and drinking too much coffee"',
      },
      {
        id: 'rc020-7',
        question: 'What can we enjoy by following these steps?',
        questionZh: '通过遵循这些步骤，我们可以享受什么？',
        options: ["A richer life", "A healthier life", "A busier life", "A longer life"],
        answer: 'A healthier life',
        explanation: '原文说"we can all enjoy a healthier life"',
      },
    ],
    difficulty: 'medium',
    topic: '健康',
  },,
];



// ==================== Part 4/5: 正误判断数据 =============================
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
  // ==================== p4-002 ====================
  {
    id: 'p4-002',
    title: 'A School Science Project',
    titleZh: '学校科学项目',
    article: `Last month, Class 7B did a science project about plants. Their teacher, Mrs Green, asked them to grow their own plants from seeds. Each student got a small pot, some soil, and three bean seeds.

The students had to water their plants every day and write down what they saw. Tom's plant grew very fast. After two weeks, it was 30 cm tall! But Lucy's plant did not grow at all. She was sad, but Mrs Green said, "Don't worry. Sometimes seeds don't grow."

At the end of the project, the class had a small exhibition. Parents came to see the plants. Toms plant won a prize for being the tallest. Tom was very happy and decided to be a gardener when he grows up.`,
    articleZh: `上个月，7B班做了一个关于植物的科学项目。他们的老师 Green 夫人让他们自己从种子开始种植物。每个学生得到一个花盆、一些土壤和三颗豆子种子。

学生们必须每天给植物浇水，并写下他们看到的情况。Tom 的植物长得非常快。两周后，它有30厘米高！但 Lucy 的植物根本没长。她很伤心，但 Green 夫人说："别担心，有时种子不会发芽。"

项目结束时，班级举办了一个小型展览。家长们来看植物。Tom 的植物因为最高而获奖。Tom 非常高兴，决定长大后当一名园丁。`,
    statements: [
      { id: 'tf002-1', statement: 'The students are in Class 7B.', statementZh: '学生们在7B班。', answer: 'T', evidence: 'Class 7B did a science project', explanation: '原文明确提到"Class 7B"。' },
      { id: 'tf002-2', statement: 'Mrs Green is an English teacher.', statementZh: 'Green 夫人是一位英语老师。', answer: 'F', evidence: 'Their teacher, Mrs Green, asked them to grow their own plants', explanation: '原文说他们做科学项目(science project)，所以 Green 夫人应该是科学老师，不是英语老师。' },
      { id: 'tf002-3', statement: 'Each student got three seeds.', statementZh: '每个学生得到三颗种子。', answer: 'T', evidence: 'each student got a small pot, some soil, and three bean seeds', explanation: '原文明确说"three bean seeds"。' },
      { id: 'tf002-4', statement: 'Tom\'s plant grew very slowly.', statementZh: 'Tom 的植物长得很慢。', answer: 'F', evidence: 'Tom\'s plant grew very fast', explanation: '原文说"grew very fast"（长得非常快），不是 slowly（慢）。' },
      { id: 'tf002-5', statement: 'Lucy\'s plant won a prize.', statementZh: 'Lucy 的植物获奖了。', answer: 'F', evidence: 'Tom\'s plant won a prize for being the tallest', explanation: '获奖的是 Tom 的植物，不是 Lucy 的。' },
      { id: 'tf002-6', statement: 'Tom wants to be a gardener.', statementZh: 'Tom 想当园丁。', answer: 'T', evidence: 'Tom was very happy and decided to be a gardener', explanation: '原文明确说 Tom "decided to be a gardener"。' },
    ],
    difficulty: 'easy',
    topic: '学校生活',
  },
  // ==================== p4-003 ====================
  {
    id: 'p4-003',
    title: 'Weekend Cooking Class',
    titleZh: '周末烹饪课',
    article: `Every Saturday morning, a cooking class is held at the community centre. The class is for children aged 10 to 15. The teacher is Chef Marco, who works at a local Italian restaurant.

In the class, students learn to cook simple dishes from different countries. Last week, they made pizza from Italy. This week, they are making sushi from Japan. Next week, they will make tacos from Mexico.

The class starts at 10 am and finishes at 12 pm. Each student pays £5 per class. This includes all the food ingredients. At the end of each class, the students sit together and eat what they have cooked.

Many students say the class is their favourite activity. They learn to cook, make new friends, and eat delicious food!`,
    articleZh: `每个星期六上午，社区中心都会举办烹饪课。这个课程面向10到15岁的孩子。老师是 Marco 大厨，他在当地一家意大利餐厅工作。

在课上，学生们学习烹饪来自不同国家的简单菜肴。上周，他们做了意大利的披萨。这周，他们要做日本的寿司。下周，他们将做墨西哥的玉米卷。

课程上午10点开始，12点结束。每个学生每节课付5英镑。这包括所有的食材。每节课结束时，学生们坐在一起，吃他们烹饪的食物。

许多学生说这个课程是他们最喜欢的活动。他们学习烹饪，结交新朋友，还能吃到美味的食物！`,
    statements: [
      { id: 'tf003-1', statement: 'The cooking class is on Saturday afternoon.', statementZh: '烹饪课在星期六下午。', answer: 'F', evidence: 'Every Saturday morning, a cooking class is held', explanation: '原文说"Saturday morning"（周六上午），不是 afternoon（下午）。' },
      { id: 'tf003-2', statement: 'Chef Marco works at an Italian restaurant.', statementZh: 'Marco 大厨在一家意大利餐厅工作。', answer: 'T', evidence: 'The teacher is Chef Marco, who works at a local Italian restaurant', explanation: '原文明确提到 Marco 在"Italian restaurant"工作。' },
      { id: 'tf003-3', statement: 'Last week, students made sushi.', statementZh: '上周，学生们做了寿司。', answer: 'F', evidence: 'Last week, they made pizza from Italy. This week, they are making sushi', explanation: '上周做的是披萨(pizza)，这周才做寿司(sushi)。' },
      { id: 'tf003-4', statement: 'The class costs £10 per student.', statementZh: '每节课每个学生花费10英镑。', answer: 'F', evidence: 'Each student pays £5 per class', explanation: '原文说是 £5，不是 £10。' },
      { id: 'tf003-5', statement: 'Students eat the food they cook.', statementZh: '学生们吃他们烹饪的食物。', answer: 'T', evidence: 'the students sit together and eat what they have cooked', explanation: '原文明确说学生们"eat what they have cooked"。' },
      { id: 'tf003-6', statement: 'The class is for adults only.', statementZh: '这个课程只面向成年人。', answer: 'F', evidence: 'The class is for children aged 10 to 15', explanation: '原文说课程是给"children aged 10 to 15"（10到15岁的孩子），不是成年人。' },
    ],
    difficulty: 'easy',
    topic: '日常生活',
  },

  {
    id: 'p4-004',
    title: 'A School Trip to the Farm',
    titleZh: '学校农场之旅',
    article: `Last week, Class 6A went on a trip to Oak Tree Farm. The farm is about 20 kilometres from the school. The students travelled by bus and the journey took 40 minutes. At the farm, the farmer, Mr Jenkins, showed them around. They saw cows, sheep, pigs and chickens. Some students helped to feed the animals. Lucy gave some bread to the ducks. After that, the students had a picnic lunch in the field. Before they left, Mr Jenkins gave each student a small bag of apples from the farm shop. The trip was both fun and educational.`,
    articleZh: `上周，6A班去橡树农场旅行。农场距离学校约20公里。学生们乘公交车前往，车程40分钟。在农场，农民 Jenkins 先生带他们参观。他们看到了牛、羊、猪和鸡。一些学生帮忙喂动物。Lucy 给鸭子喂了一些面包。之后，学生们在田野里吃了野餐午餐。在他们离开之前，Jenkins 先生给每个学生一袋来自农场商店的苹果。这次旅行既有趣又有教育意义。`,
    statements: [
      {
        id: 'tf004-1', statement: 'Oak Tree Farm is 20 kilometres from the school.', statementZh: '橡树农场距离学校20公里。',
        answer: 'T', evidence: 'The farm is about 20 kilometres from the school.', explanation: '原文明确提到20公里。',
      },
      {
        id: 'tf004-2', statement: 'The students went to the farm by train.', statementZh: '学生们乘火车去农场。',
        answer: 'F', evidence: 'The students travelled by bus', explanation: '原文说乘公交车(by bus)，不是火车(by train)。',
      },
      {
        id: 'tf004-3', statement: 'Mr Jenkins is a teacher.', statementZh: 'Jenkins 先生是一位老师。',
        answer: 'F', evidence: 'the farmer, Mr Jenkins', explanation: '原文说他是农民(farmer)，不是老师。',
      },
      {
        id: 'tf004-4', statement: 'The students saw horses at the farm.', statementZh: '学生们在农场看到了马。',
        answer: 'F', evidence: 'They saw cows, sheep, pigs and chickens.', explanation: '原文提到的动物是牛、羊、猪、鸡，没有马。',
      },
      {
        id: 'tf004-5', statement: 'Lucy fed the ducks.', statementZh: 'Lucy 喂了鸭子。',
        answer: 'T', evidence: 'Lucy gave some bread to the ducks.', explanation: '原文明确说 Lucy 给鸭子喂面包。',
      },
      {
        id: 'tf004-6', statement: 'The students bought apples at the farm shop.', statementZh: '学生们在农场商店买了苹果。',
        answer: 'F', evidence: 'Mr Jenkins gave each student a small bag of apples', explanation: '原文说 Jenkins 先生给(gave)每个学生苹果，不是他们买的(bought)。',
      },
    ],
    difficulty: 'easy',
    topic: '学校生活',
  },

  {
    id: 'p4-005',
    title: 'My Favourite Hobby',
    titleZh: '我最喜欢的爱好',
    article: `My favourite hobby is photography. I got my first camera when I was ten years old. Now I am thirteen and I have a much better camera. I take photos of people, animals, and landscapes. My favourite place to take photos is the park near my house. There are many beautiful flowers and trees there. Sometimes, I enter photography competitions. Last month, I won a prize for my photo of a sunset. I was very happy. I want to be a professional photographer when I grow up.`,
    articleZh: `我最喜欢的爱好是摄影。我十岁时得到了我的第一台相机。现在我十三岁，我有一台更好的相机。我拍人、动物和风景的照片。我最喜欢拍照的地方是我家附近的公园。那里有许多美丽的花朵和树木。有时，我参加摄影比赛。上个月，我的一张日落照片获奖了。我非常开心。我长大后想成为一名专业摄影师。`,
    statements: [
      {
        id: 'tf005-1', statement: 'The writer got his first camera at age 10.', statementZh: '作者10岁时得到了他的第一台相机。',
        answer: 'T', evidence: 'I got my first camera when I was ten years old.', explanation: '原文明确提到10岁。',
      },
      {
        id: 'tf005-2', statement: 'The writer is now 15 years old.', statementZh: '作者现在15岁。',
        answer: 'F', evidence: 'Now I am thirteen', explanation: '原文说现在13岁，不是15岁。',
      },
      {
        id: 'tf005-3', statement: 'The writer\'s favourite place to take photos is the beach.', statementZh: '作者最喜欢拍照的地方是海滩。',
        answer: 'F', evidence: 'My favourite place to take photos is the park near my house.', explanation: '原文说是最喜欢的拍照地方是公园(park)，不是海滩(beach)。',
      },
      {
        id: 'tf005-4', statement: 'The writer won a prize for a photo of a sunrise.', statementZh: '作者的一张日出照片获奖了。',
        answer: 'F', evidence: 'I won a prize for my photo of a sunset.', explanation: '原文说是日落(sunset)，不是日出(sunrise)。',
      },
      {
        id: 'tf005-5', statement: 'The writer wants to be a photographer.', statementZh: '作者想成为一名摄影师。',
        answer: 'T', evidence: 'I want to be a professional photographer', explanation: '原文明确提到想成为专业摄影师。',
      },
      {
        id: 'tf005-6', statement: 'The writer never enters competitions.', statementZh: '作者从不参加比赛。',
        answer: 'F', evidence: 'Sometimes, I enter photography competitions.', explanation: '原文说有时参加比赛，不是从不参加。',
      },
    ],
    difficulty: 'easy',
    topic: '兴趣爱好',
  },

  {
    id: 'p4-006',
    title: 'A Letter to a Pen Friend',
    titleZh: '给笔友的信',
    article: `Dear Lisa,
    How are you? I am writing to tell you about my holiday. Last week, I went to London with my family. We travelled by train. It was a long journey – three hours! We stayed in a hotel near Hyde Park. On the first day, we visited the British Museum. It was amazing. On the second day, we went to the London Eye. We could see the whole city from the top. On the last day, we went shopping on Oxford Street. I bought some souvenirs for you. I hope you like them.
    Write back soon!
    Love, Emma`,
    articleZh: `亲爱的 Lisa，
    你好吗？我写信告诉你关于我的假期。上周，我和家人去了伦敦。我们乘火车旅行。那是一段漫长的旅程——三小时！我们住在海德公园附近的一家酒店。第一天，我们参观了大英博物馆。那太棒了。第二天，我们去了伦敦眼。从顶部我们可以看到整个城市。最后一天，我们在牛津街购物。我为你买了一些纪念品。我希望你喜欢它们。
    尽快回信！
    爱你的，Emma`,
    statements: [
      {
        id: 'tf006-1', statement: 'Emma went to London with her friends.', statementZh: 'Emma 和朋友们去了伦敦。',
        answer: 'F', evidence: 'I went to London with my family.', explanation: '原文说和家人(with my family)，不是朋友(with friends)。',
      },
      {
        id: 'tf006-2', statement: 'The train journey took three hours.', statementZh: '火车旅程花了三小时。',
        answer: 'T', evidence: 'It was a long journey – three hours!', explanation: '原文明确提到三小时。',
      },
      {
        id: 'tf006-3', statement: 'The hotel is near the British Museum.', statementZh: '酒店在大英博物馆附近。',
        answer: 'F', evidence: 'We stayed in a hotel near Hyde Park.', explanation: '原文说酒店在海德公园(Hyde Park)附近，不是大英博物馆附近。',
      },
      {
        id: 'tf006-4', statement: 'Emma visited the London Eye on the first day.', statementZh: 'Emma 在第一天参观了伦敦眼。',
        answer: 'F', evidence: 'On the first day, we visited the British Museum. On the second day, we went to the London Eye.', explanation: '原文说第一天参观大英博物馆，第二天才去伦敦眼。',
      },
      {
        id: 'tf006-5', statement: 'Emma bought souvenirs for Lisa.', statementZh: 'Emma 为 Lisa 买了纪念品。',
        answer: 'T', evidence: 'I bought some souvenirs for you.', explanation: '原文明确说为 Lisa(you)买了纪念品。',
      },
      {
        id: 'tf006-6', statement: 'Emma wants Lisa to write back.', statementZh: 'Emma 希望 Lisa 回信。',
        answer: 'T', evidence: 'Write back soon!', explanation: '原文明确说"Write back soon!"。',
      },
    ],
    difficulty: 'easy',
    topic: '旅行',
  },

  {
    id: 'p4-007',
    title: 'Healthy Eating',
    titleZh: '健康饮食',
    article: `Eating healthy food is important for everyone. A healthy diet should include fruits, vegetables, grains, protein and dairy. Fruits and vegetables give us vitamins and minerals. Grains like bread, rice and pasta give us energy. Protein helps our muscles grow. Meat, fish, eggs and beans are good sources of protein. Dairy products like milk, cheese and yoghurt make our bones strong. We should drink plenty of water every day. We should also avoid eating too much sugar and fatty foods. A healthy diet, together with regular exercise, keeps us fit and strong.`,
    articleZh: `吃健康的食物对每个人都很重要。健康的饮食应该包括水果、蔬菜、谷物、蛋白质和乳制品。水果和蔬菜给我们维生素和矿物质。像面包、米饭和意大利面这样的谷物给我们能量。蛋白质帮助我们的肌肉生长。肉、鱼、鸡蛋和豆类是良好的蛋白质来源。像牛奶、奶酪和酸奶这样的乳制品使我们的骨骼强壮。我们应该每天喝大量的水。我们还应该避免吃太多的糖和脂肪食物。健康的饮食，加上规律的锻炼，使我们保持健康强壮。`,
    statements: [
      {
        id: 'tf007-1', statement: 'A healthy diet should include five food groups.', statementZh: '健康的饮食应该包括五类食物。',
        answer: 'T', evidence: 'A healthy diet should include fruits, vegetables, grains, protein and dairy.', explanation: '原文明确提到五类：水果、蔬菜、谷物、蛋白质、乳制品。',
      },
      {
        id: 'tf007-2', statement: 'Grains give us vitamins.', statementZh: '谷物给我们维生素。',
        answer: 'F', evidence: 'Grains like bread, rice and pasta give us energy.', explanation: '原文说谷物给我们能量(energy)，不是维生素(vitamins)。',
      },
      {
        id: 'tf007-3', statement: 'Protein helps our bones grow.', statementZh: '蛋白质帮助我们的骨骼生长。',
        answer: 'F', evidence: 'Protein helps our muscles grow.', explanation: '原文说蛋白质帮助肌肉(muscles)生长，不是骨骼(bones)。',
      },
      {
        id: 'tf007-4', statement: 'Dairy products make our bones strong.', statementZh: '乳制品使我们的骨骼强壮。',
        answer: 'T', evidence: 'Dairy products like milk, cheese and yoghurt make our bones strong.', explanation: '原文明确提到乳制品使骨骼强壮。',
      },
      {
        id: 'tf007-5', statement: 'We should drink plenty of water every day.', statementZh: '我们应该每天喝大量的水。',
        answer: 'T', evidence: 'We should drink plenty of water every day.', explanation: '原文明确提到应该多喝水。',
      },
      {
        id: 'tf007-6', statement: 'Exercise is not important for health.', statementZh: '锻炼对健康不重要。',
        answer: 'F', evidence: 'A healthy diet, together with regular exercise, keeps us fit and strong.', explanation: '原文说健康饮食加上规律锻炼使我们健康，所以锻炼是重要的。',
      },
    ],
    difficulty: 'medium',
    topic: '健康',
  },

  {
    id: 'p4-008',
    title: 'The Importance of Sleep',
    titleZh: '睡眠的重要性',
    article: `Sleep is very important for our health. Children need about 10 hours of sleep every night. Teenagers need about 8 to 9 hours. When we sleep, our bodies rest and repair themselves. Sleep also helps our brains to work properly. If we do not get enough sleep, we may feel tired, grumpy and find it hard to concentrate. To sleep well, we should go to bed at the same time every night. We should also avoid using phones or computers before bedtime. A dark, quiet room is best for sleeping. Good sleep habits help us to stay healthy and happy.`,
    articleZh: `睡眠对我们的健康非常重要。儿童每晚需要约10小时的睡眠。青少年需要约8到9小时。当我们睡觉时，我们的身体休息并自我修复。睡眠还帮助我们的大脑正常工作。如果我们没有获得足够的睡眠，我们可能会感到疲倦、暴躁，并且发现很难集中注意力。为了睡得好，我们应该每晚在同一时间上床睡觉。我们还应该避免在睡前使用手机或电脑。黑暗、安静的房间最适合睡觉。良好的睡眠习惯帮助我们保持健康和快乐。`,
    statements: [
      {
        id: 'tf008-1', statement: 'Children need 8 hours of sleep every night.', statementZh: '儿童每晚需要8小时睡眠。',
        answer: 'F', evidence: 'Children need about 10 hours of sleep every night.', explanation: '原文说儿童需要约10小时，不是8小时。',
      },
      {
        id: 'tf008-2', statement: 'Teenagers need more sleep than children.', statementZh: '青少年比儿童需要更多的睡眠。',
        answer: 'F', evidence: 'Children need about 10 hours... Teenagers need about 8 to 9 hours.', explanation: '原文说儿童需要10小时，青少年需要8-9小时，所以儿童需要更多睡眠。',
      },
      {
        id: 'tf008-3', statement: 'Sleep helps our bodies to repair themselves.', statementZh: '睡眠帮助我们的身体自我修复。',
        answer: 'T', evidence: 'When we sleep, our bodies rest and repair themselves.', explanation: '原文明确说身体休息并自我修复。',
      },
      {
        id: 'tf008-4', statement: 'Not enough sleep makes it hard to concentrate.', statementZh: '睡眠不足使人难以集中注意力。',
        answer: 'T', evidence: 'If we do not get enough sleep... find it hard to concentrate.', explanation: '原文明确提到难以集中注意力。',
      },
      {
        id: 'tf008-5', statement: 'We should use phones before bedtime.', statementZh: '我们应该在睡前使用手机。',
        answer: 'F', evidence: 'We should also avoid using phones or computers before bedtime.', explanation: '原文说应该避免在睡前使用手机，不是应该使用。',
      },
      {
        id: 'tf008-6', statement: 'A light room is best for sleeping.', statementZh: '明亮的房间最适合睡觉。',
        answer: 'F', evidence: 'A dark, quiet room is best for sleeping.', explanation: '原文说黑暗(dark)、安静的房间最适合，不是明亮的(light)房间。',
      },
    ],
    difficulty: 'medium',
    topic: '健康',
  },

  {
    id: 'p4-009',
    title: 'The Internet',
    titleZh: '互联网',
    article: `The Internet is a useful tool that connects people all over the world. We can use the Internet to find information, communicate with others, and entertain ourselves. Search engines like Google help us to find information quickly. We can also use email and social media to stay in touch with friends and family. Online shopping is another popular use of the Internet. We can buy almost anything online and have it delivered to our homes. However, we should be careful when using the Internet. We should not share personal information with strangers. We should also be aware of fake news and cyberbullying. Used wisely, the Internet can greatly improve our lives.`,
    articleZh: `互联网是一个有用的工具，连接着全世界的人们。我们可以使用互联网查找信息、与他人交流以及娱乐。像谷歌这样的搜索引擎帮助我们快速找到信息。我们还可以使用电子邮件和社交媒体与朋友和家人保持联系。在线购物是互联网的另一个流行用途。我们几乎可以在网上购买任何东西，并让它送到我们家。然而，我们在使用互联网时应该小心。我们不应该与陌生人分享个人信息。我们还应该警惕假新闻和网络欺凌。明智地使用，互联网可以极大地改善我们的生活。`,
    statements: [
      {
        id: 'tf009-1', statement: 'The Internet connects people all over the world.', statementZh: '互联网连接着全世界的人们。',
        answer: 'T', evidence: 'The Internet is a useful tool that connects people all over the world.', explanation: '原文明确提到连接全世界的人们。',
      },
      {
        id: 'tf009-2', statement: 'Google is a social media platform.', statementZh: '谷歌是一个社交媒体平台。',
        answer: 'F', evidence: 'Search engines like Google', explanation: '原文说谷歌是搜索引擎(search engine)，不是社交媒体平台(social media platform)。',
      },
      {
        id: 'tf009-3', statement: 'We can buy things online.', statementZh: '我们可以在网上买东西。',
        answer: 'T', evidence: 'Online shopping is another popular use of the Internet.', explanation: '原文明确提到在线购物。',
      },
      {
        id: 'tf009-4', statement: 'We should share personal information with strangers online.', statementZh: '我们应该在网上与陌生人分享个人信息。',
        answer: 'F', evidence: 'We should not share personal information with strangers.', explanation: '原文说不应该(should not)分享个人信息，不是应该(should)。',
      },
      {
        id: 'tf009-5', statement: 'Fake news is not a problem on the Internet.', statementZh: '假新闻在互联网上不是问题。',
        answer: 'F', evidence: 'We should also be aware of fake news', explanation: '原文说应该警惕(be aware of)假新闻，所以它是个问题。',
      },
      {
        id: 'tf009-6', statement: 'The Internet can improve our lives if used wisely.', statementZh: '如果明智地使用，互联网可以改善我们的生活。',
        answer: 'T', evidence: 'Used wisely, the Internet can greatly improve our lives.', explanation: '原文明确提到明智使用时可以改善生活。',
      },
    ],
    difficulty: 'medium',
    topic: '科技',
  },

  {
    id: 'p4-010',
    title: 'Environmental Protection',
    titleZh: '环境保护',
    article: `Protecting the environment is everyone's responsibility. There are many simple things we can do to help the environment. First, we should reduce, reuse and recycle. We should use less plastic and more reusable bags and bottles. Second, we should save energy. We can turn off lights and electronic devices when we are not using them. Third, we should save water. We can take shorter showers and fix leaking taps. Fourth, we should walk, cycle or use public transport instead of driving. This reduces air pollution. Finally, we should plant more trees. Trees absorb carbon dioxide and produce oxygen. If everyone does a little bit, we can make a big difference to our planet.`,
    articleZh: `保护环境是每个人的责任。我们可以做很多简单的事情来帮助环境。首先，我们应该减少、重复使用和回收。我们应该少用塑料，多用可重复使用的袋子和瓶子。其次，我们应该节约能源。我们可以在不使用灯和电子设备时关掉它们。第三，我们应该节约用水。我们可以洗 shorter 的淋浴，修理漏水的水龙头。第四，我们应该步行、骑自行车或使用公共交通，而不是开车。这减少了空气污染。最后，我们应该种更多的树。树木吸收二氧化碳并产生氧气。如果每个人都做一点点，我们就能对我们的星球产生很大的影响。`,
    statements: [
      {
        id: 'tf010-1', statement: 'Protecting the environment is only the government\'s responsibility.', statementZh: '保护环境只是政府的责任。',
        answer: 'F', evidence: 'Protecting the environment is everyone\'s responsibility.', explanation: '原文说是每个人的(everyone\'s)责任，不是只是政府的(only the government\'s)。',
      },
      {
        id: 'tf010-2', statement: 'We should use more plastic.', statementZh: '我们应该多用塑料。',
        answer: 'F', evidence: 'We should use less plastic', explanation: '原文说应该少用(less)塑料，不是多用(more)。',
      },
      {
        id: 'tf010-3', statement: 'We should turn off lights when not using them.', statementZh: '我们应该在不使用灯时关掉它们。',
        answer: 'T', evidence: 'We can turn off lights and electronic devices when we are not using them.', explanation: '原文明确提到关灯。',
      },
      {
        id: 'tf010-4', statement: 'Driving is better than walking for the environment.', statementZh: '对环境来说，开车比步行更好。',
        answer: 'F', evidence: 'we should walk, cycle or use public transport instead of driving.', explanation: '原文说应该步行、骑自行车或使用公共交通，而不是开车，所以开车不好。',
      },
      {
        id: 'tf010-5', statement: 'Trees produce carbon dioxide.', statementZh: '树木产生二氧化碳。',
        answer: 'F', evidence: 'Trees absorb carbon dioxide and produce oxygen.', explanation: '原文说树木吸收(absorb)二氧化碳并产生(produce)氧气，不是产生二氧化碳。',
      },
      {
        id: 'tf010-6', statement: 'Everyone\'s small actions can make a big difference.', statementZh: '每个人的小行动都能产生很大的影响。',
        answer: 'T', evidence: 'If everyone does a little bit, we can make a big difference to our planet.', explanation: '原文明确提到每个人做一点点就能产生很大影响。',
      },
    ],
    difficulty: 'medium',
    topic: '环境',
  },

// =================== 新增正误判断(easy + medium难度) ===================
// 生成于 2026-06-09
// 共10篇：p4-011 到 p4-020

  {
    id: 'p4-011',
    title: 'A Day at the Beach',
    titleZh: '海滩的一天',
    article: `Last Sunday, Tom and his family went to the beach. The weather was sunny and warm. Tom built a big sandcastle. His sister Lucy collected shells. Their parents sat under an umbrella and read books. They had a picnic for lunch. In the afternoon, they swam in the sea. They went home at 5 pm. Everyone was tired but happy.`,
    articleZh: `上周日，Tom和他的家人去了海滩。天气晴朗温暖。Tom建了一个大大的沙堡。他的妹妹Lucy收集贝壳。他们的父母坐在伞下看书。他们午饭吃了野餐。下午，他们在海里游泳。他们下午5点回家。每个人都很累但很开心。`,
    statements: [
      {
        id: 'tf011-1',
        statement: 'Tom went to the beach last Saturday.',
        statementZh: 'Tom上周六去了海滩。',
        answer: 'F',
        explanation: '原文说Last Sunday',
      },
      {
        id: 'tf011-2',
        statement: 'The weather was cold and windy.',
        statementZh: '天气寒冷多风。',
        answer: 'F',
        explanation: '原文说sunny and warm',
      },
      {
        id: 'tf011-3',
        statement: 'Tom built a sandcastle.',
        statementZh: 'Tom建了一个沙堡。',
        answer: 'T',
        explanation: '原文说Tom built a big sandcastle',
      },
      {
        id: 'tf011-4',
        statement: 'Lucy collected shells.',
        statementZh: 'Lucy收集了贝壳。',
        answer: 'T',
        explanation: '原文说Lucy collected shells',
      },
      {
        id: 'tf011-5',
        statement: 'They had a restaurant meal for lunch.',
        statementZh: '他们午饭在餐厅吃饭。',
        answer: 'F',
        explanation: '原文说had a picnic',
      },
      {
        id: 'tf011-6',
        statement: 'They went home at 5 pm.',
        statementZh: '他们下午5点回家。',
        answer: 'T',
        explanation: '原文说They went home at 5 pm',
      },
      {
        id: 'tf011-7',
        statement: 'Everyone was sad.',
        statementZh: '每个人都很伤心。',
        answer: 'F',
        explanation: '原文说tired but happy',
      },
    ],
    difficulty: 'easy',
    topic: '家庭活动',
  },

  {
    id: 'p4-012',
    title: 'My Favourite Pet',
    titleZh: '我最喜欢的宠物',
    article: `I have a dog called Max. He is three years old and he is very friendly. Max has brown fur and big ears. Every morning, I take him for a walk in the park. He likes to run after balls. Max eats dog food and sometimes he gets a bone. He sleeps in a basket in the kitchen. I love my dog very much.`,
    articleZh: `我有一只叫Max的狗。他三岁了，非常友好。Max有棕色的毛和大的耳朵。每天早上，我带他去公园散步。他喜欢追球。Max吃狗粮，有时他得到一个骨头。他睡在厨房的篮子里。我非常爱我的狗。`,
    statements: [
      {
        id: 'tf012-1',
        statement: 'The dog is called Max.',
        statementZh: '这只狗叫Max。',
        answer: 'T',
        explanation: '原文说I have a dog called Max',
      },
      {
        id: 'tf012-2',
        statement: 'Max is five years old.',
        statementZh: 'Max五岁了。',
        answer: 'F',
        explanation: '原文说He is three years old',
      },
      {
        id: 'tf012-3',
        statement: 'Max has black fur.',
        statementZh: 'Max有黑色的毛。',
        answer: 'F',
        explanation: '原文说Max has brown fur',
      },
      {
        id: 'tf012-4',
        statement: 'The writer takes Max for a walk every morning.',
        statementZh: '作者每天早上带Max散步。',
        answer: 'T',
        explanation: '原文说Every morning, I take him for a walk',
      },
      {
        id: 'tf012-5',
        statement: 'Max sleeps in the bedroom.',
        statementZh: 'Max睡在卧室里。',
        answer: 'F',
        explanation: '原文说sleeps in a basket in the kitchen',
      },
      {
        id: 'tf012-6',
        statement: 'Max eats only bones.',
        statementZh: 'Max只吃骨头。',
        answer: 'F',
        explanation: '原文说eats dog food and sometimes he gets a bone',
      },
      {
        id: 'tf012-7',
        statement: 'The writer loves his dog.',
        statementZh: '作者爱他的狗。',
        answer: 'T',
        explanation: '原文说I love my dog very much',
      },
    ],
    difficulty: 'easy',
    topic: '宠物',
  },

  {
    id: 'p4-013',
    title: 'School Subjects',
    titleZh: '学校科目',
    article: `I go to Green School. My favourite subject is maths because I like numbers. My friend Anna likes art best. She is good at drawing. We have English on Monday, Wednesday and Friday. Our English teacher is very nice. We also have science on Tuesday and Thursday. I don't like science very much. After school, I have football practice on Tuesday and basketball on Thursday.`,
    articleZh: `我上Green学校。我最喜欢的科目是数学，因为我喜欢数字。我的朋友Anna最喜欢美术。她擅长画画。我们周一、周三和周五有英语课。我们的英语老师非常好。我们周二和周四还有科学课。我不太喜欢科学。放学后，我周二有足球训练，周四有篮球训练。`,
    statements: [
      {
        id: 'tf013-1',
        statement: 'The writer's favourite subject is maths.',
        statementZh: '作者最喜欢的科目是数学。',
        answer: 'T',
        explanation: '原文说My favourite subject is maths',
      },
      {
        id: 'tf013-2',
        statement: 'Anna is good at maths.',
        statementZh: 'Anna擅长数学。',
        answer: 'F',
        explanation: '原文说She is good at drawing（美术）',
      },
      {
        id: 'tf013-3',
        statement: 'They have English three times a week.',
        statementZh: '他们一周上三次英语课。',
        answer: 'T',
        explanation: '原文说Monday, Wednesday and Friday',
      },
      {
        id: 'tf013-4',
        statement: 'The English teacher is strict.',
        statementZh: '英语老师很严格。',
        answer: 'F',
        explanation: '原文说very nice',
      },
      {
        id: 'tf013-5',
        statement: 'They have science on Monday.',
        statementZh: '他们周一有科学课。',
        answer: 'F',
        explanation: '原文说on Tuesday and Thursday',
      },
      {
        id: 'tf013-6',
        statement: 'The writer likes science.',
        statementZh: '作者喜欢科学。',
        answer: 'F',
        explanation: '原文说I don't like science very much',
      },
      {
        id: 'tf013-7',
        statement: 'The writer plays basketball on Thursday.',
        statementZh: '作者周四打篮球。',
        answer: 'T',
        explanation: '原文说basketball on Thursday',
      },
    ],
    difficulty: 'easy',
    topic: '学校生活',
  },

  {
    id: 'p4-014',
    title: 'My Birthday Party',
    titleZh: '我的生日派对',
    article: `Yesterday was my tenth birthday. My parents organised a party for me. I invited ten friends from school. We had the party in my garden. My mum made a big chocolate cake. It was delicious! We played games like musical chairs and hide-and-seek. My best friend Emma gave me a book about animals. I was very happy. The party finished at 6 pm.`,
    articleZh: `昨天是我十岁生日。我的父母为我组织了一个派对。我邀请了十个学校的朋友。我们在我的花园里举办派对。我妈妈做了一个大大的巧克力蛋糕。它很好吃！我们玩了像抢椅子和中途捉迷藏的游戏。我最好的朋友Emma给了我一本关于动物的书。我非常开心。派对下午6点结束。`,
    statements: [
      {
        id: 'tf014-1',
        statement: 'The writer is ten years old.',
        statementZh: '作者十岁了。',
        answer: 'T',
        explanation: '原文说my tenth birthday',
      },
      {
        id: 'tf014-2',
        statement: 'The party was at a restaurant.',
        statementZh: '派对是在餐厅里。',
        answer: 'F',
        explanation: '原文说in my garden',
      },
      {
        id: 'tf014-3',
        statement: 'The writer invited five friends.',
        statementZh: '作者邀请了五个朋友。',
        answer: 'F',
        explanation: '原文说ten friends',
      },
      {
        id: 'tf014-4',
        statement: 'My mum made a chocolate cake.',
        statementZh: '我妈妈做了一个巧克力蛋糕。',
        answer: 'T',
        explanation: '原文说My mum made a big chocolate cake',
      },
      {
        id: 'tf014-5',
        statement: 'They played football.',
        statementZh: '他们踢足球了。',
        answer: 'F',
        explanation: '原文说musical chairs and hide-and-seek',
      },
      {
        id: 'tf014-6',
        statement: 'Emma gave the writer a book.',
        statementZh: 'Emma给了作者一本书。',
        answer: 'T',
        explanation: '原文说Emma gave me a book',
      },
      {
        id: 'tf014-7',
        statement: 'The party finished at 8 pm.',
        statementZh: '派对晚上8点结束。',
        answer: 'F',
        explanation: '原文说finished at 6 pm',
      },
    ],
    difficulty: 'easy',
    topic: '庆祝活动',
  },

  {
    id: 'p4-015',
    title: 'A Trip to the Zoo',
    titleZh: '动物园之旅',
    article: `Last Saturday, Class 5A went to the city zoo. They went by bus. The journey took one hour. At the zoo, they saw lions, tigers, elephants and monkeys. The monkeys were very funny. They ate bananas and played with each other. The students had a picnic for lunch. After lunch, they went to the gift shop. The teacher bought a postcard. The students went home at 4 pm. They were very tired.`,
    articleZh: `上周六，5A班去了城市动物园。他们乘公交车去。旅程花了一小时。在动物园，他们看到了狮子、老虎、大象和猴子。猴子非常有趣。他们吃香蕉并互相玩耍。学生们午饭吃了野餐。午饭后，他们去了礼品店。老师买了一张明信片。学生们下午4点回家。他们非常累。`,
    statements: [
      {
        id: 'tf015-1',
        statement: 'Class 5A went to the zoo last Sunday.',
        statementZh: '5A班上周日去了动物园。',
        answer: 'F',
        explanation: '原文说Last Saturday',
      },
      {
        id: 'tf015-2',
        statement: 'They travelled by train.',
        statementZh: '他们乘火车旅行。',
        answer: 'F',
        explanation: '原文说by bus',
      },
      {
        id: 'tf015-3',
        statement: 'The journey took two hours.',
        statementZh: '旅程花了两小时。',
        answer: 'F',
        explanation: '原文说one hour',
      },
      {
        id: 'tf015-4',
        statement: 'The monkeys were funny.',
        statementZh: '猴子很有趣。',
        answer: 'T',
        explanation: '原文说The monkeys were very funny',
      },
      {
        id: 'tf015-5',
        statement: 'They had a picnic for lunch.',
        statementZh: '他们午饭吃了野餐。',
        answer: 'T',
        explanation: '原文说had a picnic for lunch',
      },
      {
        id: 'tf015-6',
        statement: 'The teacher bought a book.',
        statementZh: '老师买了一本书。',
        answer: 'F',
        explanation: '原文说bought a postcard',
      },
      {
        id: 'tf015-7',
        statement: 'They went home at 4 pm.',
        statementZh: '他们下午4点回家。',
        answer: 'T',
        explanation: '原文说They went home at 4 pm',
      },
    ],
    difficulty: 'easy',
    topic: '旅行',
  },

  {
    id: 'p4-016',
    title: 'A Famous Scientist',
    titleZh: '一位著名的科学家',
    article: `Marie Curie was a famous scientist. She was born in Poland in 1867. She moved to France when she was 24. Marie studied physics and chemistry at the University of Paris. She discovered two new elements: polonium and radium. Marie won the Nobel Prize twice – once in physics (1903) and once in chemistry (1911). She was the first woman to win a Nobel Prize. Marie died in 1934 from illness caused by her work with radioactive materials. Today, she is remembered as one of the greatest scientists in history.`,
    articleZh: `Marie Curie是一位著名的科学家。她1867年出生于波兰。她24岁时搬到法国。Marie在巴黎大学学习物理和化学。她发现了两种新元素：钋和镭。Marie两次获得诺贝尔奖——一次是物理学奖（1903年），一次是化学奖（1911年）。她是第一位获得诺贝尔奖的女性。Marie于1934年因放射性材料工作引起的疾病去世。今天，她被铭记为历史上最伟大的科学家之一。`,
    statements: [
      {
        id: 'tf016-1',
        statement: 'Marie Curie was born in France.',
        statementZh: 'Marie Curie出生在法国。',
        answer: 'F',
        explanation: '原文说She was born in Poland',
      },
      {
        id: 'tf016-2',
        statement: 'She moved to France when she was 24.',
        statementZh: '她24岁时搬到法国。',
        answer: 'T',
        explanation: '原文说She moved to France when she was 24',
      },
      {
        id: 'tf016-3',
        statement: 'She discovered three new elements.',
        statementZh: '她发现了三种新元素。',
        answer: 'F',
        explanation: '原文说two new elements',
      },
      {
        id: 'tf016-4',
        statement: 'She won the Nobel Prize once.',
        statementZh: '她获得了一次诺贝尔奖。',
        answer: 'F',
        explanation: '原文说won the Nobel Prize twice',
      },
      {
        id: 'tf016-5',
        statement: 'She was the first woman to win a Nobel Prize.',
        statementZh: '她是第一位获得诺贝尔奖的女性。',
        answer: 'T',
        explanation: '原文说first woman to win a Nobel Prize',
      },
      {
        id: 'tf016-6',
        statement: 'She died in 1924.',
        statementZh: '她1924年去世。',
        answer: 'F',
        explanation: '原文说died in 1934',
      },
      {
        id: 'tf016-7',
        statement: 'She is remembered as a great scientist.',
        statementZh: '她被铭记为一位伟大的科学家。',
        answer: 'T',
        explanation: '原文说one of the greatest scientists in history',
      },
    ],
    difficulty: 'medium',
    topic: '历史人物',
  },

  {
    id: 'p4-017',
    title: 'Climate Change',
    titleZh: '气候变化',
    article: `Climate change is one of the biggest problems in the world today. It is caused mainly by human activities, such as burning fossil fuels (coal, oil and gas) for energy. This releases carbon dioxide into the atmosphere, which traps heat and makes the Earth warmer. The effects of climate change include rising sea levels, more extreme weather events, and loss of wildlife habitats. To reduce climate change, we can use renewable energy (like solar and wind power), plant more trees, and reduce our carbon footprint by using public transport or cycling instead of driving.`,
    articleZh: `气候变化是当今世界上最大的问题之一。它主要由人类活动引起，例如燃烧化石燃料（煤、石油和天然气）来获取能源。这会将二氧化碳释放到大气中，从而捕获热量并使地球变暖。气候变化的影响包括海平面上升、更极端的天气事件和野生动物栖息地的丧失。为了减少气候变化，我们可以使用可再生能源（如太阳能和风能）、种植更多树木，以及通过使用公共交通工具或骑自行车代替开车来减少碳足迹。`,
    statements: [
      {
        id: 'tf017-1',
        statement: 'Climate change is caused only by natural events.',
        statementZh: '气候变化仅由自然事件引起。',
        answer: 'F',
        explanation: '原文说caused mainly by human activities',
      },
      {
        id: 'tf017-2',
        statement: 'Burning fossil fuels releases carbon dioxide.',
        statementZh: '燃烧化石燃料会释放二氧化碳。',
        answer: 'T',
        explanation: '原文说releases carbon dioxide into the atmosphere',
      },
      {
        id: 'tf017-3',
        statement: 'Climate change makes the Earth cooler.',
        statementZh: '气候变化使地球变冷。',
        answer: 'F',
        explanation: '原文说makes the Earth warmer',
      },
      {
        id: 'tf017-4',
        statement: 'Rising sea levels are an effect of climate change.',
        statementZh: '海平面上升是气候变化的一个影响。',
        answer: 'T',
        explanation: '原文说effects include rising sea levels',
      },
      {
        id: 'tf017-5',
        statement: 'Solar power is a type of renewable energy.',
        statementZh: '太阳能是一种可再生能源。',
        answer: 'T',
        explanation: '原文说renewable energy (like solar and wind power)',
      },
      {
        id: 'tf017-6',
        statement: 'Planting trees can help reduce climate change.',
        statementZh: '植树可以帮助减少气候变化。',
        answer: 'T',
        explanation: '原文说plant more trees',
      },
      {
        id: 'tf017-7',
        statement: 'We should drive more to reduce our carbon footprint.',
        statementZh: '我们应该多开车以减少碳足迹。',
        answer: 'F',
        explanation: '原文说use public transport or cycling instead of driving',
      },
    ],
    difficulty: 'medium',
    topic: '环境',
  },

  {
    id: 'p4-018',
    title: 'The History of the Internet',
    titleZh: '互联网的历史',
    article: `The Internet started in the 1960s as a project called ARPANET, funded by the US government. It was designed to connect universities and research centres. In 1989, Tim Berners-Lee invented the World Wide Web (WWW), which made the Internet much easier to use. The first website went online in 1991. In the 1990s, companies like Google (1998) and Amazon (1994) were founded. Today, over 5 billion people use the Internet. Social media platforms like Facebook (2004), Twitter (2006), and Instagram (2010) have changed how we communicate. The Internet continues to evolve with new technologies like 5G and the Internet of Things (IoT).`,
    articleZh: `互联网始于1960年代，当时是一个名为ARPANET的项目，由美国政府资助。它旨在连接大学和研究中心。1989年，Tim Berners-Lee发明了万维网（WWW），这使得互联网更容易使用。第一个网站于1991年上线。在1990年代，像Google（1998年）和Amazon（1994年）这样的公司成立了。今天，超过50亿人使用互联网。像Facebook（2004年）、Twitter（2006年）和Instagram（2010年）这样的社交媒体平台改变了我们的沟通方式。互联网随着5G和物联网（IoT）等新技术继续发展。`,
    statements: [
      {
        id: 'tf018-1',
        statement: 'The Internet started in the 1950s.',
        statementZh: '互联网始于1950年代。',
        answer: 'F',
        explanation: '原文说started in the 1960s',
      },
      {
        id: 'tf018-2',
        statement: 'Tim Berners-Lee invented the World Wide Web.',
        statementZh: 'Tim Berners-Lee发明了万维网。',
        answer: 'T',
        explanation: '原文说Tim Berners-Lee invented the World Wide Web',
      },
      {
        id: 'tf018-3',
        statement: 'The first website went online in 1989.',
        statementZh: '第一个网站于1989年上线。',
        answer: 'F',
        explanation: '原文说first website went online in 1991',
      },
      {
        id: 'tf018-4',
        statement: 'Google was founded before Amazon.',
        statementZh: 'Google比Amazon更早成立。',
        answer: 'F',
        explanation: 'Amazon是1994年，Google是1998年',
      },
      {
        id: 'tf018-5',
        statement: 'Twitter started in 2004.',
        statementZh: 'Twitter始于2004年。',
        answer: 'F',
        explanation: '原文说Twitter (2006)',
      },
      {
        id: 'tf018-6',
        statement: 'Over 5 billion people use the Internet today.',
        statementZh: '今天超过50亿人使用互联网。',
        answer: 'T',
        explanation: '原文说over 5 billion people use the Internet',
      },
      {
        id: 'tf018-7',
        statement: 'The Internet of Things is an old technology.',
        statementZh: '物联网是一项旧技术。',
        answer: 'F',
        explanation: '原文说new technologies like 5G and the Internet of Things',
      },
    ],
    difficulty: 'medium',
    topic: '科技',
  },

  {
    id: 'p4-019',
    title: 'Healthy Eating Habits',
    titleZh: '健康饮食习惯',
    article: `Eating a balanced diet is essential for good health. A healthy meal should include carbohydrates (like rice, bread, or pasta), protein (from meat, fish, eggs, or beans), healthy fats (from nuts, olive oil, or avocados), and plenty of fruits and vegetables. Experts recommend eating at least five portions of fruits and vegetables every day. We should also drink 6-8 glasses of water daily. It is important to limit processed foods, which often contain high levels of sugar, salt, and unhealthy fats. Eating regular meals and avoiding late-night snacking can also help maintain a healthy weight. Finally, eating mindfully – paying attention to what and how much we eat – can improve our relationship with food.`,
    articleZh: `均衡的饮食对于良好的健康至关重要。一顿健康的餐食应该包括碳水化合物（如米饭、面包或意大利面）、蛋白质（来自肉、鱼、鸡蛋或豆类）、健康脂肪（来自坚果、橄榄油或牛油果）以及大量的水果和蔬菜。专家建议每天至少吃五份水果和蔬菜。我们还应该每天喝6-8杯水。限制加工食品也很重要，它们通常含有高水平的糖、盐和不健康脂肪。规律进餐并避免深夜吃零食也可以帮助保持健康体重。最后，正念饮食——注意我们吃什么和吃多少——可以改善我们与食物的关系。`,
    statements: [
      {
        id: 'tf019-1',
        statement: 'A healthy meal should include carbohydrates and protein.',
        statementZh: '一顿健康的餐食应该包括碳水化合物和蛋白质。',
        answer: 'T',
        explanation: '原文说include carbohydrates... protein',
      },
      {
        id: 'tf019-2',
        statement: 'We should eat at least three portions of fruits daily.',
        statementZh: '我们应该每天至少吃三份水果。',
        answer: 'F',
        explanation: '原文说at least five portions',
      },
      {
        id: 'tf019-3',
        statement: 'We should drink 6-8 glasses of water daily.',
        statementZh: '我们应该每天喝6-8杯水。',
        answer: 'T',
        explanation: '原文说drink 6-8 glasses of water daily',
      },
      {
        id: 'tf019-4',
        statement: 'Processed foods are always healthy.',
        statementZh: '加工食品总是健康的。',
        answer: 'F',
        explanation: '原文说limit processed foods',
      },
      {
        id: 'tf019-5',
        statement: 'Late-night snacking is good for health.',
        statementZh: '深夜吃零食对健康有益。',
        answer: 'F',
        explanation: '原文说avoiding late-night snacking',
      },
      {
        id: 'tf019-6',
        statement: 'Eating mindfully can improve our relationship with food.',
        statementZh: '正念饮食可以改善我们与食物的关系。',
        answer: 'T',
        explanation: '原文说improve our relationship with food',
      },
      {
        id: 'tf019-7',
        statement: 'Healthy fats come from nuts and olive oil.',
        statementZh: '健康脂肪来自坚果和橄榄油。',
        answer: 'T',
        explanation: '原文说healthy fats (from nuts, olive oil, or avocados)',
      },
    ],
    difficulty: 'medium',
    topic: '健康',
  },

  {
    id: 'p4-020',
    title: 'The Benefits of Reading',
    titleZh: '阅读的好处',
    article: `Reading books has many benefits for both children and adults. First, reading improves vocabulary and language skills. When we read, we encounter new words and phrases, which helps us express ourselves better. Second, reading enhances concentration and focus. In today's digital world, many people have short attention spans, but reading a book requires sustained attention. Third, reading can reduce stress. Studies show that reading for just six minutes can lower stress levels by up to 68%. Fourth, reading improves empathy. When we read fiction, we experience different perspectives and understand other people's feelings. Finally, reading is a lifelong source of entertainment and knowledge. Unlike watching TV or playing video games, reading exercises our imagination.`,
    articleZh: `阅读书籍对儿童和成人都有很多好处。首先，阅读提高词汇量和语言技能。当我们阅读时，我们会遇到新单词和短语，这有助于我们更好地表达自己。其次，阅读增强注意力和专注力。在当今的数字世界中，许多人的注意力持续时间很短，但阅读一本书需要持续的注意力。第三，阅读可以减轻压力。研究表明，仅阅读六分钟就可以将压力水平降低多达68%。第四，阅读提高同理心。当我们阅读小说时，我们体验不同的视角并理解他人的感受。最后，阅读是终身的娱乐和知识来源。与看电视或玩电子游戏不同，阅读锻炼我们的想象力。`,
    statements: [
      {
        id: 'tf020-1',
        statement: 'Reading improves vocabulary.',
        statementZh: '阅读提高词汇量。',
        answer: 'T',
        explanation: '原文说reading improves vocabulary and language skills',
      },
      {
        id: 'tf020-2',
        statement: 'Reading reduces attention span.',
        statementZh: '阅读减少注意力持续时间。',
        answer: 'F',
        explanation: '原文说requires sustained attention',
      },
      {
        id: 'tf020-3',
        statement: 'Reading can lower stress levels.',
        statementZh: '阅读可以降低压力水平。',
        answer: 'T',
        explanation: '原文说reading can reduce stress... lower stress levels by up to 68%',
      },
      {
        id: 'tf020-4',
        statement: 'Reading fiction improves empathy.',
        statementZh: '阅读小说提高同理心。',
        answer: 'T',
        explanation: '原文说reading improves empathy... experience different perspectives',
      },
      {
        id: 'tf020-5',
        statement: 'Reading is only for children.',
        statementZh: '阅读只适合儿童。',
        answer: 'F',
        explanation: '原文说for both children and adults',
      },
      {
        id: 'tf020-6',
        statement: 'Reading exercises our imagination.',
        statementZh: '阅读锻炼我们的想象力。',
        answer: 'T',
        explanation: '原文说reading exercises our imagination',
      },
      {
        id: 'tf020-7',
        statement: 'Watching TV is better than reading for imagination.',
        statementZh: '看电视比阅读更有助于想象力。',
        answer: 'F',
        explanation: '原文说Unlike watching TV... reading exercises our imagination',
      },
    ],
    difficulty: 'medium',
    topic: '教育',
  },

];




// ==================== Part 5: 选词填空数据 ====================

export const part5Articles: Part5Article[] = [
// ==================== p5-001 ====================
  {
    id: 'p5-001',
    title: 'Email to a Friend',
    titleZh: '给朋友的邮件',
    text: `Dear Emma,

I am writing to tell you about my new school. It is very (1) ____ and has a big playground. My favourite (2) ____ is English because our teacher is very nice. After school, I often (3) ____ football with my classmates. 

There is also a (4) ____ where we can read books. I have made many new (5) ____. My best new friend is called Tom. He sits next to (6) ____ in class. 

Please write back and tell me about your school (7) ____. I hope you can (8) ____ me soon. My mum says you can come and (9) ____ the weekend with us. We can (10) ____ my new computer game together.

Best wishes,
Alex`,
    textFull: `Dear Emma,

I am writing to tell you about my new school. It is very big (1) and has a big playground. My favourite subject (2) is English because our teacher is very nice. After school, I often play (3) football with my classmates.

There is also a library (4) where we can read books. I have made many new friends (5). My best new friend is called Tom. He sits next to me (6) in class.

Please write back and tell me about your school too (7). I hope you can visit (8) me soon. My mum says you can come and stay (9) the weekend with us. We can play (10) my new computer game together.

Best wishes,
Alex`,
    gaps: [
      { id: 'p5-001-1', position: 1, wordBox: ['big', 'small', 'old', 'new', 'high', 'clean', 'warm', 'cold', 'quiet', 'busy', 'far', 'near', 'open', 'closed', 'dark'], answer: 'big', explanation: '学校很大，有大的操场' },
      { id: 'p5-001-2', position: 2, wordBox: ['subject', 'lesson', 'class', 'room', 'teacher', 'student', 'book', 'desk', 'school', 'homework', 'exam', 'break', 'lunch', 'sport', 'music'], answer: 'subject', explanation: 'English 是一门学科(subject)' },
      { id: 'p5-001-3', position: 3, wordBox: ['play', 'go', 'come', 'run', 'walk', 'sit', 'stand', 'read', 'write', 'draw', 'sing', 'dance', 'swim', 'jump', 'cook'], answer: 'play', explanation: 'play football 踢足球' },
      { id: 'p5-001-4', position: 4, wordBox: ['library', 'office', 'shop', 'park', 'garden', 'kitchen', 'bedroom', 'classroom', 'toilet', 'hall', 'cinema', 'museum', 'restaurant', 'hospital', 'station'], answer: 'library', explanation: '可以读书的地方是图书馆(library)' },
      { id: 'p5-001-5', position: 5, wordBox: ['friends', 'teachers', 'parents', 'brothers', 'sisters', 'cousins', 'neighbours', 'classmates', 'pupils', 'boys', 'girls', 'men', 'women', 'children', 'babies'], answer: 'friends', explanation: '交了新朋友(make friends)' },
      { id: 'p5-001-6', position: 6, wordBox: ['me', 'him', 'her', 'us', 'them', 'you', 'it', 'my', 'his', 'her', 'our', 'their', 'your', 'its', 'mine'], answer: 'me', explanation: '坐在我旁边(next to me)' },
      { id: 'p5-001-7', position: 7, wordBox: ['too', 'also', 'very', 'really', 'quite', 'so', 'such', 'well', 'much', 'many', 'often', 'always', 'sometimes', 'never', 'ever'], answer: 'too', explanation: '也告诉我你的学校(tell me too)' },
      { id: 'p5-001-8', position: 8, wordBox: ['visit', 'call', 'email', 'text', 'phone', 'write', 'read', 'look', 'watch', 'listen', 'help', 'thank', 'bring', 'take', 'carry'], answer: 'visit', explanation: '希望你 soon 来拜访我(visit me)' },
      { id: 'p5-001-9', position: 9, wordBox: ['stay', 'come', 'go', 'play', 'eat', 'sleep', 'sit', 'live', 'work', 'study', 'help', 'cook', 'wash', 'clean', 'walk'], answer: 'stay', explanation: '来和我待在一起(stay the weekend)' },
      { id: 'p5-001-10', position: 10, wordBox: ['play', 'watch', 'listen', 'read', 'write', 'draw', 'sing', 'dance', 'cook', 'swim', 'run', 'jump', 'walk', 'ride', 'fly'], answer: 'play', explanation: '一起玩电脑游戏(play my new computer game)' },
    ],
    difficulty: 'easy',
    topic: '学校生活',
  },

// ==================== p5-002 ====================
  {
    id: 'p5-002',
    title: 'A Note About Homework',
    titleZh: '关于家庭作业的通知',
    text: `Dear students,

This is a (1) ____ about your homework for next week. Please (2) ____ to bring your English book to class on Monday. We will have a (3) ____ about animals.

For science, you need to (4) ____ a poster about your favourite animal. You can use (5) ____ and colour pencils. The poster must be (6) ____ on A4 paper.

Please (7) ____ your homework on time. If you have any (8) ____, please ask me in class or send me an (9) ____. 

I hope you all have a good (10) ____!

Mr Brown`,
    textFull: `Dear students,

This is a note (1) about your homework for next week. Please remember (2) to bring your English book to class on Monday. We will have a lesson (3) about animals.

For science, you need to make (4) a poster about your favourite animal. You can use pens (5) and colour pencils. The poster must be done (6) on A4 paper.

Please bring (7) your homework on time. If you have any questions (8), please ask me in class or send me an email (9).

I hope you all have a good weekend (10)!

Mr Brown`,
    gaps: [
      { id: 'p5-002-1', position: 1, wordBox: ['note', 'letter', 'email', 'book', 'card', 'photo', 'picture', 'map', 'list', 'ticket', 'news', 'message', 'report', 'diary', 'magazine'], answer: 'note', explanation: '这是一张通知(note)' },
      { id: 'p5-002-2', position: 2, wordBox: ['remember', 'forget', 'start', 'begin', 'try', 'want', 'need', 'like', 'love', 'hate', 'stop', 'finish', 'help', 'ask', 'answer'], answer: 'remember', explanation: '请记得(remember)带书来' },
      { id: 'p5-002-3', position: 3, wordBox: ['lesson', 'game', 'film', 'song', 'story', 'book', 'test', 'exam', 'party', 'picnic', 'trip', 'visit', 'show', 'play', 'sport'], answer: 'lesson', explanation: '会有一堂课(lesson)关于动物' },
      { id: 'p5-002-4', position: 4, wordBox: ['make', 'take', 'bring', 'buy', 'find', 'draw', 'write', 'read', 'cut', 'stick', 'paint', 'colour', 'clean', 'open', 'close'], answer: 'make', explanation: '做一个海报(make a poster)' },
      { id: 'p5-002-5', position: 5, wordBox: ['pens', 'books', 'rulers', 'bags', 'boxes', 'computers', 'phones', 'tables', 'chairs', 'desks', 'maps', 'photos', 'cards', 'toys', 'games'], answer: 'pens', explanation: '可以用钢笔(pens)和彩铅' },
      { id: 'p5-002-6', position: 6, wordBox: ['done', 'written', 'drawn', 'made', 'put', 'kept', 'left', 'given', 'taken', 'brought', 'found', 'sent', 'got', 'had', 'seen'], answer: 'done', explanation: '海报必须用 A4 纸完成(be done on A4 paper)' },
      { id: 'p5-002-7', position: 7, wordBox: ['bring', 'take', 'carry', 'send', 'give', 'show', 'tell', 'ask', 'answer', 'help', 'thank', 'love', 'like', 'hate', 'start'], answer: 'bring', explanation: '请准时带(bring)作业来' },
      { id: 'p5-002-8', position: 8, wordBox: ['questions', 'problems', 'ideas', 'plans', 'ways', 'things', 'words', 'books', 'pens', 'bags', 'friends', 'teachers', 'students', 'parents', 'children'], answer: 'questions', explanation: '有任何问题(questions)可以问我' },
      { id: 'p5-002-9', position: 9, wordBox: ['email', 'letter', 'note', 'card', 'book', 'photo', 'picture', 'map', 'list', 'ticket', 'call', 'text', 'phone', 'visit', 'gift'], answer: 'email', explanation: '发邮件(email)给我' },
      { id: 'p5-002-10', position: 10, wordBox: ['weekend', 'weekday', 'morning', 'afternoon', 'evening', 'night', 'day', 'hour', 'minute', 'month', 'year', 'time', 'holiday', 'break', 'lunch'], answer: 'weekend', explanation: '祝大家周末愉快(have a good weekend)' },
    ],
    difficulty: 'easy',
    topic: '学校生活',
  },

// ==================== p5-003 ====================
  {
    id: 'p5-003',
    title: 'My Favourite Hobby',
    titleZh: '我的爱好',
    text: `I love taking (1) ____ in my free time. Last Saturday, I went to the park with my (2) ____. I took photos of the trees, the (3) ____ and the birds. 

My mum has a beautiful (4) ____. It has red and yellow flowers. I took a lovely (5) ____ of it. Then I saw a (6) ____ sitting on a branch. I took a photo of the bird (7) ____.

When I got (8) ____, I showed the photos to my dad. He said they were very (9) ____. Next weekend, I want to take photos of the (10) ____ in my street.`,
    textFull: `I love taking photos (1) in my free time. Last Saturday, I went to the park with my camera (2). I took photos of the trees, the flowers (3) and the birds.

My mum has a beautiful garden (4). It has red and yellow flowers. I took a lovely photo (5) of it. Then I saw a bird (6) sitting on a branch. I took a photo of the bird too (7).

When I got home (8), I showed the photos to my dad. He said they were very good (9). Next weekend, I want to take photos of the houses (10) in my street.`,
    gaps: [
      { id: 'p5-003-1', position: 1, wordBox: ['photos', 'books', 'pens', 'bags', 'boxes', 'cakes', 'cards', 'games', 'songs', 'films', 'shows', 'plays', 'toys', 'balls', 'bikes'], answer: 'photos', explanation: 'take photos 拍照' },
      { id: 'p5-003-2', position: 2, wordBox: ['camera', 'phone', 'book', 'bag', 'box', 'pen', 'pencil', 'ruler', 'map', 'list', 'ticket', 'card', 'photo', 'picture', 'computer'], answer: 'camera', explanation: '带着相机(camera)去公园拍照' },
      { id: 'p5-003-3', position: 3, wordBox: ['flowers', 'trees', 'birds', 'dogs', 'cats', 'cars', 'buses', 'houses', 'shops', 'parks', 'schools', 'rooms', 'tables', 'chairs', 'desks'], answer: 'flowers', explanation: '拍了树、花(flowers)和鸟的照片' },
      { id: 'p5-003-4', position: 4, wordBox: ['garden', 'kitchen', 'bedroom', 'bathroom', 'living room', 'dining room', 'office', 'shop', 'park', 'school', 'library', 'classroom', 'hall', 'garden', 'room'], answer: 'garden', explanation: '妈妈有一个美丽的花园(garden)' },
      { id: 'p5-003-5', position: 5, wordBox: ['photo', 'book', 'pen', 'card', 'cake', 'game', 'song', 'film', 'show', 'play', 'toy', 'ball', 'bike', 'computer', 'phone'], answer: 'photo', explanation: '给花园拍了一张可爱的照片(photo)' },
      { id: 'p5-003-6', position: 6, wordBox: ['bird', 'dog', 'cat', 'fish', 'horse', 'cow', 'sheep', 'duck', 'chicken', 'pig', 'rabbit', 'mouse', 'snake', 'frog', 'ant'], answer: 'bird', explanation: '看到一个鸟(bird)坐在树枝上' },
      { id: 'p5-003-7', position: 7, wordBox: ['too', 'also', 'very', 'really', 'quite', 'so', 'such', 'well', 'much', 'many', 'often', 'always', 'sometimes', 'never', 'ever'], answer: 'too', explanation: '也给鸟拍了照片(too)' },
      { id: 'p5-003-8', position: 8, wordBox: ['home', 'school', 'park', 'shop', 'library', 'cinema', 'museum', 'restaurant', 'hospital', 'station', 'office', 'garden', 'kitchen', 'bedroom', 'bathroom'], answer: 'home', explanation: '回到家(get home)后给爸爸看照片' },
      { id: 'p5-003-9', position: 9, wordBox: ['good', 'bad', 'big', 'small', 'new', 'old', 'hot', 'cold', 'clean', 'dirty', 'happy', 'sad', 'angry', 'tired', 'excited'], answer: 'good', explanation: '爸爸说照片很棒(good)' },
      { id: 'p5-003-10', position: 10, wordBox: ['houses', 'trees', 'flowers', 'birds', 'dogs', 'cats', 'cars', 'buses', 'shops', 'parks', 'schools', 'people', 'children', 'friends', 'teachers'], answer: 'houses', explanation: '想给街上的房子(houses)拍照' },
    ],
    difficulty: 'easy',
    topic: '兴趣爱好',
  },

// ==================== p5-004 ====================
  {
    id: 'p5-004',
    title: 'A Birthday Invitation',
    titleZh: '生日派对邀请',
    text: `Hi Sarah,

I am having a birthday (1) ____ next Saturday at my house. I hope you can (2) ____. It starts at 3 o'clock in the (3) ____.

There will be a big cake and lots of (4) ____ to eat. We can play games in the (5) ____. My mum will buy some (6) ____ for everyone. 

Please (7) ____ your swimming costume because we might go in the (8) ____! 

Let me (9) ____ if you can come. My phone (10) ____ is 07700 900 123.

Love,
Emma`,
    textFull: `Hi Sarah,

I am having a birthday party (1) next Saturday at my house. I hope you can come (2). It starts at 3 o'clock in the afternoon (3).

There will be a big cake and lots of food (4) to eat. We can play games in the garden (5). My mum will buy some presents (6) for everyone.

Please bring (7) your swimming costume because we might go in the pool (8)!

Let me know (9) if you can come. My phone number (10) is 07700 900 123.

Love,
Emma`,
    gaps: [
      { id: 'p5-004-1', position: 1, wordBox: ['party', 'dinner', 'lunch', 'breakfast', 'picnic', 'meeting', 'lesson', 'class', 'game', 'film', 'show', 'play', 'sport', 'trip', 'visit'], answer: 'party', explanation: '生日派对(birthday party)' },
      { id: 'p5-004-2', position: 2, wordBox: ['come', 'go', 'stay', 'play', 'eat', 'drink', 'sleep', 'sit', 'stand', 'run', 'walk', 'swim', 'dance', 'sing', 'jump'], answer: 'come', explanation: '希望你能来(come)' },
      { id: 'p5-004-3', position: 3, wordBox: ['afternoon', 'morning', 'evening', 'night', 'day', 'week', 'month', 'year', 'hour', 'minute', 'today', 'tomorrow', 'yesterday', 'now', 'then'], answer: 'afternoon', explanation: '下午3点开始(in the afternoon)' },
      { id: 'p5-004-4', position: 4, wordBox: ['food', 'books', 'pens', 'bags', 'boxes', 'cakes', 'cards', 'games', 'songs', 'films', 'shows', 'plays', 'toys', 'balls', 'bikes'], answer: 'food', explanation: '有很多食物(food)可以吃' },
      { id: 'p5-004-5', position: 5, wordBox: ['garden', 'kitchen', 'bedroom', 'bathroom', 'living room', 'dining room', 'office', 'shop', 'park', 'school', 'library', 'classroom', 'hall', 'room', 'house'], answer: 'garden', explanation: '在花园(garden)里玩游戏' },
      { id: 'p5-004-6', position: 6, wordBox: ['presents', 'books', 'pens', 'bags', 'boxes', 'cakes', 'cards', 'games', 'songs', 'films', 'shows', 'plays', 'toys', 'balls', 'bikes'], answer: 'presents', explanation: '妈妈会给每个人买礼物(presents)' },
      { id: 'p5-004-7', position: 7, wordBox: ['bring', 'take', 'carry', 'send', 'give', 'show', 'tell', 'ask', 'answer', 'help', 'thank', 'love', 'like', 'hate', 'start'], answer: 'bring', explanation: '请带(bring)游泳衣来' },
      { id: 'p5-004-8', position: 8, wordBox: ['pool', 'sea', 'lake', 'river', 'bath', 'shower', 'kitchen', 'garden', 'park', 'school', 'house', 'room', 'office', 'shop', 'cinema'], answer: 'pool', explanation: '可能会去泳池(pool)游泳' },
      { id: 'p5-004-9', position: 9, wordBox: ['know', 'see', 'hear', 'feel', 'taste', 'smell', 'watch', 'listen', 'look', 'find', 'lose', 'give', 'take', 'bring', 'send'], answer: 'know', explanation: '让我知道(let me know)你能不能来' },
      { id: 'p5-004-10', position: 10, wordBox: ['number', 'book', 'pen', 'bag', 'box', 'cake', 'card', 'game', 'song', 'film', 'show', 'play', 'toy', 'ball', 'bike'], answer: 'number', explanation: '电话号码(phone number)' },
    ],
    difficulty: 'easy',
    topic: '庆祝',
  },

// ==================== p5-005 ====================
  {
    id: 'p5-005',
    title: 'My Last Holiday',
    titleZh: '我的上个假期',
    text: `Last summer, my family and I went on holiday to the (1) ____. We stayed in a hotel near the (2) ____. The water was warm and (3) ____.

Every day, I (4) ____ in the sea with my dad. My mum (5) ____ on the beach and read books. One day, we went to a (6) ____ and saw many fish.

In the evenings, we ate (7) ____ at a restaurant near the hotel. The food was (8) ____. On the last day, I bought some (9) ____ for my friends.

I hope we can go (10) ____ again next year.`,
    textFull: `Last summer, my family and I went on holiday to the beach (1). We stayed in a hotel near the sea (2). The water was warm and blue (3).

Every day, I swam (4) in the sea with my dad. My mum sat (5) on the beach and read books. One day, we went to a museum (6) and saw many fish.

In the evenings, we ate dinner (7) at a restaurant near the hotel. The food was delicious (8). On the last day, I bought some presents (9) for my friends.

I hope we can go there (10) again next year.`,
    gaps: [
      { id: 'p5-005-1', position: 1, wordBox: ['beach', 'mountain', 'city', 'town', 'village', 'country', 'forest', 'park', 'garden', 'school', 'library', 'cinema', 'museum', 'restaurant', 'station'], answer: 'beach', explanation: '去海滩(beach)度假' },
      { id: 'p5-005-2', position: 2, wordBox: ['sea', 'river', 'lake', 'pool', 'garden', 'park', 'school', 'library', 'cinema', 'museum', 'restaurant', 'station', 'office', 'shop', 'house'], answer: 'sea', explanation: '酒店靠近大海(sea)' },
      { id: 'p5-005-3', position: 3, wordBox: ['blue', 'red', 'green', 'yellow', 'black', 'white', 'brown', 'pink', 'purple', 'orange', 'grey', 'dark', 'light', 'cold', 'warm'], answer: 'blue', explanation: '海水温暖且蔚蓝(blue)' },
      { id: 'p5-005-4', position: 4, wordBox: ['swam', 'walked', 'ran', 'jumped', 'played', 'ate', 'drank', 'slept', 'sat', 'stood', 'read', 'wrote', 'drew', 'sang', 'danced'], answer: 'swam', explanation: '和爸爸在海里游泳(swam)' },
      { id: 'p5-005-5', position: 5, wordBox: ['sat', 'stood', 'lay', 'walked', 'ran', 'jumped', 'played', 'ate', 'drank', 'slept', 'read', 'wrote', 'drew', 'sang', 'danced'], answer: 'sat', explanation: '妈妈坐(sat)在沙滩上读书' },
      { id: 'p5-005-6', position: 6, wordBox: ['museum', 'cinema', 'restaurant', 'station', 'office', 'shop', 'park', 'school', 'library', 'classroom', 'hall', 'room', 'house', 'garden', 'beach'], answer: 'museum', explanation: '去博物馆(museum)看了很多鱼（应该是水族馆，但 KET 常用 museum）' },
      { id: 'p5-005-7', position: 7, wordBox: ['dinner', 'breakfast', 'lunch', 'picnic', 'cake', 'bread', 'rice', 'meat', 'fish', 'soup', 'salad', 'sandwich', 'pizza', 'burger', 'chips'], answer: 'dinner', explanation: '晚上在餐厅吃晚饭(dinner)' },
      { id: 'p5-005-8', position: 8, wordBox: ['delicious', 'big', 'small', 'hot', 'cold', 'clean', 'dirty', 'new', 'old', 'happy', 'sad', 'angry', 'tired', 'excited', 'bored'], answer: 'delicious', explanation: '食物很美味(delicious)' },
      { id: 'p5-005-9', position: 9, wordBox: ['presents', 'books', 'pens', 'bags', 'boxes', 'cakes', 'cards', 'games', 'songs', 'films', 'shows', 'plays', 'toys', 'balls', 'bikes'], answer: 'presents', explanation: '给朋友买礼物(presents)' },
      { id: 'p5-005-10', position: 10, wordBox: ['there', 'here', 'home', 'school', 'park', 'beach', 'mountain', 'city', 'town', 'village', 'country', 'forest', 'garden', 'library', 'cinema'], answer: 'there', explanation: '希望明年能再去那里(go there)' },
    ],
    difficulty: 'easy',
    topic: '旅行',
  },

// ==================== p5-006 ====================
  {
    id: 'p5-006',
    title: 'My School Day',
    titleZh: '我的上学日',
    text: `I get up at seven o'clock every (1) ____. I have breakfast with my family and then I (2) ____ to school. School starts at eight (3) ____.

At break time, I play (4) ____ with my friends. We have lunch at school. The (5) ____ is usually very nice. After lunch, we have two more (6) ____.

School finishes at four o'clock. I (7) ____ home and have a snack. Then I do my (8) ____. In the evening, I (9) ____ TV or read a book. I go to (10) ____ at nine o'clock.`,
    textFull: `I get up at seven o'clock every morning (1). I have breakfast with my family and then I go (2) to school. School starts at eight o'clock (3).

At break time, I play football (4) with my friends. We have lunch at school. The food (5) is usually very nice. After lunch, we have two more lessons (6).

School finishes at four o'clock. I walk (7) home and have a snack. Then I do my homework (8). In the evening, I watch (9) TV or read a book. I go to bed (10) at nine o'clock.`,
    gaps: [
      { id: 'p5-006-1', position: 1, wordBox: ['morning', 'afternoon', 'evening', 'night', 'day', 'week', 'month', 'year', 'hour', 'minute', 'today', 'tomorrow', 'yesterday', 'now', 'then'], answer: 'morning', explanation: '每天早上(every morning)7点起床' },
      { id: 'p5-006-2', position: 2, wordBox: ['go', 'come', 'walk', 'run', 'jump', 'swim', 'dance', 'sing', 'sit', 'stand', 'sleep', 'eat', 'drink', 'read', 'write'], answer: 'go', explanation: '去(go)上学' },
      { id: 'p5-006-3', position: 3, wordBox: ["o'clock", 'hour', 'minute', 'day', 'week', 'month', 'year', 'time', 'moment', 'while', 'period', 'term', 'semester', 'season', 'age'], answer: "o'clock", explanation: "8点钟(at eight o'clock)" },
      { id: 'p5-006-4', position: 4, wordBox: ['football', 'basketball', 'tennis', 'swimming', 'running', 'jumping', 'dancing', 'singing', 'reading', 'writing', 'drawing', 'cooking', 'eating', 'drinking', 'sleeping'], answer: 'football', explanation: '课间踢足球(play football)' },
      { id: 'p5-006-5', position: 5, wordBox: ['food', 'book', 'pen', 'bag', 'box', 'cake', 'card', 'game', 'song', 'film', 'show', 'play', 'toy', 'ball', 'bike'], answer: 'food', explanation: '食物(food)通常很好吃' },
      { id: 'p5-006-6', position: 6, wordBox: ['lessons', 'games', 'films', 'shows', 'plays', 'songs', 'books', 'pens', 'bags', 'boxes', 'cakes', 'cards', 'toys', 'balls', 'bikes'], answer: 'lessons', explanation: '午饭后还有两节课(two more lessons)' },
      { id: 'p5-006-7', position: 7, wordBox: ['walk', 'run', 'jump', 'swim', 'dance', 'sing', 'sit', 'stand', 'sleep', 'eat', 'drink', 'read', 'write', 'draw', 'cook'], answer: 'walk', explanation: '走(walk)回家' },
      { id: 'p5-006-8', position: 8, wordBox: ['homework', 'book', 'pen', 'bag', 'box', 'cake', 'card', 'game', 'song', 'film', 'show', 'play', 'toy', 'ball', 'bike'], answer: 'homework', explanation: '做家庭作业(do homework)' },
      { id: 'p5-006-9', position: 9, wordBox: ['watch', 'read', 'write', 'draw', 'sing', 'dance', 'swim', 'run', 'jump', 'eat', 'drink', 'sleep', 'sit', 'stand', 'walk'], answer: 'watch', explanation: '看电视(watch TV)' },
      { id: 'p5-006-10', position: 10, wordBox: ['bed', 'school', 'park', 'library', 'cinema', 'museum', 'restaurant', 'station', 'office', 'shop', 'house', 'garden', 'kitchen', 'bedroom', 'bathroom'], answer: 'bed', explanation: '上床睡觉(go to bed)' },
    ],
    difficulty: 'easy',
    topic: '学校生活',
  },

// ==================== p5-007 ====================
  {
    id: 'p5-007',
    title: 'Lost Property Note',
    titleZh: '失物招领通知',
    text: `LOST!

I (1) ____ my bag on the bus yesterday. It is a blue (2) ____ bag. There is a (3) ____ book inside with my name on it.

Also in the bag: a (4) ____ case with my pens and pencils, and a (5) ____ box with my lunch.

If you (6) ____ my bag, please call me on 07700 123 456. You can also (7) ____ me an email at tom@email.com.

There is a (8) ____ for the person who finds it. Thank you very (9) ____!

Tom (Year 7) — Please (10) ____ this note on the school board.`,
    textFull: `LOST!

I lost (1) my bag on the bus yesterday. It is a blue school (2) bag. There is a maths (3) book inside with my name on it.

Also in the bag: a pencil (4) case with my pens and pencils, and a lunch (5) box with my lunch.

If you find (6) my bag, please call me on 07700 123 456. You can also send (7) me an email at tom@email.com.

There is a prize (8) for the person who finds it. Thank you very much (9)!

Tom (Year 7) — Please put (10) this note on the school board.`,
    gaps: [
      { id: 'p5-007-1', position: 1, wordBox: ['lost', 'found', 'bought', 'made', 'took', 'brought', 'sent', 'got', 'had', 'kept', 'left', 'put', 'gave', 'showed', 'told'], answer: 'lost', explanation: '昨天在公交车上丢了(lost)包' },
      { id: 'p5-007-2', position: 2, wordBox: ['school', 'sports', 'lunch', 'pencil', 'music', 'computer', 'phone', 'key', 'door', 'window', 'table', 'chair', 'desk', 'bed', 'bath'], answer: 'school', explanation: '蓝色的书包(school bag)' },
      { id: 'p5-007-3', position: 3, wordBox: ['maths', 'english', 'history', 'science', 'music', 'art', 'sport', 'computer', 'phone', 'key', 'door', 'window', 'table', 'chair', 'desk'], answer: 'maths', explanation: '里面有一本数学(maths)书' },
      { id: 'p5-007-4', position: 4, wordBox: ['pencil', 'phone', 'key', 'door', 'window', 'table', 'chair', 'desk', 'bed', 'bath', 'book', 'pen', 'bag', 'box', 'case'], answer: 'pencil', explanation: '文具盒(pencil case)' },
      { id: 'p5-007-5', position: 5, wordBox: ['lunch', 'pencil', 'phone', 'key', 'door', 'window', 'table', 'chair', 'desk', 'bed', 'bath', 'book', 'pen', 'bag', 'box'], answer: 'lunch', explanation: '午餐盒(lunch box)' },
      { id: 'p5-007-6', position: 6, wordBox: ['find', 'lose', 'buy', 'make', 'take', 'bring', 'send', 'get', 'have', 'keep', 'leave', 'put', 'give', 'show', 'tell'], answer: 'find', explanation: '如果你找到(find)我的包' },
      { id: 'p5-007-7', position: 7, wordBox: ['send', 'give', 'show', 'tell', 'ask', 'answer', 'help', 'thank', 'love', 'like', 'hate', 'start', 'finish', 'bring', 'take'], answer: 'send', explanation: '也可以发(send)邮件给我' },
      { id: 'p5-007-8', position: 8, wordBox: ['prize', 'book', 'pen', 'bag', 'box', 'cake', 'card', 'game', 'song', 'film', 'show', 'play', 'toy', 'ball', 'bike'], answer: 'prize', explanation: '有奖品(prize)给找到的人' },
      { id: 'p5-007-9', position: 9, wordBox: ['much', 'well', 'good', 'bad', 'big', 'small', 'hot', 'cold', 'clean', 'dirty', 'happy', 'sad', 'angry', 'tired', 'excited'], answer: 'much', explanation: '非常感谢（thank you very much）' },
      { id: 'p5-007-10', position: 10, wordBox: ['put', 'take', 'bring', 'send', 'give', 'show', 'tell', 'ask', 'answer', 'help', 'thank', 'love', 'like', 'hate', 'start'], answer: 'put', explanation: '请把(put)这张通知贴在学校的布告栏上' },
    ],
    difficulty: 'medium',
    topic: '学校生活',
  },

// ==================== p5-008 ====================
  {
    id: 'p5-008',
    title: 'My Favourite Animal',
    titleZh: '我最喜欢的动物',
    text: `My favourite animal is the (1) ____. It lives in the (2) ____ and eats bamboo. It has black and white (3) ____.

Pandas are very (4) ____ animals. They like to (5) ____ and play. Baby pandas are called (6) ____. They are very cute.

But pandas are in (7) ____. There are not many pandas left in the (8) ____. We need to (9) ____ them.

Please visit the panda website to (10) ____ more about these lovely animals.`,
    textFull: `My favourite animal is the panda (1). It lives in the forest (2) and eats bamboo. It has black and white fur (3).

Pandas are very quiet (4) animals. They like to sleep (5) and play. Baby pandas are called cubs (6). They are very cute.

But pandas are in danger (7). There are not many pandas left in the world (8). We need to help (9) them.

Please visit the panda website to learn (10) more about these lovely animals.`,
    gaps: [
      { id: 'p5-008-1', position: 1, wordBox: ['panda', 'lion', 'tiger', 'elephant', 'monkey', 'giraffe', 'zebra', 'bear', 'dog', 'cat', 'bird', 'fish', 'snake', 'frog', 'duck'], answer: 'panda', explanation: '最喜爱的动物是熊猫(panda)' },
      { id: 'p5-008-2', position: 2, wordBox: ['forest', 'desert', 'mountain', 'river', 'sea', 'lake', 'garden', 'park', 'school', 'library', 'cinema', 'museum', 'restaurant', 'station', 'office'], answer: 'forest', explanation: '熊猫住在森林(forest)里' },
      { id: 'p5-008-3', position: 3, wordBox: ['fur', 'skin', 'hair', 'feather', 'scale', 'shell', 'wood', 'leaf', 'grass', 'flower', 'root', 'branch', 'trunk', 'bark', 'seed'], answer: 'fur', explanation: '黑白相间的毛皮(fur)' },
      { id: 'p5-008-4', position: 4, wordBox: ['quiet', 'loud', 'fast', 'slow', 'big', 'small', 'hot', 'cold', 'clean', 'dirty', 'happy', 'sad', 'angry', 'tired', 'excited'], answer: 'quiet', explanation: '熊猫是很安静(quiet)的动物' },
      { id: 'p5-008-5', position: 5, wordBox: ['sleep', 'run', 'jump', 'swim', 'dance', 'sing', 'sit', 'stand', 'eat', 'drink', 'play', 'work', 'study', 'read', 'write'], answer: 'sleep', explanation: '喜欢睡觉(sleep)和玩耍' },
      { id: 'p5-008-6', position: 6, wordBox: ['cubs', 'kittens', 'puppies', 'babies', 'children', 'boys', 'girls', 'men', 'women', 'people', 'friends', 'teachers', 'students', 'parents', 'neighbours'], answer: 'cubs', explanation: '熊猫幼崽叫 cubs' },
      { id: 'p5-008-7', position: 7, wordBox: ['danger', 'forest', 'garden', 'park', 'school', 'library', 'cinema', 'museum', 'restaurant', 'station', 'office', 'shop', 'house', 'room', 'home'], answer: 'danger', explanation: '熊猫处于危险(in danger)中' },
      { id: 'p5-008-8', position: 8, wordBox: ['world', 'forest', 'garden', 'park', 'school', 'library', 'cinema', 'museum', 'restaurant', 'station', 'office', 'shop', 'house', 'room', 'home'], answer: 'world', explanation: '世界上(in the world)熊猫不多了' },
      { id: 'p5-008-9', position: 9, wordBox: ['help', 'find', 'lose', 'buy', 'make', 'take', 'bring', 'send', 'get', 'have', 'keep', 'leave', 'put', 'give', 'show'], answer: 'help', explanation: '我们需要帮助(help)它们' },
      { id: 'p5-008-10', position: 10, wordBox: ['learn', 'read', 'write', 'draw', 'sing', 'dance', 'swim', 'run', 'jump', 'eat', 'drink', 'sleep', 'sit', 'stand', 'walk'], answer: 'learn', explanation: '了解更多(learn more)关于这些可爱的动物' },
    ],
    difficulty: 'medium',
    topic: '动物',
  },

// ==================== p5-009 ====================
  {
    id: 'p5-009',
    title: 'A Letter to a Penfriend',
    titleZh: '给笔友的信',
    text: `Dear Penfriend,

My name is Luca and I am 13 years (1) ____. I live in Rome, the (2) ____ of Italy. Rome is a very old and beautiful (3) ____.

I have a big family: my (4) ____, my mum, my sister and my brother. My dad works in a (5) ____. My mum is a (6) ____. She teaches history at my school.

My hobbies are playing (7) ____ and reading comics. I also like (8) ____ pizza! Italian food is the (9) ____ in the world!

Please write back and tell me about (10) ____.

Best wishes,
Luca`,
    textFull: `Dear Penfriend,

My name is Luca and I am 13 years old (1). I live in Rome, the capital (2) of Italy. Rome is a very old and beautiful city (3).

I have a big family: my dad (4), my mum, my sister and my brother. My dad works in a bank (5). My mum is a teacher (6). She teaches history at my school.

My hobbies are playing football (7) and reading comics. I also like eating (8) pizza! Italian food is the best (9) in the world!

Please write back and tell me about yourself (10).

Best wishes,
Luca`,
    gaps: [
      { id: 'p5-009-1', position: 1, wordBox: ['old', 'young', 'new', 'big', 'small', 'hot', 'cold', 'clean', 'dirty', 'happy', 'sad', 'angry', 'tired', 'excited', 'bored'], answer: 'old', explanation: '13岁(13 years old)' },
      { id: 'p5-009-2', position: 2, wordBox: ['capital', 'city', 'town', 'village', 'country', 'forest', 'garden', 'park', 'school', 'library', 'cinema', 'museum', 'restaurant', 'station', 'office'], answer: 'capital', explanation: '罗马是意大利的首都(capital)' },
      { id: 'p5-009-3', position: 3, wordBox: ['city', 'town', 'village', 'country', 'forest', 'garden', 'park', 'school', 'library', 'cinema', 'museum', 'restaurant', 'station', 'office', 'shop'], answer: 'city', explanation: '罗马是一座非常古老而美丽的城市(city)' },
      { id: 'p5-009-4', position: 4, wordBox: ['dad', 'mum', 'sister', 'brother', 'uncle', 'aunt', 'cousin', 'friend', 'teacher', 'student', 'doctor', 'nurse', 'driver', 'cook', 'cleaner'], answer: 'dad', explanation: '我的爸爸(dad)、妈妈、姐姐和哥哥' },
      { id: 'p5-009-5', position: 5, wordBox: ['bank', 'school', 'hospital', 'office', 'shop', 'restaurant', 'cinema', 'museum', 'station', 'park', 'garden', 'library', 'classroom', 'hall', 'room'], answer: 'bank', explanation: '爸爸在银行(bank)工作' },
      { id: 'p5-009-6', position: 6, wordBox: ['teacher', 'doctor', 'nurse', 'driver', 'cook', 'cleaner', 'worker', 'farmer', 'soldier', 'policeman', 'firefighter', 'singer', 'dancer', 'player', 'writer'], answer: 'teacher', explanation: '妈妈是老师(teacher)' },
      { id: 'p5-009-7', position: 7, wordBox: ['football', 'basketball', 'tennis', 'swimming', 'running', 'jumping', 'dancing', 'singing', 'reading', 'writing', 'drawing', 'cooking', 'eating', 'drinking', 'sleeping'], answer: 'football', explanation: '爱好是踢足球(play football)和看漫画' },
      { id: 'p5-009-8', position: 8, wordBox: ['eating', 'drinking', 'cooking', 'making', 'taking', 'bringing', 'sending', 'getting', 'having', 'keeping', 'leaving', 'putting', 'giving', 'showing', 'telling'], answer: 'eating', explanation: '也喜欢吃(eating)披萨' },
      { id: 'p5-009-9', position: 9, wordBox: ['best', 'biggest', 'smallest', 'hottest', 'coldest', 'cleanest', 'dirtiest', 'happiest', 'saddest', 'angriest', 'tiredest', 'excitedest', 'boredest', 'fastest', 'slowest'], answer: 'best', explanation: '意大利食物是世界上最好的(best)' },
      { id: 'p5-009-10', position: 10, wordBox: ['yourself', 'myself', 'himself', 'herself', 'ourselves', 'yourselves', 'themselves', 'me', 'you', 'him', 'her', 'us', 'them', 'it', 'this'], answer: 'yourself', explanation: '请回信告诉我关于你自己(yourself)的事' },
    ],
    difficulty: 'medium',
    topic: '日常生活',
  },

// ==================== p5-010 ====================
  {
    id: 'p5-010',
    title: 'A Postcard from Holiday',
    titleZh: '假期明信片',
    text: `Dear Grandma,

I am having a lovely (1) ____ in London. The weather is (2) ____ and sunny today. Yesterday, I (3) ____ the British Museum. It was very (4) ____!

Today, I am (5) ____ in a park. There are many people (6) ____ dogs. London is a very (7) ____ city. The people are friendly (8) ____.

I will be (9) ____ next Saturday. See you (10) ____!

Love,
Emma`,
    textFull: `Dear Grandma,

I am having a lovely time (1) in London. The weather is warm (2) and sunny today. Yesterday, I visited (3) the British Museum. It was very interesting (4)!

Today, I am sitting (5) in a park. There are many people walking (6) dogs. London is a very big (7) city. The people are friendly too (8).

I will be home (9) next Saturday. See you soon (10)!

Love,
Emma`,
    gaps: [
      { id: 'p5-010-1', position: 1, wordBox: ['time', 'day', 'week', 'month', 'year', 'hour', 'minute', 'moment', 'while', 'period', 'term', 'semester', 'season', 'age', 'life'], answer: 'time', explanation: '度过美好的时光(having a lovely time)' },
      { id: 'p5-010-2', position: 2, wordBox: ['warm', 'hot', 'cold', 'cool', 'wet', 'dry', 'windy', 'snowy', 'foggy', 'cloudy', 'sunny', 'fine', 'bad', 'good', 'nice'], answer: 'warm', explanation: '天气温暖(warm)且晴朗' },
      { id: 'p5-010-3', position: 3, wordBox: ['visited', 'saw', 'went', 'came', 'walked', 'ran', 'jumped', 'swam', 'danced', 'sang', 'sat', 'stood', 'read', 'wrote', 'drew'], answer: 'visited', explanation: '昨天参观了(visited)大英博物馆' },
      { id: 'p5-010-4', position: 4, wordBox: ['interesting', 'boring', 'exciting', 'scary', 'funny', 'sad', 'happy', 'angry', 'tired', 'excited', 'bored', 'interested', 'excited', 'scared', 'surprised'], answer: 'interesting', explanation: '非常有趣(interesting)' },
      { id: 'p5-010-5', position: 5, wordBox: ['sitting', 'walking', 'running', 'jumping', 'swimming', 'dancing', 'singing', 'reading', 'writing', 'drawing', 'eating', 'drinking', 'sleeping', 'standing', 'playing'], answer: 'sitting', explanation: '正坐(sitting)在公园里' },
      { id: 'p5-010-6', position: 6, wordBox: ['walking', 'running', 'jumping', 'swimming', 'dancing', 'singing', 'reading', 'writing', 'drawing', 'eating', 'drinking', 'sleeping', 'sitting', 'standing', 'playing'], answer: 'walking', explanation: '很多人在遛(walking)狗' },
      { id: 'p5-010-7', position: 7, wordBox: ['big', 'small', 'old', 'new', 'hot', 'cold', 'clean', 'dirty', 'happy', 'sad', 'angry', 'tired', 'excited', 'bored', 'nice'], answer: 'big', explanation: '伦敦是一座很大的(big)城市' },
      { id: 'p5-010-8', position: 8, wordBox: ['too', 'also', 'very', 'really', 'quite', 'so', 'such', 'well', 'much', 'many', 'often', 'always', 'sometimes', 'never', 'ever'], answer: 'too', explanation: '人也友好(too)' },
      { id: 'p5-010-9', position: 9, wordBox: ['home', 'school', 'park', 'library', 'cinema', 'museum', 'restaurant', 'station', 'office', 'shop', 'house', 'garden', 'kitchen', 'bedroom', 'bathroom'], answer: 'home', explanation: '下周六会回家(be home)' },
      { id: 'p5-010-10', position: 10, wordBox: ['soon', 'now', 'then', 'today', 'tomorrow', 'yesterday', 'here', 'there', 'everywhere', 'anywhere', 'somewhere', 'nowhere', 'this', 'that', 'these'], answer: 'soon', explanation: '很快见(see you soon)' },
    ],
    difficulty: 'medium',
    topic: '旅行',
  },

];

// ==================== 所有阅读文章汇总 ====================

export const allReadingArticles = {
  part1: part1Articles,
  part2: part2Articles,
  part3Cloze: part3ClozeArticles,
  part3RC: part3RCArticles,
  part4TF: part4TFArticles,
  part5: part5Articles,
};
