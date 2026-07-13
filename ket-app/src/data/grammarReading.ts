// ========== 每日打卡·生活化短文精读语料 ==========
// 每个语法点配一段"孩子日常真会用到"的对话 / 短文：
//   - 每段自带中文翻译(zh) + 语法小注(note，含本点 + 顺带复习的已学点)
//   - 每段配一个音频 id，对应 public/audio/{audio}.mp3（edge-tts 预生成，安卓可靠）
// 语料从 grammar.ts 的语法点解耦到本文件，避免 grammar.ts 过大。
import type { GrammarReading } from '../types';

export const GRAMMAR_READINGS: Record<string, GrammarReading> = {
  G01: {
    grammarId: 'G01',
    title: 'A school day · 上学的一天',
    mode: 'dialogue',
    segments: [
      { speaker: 'Mum', en: "Tom, what time do you get up?", zh: '汤姆，你几点起床？', note: '一般现在时的疑问句用 do + 动词原形(get up)，问的是习惯性的动作。', audio: 'gr-G01-1' },
      { speaker: 'Tom', en: "I get up at seven every day.", zh: '我每天七点起床。', note: '表示每天的习惯，动词用原形 get；every day 是一般现在时的信号词。', audio: 'gr-G01-2' },
      { speaker: 'Mum', en: "Does your sister walk to school?", zh: '你妹妹走路上学吗？', note: '主语是第三人称单数(she)时，疑问句用 does，后面动词回原形 walk。', audio: 'gr-G01-3' },
      { speaker: 'Tom', en: "No, she doesn't. She goes by bus.", zh: '不，她坐公交车去。', note: '否定用 doesn\u2019t + 原形；肯定句里第三人称单数动词加 -es：goes。', audio: 'gr-G01-4' },
      { speaker: 'Tom', en: "My father works in a hospital. He helps sick people.", zh: '我爸爸在医院工作，他帮助病人。', note: '三单动词加 -s：works, helps。最常丢分的点——他/她/它 + 动词要加 s。', audio: 'gr-G01-5' },
    ],
  },
  G02: {
    grammarId: 'G02',
    title: 'Last weekend · 上个周末',
    mode: 'dialogue',
    segments: [
      { speaker: 'Anna', en: "What did you do last weekend?", zh: '你上周末做了什么？', note: '过去时疑问句用 did + 动词原形(do)，did 已经表示过去。', audio: 'gr-G02-1' },
      { speaker: 'Ben', en: "I visited my grandma. We made cakes together.", zh: '我去看了奶奶，我们一起做了蛋糕。', note: '规则动词加 -ed：visited；make 是不规则动词，过去式是 made。', audio: 'gr-G02-2' },
      { speaker: 'Anna', en: "Did you have fun?", zh: '你玩得开心吗？', note: '疑问句用 did，后面动词回原形 have，不用 had。', audio: 'gr-G02-3' },
      { speaker: 'Ben', en: "Yes, I did. But I didn't do my homework.", zh: '开心！不过我没做作业。', note: '否定用 didn\u2019t + 原形 do；肯定短答用 Yes, I did.', audio: 'gr-G02-4' },
      { speaker: 'Ben', en: "On Sunday it rained, so we stayed at home.", zh: '周日下雨了，所以我们待在家里。', note: 'rain→rained, stay→stayed 都加 -ed 表示过去发生（so 是连词"所以"）。', audio: 'gr-G02-5' },
    ],
  },
  G03: {
    grammarId: 'G03',
    title: 'On the phone · 打电话',
    mode: 'dialogue',
    segments: [
      { speaker: 'Lily', en: "Hi Sam! What are you doing now?", zh: '嗨山姆，你现在在做什么？', note: '现在进行时 = am/is/are + 动词-ing；now 是信号词。', audio: 'gr-G03-1' },
      { speaker: 'Sam', en: "I'm cooking dinner with my dad.", zh: '我在和爸爸做晚饭。', note: 'I\u2019m = I am；cook→cooking 加 -ing。', audio: 'gr-G03-2' },
      { speaker: 'Lily', en: "Is your mum watching TV?", zh: '你妈妈在看电视吗？', note: '主语 she 用 is，疑问句把 is 提前：Is she ...ing?', audio: 'gr-G03-3' },
      { speaker: 'Sam', en: "No, she isn't. She is reading a book.", zh: '不，她在看书。', note: '否定 isn\u2019t + -ing；肯定 is reading。', audio: 'gr-G03-4' },
      { speaker: 'Sam', en: "My little sister is drawing a picture.", zh: '我小妹妹正在画画。', note: 'draw→drawing；进行时表示此刻正在发生的动作。', audio: 'gr-G03-5' },
    ],
  },
  G04: {
    grammarId: 'G04',
    title: 'Weekend plans · 周末计划',
    mode: 'dialogue',
    segments: [
      { speaker: 'Kate', en: "What are you going to do this Saturday?", zh: '这周六你打算做什么？', note: 'be going to + 动词原形，表示计划要做的事。', audio: 'gr-G04-1' },
      { speaker: 'Leo', en: "I'm going to visit the zoo with my family.", zh: '我打算和家人去动物园。', note: 'I\u2019m going to + 原形 visit。', audio: 'gr-G04-2' },
      { speaker: 'Kate', en: "Is it going to rain on Sunday?", zh: '周日会下雨吗？', note: 'be going to 也可根据迹象预测；疑问句把 is 提前。', audio: 'gr-G04-3' },
      { speaker: 'Leo', en: "No, it isn't. It's going to be sunny.", zh: '不会，会是晴天。', note: '否定 isn\u2019t going to；肯定 is going to be。', audio: 'gr-G04-4' },
      { speaker: 'Leo', en: "We are going to have a picnic in the park.", zh: '我们打算在公园野餐。', note: '主语 we 用 are；are going to + 原形 have。', audio: 'gr-G04-5' },
    ],
  },
  G05: {
    grammarId: 'G05',
    title: 'Getting ready · 出门前',
    mode: 'dialogue',
    segments: [
      { speaker: 'Dad', en: "Have you finished your homework?", zh: '你写完作业了吗？', note: '现在完成时 = have/has + 过去分词(finished)，强调"已经完成"。', audio: 'gr-G05-1' },
      { speaker: 'Mia', en: "Yes, I have. I've already done it.", zh: '写完了，我已经做完了。', note: 'I\u2019ve = I have；already(已经)常和完成时连用。', audio: 'gr-G05-2' },
      { speaker: 'Dad', en: "Has your brother cleaned his room?", zh: '你弟弟打扫房间了吗？', note: '主语 he 用 has；clean 的过去分词是 cleaned。', audio: 'gr-G05-3' },
      { speaker: 'Mia', en: "No, he hasn't. He hasn't got up yet.", zh: '还没，他还没起床。', note: '否定 hasn\u2019t + 过去分词；yet(还)用于否定句表示"还没"。', audio: 'gr-G05-4' },
      { speaker: 'Mia', en: "I have never been to Beijing.", zh: '我从没去过北京。', note: 'never 表示"从未"；have been to 表示"去过某地"。', audio: 'gr-G05-5' },
    ],
  },
  G06: {
    grammarId: 'G06',
    title: 'In the classroom · 在教室',
    mode: 'dialogue',
    segments: [
      { speaker: 'Nina', en: "Can you swim, Jack?", zh: '杰克，你会游泳吗？', note: 'can + 动词原形表示"会/能"；疑问句把 can 提前。', audio: 'gr-G06-1' },
      { speaker: 'Jack', en: "Yes, I can. But I can't ride a horse.", zh: '会呀，但我不会骑马。', note: '肯定用 can；否定用 can\u2019t + 原形。', audio: 'gr-G06-2' },
      { speaker: 'Nina', en: "Could you help me, please?", zh: '你能帮帮我吗？', note: 'could 比 can 更礼貌，常用于请求帮助。', audio: 'gr-G06-3' },
      { speaker: 'Jack', en: "Sure. Can I borrow your pen?", zh: '当然，我能借你的笔吗？', note: 'Can I ...? 用来礼貌地请求许可。', audio: 'gr-G06-4' },
      { speaker: 'Nina', en: "When I was four, I couldn't read.", zh: '我四岁时还不会读书。', note: 'couldn\u2019t 是 can 的过去否定，表示过去不能。', audio: 'gr-G06-5' },
    ],
  },
  G07: {
    grammarId: 'G07',
    title: 'House rules · 家里的规矩',
    mode: 'dialogue',
    segments: [
      { speaker: 'Mum', en: "You must wash your hands before dinner.", zh: '吃饭前你必须洗手。', note: 'must + 原形，表示"必须"（说话人认为很重要）。', audio: 'gr-G07-1' },
      { speaker: 'Ken', en: "Do I have to go to bed now?", zh: '我现在必须睡觉吗？', note: 'have to 也表示必须（常来自外部规定）；疑问用 do。', audio: 'gr-G07-2' },
      { speaker: 'Mum', en: "Yes. And you shouldn't watch TV too late.", zh: '是的，而且你不该看电视太晚。', note: 'should 表示建议"应该"；shouldn\u2019t 表示"不该"。', audio: 'gr-G07-3' },
      { speaker: 'Ken', en: "Should I brush my teeth?", zh: '我该刷牙吗？', note: 'Should I ...? 用来征求建议。', audio: 'gr-G07-4' },
      { speaker: 'Mum', en: "Yes, you should. But you mustn't eat sweets now.", zh: '该刷，但你现在不能吃糖。', note: 'mustn\u2019t 表示"禁止"，语气比 shouldn\u2019t 更强。', audio: 'gr-G07-5' },
    ],
  },
  G08: {
    grammarId: 'G08',
    title: 'My family · 我的家人',
    mode: 'passage',
    segments: [
      { en: "My brother is taller than me.", zh: '我哥哥比我高。', note: '比较级 = 短形容词 + -er + than：tall→taller。', audio: 'gr-G08-1' },
      { en: "This book is more interesting than that one.", zh: '这本书比那本有趣。', note: '长形容词用 more + 原级：more interesting。', audio: 'gr-G08-2' },
      { en: "Today is hotter than yesterday.", zh: '今天比昨天热。', note: '"辅音+元音+辅音"结尾的短词双写末字母：hot→hotter。', audio: 'gr-G08-3' },
      { en: "My sister is the tallest in our family.", zh: '我妹妹是家里最高的。', note: '最高级 = the + 短形容词 + -est：the tallest，比较三者或以上。', audio: 'gr-G08-4' },
      { en: "She is the most helpful person I know.", zh: '她是我认识的最乐于助人的人。', note: '长形容词最高级用 the most + 原级。', audio: 'gr-G08-5' },
    ],
  },
  G09: {
    grammarId: 'G09',
    title: 'The best day · 最棒的一天',
    mode: 'passage',
    segments: [
      { en: "Summer is my favourite season. It is the best time of the year.", zh: '夏天是我最喜欢的季节，是一年中最好的时光。', note: 'best 是 good 的最高级（不规则）；最高级前加 the。', audio: 'gr-G09-1' },
      { en: "The blue whale is the biggest animal in the world.", zh: '蓝鲸是世界上最大的动物。', note: 'big→the biggest（双写 g）；in the world 表示比较范围。', audio: 'gr-G09-2' },
      { en: "This is the most beautiful park in our city.", zh: '这是我们城市里最美的公园。', note: '长形容词最高级：the most beautiful。', audio: 'gr-G09-3' },
      { en: "Maths is the most difficult subject for me.", zh: '数学对我来说是最难的科目。', note: 'the most difficult；for me 说明"对谁而言"。', audio: 'gr-G09-4' },
      { en: "Anna runs the fastest in her class.", zh: '安娜在班里跑得最快。', note: '副词最高级 the fastest，这里修饰动词 runs。', audio: 'gr-G09-5' },
    ],
  },
  G10: {
    grammarId: 'G10',
    title: 'A little cat · 一只小猫',
    mode: 'passage',
    segments: [
      { en: "I have a cat and a dog.", zh: '我有一只猫和一只狗。', note: 'a + 辅音音开头的单数名词，表示"一个/一只"。', audio: 'gr-G10-1' },
      { en: "My friend has an apple and an orange.", zh: '我朋友有一个苹果和一个橙子。', note: 'an 用在元音音(a/e/i/o/u)开头的词前：an apple, an orange。', audio: 'gr-G10-2' },
      { en: "The cat is white. The cat likes milk.", zh: '那只猫是白色的，它喜欢牛奶。', note: '第二次提到、双方都知道的特定事物用 the。', audio: 'gr-G10-3' },
      { en: "The sun is very bright today.", zh: '今天太阳很亮。', note: '世界上独一无二的事物用 the：the sun。', audio: 'gr-G10-4' },
      { en: "I play the piano, but I don't play football.", zh: '我弹钢琴，但不踢足球。', note: '乐器前用 the(the piano)；球类运动前不用冠词。', audio: 'gr-G10-5' },
    ],
  },
  G11: {
    grammarId: 'G11',
    title: 'Whose bag? · 谁的包？',
    mode: 'dialogue',
    segments: [
      { speaker: 'Sara', en: "Is this your bag?", zh: '这是你的包吗？', note: 'your 是形容词性物主代词，后面要接名词 bag。', audio: 'gr-G11-1' },
      { speaker: 'Tim', en: "No, it isn't mine. It's hers.", zh: '不，不是我的，是她的。', note: 'mine/hers 是名词性物主代词，后面不再接名词。', audio: 'gr-G11-2' },
      { speaker: 'Sara', en: "These pencils are ours. We share them.", zh: '这些铅笔是我们的，我们一起用。', note: 'ours 表示"我们的"；them 是 they 的宾格，作动词宾语。', audio: 'gr-G11-3' },
      { speaker: 'Tim', en: "He is my brother. I help him every day.", zh: '他是我哥哥，我每天帮他。', note: 'he 作主语，him 作宾语（在动词/介词后）。', audio: 'gr-G11-4' },
      { speaker: 'Sara', en: "This is a photo of us at the beach.", zh: '这是我们在海边的照片。', note: '介词 of 后面用宾格 us，不用 we。', audio: 'gr-G11-5' },
    ],
  },
  G12: {
    grammarId: 'G12',
    title: 'The party · 聚会',
    mode: 'dialogue',
    segments: [
      { speaker: 'Emma', en: "When is the party?", zh: '聚会是什么时候？', note: '用 when 提问时间。', audio: 'gr-G12-1' },
      { speaker: 'Max', en: "It's on Saturday, in the afternoon.", zh: '在周六下午。', note: 'on + 星期(on Saturday)；in + 一天的时段(in the afternoon)。', audio: 'gr-G12-2' },
      { speaker: 'Emma', en: "What time does it start?", zh: '几点开始？', note: 'what time 问具体钟点。', audio: 'gr-G12-3' },
      { speaker: 'Max', en: "It starts at three o'clock.", zh: '三点开始。', note: 'at + 具体时间点(at three o\u2019clock)。', audio: 'gr-G12-4' },
      { speaker: 'Max', en: "My birthday is in July, on the fifth.", zh: '我的生日在七月五号。', note: 'in + 月份(in July)；on + 具体某天/日期。', audio: 'gr-G12-5' },
    ],
  },
  G13: {
    grammarId: 'G13',
    title: 'Where is it? · 在哪里？',
    mode: 'dialogue',
    segments: [
      { speaker: 'Kid', en: "Mum, where is my ball?", zh: '妈妈，我的球在哪里？', note: 'where 提问地点。', audio: 'gr-G13-1' },
      { speaker: 'Mum', en: "It's under the table.", zh: '在桌子下面。', note: 'under 表示"在……下面"。', audio: 'gr-G13-2' },
      { speaker: 'Kid', en: "And where are my shoes?", zh: '那我的鞋呢？', note: '复数主语 shoes 用 are。', audio: 'gr-G13-3' },
      { speaker: 'Mum', en: "They're behind the door, next to your bag.", zh: '在门后面，你包的旁边。', note: 'behind 在……后面；next to 在……旁边。', audio: 'gr-G13-4' },
      { speaker: 'Mum', en: "Your coat is on the bed, in your room.", zh: '你的外套在你房间的床上。', note: 'on 在……上面；in 在……里面。', audio: 'gr-G13-5' },
    ],
  },
  G14: {
    grammarId: 'G14',
    title: 'My best friend · 我最好的朋友',
    mode: 'passage',
    segments: [
      { en: "I like apples and bananas.", zh: '我喜欢苹果和香蕉。', note: 'and 连接并列的词，表示"和"。', audio: 'gr-G14-1' },
      { en: "I want to play, but I have to do my homework.", zh: '我想玩，但我得做作业。', note: 'but 表示转折"但是"。', audio: 'gr-G14-2' },
      { en: "I'm happy because it's my birthday today.", zh: '我很开心，因为今天是我的生日。', note: 'because 说明原因"因为"。', audio: 'gr-G14-3' },
      { en: "Would you like tea or juice?", zh: '你想要茶还是果汁？', note: 'or 表示选择"或者/还是"。', audio: 'gr-G14-4' },
      { en: "It was raining, so we stayed at home.", zh: '当时在下雨，所以我们待在家。', note: 'so 表示结果"所以"。', audio: 'gr-G14-5' },
    ],
  },
  G15: {
    grammarId: 'G15',
    title: 'My bedroom · 我的卧室',
    mode: 'passage',
    segments: [
      { en: "There is a big bed in my room.", zh: '我房间里有一张大床。', note: 'there is + 单数名词，表示"有"。', audio: 'gr-G15-1' },
      { en: "There are two windows and a desk.", zh: '有两扇窗和一张书桌。', note: 'there are + 复数名词。', audio: 'gr-G15-2' },
      { en: "Is there a computer on the desk?", zh: '桌上有电脑吗？', note: '疑问句把 is 提前：Is there ...?', audio: 'gr-G15-3' },
      { en: "No, there isn't. But there are many books.", zh: '没有，但有很多书。', note: '否定 there isn\u2019t；复数用 there are。', audio: 'gr-G15-4' },
      { en: "There is some water in the glass.", zh: '杯子里有一些水。', note: '不可数名词(water)用 there is。', audio: 'gr-G15-5' },
    ],
  },
  G16: {
    grammarId: 'G16',
    title: 'New classmate · 新同学',
    mode: 'dialogue',
    segments: [
      { speaker: 'Joe', en: "Do you like football?", zh: '你喜欢足球吗？', note: '一般现在时疑问句用 Do you + 动词原形。', audio: 'gr-G16-1' },
      { speaker: 'Amy', en: "No, I don't. I don't like sports.", zh: '不喜欢，我不喜欢运动。', note: '否定用 don\u2019t + 原形。', audio: 'gr-G16-2' },
      { speaker: 'Joe', en: "Where do you live?", zh: '你住在哪里？', note: '特殊疑问句：疑问词 where + do you + 原形。', audio: 'gr-G16-3' },
      { speaker: 'Amy', en: "Is your sister a student?", zh: '你姐姐是学生吗？', note: 'be 动词疑问句把 is 提前，不用 do。', audio: 'gr-G16-4' },
      { speaker: 'Amy', en: "She isn't a teacher. She's a nurse.", zh: '她不是老师，是护士。', note: 'be 动词的否定直接在后面加 not：isn\u2019t。', audio: 'gr-G16-5' },
    ],
  },
  G17: {
    grammarId: 'G17',
    title: 'At the shop · 在商店',
    mode: 'dialogue',
    segments: [
      { speaker: 'Mum', en: "We need some milk and some eggs.", zh: '我们需要一些牛奶和一些鸡蛋。', note: 'some 用于肯定句，可修饰不可数(milk)和复数(eggs)。', audio: 'gr-G17-1' },
      { speaker: 'Kid', en: "Do we have any bread at home?", zh: '家里有面包吗？', note: 'any 常用于疑问句和否定句。', audio: 'gr-G17-2' },
      { speaker: 'Mum', en: "No, we don't have any bread.", zh: '没有，我们没有面包了。', note: '否定句用 any：not ... any。', audio: 'gr-G17-3' },
      { speaker: 'Kid', en: "How many apples do you want?", zh: '你要几个苹果？', note: 'many + 可数名词复数(apples)，问数量。', audio: 'gr-G17-4' },
      { speaker: 'Mum', en: "Not too much sugar, please.", zh: '请别放太多糖。', note: 'much + 不可数名词(sugar)。', audio: 'gr-G17-5' },
    ],
  },
  G18: {
    grammarId: 'G18',
    title: 'Morning · 早晨',
    mode: 'dialogue',
    segments: [
      { speaker: 'Mum', en: "Wake up! It's time to get up.", zh: '醒醒！该起床了。', note: 'wake up 醒来；get up 起床，都是"动词 + 副词"的短语动词。', audio: 'gr-G18-1' },
      { speaker: 'Kid', en: "Can you turn on the light, please?", zh: '你能开灯吗？', note: 'turn on 打开（电器）；反义是 turn off 关掉。', audio: 'gr-G18-2' },
      { speaker: 'Mum', en: "Please look after your little sister.", zh: '请照顾好你妹妹。', note: 'look after 照顾（后面直接接宾语）。', audio: 'gr-G18-3' },
      { speaker: 'Kid', en: "I'm looking for my school bag.", zh: '我在找我的书包。', note: 'look for 寻找；这里用进行时 looking for。', audio: 'gr-G18-4' },
      { speaker: 'Mum', en: "Don't give up. You can do it!", zh: '别放弃，你能行！', note: 'give up 放弃。', audio: 'gr-G18-5' },
    ],
  },
  G19: {
    grammarId: 'G19',
    title: 'If it rains · 如果下雨',
    mode: 'dialogue',
    segments: [
      { speaker: 'Sam', en: "If it rains tomorrow, we will stay at home.", zh: '如果明天下雨，我们就待在家。', note: 'if + 一般现在时(rains)，主句用 will + 原形（真实条件句）。', audio: 'gr-G19-1' },
      { speaker: 'Kim', en: "What will you do if it's sunny?", zh: '如果天晴你会做什么？', note: '主句的 will 部分可放前面提问；if 从句仍用现在时。', audio: 'gr-G19-2' },
      { speaker: 'Sam', en: "If the sun shines, we will go to the beach.", zh: '如果出太阳，我们就去海边。', note: 'if 从句 shines 用一般现在时，不用 will。', audio: 'gr-G19-3' },
      { speaker: 'Kim', en: "If you study hard, you will pass the test.", zh: '如果你努力学习，就会通过考试。', note: '常见错误：if 后不要用 will，要用现在时 study。', audio: 'gr-G19-4' },
      { speaker: 'Sam', en: "I will be happy if you come to my party.", zh: '如果你来我的聚会，我会很开心。', note: 'if 从句也可放句末，意思不变。', audio: 'gr-G19-5' },
    ],
  },
  G20: {
    grammarId: 'G20',
    title: 'Hobbies · 爱好',
    mode: 'dialogue',
    segments: [
      { speaker: 'Rex', en: "I like playing basketball after school.", zh: '我喜欢放学后打篮球。', note: 'like 后常接动名词(-ing)：playing。', audio: 'gr-G20-1' },
      { speaker: 'Ivy', en: "I enjoy reading and drawing.", zh: '我喜欢阅读和画画。', note: 'enjoy 后必须接 -ing：reading, drawing。', audio: 'gr-G20-2' },
      { speaker: 'Rex', en: "I want to be a pilot one day.", zh: '我想有一天当飞行员。', note: 'want 后接 to + 动词原形：to be。', audio: 'gr-G20-3' },
      { speaker: 'Ivy', en: "I need to finish my homework first.", zh: '我得先写完作业。', note: 'need to + 原形；finish 后若接动词要用 -ing。', audio: 'gr-G20-4' },
      { speaker: 'Rex', en: "It's fun to learn new things.", zh: '学新东西很有趣。', note: 'It\u2019s + 形容词 + to do 结构：to learn。', audio: 'gr-G20-5' },
    ],
  },
};

/** 取某语法点的精读语料，无则返回 null */
export function getReading(grammarId: string): GrammarReading | null {
  return GRAMMAR_READINGS[grammarId] ?? null;
}

/** 所有需要生成音频的段落（供 edge-tts manifest 生成脚本使用） */
export function allReadingAudioItems(): { id: string; text: string }[] {
  const items: { id: string; text: string }[] = [];
  for (const key of Object.keys(GRAMMAR_READINGS)) {
    for (const seg of GRAMMAR_READINGS[key].segments) {
      items.push({ id: seg.audio, text: seg.en });
    }
  }
  return items;
}
