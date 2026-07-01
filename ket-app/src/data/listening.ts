import type {
  ListeningPart1Set,
  ListeningPart2Set,
  ListeningPart3Set,
  ListeningPart4Set,
  ListeningPart5Set,
} from '../types';

// ============================================================
// KET 听力模块 - 完整版（每个Part 10套题）
// 共50套题：Part 1-5 各10套
// ============================================================

export const part1Sets: ListeningPart1Set[] = [
  {
    id: 'L1-01',
    title: 'Daily Activities',
    titleZh: '日常活动',
    part: 1,
    difficulty: 'easy',
    speed: 'slow',
    questions: [
      {
        id: 'L1-01-Q1',
        imageEmoji: '⚽',
        imageDesc: '一个男孩在踢足球',
        audioText: 'Listen: The boy is playing football in the park.',
        options: ['The boy is playing football.', 'The boy is playing basketball.', 'The boy is watching TV.'],
        answer: 'A',
        transcript: 'The boy is playing football in the park.',
      },
      {
        id: 'L1-01-Q2',
        imageEmoji: '🍎',
        imageDesc: '一个女孩在吃苹果',
        audioText: 'Listen: The girl is eating an apple.',
        options: ['The girl is drinking juice.', 'The girl is eating an apple.', 'The girl is cooking dinner.'],
        answer: 'B',
        transcript: 'The girl is eating an apple.',
      },
      {
        id: 'L1-01-Q3',
        imageEmoji: '🚲',
        imageDesc: '一个男人在骑自行车',
        audioText: 'Listen: The man is riding a bicycle to work.',
        options: ['The man is driving a car.', 'The man is riding a bicycle to work.', 'The man is taking a bus.'],
        answer: 'B',
        transcript: 'The man is riding a bicycle to work.',
      },
      {
        id: 'L1-01-Q4',
        imageEmoji: '📚',
        imageDesc: '一个女孩在读书',
        audioText: 'Listen: The girl is reading a book in the library.',
        options: ['The girl is reading a book.', 'The girl is writing a letter.', 'The girl is drawing a picture.'],
        answer: 'A',
        transcript: 'The girl is reading a book in the library.',
      },
      {
        id: 'L1-01-Q5',
        imageEmoji: '🎸',
        imageDesc: '一个男孩在弹吉他',
        audioText: 'Listen: The boy is playing the guitar.',
        options: ['The boy is playing the piano.', 'The boy is playing the guitar.', 'The boy is singing a song.'],
        answer: 'B',
        transcript: 'The boy is playing the guitar.',
      }
    ],
  },
  {
    id: 'L1-02',
    title: 'Family Members',
    titleZh: '家庭成员',
    part: 1,
    difficulty: 'easy',
    speed: 'slow',
    questions: [
      {
        id: 'L1-02-Q1',
        imageEmoji: '👨👩👧',
        imageDesc: '一家三口在公园',
        audioText: 'Listen: This is a photo of my family. There are three people.',
        options: ['There are three people.', 'There are four people.', 'There are five people.'],
        answer: 'A',
        transcript: 'This is a photo of my family. There are three people.',
      },
      {
        id: 'L1-02-Q2',
        imageEmoji: '🐕',
        imageDesc: '一个男孩和狗',
        audioText: 'Listen: My dog\'s name is Bobo. He is two years old.',
        options: ['The dog is one year old.', 'The dog is two years old.', 'The dog is three years old.'],
        answer: 'B',
        transcript: 'My dog\'s name is Bobo. He is two years old.',
      },
      {
        id: 'L1-02-Q3',
        imageEmoji: '👵',
        imageDesc: '祖母在织毛衣',
        audioText: 'Listen: My grandmother likes knitting sweaters.',
        options: ['My grandmother likes cooking.', 'My grandmother likes knitting.', 'My grandmother likes gardening.'],
        answer: 'B',
        transcript: 'My grandmother likes knitting sweaters.',
      },
      {
        id: 'L1-02-Q4',
        imageEmoji: '👦',
        imageDesc: '男孩在画画',
        audioText: 'Listen: My little brother is drawing a picture of our house.',
        options: ['The brother is drawing a house.', 'The brother is drawing a tree.', 'The brother is drawing a dog.'],
        answer: 'A',
        transcript: 'My little brother is drawing a picture of our house.',
      },
      {
        id: 'L1-02-Q5',
        imageEmoji: '👩🍳',
        imageDesc: '妈妈在厨房做饭',
        audioText: 'Listen: My mother is cooking dinner in the kitchen.',
        options: ['My mother is cooking dinner.', 'My mother is washing dishes.', 'My mother is eating dinner.'],
        answer: 'A',
        transcript: 'My mother is cooking dinner in the kitchen.',
      }
    ],
  },
  {
    id: 'L1-03',
    title: 'School Life',
    titleZh: '学校生活',
    part: 1,
    difficulty: 'easy',
    speed: 'slow',
    questions: [
      {
        id: 'L1-03-Q1',
        imageEmoji: '🏫',
        imageDesc: '学校大楼',
        audioText: 'Listen: My school is very big. It has 20 classrooms.',
        options: ['The school has 10 classrooms.', 'The school has 20 classrooms.', 'The school has 30 classrooms.'],
        answer: 'B',
        transcript: 'My school is very big. It has 20 classrooms.',
      },
      {
        id: 'L1-03-Q2',
        imageEmoji: '📖',
        imageDesc: '学生在读书',
        audioText: 'Listen: We read books in the library every Monday.',
        options: ['We read books on Monday.', 'We read books on Tuesday.', 'We read books on Wednesday.'],
        answer: 'A',
        transcript: 'We read books in the library every Monday.',
      },
      {
        id: 'L1-03-Q3',
        imageEmoji: '⚽',
        imageDesc: '体育课上踢足球',
        audioText: 'Listen: We play football in PE class on Friday.',
        options: ['We play football on Thursday.', 'We play football on Friday.', 'We play football on Saturday.'],
        answer: 'B',
        transcript: 'We play football in PE class on Friday.',
      },
      {
        id: 'L1-03-Q4',
        imageEmoji: '🍎',
        imageDesc: '食堂吃午餐',
        audioText: 'Listen: We eat lunch in the dining hall at 12 o\'clock.',
        options: ["We eat lunch at 11 o\'clock.", "We eat lunch at 12 o\'clock.", "We eat lunch at 1 o\'clock."],
        answer: 'B',
        transcript: 'We eat lunch in the dining hall at 12 o\'clock.',
      },
      {
        id: 'L1-03-Q5',
        imageEmoji: '🚌',
        imageDesc: '校车回家',
        audioText: 'Listen: The school bus takes me home at 4pm.',
        options: ['The bus comes at 3pm.', 'The bus comes at 4pm.', 'The bus comes at 5pm.'],
        answer: 'B',
        transcript: 'The school bus takes me home at 4pm.',
      }
    ],
  },
  {
    id: 'L1-04',
    title: 'Weather and Seasons',
    titleZh: '天气和季节',
    part: 1,
    difficulty: 'easy',
    speed: 'slow',
    questions: [
      {
        id: 'L1-04-Q1',
        imageEmoji: '☀️',
        imageDesc: '晴天',
        audioText: 'Listen: Today is sunny and warm. Let\'s go to the beach!',
        options: ['It is sunny today.', 'It is rainy today.', 'It is snowy today.'],
        answer: 'A',
        transcript: 'Today is sunny and warm. Let\'s go to the beach!',
      },
      {
        id: 'L1-04-Q2',
        imageEmoji: '🌧️',
        imageDesc: '下雨天',
        audioText: 'Listen: It is raining outside. Take your umbrella.',
        options: ['It is sunny outside.', 'It is raining outside.', 'It is windy outside.'],
        answer: 'B',
        transcript: 'It is raining outside. Take your umbrella.',
      },
      {
        id: 'L1-04-Q3',
        imageEmoji: '❄️',
        imageDesc: '下雪天',
        audioText: 'Listen: In winter, it snows a lot in my city.',
        options: ['It snows in spring.', 'It snows in winter.', 'It snows in autumn.'],
        answer: 'B',
        transcript: 'In winter, it snows a lot in my city.',
      },
      {
        id: 'L1-04-Q4',
        imageEmoji: '🌈',
        imageDesc: '彩虹',
        audioText: 'Listen: After the rain, we saw a beautiful rainbow.',
        options: ['We saw a rainbow after the rain.', 'We saw a rainbow before the rain.', 'We saw a rainbow during the rain.'],
        answer: 'A',
        transcript: 'After the rain, we saw a beautiful rainbow.',
      },
      {
        id: 'L1-04-Q5',
        imageEmoji: '🌬️',
        imageDesc: '刮风天',
        audioText: 'Listen: The wind is very strong today. Hold your hat!',
        options: ['The wind is strong today.', 'The wind is weak today.', 'There is no wind today.'],
        answer: 'A',
        transcript: 'The wind is very strong today. Hold your hat!',
      }
    ],
  },
  {
    id: 'L1-05',
    title: 'Food and Drinks',
    titleZh: '食物和饮料',
    part: 1,
    difficulty: 'medium',
    speed: 'normal',
    questions: [
      {
        id: 'L1-05-Q1',
        imageEmoji: '🍕',
        imageDesc: '披萨',
        audioText: 'Listen: My favorite food is pizza with cheese and tomatoes.',
        options: ['My favorite food is pizza.', 'My favorite food is pasta.', 'My favorite food is salad.'],
        answer: 'A',
        transcript: 'My favorite food is pizza with cheese and tomatoes.',
      },
      {
        id: 'L1-05-Q2',
        imageEmoji: '🍦',
        imageDesc: '冰淇淋',
        audioText: 'Listen: I love eating ice cream in summer. It is very cold!',
        options: ['I love ice cream in summer.', 'I love ice cream in winter.', 'I love ice cream in spring.'],
        answer: 'A',
        transcript: 'I love eating ice cream in summer. It is very cold!',
      },
      {
        id: 'L1-05-Q3',
        imageEmoji: '🍌',
        imageDesc: '香蕉',
        audioText: 'Listen: Bananas are my favorite fruit. They are yellow.',
        options: ['Apples are my favorite fruit.', 'Bananas are my favorite fruit.', 'Oranges are my favorite fruit.'],
        answer: 'B',
        transcript: 'Bananas are my favorite fruit. They are yellow.',
      },
      {
        id: 'L1-05-Q4',
        imageEmoji: '🥤',
        imageDesc: '奶昔',
        audioText: 'Listen: Would you like a milkshake? It is very delicious!',
        options: ['I would like a milkshake.', 'I would like juice.', 'I would like water.'],
        answer: 'A',
        transcript: 'Would you like a milkshake? It is very delicious!',
      },
      {
        id: 'L1-05-Q5',
        imageEmoji: '🍰',
        imageDesc: '蛋糕',
        audioText: 'Listen: My mother made a chocolate cake for my birthday.',
        options: ['My mother made a chocolate cake.', 'My mother made a strawberry cake.', 'My mother made a vanilla cake.'],
        answer: 'A',
        transcript: 'My mother made a chocolate cake for my birthday.',
      }
    ],
  },
  {
    id: 'L1-06',
    title: 'Animals',
    titleZh: '动物',
    part: 1,
    difficulty: 'easy',
    speed: 'slow',
    questions: [
      {
        id: 'L1-06-Q1',
        imageEmoji: '🐶',
        imageDesc: '狗',
        audioText: 'Listen: I have a pet dog. His name is Lucky.',
        options: ['I have a cat.', 'I have a dog.', 'I have a rabbit.'],
        answer: 'B',
        transcript: 'I have a pet dog. His name is Lucky.',
      },
      {
        id: 'L1-06-Q2',
        imageEmoji: '🐱',
        imageDesc: '猫',
        audioText: 'Listen: My grandmother\'s cat is sleeping on the sofa.',
        options: ['The cat is sleeping on the bed.', 'The cat is sleeping on the sofa.', 'The cat is sleeping on the chair.'],
        answer: 'B',
        transcript: 'My grandmother\'s cat is sleeping on the sofa.',
      },
      {
        id: 'L1-06-Q3',
        imageEmoji: '🐦',
        imageDesc: '鸟',
        audioText: 'Listen: Listen! A bird is singing in the tree.',
        options: ['A bird is singing.', 'A dog is barking.', 'A cat is meowing.'],
        answer: 'A',
        transcript: 'Listen! A bird is singing in the tree.',
      },
      {
        id: 'L1-06-Q4',
        imageEmoji: '🐠',
        imageDesc: '鱼',
        audioText: 'Listen: My brother has a fish tank with five fish.',
        options: ['My brother has 3 fish.', 'My brother has 5 fish.', 'My brother has 7 fish.'],
        answer: 'B',
        transcript: 'My brother has a fish tank with five fish.',
      },
      {
        id: 'L1-06-Q5',
        imageEmoji: '🐰',
        imageDesc: '兔子',
        audioText: 'Listen: The rabbit is eating a carrot in the garden.',
        options: ['The rabbit is eating a carrot.', 'The rabbit is eating an apple.', 'The rabbit is eating a banana.'],
        answer: 'A',
        transcript: 'The rabbit is eating a carrot in the garden.',
      }
    ],
  },
  {
    id: 'L1-07',
    title: 'Sports',
    titleZh: '体育运动',
    part: 1,
    difficulty: 'medium',
    speed: 'normal',
    questions: [
      {
        id: 'L1-07-Q1',
        imageEmoji: '⚽',
        imageDesc: '足球',
        audioText: 'Listen: I play football with my friends after school.',
        options: ['I play football after school.', 'I play basketball after school.', 'I play tennis after school.'],
        answer: 'A',
        transcript: 'I play football with my friends after school.',
      },
      {
        id: 'L1-07-Q2',
        imageEmoji: '🏊',
        imageDesc: '游泳',
        audioText: 'Listen: My sister goes swimming every Saturday morning.',
        options: ['My sister goes swimming on Saturday.', 'My sister goes swimming on Sunday.', 'My sister goes swimming on Monday.'],
        answer: 'A',
        transcript: 'My sister goes swimming every Saturday morning.',
      },
      {
        id: 'L1-07-Q3',
        imageEmoji: '🚴',
        imageDesc: '骑自行车',
        audioText: 'Listen: I ride my bicycle to school every day.',
        options: ['I walk to school.', 'I ride my bicycle to school.', 'I take the bus to school.'],
        answer: 'B',
        transcript: 'I ride my bicycle to school every day.',
      },
      {
        id: 'L1-07-Q4',
        imageEmoji: '🏃',
        imageDesc: '跑步',
        audioText: 'Listen: My father goes running in the park every morning.',
        options: ['My father goes running in the morning.', 'My father goes running in the afternoon.', 'My father goes running in the evening.'],
        answer: 'A',
        transcript: 'My father goes running in the park every morning.',
      },
      {
        id: 'L1-07-Q5',
        imageEmoji: '🎾',
        imageDesc: '网球',
        audioText: 'Listen: Do you want to play tennis with me this weekend?',
        options: ['I want to play tennis.', 'I want to play football.', 'I want to play basketball.'],
        answer: 'A',
        transcript: 'Do you want to play tennis with me this weekend?',
      }
    ],
  },
  {
    id: 'L1-08',
    title: 'Colors',
    titleZh: '颜色',
    part: 1,
    difficulty: 'easy',
    speed: 'slow',
    questions: [
      {
        id: 'L1-08-Q1',
        imageEmoji: '🔴',
        imageDesc: '红色',
        audioText: 'Listen: My favorite color is red. I have a red bike.',
        options: ['My favorite color is red.', 'My favorite color is blue.', 'My favorite color is green.'],
        answer: 'A',
        transcript: 'My favorite color is red. I have a red bike.',
      },
      {
        id: 'L1-08-Q2',
        imageEmoji: '🔵',
        imageDesc: '蓝色',
        audioText: 'Listen: The sky is blue and the clouds are white.',
        options: ['The sky is grey.', 'The sky is blue.', 'The sky is black.'],
        answer: 'B',
        transcript: 'The sky is blue and the clouds are white.',
      },
      {
        id: 'L1-08-Q3',
        imageEmoji: '🟢',
        imageDesc: '绿色',
        audioText: 'Listen: Grass is green and trees are green too.',
        options: ['Grass is brown.', 'Grass is green.', 'Grass is yellow.'],
        answer: 'B',
        transcript: 'Grass is green and trees are green too.',
      },
      {
        id: 'L1-08-Q4',
        imageEmoji: '🟡',
        imageDesc: '黄色',
        audioText: 'Listen: The school bus is yellow in my country.',
        options: ['The bus is red.', 'The bus is yellow.', 'The bus is green.'],
        answer: 'B',
        transcript: 'The school bus is yellow in my country.',
      },
      {
        id: 'L1-08-Q5',
        imageEmoji: '🟣',
        imageDesc: '紫色',
        audioText: 'Listen: My mother has a purple dress for parties.',
        options: ['My mother has a pink dress.', 'My mother has a purple dress.', 'My mother has a blue dress.'],
        answer: 'B',
        transcript: 'My mother has a purple dress for parties.',
      }
    ],
  },
  {
    id: 'L1-09',
    title: 'Transport',
    titleZh: '交通工具',
    part: 1,
    difficulty: 'medium',
    speed: 'normal',
    questions: [
      {
        id: 'L1-09-Q1',
        imageEmoji: '🚌',
        imageDesc: '公交车',
        audioText: 'Listen: I take the bus to school every day.',
        options: ['I take the bus to school.', 'I take the train to school.', 'I walk to school.'],
        answer: 'A',
        transcript: 'I take the bus to school every day.',
      },
      {
        id: 'L1-09-Q2',
        imageEmoji: '🚗',
        imageDesc: '汽车',
        audioText: 'Listen: My father drives his car to work.',
        options: ['My father drives a car to work.', 'My father takes the bus to work.', 'My father rides a bicycle to work.'],
        answer: 'A',
        transcript: 'My father drives his car to work.',
      },
      {
        id: 'L1-09-Q3',
        imageEmoji: '🚲',
        imageDesc: '自行车',
        audioText: 'Listen: My mother rides her bicycle to the market.',
        options: ['My mother rides a bicycle to the market.', 'My mother drives a car to the market.', 'My mother walks to the market.'],
        answer: 'A',
        transcript: 'My mother rides her bicycle to the market.',
      },
      {
        id: 'L1-09-Q4',
        imageEmoji: '✈️',
        imageDesc: '飞机',
        audioText: 'Listen: We are going to America by plane.',
        options: ['We are going by plane.', 'We are going by train.', 'We are going by ship.'],
        answer: 'A',
        transcript: 'We are going to America by plane.',
      },
      {
        id: 'L1-09-Q5',
        imageEmoji: '🚂',
        imageDesc: '火车',
        audioText: 'Listen: The train journey takes 3 hours.',
        options: ['The train journey takes 2 hours.', 'The train journey takes 3 hours.', 'The train journey takes 4 hours.'],
        answer: 'B',
        transcript: 'The train journey takes 3 hours.',
      }
    ],
  },
  {
    id: 'L1-10',
    title: 'House and Home',
    titleZh: '房屋和家庭',
    part: 1,
    difficulty: 'medium',
    speed: 'normal',
    questions: [
      {
        id: 'L1-10-Q1',
        imageEmoji: '🏠',
        imageDesc: '房子',
        audioText: 'Listen: I live in a small house with my family.',
        options: ['I live in a big house.', 'I live in a small house.', 'I live in an apartment.'],
        answer: 'B',
        transcript: 'I live in a small house with my family.',
      },
      {
        id: 'L1-10-Q2',
        imageEmoji: '🛏️',
        imageDesc: '卧室',
        audioText: 'Listen: My bedroom is blue. I have a desk and a bed.',
        options: ['My bedroom is red.', 'My bedroom is blue.', 'My bedroom is green.'],
        answer: 'B',
        transcript: 'My bedroom is blue. I have a desk and a bed.',
      },
      {
        id: 'L1-10-Q3',
        imageEmoji: '🍳',
        imageDesc: '厨房',
        audioText: 'Listen: My mother cooks dinner in the kitchen.',
        options: ['My mother cooks in the kitchen.', 'My mother cooks in the dining room.', 'My mother cooks in the garden.'],
        answer: 'A',
        transcript: 'My mother cooks dinner in the kitchen.',
      },
      {
        id: 'L1-10-Q4',
        imageEmoji: '🛁',
        imageDesc: '浴室',
        audioText: 'Listen: The bathroom has a shower and a toilet.',
        options: ['The bathroom has a bath.', 'The bathroom has a shower.', 'The bathroom has a sink.'],
        answer: 'B',
        transcript: 'The bathroom has a shower and a toilet.',
      },
      {
        id: 'L1-10-Q5',
        imageEmoji: '📚',
        imageDesc: '书房',
        audioText: 'Listen: I do my homework in the study every evening.',
        options: ['I do homework in the morning.', 'I do homework in the afternoon.', 'I do homework in the evening.'],
        answer: 'C',
        transcript: 'I do my homework in the study every evening.',
      }
    ],
  },
];

export const part2Sets: ListeningPart2Set[] = [
  // L2-01 到 L2-10
  
  // ========== L2-01: Weekend Plans ==========
  {
    id: 'L2-01',
    title: 'Weekend Plans',
    titleZh: '周末计划',
    part: 2,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Friend',
    conversationAudio: 'A: Hi Tom! What do you want to do this weekend? B: I want to go swimming. A: That sounds fun! I want to go to the cinema. B: Great! Saturday morning, let us meet at 10. A: OK! I also need to buy some food. B: Me too. Let us go to the supermarket after swimming. A: Perfect!',
    questions: [
      { id: 'L2-01-Q1', person: 'Tom', choices: ['go swimming', 'go to the cinema', 'go to the supermarket'], answer: 'go swimming', hint: 'Tom 周末想做什么？' },
      { id: 'L2-01-Q2', person: 'Speaker A', choices: ['go swimming', 'go to the cinema', 'go to the supermarket'], answer: 'go to the cinema', hint: 'A 周末想做什么？' },
      { id: 'L2-01-Q3', person: 'Both', choices: ['Saturday morning 10am', 'Saturday afternoon 2pm', 'Sunday morning 10am'], answer: 'Saturday morning 10am', hint: '他们约好几点见面？' },
      { id: 'L2-01-Q4', person: 'Tom', choices: ['supermarket', 'swimming pool', 'cinema'], answer: 'supermarket', hint: 'Tom 游泳后还要去哪里？' },
      { id: 'L2-01-Q5', person: 'Speaker A', choices: ['supermarket', 'swimming pool', 'cinema'], answer: 'supermarket', hint: 'A 也要去超市，对吗？' },
    ],
    transcript: 'A: Hi Tom! What do you want to do this weekend? B: I want to go swimming. A: That sounds fun! I want to go to the cinema. B: Great! Saturday morning, let us meet at 10. A: OK! I also need to buy some food. B: Me too. Let us go to the supermarket after swimming. A: Perfect!',
  },

  // ========== L2-02: School Subjects ==========
  {
    id: 'L2-02',
    title: 'School Subjects',
    titleZh: '学校科目',
    part: 2,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Student',
    conversationAudio: 'A: Which subject do you like best? B: I like Science best because we do experiments. A: I prefer English. It is fun to learn new words. B: What about Maths? A: Maths is difficult for me. I need more practice. B: I can help you! Let us study together after school. A: That is very kind of you!',
    questions: [
      { id: 'L2-02-Q1', person: 'Speaker B', choices: ['Science', 'English', 'Maths'], answer: 'Science', hint: 'B 最喜欢什么科目？' },
      { id: 'L2-02-Q2', person: 'Speaker A', choices: ['Science', 'English', 'Maths'], answer: 'English', hint: 'A 最喜欢什么科目？' },
      { id: 'L2-02-Q3', person: 'Speaker A', choices: ['easy', 'difficult', 'interesting'], answer: 'difficult', hint: 'A 觉得 Maths 怎么样？' },
      { id: 'L2-02-Q4', person: 'Speaker B', choices: ['after school', 'at weekend', 'at lunch'], answer: 'after school', hint: 'B 提议什么时候一起学习？' },
      { id: 'L2-02-Q5', person: 'Both', choices: ['study together', 'play together', 'go home together'], answer: 'study together', hint: '他们决定一起做什么？' },
    ],
    transcript: 'A: Which subject do you like best? B: I like Science best because we do experiments. A: I prefer English. It is fun to learn new words. B: What about Maths? A: Maths is difficult for me. I need more practice. B: I can help you! Let us study together after school. A: That is very kind of you!',
  },

  // ========== L2-03: Birthday Party ==========
  {
    id: 'L2-03',
    title: 'Birthday Party',
    titleZh: '生日派对',
    part: 2,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Friend',
    conversationAudio: 'A: Are you coming to my birthday party on Saturday? B: Yes! What time does it start? A: At 3pm. Please bring a gift if you like. B: Should I bring food? A: No, my mum will cook. Just bring yourself! B: OK. Where is your house? A: Number 15, Green Street. See you on Saturday!',
    questions: [
      { id: 'L2-03-Q1', person: 'Speaker A', choices: ['Friday', 'Saturday', 'Sunday'], answer: 'Saturday', hint: '派对在星期几？' },
      { id: 'L2-03-Q2', person: 'Speaker A', choices: ['1pm', '2pm', '3pm'], answer: '3pm', hint: '派对几点开始？' },
      { id: 'L2-03-Q3', person: 'Speaker A', choices: ['bring a gift', 'bring food', 'bring nothing'], answer: 'bring a gift', hint: 'A 建议 B 带什么？' },
      { id: 'L2-03-Q4', person: 'Speaker A', choices: ['my mum will cook', 'I will cook', 'we will order food'], answer: 'my mum will cook', hint: '谁会准备食物？' },
      { id: 'L2-03-Q5', person: 'Speaker A', choices: ['12 Green Street', '15 Green Street', '20 Green Street'], answer: '15 Green Street', hint: 'A 住在几号？' },
    ],
    transcript: 'A: Are you coming to my birthday party on Saturday? B: Yes! What time does it start? A: At 3pm. Please bring a gift if you like. B: Should I bring food? A: No, my mum will cook. Just bring yourself! B: OK. Where is your house? A: Number 15, Green Street. See you on Saturday!',
  },

  // ========== L2-04: Hobbies ==========
  {
    id: 'L2-04',
    title: 'Hobbies',
    titleZh: '业余爱好',
    part: 2,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Friend',
    conversationAudio: 'A: What do you like to do in your free time? B: I love painting. I go to art class every Wednesday. A: That is cool! I enjoy playing the guitar. B: How long have you played? A: For two years. I also like photography. B: Really? Can you teach me? A: Of course! Let us start next week.',
    questions: [
      { id: 'L2-04-Q1', person: 'Speaker B', choices: ['painting', 'playing guitar', 'photography'], answer: 'painting', hint: 'B 的爱好是什么？' },
      { id: 'L2-04-Q2', person: 'Speaker B', choices: ['Monday', 'Wednesday', 'Friday'], answer: 'Wednesday', hint: 'B 每周几去美术课？' },
      { id: 'L2-04-Q3', person: 'Speaker A', choices: ['one year', 'two years', 'three years'], answer: 'two years', hint: 'A 弹吉他多久了？' },
      { id: 'L2-04-Q4', person: 'Speaker A', choices: ['painting', 'guitar', 'photography'], answer: 'photography', hint: 'A 还喜欢什么？' },
      { id: 'L2-04-Q5', person: 'Speaker A', choices: ['this week', 'next week', 'next month'], answer: 'next week', hint: '他们约好什么时候开始学摄影？' },
    ],
    transcript: 'A: What do you like to do in your free time? B: I love painting. I go to art class every Wednesday. A: That is cool! I enjoy playing the guitar. B: How long have you played? A: For two years. I also like photography. B: Really? Can you teach me? A: Of course! Let us start next week.',
  },

  // ========== L2-05: Shopping ==========
  {
    id: 'L2-05',
    title: 'Shopping',
    titleZh: '购物',
    part: 2,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Shop assistant',
    conversationAudio: 'A: Can I help you? B: Yes, I want to buy a birthday gift for my sister. A: How about a book? B: She already has many books. A: What about a necklace? B: That is a good idea. How much is it? A: It is 20 pounds. B: OK, I will take it. Do you have a gift box? A: Yes, it is free!',
    questions: [
      { id: 'L2-05-Q1', person: 'Speaker B', choices: ['for his sister', 'for his mother', 'for his friend'], answer: 'for his sister', hint: 'B 买礼物给谁？' },
      { id: 'L2-05-Q2', person: 'Speaker A', choices: ['a book', 'a necklace', 'a bag'], answer: 'a book', hint: '店员先推荐什么？' },
      { id: 'L2-05-Q3', person: 'Speaker B', choices: ['she has many books', 'she does not like books', 'she wants a book'], answer: 'she has many books', hint: '为什么 B 不买书？' },
      { id: 'L2-05-Q4', person: 'Speaker A', choices: ['10 pounds', '15 pounds', '20 pounds'], answer: '20 pounds', hint: '项链多少钱？' },
      { id: 'L2-05-Q5', person: 'Speaker A', choices: ['yes, free', 'yes, 5 pounds', 'no'], answer: 'yes, free', hint: '礼物盒免费吗？' },
    ],
    transcript: 'A: Can I help you? B: Yes, I want to buy a birthday gift for my sister. A: How about a book? B: She already has many books. A: What about a necklace? B: That is a good idea. How much is it? A: It is 20 pounds. B: OK, I will take it. Do you have a gift box? A: Yes, it is free!',
  },

  // ========== L2-06: Travel Plans ==========
  {
    id: 'L2-06',
    title: 'Travel Plans',
    titleZh: '旅行计划',
    part: 2,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Friend',
    conversationAudio: 'A: Where do you want to go for the holiday? B: I want to go to Paris. I love French food. A: That sounds great! I prefer to go to Japan. I like Japanese culture. B: How will you get there? A: By plane, of course! B: I will take the train to Paris. It is cheaper. A: Good idea! How long will you stay? B: For one week. What about you? A: Me too!',
    questions: [
      { id: 'L2-06-Q1', person: 'Speaker B', choices: ['Paris', 'Japan', 'London'], answer: 'Paris', hint: 'B 想去哪里度假？' },
      { id: 'L2-06-Q2', person: 'Speaker A', choices: ['Paris', 'Japan', 'London'], answer: 'Japan', hint: 'A 想去哪里度假？' },
      { id: 'L2-06-Q3', person: 'Speaker B', choices: ['by plane', 'by train', 'by bus'], answer: 'by train', hint: 'B 怎么去巴黎？' },
      { id: 'L2-06-Q4', person: 'Speaker A', choices: ['by plane', 'by train', 'by ship'], answer: 'by plane', hint: 'A 怎么去日本？' },
      { id: 'L2-06-Q5', person: 'Both', choices: ['3 days', 'one week', 'two weeks'], answer: 'one week', hint: '他们都打算待多久？' },
    ],
    transcript: 'A: Where do you want to go for the holiday? B: I want to go to Paris. I love French food. A: That sounds great! I prefer to go to Japan. I like Japanese culture. B: How will you get there? A: By plane, of course! B: I will take the train to Paris. It is cheaper. A: Good idea! How long will you stay? B: For one week. What about you? A: Me too!',
  },

  // ========== L2-07: Health and Illness ==========
  {
    id: 'L2-07',
    title: 'Health and Illness',
    titleZh: '健康和疾病',
    part: 2,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Doctor',
    conversationAudio: 'A: Good morning. What is wrong with you? B: I have a bad cough and my throat hurts. A: How long have you been like this? B: Since yesterday. A: Do you have a fever? B: No, my temperature is normal. A: OK. Take this medicine three times a day. Drink more water and rest. B: Thank you, doctor.',
    questions: [
      { id: 'L2-07-Q1', person: 'Speaker B', choices: ['cough and throat hurts', 'fever', 'headache'], answer: 'cough and throat hurts', hint: 'B 有什么症状？' },
      { id: 'L2-07-Q2', person: 'Speaker B', choices: ['since yesterday', 'since this morning', 'since last week'], answer: 'since yesterday', hint: 'B 不舒服多久了？' },
      { id: 'L2-07-Q3', person: 'Speaker A', choices: ['yes', 'no', 'does not know'], answer: 'no', hint: 'B 发烧吗？' },
      { id: 'L2-07-Q4', person: 'Speaker A', choices: ['once a day', 'twice a day', 'three times a day'], answer: 'three times a day', hint: '药每天吃几次？' },
      { id: 'L2-07-Q5', person: 'Speaker A', choices: ['drink more water', 'eat more food', 'do more exercise'], answer: 'drink more water', hint: '医生建议做什么？' },
    ],
    transcript: 'A: Good morning. What is wrong with you? B: I have a bad cough and my throat hurts. A: How long have you been like this? B: Since yesterday. A: Do you have a fever? B: No, my temperature is normal. A: OK. Take this medicine three times a day. Drink more water and rest. B: Thank you, doctor.',
  },

  // ========== L2-08: After School Activities ==========
  {
    id: 'L2-08',
    title: 'After School Activities',
    titleZh: '课后活动',
    part: 2,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Friend',
    conversationAudio: 'A: What club do you want to join this term? B: I want to join the football club. A: But you are not good at sports! B: That is why I need practice. What about you? A: I will join the chess club. B: That is perfect for you! A: Yes. The club meets every Tuesday after school. B: Our football club meets on Thursday. Let us go together after clubs!',
    questions: [
      { id: 'L2-08-Q1', person: 'Speaker B', choices: ['football club', 'chess club', 'music club'], answer: 'football club', hint: 'B 想加入什么俱乐部？' },
      { id: 'L2-08-Q2', person: 'Speaker A', choices: ['football club', 'chess club', 'music club'], answer: 'chess club', hint: 'A 想加入什么俱乐部？' },
      { id: 'L2-08-Q3', person: 'Speaker A', choices: ['Monday', 'Tuesday', 'Thursday'], answer: 'Tuesday', hint: '国际象棋俱乐部每周几活动？' },
      { id: 'L2-08-Q4', person: 'Speaker B', choices: ['Monday', 'Tuesday', 'Thursday'], answer: 'Thursday', hint: '足球俱乐部每周几活动？' },
      { id: 'L2-08-Q5', person: 'Both', choices: ['go home together', 'go to clubs together', 'go to library together'], answer: 'go to clubs together', hint: '他们俱乐部结束后打算一起做什么？' },
    ],
    transcript: 'A: What club do you want to join this term? B: I want to join the football club. A: But you are not good at sports! B: That is why I need practice. What about you? A: I will join the chess club. B: That is perfect for you! A: Yes. The club meets every Tuesday after school. B: Our football club meets on Thursday. Let us go together after clubs!',
  },

  // ========== L2-09: Weekend Chores ==========
  {
    id: 'L2-09',
    title: 'Weekend Chores',
    titleZh: '周末家务',
    part: 2,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Parent',
    conversationAudio: 'A: Mum, can I go out with my friends this weekend? B: After you finish your chores. A: What do I need to do? B: First, clean your bedroom. Then, wash your bicycle. A: That will take all Saturday! B: You can also help me cook dinner on Sunday. A: OK, I will do my chores. Can I go out on Sunday afternoon? B: Yes, that is fine.',
    questions: [
      { id: 'L2-09-Q1', person: 'Speaker B', choices: ['after chores', 'before chores', 'instead of chores'], answer: 'after chores', hint: 'B 说 A 可以出去玩的前提是什么？' },
      { id: 'L2-09-Q2', person: 'Speaker B', choices: ['clean bedroom', 'wash car', 'do homework'], answer: 'clean bedroom', hint: 'B 让 A 先做什么家务？' },
      { id: 'L2-09-Q3', person: 'Speaker B', choices: ['wash bicycle', 'wash car', 'clean garden'], answer: 'wash bicycle', hint: 'A 还要洗什么？' },
      { id: 'L2-09-Q4', person: 'Speaker B', choices: ['Saturday', 'Sunday', 'both days'], answer: 'Sunday', hint: 'B 让 A 帮忙做什么在周日？' },
      { id: 'L2-09-Q5', person: 'Speaker B', choices: ['Saturday afternoon', 'Sunday morning', 'Sunday afternoon'], answer: 'Sunday afternoon', hint: 'A 周日什么时候可以出去？' },
    ],
    transcript: 'A: Mum, can I go out with my friends this weekend? B: After you finish your chores. A: What do I need to do? B: First, clean your bedroom. Then, wash your bicycle. A: That will take all Saturday! B: You can also help me cook dinner on Sunday. A: OK, I will do my chores. Can I go out on Sunday afternoon? B: Yes, that is fine.',
  },

  // ========== L2-10: Summer Holiday ==========
  {
    id: 'L2-10',
    title: 'Summer Holiday',
    titleZh: '暑假计划',
    part: 2,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Friend',
    conversationAudio: 'A: Do you have any plans for the summer holiday? B: Yes! My family is going to Italy. A: That is amazing! How will you get there? B: We will fly to Rome. A: How long will you stay? B: For two weeks. We will visit museums, eat pizza, and go to the beach. A: I am going to a summer camp in the mountains. B: That sounds fun too! Will there be internet? A: No, it is a digital detox camp!',
    questions: [
      { id: 'L2-10-Q1', person: 'Speaker B', choices: ['Italy', 'France', 'Spain'], answer: 'Italy', hint: 'B 暑假去哪个国家？' },
      { id: 'L2-10-Q2', person: 'Speaker B', choices: ['by plane', 'by train', 'by ship'], answer: 'by plane', hint: 'B 怎么去意大利？' },
      { id: 'L2-10-Q3', person: 'Speaker B', choices: ['one week', 'two weeks', 'three weeks'], answer: 'two weeks', hint: 'B 打算待多久？' },
      { id: 'L2-10-Q4', person: 'Speaker A', choices: ['summer camp', 'visit grandparents', 'stay at home'], answer: 'summer camp', hint: 'A 暑假打算做什么？' },
      { id: 'L2-10-Q5', person: 'Speaker A', choices: ['yes, all day', 'no, digital detox', 'only at night'], answer: 'no, digital detox', hint: '夏令营有网络吗？' },
    ],
    transcript: 'A: Do you have any plans for the summer holiday? B: Yes! My family is going to Italy. A: That is amazing! How will you get there? B: We will fly to Rome. A: How long will you stay? B: For two weeks. We will visit museums, eat pizza, and go to the beach. A: I am going to a summer camp in the mountains. B: That sounds fun too! Will there be internet? A: No, it is a digital detox camp!',
  },
];

export const part3Sets: ListeningPart3Set[] = [
  // L3-01 到 L3-10
  
  // ========== L3-01: Summer Camp Registration ==========
  {
    id: 'L3-01',
    title: 'Summer Camp Registration',
    titleZh: '夏令营报名',
    part: 3,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Camp Counselor',
    monologueAudio: 'Hello! Welcome to Sunny Summer Camp. To register, please fill in this form. First, write your name and age. Next, choose your activity: swimming, hiking, or art class. Then, write your parent\'s phone number. Finally, tick any food allergies you have. The camp starts on July 1st. See you there!',
    blanks: [
      { id: 'L3-01-B1', field: 'Name', fieldZh: '姓名', answer: 'name', hint: '你的名字', audioText: 'First, write your name and age.' },
      { id: 'L3-01-B2', field: 'Age', fieldZh: '年龄', answer: 'age', hint: '你的年龄', audioText: 'First, write your name and age.' },
      { id: 'L3-01-B3', field: 'Activity Choice', fieldZh: '活动选择', answer: 'swimming / hiking / art class', hint: '3种活动选1', audioText: 'Next, choose your activity: swimming, hiking, or art class.' },
      { id: 'L3-01-B4', field: 'Parent\'s Phone', fieldZh: '家长电话', answer: 'parent\'s phone number', hint: '你家长的电话号码', audioText: 'Then, write your parent\'s phone number.' },
      { id: 'L3-01-B5', field: 'Food Allergies', fieldZh: '食物过敏', answer: 'food allergies', hint: '勾选过敏的食物', audioText: 'Finally, tick any food allergies you have.' },
    ],
    transcript: 'Hello! Welcome to Sunny Summer Camp. To register, please fill in this form. First, write your name and age. Next, choose your activity: swimming, hiking, or art class. Then, write your parent\'s phone number. Finally, tick any food allergies you have. The camp starts on July 1st. See you there!',
  },

  // ========== L3-02: Library Membership ==========
  {
    id: 'L3-02',
    title: 'Library Membership',
    titleZh: '图书馆会员',
    part: 3,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Librarian',
    monologueAudio: 'Welcome to the City Library! To become a member, please fill in this form. First, write your full name and address. Then, choose your membership type: student membership is free, adult membership is 10 pounds per year. Next, write the subjects you are interested in: history, science, or fiction. Finally, sign at the bottom. You can borrow up to 5 books at a time. The library opens from 9am to 7pm, Monday to Saturday.',
    passage: 'Welcome to the City Library! To become a member, please fill in this form. First, write your full name and address. Then, choose your membership type: student membership is free, adult membership is 10 pounds per year. Next, write the subjects you are interested in: history, science, or fiction. Finally, sign at the bottom. You can borrow up to 5 books at a time. The library opens from 9am to 7pm, Monday to Saturday. ____ (1) ____ (2) ____ (3) ____ (4) ____ (5) ____ (6) ____ (7) ____ (8) ____ (9) ____ (10)',
    passageAudio: 'Welcome to the City Library! To become a member, please fill in this form. First, write your full name and address. Then, choose your membership type: student membership is free, adult membership is 10 pounds per year. Next, write the subjects you are interested in: history, science, or fiction. Finally, sign at the bottom. You can borrow up to 5 books at a time. The library opens from 9am to 7pm, Monday to Saturday.',
    blanks: [
      { id: 'L3-02-B1', field: 'Full Name & Address', fieldZh: '姓名和地址', answer: 'full name and address', hint: '你的姓名和地址', audioText: 'First, write your full name and address.' },
      { id: 'L3-02-B2', field: 'Membership Type', fieldZh: '会员类型', answer: 'student / adult', hint: '学生免费/成人10镑', audioText: 'Then, choose your membership type: student membership is free, adult membership is 10 pounds per year.' },
      { id: 'L3-02-B3', field: 'Subject Interest', fieldZh: '感兴趣的学科', answer: 'history / science / fiction', hint: '3个学科选1或多个', audioText: 'Next, write the subjects you are interested in: history, science, or fiction.' },
      { id: 'L3-02-B4', field: 'Opening Hours', fieldZh: '开放时间', answer: '9am to 7pm', hint: '周一至周六几点到几点', audioText: 'The library opens from 9am to 7pm, Monday to Saturday.' },
      { id: 'L3-02-B5', field: 'Borrowing Limit', fieldZh: '借阅限制', answer: '5 books', hint: '一次最多借几本书', audioText: 'You can borrow up to 5 books at a time.' },
    ],
    transcript: 'Welcome to the City Library! To become a member, please fill in this form. First, write your full name and address. Then, choose your membership type: student membership is free, adult membership is 10 pounds per year. Next, write the subjects you are interested in: history, science, or fiction. Finally, sign at the bottom. You can borrow up to 5 books at a time. The library opens from 9am to 7pm, Monday to Saturday.',
  },

  // ========== L3-03: Gym Membership ==========
  {
    id: 'L3-03',
    title: 'Gym Membership',
    titleZh: '健身房会员',
    part: 3,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Gym Staff',
    monologueAudio: 'Welcome to Active Fitness Centre! My name is Coach Sarah. To become a member, please fill in this form. First, write your name and address. Then, choose your membership type: basic membership is 30 pounds per month, premium is 50 pounds per month. The premium membership includes a free personal trainer session every month. Next, write any injuries or health problems you have. Finally, sign at the bottom. We open every day from 6am to 10pm!',
    passage: 'Welcome to Active Fitness Centre! My name is Coach Sarah. To become a member, please fill in this form. First, write your name and address. Then, choose your membership type: basic membership is 30 pounds per month, premium is 50 pounds per month. The premium membership includes a free personal trainer session every month. Next, write any injuries or health problems you have. Finally, sign at the bottom. We open every day from 6am to 10pm! ____ (2) ____ (3) ____ (4) ____ (5) ____ (6)',
    passageAudio: 'Welcome to Active Fitness Centre! My name is Coach Sarah. To become a member, please fill in this form. First, write your name and address. Then, choose your membership type: basic membership is 30 pounds per month, premium is 50 pounds per month. The premium membership includes a free personal trainer session every month. Next, write any injuries or health problems you have. Finally, sign at the bottom. We open every day from 6am to 10pm!',
    blanks: [
      { id: 'L3-03-B1', field: 'Name & Address', fieldZh: '姓名和地址', answer: 'name and address', hint: '你的姓名和地址', audioText: 'First, write your name and address.' },
      { id: 'L3-03-B2', field: 'Basic Membership', fieldZh: '基础会员费', answer: '30 pounds per month', hint: '基础会员每月多少钱', audioText: 'Then, choose your membership type: basic membership is 30 pounds per month, premium is 50 pounds per month.' },
      { id: 'L3-03-B3', field: 'Premium Membership', fieldZh: '高级会员费', answer: '50 pounds per month', hint: '高级会员每月多少钱', audioText: 'Then, choose your membership type: basic membership is 30 pounds per month, premium is 50 pounds per month.' },
      { id: 'L3-03-B4', field: 'Opening Hours', fieldZh: '开放时间', answer: '6am to 10pm', hint: '每天几点到几点开门', audioText: 'We open every day from 6am to 10pm!' },
      { id: 'L3-03-B5', field: 'Injuries/Health', fieldZh: '伤病/健康问题', answer: 'injuries or health problems', hint: '填写你的伤病或健康问题', audioText: 'Next, write any injuries or health problems you have.' },
    ],
    transcript: 'Welcome to Active Fitness Centre! My name is Coach Sarah. To become a member, please fill in this form. First, write your name and address. Then, choose your membership type: basic membership is 30 pounds per month, premium is 50 pounds per month. The premium membership includes a free personal trainer session every month. Next, write any injuries or health problems you have. Finally, sign at the bottom. We open every day from 6am to 10pm!',
  },

  // ========== L3-04: Language School Enrollment ==========
  {
    id: 'L3-04',
    title: 'Language School Enrollment',
    titleZh: '语言学校报名',
    part: 3,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'School Secretary',
    monologueAudio: 'Hello and welcome to Brighton Language School! To enroll, please complete this form. First, write your full name and nationality. Then, choose your course: General English, Business English, or Exam Preparation. Next, select your level: Beginner, Intermediate, or Advanced. After that, write your emergency contact number. Finally, pay the course fee: 200 pounds for 4 weeks. Classes start every Monday. Good luck with your studies!',
    passage: 'Hello and welcome to Brighton Language School! To enroll, please complete this form. First, write your full name and nationality. Then, choose your course: General English, Business English, or Exam Preparation. Next, select your level: Beginner, Intermediate, or Advanced. After that, write your emergency contact number. Finally, pay the course fee: 200 pounds for 4 weeks. Classes start every Monday. Good luck with your studies! ____ (2) ____ (3) ____ (4) ____ (5) ____ (6)',
    passageAudio: 'Hello and welcome to Brighton Language School! To enroll, please complete this form. First, write your full name and nationality. Then, choose your course: General English, Business English, or Exam Preparation. Next, select your level: Beginner, Intermediate, or Advanced. After that, write your emergency contact number. Finally, pay the course fee: 200 pounds for 4 weeks. Classes start every Monday. Good luck with your studies!',
    blanks: [
      { id: 'L3-04-B1', field: 'Full Name & Nationality', fieldZh: '姓名和国籍', answer: 'full name and nationality', hint: '你的全名和国籍', audioText: 'First, write your full name and nationality.' },
      { id: 'L3-04-B2', field: 'Course Choice', fieldZh: '课程选择', answer: 'General English / Business English / Exam Preparation', hint: '3种课程选1', audioText: 'Then, choose your course: General English, Business English, or Exam Preparation.' },
      { id: 'L3-04-B3', field: 'Level', fieldZh: '水平等级', answer: 'Beginner / Intermediate / Advanced', hint: '3个等级选1', audioText: 'Next, select your level: Beginner, Intermediate, or Advanced.' },
      { id: 'L3-04-B4', field: 'Course Fee', fieldZh: '课程费用', answer: '200 pounds for 4 weeks', hint: '4周课程多少钱', audioText: 'Finally, pay the course fee: 200 pounds for 4 weeks.' },
      { id: 'L3-04-B5', field: 'Start Date', fieldZh: '开课日期', answer: 'every Monday', hint: '课程每周几开始', audioText: 'Classes start every Monday.' },
    ],
    transcript: 'Hello and welcome to Brighton Language School! To enroll, please complete this form. First, write your full name and nationality. Then, choose your course: General English, Business English, or Exam Preparation. Next, select your level: Beginner, Intermediate, or Advanced. After that, write your emergency contact number. Finally, pay the course fee: 200 pounds for 4 weeks. Classes start every Monday. Good luck with your studies!',
  },

  // ========== L3-05: Holiday Camp Booking ==========
  {
    id: 'L3-05',
    title: 'Holiday Camp Booking',
    titleZh: '假日营地预订',
    part: 3,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Camp Organizer',
    monologueAudio: 'Welcome to Starlight Holiday Camp! To book your place, please fill in this form. First, write the camper\'s name and age. Then, choose your week: Week 1 (July 10-16), Week 2 (July 17-23), or both weeks. Next, select activities: sports, arts and crafts, or music. The cost is 150 pounds per week. include lunch and snacks. Finally, provide any dietary requirements. We look forward to seeing you!',
    blanks: [
      { id: 'L3-05-B1', field: 'Camper\'s Name & Age', fieldZh: '营员姓名和年龄', answer: 'camper\'s name and age', hint: '营员的姓名和年龄', audioText: 'First, write the camper\'s name and age.' },
      { id: 'L3-05-B2', field: 'Week Choice', fieldZh: '周次选择', answer: 'Week 1 / Week 2 / both weeks', hint: '选择第1周、第2周或两周都选', audioText: 'Then, choose your week: Week 1 (July 10-16), Week 2 (July 17-23), or both weeks.' },
      { id: 'L3-05-B3', field: 'Activities', fieldZh: '活动选择', answer: 'sports / arts and crafts / music', hint: '3种活动选1或多个', audioText: 'Next, select activities: sports, arts and crafts, or music.' },
      { id: 'L3-05-B4', field: 'Cost per Week', fieldZh: '每周费用', answer: '150 pounds per week', hint: '每周营地费用多少', audioText: 'The cost is 150 pounds per week. Include lunch and snacks.' },
      { id: 'L3-05-B5', field: 'Dietary Requirements', fieldZh: '饮食要求', answer: 'dietary requirements', hint: '填写饮食要求（如过敏）', audioText: 'Finally, provide any dietary requirements.' },
    ],
    transcript: 'Welcome to Starlight Holiday Camp! To book your place, please fill in this form. First, write the camper\'s name and age. Then, choose your week: Week 1 (July 10-16), Week 2 (July 17-23), or both weeks. Next, select activities: sports, arts and crafts, or music. The cost is 150 pounds per week. Include lunch and snacks. Finally, provide any dietary requirements. We look forward to seeing you!',
  },

  // ========== L3-06: Music School Application ==========
  {
    id: 'L3-06',
    title: 'Music School Application',
    titleZh: '音乐学校申请',
    part: 3,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Music Teacher',
    monologueAudio: 'Hello! Welcome to Melody Music School. To apply, please complete this form. First, write your name and phone number. Then, choose your instrument: piano, guitar, violin, or drums. Next, select your lesson type: individual (20 pounds per lesson) or group (12 pounds per lesson). After that, choose your preferred day: Monday, Wednesday, or Saturday. Finally, sign at the bottom. We also offer a free trial lesson!',
    passage: 'Hello! Welcome to Melody Music School. To apply, please complete this form. First, write your name and phone number. Then, choose your instrument: piano, guitar, violin, or drums. Next, select your lesson type: individual (20 pounds per lesson) or group (12 pounds per lesson). After that, choose your preferred day: Monday, Wednesday, or Saturday. Finally, sign at the bottom. We also offer a free trial lesson! ____ (1) ____ (2) ____ (3) ____ (4) ____ (5) ____ (6) ____ (7) ____ (8) ____ (9) ____ (10)',
    passageAudio: 'Hello! Welcome to Melody Music School. To apply, please complete this form. First, write your name and phone number. Then, choose your instrument: piano, guitar, violin, or drums. Next, select your lesson type: individual (20 pounds per lesson) or group (12 pounds per lesson). After that, choose your preferred day: Monday, Wednesday, or Saturday. Finally, sign at the bottom. We also offer a free trial lesson!',
    blanks: [
      { id: 'L3-06-B1', field: 'Name & Phone', fieldZh: '姓名和电话', answer: 'name and phone number', hint: '你的姓名和电话号码', audioText: 'First, write your name and phone number.' },
      { id: 'L3-06-B2', field: 'Instrument Choice', fieldZh: '乐器选择', answer: 'piano / guitar / violin / drums', hint: '4种乐器选1', audioText: 'Then, choose your instrument: piano, guitar, violin, or drums.' },
      { id: 'L3-06-B3', field: 'Individual Lesson Cost', fieldZh: '一对一课程费用', answer: '20 pounds per lesson', hint: '一对一课程每节多少钱', audioText: 'Next, select your lesson type: individual (20 pounds per lesson) or group (12 pounds per lesson).' },
      { id: 'L3-06-B4', field: 'Group Lesson Cost', fieldZh: '团体课程费用', answer: '12 pounds per lesson', hint: '团体课程每节多少钱', audioText: 'Next, select your lesson type: individual (20 pounds per lesson) or group (12 pounds per lesson).' },
      { id: 'L3-06-B5', field: 'Available Days', fieldZh: '可选上课日', answer: 'Monday / Wednesday / Saturday', hint: '3天可选', audioText: 'After that, choose your preferred day: Monday, Wednesday, or Saturday.' },
    ],
    transcript: 'Hello! Welcome to Melody Music School. To apply, please complete this form. First, write your name and phone number. Then, choose your instrument: piano, guitar, violin, or drums. Next, select your lesson type: individual (20 pounds per lesson) or group (12 pounds per lesson). After that, choose your preferred day: Monday, Wednesday, or Saturday. Finally, sign at the bottom. We also offer a free trial lesson!',
  },

  // ========== L3-07: Sports Club Registration ==========
  {
    id: 'L3-07',
    title: 'Sports Club Registration',
    titleZh: '体育俱乐部注册',
    part: 3,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Club Manager',
    monologueAudio: 'Welcome to Champion Sports Club! To register, please fill in this form. First, write your name, age, and emergency contact. Then, choose your sport: football (Tuesday and Thursday), basketball (Monday and Wednesday), or swimming (every day except Sunday). Next, pay the membership fee: 40 pounds per month for one sport, 60 pounds for two sports. Finally, collect your club T-shirt from reception. Training starts next week!',
    passage: 'Welcome to Champion Sports Club! ____ (1) To register, please fill in this form. ____ (2) First, write your name, age, and emergency contact. Then, choose your sport: football (Tuesday and Thursday), basketball (Monday and Wednesday), or swimming (every day except Sunday). Next, pay the membership fee: 40 pounds per month for one sport, 60 pounds for two sports. Finally, collect your club T-shirt from reception. Training starts next week! ____ (4) ____ (5) ____ (6)',
    passageAudio: 'Welcome to Champion Sports Club! To register, please fill in this form. First, write your name, age, and emergency contact. Then, choose your sport: football (Tuesday and Thursday), basketball (Monday and Wednesday), or swimming (every day except Sunday). Next, pay the membership fee: 40 pounds per month for one sport, 60 pounds for two sports. Finally, collect your club T-shirt from reception. Training starts next week!',
    blanks: [
      { id: 'L3-07-B1', field: 'Name, Age & Emergency Contact', fieldZh: '姓名、年龄、紧急联系人', answer: 'name, age, and emergency contact', hint: '填写姓名、年龄和紧急联系人', audioText: 'First, write your name, age, and emergency contact.' },
      { id: 'L3-07-B2', field: 'Football Days', fieldZh: '足球训练日', answer: 'Tuesday and Thursday', hint: '足球在周几训练', audioText: 'Then, choose your sport: football (Tuesday and Thursday), basketball (Monday and Wednesday), or swimming (every day except Sunday).' },
      { id: 'L3-07-B3', field: 'Basketball Days', fieldZh: '篮球训练日', answer: 'Monday and Wednesday', hint: '篮球在周几训练', audioText: 'Then, choose your sport: football (Tuesday and Thursday), basketball (Monday and Wednesday), or swimming (every day except Sunday).' },
      { id: 'L3-07-B4', field: 'One Sport Fee', fieldZh: '一项运动费用', answer: '40 pounds per month', hint: '参加一项运动每月多少钱', audioText: 'Next, pay the membership fee: 40 pounds per month for one sport, 60 pounds for two sports.' },
      { id: 'L3-07-B5', field: 'Two Sports Fee', fieldZh: '两项运动费用', answer: '60 pounds per month', hint: '参加两项运动每月多少钱', audioText: 'Next, pay the membership fee: 40 pounds per month for one sport, 60 pounds for two sports.' },
    ],
    transcript: 'Welcome to Champion Sports Club! To register, please fill in this form. First, write your name, age, and emergency contact. Then, choose your sport: football (Tuesday and Thursday), basketball (Monday and Wednesday), or swimming (every day except Sunday). Next, pay the membership fee: 40 pounds per month for one sport, 60 pounds for two sports. Finally, collect your club T-shirt from reception. Training starts next week!',
  },

  // ========== L3-08: Art Class Booking ==========
  {
    id: 'L3-08',
    title: 'Art Class Booking',
    titleZh: '美术课预订',
    part: 3,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Art Instructor',
    monologueAudio: 'Hello artists! Welcome to Creative Art Studio. To book your place, please complete this form. First, write your name and email address. Then, choose your class type: painting (Tuesday 4-6pm), drawing (Thursday 4-6pm), or sculpture (Saturday 10am-12pm). Next, pay the class fee: 15 pounds per class, or 50 pounds for 4 classes. Finally, bring your own brushes and canvas. We provide all paints and materials. See you in class!',
    passage: 'Hello artists! Welcome to Creative Art Studio. To book your place, please complete this form. First, write your name and email address. Then, choose your class type: painting (Tuesday 4-6pm), drawing (Thursday 4-6pm), or sculpture (Saturday 10am-12pm). Next, pay the class fee: 15 pounds per class, or 50 pounds for 4 classes. Finally, bring your own brushes and canvas. We provide all paints and materials. See you in class! ____ (2) ____ (3) ____ (4) ____ (5) ____ (6)',
    passageAudio: 'Hello artists! Welcome to Creative Art Studio. To book your place, please complete this form. First, write your name and email address. Then, choose your class type: painting (Tuesday 4-6pm), drawing (Thursday 4-6pm), or sculpture (Saturday 10am-12pm). Next, pay the class fee: 15 pounds per class, or 50 pounds for 4 classes. Finally, bring your own brushes and canvas. We provide all paints and materials. See you in class!',
    blanks: [
      { id: 'L3-08-B1', field: 'Name & Email', fieldZh: '姓名和邮箱', answer: 'name and email address', hint: '你的姓名和邮箱地址', audioText: 'First, write your name and email address.' },
      { id: 'L3-08-B2', field: 'Painting Class Time', fieldZh: '绘画课时间', answer: 'Tuesday 4-6pm', hint: '绘画课在什么时候', audioText: 'Then, choose your class type: painting (Tuesday 4-6pm), drawing (Thursday 4-6pm), or sculpture (Saturday 10am-12pm).' },
      { id: 'L3-08-B3', field: 'Drawing Class Time', fieldZh: '素描课时间', answer: 'Thursday 4-6pm', hint: '素描课在什么时候', audioText: 'Then, choose your class type: painting (Tuesday 4-6pm), drawing (Thursday 4-6pm), or sculpture (Saturday 10am-12pm).' },
      { id: 'L3-08-B4', field: 'Single Class Fee', fieldZh: '单节课费用', answer: '15 pounds per class', hint: '单节课多少钱', audioText: 'Next, pay the class fee: 15 pounds per class, or 50 pounds for 4 classes.' },
      { id: 'L3-08-B5', field: '4 Classes Fee', fieldZh: '4节课费用', answer: '50 pounds for 4 classes', hint: '4节课套装多少钱', audioText: 'Next, pay the class fee: 15 pounds per class, or 50 pounds for 4 classes.' },
    ],
    transcript: 'Hello artists! Welcome to Creative Art Studio. To book your place, please complete this form. First, write your name and email address. Then, choose your class type: painting (Tuesday 4-6pm), drawing (Thursday 4-6pm), or sculpture (Saturday 10am-12pm). Next, pay the class fee: 15 pounds per class, or 50 pounds for 4 classes. Finally, bring your own brushes and canvas. We provide all paints and materials. See you in class!',
  },

  // ========== L3-09: Cooking Workshop Registration ==========
  {
    id: 'L3-09',
    title: 'Cooking Workshop Registration',
    titleZh: '烹饪工作坊报名',
    part: 3,
    difficulty: 'hard',
    speed: 'fast',
    speaker: 'Chef',
    monologueAudio: 'Welcome to Tasty Cooking Workshop! To join our cooking classes, please register using this form. First, write your name and any food allergies. Then, choose your workshop: Italian Cuisine (Saturday 10am-1pm), Asian Fusion (Sunday 10am-1pm), or Baking and Desserts (Saturday 2-5pm). The cost is 35 per workshop, including all ingredients and recipes to take home. Next, indicate if you want to join our monthly cooking competition. Finally, provide your phone number for updates. Bon appétit!',
    passage: 'Welcome to Tasty Cooking Workshop! ____ (1) To join our cooking classes, please register using this form. First, write your name and any food allergies. Then, choose your workshop: Italian Cuisine (Saturday 10am-1pm), Asian Fusion (Sunday 10am-1pm), or Baking and Desserts (Saturday 2-5pm). The cost is 35 per workshop, including all ingredients and recipes to take home. Next, indicate if you want to join our monthly cooking competition. Finally, provide your phone number for updates. Bon appétit! ____ (3) ____ (4) ____ (5) ____ (6)',
    passageAudio: 'Welcome to Tasty Cooking Workshop! To join our cooking classes, please register using this form. First, write your name and any food allergies. Then, choose your workshop: Italian Cuisine (Saturday 10am-1pm), Asian Fusion (Sunday 10am-1pm), or Baking and Desserts (Saturday 2-5pm). The cost is 35 per workshop, including all ingredients and recipes to take home. Next, indicate if you want to join our monthly cooking competition. Finally, provide your phone number for updates. Bon appétit!',
    blanks: [
      { id: 'L3-09-B1', field: 'Name & Food Allergies', fieldZh: '姓名和食物过敏', answer: 'name and food allergies', hint: '你的姓名和食物过敏信息', audioText: 'First, write your name and any food allergies.' },
      { id: 'L3-09-B2', field: 'Italian Cuisine Time', fieldZh: '意大利菜工作坊时间', answer: 'Saturday 10am-1pm', hint: '意大利菜工作坊在什么时候', audioText: 'Then, choose your workshop: Italian Cuisine (Saturday 10am-1pm), Asian Fusion (Sunday 10am-1pm), or Baking and Desserts (Saturday 2-5pm).' },
      { id: 'L3-09-B3', field: 'Asian Fusion Time', fieldZh: '亚洲融合菜工作坊时间', answer: 'Sunday 10am-1pm', hint: '亚洲融合菜工作坊在什么时候', audioText: 'Then, choose your workshop: Italian Cuisine (Saturday 10am-1pm), Asian Fusion (Sunday 10am-1pm), or Baking and Desserts (Saturday 2-5pm).' },
      { id: 'L3-09-B4', field: 'Workshop Cost', fieldZh: '工作坊费用', answer: '35 per workshop', hint: '每个工作坊多少钱', audioText: 'The cost is 35 per workshop, including all ingredients and recipes to take home.' },
      { id: 'L3-09-B5', field: 'Phone Number', fieldZh: '电话号码', answer: 'phone number', hint: '填写你的电话号码用于接收更新', audioText: 'Finally, provide your phone number for updates.' },
    ],
    transcript: 'Welcome to Tasty Cooking Workshop! To join our cooking classes, please register using this form. First, write your name and any food allergies. Then, choose your workshop: Italian Cuisine (Saturday 10am-1pm), Asian Fusion (Sunday 10am-1pm), or Baking and Desserts (Saturday 2-5pm). The cost is 35 per workshop, including all ingredients and recipes to take home. Next, indicate if you want to join our monthly cooking competition. Finally, provide your phone number for updates. Bon appétit!',
  },

  // ========== L3-10: Volunteer Program Application ==========
  {
    id: 'L3-10',
    title: 'Volunteer Program Application',
    titleZh: '志愿者项目申请',
    part: 3,
    difficulty: 'hard',
    speed: 'fast',
    speaker: 'Program Coordinator',
    monologueAudio: 'Thank you for your interest in our Community Volunteer Program! To apply, please complete this application form. First, write your full name, age, and occupation (student, worker, or retired). Then, choose your volunteer area: helping at the animal shelter (Tuesday and Friday), serving food at the homeless shelter (Monday and Thursday), or teaching English to immigrants (Wednesday and Saturday). Next, indicate your availability: morning (8-12), afternoon (1-5), or evening (6-9). Finally, provide two references with their contact information. We will contact you within one week!',
    passage: 'Thank you for your interest in our Community Volunteer Program! ____ (1) To apply, please complete this application form. ____ (2) First, write your full name, age, and occupation (student, worker, or retired). Then, choose your volunteer area: helping at the animal shelter (Tuesday and Friday), serving food at the homeless shelter (Monday and Thursday), or teaching English to immigrants (Wednesday and Saturday). Next, indicate your availability: morning (8-12), afternoon (1-5), or evening (6-9). Finally, provide two references with their contact information. We will contact you within one week! ____ (4) ____ (5) ____ (6)',
    passageAudio: 'Thank you for your interest in our Community Volunteer Program! To apply, please complete this application form. First, write your full name, age, and occupation (student, worker, or retired). Then, choose your volunteer area: helping at the animal shelter (Tuesday and Friday), serving food at the homeless shelter (Monday and Thursday), or teaching English to immigrants (Wednesday and Saturday). Next, indicate your availability: morning (8-12), afternoon (1-5), or evening (6-9). Finally, provide two references with their contact information. We will contact you within one week!',
    blanks: [
      { id: 'L3-10-B1', field: 'Full Name, Age & Occupation', fieldZh: '姓名、年龄、职业', answer: 'full name, age, and occupation', hint: '填写姓名、年龄和职业', audioText: 'First, write your full name, age, and occupation (student, worker, or retired).' },
      { id: 'L3-10-B2', field: 'Animal Shelter Days', fieldZh: '动物收容所服务日', answer: 'Tuesday and Friday', hint: '动物收容所在周几需要志愿者', audioText: 'Then, choose your volunteer area: helping at the animal shelter (Tuesday and Friday), serving food at the homeless shelter (Monday and Thursday), or teaching English to immigrants (Wednesday and Saturday).' },
      { id: 'L3-10-B3', field: 'Homeless Shelter Days', fieldZh: '流浪者收容所服务日', answer: 'Monday and Thursday', hint: '流浪者收容所在周几需要志愿者', audioText: 'Then, choose your volunteer area: helping at the animal shelter (Tuesday and Friday), serving food at the homeless shelter (Monday and Thursday), or teaching English to immigrants (Wednesday and Saturday).' },
      { id: 'L3-10-B4', field: 'Availability Options', fieldZh: '可服务时间段', answer: 'morning (8-12) / afternoon (1-5) / evening (6-9)', hint: '3个时间段可选', audioText: 'Next, indicate your availability: morning (8-12), afternoon (1-5), or evening (6-9).' },
      { id: 'L3-10-B5', field: 'References', fieldZh: '证明人', answer: 'two references with contact information', hint: '需要提供2个证明人和他们的联系方式', audioText: 'Finally, provide two references with their contact information.' },
    ],
    transcript: 'Thank you for your interest in our Community Volunteer Program! To apply, please complete this application form. First, write your full name, age, and occupation (student, worker, or retired). Then, choose your volunteer area: helping at the animal shelter (Tuesday and Friday), serving food at the homeless shelter (Monday and Thursday), or teaching English to immigrants (Wednesday and Saturday). Next, indicate your availability: morning (8-12), afternoon (1-5), or evening (6-9). Finally, provide two references with their contact information. We will contact you within one week!',
  },
];

export const part4Sets: ListeningPart4Set[] = [
  // L4-01 到 L4-10
  
  // ========== L4-01: School Trip to Museum ==========
  {
    id: 'L4-01',
    title: 'School Trip to Museum',
    titleZh: '学校博物馆之旅',
    part: 4,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Teacher',
    monologueAudio: 'Good morning, students! Today we are going to the City Museum. The bus leaves at 8:30 am, so please arrive 15 minutes early. The museum has three floors: the first floor is about dinosaurs, the second floor is about space, and the third floor is about ocean life. We will have a guided tour at 10 am. Please bring your notebook and pencil. Do not bring food or drinks into the museum. Any questions?',
    questions: [
      { id: 'L4-01-Q1', question: 'When does the bus leave?', options: ['8:00 am', '8:15 am', '8:30 am'], answer: 'C', hint: '公交车几点离开？' },
      { id: 'L4-01-Q2', question: 'What is on the first floor of the museum?', options: ['Dinosaurs', 'Space', 'Ocean life'], answer: 'A', hint: '博物馆一楼是什么展览？' },
      { id: 'L4-01-Q3', question: 'When is the guided tour?', options: ['9:00 am', '10:00 am', '11:00 am'], answer: 'B', hint: '导览 tour 是几点？' },
      { id: 'L4-01-Q4', question: 'What should students bring?', options: ['Notebook and pencil', 'Food and drinks', 'Camera'], answer: 'A', hint: '学生应该带什么？' },
      { id: 'L4-01-Q5', question: 'What are students NOT allowed to bring?', options: ['Notebook', 'Pencil', 'Food or drinks'], answer: 'C', hint: '学生不能带什么进博物馆？' },
    ],
    transcript: 'Good morning, students! Today we are going to the City Museum. The bus leaves at 8:30 am, so please arrive 15 minutes early. The museum has three floors: the first floor is about dinosaurs, the second floor is about space, and the third floor is about ocean life. We will have a guided tour at 10 am. Please bring your notebook and pencil. Do not bring food or drinks into the museum. Any questions?',
  },

  // ========== L4-02: Weekend Plans ==========
  {
    id: 'L4-02',
    title: 'Weekend Plans',
    titleZh: '周末计划',
    part: 4,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Friend',
    monologueAudio: 'Hi everyone! I am planning a weekend trip to the beach. We will leave on Saturday morning at 7 am. The journey takes about 2 hours by bus. We will stay in a small hotel near the sea. On Saturday afternoon, we can swim and play beach volleyball. On Sunday morning, we will visit the aquarium. The cost is 50 pounds per person, including hotel and breakfast. Please tell me by Thursday if you want to come!',
    questions: [
      { id: 'L4-02-Q1', question: 'When are they leaving?', options: ['Friday morning', 'Saturday morning', 'Sunday morning'], answer: 'B', hint: '他们什么时候出发？' },
      { id: 'L4-02-Q2', question: 'How long is the journey?', options: ['1 hour', '2 hours', '3 hours'], answer: 'B', hint: '路程要多久？' },
      { id: 'L4-02-Q3', question: 'What will they do on Saturday afternoon?', options: ['Visit aquarium', 'Swim and play volleyball', 'Go to museum'], answer: 'B', hint: '周六下午他们要做什么？' },
      { id: 'L4-02-Q4', question: 'When will they visit the aquarium?', options: ['Saturday morning', 'Saturday afternoon', 'Sunday morning'], answer: 'C', hint: '他们什么时候去水族馆？' },
      { id: 'L4-02-Q5', question: 'How much does it cost per person?', options: ['30 pounds', '50 pounds', '70 pounds'], answer: 'B', hint: '每个人要付多少钱？' },
    ],
    transcript: 'Hi everyone! I am planning a weekend trip to the beach. We will leave on Saturday morning at 7 am. The journey takes about 2 hours by bus. We will stay in a small hotel near the sea. On Saturday afternoon, we can swim and play beach volleyball. On Sunday morning, we will visit the aquarium. The cost is 50 pounds per person, including hotel and breakfast. Please tell me by Thursday if you want to come!',
  },

  // ========== L4-03: School Subjects ==========
  {
    id: 'L4-03',
    title: 'School Subjects',
    titleZh: '学校科目',
    part: 4,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Student',
    monologueAudio: 'My favorite subject at school is Science. We have Science on Monday and Wednesday. In Science class, we do experiments and learn about plants, animals, and the human body. My second favorite subject is Art. We have Art on Friday. I love drawing and painting. I do not like Maths very much because it is difficult. But my teacher says I am getting better. We have Maths every day except Wednesday. After school on Tuesday and Thursday, I go to Maths club to practice more.',
    questions: [
      { id: 'L4-03-Q1', question: 'When does the speaker have Science?', options: ['Monday and Wednesday', 'Tuesday and Thursday', 'Monday and Friday'], answer: 'A', hint: '说话者什么时候有科学课？' },
      { id: 'L4-03-Q2', question: 'What does the speaker do in Science class?', options: ['Write essays', 'Do experiments', 'Read books'], answer: 'B', hint: '说话者在科学课上做什么？' },
      { id: 'L4-03-Q3', question: 'When does the speaker have Art?', options: ['Monday', 'Wednesday', 'Friday'], answer: 'C', hint: '说话者什么时候有美术课？' },
      { id: 'L4-03-Q4', question: 'Why does the speaker not like Maths?', options: ['It is boring', 'It is difficult', 'It is too easy'], answer: 'B', hint: '为什么说话者不喜欢数学？' },
      { id: 'L4-03-Q5', question: 'When does the speaker go to Maths club?', options: ['Monday and Wednesday', 'Tuesday and Thursday', 'Wednesday and Friday'], answer: 'B', hint: '说话者什么时候去数学俱乐部？' },
    ],
    transcript: 'My favorite subject at school is Science. We have Science on Monday and Wednesday. In Science class, we do experiments and learn about plants, animals, and the human body. My second favorite subject is Art. We have Art on Friday. I love drawing and painting. I do not like Maths very much because it is difficult. But my teacher says I am getting better. We have Maths every day except Wednesday. After school on Tuesday and Thursday, I go to Maths club to practice more.',
  },

  // ========== L4-04: Healthy Eating ==========
  {
    id: 'L4-04',
    title: 'Healthy Eating',
    titleZh: '健康饮食',
    part: 4,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Nutritionist',
    monologueAudio: 'Hello everyone! Today I want to talk about healthy eating. A healthy meal should have vegetables, fruit, protein, and grains. For breakfast, you can eat eggs, bread, and a banana. For lunch, try to eat a sandwich with chicken or cheese, and some carrots or cucumbers. For dinner, eat fish or chicken with rice or potatoes, and lots of vegetables. Remember to drink 6 to 8 glasses of water every day. Try not to eat too much candy or chips. If you eat well, you will feel better and have more energy!',
    questions: [
      { id: 'L4-04-Q1', question: 'What should a healthy meal have?', options: ['Only vegetables', 'Vegetables, fruit, protein, grains', 'Only meat'], answer: 'B', hint: '健康的一餐应该有什么？' },
      { id: 'L4-04-Q2', question: 'What can you eat for breakfast?', options: ['Eggs, bread, banana', 'Fish, rice, vegetables', 'Candy and chips'], answer: 'A', hint: '早餐可以吃什么？' },
      { id: 'L4-04-Q3', question: 'What should you eat for lunch?', options: ['Sandwich with chicken, carrots', 'Pizza and coke', 'Ice cream'], answer: 'A', hint: '午餐应该吃什么？' },
      { id: 'L4-04-Q4', question: 'How much water should you drink every day?', options: ['2 to 4 glasses', '6 to 8 glasses', '10 to 12 glasses'], answer: 'B', hint: '每天应该喝多少水？' },
      { id: 'L4-04-Q5', question: 'What does the speaker say about candy and chips?', options: ['Eat them every day', 'Try not to eat too much', 'They are very healthy'], answer: 'B', hint: '说话者对糖果和薯片有什么建议？' },
    ],
    transcript: 'Hello everyone! Today I want to talk about healthy eating. A healthy meal should have vegetables, fruit, protein, and grains. For breakfast, you can eat eggs, bread, and a banana. For lunch, try to eat a sandwich with chicken or cheese, and some carrots or cucumbers. For dinner, eat fish or chicken with rice or potatoes, and lots of vegetables. Remember to drink 6 to 8 glasses of water every day. Try not to eat too much candy or chips. If you eat well, you will feel better and have more energy!',
  },

  // ========== L4-05: My Family ==========
  {
    id: 'L4-05',
    title: 'My Family',
    titleZh: '我的家庭',
    part: 4,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Student',
    monologueAudio: 'I live in a house with my family. There are four people in my family: my mum, my dad, my sister, and me. My mum is a doctor. She works at the hospital from 8am to 5pm. My dad is a teacher. He teaches Maths at a secondary school. My sister is 18 years old. She is a university student. She studies English and History. I am 12 years old and I go to secondary school. We have dinner together every evening at 7pm. On weekends, we like to go to the park or watch a movie together.',
    questions: [
      { id: 'L4-05-Q1', question: 'How many people are in the speaker\'s family?', options: ['Three', 'Four', 'Five'], answer: 'B', hint: '说话者的家庭有几口人？' },
      { id: 'L4-05-Q2', question: 'What is the speaker\'s mum?', options: ['Teacher', 'Doctor', 'Nurse'], answer: 'B', hint: '说话者的妈妈是做什么的？' },
      { id: 'L4-05-Q3', question: 'What does the speaker\'s dad teach?', options: ['English', 'Science', 'Maths'], answer: 'C', hint: '说话者的爸爸教什么科目？' },
      { id: 'L4-05-Q4', question: 'How old is the speaker\'s sister?', options: ['16 years old', '18 years old', '20 years old'], answer: 'B', hint: '说话者的姐姐/妹妹几岁？' },
      { id: 'L4-05-Q5', question: 'What do they do on weekends?', options: ['Go shopping', 'Go to park or watch movie', 'Stay at home'], answer: 'B', hint: '他们周末做什么？' },
    ],
    transcript: 'I live in a house with my family. There are four people in my family: my mum, my dad, my sister, and me. My mum is a doctor. She works at the hospital from 8am to 5pm. My dad is a teacher. He teaches Maths at a secondary school. My sister is 18 years old. She is a university student. She studies English and History. I am 12 years old and I go to secondary school. We have dinner together every evening at 7pm. On weekends, we like to go to the park or watch a movie together.',
  },

  // ========== L4-06: Sports Club ==========
  {
    id: 'L4-06',
    title: 'Sports Club',
    titleZh: '体育俱乐部',
    part: 4,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Club Coach',
    monologueAudio: 'Welcome to Star Sports Club! We have many sports for you to choose from. Football training is on Tuesday and Thursday from 4pm to 6pm. Basketball training is on Monday and Wednesday from 4pm to 6pm. Swimming is available every day except Sunday, from 10am to 8pm. The membership fee is 40 pounds per month for one sport, or 60 pounds per month for two sports. We also have a gym that is open from 6am to 10pm every day. Please sign up at the reception desk. See you on the field!',
    questions: [
      { id: 'L4-06-Q1', question: 'When is football training?', options: ['Monday and Wednesday', 'Tuesday and Thursday', 'Wednesday and Friday'], answer: 'B', hint: '足球训练在什么时候？' },
      { id: 'L4-06-Q2', question: 'When is basketball training?', options: ['Monday and Wednesday 4-6pm', 'Tuesday and Thursday 4-6pm', 'Every day 10am-8pm'], answer: 'A', hint: '篮球训练在什么时候？' },
      { id: 'L4-06-Q3', question: 'When is the swimming pool closed?', options: ['Saturday', 'Sunday', 'Monday'], answer: 'B', hint: '游泳池什么时候关闭？' },
      { id: 'L4-06-Q4', question: 'How much is membership for one sport?', options: ['30 pounds per month', '40 pounds per month', '60 pounds per month'], answer: 'B', hint: '参加一项运动的会员费是多少？' },
      { id: 'L4-06-Q5', question: 'When is the gym open?', options: ['6am to 10pm every day', '8am to 8pm every day', '24 hours'], answer: 'A', hint: '健身房什么时候开放？' },
    ],
    transcript: 'Welcome to Star Sports Club! We have many sports for you to choose from. Football training is on Tuesday and Thursday from 4pm to 6pm. Basketball training is on Monday and Wednesday from 4pm to 6pm. Swimming is available every day except Sunday, from 10am to 8pm. The membership fee is 40 pounds per month for one sport, or 60 pounds per month for two sports. We also have a gym that is open from 6am to 10pm every day. Please sign up at the reception desk. See you on the field!',
  },

  // ========== L4-07: Birthday Party ==========
  {
    id: 'L4-07',
    title: 'Birthday Party',
    titleZh: '生日派对',
    part: 4,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Student',
    monologueAudio: 'I am having a birthday party next Saturday. I will be 13 years old. The party is at my house from 3pm to 6pm. My mum will make a chocolate cake. My dad will buy some pizza and juice. I have invited 15 friends from school. We will play games like musical chairs and pass the parcel. I also want to watch a movie with my friends. My mum says I can choose any movie I want. I hope it does not rain, because then we cannot play in the garden. I am very excited!',
    questions: [
      { id: 'L4-07-Q1', question: 'When is the birthday party?', options: ['Next Friday', 'Next Saturday', 'Next Sunday'], answer: 'B', hint: '生日派对在什么时间？' },
      { id: 'L4-07-Q2', question: 'How old will the speaker be?', options: ['12 years old', '13 years old', '14 years old'], answer: 'B', hint: '说话者要几岁了？' },
      { id: 'L4-07-Q3', question: 'What time is the party?', options: ['1pm to 4pm', '2pm to 5pm', '3pm to 6pm'], answer: 'C', hint: '派对是几点到几点？' },
      { id: 'L4-07-Q4', question: 'What will the speaker\'s dad buy?', options: ['Chocolate cake', 'Pizza and juice', 'Ice cream'], answer: 'B', hint: '说话者的爸爸会买什么？' },
      { id: 'L4-07-Q5', question: 'What games will they play?', options: ['Football and basketball', 'Musical chairs and pass the parcel', 'Card games'], answer: 'B', hint: '他们会玩什么游戏？' },
    ],
    transcript: 'I am having a birthday party next Saturday. I will be 13 years old. The party is at my house from 3pm to 6pm. My mum will make a chocolate cake. My dad will buy some pizza and juice. I have invited 15 friends from school. We will play games like musical chairs and pass the parcel. I also want to watch a movie with my friends. My mum says I can choose any movie I want. I hope it does not rain, because then we cannot play in the garden. I am very excited!',
  },

  // ========== L4-08: Summer Holiday Plans ==========
  {
    id: 'L4-08',
    title: 'Summer Holiday Plans',
    titleZh: '暑假计划',
    part: 4,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Student',
    monologueAudio: 'My family is going to Italy for the summer holiday. We will fly to Rome on July 15th. We will stay in a hotel near the beach. The hotel has a swimming pool and a restaurant. We will stay for two weeks. During the holiday, we will visit museums, eat pizza and pasta, and go to the beach every day. My sister wants to go shopping. My dad wants to visit historical places. My mum wants to relax by the swimming pool. I want to swim and play beach volleyball. I am very excited about this trip!',
    questions: [
      { id: 'L4-08-Q1', question: 'Where is the family going for the summer holiday?', options: ['France', 'Italy', 'Spain'], answer: 'B', hint: '这家人暑假要去哪里？' },
      { id: 'L4-08-Q2', question: 'When will they fly to Rome?', options: ['July 10th', 'July 15th', 'July 20th'], answer: 'B', hint: '他们什么时候飞往罗马？' },
      { id: 'L4-08-Q3', question: 'How long will they stay?', options: ['One week', 'Two weeks', 'Three weeks'], answer: 'B', hint: '他们会待多久？' },
      { id: 'L4-08-Q4', question: 'What does the speaker\'s sister want to do?', options: ['Go shopping', 'Visit museums', 'Play volleyball'], answer: 'A', hint: '说话者的姐姐/妹妹想做什么？' },
      { id: 'L4-08-Q5', question: 'What does the speaker want to do?', options: ['Relax by the pool', 'Visit historical places', 'Swim and play volleyball'], answer: 'C', hint: '说话者想做什么？' },
    ],
    transcript: 'My family is going to Italy for the summer holiday. We will fly to Rome on July 15th. We will stay in a hotel near the beach. The hotel has a swimming pool and a restaurant. We will stay for two weeks. During the holiday, we will visit museums, eat pizza and pasta, and go to the beach every day. My sister wants to go shopping. My dad wants to visit historical places. My mum wants to relax by the swimming pool. I want to swim and play beach volleyball. I am very excited about this trip!',
  },

  // ========== L4-09: Library Rules ==========
  {
    id: 'L4-09',
    title: 'Library Rules',
    titleZh: '图书馆规则',
    part: 4,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Librarian',
    monologueAudio: 'Welcome to the City Library! Here are some important rules. First, please be quiet in the library. No talking or loud noises. Second, you can borrow up to 5 books at a time. The loan period is 3 weeks. If you return books late, you must pay a fine. Third, you cannot eat or drink in the library. Fourth, you must show your library card to borrow books. Finally, the library is open from 9am to 7pm, Monday to Saturday. We are closed on Sunday. If you have any questions, please ask at the reception desk.',
    questions: [
      { id: 'L4-09-Q1', question: 'What is the first rule of the library?', options: ['Be quiet', 'No eating or drinking', 'Show library card'], answer: 'A', hint: '图书馆第一条规则是什么？' },
      { id: 'L4-09-Q2', question: 'How many books can you borrow at a time?', options: ['3 books', '5 books', '10 books'], answer: 'B', hint: '一次可以借几本书？' },
      { id: 'L4-09-Q3', question: 'How long is the loan period?', options: ['1 week', '2 weeks', '3 weeks'], answer: 'C', hint: '借阅期是多久？' },
      { id: 'L4-09-Q4', question: 'When is the library closed?', options: ['Saturday', 'Sunday', 'Monday'], answer: 'B', hint: '图书馆什么时候关闭？' },
      { id: 'L4-09-Q5', question: 'What must you show to borrow books?', options: ['ID card', 'Library card', 'Student card'], answer: 'B', hint: '借书必须出示什么？' },
    ],
    transcript: 'Welcome to the City Library! Here are some important rules. First, please be quiet in the library. No talking or loud noises. Second, you can borrow up to 5 books at a time. The loan period is 3 weeks. If you return books late, you must pay a fine. Third, you cannot eat or drink in the library. Fourth, you must show your library card to borrow books. Finally, the library is open from 9am to 7pm, Monday to Saturday. We are closed on Sunday. If you have any questions, please ask at the reception desk.',
  },

  // ========== L4-10: My School Day ==========
  {
    id: 'L4-10',
    title: 'My School Day',
    titleZh: '我的学校一天',
    part: 4,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Student',
    monologueAudio: 'I go to school every day from Monday to Friday. My school day starts at 8:30am. I take the bus to school. The journey takes 20 minutes. My first class is English at 9am. Then I have Maths at 10am. At 11am, we have a 20-minute break. I usually eat a snack and talk with my friends. After break, I have Science at 11:20am. We have lunch at 1pm. After lunch, I have History at 2pm and Art at 3pm. School finishes at 4pm. I go home by bus and arrive at 4:30pm.',
    questions: [
      { id: 'L4-10-Q1', question: 'When does the speaker\'s school day start?', options: ['8:00am', '8:30am', '9:00am'], answer: 'B', hint: '说话者的上学日几点开始？' },
      { id: 'L4-10-Q2', question: 'How long is the bus journey?', options: ['10 minutes', '20 minutes', '30 minutes'], answer: 'B', hint: '公交车程要多久？' },
      { id: 'L4-10-Q3', question: 'What class does the speaker have at 10am?', options: ['English', 'Maths', 'Science'], answer: 'B', hint: '说话者上午10点有什么课？' },
      { id: 'L4-10-Q4', question: 'How long is the break?', options: ['10 minutes', '20 minutes', '30 minutes'], answer: 'B', hint: '课间休息多长时间？' },
      { id: 'L4-10-Q5', question: 'When does school finish?', options: ['3:30pm', '4:00pm', '4:30pm'], answer: 'B', hint: '学校几点放学？' },
    ],
    transcript: 'I go to school every day from Monday to Friday. My school day starts at 8:30am. I take the bus to school. The journey takes 20 minutes. My first class is English at 9am. Then I have Maths at 10am. At 11am, we have a 20-minute break. I usually eat a snack and talk with my friends. After break, I have Science at 11:20am. We have lunch at 1pm. After lunch, I have History at 2pm and Art at 3pm. School finishes at 4pm. I go home by bus and arrive at 4:30pm.',
  },
];

export const part5Sets: ListeningPart5Set[] = [
  // L5-01 到 L5-10
  
  // ========== L5-01: Library Membership ==========
  {
    id: 'L5-01',
    title: 'Library Membership',
    titleZh: '图书馆会员',
    part: 5,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Librarian',
    monologueAudio: 'Welcome to the City Library! To become a member, please fill in this form. First, write your full name and address. Then, choose your membership type: student membership is free, adult membership is 10 pounds per year. Next, write the subjects you are interested in: history, science, or fiction. Finally, sign at the bottom. You can borrow up to 5 books at a time. The library opens from 9am to 7pm, Monday to Saturday.',
    notes: [
      { id: 'L5-01-N1', field: 'Full Name & Address', fieldZh: '姓名和地址', answer: 'full name and address', hint: '你的姓名和地址', audioText: 'First, write your full name and address.' },
      { id: 'L5-01-N2', field: 'Membership Type', fieldZh: '会员类型', answer: 'student / adult', hint: '学生免费/成人10镑', audioText: 'Then, choose your membership type: student membership is free, adult membership is 10 pounds per year.' },
      { id: 'L5-01-N3', field: 'Subject Interest', fieldZh: '感兴趣的学科', answer: 'history / science / fiction', hint: '3个学科选1或多个', audioText: 'Next, write the subjects you are interested in: history, science, or fiction.' },
      { id: 'L5-01-N4', field: 'Opening Hours', fieldZh: '开放时间', answer: '9am to 7pm', hint: '周一至周六几点到几点', audioText: 'The library opens from 9am to 7pm, Monday to Saturday.' },
    ],
    transcript: 'Welcome to the City Library! To become a member, please fill in this form. First, write your full name and address. Then, choose your membership type: student membership is free, adult membership is 10 pounds per year. Next, write the subjects you are interested in: history, science, or fiction. Finally, sign at the bottom. You can borrow up to 5 books at a time. The library opens from 9am to 7pm, Monday to Saturday.',
  },

  // ========== L5-02: Gym Membership ==========
  {
    id: 'L5-02',
    title: 'Gym Membership',
    titleZh: '健身房会员',
    part: 5,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Gym Staff',
    monologueAudio: 'Welcome to Active Fitness Centre! My name is Coach Sarah. To become a member, please fill in this form. First, write your name and address. Then, choose your membership type: basic membership is 30 pounds per month, premium is 50 pounds per month. The premium membership includes a free personal trainer session every month. Next, write any injuries or health problems you have. Finally, sign at the bottom. We open every day from 6am to 10pm!',
    notes: [
      { id: 'L5-02-N1', field: 'Name & Address', fieldZh: '姓名和地址', answer: 'name and address', hint: '你的姓名和地址', audioText: 'First, write your name and address.' },
      { id: 'L5-02-N2', field: 'Basic Membership', fieldZh: '基础会员费', answer: '30 pounds per month', hint: '基础会员每月多少钱', audioText: 'Then, choose your membership type: basic membership is 30 pounds per month, premium is 50 pounds per month.' },
      { id: 'L5-02-N3', field: 'Premium Membership', fieldZh: '高级会员费', answer: '50 pounds per month', hint: '高级会员每月多少钱', audioText: 'Then, choose your membership type: basic membership is 30 pounds per month, premium is 50 pounds per month.' },
      { id: 'L5-02-N4', field: 'Opening Hours', fieldZh: '开放时间', answer: '6am to 10pm', hint: '每天几点到几点开门', audioText: 'We open every day from 6am to 10pm!' },
    ],
    transcript: 'Welcome to Active Fitness Centre! My name is Coach Sarah. To become a member, please fill in this form. First, write your name and address. Then, choose your membership type: basic membership is 30 pounds per month, premium is 50 pounds per month. The premium membership includes a free personal trainer session every month. Next, write any injuries or health problems you have. Finally, sign at the bottom. We open every day from 6am to 10pm!',
  },

  // ========== L5-03: Language School Enrollment ==========
  {
    id: 'L5-03',
    title: 'Language School Enrollment',
    titleZh: '语言学校报名',
    part: 5,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'School Secretary',
    monologueAudio: 'Hello and welcome to Brighton Language School! To enroll, please complete this form. First, write your full name and nationality. Then, choose your course: General English, Business English, or Exam Preparation. Next, select your level: Beginner, Intermediate, or Advanced. After that, write your emergency contact number. Finally, pay the course fee: 200 pounds for 4 weeks. Classes start every Monday. Good luck with your studies!',
    notes: [
      { id: 'L5-03-N1', field: 'Full Name & Nationality', fieldZh: '姓名和国籍', answer: 'full name and nationality', hint: '你的全名和国籍', audioText: 'First, write your full name and nationality.' },
      { id: 'L5-03-N2', field: 'Course Choice', fieldZh: '课程选择', answer: 'General English / Business English / Exam Preparation', hint: '3种课程选1', audioText: 'Then, choose your course: General English, Business English, or Exam Preparation.' },
      { id: 'L5-03-N3', field: 'Level', fieldZh: '水平等级', answer: 'Beginner / Intermediate / Advanced', hint: '3个等级选1', audioText: 'Next, select your level: Beginner, Intermediate, or Advanced.' },
      { id: 'L5-03-N4', field: 'Course Fee', fieldZh: '课程费用', answer: '200 pounds for 4 weeks', hint: '4周课程多少钱', audioText: 'Finally, pay the course fee: 200 pounds for 4 weeks.' },
    ],
    transcript: 'Hello and welcome to Brighton Language School! To enroll, please complete this form. First, write your full name and nationality. Then, choose your course: General English, Business English, or Exam Preparation. Next, select your level: Beginner, Intermediate, or Advanced. After that, write your emergency contact number. Finally, pay the course fee: 200 pounds for 4 weeks. Classes start every Monday. Good luck with your studies!',
  },

  // ========== L5-04: Holiday Camp Booking ==========
  {
    id: 'L5-04',
    title: 'Holiday Camp Booking',
    titleZh: '假日营地预订',
    part: 5,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Camp Organizer',
    monologueAudio: 'Welcome to Starlight Holiday Camp! To book your place, please fill in this form. First, write the camper\'s name and age. Then, choose your week: Week 1 (July 10-16), Week 2 (July 17-23), or both weeks. Next, select activities: sports, arts and crafts, or music. The cost is 150 pounds per week. Include lunch and snacks. Finally, provide any dietary requirements. We look forward to seeing you!',
    notes: [
      { id: 'L5-04-N1', field: 'Camper\'s Name & Age', fieldZh: '营员姓名和年龄', answer: 'camper\'s name and age', hint: '营员的姓名和年龄', audioText: 'First, write the camper\'s name and age.' },
      { id: 'L5-04-N2', field: 'Week Choice', fieldZh: '周次选择', answer: 'Week 1 / Week 2 / both weeks', hint: '选择第1周、第2周或两周都选', audioText: 'Then, choose your week: Week 1 (July 10-16), Week 2 (July 17-23), or both weeks.' },
      { id: 'L5-04-N3', field: 'Activities', fieldZh: '活动选择', answer: 'sports / arts and crafts / music', hint: '3种活动选1或多个', audioText: 'Next, select activities: sports, arts and crafts, or music.' },
      { id: 'L5-04-N4', field: 'Cost per Week', fieldZh: '每周费用', answer: '150 pounds per week', hint: '每周营地费用多少', audioText: 'The cost is 150 pounds per week. Include lunch and snacks.' },
    ],
    transcript: 'Welcome to Starlight Holiday Camp! To book your place, please fill in this form. First, write the camper\'s name and age. Then, choose your week: Week 1 (July 10-16), Week 2 (July 17-23), or both weeks. Next, select activities: sports, arts and crafts, or music. The cost is 150 pounds per week. Include lunch and snacks. Finally, provide any dietary requirements. We look forward to seeing you!',
  },

  // ========== L5-05: Music School Application ==========
  {
    id: 'L5-05',
    title: 'Music School Application',
    titleZh: '音乐学校申请',
    part: 5,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Music Teacher',
    monologueAudio: 'Hello! Welcome to Melody Music School. To apply, please complete this form. First, write your name and phone number. Then, choose your instrument: piano, guitar, violin, or drums. Next, select your lesson type: individual (20 pounds per lesson) or group (12 pounds per lesson). After that, choose your preferred day: Monday, Wednesday, or Saturday. Finally, sign at the bottom. We also offer a free trial lesson!',
    notes: [
      { id: 'L5-05-N1', field: 'Name & Phone', fieldZh: '姓名和电话', answer: 'name and phone number', hint: '你的姓名和电话号码', audioText: 'First, write your name and phone number.' },
      { id: 'L5-05-N2', field: 'Instrument Choice', fieldZh: '乐器选择', answer: 'piano / guitar / violin / drums', hint: '4种乐器选1', audioText: 'Then, choose your instrument: piano, guitar, violin, or drums.' },
      { id: 'L5-05-N3', field: 'Individual Lesson Cost', fieldZh: '一对一课程费用', answer: '20 pounds per lesson', hint: '一对一课程每节多少钱', audioText: 'Next, select your lesson type: individual (20 pounds per lesson) or group (12 pounds per lesson).' },
      { id: 'L5-05-N4', field: 'Group Lesson Cost', fieldZh: '团体课程费用', answer: '12 pounds per lesson', hint: '团体课程每节多少钱', audioText: 'Next, select your lesson type: individual (20 pounds per lesson) or group (12 pounds per lesson).' },
    ],
    transcript: 'Hello! Welcome to Melody Music School. To apply, please complete this form. First, write your name and phone number. Then, choose your instrument: piano, guitar, violin, or drums. Next, select your lesson type: individual (20 pounds per lesson) or group (12 pounds per lesson). After that, choose your preferred day: Monday, Wednesday, or Saturday. Finally, sign at the bottom. We also offer a free trial lesson!',
  },

  // ========== L5-06: Sports Club Registration ==========
  {
    id: 'L5-06',
    title: 'Sports Club Registration',
    titleZh: '体育俱乐部注册',
    part: 5,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Club Manager',
    monologueAudio: 'Welcome to Champion Sports Club! To register, please fill in this form. First, write your name, age, and emergency contact. Then, choose your sport: football (Tuesday and Thursday), basketball (Monday and Wednesday), or swimming (every day except Sunday). Next, pay the membership fee: 40 pounds per month for one sport, 60 pounds for two sports. Finally, collect your club T-shirt from reception. Training starts next week!',
    notes: [
      { id: 'L5-06-N1', field: 'Name, Age & Emergency Contact', fieldZh: '姓名、年龄、紧急联系人', answer: 'name, age, and emergency contact', hint: '填写姓名、年龄和紧急联系人', audioText: 'First, write your name, age, and emergency contact.' },
      { id: 'L5-06-N2', field: 'Football Days', fieldZh: '足球训练日', answer: 'Tuesday and Thursday', hint: '足球在周几训练', audioText: 'Then, choose your sport: football (Tuesday and Thursday), basketball (Monday and Wednesday), or swimming (every day except Sunday).' },
      { id: 'L5-06-N3', field: 'Basketball Days', fieldZh: '篮球训练日', answer: 'Monday and Wednesday', hint: '篮球在周几训练', audioText: 'Then, choose your sport: football (Tuesday and Thursday), basketball (Monday and Wednesday), or swimming (every day except Sunday).' },
      { id: 'L5-06-N4', field: 'One Sport Fee', fieldZh: '一项运动费用', answer: '40 pounds per month', hint: '参加一项运动每月多少钱', audioText: 'Next, pay the membership fee: 40 pounds per month for one sport, 60 pounds for two sports.' },
    ],
    transcript: 'Welcome to Champion Sports Club! To register, please fill in this form. First, write your name, age, and emergency contact. Then, choose your sport: football (Tuesday and Thursday), basketball (Monday and Wednesday), or swimming (every day except Sunday). Next, pay the membership fee: 40 pounds per month for one sport, 60 pounds for two sports. Finally, collect your club T-shirt from reception. Training starts next week!',
  },

  // ========== L5-07: Art Class Booking ==========
  {
    id: 'L5-07',
    title: 'Art Class Booking',
    titleZh: '美术课预订',
    part: 5,
    difficulty: 'medium',
    speed: 'normal',
    speaker: 'Art Instructor',
    monologueAudio: 'Hello artists! Welcome to Creative Art Studio. To book your place, please complete this form. First, write your name and email address. Then, choose your class type: painting (Tuesday 4-6pm), drawing (Thursday 4-6pm), or sculpture (Saturday 10am-12pm). Next, pay the class fee: 15 pounds per class, or 50 pounds for 4 classes. Finally, bring your own brushes and canvas. We provide all paints and materials. See you in class!',
    notes: [
      { id: 'L5-07-N1', field: 'Name & Email', fieldZh: '姓名和邮箱', answer: 'name and email address', hint: '你的姓名和邮箱地址', audioText: 'First, write your name and email address.' },
      { id: 'L5-07-N2', field: 'Painting Class Time', fieldZh: '绘画课时间', answer: 'Tuesday 4-6pm', hint: '绘画课在什么时候', audioText: 'Then, choose your class type: painting (Tuesday 4-6pm), drawing (Thursday 4-6pm), or sculpture (Saturday 10am-12pm).' },
      { id: 'L5-07-N3', field: 'Drawing Class Time', fieldZh: '素描课时间', answer: 'Thursday 4-6pm', hint: '素描课在什么时候', audioText: 'Then, choose your class type: painting (Tuesday 4-6pm), drawing (Thursday 4-6pm), or sculpture (Saturday 10am-12pm).' },
      { id: 'L5-07-N4', field: '4 Classes Fee', fieldZh: '4节课费用', answer: '50 pounds for 4 classes', hint: '4节课套装多少钱', audioText: 'Next, pay the class fee: 15 pounds per class, or 50 pounds for 4 classes.' },
    ],
    transcript: 'Hello artists! Welcome to Creative Art Studio. To book your place, please complete this form. First, write your name and email address. Then, choose your class type: painting (Tuesday 4-6pm), drawing (Thursday 4-6pm), or sculpture (Saturday 10am-12pm). Next, pay the class fee: 15 pounds per class, or 50 pounds for 4 classes. Finally, bring your own brushes and canvas. We provide all paints and materials. See you in class!',
  },

  // ========== L5-08: Cooking Workshop Registration ==========
  {
    id: 'L5-08',
    title: 'Cooking Workshop Registration',
    titleZh: '烹饪工作坊报名',
    part: 5,
    difficulty: 'hard',
    speed: 'fast',
    speaker: 'Chef',
    monologueAudio: 'Welcome to Tasty Cooking Workshop! To join our cooking classes, please register using this form. First, write your name and any food allergies. Then, choose your workshop: Italian Cuisine (Saturday 10am-1pm), Asian Fusion (Sunday 10am-1pm), or Baking and Desserts (Saturday 2-5pm). The cost is 35 per workshop, including all ingredients and recipes to take home. Next, indicate if you want to join our monthly cooking competition. Finally, provide your phone number for updates. Bon appétit!',
    notes: [
      { id: 'L5-08-N1', field: 'Name & Food Allergies', fieldZh: '姓名和食物过敏', answer: 'name and food allergies', hint: '你的姓名和食物过敏信息', audioText: 'First, write your name and any food allergies.' },
      { id: 'L5-08-N2', field: 'Italian Cuisine Time', fieldZh: '意大利菜工作坊时间', answer: 'Saturday 10am-1pm', hint: '意大利菜工作坊在什么时候', audioText: 'Then, choose your workshop: Italian Cuisine (Saturday 10am-1pm), Asian Fusion (Sunday 10am-1pm), or Baking and Desserts (Saturday 2-5pm).' },
      { id: 'L5-08-N3', field: 'Workshop Cost', fieldZh: '工作坊费用', answer: '35 per workshop', hint: '每个工作坊多少钱', audioText: 'The cost is 35 per workshop, including all ingredients and recipes to take home.' },
      { id: 'L5-08-N4', field: 'Phone Number', fieldZh: '电话号码', answer: 'phone number', hint: '填写你的电话号码用于接收更新', audioText: 'Finally, provide your phone number for updates.' },
    ],
    transcript: 'Welcome to Tasty Cooking Workshop! To join our cooking classes, please register using this form. First, write your name and any food allergies. Then, choose your workshop: Italian Cuisine (Saturday 10am-1pm), Asian Fusion (Sunday 10am-1pm), or Baking and Desserts (Saturday 2-5pm). The cost is 35 per workshop, including all ingredients and recipes to take home. Next, indicate if you want to join our monthly cooking competition. Finally, provide your phone number for updates. Bon appétit!',
  },

  // ========== L5-09: Volunteer Program Application ==========
  {
    id: 'L5-09',
    title: 'Volunteer Program Application',
    titleZh: '志愿者项目申请',
    part: 5,
    difficulty: 'hard',
    speed: 'fast',
    speaker: 'Program Coordinator',
    monologueAudio: 'Thank you for your interest in our Community Volunteer Program! To apply, please complete this application form. First, write your full name, age, and occupation (student, worker, or retired). Then, choose your volunteer area: helping at the animal shelter (Tuesday and Friday), serving food at the homeless shelter (Monday and Thursday), or teaching English to immigrants (Wednesday and Saturday). Next, indicate your availability: morning (8-12), afternoon (1-5), or evening (6-9). Finally, provide two references with their contact information. We will contact you within one week!',
    notes: [
      { id: 'L5-09-N1', field: 'Full Name, Age & Occupation', fieldZh: '姓名、年龄、职业', answer: 'full name, age, and occupation', hint: '填写姓名、年龄和职业', audioText: 'First, write your full name, age, and occupation (student, worker, or retired).' },
      { id: 'L5-09-N2', field: 'Animal Shelter Days', fieldZh: '动物收容所服务日', answer: 'Tuesday and Friday', hint: '动物收容所在周几需要志愿者', audioText: 'Then, choose your volunteer area: helping at the animal shelter (Tuesday and Friday), serving food at the homeless shelter (Monday and Thursday), or teaching English to immigrants (Wednesday and Saturday).' },
      { id: 'L5-09-N3', field: 'Availability Options', fieldZh: '可服务时间段', answer: 'morning (8-12) / afternoon (1-5) / evening (6-9)', hint: '3个时间段可选', audioText: 'Next, indicate your availability: morning (8-12), afternoon (1-5), or evening (6-9).' },
      { id: 'L5-09-N4', field: 'References', fieldZh: '证明人', answer: 'two references with contact information', hint: '需要提供2个证明人和他们的联系方式', audioText: 'Finally, provide two references with their contact information.' },
    ],
    transcript: 'Thank you for your interest in our Community Volunteer Program! To apply, please complete this application form. First, write your full name, age, and occupation (student, worker, or retired). Then, choose your volunteer area: helping at the animal shelter (Tuesday and Friday), serving food at the homeless shelter (Monday and Thursday), or teaching English to immigrants (Wednesday and Saturday). Next, indicate your availability: morning (8-12), afternoon (1-5), or evening (6-9). Finally, provide two references with their contact information. We will contact you within one week!',
  },

  // ========== L5-10: Summer Camp Registration ==========
  {
    id: 'L5-10',
    title: 'Summer Camp Registration',
    titleZh: '夏令营报名',
    part: 5,
    difficulty: 'easy',
    speed: 'slow',
    speaker: 'Camp Counselor',
    monologueAudio: 'Hello! Welcome to Sunny Summer Camp. To register, please fill in this form. First, write your name and age. Next, choose your activity: swimming, hiking, or art class. Then, write your parent\'s phone number. Finally, tick any food allergies you have. The camp starts on July 1st. See you there!',
    notes: [
      { id: 'L5-10-N1', field: 'Name', fieldZh: '姓名', answer: 'name', hint: '你的名字', audioText: 'First, write your name and age.' },
      { id: 'L5-10-N2', field: 'Age', fieldZh: '年龄', answer: 'age', hint: '你的年龄', audioText: 'First, write your name and age.' },
      { id: 'L5-10-N3', field: 'Activity Choice', fieldZh: '活动选择', answer: 'swimming / hiking / art class', hint: '3种活动选1', audioText: 'Next, choose your activity: swimming, hiking, or art class.' },
      { id: 'L5-10-N4', field: 'Parent\'s Phone', fieldZh: '家长电话', answer: 'parent\'s phone number', hint: '你家长的电话号码', audioText: 'Then, write your parent\'s phone number.' },
    ],
    transcript: 'Hello! Welcome to Sunny Summer Camp. To register, please fill in this form. First, write your name and age. Next, choose your activity: swimming, hiking, or art class. Then, write your parent\'s phone number. Finally, tick any food allergies you have. The camp starts on July 1st. See you there!',
  },
];


// ========== 汇总导出 ==========

export const allListeningSets = {
  1: part1Sets,
  2: part2Sets,
  3: part3Sets,
  4: part4Sets,
  5: part5Sets,
};

/** 获取某 Part 的所有套题 */
export function getListeningSetsByPart(part: number): ListeningPart1Set[] | ListeningPart2Set[] | ListeningPart3Set[] | ListeningPart4Set[] | ListeningPart5Set[] {
  return allListeningSets[part as keyof typeof allListeningSets] || [];
}

/** 按难度筛选 */
export function getListeningSetsByDifficulty(part: number, difficulty: 'easy' | 'medium' | 'hard'): any[] {
  const sets = getListeningSetsByPart(part);
  return sets.filter(s => s.difficulty === difficulty);
}
