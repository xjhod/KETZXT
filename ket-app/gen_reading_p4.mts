// Part4 全量修复：
// 1) 补 statementZh 中文（全部140条）。
// 2) 每篇取2条原 F 陈述改写为「文中未提及」并设 answer='DN'（引入 DOES NOT SAY），
//    同步把 explanation 改为 DN 说明。
// 3) 边界替换 reading.ts 的 part4TFArticles 块。
import * as fs from 'fs';
import * as path from 'path';
import * as data from './src/data/reading.ts';

const arts = (data as any).part4TFArticles as any[];

// 中文翻译（全部140条）
const ZH: Record<string, string> = {
  'tf001-1': '早餐是一天中最重要的一餐。',
  'tf001-2': '健康的早餐应该包括面包、牛奶、鸡蛋和水果。',
  'tf001-3': '每天吃早餐的孩子在学校成绩更好。',
  'tf001-4': '我们应该晚起才能吃早餐。',
  'tf001-5': '早餐为我们提供下午的能量。',
  'tf001-6': '每天吃早餐对健康有好处。',
  'tf001-7': '健康的早餐必须包含咖啡。',
  'tf002-1': '学校图书馆有很多书。',
  'tf002-2': '学生可以把书借三周。',
  'tf002-3': '图书馆周末开放。',
  'tf002-4': '图书馆早上8点开门。',
  'tf002-5': '如果学生不按时还书，就不能再借。',
  'tf002-6': '图书馆有供学生使用的电脑室。',
  'tf002-7': '学生借书必须付费。',
  'tf003-1': '要保持健康，我们需要定期锻炼。',
  'tf003-2': '喝茶比喝水对健康更好。',
  'tf003-3': '我们应该多吃水果和蔬菜。',
  'tf003-4': '我们应该喝足量的水。',
  'tf003-5': '我们每晚应该睡8到10小时。',
  'tf003-6': '我们每天应该锻炼两小时。',
  'tf003-7': '作者给出了一些保持健康的建议。',
  'tf004-1': '作者昨天去了超市。',
  'tf004-2': '他们乘公共汽车去超市。',
  'tf004-3': '他们买了一些大米、面条、蔬菜和水果。',
  'tf004-4': '作者用妈妈给的钱买了一块巧克力。',
  'tf004-5': '作者在超市买了一个玩具车。',
  'tf004-6': '他们下午5点回家。',
  'tf004-7': '这家超市卖衣服。',
  'tf005-1': '儿童每晚需要10到12小时睡眠。',
  'tf005-2': '我们应该在下午小睡。',
  'tf005-3': '如果睡眠不足，我们会感到疲倦。',
  'tf005-4': '我们应该睡前使用手机。',
  'tf005-5': '为了睡得好，卧室应该明亮嘈杂。',
  'tf005-6': '成年人每晚需要7到9小时睡眠。',
  'tf005-7': '睡前喝牛奶有助于睡眠。',
  'tf006-1': '李华上个月开始在绿校上学。',
  'tf006-2': '李华的学校有2000名学生。',
  'tf006-3': '李华在七年级三班。',
  'tf006-4': '李华的英语老师很严格。',
  'tf006-5': '李华的科学老师很和蔼。',
  'tf006-6': '李华住在学校附近。',
  'tf006-7': '这封信是李华写给王伟的。',
  'tf007-1': '在海南，全年炎热晴朗。',
  'tf007-2': '伦敦冬天下雪。',
  'tf007-3': '在伦敦，经常下雨。',
  'tf007-4': '伦敦人出门时需要带雨伞。',
  'tf007-5': '在北京，春天潮湿多风。',
  'tf007-6': '北京春天经常沙尘飞扬。',
  'tf007-7': '海南的人们冬天穿厚衣服。',
  'tf008-1': '作者所在的班级上周五去农场郊游。',
  'tf008-2': '他们乘火车去农场。',
  'tf008-3': '农民给了学生们一些水果带回家。',
  'tf008-4': '他们在农场看到了牛、羊、猪、鸡和马。',
  'tf008-5': '作者帮农民喂动物。',
  'tf008-6': '他们在农场野餐。',
  'tf008-7': '学生们在农场挤牛奶。',
  'tf009-1': '互联网对学生很有用。',
  'tf009-2': '互联网是由一名学生发明的。',
  'tf009-3': '我们可以在线学习一门新语言。',
  'tf009-4': '我们应该直接从互联网复制信息。',
  'tf009-5': '我们不应该在网上花太多时间。',
  'tf009-6': '我们可以在线和同学分享文档和笔记。',
  'tf009-7': '我们可以在互联网上买书。',
  'tf010-1': '上周六是作者的13岁生日。',
  'tf010-2': '作者的父母在餐厅为他/她举办了派对。',
  'tf010-3': '作者收到了一只宠物狗作为礼物。',
  'tf010-4': '作者的妈妈做了一个大生日蛋糕。',
  'tf010-5': '作者的爸爸给他/她买了一辆新自行车。',
  'tf010-6': '作者收到了书、玩具和衣服作为礼物。',
  'tf010-7': '作者的祖母做了蛋糕。',
  'tf011-1': 'Tom 上周六去了海滩。',
  'tf011-2': '天气寒冷多风。',
  'tf011-3': 'Tom 堆了一个沙堡。',
  'tf011-4': 'Lucy 收集了贝壳。',
  'tf011-5': 'Lucy 游泳游得很好。',
  'tf011-6': '他们下午5点回家。',
  'tf011-7': 'Tom 在海滩上吃了冰淇淋。',
  'tf012-1': '这只狗叫 Max。',
  'tf012-2': 'Max 五岁了。',
  'tf012-3': 'Max 有黑色的毛。',
  'tf012-4': '作者每天早晨带 Max 散步。',
  'tf012-5': 'Max 喜欢洗澡。',
  'tf012-6': '作者的哥哥也遛 Max。',
  'tf012-7': '作者爱他的狗。',
  'tf013-1': '作者最喜欢的科目是数学。',
  'tf013-2': '学校有一个游泳池。',
  'tf013-3': '他们每周上三次英语课。',
  'tf013-4': '作者周三有音乐课。',
  'tf013-5': '他们周一有科学课。',
  'tf013-6': '作者喜欢科学。',
  'tf013-7': '作者周四打篮球。',
  'tf014-1': '作者十岁了。',
  'tf014-2': '派对在餐厅举行。',
  'tf014-3': 'Emma 给了作者一辆玩具车。',
  'tf014-4': '我的妈妈做了一个巧克力蛋糕。',
  'tf014-5': '他们踢了足球。',
  'tf014-6': 'Emma 给了作者一本书。',
  'tf014-7': '作者的父亲做了蛋糕。',
  'tf015-1': '5A 班上周日去了动物园。',
  'tf015-2': '动物园对学生免费入场。',
  'tf015-3': '路程花了两小时。',
  'tf015-4': '猴子们很有趣。',
  'tf015-5': '他们午餐吃了野餐。',
  'tf015-6': '学生们在动物园看到了熊猫。',
  'tf015-7': '他们下午4点回家。',
  'tf016-1': '玛丽·居里出生在法国。',
  'tf016-2': '她24岁时移居法国。',
  'tf016-3': '她发现了三种新元素。',
  'tf016-4': '玛丽·居里有两个孩子。',
  'tf016-5': '她是首位获得诺贝尔奖的女性。',
  'tf016-6': '她写了很多关于化学的书。',
  'tf016-7': '人们铭记她是一位伟大的科学家。',
  'tf017-1': '气候变化只影响贫穷国家。',
  'tf017-2': '燃烧化石燃料会释放二氧化碳。',
  'tf017-3': '气候变化使地球变冷。',
  'tf017-4': '海平面上升是气候变化的一个影响。',
  'tf017-5': '太阳能是一种可再生能源。',
  'tf017-6': '植树有助于减缓气候变化。',
  'tf017-7': '风能比太阳能更贵。',
  'tf018-1': '互联网始于20世纪50年代。',
  'tf018-2': '蒂姆·伯纳斯-李发明了万维网。',
  'tf018-3': '第一个网站于1989年上线。',
  'tf018-4': '互联网最早在中国使用。',
  'tf018-5': 'Twitter 始于2004年。',
  'tf018-6': '如今有超过50亿人使用互联网。',
  'tf018-7': '蒂姆·伯纳斯-李出生在美国。',
  'tf019-1': '健康的一餐应包含碳水化合物和蛋白质。',
  'tf019-2': '咖啡对孩子们是健康的饮品。',
  'tf019-3': '我们每天应该喝6到8杯水。',
  'tf019-4': '加工食品总是健康的。',
  'tf019-5': '我们应该用水果代替晚餐。',
  'tf019-6': '正念饮食能改善我们与食物的关系。',
  'tf019-7': '健康脂肪来自坚果和橄榄油。',
  'tf020-1': '阅读能提升词汇量。',
  'tf020-2': '阅读会缩短注意力持续时间。',
  'tf020-3': '阅读能降低压力水平。',
  'tf020-4': '阅读小说能提升同理心。',
  'tf020-5': '阅读比看电视更快。',
  'tf020-6': '阅读锻炼我们的想象力。',
  'tf020-7': '阅读的人更长寿。',
};

// 改写为 DN 的语句（id -> 新英文陈述），均从原 F 陈述改造为「文中未提及」
const DN: Record<string, string> = {
  'tf001-3': 'Children who eat breakfast get better grades at school.',
  'tf001-7': 'A healthy breakfast must include coffee.',
  'tf002-6': 'The library has a computer room for students.',
  'tf002-7': 'Students must pay to borrow books.',
  'tf003-2': 'Drinking tea is better than water for health.',
  'tf003-6': 'We should exercise for two hours every day.',
  'tf004-5': 'The writer bought a toy car at the supermarket.',
  'tf004-7': 'The supermarket sells clothes.',
  'tf005-2': 'We should take a nap in the afternoon.',
  'tf005-7': 'Drinking milk before bed helps us sleep better.',
  'tf006-4': "Li Hua's English teacher is very strict.",
  'tf006-6': 'Li Hua lives near the school.',
  'tf007-2': 'It snows in London in winter.',
  'tf007-7': 'People in Hainan wear warm clothes in winter.',
  'tf008-3': 'The farmer gave the students some fruit to take home.',
  'tf008-7': 'The students milked the cows on the farm.',
  'tf009-2': 'The internet was invented by a student.',
  'tf009-7': 'We can buy books on the internet.',
  'tf010-3': 'The writer received a pet dog as a present.',
  'tf010-7': "The writer's grandmother made the cake.",
  'tf011-5': 'Lucy can swim very well.',
  'tf011-7': 'Tom ate ice cream on the beach.',
  'tf012-5': 'Max likes to take a bath.',
  'tf012-6': "The writer's brother also walks Max.",
  'tf013-2': 'The school has a swimming pool.',
  'tf013-4': 'The writer has music class on Wednesday.',
  'tf014-3': 'Emma gave the writer a toy car.',
  'tf014-7': "The writer's father made the cake.",
  'tf015-2': 'The zoo ticket was free for students.',
  'tf015-6': 'The students saw pandas at the zoo.',
  'tf016-4': 'Marie Curie had two children.',
  'tf016-6': 'She wrote many books about chemistry.',
  'tf017-1': 'Climate change only affects poor countries.',
  'tf017-7': 'Wind power is more expensive than solar power.',
  'tf018-4': 'The Internet was first used in China.',
  'tf018-7': 'Tim Berners-Lee was born in the USA.',
  'tf019-2': 'Coffee is a healthy drink for children.',
  'tf019-5': 'We should eat fruit instead of dinner.',
  'tf020-5': 'Reading is faster than watching TV.',
  'tf020-7': 'People who read live longer.',
};

const DN_EXP = '文章中没有提到这一点，无法从原文判断，答案为 DOES NOT SAY（未提及）。';

function q(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '') + '"';
}
function t(s: string): string {
  if (s.includes('`') || s.includes('${')) return q(s);
  return '`' + s + '`';
}

const newArts = arts.map((a: any) => {
  const newQs = a.statements.map((qq: any) => {
    const zh = ZH[qq.id] || '';
    if (DN[qq.id]) {
      return { id: qq.id, statement: DN[qq.id], statementZh: zh, answer: 'DN', explanation: DN_EXP };
    }
    return { id: qq.id, statement: qq.statement, statementZh: zh, answer: qq.answer, explanation: qq.explanation };
  });
  return { ...a, statements: newQs };
});

// 断言
let fail = 0;
const ansCount: Record<string, number> = {};
let missingZh = 0;
for (const a of newArts) {
  const dnInGroup = a.statements.filter((s: any) => s.answer === 'DN').length;
  if (dnInGroup !== 2) { console.log(`FAIL DN数应为2, 实际 ${dnInGroup} ${a.id}`); fail++; }
  const seen = new Set<string>();
  for (const s of a.statements) {
    if (seen.has(s.id)) { console.log('FAIL dup id', s.id); fail++; }
    seen.add(s.id);
    if (!s.statementZh || !s.statementZh.trim()) { missingZh++; fail++; console.log('FAIL no zh', s.id); }
    if (!['T', 'F', 'DN'].includes(s.answer)) { console.log('FAIL bad ans', s.answer, s.id); fail++; }
    ansCount[s.answer] = (ansCount[s.answer] || 0) + 1;
    if (!s.explanation || !s.explanation.trim()) { console.log('SOFT no exp', s.id); }
  }
}
if (missingZh > 0) { console.log(`ABORT: ${missingZh} 条缺中文`); }
if (fail > 0) { console.log(`ABORT: ${fail} hard fails`); process.exit(1); }
console.log('答案分布=', ansCount, ' 中文缺失=', missingZh);

// 序列化
let out = 'export const part4TFArticles: Part4TFArticle[] = [\n';
for (const a of newArts) {
  out += '  {\n';
  out += `    id: ${q(a.id)},\n`;
  out += `    title: ${q(a.title)},\n`;
  out += `    titleZh: ${q(a.titleZh)},\n`;
  out += `    article: ${t(a.article)},\n`;
  out += `    articleZh: ${t(a.articleZh)},\n`;
  out += '    statements: [\n';
  for (const s of a.statements) {
    out += '      {\n';
    out += `        id: ${q(s.id)},\n`;
    out += `        statement: ${q(s.statement)},\n`;
    out += `        statementZh: ${q(s.statementZh)},\n`;
    out += `        answer: ${q(s.answer)},\n`;
    out += `        explanation: ${q(s.explanation)},\n`;
    out += '      },\n';
  }
  out += '    ],\n';
  out += `    difficulty: ${q(a.difficulty)},\n`;
  out += `    topic: ${q(a.topic)},\n`;
  out += '  },\n';
}
out += '];\n';

const file = path.resolve('src/data/reading.ts');
const content = fs.readFileSync(file, 'utf-8');
const startIdx = content.indexOf('export const part4TFArticles');
const endIdx = content.indexOf('export const part5Articles');
if (startIdx < 0 || endIdx < 0) { console.log('ABORT: boundary not found'); process.exit(1); }
const newContent = content.slice(0, startIdx) + out + '\n' + content.slice(endIdx);
fs.writeFileSync(file, newContent, 'utf-8');
console.log(`OK: 写入 ${newArts.length} 组 / ${newArts.reduce((s: number, a: any) => s + a.statements.length, 0)} 题，statementZh 全覆盖，DN 已引入(每篇2题)。`);
