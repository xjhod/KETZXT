import * as fs from 'node:fs';

type Blank = {
  position: number;
  answer: string;
  hint: string;
  hintZh: string;
  accept?: string[];
};
type Article = {
  id: string;
  title: string;
  titleZh: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  passage: string;
  passageFull: string;
  blanks: Blank[];
};

const A: Article[] = [
  {
    id: 'p5-001', title: 'A Birthday Party', titleZh: '生日派对', difficulty: 'easy', topic: '生日',
    passage: 'Hi Emma,\n\nI am having a (1) ____ at my house this Saturday. It is my (2) ____ birthday and I will be twelve. The party (3) ____ at 3 o\'clock in the afternoon. Please (4) ____ your favourite game to play with us. My mum will make a big chocolate (5) ____. We will also (6) ____ music and dance. My dad is going to (7) ____ some photos. I hope you can (8) ____. There will be (9) ____ of food and drinks. It will be a really (10) ____ day!\n\nHope to see you!\nLucy',
    passageFull: 'Hi Emma,\n\nI am having a party at my house this Saturday. It is my twelfth birthday and I will be twelve. The party starts at 3 o\'clock in the afternoon. Please bring your favourite game to play with us. My mum will make a big chocolate cake. We will also play music and dance. My dad is going to take some photos. I hope you can come. There will be lots of food and drinks. It will be a really happy day!\n\nHope to see you!\nLucy',
    blanks: [
      { position: 1, answer: 'party', hint: 'a fun time with friends', hintZh: '和朋友们一起玩的欢乐聚会', accept: ['celebration'] },
      { position: 2, answer: 'twelfth', hint: 'the number after eleven', hintZh: '十一之后的数字', accept: ['12th'] },
      { position: 3, answer: 'starts', hint: 'begins', hintZh: '开始', accept: ['begins'] },
      { position: 4, answer: 'bring', hint: 'take something with you', hintZh: '带上某物', accept: ['take'] },
      { position: 5, answer: 'cake', hint: 'a sweet food for birthdays', hintZh: '生日吃的甜点' },
      { position: 6, answer: 'play', hint: 'make sound with instruments', hintZh: '演奏乐器发出声音', accept: ['listen'] },
      { position: 7, answer: 'take', hint: 'make a picture with a camera', hintZh: '用相机拍照', accept: ['make'] },
      { position: 8, answer: 'come', hint: 'move towards here', hintZh: '朝这里过来' },
      { position: 9, answer: 'lots', hint: 'a large amount', hintZh: '大量的', accept: ['plenty'] },
      { position: 10, answer: 'happy', hint: 'feeling good', hintZh: '感觉很好', accept: ['fun', 'good'] },
    ],
  },
  {
    id: 'p5-002', title: 'Holiday Postcard', titleZh: '度假明信片', difficulty: 'easy', topic: '度假',
    passage: 'Dear Sam,\n\nWe are in Spain on (1) ____! The weather is hot and (2) ____. Today we went to the (3) ____ and I swam in the sea. Tomorrow we will (4) ____ a big mountain. I bought you a (5) ____ from the shop. The food here is very (6) ____. We are staying in a small (7) ____ near the water. In the evening we (8) ____ dinner outside. I (9) ____ postcards to my friends. I do not want to (10) ____ home!\n\nSee you next week!\nBen',
    passageFull: 'Dear Sam,\n\nWe are in Spain on holiday! The weather is hot and sunny. Today we went to the beach and I swam in the sea. Tomorrow we will climb a big mountain. I bought you a present from the shop. The food here is very good. We are staying in a small hotel near the water. In the evening we eat dinner outside. I send postcards to my friends. I do not want to go home!\n\nSee you next week!\nBen',
    blanks: [
      { position: 1, answer: 'holiday', hint: 'a time when you do not work or study', hintZh: '不上学或不上班的休息时光', accept: ['vacation'] },
      { position: 2, answer: 'sunny', hint: 'with a lot of sun', hintZh: '阳光充足', accept: ['fine', 'nice'] },
      { position: 3, answer: 'beach', hint: 'where the sea meets the land', hintZh: '大海与陆地相接处', accept: ['sea', 'coast'] },
      { position: 4, answer: 'climb', hint: 'go up a high place', hintZh: '向上攀登', accept: ['visit'] },
      { position: 5, answer: 'present', hint: 'something you give to a friend', hintZh: '送给朋友的礼物', accept: ['gift', 'souvenir'] },
      { position: 6, answer: 'good', hint: 'nice to eat', hintZh: '好吃', accept: ['nice', 'tasty'] },
      { position: 7, answer: 'hotel', hint: 'a place to sleep when travelling', hintZh: '旅行时住的地方', accept: ['house'] },
      { position: 8, answer: 'eat', hint: 'have a meal', hintZh: '吃饭', accept: ['have'] },
      { position: 9, answer: 'send', hint: 'post to someone', hintZh: '寄给某人', accept: ['write'] },
      { position: 10, answer: 'go', hint: 'leave for home', hintZh: '动身回家', accept: ['return'] },
    ],
  },
  {
    id: 'p5-003', title: 'School Reading Club', titleZh: '学校读书俱乐部', difficulty: 'easy', topic: '学校',
    passage: 'Hello,\n\nOur school has a new (1) ____ club. We meet every (2) ____ after school. We read books and (3) ____ stories together. You do not need to (4) ____ anything. Just come and have (5) ____! Our teacher brings a (6) ____ of books each week. We also (7) ____ about our favourite characters. Last week we made a (8) ____ poster. New members are always (9) ____. Please (10) ____ us on Monday!\n\nFrom the Club Leader',
    passageFull: 'Hello,\n\nOur school has a new reading club. We meet every Tuesday after school. We read books and write stories together. You do not need to bring anything. Just come and have fun! Our teacher brings a box of books each week. We also talk about our favourite characters. Last week we made a big poster. New members are always welcome. Please join us on Monday!\n\nFrom the Club Leader',
    blanks: [
      { position: 1, answer: 'reading', hint: 'about books', hintZh: '和书有关', accept: ['book'] },
      { position: 2, answer: 'Tuesday', hint: 'a day of the week', hintZh: '一周中的某一天', accept: ['Monday', 'Wednesday'] },
      { position: 3, answer: 'write', hint: 'make stories with words', hintZh: '用文字写故事', accept: ['tell'] },
      { position: 4, answer: 'bring', hint: 'take with you', hintZh: '随身带来', accept: ['take'] },
      { position: 5, answer: 'fun', hint: 'enjoy yourself', hintZh: '玩得开心' },
      { position: 6, answer: 'box', hint: 'a container for books', hintZh: '装书用的容器', accept: ['bag'] },
      { position: 7, answer: 'talk', hint: 'speak about', hintZh: '谈论', accept: ['speak'] },
      { position: 8, answer: 'big', hint: 'large', hintZh: '大的', accept: ['nice'] },
      { position: 9, answer: 'welcome', hint: 'glad to have you', hintZh: '乐意接纳', accept: ['happy'] },
      { position: 10, answer: 'join', hint: 'become part of', hintZh: '加入', accept: ['meet'] },
    ],
  },
  {
    id: 'p5-004', title: 'My New Pet', titleZh: '我的新宠物', difficulty: 'easy', topic: '宠物',
    passage: 'Hi Mia,\n\nI have a new (1) ____! It is a small dog and its (2) ____ is Cookie. It is very (3) ____ and likes to run. Every morning I (4) ____ it for a walk in the park. It eats (5) ____ and drinks water. Cookie likes to (6) ____ with a red ball. In the evening it (7) ____ next to me. It is not (8) ____ because it is young. My family (9) ____ Cookie very much. I am (10) ____ to have a pet!\n\nLove, Tom',
    passageFull: 'Hi Mia,\n\nI have a new pet! It is a small dog and its name is Cookie. It is very happy and likes to run. Every morning I take it for a walk in the park. It eats meat and drinks water. Cookie likes to play with a red ball. In the evening it sleeps next to me. It is not noisy because it is young. My family loves Cookie very much. I am happy to have a pet!\n\nLove, Tom',
    blanks: [
      { position: 1, answer: 'pet', hint: 'an animal at home', hintZh: '家里养的动物', accept: ['dog', 'puppy'] },
      { position: 2, answer: 'name', hint: 'what we call it', hintZh: '我们叫它的称呼' },
      { position: 3, answer: 'happy', hint: 'feeling good', hintZh: '感觉很好', accept: ['cute', 'lovely'] },
      { position: 4, answer: 'take', hint: 'go with', hintZh: '带着去', accept: ['walk'] },
      { position: 5, answer: 'meat', hint: 'what dogs eat', hintZh: '狗吃的食物', accept: ['food'] },
      { position: 6, answer: 'play', hint: 'have fun', hintZh: '玩耍' },
      { position: 7, answer: 'sleeps', hint: 'rests with eyes closed', hintZh: '闭眼休息', accept: ['sits'] },
      { position: 8, answer: 'noisy', hint: 'making loud sound', hintZh: '吵闹的', accept: ['loud'] },
      { position: 9, answer: 'loves', hint: 'likes a lot', hintZh: '非常喜欢', accept: ['likes'] },
      { position: 10, answer: 'happy', hint: 'pleased', hintZh: '开心的', accept: ['glad'] },
    ],
  },
  {
    id: 'p5-005', title: 'Shopping List', titleZh: '购物清单', difficulty: 'easy', topic: '购物',
    passage: 'Mum,\n\nCan you (1) ____ me some things from the shop? We need (2) ____ for breakfast and some (3) ____ to drink. Also please get a (4) ____ of bread and three (5) ____. Dad wants some (6) ____ for his tea. Do not (7) ____ any sweets for my brother! We also need a (8) ____ of milk. The shop (9) ____ at eight o\'clock, so please go (10) ____.\n\nThanks! Anna',
    passageFull: 'Mum,\n\nCan you buy me some things from the shop? We need eggs for breakfast and some juice to drink. Also please get a loaf of bread and three apples. Dad wants some biscuits for his tea. Do not buy any sweets for my brother! We also need a bottle of milk. The shop closes at eight o\'clock, so please go early.\n\nThanks! Anna',
    blanks: [
      { position: 1, answer: 'buy', hint: 'pay for something', hintZh: '付钱买', accept: ['get', 'bring'] },
      { position: 2, answer: 'eggs', hint: 'food for the morning', hintZh: '早上吃的食物', accept: ['milk', 'cereal'] },
      { position: 3, answer: 'juice', hint: 'something to drink', hintZh: '喝的东西', accept: ['water', 'milk'] },
      { position: 4, answer: 'loaf', hint: 'a piece of bread', hintZh: '一条（面包的量词）', accept: ['piece', 'bag'] },
      { position: 5, answer: 'apples', hint: 'a kind of fruit', hintZh: '一种水果', accept: ['bananas', 'oranges'] },
      { position: 6, answer: 'biscuits', hint: 'dry sweet food', hintZh: '干的甜点', accept: ['cakes'] },
      { position: 7, answer: 'buy', hint: 'get from the shop', hintZh: '从店里买', accept: ['get'] },
      { position: 8, answer: 'bottle', hint: 'container for liquid', hintZh: '装液体的容器', accept: ['carton'] },
      { position: 9, answer: 'closes', hint: 'stops being open', hintZh: '停止营业', accept: ['shuts'] },
      { position: 10, answer: 'early', hint: 'before late', hintZh: '早一点', accept: ['soon'] },
    ],
  },
  {
    id: 'p5-006', title: 'Sports Day', titleZh: '运动日', difficulty: 'easy', topic: '运动',
    passage: 'Dear friends,\n\nOur school (1) ____ day is next Friday. I will (2) ____ in the 100-metre race. My best friend will play (3) ____. We hope to (4) ____ a medal. Please come and (5) ____ us! The day will (6) ____ at nine o\'clock. There will be many (7) ____ games. Our teacher will (8) ____ photos. We can (9) ____ orange juice after the race. I feel very (10) ____ about it!\n\nTom',
    passageFull: 'Dear friends,\n\nOur school sports day is next Friday. I will run in the 100-metre race. My best friend will play football. We hope to win a medal. Please come and watch us! The day will start at nine o\'clock. There will be many fun games. Our teacher will take photos. We can drink orange juice after the race. I feel very happy about it!\n\nTom',
    blanks: [
      { position: 1, answer: 'sports', hint: 'about games and exercise', hintZh: '关于游戏和锻炼', accept: ['sport'] },
      { position: 2, answer: 'run', hint: 'move fast on feet', hintZh: '用脚快速移动', accept: ['race', 'compete'] },
      { position: 3, answer: 'football', hint: 'a ball game', hintZh: '一种球类运动', accept: ['basketball'] },
      { position: 4, answer: 'win', hint: 'be the best', hintZh: '成为最好的', accept: ['get'] },
      { position: 5, answer: 'watch', hint: 'look at a game', hintZh: '观看比赛', accept: ['cheer', 'support'] },
      { position: 6, answer: 'start', hint: 'begin', hintZh: '开始', accept: ['begin'] },
      { position: 7, answer: 'fun', hint: 'enjoyable', hintZh: '好玩的', accept: ['nice'] },
      { position: 8, answer: 'take', hint: 'make a picture', hintZh: '拍照', accept: ['make'] },
      { position: 9, answer: 'drink', hint: 'have a liquid', hintZh: '喝', accept: ['have'] },
      { position: 10, answer: 'happy', hint: 'pleased', hintZh: '开心的', accept: ['excited'] },
    ],
  },
  {
    id: 'p5-007', title: 'A Family Visit', titleZh: '家庭拜访', difficulty: 'easy', topic: '家庭',
    passage: 'Hi Grandma,\n\nWe are (1) ____ to see you on Sunday. Dad will (2) ____ the car and Mum will make sandwiches. My little (3) ____ wants to play in your garden. We will (4) ____ at about twelve o\'clock. I cannot (5) ____ to see you! We will (6) ____ your favourite cake too. The (7) ____ is sunny, so we can sit outside. My brother will (8) ____ his toy car. Please (9) ____ the kettle on! I will (10) ____ you a picture I drew.\n\nLove, Lucy',
    passageFull: 'Hi Grandma,\n\nWe are coming to see you on Sunday. Dad will drive the car and Mum will make sandwiches. My little brother wants to play in your garden. We will arrive at about twelve o\'clock. I cannot wait to see you! We will bring your favourite cake too. The weather is sunny, so we can sit outside. My brother will bring his toy car. Please put the kettle on! I will show you a picture I drew.\n\nLove, Lucy',
    blanks: [
      { position: 1, answer: 'coming', hint: 'moving toward', hintZh: '朝着某方向移动', accept: ['going'] },
      { position: 2, answer: 'drive', hint: 'control a car', hintZh: '驾驶汽车', accept: ['take'] },
      { position: 3, answer: 'brother', hint: 'a younger family member', hintZh: '年纪更小的家庭成员', accept: ['sister'] },
      { position: 4, answer: 'arrive', hint: 'get there', hintZh: '到达那里', accept: ['come'] },
      { position: 5, answer: 'wait', hint: 'be patient', hintZh: '耐心等候' },
      { position: 6, answer: 'bring', hint: 'take with us', hintZh: '随身带来', accept: ['take'] },
      { position: 7, answer: 'weather', hint: 'sun or rain outside', hintZh: '外面的天气' },
      { position: 8, answer: 'bring', hint: 'carry along', hintZh: '带去', accept: ['take'] },
      { position: 9, answer: 'put', hint: 'place something', hintZh: '放上', accept: ['switch'] },
      { position: 10, answer: 'show', hint: 'let someone see', hintZh: '给某人看', accept: ['give'] },
    ],
  },
  {
    id: 'p5-008', title: 'A Picnic', titleZh: '野餐', difficulty: 'medium', topic: '天气',
    passage: 'Last Sunday we (1) ____ a picnic in the park. The sun was (2) ____ and the sky was blue. We (3) ____ a big basket with sandwiches and fruit. My sister (4) ____ a red blanket on the grass. We (5) ____ under a tall tree. After lunch we (6) ____ a ball game. Some ducks (7) ____ to us from the lake. We (8) ____ them some bread. Later it (9) ____ to rain, so we went (10) ____.\n\nIt was a lovely day.',
    passageFull: 'Last Sunday we had a picnic in the park. The sun was shining and the sky was blue. We packed a big basket with sandwiches and fruit. My sister put a red blanket on the grass. We sat under a tall tree. After lunch we played a ball game. Some ducks came to us from the lake. We gave them some bread. Later it started to rain, so we went home.\n\nIt was a lovely day.',
    blanks: [
      { position: 1, answer: 'had', hint: 'took part in', hintZh: '进行了', accept: ['made'] },
      { position: 2, answer: 'shining', hint: 'giving bright light', hintZh: '发亮', accept: ['bright'] },
      { position: 3, answer: 'packed', hint: 'put food in', hintZh: '把食物装进', accept: ['brought'] },
      { position: 4, answer: 'put', hint: 'placed down', hintZh: '放下', accept: ['placed'] },
      { position: 5, answer: 'sat', hint: 'rested on the ground', hintZh: '坐在地上', accept: ['ate'] },
      { position: 6, answer: 'played', hint: 'did a game', hintZh: '玩游戏', accept: ['had'] },
      { position: 7, answer: 'came', hint: 'moved toward us', hintZh: '朝我们走来', accept: ['walked'] },
      { position: 8, answer: 'gave', hint: 'handed over', hintZh: '递给', accept: ['fed'] },
      { position: 9, answer: 'started', hint: 'began', hintZh: '开始', accept: ['began'] },
      { position: 10, answer: 'home', hint: 'back to the house', hintZh: '回家', accept: ['inside'] },
    ],
  },
  {
    id: 'p5-009', title: 'My School Day', titleZh: '我的校园一天', difficulty: 'medium', topic: '学校',
    passage: 'I (1) ____ up at seven o\'clock every day. I (2) ____ my teeth and have breakfast. Then I (3) ____ to school by bus. Lessons (4) ____ at nine. My favourite (5) ____ is science. At twelve we (6) ____ lunch in the hall. In the afternoon we (7) ____ sport or art. I (8) ____ home at four. After dinner I (9) ____ my homework. Then I (10) ____ TV before bed.',
    passageFull: 'I get up at seven o\'clock every day. I brush my teeth and have breakfast. Then I go to school by bus. Lessons start at nine. My favourite subject is science. At twelve we eat lunch in the hall. In the afternoon we play sport or art. I return home at four. After dinner I do my homework. Then I watch TV before bed.',
    blanks: [
      { position: 1, answer: 'get', hint: 'rise from bed', hintZh: '起床' },
      { position: 2, answer: 'brush', hint: 'clean with a brush', hintZh: '用刷子清洁', accept: ['clean'] },
      { position: 3, answer: 'go', hint: 'travel to', hintZh: '去', accept: ['travel'] },
      { position: 4, answer: 'start', hint: 'begin', hintZh: '开始', accept: ['begin'] },
      { position: 5, answer: 'subject', hint: 'a school lesson', hintZh: '一门课', accept: ['class'] },
      { position: 6, answer: 'eat', hint: 'have a meal', hintZh: '吃饭', accept: ['have'] },
      { position: 7, answer: 'play', hint: 'do an activity', hintZh: '进行活动', accept: ['do'] },
      { position: 8, answer: 'return', hint: 'come back', hintZh: '返回', accept: ['go', 'come'] },
      { position: 9, answer: 'do', hint: 'finish work', hintZh: '完成', accept: ['finish'] },
      { position: 10, answer: 'watch', hint: 'look at a screen', hintZh: '看', accept: ['see'] },
    ],
  },
  {
    id: 'p5-010', title: 'A Rainy Day', titleZh: '雨天', difficulty: 'medium', topic: '天气',
    passage: 'It was a (1) ____ morning and it rained all day. I (2) ____ indoors and read a book. My cat (3) ____ on the sofa next to me. The wind (4) ____ the trees outside. Mum (5) ____ a hot soup for lunch. I (6) ____ my friend Lily on the phone. We (7) ____ to meet at the weekend. In the evening the rain (8) ____ and the stars came (9) ____. I felt (10) ____ and ready for bed.',
    passageFull: 'It was a cold morning and it rained all day. I stayed indoors and read a book. My cat slept on the sofa next to me. The wind moved the trees outside. Mum made a hot soup for lunch. I called my friend Lily on the phone. We decided to meet at the weekend. In the evening the rain stopped and the stars came out. I felt calm and ready for bed.',
    blanks: [
      { position: 1, answer: 'cold', hint: 'low temperature', hintZh: '低温', accept: ['grey'] },
      { position: 2, answer: 'stayed', hint: 'remained', hintZh: '待在', accept: ['sat'] },
      { position: 3, answer: 'slept', hint: 'rested with eyes shut', hintZh: '闭眼休息', accept: ['sat'] },
      { position: 4, answer: 'moved', hint: 'made shake', hintZh: '使摇动', accept: ['shook'] },
      { position: 5, answer: 'made', hint: 'cooked', hintZh: '做了（食物）', accept: ['cooked'] },
      { position: 6, answer: 'called', hint: 'phoned', hintZh: '打电话', accept: ['phoned'] },
      { position: 7, answer: 'decided', hint: 'made a plan', hintZh: '决定', accept: ['planned'] },
      { position: 8, answer: 'stopped', hint: 'ended', hintZh: '停下', accept: ['ended'] },
      { position: 9, answer: 'out', hint: 'appeared in the sky', hintZh: '出现在天空', accept: ['up'] },
      { position: 10, answer: 'calm', hint: 'peaceful', hintZh: '平静的', accept: ['tired', 'happy'] },
    ],
  },
  {
    id: 'p5-011', title: 'My Favourite Sport', titleZh: '我最喜欢的运动', difficulty: 'medium', topic: '运动',
    passage: 'My favourite sport is (1) ____ because it is fast and fun. I (2) ____ twice a week at the sports centre. You need a (3) ____ and a racket to play. My coach (4) ____ us new skills every lesson. Last month our (5) ____ won a small competition. It is important to (6) ____ a lot of water. I also (7) ____ watching matches on TV. My dream is to (8) ____ a famous player one day. Sport (9) ____ me strong and happy. I (10) ____ everyone should try it!',
    passageFull: 'My favourite sport is tennis because it is fast and fun. I practise twice a week at the sports centre. You need a ball and a racket to play. My coach teaches us new skills every lesson. Last month our team won a small competition. It is important to drink a lot of water. I also enjoy watching matches on TV. My dream is to become a famous player one day. Sport keeps me strong and happy. I think everyone should try it!',
    blanks: [
      { position: 1, answer: 'tennis', hint: 'a racket game', hintZh: '一种球拍运动', accept: ['football', 'swimming'] },
      { position: 2, answer: 'practise', hint: 'train regularly', hintZh: '定期训练', accept: ['train', 'play'] },
      { position: 3, answer: 'ball', hint: 'round thing you hit', hintZh: '用来打的圆形物' },
      { position: 4, answer: 'teaches', hint: 'shows how', hintZh: '教', accept: ['shows'] },
      { position: 5, answer: 'team', hint: 'a group of players', hintZh: '一队选手', accept: ['class'] },
      { position: 6, answer: 'drink', hint: 'take liquid', hintZh: '喝', accept: ['take'] },
      { position: 7, answer: 'enjoy', hint: 'like doing', hintZh: '喜欢做', accept: ['like'] },
      { position: 8, answer: 'become', hint: 'grow into', hintZh: '成为', accept: ['be'] },
      { position: 9, answer: 'keeps', hint: 'makes stay', hintZh: '使保持', accept: ['makes'] },
      { position: 10, answer: 'think', hint: 'believe', hintZh: '认为', accept: ['believe'] },
    ],
  },
  {
    id: 'p5-012', title: 'Cooking with Mum', titleZh: '和妈妈做饭', difficulty: 'medium', topic: '食物',
    passage: 'Yesterday I (1) ____ biscuits with my mum. First we (2) ____ the oven to 180 degrees. Then we (3) ____ flour, sugar and butter in a bowl. Mum (4) ____ an egg and some milk. We (5) ____ the mixture with a spoon. Next we (6) ____ small balls on a tray. The biscuits (7) ____ for ten minutes. They (8) ____ golden and smelled good. We (9) ____ them to cool, then ate one. It was the (10) ____ biscuit I ever made!',
    passageFull: 'Yesterday I made biscuits with my mum. First we turned the oven to 180 degrees. Then we mixed flour, sugar and butter in a bowl. Mum added an egg and some milk. We stirred the mixture with a spoon. Next we put small balls on a tray. The biscuits baked for ten minutes. They looked golden and smelled good. We left them to cool, then ate one. It was the best biscuit I ever made!',
    blanks: [
      { position: 1, answer: 'made', hint: 'created by cooking', hintZh: '通过烹饪做成', accept: ['cooked', 'baked'] },
      { position: 2, answer: 'turned', hint: 'set to a level', hintZh: '调到某个档位', accept: ['set'] },
      { position: 3, answer: 'mixed', hint: 'combined together', hintZh: '混合在一起', accept: ['put'] },
      { position: 4, answer: 'added', hint: 'put in', hintZh: '加入', accept: ['put'] },
      { position: 5, answer: 'stirred', hint: 'moved with a spoon', hintZh: '用勺搅动', accept: ['mixed'] },
      { position: 6, answer: 'put', hint: 'placed', hintZh: '放置', accept: ['placed'] },
      { position: 7, answer: 'baked', hint: 'cooked in oven', hintZh: '在烤箱里烤', accept: ['cooked'] },
      { position: 8, answer: 'looked', hint: 'appeared', hintZh: '看起来', accept: ['turned'] },
      { position: 9, answer: 'left', hint: 'let stay', hintZh: '让保持', accept: ['let'] },
      { position: 10, answer: 'best', hint: 'better than all', hintZh: '最好的', accept: ['nicest'] },
    ],
  },
  {
    id: 'p5-013', title: 'A School Trip', titleZh: '学校郊游', difficulty: 'medium', topic: '学校',
    passage: 'Last week our class (1) ____ on a trip to the museum. We (2) ____ the bus at nine o\'clock. The museum was very (3) ____ and old. A guide (4) ____ us about the dinosaurs. I (5) ____ a picture of a big bone. We (6) ____ our sandwiches in the garden. My friend (7) ____ his ticket, but the teacher helped. We (8) ____ the shop and bought postcards. On the way (9) ____ we sang songs. It was a (10) ____ day for everyone.',
    passageFull: 'Last week our class went on a trip to the museum. We caught the bus at nine o\'clock. The museum was very large and old. A guide told us about the dinosaurs. I drew a picture of a big bone. We ate our sandwiches in the garden. My friend lost his ticket, but the teacher helped. We visited the shop and bought postcards. On the way back we sang songs. It was a great day for everyone.',
    blanks: [
      { position: 1, answer: 'went', hint: 'travelled', hintZh: '去（旅行）' },
      { position: 2, answer: 'caught', hint: 'got on', hintZh: '赶上（车）', accept: ['took'] },
      { position: 3, answer: 'large', hint: 'big in size', hintZh: '面积大的', accept: ['big'] },
      { position: 4, answer: 'told', hint: 'gave information', hintZh: '讲解', accept: ['taught'] },
      { position: 5, answer: 'drew', hint: 'made a picture', hintZh: '画了', accept: ['made'] },
      { position: 6, answer: 'ate', hint: 'had food', hintZh: '吃了', accept: ['had'] },
      { position: 7, answer: 'lost', hint: 'could not find', hintZh: '弄丢了', accept: ['forgot'] },
      { position: 8, answer: 'visited', hint: 'went to see', hintZh: '去参观了', accept: ['saw'] },
      { position: 9, answer: 'back', hint: 'returning', hintZh: '回程', accept: ['home'] },
      { position: 10, answer: 'great', hint: 'very good', hintZh: '很棒的', accept: ['good', 'nice'] },
    ],
  },
  {
    id: 'p5-014', title: 'My Bedroom', titleZh: '我的卧室', difficulty: 'medium', topic: '家庭',
    passage: 'My (1) ____ is small but nice. There is a (2) ____ by the window where I sleep. Next to it is a (3) ____ with my books. On the wall I (4) ____ a poster of my favourite band. The (5) ____ is blue and white. I (6) ____ my clothes in a wooden wardrobe. My desk is (7) ____ the window, so I can see the garden. I (8) ____ my room every Saturday. It is (9) ____ and quiet there. I (10) ____ spending time in my bedroom.',
    passageFull: 'My bedroom is small but nice. There is a bed by the window where I sleep. Next to it is a shelf with my books. On the wall I have a poster of my favourite band. The carpet is blue and white. I keep my clothes in a wooden wardrobe. My desk is near the window, so I can see the garden. I clean my room every Saturday. It is tidy and quiet there. I like spending time in my bedroom.',
    blanks: [
      { position: 1, answer: 'bedroom', hint: 'a room to sleep in', hintZh: '睡觉的房间', accept: ['room'] },
      { position: 2, answer: 'bed', hint: 'furniture to sleep on', hintZh: '睡觉的家具' },
      { position: 3, answer: 'shelf', hint: 'a place for books', hintZh: '放书的地方', accept: ['table'] },
      { position: 4, answer: 'have', hint: 'own', hintZh: '有', accept: ['put'] },
      { position: 5, answer: 'carpet', hint: 'soft floor covering', hintZh: '铺地的软垫', accept: ['floor'] },
      { position: 6, answer: 'keep', hint: 'store', hintZh: '存放', accept: ['put'] },
      { position: 7, answer: 'near', hint: 'close to', hintZh: '靠近', accept: ['by'] },
      { position: 8, answer: 'clean', hint: 'tidy up', hintZh: '打扫', accept: ['tidy'] },
      { position: 9, answer: 'tidy', hint: 'neat', hintZh: '整洁的', accept: ['clean'] },
      { position: 10, answer: 'like', hint: 'enjoy', hintZh: '喜欢', accept: ['enjoy'] },
    ],
  },
  {
    id: 'p5-015', title: 'A New Friend', titleZh: '新朋友', difficulty: 'hard', topic: '友谊',
    passage: 'When I (1) ____ to a new school, I felt shy. Then a girl called Mia (2) ____ to me and smiled. She (3) ____ me to her group of friends. We (4) ____ the same subjects and sat together. Mia is (5) ____ because she helps everyone. After school we sometimes (6) ____ homework in the library. She (7) ____ me to a music club last month. Now I have (8) ____ good friends. I am (9) ____ that I met her. A friend can (10) ____ your life better.',
    passageFull: 'When I moved to a new school, I felt shy. Then a girl called Mia came to me and smiled. She introduced me to her group of friends. We shared the same subjects and sat together. Mia is kind because she helps everyone. After school we sometimes do homework in the library. She invited me to a music club last month. Now I have several good friends. I am glad that I met her. A friend can make your life better.',
    blanks: [
      { position: 1, answer: 'moved', hint: 'changed home', hintZh: '搬了家', accept: ['came'] },
      { position: 2, answer: 'came', hint: 'walked over', hintZh: '走过来', accept: ['walked'] },
      { position: 3, answer: 'introduced', hint: 'presented me', hintZh: '把我介绍给', accept: ['brought'] },
      { position: 4, answer: 'shared', hint: 'had in common', hintZh: '共有', accept: ['had'] },
      { position: 5, answer: 'kind', hint: 'good to others', hintZh: '对人和善', accept: ['nice'] },
      { position: 6, answer: 'do', hint: 'work on', hintZh: '做（作业）', accept: ['finish'] },
      { position: 7, answer: 'invited', hint: 'asked to join', hintZh: '邀请', accept: ['took'] },
      { position: 8, answer: 'several', hint: 'more than two', hintZh: '好几个', accept: ['many', 'some'] },
      { position: 9, answer: 'glad', hint: 'happy', hintZh: '高兴的', accept: ['happy'] },
      { position: 10, answer: 'make', hint: 'cause to be', hintZh: '使', accept: ['help'] },
    ],
  },
  {
    id: 'p5-016', title: 'The Weekend', titleZh: '周末', difficulty: 'hard', topic: '家庭',
    passage: 'On Saturday morning I (1) ____ the house with my brother. We (2) ____ the floor and washed the dishes. In the afternoon we (3) ____ our bikes to the river. The water was (4) ____ and clear. We saw a (5) ____ sitting on a stone. My brother (6) ____ a photo of it. On Sunday we (7) ____ Grandma and helped in her garden. She (8) ____ us fresh vegetables. We (9) ____ tired but happy in the evening. Weekends (10) ____ me feel free.',
    passageFull: 'On Saturday morning I cleaned the house with my brother. We swept the floor and washed the dishes. In the afternoon we rode our bikes to the river. The water was cold and clear. We saw a frog sitting on a stone. My brother took a photo of it. On Sunday we visited Grandma and helped in her garden. She gave us fresh vegetables. We were tired but happy in the evening. Weekends make me feel free.',
    blanks: [
      { position: 1, answer: 'cleaned', hint: 'tidied', hintZh: '打扫', accept: ['tidied'] },
      { position: 2, answer: 'swept', hint: 'brushed the floor', hintZh: '扫地', accept: ['cleaned'] },
      { position: 3, answer: 'rode', hint: 'went on bikes', hintZh: '骑自行车', accept: ['took'] },
      { position: 4, answer: 'cold', hint: 'not warm', hintZh: '不暖的', accept: ['clean'] },
      { position: 5, answer: 'frog', hint: 'a small green animal', hintZh: '一种绿色小动物', accept: ['bird'] },
      { position: 6, answer: 'took', hint: 'made a picture', hintZh: '拍了照', accept: ['made'] },
      { position: 7, answer: 'visited', hint: 'went to see', hintZh: '去看了', accept: ['saw'] },
      { position: 8, answer: 'gave', hint: 'handed to us', hintZh: '给了我们', accept: ['offered'] },
      { position: 9, answer: 'were', hint: 'felt', hintZh: '感到', accept: ['felt'] },
      { position: 10, answer: 'make', hint: 'cause to', hintZh: '使', accept: ['help'] },
    ],
  },
  {
    id: 'p5-017', title: 'My Hobby', titleZh: '我的爱好', difficulty: 'hard', topic: '爱好',
    passage: 'My hobby is (1) ____ photos with my old camera. I (2) ____ it from my father last year. At weekends I (3) ____ the park to take pictures of birds. The early light (4) ____ the leaves look golden. I (5) ____ keep my best photos in a notebook. Sometimes I (6) ____ them to black and white. My friends (7) ____ my pictures are beautiful. Photography (8) ____ me to see the world slowly. It also (9) ____ me calm after a busy day. I (10) ____ everyone should find a hobby they love.',
    passageFull: 'My hobby is taking photos with my old camera. I got it from my father last year. At weekends I visit the park to take pictures of birds. The early light makes the leaves look golden. I always keep my best photos in a notebook. Sometimes I change them to black and white. My friends say my pictures are beautiful. Photography teaches me to see the world slowly. It also keeps me calm after a busy day. I believe everyone should find a hobby they love.',
    blanks: [
      { position: 1, answer: 'taking', hint: 'making pictures', hintZh: '拍照', accept: ['making'] },
      { position: 2, answer: 'got', hint: 'received', hintZh: '得到', accept: ['received'] },
      { position: 3, answer: 'visit', hint: 'go to', hintZh: '去', accept: ['go'] },
      { position: 4, answer: 'makes', hint: 'causes to', hintZh: '使', accept: ['helps'] },
      { position: 5, answer: 'always', hint: 'every time', hintZh: '每次都', accept: ['often'] },
      { position: 6, answer: 'change', hint: 'turn into', hintZh: '变成', accept: ['turn'] },
      { position: 7, answer: 'say', hint: 'tell me', hintZh: '说', accept: ['think'] },
      { position: 8, answer: 'teaches', hint: 'helps learn', hintZh: '教会', accept: ['helps'] },
      { position: 9, answer: 'keeps', hint: 'holds', hintZh: '使保持', accept: ['makes'] },
      { position: 10, answer: 'believe', hint: 'feel sure', hintZh: '相信', accept: ['think'] },
    ],
  },
  {
    id: 'p5-018', title: 'A Letter to a Penfriend', titleZh: '给笔友的信', difficulty: 'hard', topic: '友谊',
    passage: 'Dear Tom,\n\nI am writing to (1) ____ you about my life here. I (2) ____ in a small town near the mountains. Every morning I (3) ____ the fresh air and birds. My school is (4) ____ than your school, I think. I (5) ____ playing the guitar in my free time. Last summer I (6) ____ a camping trip with my cousins. We (7) ____ a lake and caught fish. The food was (8) ____ but we were happy. I (9) ____ to visit your country one day. Please (10) ____ me about your hobbies too!\n\nBest wishes,\nAlex',
    passageFull: 'Dear Tom,\n\nI am writing to tell you about my life here. I live in a small town near the mountains. Every morning I enjoy the fresh air and birds. My school is smaller than your school, I think. I like playing the guitar in my free time. Last summer I went on a camping trip with my cousins. We found a lake and caught fish. The food was simple but we were happy. I hope to visit your country one day. Please tell me about your hobbies too!\n\nBest wishes,\nAlex',
    blanks: [
      { position: 1, answer: 'tell', hint: 'inform', hintZh: '告诉', accept: ['write'] },
      { position: 2, answer: 'live', hint: 'have my home', hintZh: '住在', accept: ['stay'] },
      { position: 3, answer: 'enjoy', hint: 'like', hintZh: '享受', accept: ['breathe'] },
      { position: 4, answer: 'smaller', hint: 'not as big', hintZh: '更小的', accept: ['different'] },
      { position: 5, answer: 'like', hint: 'enjoy', hintZh: '喜欢', accept: ['enjoy'] },
      { position: 6, answer: 'went', hint: 'travelled on', hintZh: '去（旅行）', accept: ['had'] },
      { position: 7, answer: 'found', hint: 'discovered', hintZh: '发现', accept: ['saw'] },
      { position: 8, answer: 'simple', hint: 'plain, not fancy', hintZh: '简单的', accept: ['plain'] },
      { position: 9, answer: 'hope', hint: 'wish for', hintZh: '希望', accept: ['want'] },
      { position: 10, answer: 'tell', hint: 'write to me', hintZh: '写信告诉我', accept: ['write'] },
    ],
  },
  {
    id: 'p5-019', title: 'Helping at Home', titleZh: '在家帮忙', difficulty: 'hard', topic: '家庭',
    passage: 'In our family we all (1) ____ with the housework. My dad (2) ____ the car every Sunday. Mum (3) ____ the shopping and cooks dinner. I (4) ____ the table before we eat. My sister (5) ____ the dog and fills its bowl. We (6) ____ the rubbish out each evening. On Saturdays I (7) ____ my bed and clean my room. These small jobs (8) ____ us live well together. They also (9) ____ me responsible. I (10) ____ helping makes our home happy.',
    passageFull: 'In our family we all help with the housework. My dad washes the car every Sunday. Mum does the shopping and cooks dinner. I lay the table before we eat. My sister walks the dog and fills its bowl. We take the rubbish out each evening. On Saturdays I make my bed and clean my room. These small jobs help us live well together. They also make me responsible. I think helping makes our home happy.',
    blanks: [
      { position: 1, answer: 'help', hint: 'give a hand', hintZh: '搭把手', accept: ['share'] },
      { position: 2, answer: 'washes', hint: 'cleans with water', hintZh: '用水清洗', accept: ['cleans'] },
      { position: 3, answer: 'does', hint: 'carries out', hintZh: '做（采购）', accept: ['makes'] },
      { position: 4, answer: 'lay', hint: 'set out', hintZh: '摆放', accept: ['set'] },
      { position: 5, answer: 'walks', hint: 'takes for a walk', hintZh: '遛', accept: ['feeds'] },
      { position: 6, answer: 'take', hint: 'carry away', hintZh: '拿走', accept: ['put'] },
      { position: 7, answer: 'make', hint: 'tidy the bed', hintZh: '整理床铺', accept: ['tidy'] },
      { position: 8, answer: 'help', hint: 'let us', hintZh: '让我们', accept: ['let'] },
      { position: 9, answer: 'make', hint: 'cause to be', hintZh: '使成为', accept: ['keep'] },
      { position: 10, answer: 'think', hint: 'believe', hintZh: '认为', accept: ['believe'] },
    ],
  },
  {
    id: 'p5-020', title: 'My Dream Holiday', titleZh: '我梦想的假期', difficulty: 'hard', topic: '度假',
    passage: 'My dream holiday is to (1) ____ Japan in spring. I want to (2) ____ the pink cherry trees in the parks. The streets will be (3) ____ with people and flowers. I (4) ____ to eat sushi and try green tea. I also (5) ____ to visit old temples on the hills. At night the (6) ____ light up the cities. I will (7) ____ photos to show my family. I (8) ____ need to learn some Japanese words before I go. The trip (9) ____ cost a lot of money, but it will be (10) ____.\n\nI hope it comes true!',
    passageFull: 'My dream holiday is to visit Japan in spring. I want to see the pink cherry trees in the parks. The streets will be full with people and flowers. I plan to eat sushi and try green tea. I also hope to visit old temples on the hills. At night the lights light up the cities. I will take photos to show my family. I will need to learn some Japanese words before I go. The trip will cost a lot of money, but it will be wonderful.\n\nI hope it comes true!',
    blanks: [
      { position: 1, answer: 'visit', hint: 'go to see', hintZh: '去游览', accept: ['see'] },
      { position: 2, answer: 'see', hint: 'look at', hintZh: '看', accept: ['watch'] },
      { position: 3, answer: 'full', hint: 'filled', hintZh: '充满的', accept: ['busy'] },
      { position: 4, answer: 'plan', hint: 'intend', hintZh: '打算', accept: ['want'] },
      { position: 5, answer: 'hope', hint: 'would like', hintZh: '希望', accept: ['want'] },
      { position: 6, answer: 'lights', hint: 'bright things at night', hintZh: '夜晚发光的东西', accept: ['stars'] },
      { position: 7, answer: 'take', hint: 'make pictures', hintZh: '拍照', accept: ['make'] },
      { position: 8, answer: 'will', hint: 'in the future', hintZh: '将要', accept: ['also'] },
      { position: 9, answer: 'will', hint: 'is going to', hintZh: '将会', accept: ['may'] },
      { position: 10, answer: 'wonderful', hint: 'very good', hintZh: '极好的', accept: ['great', 'amazing'] },
    ],
  },
];

// ===== 断言 =====
const seenIds = new Set<string>();
const diffCount = { easy: 0, medium: 0, hard: 0 } as Record<string, number>;
for (const a of A) {
  if (seenIds.has(a.id)) throw new Error('重复 article id: ' + a.id);
  seenIds.add(a.id);
  diffCount[a.difficulty]++;
  if (a.blanks.length !== 10) throw new Error(`${a.id} 空数=${a.blanks.length} != 10`);
  const positions = a.blanks.map(b => b.position).sort((x, y) => x - y);
  const expected = Array.from({ length: 10 }, (_, i) => i + 1);
  if (JSON.stringify(positions) !== JSON.stringify(expected)) throw new Error(`${a.id} positions 不连续: ${positions}`);
  const ph = (a.passage.match(/\((\d+)\)\s*____/g) || []).map(s => Number(s.replace(/\D/g, '')));
  if (ph.length !== 10) throw new Error(`${a.id} passage 占位符数=${ph.length}`);
  if (JSON.stringify(ph) !== JSON.stringify(expected)) throw new Error(`${a.id} 占位符序列!=positions`);
  if (/\((\d+)\)\s*____/.test(a.passageFull)) throw new Error(`${a.id} passageFull 仍含占位符`);
  if (!/[一-鿿]/.test(a.titleZh)) throw new Error(`${a.id} titleZh 缺中文`);
  const seenB = new Set<string>();
  for (const b of a.blanks) {
    const bid = a.id + '-b' + b.position;
    if (seenB.has(bid)) throw new Error('重复 blank id: ' + bid);
    seenB.add(bid);
    if (!b.answer || !b.answer.trim()) throw new Error(`${b.id} answer 空`);
    if (!b.hint || !b.hint.trim()) throw new Error(`${b.id} hint 空`);
    if (!/[一-鿿]/.test(b.hintZh)) throw new Error(`${b.id} hintZh 缺中文`);
  }
}
console.log(`断言通过: 组数=${A.length}, 难度=${JSON.stringify(diffCount)}`);

// ===== 序列化为 TS =====
function s(v: unknown): string { return JSON.stringify(v); }
let out = 'export const part5Articles: Part5Article[] = [\n';
for (const a of A) {
  out += '  {\n';
  out += `    id: ${s(a.id)},\n`;
  out += `    title: ${s(a.title)},\n`;
  out += `    titleZh: ${s(a.titleZh)},\n`;
  out += `    difficulty: ${s(a.difficulty)},\n`;
  out += `    topic: ${s(a.topic)},\n`;
  out += `    passage: ${s(a.passage)},\n`;
  out += `    passageFull: ${s(a.passageFull)},\n`;
  out += '    blanks: [\n';
  for (const b of a.blanks) {
    let line = `      { id: ${s(a.id + '-b' + b.position)}, position: ${b.position}, answer: ${s(b.answer)}, hint: ${s(b.hint)}, hintZh: ${s(b.hintZh)}`;
    if (b.accept && b.accept.length) line += `, accept: ${s(b.accept)}`;
    line += ' },\n';
    out += line;
  }
  out += '    ],\n';
  out += '  },\n';
}
out += '];\n\n';

// ===== 边界替换 reading.ts =====
const file = 'src/data/reading.ts';
const src = fs.readFileSync(file, 'utf8');
const startIdx = src.indexOf('export const part5Articles');
if (startIdx < 0) throw new Error('未找到 export const part5Articles');
const endIdx = src.indexOf('export const allReadingArticles');
if (endIdx < 0) throw new Error('未找到 export const allReadingArticles');
const before = src.slice(0, startIdx);
const after = src.slice(endIdx);
fs.writeFileSync(file, before + out + after);
console.log('已写入 reading.ts (part5Articles 块, 20组×10空)');
