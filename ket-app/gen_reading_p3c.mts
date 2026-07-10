// 生成 part3ClozeArticles —— 升级为 KET 标准：每篇 10 空 × 3 选项(A/B/C)，含 easy/medium/hard 梯度。
// 修复 p3c-001（原仅 1 空，残缺）；对重复标题做内容区分。
// 边界替换：start = 'export const part3ClozeArticles' 的数组 '[', end = 下一个 'export const part3RCArticles' 前的 '];'
import * as fs from 'node:fs';

interface Blank { id: string; position: number; options: string[]; answer: string; explanation: string; }
interface Article {
  id: string; title: string; titleZh: string;
  passage: string; passageFull: string;
  blanks: Blank[]; difficulty: 'easy' | 'medium' | 'hard'; topic: string;
}

const A = (id: string, title: string, titleZh: string, passage: string, passageFull: string,
  blanks: Blank[], difficulty: 'easy' | 'medium' | 'hard', topic: string): Article =>
  ({ id, title, titleZh, passage, passageFull, blanks, difficulty, topic });

const articles: Article[] = [
  A('p3c-001', 'My Family', '我的家庭',
    `Hello! I live in a small house with my (1) ____. There are four people in my family. My dad is a (2) ____ and my mum is a (3) ____. I have one sister. She is (4) ____ years old. We have a dog. (5) ____ name is Buddy. Every Sunday we (6) ____ dinner together. My dad (7) ____ Chinese food. My mum likes reading (8) ____. My sister and I (9) ____ TV in the evening. I (10) ____ my family very much.`,
    `Hello! I live in a small house with my family (1). There are four people in my family. My dad is a teacher (2) and my mum is a doctor (3). I have one sister. She is sixteen (4) years old. We have a dog. Its (5) name is Buddy. Every Sunday we eat (6) dinner together. My dad likes (7) Chinese food. My mum likes reading books (8). My sister and I watch (9) TV in the evening. I love (10) my family very much.`,
    [
      { id: 'b001-1', position: 1, options: ['family', 'school', 'park'], answer: 'family', explanation: '上文说“和家人住小房子”，family 符合。' },
      { id: 'b001-2', position: 2, options: ['teacher', 'student', 'worker'], answer: 'teacher', explanation: 'dad 的职业，teacher 合理。' },
      { id: 'b001-3', position: 3, options: ['doctor', 'nurse', 'singer'], answer: 'doctor', explanation: 'mum 的职业，doctor 合理。' },
      { id: 'b001-4', position: 4, options: ['sixteen', 'twelve', 'ten'], answer: 'sixteen', explanation: '姐姐 16 岁，sixteen 符合。' },
      { id: 'b001-5', position: 5, options: ['Its', 'His', 'Her'], answer: 'Its', explanation: 'dog 是动物，用 Its 指代“它的”。' },
      { id: 'b001-6', position: 6, options: ['eat', 'make', 'buy'], answer: 'eat', explanation: '一起吃晚餐用 eat。' },
      { id: 'b001-7', position: 7, options: ['likes', 'cooks', 'hates'], answer: 'likes', explanation: '爸爸喜欢中餐，likes 符合。' },
      { id: 'b001-8', position: 8, options: ['books', 'music', 'games'], answer: 'books', explanation: '阅读的对象是 books。' },
      { id: 'b001-9', position: 9, options: ['watch', 'see', 'play'], answer: 'watch', explanation: '看电视固定搭配 watch TV。' },
      { id: 'b001-10', position: 10, options: ['love', 'like', 'miss'], answer: 'love', explanation: '结尾表达爱家人，love 最贴切。' },
    ], 'easy', '家庭'),

  A('p3c-002', 'My School Day', '我的学校生活',
    `I (1) ____ up at seven o'clock every morning. I have breakfast with my family. Then I (2) ____ to school by bus. My first lesson is English. I (3) ____ English because it is fun. At twelve o'clock I (4) ____ lunch at school. My friends and I (5) ____ football after lunch. In the afternoon we have (6) ____ and art. I (7) ____ my homework in the evening. My mum (8) ____ me with maths. I (9) ____ to bed at nine o'clock. School days are (10) ____ but happy.`,
    `I get (1) up at seven o'clock every morning. I have breakfast with my family. Then I go (2) to school by bus. My first lesson is English. I like (3) English because it is fun. At twelve o'clock I eat (4) lunch at school. My friends and I play (5) football after lunch. In the afternoon we have music (6) and art. I do (7) my homework in the evening. My mum helps (8) me with maths. I go (9) to bed at nine o'clock. School days are busy (10) but happy.`,
    [
      { id: 'b002-1', position: 1, options: ['get', 'stand', 'wake'], answer: 'get', explanation: 'get up 固定搭配“起床”。' },
      { id: 'b002-2', position: 2, options: ['go', 'walk', 'run'], answer: 'go', explanation: 'go to school“去上学”。' },
      { id: 'b002-3', position: 3, options: ['like', 'study', 'teach'], answer: 'like', explanation: '因为有趣所以喜欢，like 符合。' },
      { id: 'b002-4', position: 4, options: ['eat', 'cook', 'make'], answer: 'eat', explanation: '在学校吃午餐，eat 符合。' },
      { id: 'b002-5', position: 5, options: ['play', 'see', 'do'], answer: 'play', explanation: 'play football“踢足球”。' },
      { id: 'b002-6', position: 6, options: ['music', 'maths', 'science'], answer: 'music', explanation: '与 art 并列的学科，music 合理。' },
      { id: 'b002-7', position: 7, options: ['do', 'make', 'write'], answer: 'do', explanation: 'do homework“做作业”。' },
      { id: 'b002-8', position: 8, options: ['helps', 'asks', 'calls'], answer: 'helps', explanation: '妈妈帮我数学，helps 符合。' },
      { id: 'b002-9', position: 9, options: ['go', 'sit', 'lie'], answer: 'go', explanation: 'go to bed“上床睡觉”。' },
      { id: 'b002-10', position: 10, options: ['busy', 'free', 'late'], answer: 'busy', explanation: '上学日忙碌但快乐，busy 符合。' },
    ], 'easy', '学校生活'),

  A('p3c-003', 'A Healthy Diet', '健康饮食',
    `We should eat a (1) ____ diet to stay healthy. Every day I eat fruit and (2) ____. I (3) ____ drink cola because it has too much sugar. Water is the (4) ____ drink. For breakfast I have bread and (5) ____. At lunch I eat rice with vegetables and (6) ____. My mum says we should not eat too much (7) ____. I (8) ____ eat sweets only on weekends. Exercise is also (9) ____ for our body. A good diet and sport make us (10) ____.`,
    `We should eat a healthy (1) diet to stay healthy. Every day I eat fruit and vegetables (2). I never (3) drink cola because it has too much sugar. Water is the best (4) drink. For breakfast I have bread and milk (5). At lunch I eat rice with vegetables and meat (6). My mum says we should not eat too much sugar (7). I usually (8) eat sweets only on weekends. Exercise is also good (9) for our body. A good diet and sport make us strong (10).`,
    [
      { id: 'b003-1', position: 1, options: ['healthy', 'quick', 'large'], answer: 'healthy', explanation: '为保持健康需健康饮食，healthy。' },
      { id: 'b003-2', position: 2, options: ['vegetables', 'meat', 'rice'], answer: 'vegetables', explanation: '与 fruit 并列的健康食物，vegetables。' },
      { id: 'b003-3', position: 3, options: ['never', 'always', 'often'], answer: 'never', explanation: '可乐糖多，从不吃，never。' },
      { id: 'b003-4', position: 4, options: ['best', 'cold', 'cheap'], answer: 'best', explanation: '水是最好的饮料，best。' },
      { id: 'b003-5', position: 5, options: ['milk', 'tea', 'coffee'], answer: 'milk', explanation: '早餐面包配牛奶，milk。' },
      { id: 'b003-6', position: 6, options: ['meat', 'fish', 'bread'], answer: 'meat', explanation: '米饭蔬菜配肉，meat。' },
      { id: 'b003-7', position: 7, options: ['sugar', 'salt', 'oil'], answer: 'sugar', explanation: '前文说糖多，不应吃太多糖。' },
      { id: 'b003-8', position: 8, options: ['usually', 'sometimes', 'never'], answer: 'usually', explanation: '通常只在周末吃糖，usually。' },
      { id: 'b003-9', position: 9, options: ['good', 'bad', 'hard'], answer: 'good', explanation: '运动对身体好，good。' },
      { id: 'b003-10', position: 10, options: ['strong', 'weak', 'tired'], answer: 'strong', explanation: '健康饮食让身体强壮，strong。' },
    ], 'medium', '健康'),

  A('p3c-004', 'My Favourite Hobby', '我最喜欢的爱好',
    `My favourite hobby is (1) ____. I started it two years (2) ____. Every Saturday I go to the park with my camera. I (3) ____ photos of birds and flowers. Sometimes I (4) ____ pictures of my friends. Photography helps me (5) ____ the world. I (6) ____ my photos on the computer. My best photo is of a (7) ____ at sunset. My parents (8) ____ my hobby. They bought me a new (9) ____ for my birthday. I (10) ____ to be a photographer one day.`,
    `My favourite hobby is photography (1). I started it two years ago (2). Every Saturday I go to the park with my camera. I take (3) photos of birds and flowers. Sometimes I draw (4) pictures of my friends. Photography helps me see (5) the world. I save (6) my photos on the computer. My best photo is of a bird (7) at sunset. My parents like (8) my hobby. They bought me a new camera (9) for my birthday. I want (10) to be a photographer one day.`,
    [
      { id: 'b004-1', position: 1, options: ['photography', 'fishing', 'cooking'], answer: 'photography', explanation: '后文提到 camera，应是摄影。' },
      { id: 'b004-2', position: 2, options: ['ago', 'later', 'before'], answer: 'ago', explanation: 'two years ago“两年前”。' },
      { id: 'b004-3', position: 3, options: ['take', 'make', 'do'], answer: 'take', explanation: 'take photos“拍照”。' },
      { id: 'b004-4', position: 4, options: ['draw', 'cut', 'sing'], answer: 'draw', explanation: '为朋友画肖像，draw。' },
      { id: 'b004-5', position: 5, options: ['see', 'hear', 'touch'], answer: 'see', explanation: '摄影帮我“看”世界，see。' },
      { id: 'b004-6', position: 6, options: ['save', 'send', 'sell'], answer: 'save', explanation: '把照片保存在电脑，save。' },
      { id: 'b004-7', position: 7, options: ['bird', 'tree', 'river'], answer: 'bird', explanation: '前文说拍鸟，bird。' },
      { id: 'b004-8', position: 8, options: ['like', 'hate', 'fear'], answer: 'like', explanation: '父母喜欢我的爱好，like。' },
      { id: 'b004-9', position: 9, options: ['camera', 'book', 'bike'], answer: 'camera', explanation: '送的新相机，camera。' },
      { id: 'b004-10', position: 10, options: ['want', 'need', 'learn'], answer: 'want', explanation: 'want to be“想成为”。' },
    ], 'medium', '爱好'),

  A('p3c-005', 'A Trip to the Zoo', '动物园之旅',
    `Last Sunday my class (1) ____ to the zoo. We (2) ____ the bus at nine o'clock. At the zoo I (3) ____ a big elephant. The elephant (4) ____ green leaves. Then we (5) ____ the monkeys. They were very (6) ____. My friend (7) ____ a photo of a panda. We (8) ____ lunch near the lake. In the afternoon we (9) ____ the gift shop. We (10) ____ home at four.`,
    `Last Sunday my class went (1) to the zoo. We took (2) the bus at nine o'clock. At the zoo I saw (3) a big elephant. The elephant ate (4) green leaves. Then we visited (5) the monkeys. They were very funny (6). My friend took (7) a photo of a panda. We ate (8) lunch near the lake. In the afternoon we visited (9) the gift shop. We went (10) home at four.`,
    [
      { id: 'b005-1', position: 1, options: ['went', 'go', 'walk'], answer: 'went', explanation: '过去式“去”，went。' },
      { id: 'b005-2', position: 2, options: ['took', 'caught', 'missed'], answer: 'took', explanation: 'take the bus“乘公交”，过去式 took。' },
      { id: 'b005-3', position: 3, options: ['saw', 'looked', 'watched'], answer: 'saw', explanation: 'see 强调“看到”，过去式 saw。' },
      { id: 'b005-4', position: 4, options: ['ate', 'drank', 'cooked'], answer: 'ate', explanation: '大象吃叶子，ate。' },
      { id: 'b005-5', position: 5, options: ['visited', 'called', 'helped'], answer: 'visited', explanation: '参观猴子区，visited。' },
      { id: 'b005-6', position: 6, options: ['funny', 'angry', 'sleepy'], answer: 'funny', explanation: '猴子有趣，funny。' },
      { id: 'b005-7', position: 7, options: ['took', 'made', 'drew'], answer: 'took', explanation: 'take a photo“拍照”，过去式 took。' },
      { id: 'b005-8', position: 8, options: ['ate', 'made', 'bought'], answer: 'ate', explanation: '在湖边吃午餐，ate。' },
      { id: 'b005-9', position: 9, options: ['visited', 'opened', 'left'], answer: 'visited', explanation: '参观礼品店，visited。' },
      { id: 'b005-10', position: 10, options: ['went', 'came', 'returned'], answer: 'went', explanation: 'go home 过去式 went。' },
    ], 'easy', '动物'),

  A('p3c-006', 'The Weather Report', '天气预报',
    `The weather (1) ____ an important part of our life. In spring it is (2) ____ and warm. Summer is (3) ____ and hot. Many people (4) ____ swimming. In autumn the (5) ____ turn yellow. Winter is cold and we wear (6) ____ clothes. Sometimes it (7) ____ in December. The temperature can be (8) ____ zero. I (9) ____ spring best because the flowers (10) ____.`,
    `The weather plays (1) an important part of our life. In spring it is rainy (2) and warm. Summer is sunny (3) and hot. Many people go (4) swimming. In autumn the leaves (5) turn yellow. Winter is cold and we wear thick (6) clothes. Sometimes it snows (7) in December. The temperature can be below (8) zero. I like (9) spring best because the flowers bloom (10).`,
    [
      { id: 'b006-1', position: 1, options: ['plays', 'makes', 'takes'], answer: 'plays', explanation: 'play a part“起作用”，三单 plays。' },
      { id: 'b006-2', position: 2, options: ['rainy', 'snowy', 'cloudy'], answer: 'rainy', explanation: '春天多雨且温暖，rainy。' },
      { id: 'b006-3', position: 3, options: ['sunny', 'windy', 'foggy'], answer: 'sunny', explanation: '夏天晴朗炎热，sunny。' },
      { id: 'b006-4', position: 4, options: ['go', 'do', 'make'], answer: 'go', explanation: 'go swimming“去游泳”。' },
      { id: 'b006-5', position: 5, options: ['leaves', 'grass', 'trees'], answer: 'leaves', explanation: '秋天叶子变黄，leaves。' },
      { id: 'b006-6', position: 6, options: ['thick', 'thin', 'short'], answer: 'thick', explanation: '冬天穿厚衣，thick。' },
      { id: 'b006-7', position: 7, options: ['snows', 'rains', 'blows'], answer: 'snows', explanation: '十二月有时下雪，snows。' },
      { id: 'b006-8', position: 8, options: ['below', 'above', 'over'], answer: 'below', explanation: '气温可在零度以下，below。' },
      { id: 'b006-9', position: 9, options: ['like', 'hate', 'dislike'], answer: 'like', explanation: '最喜欢春天，like。' },
      { id: 'b006-10', position: 10, options: ['bloom', 'fall', 'die'], answer: 'bloom', explanation: '春天花开放，bloom。' },
    ], 'medium', '天气'),

  A('p3c-007', 'My Dream Job', '我的梦想工作',
    `When I grow (1) ____, I want to be a doctor. Doctors (2) ____ sick people. They work in a (3) ____. To become a doctor I must (4) ____ hard at school. I am (5) ____ at science. My teacher says I am a (6) ____ student. I (7) ____ to help others. Every weekend I (8) ____ books about medicine. It is not (9) ____ work, but I love it. I (10) ____ my dream will come true.`,
    `When I grow up (1), I want to be a doctor. Doctors help (2) sick people. They work in a hospital (3). To become a doctor I must study (4) hard at school. I am good (5) at science. My teacher says I am a hard (6) student. I want (7) to help others. Every weekend I read (8) books about medicine. It is not easy (9) work, but I love it. I hope (10) my dream will come true.`,
    [
      { id: 'b007-1', position: 1, options: ['up', 'down', 'old'], answer: 'up', explanation: 'grow up“长大”。' },
      { id: 'b007-2', position: 2, options: ['help', 'teach', 'call'], answer: 'help', explanation: '医生帮助病人，help。' },
      { id: 'b007-3', position: 3, options: ['hospital', 'school', 'shop'], answer: 'hospital', explanation: '医生在医院工作，hospital。' },
      { id: 'b007-4', position: 4, options: ['study', 'play', 'sleep'], answer: 'study', explanation: '在校努力学习，study。' },
      { id: 'b007-5', position: 5, options: ['good', 'bad', 'weak'], answer: 'good', explanation: 'be good at“擅长”。' },
      { id: 'b007-6', position: 6, options: ['hard', 'lazy', 'quiet'], answer: 'hard', explanation: '老师夸我是用功的学生，hard。' },
      { id: 'b007-7', position: 7, options: ['want', 'refuse', 'forget'], answer: 'want', explanation: '想要帮助他人，want。' },
      { id: 'b007-8', position: 8, options: ['read', 'write', 'buy'], answer: 'read', explanation: 'read books“读书”。' },
      { id: 'b007-9', position: 9, options: ['easy', 'simple', 'fun'], answer: 'easy', explanation: '前文说不是轻松的工作，easy。' },
      { id: 'b007-10', position: 10, options: ['hope', 'think', 'know'], answer: 'hope', explanation: 'hope“希望”梦想成真。' },
    ], 'medium', '职业'),

  A('p3c-008', 'A Birthday Party', '生日派对',
    `Yesterday was my (1) ____ birthday. My mum made a big cake. We (2) ____ the table with flowers. My friends (3) ____ at three o'clock. We (4) ____ games in the garden. Then we (5) ____ the cake. It was (6) ____. I got many (7) ____. My best friend gave me a (8) ____. We (9) ____ music and danced. The party (10) ____ at six.`,
    `Yesterday was my tenth (1) birthday. My mum made a big cake. We decorated (2) the table with flowers. My friends arrived (3) at three o'clock. We played (4) games in the garden. Then we ate (5) the cake. It was delicious (6). I got many gifts (7). My best friend gave me a book (8). We listened (9) to music and danced. The party ended (10) at six.`,
    [
      { id: 'b008-1', position: 1, options: ['tenth', 'ten', 'first'], answer: 'tenth', explanation: '生日用序数词 tenth“第十个”。' },
      { id: 'b008-2', position: 2, options: ['decorated', 'cleaned', 'moved'], answer: 'decorated', explanation: '用花装饰桌子，decorated。' },
      { id: 'b008-3', position: 3, options: ['arrived', 'left', 'called'], answer: 'arrived', explanation: '朋友三点到达，arrived。' },
      { id: 'b008-4', position: 4, options: ['played', 'made', 'did'], answer: 'played', explanation: 'play games“玩游戏”。' },
      { id: 'b008-5', position: 5, options: ['ate', 'cut', 'made'], answer: 'ate', explanation: '吃蛋糕，ate。' },
      { id: 'b008-6', position: 6, options: ['delicious', 'strange', 'bitter'], answer: 'delicious', explanation: '蛋糕美味，delicious。' },
      { id: 'b008-7', position: 7, options: ['gifts', 'cards', 'letters'], answer: 'gifts', explanation: '收到许多礼物，gifts。' },
      { id: 'b008-8', position: 8, options: ['book', 'cake', 'flower'], answer: 'book', explanation: '好友送的书，book。' },
      { id: 'b008-9', position: 9, options: ['listened', 'heard', 'sang'], answer: 'listened', explanation: 'listen to music“听音乐”。' },
      { id: 'b008-10', position: 10, options: ['ended', 'started', 'opened'], answer: 'ended', explanation: '派对六点结束，ended。' },
    ], 'easy', '庆祝'),

  A('p3c-009', 'Shopping for Clothes', '买衣服',
    `My mum and I (1) ____ to the shop on Saturday. I (2) ____ a new T-shirt. The blue one is (3) ____. The red one is too (4) ____. I (5) ____ the blue T-shirt. It (6) ____ twenty yuan. My mum (7) ____ a dress. We (8) ____ the clothes to the desk. The shop assistant (9) ____ us. We (10) ____ home happy.`,
    `My mum and I went (1) to the shop on Saturday. I wanted (2) a new T-shirt. The blue one is nice (3). The red one is too big (4). I chose (5) the blue T-shirt. It cost (6) twenty yuan. My mum bought (7) a dress. We took (8) the clothes to the desk. The shop assistant helped (9) us. We went (10) home happy.`,
    [
      { id: 'b009-1', position: 1, options: ['went', 'go', 'walk'], answer: 'went', explanation: '过去式“去”，went。' },
      { id: 'b009-2', position: 2, options: ['wanted', 'needed', 'found'], answer: 'wanted', explanation: '想要新 T 恤，wanted。' },
      { id: 'b009-3', position: 3, options: ['nice', 'small', 'old'], answer: 'nice', explanation: '蓝色的好看，nice。' },
      { id: 'b009-4', position: 4, options: ['big', 'cheap', 'new'], answer: 'big', explanation: '红色太大，big。' },
      { id: 'b009-5', position: 5, options: ['chose', 'took', 'made'], answer: 'chose', explanation: 'choose 过去式“选择”，chose。' },
      { id: 'b009-6', position: 6, options: ['cost', 'paid', 'spent'], answer: 'cost', explanation: '物价为二十元，cost。' },
      { id: 'b009-7', position: 7, options: ['bought', 'made', 'saw'], answer: 'bought', explanation: 'buy 过去式“买”，bought。' },
      { id: 'b009-8', position: 8, options: ['took', 'carried', 'brought'], answer: 'took', explanation: '把衣服拿到收银台，took。' },
      { id: 'b009-9', position: 9, options: ['helped', 'asked', 'called'], answer: 'helped', explanation: '店员帮助我们，helped。' },
      { id: 'b009-10', position: 10, options: ['went', 'returned', 'came'], answer: 'went', explanation: 'go home 过去式 went。' },
    ], 'easy', '购物'),

  A('p3c-010', 'The Internet', '互联网',
    `The Internet (1) ____ our lives in many ways. We can (2) ____ information very quickly. Students (3) ____ online lessons at home. However, we should (4) ____ careful with strangers online. It is important to (5) ____ personal information private. Some people (6) ____ too much time on games. This can be (7) ____ for their health. Parents should (8) ____ what children do online. The Internet is useful, (9) ____ we must use it wisely. A safe Internet (10) ____ everyone.`,
    `The Internet changes (1) our lives in many ways. We can find (2) information very quickly. Students take (3) online lessons at home. However, we should be (4) careful with strangers online. It is important to keep (5) personal information private. Some people spend (6) too much time on games. This can be bad (7) for their health. Parents should check (8) what children do online. The Internet is useful, but (9) we must use it wisely. A safe Internet helps (10) everyone.`,
    [
      { id: 'b010-1', position: 1, options: ['changes', 'makes', 'takes'], answer: 'changes', explanation: '互联网改变生活，changes。' },
      { id: 'b010-2', position: 2, options: ['find', 'lose', 'hide'], answer: 'find', explanation: '快速找到信息，find。' },
      { id: 'b010-3', position: 3, options: ['take', 'make', 'do'], answer: 'take', explanation: 'take lessons“上课”。' },
      { id: 'b010-4', position: 4, options: ['be', 'do', 'make'], answer: 'be', explanation: 'should be careful“应小心”。' },
      { id: 'b010-5', position: 5, options: ['keep', 'put', 'show'], answer: 'keep', explanation: 'keep ... private“保密”。' },
      { id: 'b010-6', position: 6, options: ['spend', 'pay', 'cost'], answer: 'spend', explanation: 'spend time“花时间”。' },
      { id: 'b010-7', position: 7, options: ['bad', 'good', 'nice'], answer: 'bad', explanation: '过度游戏对健康有害，bad。' },
      { id: 'b010-8', position: 8, options: ['check', 'guess', 'forget'], answer: 'check', explanation: '家长应查看，check。' },
      { id: 'b010-9', position: 9, options: ['but', 'and', 'or'], answer: 'but', explanation: '表转折“但”，but。' },
      { id: 'b010-10', position: 10, options: ['helps', 'harms', 'leaves'], answer: 'helps', explanation: '安全的网络帮助大家，helps。' },
    ], 'hard', '科技'),

  A('p3c-011', 'A School Trip to the Museum', '学校博物馆之旅',
    `Last month our school (1) ____ a trip to the museum. We (2) ____ early in the morning. The museum was very (3) ____. We saw old (4) ____ from different countries. Our teacher (5) ____ us many interesting facts. I (6) ____ a picture of a dinosaur. My friend bought a (7) ____ in the shop. We (8) ____ our lunch in the garden. It was a (9) ____ day. I (10) ____ to go again.`,
    `Last month our school organised (1) a trip to the museum. We left (2) early in the morning. The museum was very big (3). We saw old objects (4) from different countries. Our teacher told (5) us many interesting facts. I drew (6) a picture of a dinosaur. My friend bought a postcard (7) in the shop. We ate (8) our lunch in the garden. It was a great (9) day. I want (10) to go again.`,
    [
      { id: 'b011-1', position: 1, options: ['organised', 'made', 'did'], answer: 'organised', explanation: '学校组织旅行，organised。' },
      { id: 'b011-2', position: 2, options: ['left', 'came', 'went'], answer: 'left', explanation: '早晨出发，left。' },
      { id: 'b011-3', position: 3, options: ['big', 'small', 'new'], answer: 'big', explanation: '博物馆很大，big。' },
      { id: 'b011-4', position: 4, options: ['objects', 'toys', 'books'], answer: 'objects', explanation: '来自各国的古老物件，objects。' },
      { id: 'b011-5', position: 5, options: ['told', 'said', 'asked'], answer: 'told', explanation: 'tell us facts“告诉我们事实”。' },
      { id: 'b011-6', position: 6, options: ['drew', 'took', 'made'], answer: 'drew', explanation: '画恐龙，drew。' },
      { id: 'b011-7', position: 7, options: ['postcard', 'ticket', 'cake'], answer: 'postcard', explanation: '在商店买明信片，postcard。' },
      { id: 'b011-8', position: 8, options: ['ate', 'made', 'cooked'], answer: 'ate', explanation: '在花园吃午餐，ate。' },
      { id: 'b011-9', position: 9, options: ['great', 'long', 'cold'], answer: 'great', explanation: '很棒的一天，great。' },
      { id: 'b011-10', position: 10, options: ['want', 'hope', 'like'], answer: 'want', explanation: 'want to go again“想再去”。' },
    ], 'medium', '学校生活'),

  A('p3c-012', 'Collecting Stamps', '集邮',
    `My hobby is (1) ____ stamps. I have more than five hundred stamps from (2) ____ countries. My uncle (3) ____ me the first stamp. Now I (4) ____ them in a big book. Each stamp (5) ____ a story. Some are very (6) ____. I (7) ____ new stamps at the post office. I also (8) ____ stamps with friends. Collecting teaches me about (9) ____ and history. It is a (10) ____ hobby.`,
    `My hobby is collecting (1) stamps. I have more than five hundred stamps from different (2) countries. My uncle gave (3) me the first stamp. Now I keep (4) them in a big book. Each stamp tells (5) a story. Some are very old (6). I buy (7) new stamps at the post office. I also exchange (8) stamps with friends. Collecting teaches me about geography (9) and history. It is a relaxing (10) hobby.`,
    [
      { id: 'b012-1', position: 1, options: ['collecting', 'making', 'drawing'], answer: 'collecting', explanation: '集邮，collecting。' },
      { id: 'b012-2', position: 2, options: ['different', 'small', 'nearby'], answer: 'different', explanation: '来自不同国家，different。' },
      { id: 'b012-3', position: 3, options: ['gave', 'sold', 'lent'], answer: 'gave', explanation: 'give 过去式“给”，gave。' },
      { id: 'b012-4', position: 4, options: ['keep', 'put', 'hide'], answer: 'keep', explanation: '把邮票保存在册子里，keep。' },
      { id: 'b012-5', position: 5, options: ['tells', 'writes', 'reads'], answer: 'tells', explanation: 'tell a story“讲述故事”。' },
      { id: 'b012-6', position: 6, options: ['old', 'new', 'cheap'], answer: 'old', explanation: '有些很古老，old。' },
      { id: 'b012-7', position: 7, options: ['buy', 'find', 'make'], answer: 'buy', explanation: '在邮局买新邮票，buy。' },
      { id: 'b012-8', position: 8, options: ['exchange', 'sell', 'send'], answer: 'exchange', explanation: '与朋友交换邮票，exchange。' },
      { id: 'b012-9', position: 9, options: ['geography', 'music', 'sport'], answer: 'geography', explanation: '集邮了解地理与历史，geography。' },
      { id: 'b012-10', position: 10, options: ['relaxing', 'tiring', 'boring'], answer: 'relaxing', explanation: '集邮是放松的爱好，relaxing。' },
    ], 'hard', '爱好'),

  A('p3c-013', 'A Letter to My Penfriend', '给笔友的信',
    `Dear Tom, I am (1) ____ to tell you about my town. It is small (2) ____ beautiful. There is a river (3) ____ the bridge. People here are very (4) ____. My school is near the park. After class I often (5) ____ my bike. At weekends we (6) ____ films at the cinema. The food in our restaurant is (7) ____. I (8) ____ you can visit me soon. Please (9) ____ me about your city. (10) ____ soon!`,
    `Dear Tom, I am happy (1) to tell you about my town. It is small but (2) beautiful. There is a river near (3) the bridge. People here are very friendly (4). My school is near the park. After class I often ride (5) my bike. At weekends we watch (6) films at the cinema. The food in our restaurant is delicious (7). I hope (8) you can visit me soon. Please tell (9) me about your city. Write (10) soon!`,
    [
      { id: 'b013-1', position: 1, options: ['happy', 'sorry', 'sad'], answer: 'happy', explanation: '很高兴告知，happy。' },
      { id: 'b013-2', position: 2, options: ['but', 'and', 'or'], answer: 'but', explanation: '小但美，表转折 but。' },
      { id: 'b013-3', position: 3, options: ['near', 'under', 'over'], answer: 'near', explanation: '桥附近有条河，near。' },
      { id: 'b013-4', position: 4, options: ['friendly', 'busy', 'rich'], answer: 'friendly', explanation: '人们友好，friendly。' },
      { id: 'b013-5', position: 5, options: ['ride', 'drive', 'take'], answer: 'ride', explanation: 'ride a bike“骑自行车”。' },
      { id: 'b013-6', position: 6, options: ['watch', 'see', 'make'], answer: 'watch', explanation: 'watch films“看电影”。' },
      { id: 'b013-7', position: 7, options: ['delicious', 'expensive', 'strange'], answer: 'delicious', explanation: '食物美味，delicious。' },
      { id: 'b013-8', position: 8, options: ['hope', 'think', 'know'], answer: 'hope', explanation: 'hope“希望”你能来访。' },
      { id: 'b013-9', position: 9, options: ['tell', 'ask', 'call'], answer: 'tell', explanation: 'tell me about“告诉我关于”。' },
      { id: 'b013-10', position: 10, options: ['Write', 'Come', 'Go'], answer: 'Write', explanation: '信末“尽快回信”，Write。' },
    ], 'medium', '旅行'),

  A('p3c-014', 'Healthy Eating', '健康饮食',
    `Nutrition (1) ____ a key role in our health. A (2) ____ meal should have protein, vegetables and grains. Many teenagers (3) ____ breakfast, which is a mistake. Skipping meals can (4) ____ your concentration. Experts (5) ____ we drink eight glasses of water daily. Processed food often (6) ____ too much salt. Cooking at home is (7) ____ than buying fast food. A balanced plate (8) ____ you energetic. Small (9) ____ every day lead to big results. Your body will (10) ____ you.`,
    `Nutrition plays (1) a key role in our health. A balanced (2) meal should have protein, vegetables and grains. Many teenagers skip (3) breakfast, which is a mistake. Skipping meals can lower (4) your concentration. Experts suggest (5) we drink eight glasses of water daily. Processed food often has (6) too much salt. Cooking at home is better (7) than buying fast food. A balanced plate keeps (8) you energetic. Small changes (9) every day lead to big results. Your body will thank (10) you.`,
    [
      { id: 'b014-1', position: 1, options: ['plays', 'takes', 'makes'], answer: 'plays', explanation: 'play a role“起作用”。' },
      { id: 'b014-2', position: 2, options: ['balanced', 'big', 'hot'], answer: 'balanced', explanation: '均衡的一餐，balanced。' },
      { id: 'b014-3', position: 3, options: ['skip', 'eat', 'make'], answer: 'skip', explanation: 'skip breakfast“不吃早餐”。' },
      { id: 'b014-4', position: 4, options: ['lower', 'raise', 'keep'], answer: 'lower', explanation: '不吃饭会降低注意力，lower。' },
      { id: 'b014-5', position: 5, options: ['suggest', 'order', 'ask'], answer: 'suggest', explanation: '专家建议，suggest。' },
      { id: 'b014-6', position: 6, options: ['has', 'wants', 'needs'], answer: 'has', explanation: '加工食品含盐过多，has。' },
      { id: 'b014-7', position: 7, options: ['better', 'worse', 'easier'], answer: 'better', explanation: '在家做饭更好，better。' },
      { id: 'b014-8', position: 8, options: ['keeps', 'makes', 'lets'], answer: 'keeps', explanation: 'keep you energetic“让你精力充沛”。' },
      { id: 'b014-9', position: 9, options: ['changes', 'meals', 'ideas'], answer: 'changes', explanation: '每天的小改变，changes。' },
      { id: 'b014-10', position: 10, options: ['thank', 'help', 'leave'], answer: 'thank', explanation: '身体会感谢你，thank。' },
    ], 'hard', '健康'),

  A('p3c-015', 'The Importance of Sleep', '睡眠的重要性',
    `Sleep is (1) ____ for everyone. Children need about ten (2) ____ of sleep each night. When we sleep, our body (3) ____. A good night helps us (4) ____ well at school. Without enough sleep we feel (5) ____. Doctors (6) ____ we should go to bed early. Phones and TV can (7) ____ our sleep. Reading a book is a (8) ____ habit. My brother (9) ____ sleeps only six hours and feels tired. I (10) ____ to sleep early.`,
    `Sleep is important (1) for everyone. Children need about ten hours (2) of sleep each night. When we sleep, our body rests (3). A good night helps us do (4) well at school. Without enough sleep we feel tired (5). Doctors say (6) we should go to bed early. Phones and TV can hurt (7) our sleep. Reading a book is a good (8) habit. My brother often (9) sleeps only six hours and feels tired. I try (10) to sleep early.`,
    [
      { id: 'b015-1', position: 1, options: ['important', 'difficult', 'interesting'], answer: 'important', explanation: '睡眠对每个人重要，important。' },
      { id: 'b015-2', position: 2, options: ['hours', 'days', 'weeks'], answer: 'hours', explanation: '睡眠按小时算，hours。' },
      { id: 'b015-3', position: 3, options: ['rests', 'works', 'runs'], answer: 'rests', explanation: '睡觉时身体休息，rests。' },
      { id: 'b015-4', position: 4, options: ['do', 'make', 'play'], answer: 'do', explanation: 'do well“表现好”。' },
      { id: 'b015-5', position: 5, options: ['tired', 'happy', 'strong'], answer: 'tired', explanation: '睡眠不足会累，tired。' },
      { id: 'b015-6', position: 6, options: ['say', 'think', 'hope'], answer: 'say', explanation: '医生说，say。' },
      { id: 'b015-7', position: 7, options: ['hurt', 'help', 'save'], answer: 'hurt', explanation: '手机电视伤害睡眠，hurt。' },
      { id: 'b015-8', position: 8, options: ['good', 'bad', 'new'], answer: 'good', explanation: '读书是好习惯，good。' },
      { id: 'b015-9', position: 9, options: ['often', 'never', 'always'], answer: 'often', explanation: '哥哥常只睡六小时，often。' },
      { id: 'b015-10', position: 10, options: ['try', 'want', 'like'], answer: 'try', explanation: 'try to“努力”早睡。' },
    ], 'medium', '健康'),

  A('p3c-016', 'Social Media', '社交媒体',
    `Social media (1) ____ millions of people every day. We can (2) ____ photos and ideas with friends. It helps us (3) ____ in touch with family far away. (4) ____, too much time online is not healthy. Some posts are not (5) ____. We must learn to (6) ____ real news from fake news. Cyberbullying is a (7) ____ problem. Users should (8) ____ kind to others. Privacy settings (9) ____ our information safe. Used well, social media can (10) ____ the world closer.`,
    `Social media connects (1) millions of people every day. We can share (2) photos and ideas with friends. It helps us stay (3) in touch with family far away. However (4), too much time online is not healthy. Some posts are not true (5). We must learn to tell (6) real news from fake news. Cyberbullying is a serious (7) problem. Users should be (8) kind to others. Privacy settings keep (9) our information safe. Used well, social media can bring (10) the world closer.`,
    [
      { id: 'b016-1', position: 1, options: ['connects', 'divides', 'separates'], answer: 'connects', explanation: '社交媒体连接人们，connects。' },
      { id: 'b016-2', position: 2, options: ['share', 'hide', 'sell'], answer: 'share', explanation: 'share ... with“分享”。' },
      { id: 'b016-3', position: 3, options: ['stay', 'lose', 'fall'], answer: 'stay', explanation: 'stay in touch“保持联系”。' },
      { id: 'b016-4', position: 4, options: ['However', 'Because', 'Although'], answer: 'However', explanation: '表转折“然而”，However。' },
      { id: 'b016-5', position: 5, options: ['true', 'long', 'new'], answer: 'true', explanation: '有些帖子不真实，true。' },
      { id: 'b016-6', position: 6, options: ['tell', 'make', 'find'], answer: 'tell', explanation: 'tell A from B“区分”。' },
      { id: 'b016-7', position: 7, options: ['serious', 'small', 'funny'], answer: 'serious', explanation: '网络欺凌是严重问题，serious。' },
      { id: 'b016-8', position: 8, options: ['be', 'do', 'make'], answer: 'be', explanation: 'should be kind“应友善”。' },
      { id: 'b016-9', position: 9, options: ['keep', 'break', 'open'], answer: 'keep', explanation: 'keep ... safe“保护安全”。' },
      { id: 'b016-10', position: 10, options: ['bring', 'push', 'send'], answer: 'bring', explanation: 'bring ... closer“拉近”。' },
    ], 'hard', '科技'),

  A('p3c-017', 'Environmental Protection', '环境保护',
    `Our planet (1) ____ our help. We should (2) ____ less plastic. Recycling can (3) ____ energy. Trees (4) ____ clean air for us. We must (5) ____ water when we brush teeth. Walking or (6) ____ a bike is better than driving. Many animals are in (7) ____ because of pollution. Everyone (8) ____ do something small. Small acts (9) ____ a big difference. A green future is (10) ____ our hands.`,
    `Our planet needs (1) our help. We should use (2) less plastic. Recycling can save (3) energy. Trees make (4) clean air for us. We must save (5) water when we brush teeth. Walking or riding (6) a bike is better than driving. Many animals are in danger (7) because of pollution. Everyone can (8) do something small. Small acts make (9) a big difference. A green future is in (10) our hands.`,
    [
      { id: 'b017-1', position: 1, options: ['needs', 'wants', 'takes'], answer: 'needs', explanation: '地球需要帮助，needs。' },
      { id: 'b017-2', position: 2, options: ['use', 'buy', 'waste'], answer: 'use', explanation: '应使用更少塑料，use。' },
      { id: 'b017-3', position: 3, options: ['save', 'spend', 'make'], answer: 'save', explanation: '回收节省能源，save。' },
      { id: 'b017-4', position: 4, options: ['make', 'give', 'take'], answer: 'make', explanation: '树制造干净空气，make。' },
      { id: 'b017-5', position: 5, options: ['save', 'drink', 'waste'], answer: 'save', explanation: '刷牙时节约水，save。' },
      { id: 'b017-6', position: 6, options: ['riding', 'driving', 'taking'], answer: 'riding', explanation: 'ride a bike“骑自行车”。' },
      { id: 'b017-7', position: 7, options: ['danger', 'trouble', 'fear'], answer: 'danger', explanation: 'in danger“处于危险中”。' },
      { id: 'b017-8', position: 8, options: ['can', 'must', 'will'], answer: 'can', explanation: '每个人都能做小事，can。' },
      { id: 'b017-9', position: 9, options: ['make', 'take', 'do'], answer: 'make', explanation: 'make a difference“有影响”。' },
      { id: 'b017-10', position: 10, options: ['in', 'on', 'at'], answer: 'in', explanation: 'in our hands“在我们手中”。' },
    ], 'hard', '环境'),

  A('p3c-018', 'Working with Animals', '与动物一起工作',
    `When I am older I (1) ____ to work with animals. I (2) ____ dogs and cats very much. A vet (3) ____ sick animals get well. To do this job I must (4) ____ biology at university. I (5) ____ at an animal shelter at weekends. The work is sometimes (6) ____ but always meaningful. We (7) ____ homeless pets find new families. It (8) ____ patience and love. I (9) ____ this is my true calling. Animals (10) ____ us with trust.`,
    `When I am older I want (1) to work with animals. I love (2) dogs and cats very much. A vet helps (3) sick animals get well. To do this job I must study (4) biology at university. I volunteer (5) at an animal shelter at weekends. The work is sometimes hard (6) but always meaningful. We help (7) homeless pets find new families. It needs (8) patience and love. I believe (9) this is my true calling. Animals give (10) us with trust.`,
    [
      { id: 'b018-1', position: 1, options: ['want', 'need', 'like'], answer: 'want', explanation: 'want to work“想工作”。' },
      { id: 'b018-2', position: 2, options: ['love', 'hate', 'fear'], answer: 'love', explanation: '非常喜欢猫狗，love。' },
      { id: 'b018-3', position: 3, options: ['helps', 'teaches', 'calls'], answer: 'helps', explanation: '兽医帮助病动物康复，helps。' },
      { id: 'b018-4', position: 4, options: ['study', 'play', 'teach'], answer: 'study', explanation: '在大学学生物，study。' },
      { id: 'b018-5', position: 5, options: ['volunteer', 'work', 'live'], answer: 'volunteer', explanation: '在收容所做志愿者，volunteer。' },
      { id: 'b018-6', position: 6, options: ['hard', 'easy', 'fun'], answer: 'hard', explanation: '工作有时辛苦，hard。' },
      { id: 'b018-7', position: 7, options: ['help', 'ask', 'pay'], answer: 'help', explanation: '帮助无家宠物找到家庭，help。' },
      { id: 'b018-8', position: 8, options: ['needs', 'wants', 'takes'], answer: 'needs', explanation: '需要耐心与爱，needs。' },
      { id: 'b018-9', position: 9, options: ['believe', 'think', 'know'], answer: 'believe', explanation: 'believe“相信”这是天职。' },
      { id: 'b018-10', position: 10, options: ['give', 'show', 'make'], answer: 'give', explanation: '动物给予我们信任，give。' },
    ], 'hard', '职业'),

  A('p3c-019', 'A Day in My Life', '我生活中的一天',
    `I (1) ____ at half past six. The first thing I (2) ____ is wash my face. Then I (3) ____ my bed. I have milk and bread for (4) ____. I (5) ____ to school at eight. Lessons (6) ____ at nine. I like PE (7) ____ it is active. After school I (8) ____ my grandparents. We (9) ____ chess together. I (10) ____ tired but happy at night.`,
    `I wake (1) at half past six. The first thing I do (2) is wash my face. Then I make (3) my bed. I have milk and bread for breakfast (4). I go (5) to school at eight. Lessons start (6) at nine. I like PE because (7) it is active. After school I visit (8) my grandparents. We play (9) chess together. I feel (10) tired but happy at night.`,
    [
      { id: 'b019-1', position: 1, options: ['wake', 'get', 'stand'], answer: 'wake', explanation: 'wake up“醒来”。' },
      { id: 'b019-2', position: 2, options: ['do', 'make', 'take'], answer: 'do', explanation: 'the first thing I do“我做的第一件事”。' },
      { id: 'b019-3', position: 3, options: ['make', 'clean', 'tidy'], answer: 'make', explanation: 'make one’s bed“整理床铺”。' },
      { id: 'b019-4', position: 4, options: ['breakfast', 'lunch', 'dinner'], answer: 'breakfast', explanation: '早上吃早餐，breakfast。' },
      { id: 'b019-5', position: 5, options: ['go', 'come', 'walk'], answer: 'go', explanation: 'go to school“上学”。' },
      { id: 'b019-6', position: 6, options: ['start', 'end', 'open'], answer: 'start', explanation: '课程九点开始，start。' },
      { id: 'b019-7', position: 7, options: ['because', 'but', 'or'], answer: 'because', explanation: '解释喜欢 PE 的原因，because。' },
      { id: 'b019-8', position: 8, options: ['visit', 'call', 'help'], answer: 'visit', explanation: 'visit grandparents“看望祖父母”。' },
      { id: 'b019-9', position: 9, options: ['play', 'do', 'make'], answer: 'play', explanation: 'play chess“下棋”。' },
      { id: 'b019-10', position: 10, options: ['feel', 'am', 'become'], answer: 'feel', explanation: 'feel tired“感到累”。' },
    ], 'medium', '学校生活'),

  A('p3c-020', 'Weekend Activities', '周末活动',
    `On Saturday morning I (1) ____ my room. Then I (2) ____ football with my brother. In the afternoon we (3) ____ a film. Sunday is (4) ____. I (5) ____ my homework first. Then I (6) ____ my grandparents. We (7) ____ in the park. My mum (8) ____ a big lunch. In the evening I (9) ____ a book. Weekends (10) ____ fun!`,
    `On Saturday morning I clean (1) my room. Then I play (2) football with my brother. In the afternoon we watch (3) a film. Sunday is quiet (4). I do (5) my homework first. Then I visit (6) my grandparents. We walk (7) in the park. My mum makes (8) a big lunch. In the evening I read (9) a book. Weekends are (10) fun!`,
    [
      { id: 'b020-1', position: 1, options: ['clean', 'open', 'paint'], answer: 'clean', explanation: 'clean my room“打扫房间”。' },
      { id: 'b020-2', position: 2, options: ['play', 'watch', 'make'], answer: 'play', explanation: 'play football“踢足球”。' },
      { id: 'b020-3', position: 3, options: ['watch', 'see', 'do'], answer: 'watch', explanation: 'watch a film“看电影”。' },
      { id: 'b020-4', position: 4, options: ['quiet', 'busy', 'noisy'], answer: 'quiet', explanation: '周日安静，quiet。' },
      { id: 'b020-5', position: 5, options: ['do', 'make', 'write'], answer: 'do', explanation: 'do homework“做作业”。' },
      { id: 'b020-6', position: 6, options: ['visit', 'call', 'help'], answer: 'visit', explanation: 'visit grandparents“看望祖父母”。' },
      { id: 'b020-7', position: 7, options: ['walk', 'run', 'sit'], answer: 'walk', explanation: '在公园散步，walk。' },
      { id: 'b020-8', position: 8, options: ['makes', 'buys', 'eats'], answer: 'makes', explanation: '妈妈做丰盛午餐，makes。' },
      { id: 'b020-9', position: 9, options: ['read', 'write', 'buy'], answer: 'read', explanation: 'read a book“读书”。' },
      { id: 'b020-10', position: 10, options: ['are', 'is', 'feel'], answer: 'are', explanation: 'Weekends 复数用 are。' },
    ], 'easy', '日常生活'),
];

function q(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function serialize(a: Article): string {
  const blanks = a.blanks.map(b =>
    `    {\n      id: ${q(b.id)}, position: ${b.position},\n      options: [${b.options.map(o => q(o)).join(', ')}],\n      answer: ${q(b.answer)},\n      explanation: ${q(b.explanation)},\n    }`
  ).join(',\n');
  return `  {\n    id: ${q(a.id)},\n    title: ${q(a.title)},\n    titleZh: ${q(a.titleZh)},\n    passage: \`${a.passage.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`,\n    passageFull: \`${a.passageFull.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`,\n    blanks: [\n${blanks},\n    ],\n    difficulty: ${q(a.difficulty)},\n    topic: ${q(a.topic)},\n  }`;
}

// ===== 边界替换 =====
const file = 'src/data/reading.ts';
const content = fs.readFileSync(file, 'utf-8');
const si = content.indexOf('export const part3ClozeArticles');
if (si < 0) { console.error('未找到 part3ClozeArticles'); process.exit(1); }
const arrStart = content.indexOf('[', content.indexOf('= [', si));
const ei = content.indexOf('export const part3RCArticles');
const arrEnd = content.lastIndexOf('];', ei); // 指向 ]
if (arrStart < 0 || arrEnd < 0 || arrEnd <= arrStart) { console.error('边界定位失败'); process.exit(1); }
const newArr = `[${articles.map(serialize).join(',\n')}]`;
const newContent = content.slice(0, arrStart) + newArr + content.slice(arrEnd + 1);

// 断言
let hardFail = 0;
for (const a of articles) {
  if (a.blanks.length !== 10) { console.error(`硬错: ${a.id} 空数=${a.blanks.length} (应为10)`); hardFail++; }
  const phNums = (a.passage.match(/\(\d+\)\s*____/g) || []).map(s => parseInt(s.replace(/[()]/g, ''), 10));
  if (phNums.length !== 10) { console.error(`硬错: ${a.id} passage 占位符数=${phNums.length}`); hardFail++; }
  const expected = Array.from({ length: 10 }, (_, i) => i + 1);
  const positions = a.blanks.map(b => b.position).sort((x, y) => x - y);
  if (JSON.stringify(positions) !== JSON.stringify(expected)) { console.error(`硬错: ${a.id} positions=[${positions}]`); hardFail++; }
  if (JSON.stringify(phNums) !== JSON.stringify(expected)) { console.error(`硬错: ${a.id} 占位符=[${phNums}]`); hardFail++; }
  for (const b of a.blanks) {
    if (!b.options.includes(b.answer)) { console.error(`硬错: ${a.id} ${b.id} answer 不在 options`); hardFail++; }
    if (new Set(b.options).size !== b.options.length) { console.error(`硬错: ${a.id} ${b.id} options 重复`); hardFail++; }
    if (b.options.length !== 3) { console.error(`硬错: ${a.id} ${b.id} 选项数=${b.options.length} (应为3)`); hardFail++; }
  }
}
if (hardFail > 0) { console.error(`生成中止：${hardFail} 处硬错`); process.exit(1); }

fs.writeFileSync(file, newContent, 'utf-8');
console.log(`OK: 已写入 ${articles.length} 组 (每组10空×3选项)，无硬错。`);
const diff: Record<string, number> = {};
for (const a of articles) diff[a.difficulty] = (diff[a.difficulty] || 0) + 1;
console.log(`难度分布: ${Object.entries(diff).map(([k, v]) => `${k}:${v}`).join(', ')}`);
