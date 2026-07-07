// 生成 KET 阅读 Part 5 开放填空数据（20 篇 A2 级别短邮件/短信）
// 注入 src/data/reading.ts 的 part5Articles 空数组
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const articles = [
  {
    id: 'p5-001',
    title: 'A Birthday Party',
    titleZh: '生日派对',
    difficulty: 'easy',
    topic: '生日',
    passage:
`Hi Emma,

I am having a (1) ____ at my house this Saturday. It is my (2) ____ birthday and I will be twelve. The party (3) ____ at 3 o'clock in the afternoon. Please (4) ____ your favourite game to play with us. My mum will make a big chocolate (5) ____.

Hope to see you!
Lucy`,
    passageFull:
`Hi Emma,

I am having a party at my house this Saturday. It is my twelfth birthday and I will be twelve. The party starts at 3 o'clock in the afternoon. Please bring your favourite game to play with us. My mum will make a big chocolate cake.

Hope to see you!
Lucy`,
    blanks: [
      { id: 'p5-001-b1', position: 1, answer: 'party', hint: 'a fun time with friends', hintZh: '和朋友们一起玩的欢乐聚会', accept: ['celebration'] },
      { id: 'p5-001-b2', position: 2, answer: 'twelfth', hint: 'the number after eleven', hintZh: '十一之后的数字', accept: ['12th'] },
      { id: 'p5-001-b3', position: 3, answer: 'starts', hint: 'begins', hintZh: '开始', accept: ['begins'] },
      { id: 'p5-001-b4', position: 4, answer: 'bring', hint: 'take something with you', hintZh: '带上某物', accept: ['take'] },
      { id: 'p5-001-b5', position: 5, answer: 'cake', hint: 'a sweet food for birthdays', hintZh: '生日吃的甜点', accept: ['cake'] },
    ],
  },
  {
    id: 'p5-002',
    title: 'Holiday Postcard',
    titleZh: '度假明信片',
    difficulty: 'easy',
    topic: '度假',
    passage:
`Dear Sam,

We are in Spain on (1) ____! The weather is hot and (2) ____. Today we went to the (3) ____ and I swam in the sea. Tomorrow we will (4) ____ a big mountain. I bought you a (5) ____ from the shop.

See you next week!
Ben`,
    passageFull:
`Dear Sam,

We are in Spain on holiday! The weather is hot and sunny. Today we went to the beach and I swam in the sea. Tomorrow we will climb a big mountain. I bought you a present from the shop.

See you next week!
Ben`,
    blanks: [
      { id: 'p5-002-b1', position: 1, answer: 'holiday', hint: 'a time when you do not go to school or work', hintZh: '不上学或不上班的休息时间', accept: ['vacation'] },
      { id: 'p5-002-b2', position: 2, answer: 'sunny', hint: 'with a lot of sun', hintZh: '阳光充足', accept: ['fine', 'nice'] },
      { id: 'p5-002-b3', position: 3, answer: 'beach', hint: 'where the sea meets the land', hintZh: '大海与陆地相接处', accept: ['sea', 'coast'] },
      { id: 'p5-002-b4', position: 4, answer: 'climb', hint: 'go up', hintZh: '向上爬', accept: ['visit'] },
      { id: 'p5-002-b5', position: 5, answer: 'present', hint: 'something you give to a friend', hintZh: '送给朋友的礼物', accept: ['gift', 'souvenir'] },
    ],
  },
  {
    id: 'p5-003',
    title: 'School Reading Club',
    titleZh: '学校读书俱乐部',
    difficulty: 'easy',
    topic: '学校',
    passage:
`Hello,

Our school has a new (1) ____ club. We meet every (2) ____ after school. We read books and (3) ____ stories together. You do not need to (4) ____ anything. Just come and have (5) ____!

From the Club Leader`,
    passageFull:
`Hello,

Our school has a new reading club. We meet every Tuesday after school. We read books and write stories together. You do not need to bring anything. Just come and have fun!

From the Club Leader`,
    blanks: [
      { id: 'p5-003-b1', position: 1, answer: 'reading', hint: 'about books', hintZh: '和书有关', accept: ['book'] },
      { id: 'p5-003-b2', position: 2, answer: 'Tuesday', hint: 'a day of the week', hintZh: '一周中的某一天', accept: ['Monday', 'Wednesday', 'Thursday', 'Friday'] },
      { id: 'p5-003-b3', position: 3, answer: 'write', hint: 'make stories with words', hintZh: '用文字写故事', accept: ['tell'] },
      { id: 'p5-003-b4', position: 4, answer: 'bring', hint: 'take with you', hintZh: '随身带来', accept: ['take'] },
      { id: 'p5-003-b5', position: 5, answer: 'fun', hint: 'enjoy yourself', hintZh: '玩得开心', accept: ['fun'] },
    ],
  },
  {
    id: 'p5-004',
    title: 'My New Pet',
    titleZh: '我的新宠物',
    difficulty: 'easy',
    topic: '宠物',
    passage:
`Hi Mia,

I have a new (1) ____! It is a small dog and its (2) ____ is Cookie. It is very (3) ____ and likes to run. Every morning I (4) ____ it for a walk in the park. It eats (5) ____ and drinks water.

Love, Tom`,
    passageFull:
`Hi Mia,

I have a new pet! It is a small dog and its name is Cookie. It is very happy and likes to run. Every morning I take it for a walk in the park. It eats meat and drinks water.

Love, Tom`,
    blanks: [
      { id: 'p5-004-b1', position: 1, answer: 'pet', hint: 'an animal at home', hintZh: '家里养的动物', accept: ['dog', 'puppy'] },
      { id: 'p5-004-b2', position: 2, answer: 'name', hint: 'what we call it', hintZh: '我们叫它的称呼', accept: ['name'] },
      { id: 'p5-004-b3', position: 3, answer: 'happy', hint: 'feeling good', hintZh: '感觉很好', accept: ['cute', 'active', 'lovely'] },
      { id: 'p5-004-b4', position: 4, answer: 'take', hint: 'go with', hintZh: '带着去', accept: ['walk'] },
      { id: 'p5-004-b5', position: 5, answer: 'meat', hint: 'what dogs eat', hintZh: '狗吃的食物', accept: ['food', 'bones'] },
    ],
  },
  {
    id: 'p5-005',
    title: 'Shopping List',
    titleZh: '购物清单',
    difficulty: 'easy',
    topic: '购物',
    passage:
`Mum,

Can you (1) ____ me some things from the shop? We need (2) ____ for breakfast and some (3) ____ to drink. Also please get a (4) ____ of bread and three (5) ____.

Thanks! Anna`,
    passageFull:
`Mum,

Can you buy me some things from the shop? We need eggs for breakfast and some juice to drink. Also please get a loaf of bread and three apples.

Thanks! Anna`,
    blanks: [
      { id: 'p5-005-b1', position: 1, answer: 'buy', hint: 'pay for something', hintZh: '付钱买', accept: ['get', 'bring'] },
      { id: 'p5-005-b2', position: 2, answer: 'eggs', hint: 'food for the morning', hintZh: '早上吃的食物', accept: ['milk', 'cereal', 'bread'] },
      { id: 'p5-005-b3', position: 3, answer: 'juice', hint: 'something to drink', hintZh: '喝的东西', accept: ['water', 'milk', 'tea'] },
      { id: 'p5-005-b4', position: 4, answer: 'loaf', hint: 'a piece of bread', hintZh: '一条（面包的量词）', accept: ['piece', 'bag'] },
      { id: 'p5-005-b5', position: 5, answer: 'apples', hint: 'fruit', hintZh: '水果', accept: ['bananas', 'oranges', 'pears'] },
    ],
  },
  {
    id: 'p5-006',
    title: 'Sports Day',
    titleZh: '运动日',
    difficulty: 'medium',
    topic: '运动',
    passage:
`Dear friends,

Our school (1) ____ day is next Friday. I will (2) ____ in the 100-metre race. My best friend will play (3) ____. We hope to (4) ____ a medal. Please come and (5) ____ us!

Tom`,
    passageFull:
`Dear friends,

Our school sports day is next Friday. I will run in the 100-metre race. My best friend will play football. We hope to win a medal. Please come and watch us!

Tom`,
    blanks: [
      { id: 'p5-006-b1', position: 1, answer: 'sports', hint: 'about games and exercise', hintZh: '关于游戏和锻炼', accept: ['sport'] },
      { id: 'p5-006-b2', position: 2, answer: 'run', hint: 'move fast on feet', hintZh: '用脚快速移动', accept: ['take', 'compete', 'race'] },
      { id: 'p5-006-b3', position: 3, answer: 'football', hint: 'a ball game', hintZh: '一种球类运动', accept: ['basketball', 'tennis', 'volleyball'] },
      { id: 'p5-006-b4', position: 4, answer: 'win', hint: 'be the best', hintZh: '成为最好的', accept: ['get', 'earn'] },
      { id: 'p5-006-b5', position: 5, answer: 'watch', hint: 'look at a game', hintZh: '观看比赛', accept: ['support', 'cheer'] },
    ],
  },
  {
    id: 'p5-007',
    title: 'A Family Visit',
    titleZh: '家庭拜访',
    difficulty: 'easy',
    topic: '家庭',
    passage:
`Hi Grandma,

We are (1) ____ to see you on Sunday. Dad will (2) ____ the car and Mum will make sandwiches. My little (3) ____ wants to play in your garden. We will (4) ____ at about twelve o'clock. I cannot (5) ____ to see you!

Love, Lucy`,
    passageFull:
`Hi Grandma,

We are coming to see you on Sunday. Dad will drive the car and Mum will make sandwiches. My little brother wants to play in your garden. We will arrive at about twelve o'clock. I cannot wait to see you!

Love, Lucy`,
    blanks: [
      { id: 'p5-007-b1', position: 1, answer: 'coming', hint: 'moving toward', hintZh: '朝着某方向移动', accept: ['going'] },
      { id: 'p5-007-b2', position: 2, answer: 'drive', hint: 'control a car', hintZh: '驾驶汽车', accept: ['park'] },
      { id: 'p5-007-b3', position: 3, answer: 'brother', hint: 'a younger family member', hintZh: '年纪更小的家庭成员', accept: ['sister', 'son'] },
      { id: 'p5-007-b4', position: 4, answer: 'arrive', hint: 'get there', hintZh: '到达那里', accept: ['come'] },
      { id: 'p5-007-b5', position: 5, answer: 'wait', hint: 'be patient', hintZh: '耐心等候', accept: ['wait'] },
    ],
  },
  {
    id: 'p5-008',
    title: 'A Picnic',
    titleZh: '野餐',
    difficulty: 'easy',
    topic: '天气',
    passage:
`Hello class,

Tomorrow we will have a (1) ____ in the park. The weather will be (2) ____ and warm. Please (3) ____ some food with you. We will (4) ____ games on the grass. Do not (5) ____ if it rains!

Mr. Smith`,
    passageFull:
`Hello class,

Tomorrow we will have a picnic in the park. The weather will be sunny and warm. Please bring some food with you. We will play games on the grass. Do not worry if it rains!

Mr. Smith`,
    blanks: [
      { id: 'p5-008-b1', position: 1, answer: 'picnic', hint: 'eating outside', hintZh: '在户外吃东西', accept: ['picnic'] },
      { id: 'p5-008-b2', position: 2, answer: 'sunny', hint: 'good weather', hintZh: '好天气', accept: ['fine', 'nice', 'clear'] },
      { id: 'p5-008-b3', position: 3, answer: 'bring', hint: 'take along', hintZh: '随身带', accept: ['take'] },
      { id: 'p5-008-b4', position: 4, answer: 'play', hint: 'have fun with games', hintZh: '玩游戏找乐子', accept: ['play'] },
      { id: 'p5-008-b5', position: 5, answer: 'worry', hint: 'be afraid', hintZh: '害怕、发愁', accept: ['cry', 'fear'] },
    ],
  },
  {
    id: 'p5-009',
    title: 'At the Cinema',
    titleZh: '看电影',
    difficulty: 'medium',
    topic: '电影',
    passage:
`Hi Joe,

Do you want to see a (1) ____ with me on Saturday? It is a funny (2) ____ about a talking cat. The film (3) ____ at 4 p.m. Tickets (4) ____ £8 each. We can (5) ____ some popcorn too.

Ben`,
    passageFull:
`Hi Joe,

Do you want to see a film with me on Saturday? It is a funny story about a talking cat. The film starts at 4 p.m. Tickets cost £8 each. We can eat some popcorn too.

Ben`,
    blanks: [
      { id: 'p5-009-b1', position: 1, answer: 'film', hint: 'a story on a big screen', hintZh: '大屏幕上的故事', accept: ['movie'] },
      { id: 'p5-009-b2', position: 2, answer: 'story', hint: 'what the film is about', hintZh: '电影讲的内容', accept: ['movie', 'film', 'comedy'] },
      { id: 'p5-009-b3', position: 3, answer: 'starts', hint: 'begins', hintZh: '开始', accept: ['begins'] },
      { id: 'p5-009-b4', position: 4, answer: 'cost', hint: 'have a price', hintZh: '有价格', accept: ['are'] },
      { id: 'p5-009-b5', position: 5, answer: 'eat', hint: 'put in your mouth', hintZh: '放进嘴里', accept: ['buy', 'get', 'share'] },
    ],
  },
  {
    id: 'p5-010',
    title: 'At the Restaurant',
    titleZh: '在餐厅',
    difficulty: 'medium',
    topic: '餐饮',
    passage:
`Dear customer,

Welcome to our (1) ____! Today's special is chicken with (2) ____. We also have fresh (3) ____ and cold drinks. The (4) ____ is £10 for two people. Please (5) ____ a seat anywhere.

The Manager`,
    passageFull:
`Dear customer,

Welcome to our restaurant! Today's special is chicken with rice. We also have fresh salad and cold drinks. The price is £10 for two people. Please take a seat anywhere.

The Manager`,
    blanks: [
      { id: 'p5-010-b1', position: 1, answer: 'restaurant', hint: 'a place to eat', hintZh: '吃饭的地方', accept: ['cafe', 'diner'] },
      { id: 'p5-010-b2', position: 2, answer: 'rice', hint: 'food with the chicken', hintZh: '配鸡肉的食物', accept: ['vegetables', 'potatoes', 'chips'] },
      { id: 'p5-010-b3', position: 3, answer: 'salad', hint: 'a cold vegetable dish', hintZh: '一道冷的蔬菜菜', accept: ['soup', 'bread'] },
      { id: 'p5-010-b4', position: 4, answer: 'price', hint: 'how much money', hintZh: '多少钱', accept: ['cost'] },
      { id: 'p5-010-b5', position: 5, answer: 'take', hint: 'sit down', hintZh: '坐下', accept: ['choose'] },
    ],
  },
  {
    id: 'p5-011',
    title: 'Help With Chores',
    titleZh: '帮忙做家务',
    difficulty: 'easy',
    topic: '家务',
    passage:
`Tom,

Please (1) ____ your room before dinner. You must (2) ____ your clothes and (3) ____ the bed. Also, can you (4) ____ the dog outside? Mum will (5) ____ dinner at six.

Dad`,
    passageFull:
`Tom,

Please clean your room before dinner. You must fold your clothes and make the bed. Also, can you walk the dog outside? Mum will cook dinner at six.

Dad`,
    blanks: [
      { id: 'p5-011-b1', position: 1, answer: 'clean', hint: 'make tidy', hintZh: '弄整洁', accept: ['tidy'] },
      { id: 'p5-011-b2', position: 2, answer: 'fold', hint: 'put clothes neatly', hintZh: '把衣服叠整齐', accept: ['put'] },
      { id: 'p5-011-b3', position: 3, answer: 'make', hint: 'fix the bed', hintZh: '整理床铺', accept: ['make'] },
      { id: 'p5-011-b4', position: 4, answer: 'walk', hint: 'take the dog out', hintZh: '把狗带出去遛', accept: ['take'] },
      { id: 'p5-011-b5', position: 5, answer: 'cook', hint: 'make food', hintZh: '做食物', accept: ['make', 'prepare'] },
    ],
  },
  {
    id: 'p5-012',
    title: 'A Museum Trip',
    titleZh: '参观博物馆',
    difficulty: 'medium',
    topic: '博物馆',
    passage:
`Hi class,

We will visit the (1) ____ on Wednesday. We will see old (2) ____ from long ago. The bus (3) ____ at 9 a.m. Please do not (4) ____ late. Bring a (5) ____ to draw pictures.

Miss Lee`,
    passageFull:
`Hi class,

We will visit the museum on Wednesday. We will see old things from long ago. The bus leaves at 9 a.m. Please do not be late. Bring a pencil to draw pictures.

Miss Lee`,
    blanks: [
      { id: 'p5-012-b1', position: 1, answer: 'museum', hint: 'a building with old things', hintZh: '陈列旧物品的建筑', accept: ['museum'] },
      { id: 'p5-012-b2', position: 2, answer: 'things', hint: 'items to look at', hintZh: '可以观看的物品', accept: ['objects', 'art', 'paintings'] },
      { id: 'p5-012-b3', position: 3, answer: 'leaves', hint: 'goes away', hintZh: '开走、离开', accept: ['goes', 'departs'] },
      { id: 'p5-012-b4', position: 4, answer: 'be', hint: 'not on time', hintZh: '不准时', accept: ['arrive'] },
      { id: 'p5-012-b5', position: 5, answer: 'pencil', hint: 'to write or draw', hintZh: '用来写或画', accept: ['pen', 'notebook', 'crayon'] },
    ],
  },
  {
    id: 'p5-013',
    title: 'Computer Problem',
    titleZh: '电脑故障',
    difficulty: 'medium',
    topic: '科技',
    passage:
`Hi Dan,

My (1) ____ is not working. The (2) ____ is black and I cannot (3) ____ any words. Can you (4) ____ me, please? Maybe I need a new (5) ____.

Thanks, Eve`,
    passageFull:
`Hi Dan,

My computer is not working. The screen is black and I cannot type any words. Can you help me, please? Maybe I need a new cable.

Thanks, Eve`,
    blanks: [
      { id: 'p5-013-b1', position: 1, answer: 'computer', hint: 'a machine for work', hintZh: '用来工作的机器', accept: ['laptop', 'PC'] },
      { id: 'p5-013-b2', position: 2, answer: 'screen', hint: 'the front part you look at', hintZh: '你看着的前面部分', accept: ['monitor', 'display'] },
      { id: 'p5-013-b3', position: 3, answer: 'type', hint: 'put in letters', hintZh: '输入字母', accept: ['write', 'see'] },
      { id: 'p5-013-b4', position: 4, answer: 'help', hint: 'give a hand', hintZh: '搭把手', accept: ['fix', 'assist'] },
      { id: 'p5-013-b5', position: 5, answer: 'cable', hint: 'a part that connects', hintZh: '用于连接的部件', accept: ['keyboard', 'battery', 'wire'] },
    ],
  },
  {
    id: 'p5-014',
    title: 'A Music Concert',
    titleZh: '音乐会',
    difficulty: 'medium',
    topic: '音乐',
    passage:
`Hello fans,

Our (1) ____ will play at the park this Sunday. We will sing (2) ____ songs and play guitars. The (3) ____ is free for children. Please (4) ____ your friends! The show will (5) ____ at 7 p.m.

The Band`,
    passageFull:
`Hello fans,

Our band will play at the park this Sunday. We will sing new songs and play guitars. The concert is free for children. Please bring your friends! The show will start at 7 p.m.

The Band`,
    blanks: [
      { id: 'p5-014-b1', position: 1, answer: 'band', hint: 'a group of musicians', hintZh: '一群音乐家', accept: ['group'] },
      { id: 'p5-014-b2', position: 2, answer: 'new', hint: 'not old', hintZh: '不旧的', accept: ['happy', 'funny', 'popular'] },
      { id: 'p5-014-b3', position: 3, answer: 'concert', hint: 'the music event', hintZh: '音乐活动', accept: ['show', 'music', 'event'] },
      { id: 'p5-014-b4', position: 4, answer: 'bring', hint: 'ask them to come', hintZh: '叫他们来', accept: ['tell', 'invite'] },
      { id: 'p5-014-b5', position: 5, answer: 'start', hint: 'begin', hintZh: '开始', accept: ['begin'] },
    ],
  },
  {
    id: 'p5-015',
    title: 'Camping Trip',
    titleZh: '露营',
    difficulty: 'medium',
    topic: '户外',
    passage:
`Dear Sam,

We are going (1) ____ in the forest this weekend. We will sleep in a (2) ____ and cook food on a fire. Dad will (3) ____ wood and Mum will make tea. At night we will (4) ____ at the stars. I hope it does not (5) ____!

Ben`,
    passageFull:
`Dear Sam,

We are going camping in the forest this weekend. We will sleep in a tent and cook food on a fire. Dad will collect wood and Mum will make tea. At night we will look at the stars. I hope it does not rain!

Ben`,
    blanks: [
      { id: 'p5-015-b1', position: 1, answer: 'camping', hint: 'sleeping outside', hintZh: '在户外睡觉', accept: ['camping'] },
      { id: 'p5-015-b2', position: 2, answer: 'tent', hint: 'a cloth house', hintZh: '布做的房子', accept: ['tent'] },
      { id: 'p5-015-b3', position: 3, answer: 'collect', hint: 'gather', hintZh: '收集', accept: ['get', 'find', 'cut'] },
      { id: 'p5-015-b4', position: 4, answer: 'look', hint: 'use your eyes', hintZh: '用你的眼睛', accept: ['stare', 'watch'] },
      { id: 'p5-015-b5', position: 5, answer: 'rain', hint: 'water from the sky', hintZh: '从天上落下的水', accept: ['snow', 'storm'] },
    ],
  },
  {
    id: 'p5-016',
    title: 'At the Library',
    titleZh: '在图书馆',
    difficulty: 'medium',
    topic: '图书馆',
    passage:
`Hi Maria,

I (1) ____ a book from the library yesterday. It is about (2) ____ and space. You can (3) ____ it for two weeks. Please (4) ____ it back on time. The library (5) ____ at 6 p.m.

Anna`,
    passageFull:
`Hi Maria,

I borrowed a book from the library yesterday. It is about stars and space. You can keep it for two weeks. Please bring it back on time. The library closes at 6 p.m.

Anna`,
    blanks: [
      { id: 'p5-016-b1', position: 1, answer: 'borrowed', hint: 'took to read', hintZh: '借来读', accept: ['got', 'took'] },
      { id: 'p5-016-b2', position: 2, answer: 'stars', hint: 'things in the sky at night', hintZh: '夜晚天上的东西', accept: ['planets', 'space', 'science'] },
      { id: 'p5-016-b3', position: 3, answer: 'keep', hint: 'have it with you', hintZh: '留在你这儿', accept: ['have'] },
      { id: 'p5-016-b4', position: 4, answer: 'bring', hint: 'give it back', hintZh: '还回去', accept: ['return', 'give'] },
      { id: 'p5-016-b5', position: 5, answer: 'closes', hint: 'stops being open', hintZh: '停止营业', accept: ['shuts'] },
    ],
  },
  {
    id: 'p5-017',
    title: 'A Birthday Gift',
    titleZh: '生日礼物',
    difficulty: 'easy',
    topic: '礼物',
    passage:
`Hi Tom,

What (1) ____ do you want for your birthday? A (2) ____ to read, or a new (3) ____ for your bike? Maybe a (4) ____ game to play? Tell me and I will (5) ____ it for you.

Mum`,
    passageFull:
`Hi Tom,

What present do you want for your birthday? A book to read, or a new helmet for your bike? Maybe a computer game to play? Tell me and I will buy it for you.

Mum`,
    blanks: [
      { id: 'p5-017-b1', position: 1, answer: 'present', hint: 'a gift', hintZh: '礼物', accept: ['gift', 'thing'] },
      { id: 'p5-017-b2', position: 2, answer: 'book', hint: 'to read', hintZh: '用来读', accept: ['book'] },
      { id: 'p5-017-b3', position: 3, answer: 'helmet', hint: 'safety for biking', hintZh: '骑车时的安全装备', accept: ['light', 'bell'] },
      { id: 'p5-017-b4', position: 4, answer: 'computer', hint: 'something to play', hintZh: '用来玩的东西', accept: ['video', 'board'] },
      { id: 'p5-017-b5', position: 5, answer: 'buy', hint: 'pay for', hintZh: '付钱买', accept: ['get'] },
    ],
  },
  {
    id: 'p5-018',
    title: 'At the Bus Stop',
    titleZh: '在公交站',
    difficulty: 'medium',
    topic: '交通',
    passage:
`Excuse me,

Which (1) ____ goes to the station? I need to (2) ____ the 10 o'clock train. The (3) ____ is across the road. Can I (4) ____ here, or must I (5) ____?

A tourist`,
    passageFull:
`Excuse me,

Which bus goes to the station? I need to catch the 10 o'clock train. The station is across the road. Can I wait here, or must I walk?

A tourist`,
    blanks: [
      { id: 'p5-018-b1', position: 1, answer: 'bus', hint: 'a big road vehicle', hintZh: '路上跑的大型车辆', accept: ['train', 'tram'] },
      { id: 'p5-018-b2', position: 2, answer: 'catch', hint: 'get on', hintZh: '赶上、登上', accept: ['take', 'meet'] },
      { id: 'p5-018-b3', position: 3, answer: 'station', hint: 'where trains stop', hintZh: '火车停靠的地方', accept: ['stop'] },
      { id: 'p5-018-b4', position: 4, answer: 'wait', hint: 'stay here', hintZh: '待在这儿', accept: ['stop', 'stand'] },
      { id: 'p5-018-b5', position: 5, answer: 'walk', hint: 'go on foot', hintZh: '步行去', accept: ['pay', 'run'] },
    ],
  },
  {
    id: 'p5-019',
    title: 'Cooking Pasta',
    titleZh: '煮意面',
    difficulty: 'medium',
    topic: '烹饪',
    passage:
`Hi Sue,

I am (1) ____ pasta for dinner. First, (2) ____ water in a pot. Then (3) ____ the pasta in for ten minutes. Next, (4) ____ some cheese on top. Finally, (5) ____ it with your family!

Cook`,
    passageFull:
`Hi Sue,

I am cooking pasta for dinner. First, boil water in a pot. Then put the pasta in for ten minutes. Next, put some cheese on top. Finally, eat it with your family!

Cook`,
    blanks: [
      { id: 'p5-019-b1', position: 1, answer: 'cooking', hint: 'making food', hintZh: '做食物', accept: ['making'] },
      { id: 'p5-019-b2', position: 2, answer: 'boil', hint: 'make water hot', hintZh: '把水加热', accept: ['heat', 'put'] },
      { id: 'p5-019-b3', position: 3, answer: 'put', hint: 'place inside', hintZh: '放进去', accept: ['drop', 'add'] },
      { id: 'p5-019-b4', position: 4, answer: 'put', hint: 'add on top', hintZh: '加在上面', accept: ['sprinkle', 'add'] },
      { id: 'p5-019-b5', position: 5, answer: 'eat', hint: 'have the food', hintZh: '吃这食物', accept: ['share', 'enjoy'] },
    ],
  },
  {
    id: 'p5-020',
    title: 'A Penfriend Letter',
    titleZh: '笔友信',
    difficulty: 'easy',
    topic: '交友',
    passage:
`Dear Alex,

I am happy to be your (1) ____ friend. I live in a small (2) ____ near the sea. My (3) ____ is playing football. What are your (4) ____? Please write (5) ____ to me soon.

Your friend, Kim`,
    passageFull:
`Dear Alex,

I am happy to be your pen friend. I live in a small town near the sea. My hobby is playing football. What are your hobbies? Please write back to me soon.

Your friend, Kim`,
    blanks: [
      { id: 'p5-020-b1', position: 1, answer: 'pen', hint: 'a friend you write to', hintZh: '你写信交流的朋友', accept: ['new', 'good'] },
      { id: 'p5-020-b2', position: 2, answer: 'town', hint: 'a place where people live', hintZh: '人们居住的地方', accept: ['city', 'village'] },
      { id: 'p5-020-b3', position: 3, answer: 'hobby', hint: 'something you like doing', hintZh: '你喜欢做的事', accept: ['sport', 'interest'] },
      { id: 'p5-020-b4', position: 4, answer: 'hobbies', hint: 'the things you like', hintZh: '你喜欢的事物', accept: ['interests'] },
      { id: 'p5-020-b5', position: 5, answer: 'back', hint: 'in reply', hintZh: '作为回复', accept: ['soon', 'again'] },
    ],
  },
];

function emit(a) {
  const blanks = a.blanks.map(b => {
    let s = `      { id: ${JSON.stringify(b.id)}, position: ${b.position}, answer: ${JSON.stringify(b.answer)}, hint: ${JSON.stringify(b.hint)}, hintZh: ${JSON.stringify(b.hintZh)}`;
    if (b.accept && b.accept.length) s += `, accept: [${b.accept.map(x => JSON.stringify(x)).join(', ')}]`;
    s += ' },';
    return s;
  }).join('\n');
  return `  {
    id: ${JSON.stringify(a.id)},
    title: ${JSON.stringify(a.title)},
    titleZh: ${JSON.stringify(a.titleZh)},
    difficulty: ${JSON.stringify(a.difficulty)},
    topic: ${JSON.stringify(a.topic)},
    passage: ${JSON.stringify(a.passage)},
    passageFull: ${JSON.stringify(a.passageFull)},
    blanks: [
${blanks}
    ],
  },`;
}

const body = articles.map(emit).join('\n');

const path = fileURLToPath(new URL('../src/data/reading.ts', import.meta.url));
const file = readFileSync(path, 'utf8');
const startMarker = 'export const part5Articles: Part5Article[] = [';
const si = file.indexOf(startMarker);
if (si < 0) { console.error('找不到 part5Articles 起始标志'); process.exit(1); }
const endIdx = file.indexOf('\n];', si);
if (endIdx < 0) { console.error('找不到 part5Articles 结束标志'); process.exit(1); }

const newBlock = startMarker + '\n\n' + body + '\n\n];';
const newFile = file.slice(0, si) + newBlock + file.slice(endIdx + '\n];'.length);
writeFileSync(path, newFile, 'utf8');
console.log(`OK: 已写入 ${articles.length} 篇 Part 5 文章`);
