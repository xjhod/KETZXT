// ========= KET 口语练习 - 题目数据 =========
import type { SpeakingPart1Question, SpeakingPart2Question } from '../types/speaking';

// ========= Part 1: 回答问题（20 题）=========
export const speakingPart1: SpeakingPart1Question[] = [
  {
    id: 's1-001',
    question: 'Tell me about your family.',
    questionZh: '说说你的家庭。',
    prompts: [
      'How many people are in your family?',
      'What do your parents do?',
      'Do you have any brothers or sisters?',
    ],
    keywords: ['family', 'mother', 'father', 'brother', 'sister', 'people'],
    modelAnswer: 'There are four people in my family: my mother, my father, my sister and me. My father is a teacher and my mother works in a hospital. My sister is younger than me.',
  },
  {
    id: 's1-002',
    question: 'What do you like doing in your free time?',
    questionZh: '空闲时间你喜欢做什么？',
    prompts: [
      'What are your hobbies?',
      'How often do you do these activities?',
      'Who do you do them with?',
    ],
    keywords: ['hobby', 'like', 'enjoy', 'play', 'watch', 'listen'],
    modelAnswer: 'In my free time, I like playing basketball with my friends. I also enjoy watching movies and listening to music. I do these activities every weekend.',
  },
  {
    id: 's1-003',
    question: 'Tell me about your favourite subject at school.',
    questionZh: '说说你在学校最喜欢的科目。',
    prompts: [
      'Which subject do you like best?',
      'Why do you like it?',
      'Who teaches it?',
    ],
    keywords: ['subject', 'like', 'teacher', 'interesting', 'difficult', 'learn'],
    modelAnswer: 'My favourite subject is English because it is very interesting. Our teacher is very kind and makes the lessons fun. I want to learn to speak English well.',
  },
  {
    id: 's1-004',
    question: 'Where do you live?',
    questionZh: '你住在哪里？',
    prompts: [
      'Do you live in a house or a flat?',
      'What is your neighbourhood like?',
      'What do you like about where you live?',
    ],
    keywords: ['live', 'house', 'flat', 'city', 'town', 'near'],
    modelAnswer: 'I live in a flat in Beijing with my family. It is very big and has a beautiful park nearby. I like my neighbourhood because it is quiet and safe.',
  },
  {
    id: 's1-005',
    question: 'What did you do last weekend?',
    questionZh: '上周末你做了什么？',
    prompts: [
      'Where did you go?',
      'Who did you go with?',
      'What was the best part?',
    ],
    keywords: ['weekend', 'went', 'played', 'watched', 'friend', 'family'],
    modelAnswer: 'Last weekend, I went to the park with my family. We had a picnic and played frisbee. It was a lot of fun because the weather was sunny and warm.',
  },
  {
    id: 's1-006',
    question: 'Tell me about your best friend.',
    questionZh: '说说你最好的朋友。',
    prompts: [
      'What is your friend like?',
      'How long have you known each other?',
      'What do you like to do together?',
    ],
    keywords: ['friend', 'kind', 'funny', 'helpful', 'together', 'know'],
    modelAnswer: 'My best friend is Tom. He is very kind and funny. We have known each other for five years. We like to play video games and ride our bikes together.',
  },
  {
    id: 's1-007',
    question: 'What is your favourite food?',
    questionZh: '你最喜欢的食物是什么？',
    prompts: [
      'What do you like to eat?',
      'Who cooks it for you?',
      'Is it healthy?',
    ],
    keywords: ['food', 'like', 'cook', 'healthy', 'delicious', 'eat'],
    modelAnswer: 'My favourite food is pizza because it is delicious. My mother cooks it for me on Fridays. It is not very healthy, but I love it!',
  },
  {
    id: 's1-008',
    question: 'Do you prefer reading books or watching TV? Why?',
    questionZh: '你更喜欢读书还是看电视？为什么？',
    prompts: [
      'How often do you read/watch TV?',
      'What is your favourite book/programme?',
      'Why do you prefer it?',
    ],
    keywords: ['read', 'watch', 'book', 'TV', 'prefer', 'because'],
    modelAnswer: 'I prefer reading books because it is more relaxing. I read every day before bed. My favourite book is Harry Potter because it is very exciting.',
  },
  {
    id: 's1-009',
    question: 'Tell me about your school.',
    questionZh: '说说你的学校。',
    prompts: [
      'What is your school like?',
      'What is your favourite place in the school?',
      'Who do you sit next to in class?',
    ],
    keywords: ['school', 'big', 'classroom', 'teacher', 'friend', 'sit'],
    modelAnswer: 'My school is very big and has a large playground. My favourite place is the library because it is quiet. I sit next to my friend Lily in class.',
  },
  {
    id: 's1-010',
    question: 'What do you want to do next summer?',
    questionZh: '明年夏天你想做什么？',
    prompts: [
      'Where would you like to go?',
      'Who would you like to go with?',
      'What would you like to do there?',
    ],
    keywords: ['summer', 'want', 'go', 'travel', 'beach', 'visit'],
    modelAnswer: 'Next summer, I want to go to the beach with my family. I would like to swim in the sea and build sandcastles. It will be very exciting!',
  },
  {
    id: 's1-011',
    question: 'Do you like animals? Why or why not?',
    questionZh: '你喜欢动物吗？为什么？',
    prompts: [
      'What is your favourite animal?',
      'Do you have any pets?',
      'What would you like to have as a pet?',
    ],
    keywords: ['animal', 'like', 'pet', 'dog', 'cat', 'because'],
    modelAnswer: 'Yes, I like animals very much. My favourite animal is dogs because they are friendly. I have a pet dog named Buddy. He is very playful.',
  },
  {
    id: 's1-012',
    question: 'Tell me about your last birthday.',
    questionZh: '说说你上一个生日。',
    prompts: [
      'What did you do?',
      'Who came to your party?',
      'What presents did you get?',
    ],
    keywords: ['birthday', 'party', 'friend', 'present', 'cake', 'happy'],
    modelAnswer: 'For my last birthday, I had a party at my house. My friends came and we ate cake. I got a new bike as a present. It was a very happy day!',
  },
  {
    id: 's1-013',
    question: 'What do you usually do after school?',
    questionZh: '放学后你通常做什么？',
    prompts: [
      'Do you have any after-school activities?',
      'When do you do your homework?',
      'What time do you eat dinner?',
    ],
    keywords: ['after', 'school', 'homework', 'dinner', 'activity', 'usually'],
    modelAnswer: 'After school, I usually do my homework first. Then I play basketball with my friends. We eat dinner at 7 o\'clock. I go to bed at 10 o\'clock.',
  },
  {
    id: 's1-014',
    question: 'Tell me about your favourite sport.',
    questionZh: '说说你最喜欢的运动。',
    prompts: [
      'What sport do you like?',
      'How often do you play it?',
      'Who do you play it with?',
    ],
    keywords: ['sport', 'play', 'football', 'basketball', 'swim', 'often'],
    modelAnswer: 'My favourite sport is basketball. I play it every Saturday with my friends. I am not very good at it, but I enjoy it very much.',
  },
  {
    id: 's1-015',
    question: 'Do you like travelling? Where would you like to go?',
    questionZh: '你喜欢旅行吗？你想去哪里？',
    prompts: [
      'Where have you travelled before?',
      'Where would you like to go in the future?',
      'Who would you like to travel with?',
    ],
    keywords: ['travel', 'visit', 'country', 'city', 'would', 'like'],
    modelAnswer: 'Yes, I like travelling. I have travelled to Shanghai before. In the future, I would like to go to London because I want to see Big Ben.',
  },
  {
    id: 's1-016',
    question: 'What do you usually eat for breakfast?',
    questionZh: '你早餐通常吃什么？',
    prompts: [
      'What is your favourite breakfast food?',
      'Who cooks breakfast for you?',
      'What time do you usually eat breakfast?',
    ],
    keywords: ['breakfast', 'eat', 'bread', 'milk', 'egg', 'usually'],
    modelAnswer: 'For breakfast, I usually eat bread and drink milk. My mother cooks breakfast for me. I eat breakfast at 7 o\'clock every morning.',
  },
  {
    id: 's1-017',
    question: 'Tell me about your favourite season.',
    questionZh: '说说你最喜欢的季节。',
    prompts: [
      'Which season do you like best?',
      'What is the weather like?',
      'What do you like to do in that season?',
    ],
    keywords: ['season', 'spring', 'summer', 'autumn', 'winter', 'weather'],
    modelAnswer: 'My favourite season is summer because the weather is warm and sunny. I like to go swimming and eat ice cream. I also have a long holiday in summer.',
  },
  {
    id: 's1-018',
    question: 'Do you help with housework at home? What do you do?',
    questionZh: '你在家帮忙做家务吗？你做什么？',
    prompts: [
      'What chores do you do?',
      'How often do you do them?',
      'Who else helps with housework?',
    ],
    keywords: ['housework', 'help', 'clean', 'wash', 'room', 'often'],
    modelAnswer: 'Yes, I help with housework at home. I clean my room every Saturday and wash the dishes after dinner. My sister helps with the cooking.',
  },
  {
    id: 's1-019',
    question: 'What is your favourite way to relax?',
    questionZh: '你最喜欢的放松方式是什么？',
    prompts: [
      'How do you relax after a long day?',
      'What do you do at the weekend to relax?',
      'Who do you relax with?',
    ],
    keywords: ['relax', 'listen', 'music', 'read', 'sleep', 'watch'],
    modelAnswer: 'My favourite way to relax is to listen to music. After a long day at school, I listen to my favourite songs. It makes me feel happy and relaxed.',
  },
  {
    id: 's1-020',
    question: 'Tell me about a typical day in your life.',
    questionZh: '说说你生活中典型的一天。',
    prompts: [
      'What time do you wake up?',
      'What do you do during the day?',
      'What time do you go to bed?',
    ],
    keywords: ['wake', 'school', 'lunch', 'homework', 'dinner', 'bed'],
    modelAnswer: 'I wake up at 7 o\'clock every morning. I go to school at 8 o\'clock. After school, I do my homework and then play with my friends. I go to bed at 10 o\'clock.',
  },
];

// ========= Part 2: 看图讨论（10 题）=========
export const speakingPart2: SpeakingPart2Question[] = [
  {
    id: 's2-001',
    imageUrl: 'speaking/s2-001.jpg',
    questions: [
      'What can you see in the picture?',
      'Where do you think this is?',
      'What are the people doing?',
    ],
    keywords: ['park', 'children', 'playing', 'running', 'happy', 'outside'],
    tips: [
      '描述图片中的人物、地点、活动',
      '使用现在进行时（be + verb-ing）',
      '尝试用复合句连接想法',
    ],
  },
  {
    id: 's2-002',
    imageUrl: 'speaking/s2-002.jpg',
    questions: [
      'What is happening in the picture?',
      'How do the people feel?',
      'What do you think will happen next?',
    ],
    keywords: ['family', 'eating', 'dinner', 'together', 'happy', 'food'],
    tips: [
      '描述人物情绪（happy, excited, tired）',
      '使用表达推测的词语（maybe, probably）',
      '尝试给出理由支持你的观点',
    ],
  },
  {
    id: 's2-003',
    imageUrl: 'speaking/s2-003.jpg',
    questions: [
      'What can you see in the picture?',
      'Do you like this activity? Why or why not?',
      'How often do you do this?',
    ],
    keywords: ['sport', 'playing', 'football', 'basketball', 'team', 'game'],
    tips: [
      '描述运动类型',
      '表达喜好（I like... because...）',
      '谈论频率（every day, often, sometimes）',
    ],
  },
  {
    id: 's2-004',
    imageUrl: 'speaking/s2-004.jpg',
    questions: [
      'Where is this?',
      'What are the people doing?',
      'Do you like this place? Why or why not?',
    ],
    keywords: ['school', 'classroom', 'learning', 'studying', 'teacher', 'student'],
    tips: [
      '描述地点特征',
      '表达意见（I think..., In my opinion...）',
      '给出理由支持你的观点',
    ],
  },
  {
    id: 's2-005',
    imageUrl: 'speaking/s2-005.jpg',
    questions: [
      'What is the weather like in the picture?',
      'What clothes are the people wearing?',
      'What is your favourite weather? Why?',
    ],
    keywords: ['weather', 'sunny', 'rainy', 'cold', 'hot', 'clothes'],
    tips: [
      '描述天气状况',
      '使用现在进行时描述人物活动',
      '表达个人偏好并给出理由',
    ],
  },
  {
    id: 's2-006',
    imageUrl: 'speaking/s2-006.jpg',
    questions: [
      'What can you see in the picture?',
      'Have you ever done this?',
      'Would you like to try it? Why or why not?',
    ],
    keywords: ['beach', 'sea', 'swimming', 'sand', 'holiday', 'travel'],
    tips: [
      '描述图片中的活动',
      '使用现在完成时（Have you ever...?）',
      '表达愿望（I would like to...）',
    ],
  },
  {
    id: 's2-007',
    imageUrl: 'speaking/s2-007.jpg',
    questions: [
      'What is the child doing?',
      'Do you like this hobby?',
      'How long have you been doing it?',
    ],
    keywords: ['reading', 'book', 'library', 'studying', 'hobby', 'interesting'],
    tips: [
      '描述人物正在做什么',
      '表达持续时间（for... years, since...）',
      '给出细节让回答更丰富',
    ],
  },
  {
    id: 's2-008',
    imageUrl: 'speaking/s2-008.jpg',
    questions: [
      'What is happening in the picture?',
      'Do you like animals?',
      'What is your favourite animal?',
    ],
    keywords: ['zoo', 'animal', 'monkey', 'elephant', 'tiger', 'funny'],
    tips: [
      '描述动物正在做什么',
      '使用形容词描述动物（big, small, funny）',
      '比较不同动物',
    ],
  },
  {
    id: 's2-009',
    imageUrl: 'speaking/s2-009.jpg',
    questions: [
      'What can you see in the picture?',
      'Do you celebrate this festival?',
      'What do you usually do?',
    ],
    keywords: ['birthday', 'party', 'cake', 'present', 'celebrate', 'happy'],
    tips: [
      '描述庆祝活动',
      '使用频率副词（always, usually, often）',
      '描述感受（excited, happy, surprised）',
    ],
  },
  {
    id: 's2-010',
    imageUrl: 'speaking/s2-010.jpg',
    questions: [
      'What is the problem in the picture?',
      'What should the person do?',
      'Have you ever had this problem?',
    ],
    keywords: ['shopping', 'busy', 'crowded', 'buying', 'market', 'supermarket'],
    tips: [
      '描述图片中的问题',
      '使用情态动词提出建议（should, could）',
      '分享个人经历',
    ],
  },
];
