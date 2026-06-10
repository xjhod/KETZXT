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
export interface TFAStatement {
  id: string;
  statement: string;
  statementZh: string;
  answer: 'T' | 'F' | 'DN';  // T/F/DN
  explanation: string;
}

export interface Part4TFArticle {
  id: string;
  title: string;
  titleZh: string;
  passage: string;         // 完整长文
  passageZh: string;      // 中文参考译文
  statements: TFAStatement[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

/** Part 5: 单词填写 — 短文 + 5 个单词填空 */
export interface Part5Blank {
  id: string;
  position: number;
  answer: string;
  hint: string;           // 提示（英文解释）
  hintZh: string;         // 提示中文
}

export interface Part5Article {
  id: string;
  title: string;
  titleZh: string;
  passage: string;         // 完整短文（空格用 ____ 表示）
  passageFull: string;     // 完整短文（填好单词）
  blanks: Part5Blank[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

/** Part 2: 信息匹配 — 5个人物 + 8则信息，选出谁需要什么 */
export interface Part2Person {
  id: string;
  name: string;
  description: string;     // 人物的简短描述（用于显示）
}

export interface Part2Article {
  id: string;
  title: string;
  titleZh: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  people: Part2Person[];  // 5个人物
  statements: string[];     // 8则信息/需求描述
  answers: string[];        // 每个statement对应的person id（长度=8）
}

// ==================== Part 1 数据 ====================

export const part1Articles: Part1Article[] = [

  // 示例文章（简单难度）
  {
    id: 'p1-001',
    title: 'At the Zoo',
    titleZh: '在动物园',
    difficulty: 'easy',
    topic: '动物',
    questions: [
      { id: 'p1q001-1', emoji: '🐘', imageDesc: '一头大象',
        options: [
          'This is a lion.',
          'This is an elephant.',
          'This is a tiger.',
          'This is a monkey.',
          'This is a giraffe.',
          'This is a zebra.',
          'This is a bear.',
        ],
        answer: 'This is an elephant.',
      },
    ],
  },

  // 在这里添加更多 Part 1 文章...

];

// ==================== Part 2 数据 ====================

export const part2Articles: Part2Article[] = [

  // 在这里添加信息匹配文章...

];

// ==================== Part 3-1 数据 ====================

export const part3ClozeArticles: Part3ClozeArticle[] = [

  // 简单难度文章（p3c-001 到 p3c-010）
  {
    id: 'p3c-001',
    title: 'My Family',
    titleZh: '我的家庭',
    passage: `I live in a small house with my (1) ____. There are four people in my family. My dad is a (2) ____. My mum is a (3) ____. I have a sister. She is 16 years (4) ____. We have a dog. Its name is (5) ____. I love my family.`,
    passageFull: `I live in a small house with my family (1). There are four people in my family. My dad is a teacher (2). My mum is a doctor (3). I have a sister. She is 16 years old (4). We have a dog. Its name is Buddy (5). I love my family.`,
    blanks: [
      {
        id: 'b001-1', position: 1,
        options: ['family', 'school', 'park', 'zoo'],
        answer: 'family',
        explanation: '根据上下文，是和家人住在一起',
      },
    ],
    difficulty: 'easy',
    topic: '家庭',
  },


  {
    id: 'p3c-002',
    title: "My School Day",
    titleZh: "我的学校生活",
    passage: `I get up at 7 o'clock every morning. I have breakfast with my (1) ____. Then I go to school by (2) ____. My first lesson starts at 9 a.m. I like (3) ____ because it's interesting. At lunchtime, I eat with my (4) ____. After school, I play (5) ____ with my friends.`,
    passageFull: `I get up at 7 o'clock every morning. I have breakfast with my family (1). Then I go to school by bus (2). My first lesson starts at 9 a.m. I like maths (3) because it's interesting. At lunchtime, I eat with my friends (4). After school, I play football (5) with my friends.`,
    blanks: [      {
        id: 'b002-1', position: 1,
        options: ["family", "teachers", "doctors", "drivers"],
        answer: "family",
        explanation: "根据上下文，早上和家人一起吃早餐",
      },
      {
        id: 'b002-2', position: 2,
        options: ["bus", "plane", "boat", "helicopter"],
        answer: "bus",
        explanation: "学生通常坐公交车上学",
      },
      {
        id: 'b002-3', position: 3,
        options: ["maths", "cooking", "driving", "swimming"],
        answer: "maths",
        explanation: "后文说因为它很有趣（通常指学科）",
      },
      {
        id: 'b002-4', position: 4,
        options: ["friends", "doctors", "drivers", "cooks"],
        answer: "friends",
        explanation: "午餐时间通常和朋友一起吃",
      },
      {
        id: 'b002-5', position: 5,
        options: ["football", "piano", "chess", "cards"],
        answer: "football",
        explanation: "放学后和朋友一起踢足球",
      }],
    difficulty: 'medium',
    topic: '学校生活',
  },
  {
    id: 'p3c-003',
    title: "A Healthy Diet",
    titleZh: "健康饮食",
    passage: `Eating healthy food is important for our (1) ____. We should eat five portions of (2) ____ and vegetables every day. (3) ____ gives us energy to play sports. We should drink plenty of (4) ____. Too much (5) ____ is bad for our teeth.`,
    passageFull: `Eating healthy food is important for our body (1). We should eat five portions of fruit (2) and vegetables every day. Rice (3) gives us energy to play sports. We should drink plenty of water (4). Too much sugar (5) is bad for our teeth.`,
    blanks: [      {
        id: 'b003-1', position: 1,
        options: ["body", "car", "house", "school"],
        answer: "body",
        explanation: "健康饮食对我们的身体很重要",
      },
      {
        id: 'b003-2', position: 2,
        options: ["fruit", "rice", "meat", "bread"],
        answer: "fruit",
        explanation: "五蔬果（fruit and vegetables）",
      },
      {
        id: 'b003-3', position: 3,
        options: ["Rice", "Water", "Air", "Sunlight"],
        answer: "Rice",
        explanation: "米饭/碳水化合物给我们能量",
      },
      {
        id: 'b003-4', position: 4,
        options: ["water", "coffee", "tea", "juice"],
        answer: "water",
        explanation: "我们应该喝大量的水",
      },
      {
        id: 'b003-5', position: 5,
        options: ["sugar", "salt", "oil", "vinegar"],
        answer: "sugar",
        explanation: "太多糖对牙齿有害",
      }],
    difficulty: 'medium',
    topic: '健康',
  },
  {
    id: 'p3c-004',
    title: "My Favourite Hobby",
    titleZh: "我最喜欢的爱好",
    passage: `My favourite hobby is (1) ____. I started learning it when I was (2) ____ years old. My (3) ____ teaches me every weekend. It's not easy, but I enjoy it. I have made many (4) ____ who share the same interest. We often meet on (5) ____ to practise together.`,
    passageFull: `My favourite hobby is photography (1). I started learning it when I was ten (2) years old. My uncle (3) teaches me every weekend. It's not easy, but I enjoy it. I have made many friends (4) who share the same interest. We often meet on Sundays (5) to practise together.`,
    blanks: [      {
        id: 'b004-1', position: 1,
        options: ["photography", "cooking", "driving", "fishing"],
        answer: "photography",
        explanation: "后文提到 uncle teaches me，且是爱好",
      },
      {
        id: 'b004-2', position: 2,
        options: ["ten", "five", "twenty", "hundred"],
        answer: "ten",
        explanation: "十岁开始学习是合理的",
      },
      {
        id: 'b004-3', position: 3,
        options: ["uncle", "teacher", "doctor", "driver"],
        answer: "uncle",
        explanation: "后文提到 uncle teaches me",
      },
      {
        id: 'b004-4', position: 4,
        options: ["friends", "enemies", "strangers", "relatives"],
        answer: "friends",
        explanation: "志同道合的朋友",
      },
      {
        id: 'b004-5', position: 5,
        options: ["Sundays", "Mondays", "Fridays", "Saturdays"],
        answer: "Sundays",
        explanation: "周末（周日）见面练习",
      }],
    difficulty: 'medium',
    topic: '爱好',
  },
  {
    id: 'p3c-005',
    title: "A Trip to the Zoo",
    titleZh: "动物园之旅",
    passage: `Last Saturday, my class went to the (1) ____. We saw many different (2) ____. My favourite was the (3) ____ because it was very big and strong. We also saw (4) ____ eating bamboo. Our teacher told us to (5) ____ photos, but we couldn't use flash.`,
    passageFull: `Last Saturday, my class went to the zoo (1). We saw many different animals (2). My favourite was the elephant (3) because it was very big and strong. We also saw pandas (4) eating bamboo. Our teacher told us to take (5) photos, but we couldn't use flash.`,
    blanks: [      {
        id: 'b005-1', position: 1,
        options: ["zoo", "park", "museum", "school"],
        answer: "zoo",
        explanation: "后文提到看动物，所以是动物园",
      },
      {
        id: 'b005-2', position: 2,
        options: ["animals", "plants", "buildings", "cars"],
        answer: "animals",
        explanation: "动物园里看到很多不同的动物",
      },
      {
        id: 'b005-3', position: 3,
        options: ["elephant", "ant", "butterfly", "fish"],
        answer: "elephant",
        explanation: "又大又壮的动物是大象",
      },
      {
        id: 'b005-4', position: 4,
        options: ["pandas", "lions", "tigers", "monkeys"],
        answer: "pandas",
        explanation: "吃竹子的是熊猫",
      },
      {
        id: 'b005-5', position: 5,
        options: ["take", "make", "cook", "draw"],
        answer: "take",
        explanation: "take photos 拍照",
      }],
    difficulty: 'medium',
    topic: '动物',
  },
  {
    id: 'p3c-006',
    title: "The Weather Report",
    titleZh: "天气预报",
    passage: `The weather in London is very (1) ____. It often (2) ____ in the morning, but it can be sunny in the afternoon. Sometimes it's (3) ____ and we can see snow. The temperature is usually between 5 and 15 (4) ____. People need to carry an (5) ____ when they go out.`,
    passageFull: `The weather in London is very changeable (1). It often rains (2) in the morning, but it can be sunny in the afternoon. Sometimes it's cold (3) and we can see snow. The temperature is usually between 5 and 15 degrees (4). People need to carry an umbrella (5) when they go out.`,
    blanks: [      {
        id: 'b006-1', position: 1,
        options: ["changeable", "hot", "cold", "warm"],
        answer: "changeable",
        explanation: "伦敦天气多变",
      },
      {
        id: 'b006-2', position: 2,
        options: ["rains", "snows", "shines", "blows"],
        answer: "rains",
        explanation: "伦敦经常下雨",
      },
      {
        id: 'b006-3', position: 3,
        options: ["cold", "hot", "warm", "cool"],
        answer: "cold",
        explanation: "下雪时天气很冷",
      },
      {
        id: 'b006-4', position: 4,
        options: ["degrees", "metres", "kilograms", "litres"],
        answer: "degrees",
        explanation: "温度单位是度（degrees）",
      },
      {
        id: 'b006-5', position: 5,
        options: ["umbrella", "apple", "egg", "book"],
        answer: "umbrella",
        explanation: "下雨时需要带伞",
      }],
    difficulty: 'medium',
    topic: '天气',
  },
  {
    id: 'p3c-007',
    title: "My Dream Job",
    titleZh: "我的梦想工作",
    passage: `When I grow up, I want to be a (1) ____. I want to help (2) ____ who are sick. My (3) ____ works in a hospital, and I sometimes visit her there. She wears a white (4) ____ and looks very professional. I think it's a (5) ____ job.`,
    passageFull: `When I grow up, I want to be a doctor (1). I want to help people (2) who are sick. My aunt (3) works in a hospital, and I sometimes visit her there. She wears a white coat (4) and looks very professional. I think it's a good (5) job.`,
    blanks: [      {
        id: 'b007-1', position: 1,
        options: ["doctor", "teacher", "driver", "cook"],
        answer: "doctor",
        explanation: "后文说帮助生病的人，所以是医生",
      },
      {
        id: 'b007-2', position: 2,
        options: ["people", "animals", "plants", "cars"],
        answer: "people",
        explanation: "医生帮助生病的人",
      },
      {
        id: 'b007-3', position: 3,
        options: ["aunt", "uncle", "brother", "sister"],
        answer: "aunt",
        explanation: "后文说 her，所以是女性亲属",
      },
      {
        id: 'b007-4', position: 4,
        options: ["coat", "hat", "glove", "sock"],
        answer: "coat",
        explanation: "医生穿白大褂（white coat）",
      },
      {
        id: 'b007-5', position: 5,
        options: ["good", "bad", "easy", "boring"],
        answer: "good",
        explanation: "医生是一份好工作",
      }],
    difficulty: 'medium',
    topic: '职业',
  },
  {
    id: 'p3c-008',
    title: "A Birthday Party",
    titleZh: "生日派对",
    passage: `Yesterday was my (1) ____ birthday. We had a party at (2) ____. My friends came and brought (3) ____. We ate cake and drank (4) ____. We played games and (5) ____ a lot. It was a wonderful day.`,
    passageFull: `Yesterday was my sister's (1) birthday. We had a party at home (2). My friends came and brought presents (3). We ate cake and drank juice (4). We played games and laughed (5) a lot. It was a wonderful day.`,
    blanks: [      {
        id: 'b008-1', position: 1,
        options: ["sister's", "dog's", "school's", "car's"],
        answer: "sister's",
        explanation: "生日派对是为某人举办的，sister's 符合语境",
      },
      {
        id: 'b008-2', position: 2,
        options: ["home", "school", "park", "zoo"],
        answer: "home",
        explanation: "派对通常在家举办",
      },
      {
        id: 'b008-3', position: 3,
        options: ["presents", "books", "pencils", "maps"],
        answer: "presents",
        explanation: "朋友来派对会带礼物",
      },
      {
        id: 'b008-4', position: 4,
        options: ["juice", "coffee", "tea", "soup"],
        answer: "juice",
        explanation: "派对上喝果汁是常见的",
      },
      {
        id: 'b008-5', position: 5,
        options: ["laughed", "cried", "slept", "studied"],
        answer: "laughed",
        explanation: "玩玩游戏，大笑，度过了美好的一天",
      }],
    difficulty: 'medium',
    topic: '庆祝',
  },
  {
    id: 'p3c-009',
    title: "Shopping for Clothes",
    titleZh: "买衣服",
    passage: `My mother took me to the (1) ____ to buy some new clothes. I needed a (2) ____ for the school trip. We looked at many different (3) ____. Finally, I chose a blue (4) ____. It was a bit expensive, but my mother (5) ____ it for me.`,
    passageFull: `My mother took me to the shop (1) to buy some new clothes. I needed a jacket (2) for the school trip. We looked at many different colours (3). Finally, I chose a blue one (4). It was a bit expensive, but my mother bought (5) it for me.`,
    blanks: [      {
        id: 'b009-1', position: 1,
        options: ["shop", "park", "school", "hospital"],
        answer: "shop",
        explanation: "买衣服去商店",
      },
      {
        id: 'b009-2', position: 2,
        options: ["jacket", "book", "pencil", "apple"],
        answer: "jacket",
        explanation: "学校旅行需要夹克",
      },
      {
        id: 'b009-3', position: 3,
        options: ["colours", "sizes", "prices", "names"],
        answer: "colours",
        explanation: "看很多不同的颜色",
      },
      {
        id: 'b009-4', position: 4,
        options: ["one", "it", "them", "those"],
        answer: "one",
        explanation: "选择一件蓝色的（代替 jacket）",
      },
      {
        id: 'b009-5', position: 5,
        options: ["bought", "made", "cooked", "found"],
        answer: "bought",
        explanation: "妈妈买下了它",
      }],
    difficulty: 'medium',
    topic: '购物',
  },
  {
    id: 'p3c-010',
    title: "The Internet",
    titleZh: "互联网",
    passage: `The (1) ____ is a very useful tool. We can use it to (2) ____ information for our homework. We can also (3) ____ emails to our friends. Some people (4) ____ online, but we need to be careful. It's important not to spend too much (5) ____ on the computer.`,
    passageFull: `The internet (1) is a very useful tool. We can use it to find (2) information for our homework. We can also send (3) emails to our friends. Some people shop (4) online, but we need to be careful. It's important not to spend too much time (5) on the computer.`,
    blanks: [      {
        id: 'b010-1', position: 1,
        options: ["internet", "television", "radio", "newspaper"],
        answer: "internet",
        explanation: "后文提到查找信息、发邮件，所以是互联网",
      },
      {
        id: 'b010-2', position: 2,
        options: ["find", "cook", "drive", "sing"],
        answer: "find",
        explanation: "用互联网查找信息",
      },
      {
        id: 'b010-3', position: 3,
        options: ["send", "cook", "drive", "sing"],
        answer: "send",
        explanation: "send emails 发邮件",
      },
      {
        id: 'b010-4', position: 4,
        options: ["shop", "cook", "drive", "sing"],
        answer: "shop",
        explanation: "shop online 网上购物",
      },
      {
        id: 'b010-5', position: 5,
        options: ["time", "money", "food", "water"],
        answer: "time",
        explanation: "不要花太多时间在电脑上",
      }],
    difficulty: 'medium',
    topic: '科技',
  },
  // ==================== 新增中等难度文章 ====================
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
        options: ['museum', 'park', 'zoo', 'beach'],
        answer: 'museum',
        explanation: '根据下文，是去博物馆',
      },
      {
        id: 'b011-2',
        position: 2,
        options: ['journey', 'bus', 'car', 'bike'],
        answer: 'journey',
        explanation: '旅程花了一小时',
      },
      {
        id: 'b011-3',
        position: 3,
        options: ['coins', 'books', 'toys', 'clothes'],
        answer: 'coins',
        explanation: '几千年前古硬币',
      },
      {
        id: 'b011-4',
        position: 4,
        options: ['section', 'room', 'hall', 'shop'],
        answer: 'section',
        explanation: '艺术区(art section)',
      },
      {
        id: 'b011-5',
        position: 5,
        options: ['end', 'beginning', 'middle', 'start'],
        answer: 'end',
        explanation: '在旅行结束时',
      },
      {
        id: 'b011-6',
        position: 6,
        options: ['postcard', 'book', 'map', 'photo'],
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
        options: ['photography', 'painting', 'drawing', 'singing'],
        answer: 'photography',
        explanation: '根据下文，是摄影',
      },
      {
        id: 'b012-2',
        position: 2,
        options: ['old', 'young', 'new', 'big'],
        answer: 'old',
        explanation: '十岁时(ten years old)',
      },
      {
        id: 'b012-3',
        position: 3,
        options: ['animals', 'books', 'cars', 'toys'],
        answer: 'animals',
        explanation: '拍人、动物和风景的照片',
      },
      {
        id: 'b012-4',
        position: 4,
        options: ['park', 'zoo', 'museum', 'school'],
        answer: 'park',
        explanation: '家附近的公园',
      },
      {
        id: 'b012-5',
        position: 5,
        options: ['enter', 'watch', 'visit', 'clean'],
        answer: 'enter',
        explanation: '参加摄影比赛',
      },
      {
        id: 'b012-6',
        position: 6,
        options: ['sunset', 'cat', 'dog', 'car'],
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
        options: ['you', 'your', 'yours', 'yourself'],
        answer: 'you',
        explanation: '你好吗？(How are you?)',
      },
      {
        id: 'b013-2',
        position: 2,
        options: ['went', 'go', 'come', 'walk'],
        answer: 'went',
        explanation: '过去时，去(went)',
      },
      {
        id: 'b013-3',
        position: 3,
        options: ['train', 'bus', 'car', 'plane'],
        answer: 'train',
        explanation: '乘火车旅行',
      },
      {
        id: 'b013-4',
        position: 4,
        options: ['Park', 'Shop', 'School', 'Hospital'],
        answer: 'Park',
        explanation: '海德公园(Hyde Park)',
      },
      {
        id: 'b013-5',
        position: 5,
        options: ['Eye', 'Bridge', 'Tower', 'Museum'],
        answer: 'Eye',
        explanation: '伦敦眼(London Eye)',
      },
      {
        id: 'b013-6',
        position: 6,
        options: ['shopping', 'swimming', 'running', 'sleeping'],
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
        options: ['healthy', 'fast', 'junk', 'sweet'],
        answer: 'healthy',
        explanation: '吃健康的食物',
      },
      {
        id: 'b014-2',
        position: 2,
        options: ['vegetables', 'biscuits', 'chips', 'cakes'],
        answer: 'vegetables',
        explanation: '水果和蔬菜',
      },
      {
        id: 'b014-3',
        position: 3,
        options: ['minerals', 'sugar', 'salt', 'fat'],
        answer: 'minerals',
        explanation: '维生素和矿物质',
      },
      {
        id: 'b014-4',
        position: 4,
        options: ['energy', 'water', 'air', 'light'],
        answer: 'energy',
        explanation: '谷物给我们能量',
      },
      {
        id: 'b014-5',
        position: 5,
        options: ['sources', 'tastes', 'colours', 'smells'],
        answer: 'sources',
        explanation: '蛋白质的良好来源',
      },
      {
        id: 'b014-6',
        position: 6,
        options: ['strong', 'long', 'big', 'heavy'],
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
        options: ['important', 'boring', 'funny', 'scary'],
        answer: 'important',
        explanation: '睡眠很重要',
      },
      {
        id: 'b015-2',
        position: 2,
        options: ['night', 'morning', 'afternoon', 'week'],
        answer: 'night',
        explanation: '每晚需要10小时睡眠',
      },
      {
        id: 'b015-3',
        position: 3,
        options: ['rest', 'run', 'jump', 'swim'],
        answer: 'rest',
        explanation: '身体休息并自我修复',
      },
      {
        id: 'b015-4',
        position: 4,
        options: ['properly', 'slowly', 'quietly', 'badly'],
        answer: 'properly',
        explanation: '大脑正常工作',
      },
      {
        id: 'b015-5',
        position: 5,
        options: ['hard', 'easy', 'interesting', 'exciting'],
        answer: 'hard',
        explanation: '发现很难集中注意力',
      },
      {
        id: 'b015-6',
        position: 6,
        options: ['computers', 'books', 'pencils', 'bags'],
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
        options: ['tool', 'toy', 'book', 'game'],
        answer: 'tool',
        explanation: '互联网是有用的工具',
      },
      {
        id: 'b016-2',
        position: 2,
        options: ['information', 'money', 'food', 'water'],
        answer: 'information',
        explanation: '查找信息',
      },
      {
        id: 'b016-3',
        position: 3,
        options: ['help', 'stop', 'hate', 'forget'],
        answer: 'help',
        explanation: '搜索引擎帮助我们快速找到信息',
      },
      {
        id: 'b016-4',
        position: 4,
        options: ['media', 'studies', 'clubs', 'teams'],
        answer: 'media',
        explanation: '社交媒体(social media)',
      },
      {
        id: 'b016-5',
        position: 5,
        options: ['use', 'user', 'useful', 'useless'],
        answer: 'use',
        explanation: '互联网的另一种流行用途',
      },
      {
        id: 'b016-6',
        position: 6,
        options: ['delivered', 'taken', 'brought', 'carried'],
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
        options: ['environment', 'computer', 'book', 'house'],
        answer: 'environment',
        explanation: '保护环境',
      },
      {
        id: 'b017-2',
        position: 2,
        options: ['recycle', 'repair', 'refuse', 'return'],
        answer: 'recycle',
        explanation: '减少、重复使用和回收',
      },
      {
        id: 'b017-3',
        position: 3,
        options: ['bottles', 'boxes', 'books', 'pens'],
        answer: 'bottles',
        explanation: '可重复使用的袋子和瓶子',
      },
      {
        id: 'b017-4',
        position: 4,
        options: ['devices', 'toys', 'pens', 'cars'],
        answer: 'devices',
        explanation: '电子设备',
      },
      {
        id: 'b017-5',
        position: 5,
        options: ['showers', 'walks', 'runs', 'sleeps'],
        answer: 'showers',
        explanation: '洗 shorter 的淋浴',
      },
      {
        id: 'b017-6',
        position: 6,
        options: ['trees', 'flowers', 'grasses', 'stones'],
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
        options: ['job', 'toy', 'book', 'game'],
        answer: 'job',
        explanation: '梦想工作(dream job)',
      },
      {
        id: 'b018-2',
        position: 2,
        options: ['doctor', 'teacher', 'driver', 'cook'],
        answer: 'doctor',
        explanation: '想成为医生',
      },
      {
        id: 'b018-3',
        position: 3,
        options: ['better', 'worse', 'bigger', 'smaller'],
        answer: 'better',
        explanation: '使病人好转',
      },
      {
        id: 'b018-4',
        position: 4,
        options: ['hard', 'slowly', 'quietly', 'badly'],
        answer: 'hard',
        explanation: '非常努力地学习',
      },
      {
        id: 'b018-5',
        position: 5,
        options: ['biology', 'history', 'geography', 'art'],
        answer: 'biology',
        explanation: '生物和化学',
      },
      {
        id: 'b018-6',
        position: 6,
        options: ['difficult', 'easy', 'interesting', 'funny'],
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
        options: ['morning', 'afternoon', 'evening', 'night'],
        answer: 'morning',
        explanation: '每天早上7点起床',
      },
      {
        id: 'b019-2',
        position: 2,
        options: ['go', 'come', 'run', 'jump'],
        answer: 'go',
        explanation: '去上学(go to school)',
      },
      {
        id: 'b019-3',
        position: 3,
        options: ['finishes', 'starts', 'breaks', 'opens'],
        answer: 'finishes',
        explanation: '下午3:30放学',
      },
      {
        id: 'b019-4',
        position: 4,
        options: ['English', 'maths', 'history', 'geography'],
        answer: 'English',
        explanation: '根据下文，最喜欢英语',
      },
      {
        id: 'b019-5',
        position: 5,
        options: ['friends', 'teachers', 'parents', 'sisters'],
        answer: 'friends',
        explanation: '和朋友们一起踢足球',
      },
      {
        id: 'b019-6',
        position: 6,
        options: ['watch', 'read', 'listen', 'write'],
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
        options: ['weekends', 'Mondays', 'Fridays', 'Sundays'],
        answer: 'weekends',
        explanation: '在周末',
      },
      {
        id: 'b020-2',
        position: 2,
        options: ['do', 'eat', 'drink', 'sleep'],
        answer: 'do',
        explanation: '决定做什么',
      },
      {
        id: 'b020-3',
        position: 3,
        options: ['picnic', 'party', 'meeting', 'class'],
        answer: 'picnic',
        explanation: '在公园野餐',
      },
      {
        id: 'b020-4',
        position: 4,
        options: ['city', 'park', 'school', 'library'],
        answer: 'city',
        explanation: '在城里见朋友',
      },
      {
        id: 'b020-5',
        position: 5,
        options: ['together', 'alone', 'separately', 'quietly'],
        answer: 'together',
        explanation: '一起吃晚饭',
      },
      {
        id: 'b020-6',
        position: 6,
        options: ['share', 'tell', 'write', 'draw'],
        answer: 'share',
        explanation: '分享有趣的故事',
      },
    ],
    difficulty: 'medium',
    topic: '日常生活',
  },


  // 在这里添加更多完形填空文章...

];

// ==================== Part 3-2 数据 ====================

export const part3RCArticles: Part3RCArticle[] = [

  // 在这里添加阅读理解选择题文章...


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
  },
];

// ==================== Part 4 数据 ====================

export const part4TFArticles: Part4TFArticle[] = [

  // 在这里添加正误判断文章...

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
        explanation: '原文说They had a picnic',
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
        statement: "The writer's favourite subject is maths.",
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
        explanation: "原文说I don't like science very much",
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

// ==================== Part 5 数据 ====================

export const part5Articles: Part5Article[] = [

  // 在这里添加单词填写文章...

];

// ==================== 汇总导出 ====================

export const allReadingArticles = [
  ...part1Articles,
  ...part2Articles,
  ...part3ClozeArticles,
  ...part3RCArticles,
  ...part4TFArticles,
  ...part5Articles,
];
