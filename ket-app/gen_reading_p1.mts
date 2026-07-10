// gen_reading_p1.mts
// 把 Reading Part 1 重构为 KET 标准结构：每个 article = 5 张图（5 题）+ 一组共享 8 句（A-H）。
// 同时扩充题量：24 个主题 × 5 图 = 120 题（原 50 题）。
// 运行：node --experimental-strip-types gen_reading_p1.mts

import * as fs from 'node:fs';

type Item = { emoji: string; desc: string; sentence: string };
type Theme = {
  id: string; title: string; titleZh: string; difficulty: 'easy' | 'medium' | 'hard'; topic: string;
  items: Item[]; distractors: string[];
};

const THEMES: Theme[] = [
  { id: 's01', title: 'At the Zoo', titleZh: '在动物园', difficulty: 'easy', topic: '动物',
    items: [
      { emoji: '🐘', desc: '一头大象', sentence: 'This is an elephant.' },
      { emoji: '🦁', desc: '一头狮子', sentence: 'This is a lion.' },
      { emoji: '🐯', desc: '一只老虎', sentence: 'This is a tiger.' },
      { emoji: '🐵', desc: '一只猴子', sentence: 'This is a monkey.' },
      { emoji: '🦒', desc: '一只长颈鹿', sentence: 'This is a giraffe.' },
    ],
    distractors: ["This is a panda.", "This is a zebra.", "This is a bear.", "This is a fox.", "This is a wolf."] },
  { id: 's02', title: 'On the Farm', titleZh: '在农场', difficulty: 'easy', topic: '动物',
    items: [
      { emoji: '🐮', desc: '一头牛', sentence: 'This is a cow.' },
      { emoji: '🐷', desc: '一头猪', sentence: 'This is a pig.' },
      { emoji: '🐔', desc: '一只鸡', sentence: 'This is a chicken.' },
      { emoji: '🐑', desc: '一只羊', sentence: 'This is a sheep.' },
      { emoji: '🐴', desc: '一匹马', sentence: 'This is a horse.' },
    ],
    distractors: ["This is a duck.", "This is a goat.", "This is a donkey.", "This is a hen."] },
  { id: 's03', title: 'Pets', titleZh: '宠物', difficulty: 'easy', topic: '动物',
    items: [
      { emoji: '🐶', desc: '一只狗', sentence: 'This is a dog.' },
      { emoji: '🐱', desc: '一只猫', sentence: 'This is a cat.' },
      { emoji: '🐰', desc: '一只兔子', sentence: 'This is a rabbit.' },
      { emoji: '🐹', desc: '一只仓鼠', sentence: 'This is a hamster.' },
      { emoji: '🐦', desc: '一只鸟', sentence: 'This is a bird.' },
    ],
    distractors: ["This is a fish.", "This is a mouse.", "This is a snake.", "This is a turtle."] },
  { id: 's04', title: 'In the Sea', titleZh: '在海里', difficulty: 'medium', topic: '动物',
    items: [
      { emoji: '🐟', desc: '一条鱼', sentence: 'This is a fish.' },
      { emoji: '🐠', desc: '一条热带鱼', sentence: 'This is a tropical fish.' },
      { emoji: '🐢', desc: '一只乌龟', sentence: 'This is a turtle.' },
      { emoji: '🐬', desc: '一只海豚', sentence: 'This is a dolphin.' },
      { emoji: '🐳', desc: '一条鲸鱼', sentence: 'This is a whale.' },
    ],
    distractors: ["This is a crab.", "This is a starfish.", "This is a shark.", "This is an octopus."] },
  { id: 's05', title: 'Public Buildings', titleZh: '公共建筑', difficulty: 'easy', topic: '地点',
    items: [
      { emoji: '🏫', desc: '一所学校', sentence: 'This is a school.' },
      { emoji: '🏥', desc: '一家医院', sentence: 'This is a hospital.' },
      { emoji: '🏦', desc: '一家银行', sentence: 'This is a bank.' },
      { emoji: '🏛️', desc: '一座博物馆', sentence: 'This is a museum.' },
      { emoji: '🏨', desc: '一家酒店', sentence: 'This is a hotel.' },
    ],
    distractors: ["This is a post office.", "This is a police station.", "This is a fire station.", "This is a cinema."] },
  { id: 's06', title: 'Shops', titleZh: '商店', difficulty: 'easy', topic: '地点',
    items: [
      { emoji: '🛒', desc: '一家超市', sentence: 'This is a supermarket.' },
      { emoji: '🛍️', desc: '一家服装店', sentence: 'This is a clothes shop.' },
      { emoji: '📕', desc: '一家书店', sentence: 'This is a bookshop.' },
      { emoji: '🍞', desc: '一家面包店', sentence: 'This is a bakery.' },
      { emoji: '🥩', desc: '一家肉铺', sentence: 'This is a butcher.' },
    ],
    distractors: ["This is a toy shop.", "This is a market.", "This is a flower shop.", "This is a shoe shop."] },
  { id: 's07', title: 'Fruit', titleZh: '水果', difficulty: 'easy', topic: '食物',
    items: [
      { emoji: '🍎', desc: '一个苹果', sentence: 'This is an apple.' },
      { emoji: '🍌', desc: '一根香蕉', sentence: 'This is a banana.' },
      { emoji: '🍊', desc: '一个橘子', sentence: 'This is an orange.' },
      { emoji: '🍓', desc: '一颗草莓', sentence: 'This is a strawberry.' },
      { emoji: '🍇', desc: '一串葡萄', sentence: 'This is some grapes.' },
    ],
    distractors: ["This is a pear.", "This is a lemon.", "This is a watermelon.", "This is a peach."] },
  { id: 's08', title: 'Food', titleZh: '食物', difficulty: 'easy', topic: '食物',
    items: [
      { emoji: '🍕', desc: '一个披萨', sentence: 'This is a pizza.' },
      { emoji: '🍔', desc: '一个汉堡', sentence: 'This is a burger.' },
      { emoji: '🍰', desc: '一块蛋糕', sentence: 'This is a cake.' },
      { emoji: '🥖', desc: '一块面包', sentence: 'This is some bread.' },
      { emoji: '🥚', desc: '一个鸡蛋', sentence: 'This is an egg.' },
    ],
    distractors: ["This is a sandwich.", "This is a noodle.", "This is a sausage.", "This is a pancake."] },
  { id: 's09', title: 'Drinks', titleZh: '饮料', difficulty: 'easy', topic: '食物',
    items: [
      { emoji: '💧', desc: '一杯水', sentence: 'This is water.' },
      { emoji: '🥛', desc: '一杯牛奶', sentence: 'This is milk.' },
      { emoji: '☕', desc: '一杯咖啡', sentence: 'This is a coffee.' },
      { emoji: '🍵', desc: '一杯茶', sentence: 'This is tea.' },
      { emoji: '🧃', desc: '一杯果汁', sentence: 'This is juice.' },
    ],
    distractors: ["This is a lemonade.", "This is a cola.", "This is a hot chocolate.", "This is a yoghurt."] },
  { id: 's10', title: 'Transport', titleZh: '交通工具', difficulty: 'easy', topic: '交通',
    items: [
      { emoji: '🚌', desc: '一辆公交车', sentence: 'This is a bus.' },
      { emoji: '🚗', desc: '一辆小汽车', sentence: 'This is a car.' },
      { emoji: '🚲', desc: '一辆自行车', sentence: 'This is a bike.' },
      { emoji: '✈️', desc: '一架飞机', sentence: 'This is a plane.' },
      { emoji: '🚆', desc: '一列火车', sentence: 'This is a train.' },
    ],
    distractors: ["This is a taxi.", "This is a boat.", "This is a motorbike.", "This is a subway."] },
  { id: 's11', title: 'Rooms at Home', titleZh: '家里的房间', difficulty: 'easy', topic: '家居',
    items: [
      { emoji: '🛋️', desc: '客厅', sentence: 'This is a living room.' },
      { emoji: '🍳', desc: '厨房', sentence: 'This is a kitchen.' },
      { emoji: '🛏️', desc: '卧室', sentence: 'This is a bedroom.' },
      { emoji: '🚿', desc: '浴室', sentence: 'This is a bathroom.' },
      { emoji: '🚪', desc: '门厅', sentence: 'This is a hallway.' },
    ],
    distractors: ["This is a dining room.", "This is a study.", "This is a garage.", "This is an attic."] },
  { id: 's12', title: 'Nature', titleZh: '大自然', difficulty: 'medium', topic: '自然',
    items: [
      { emoji: '🏖️', desc: '海滩', sentence: 'This is a beach.' },
      { emoji: '🌲', desc: '森林', sentence: 'This is a forest.' },
      { emoji: '⛰️', desc: '高山', sentence: 'This is a mountain.' },
      { emoji: '🏞️', desc: '湖边', sentence: 'This is a lake.' },
      { emoji: '🌸', desc: '花园', sentence: 'This is a garden.' },
    ],
    distractors: ["This is a river.", "This is a field.", "This is an island.", "This is a cave."] },
  { id: 's13', title: 'Weather', titleZh: '天气', difficulty: 'medium', topic: '自然',
    items: [
      { emoji: '☀️', desc: '太阳', sentence: 'This is the sun.' },
      { emoji: '🌧️', desc: '雨', sentence: 'This is rain.' },
      { emoji: '❄️', desc: '雪', sentence: 'This is snow.' },
      { emoji: '🌈', desc: '彩虹', sentence: 'This is a rainbow.' },
      { emoji: '⭐', desc: '星星', sentence: 'This is a star.' },
    ],
    distractors: ["This is wind.", "This is a cloud.", "This is lightning.", "This is fog."] },
  { id: 's14', title: 'School Rooms', titleZh: '学校里的房间', difficulty: 'medium', topic: '学校',
    items: [
      { emoji: '📚', desc: '图书馆', sentence: 'This is a library.' },
      { emoji: '🔬', desc: '科学实验室', sentence: 'This is a science lab.' },
      { emoji: '💻', desc: '计算机房', sentence: 'This is a computer room.' },
      { emoji: '🎨', desc: '美术室', sentence: 'This is an art room.' },
      { emoji: '🎵', desc: '音乐室', sentence: 'This is a music room.' },
    ],
    distractors: ["This is a classroom.", "This is a gym.", "This is a playground.", "This is a canteen."] },
  { id: 's15', title: 'Sports Balls', titleZh: '球类运动', difficulty: 'easy', topic: '运动',
    items: [
      { emoji: '⚽', desc: '一个足球', sentence: 'This is a football.' },
      { emoji: '🏀', desc: '一个篮球', sentence: 'This is a basketball.' },
      { emoji: '🎾', desc: '一个网球', sentence: 'This is a tennis ball.' },
      { emoji: '🏐', desc: '一个排球', sentence: 'This is a volleyball.' },
      { emoji: '⚾', desc: '一个棒球', sentence: 'This is a baseball.' },
    ],
    distractors: ["This is a rugby ball.", "This is a hockey stick.", "This is a badminton racket.", "This is a skateboard."] },
  { id: 's16', title: 'Clothes', titleZh: '衣服', difficulty: 'easy', topic: '服饰',
    items: [
      { emoji: '👕', desc: '一件衬衫', sentence: 'This is a shirt.' },
      { emoji: '👖', desc: '一条裤子', sentence: 'This is a pair of trousers.' },
      { emoji: '🧥', desc: '一件外套', sentence: 'This is a coat.' },
      { emoji: '👟', desc: '一双鞋', sentence: 'This is a pair of shoes.' },
      { emoji: '🧢', desc: '一顶帽子', sentence: 'This is a hat.' },
    ],
    distractors: ["This is a dress.", "This is a skirt.", "This is a scarf.", "This is a glove."] },
  { id: 's17', title: 'Body Parts', titleZh: '身体部位', difficulty: 'medium', topic: '身体',
    items: [
      { emoji: '👀', desc: '眼睛', sentence: 'These are eyes.' },
      { emoji: '👃', desc: '鼻子', sentence: 'This is a nose.' },
      { emoji: '👂', desc: '耳朵', sentence: 'This is an ear.' },
      { emoji: '👄', desc: '嘴巴', sentence: 'This is a mouth.' },
      { emoji: '✋', desc: '手', sentence: 'This is a hand.' },
    ],
    distractors: ["This is a leg.", "This is an arm.", "This is a foot.", "This is a finger."] },
  { id: 's18', title: 'Daily Activities', titleZh: '日常活动', difficulty: 'medium', topic: '日常',
    items: [
      { emoji: '🏃', desc: '跑步', sentence: 'This is running.' },
      { emoji: '💤', desc: '睡觉', sentence: 'This is sleeping.' },
      { emoji: '🍽️', desc: '吃饭', sentence: 'This is eating.' },
      { emoji: '✍️', desc: '写字', sentence: 'This is writing.' },
      { emoji: '📖', desc: '读书', sentence: 'This is reading.' },
    ],
    distractors: ["This is drawing.", "This is singing.", "This is dancing.", "This is swimming."] },
  { id: 's19', title: 'At the Park', titleZh: '在公园', difficulty: 'easy', topic: '地点',
    items: [
      { emoji: '🌳', desc: '一棵树', sentence: 'This is a tree.' },
      { emoji: '🌹', desc: '一朵玫瑰', sentence: 'This is a rose.' },
      { emoji: '🪑', desc: '一把椅子', sentence: 'This is a chair.' },
      { emoji: '🛝', desc: '一个滑梯', sentence: 'This is a slide.' },
      { emoji: '🐿️', desc: '一只松鼠', sentence: 'This is a squirrel.' },
    ],
    distractors: ["This is a bench.", "This is a fountain.", "This is a pond.", "This is a flower."] },
  { id: 's20', title: 'In the City', titleZh: '在城市里', difficulty: 'medium', topic: '地点',
    items: [
      { emoji: '🏙️', desc: '高楼', sentence: 'This is a skyscraper.' },
      { emoji: '🌉', desc: '一座桥', sentence: 'This is a bridge.' },
      { emoji: '🚦', desc: '红绿灯', sentence: 'This is a traffic light.' },
      { emoji: '🗼', desc: '一座塔', sentence: 'This is a tower.' },
      { emoji: '⛲', desc: '一个喷泉', sentence: 'This is a fountain.' },
    ],
    distractors: ["This is a road.", "This is a street.", "This is a square.", "This is a tunnel."] },
  { id: 's21', title: 'In the Kitchen', titleZh: '厨房用品', difficulty: 'medium', topic: '家居',
    items: [
      { emoji: '🔪', desc: '一把刀', sentence: 'This is a knife.' },
      { emoji: '🍴', desc: '一副餐叉', sentence: 'This is a fork.' },
      { emoji: '🥄', desc: '一把勺子', sentence: 'This is a spoon.' },
      { emoji: '🥏', desc: '一个盘子', sentence: 'This is a plate.' },
      { emoji: '🫖', desc: '一个茶壶', sentence: 'This is a teapot.' },
    ],
    distractors: ["This is a bowl.", "This is a glass.", "This is a pan.", "This is a pot."] },
  { id: 's22', title: 'Toys', titleZh: '玩具', difficulty: 'easy', topic: '娱乐',
    items: [
      { emoji: '🧸', desc: '一只玩具熊', sentence: 'This is a teddy bear.' },
      { emoji: '🚂', desc: '一辆玩具火车', sentence: 'This is a toy train.' },
      { emoji: '🪀', desc: '一个球', sentence: 'This is a ball.' },
      { emoji: '🎲', desc: '骰子', sentence: 'This is dice.' },
      { emoji: '🖍️', desc: '一盒蜡笔', sentence: 'This is a box of crayons.' },
    ],
    distractors: ["This is a puzzle.", "This is a kite.", "This is a doll.", "This is a robot."] },
  { id: 's23', title: 'Musical Instruments', titleZh: '乐器', difficulty: 'medium', topic: '音乐',
    items: [
      { emoji: '🎸', desc: '一把吉他', sentence: 'This is a guitar.' },
      { emoji: '🎹', desc: '一架钢琴', sentence: 'This is a piano.' },
      { emoji: '🥁', desc: '一面鼓', sentence: 'This is a drum.' },
      { emoji: '🎻', desc: '一把小提琴', sentence: 'This is a violin.' },
      { emoji: '🎺', desc: '一把小号', sentence: 'This is a trumpet.' },
    ],
    distractors: ["This is a flute.", "This is a saxophone.", "This is a harp.", "This is a cello."] },
  { id: 's24', title: 'Jobs', titleZh: '职业', difficulty: 'hard', topic: '职业',
    items: [
      { emoji: '👮', desc: '一名警察', sentence: 'This is a police officer.' },
      { emoji: '👨‍⚕️', desc: '一名医生', sentence: 'This is a doctor.' },
      { emoji: '👩‍🍳', desc: '一名厨师', sentence: 'This is a cook.' },
      { emoji: '👨‍🏫', desc: '一名老师', sentence: 'This is a teacher.' },
      { emoji: '👨‍🔧', desc: '一名修理工', sentence: 'This is a mechanic.' },
    ],
    distractors: ["This is a nurse.", "This is a farmer.", "This is a driver.", "This is a waiter."] },
];

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// 确定性洗牌（避免每次运行结果不同）
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function serialize(): string {
  const blocks: string[] = [];
  THEMES.forEach((t, ti) => {
    // 共享 8 句：5 正确 + 3 干扰（确定性洗牌，避免正确句总在前）
    const correctSentences = t.items.map((it) => it.sentence);
    const distractorPool = t.distractors.filter((d) => !correctSentences.includes(d));
    const extra = distractorPool.slice(0, 3);
    const sentences = seededShuffle([...correctSentences, ...extra], ti + 1);
    if (sentences.length !== 8) throw new Error(`主题 ${t.id} 句子数=${sentences.length}, 期望 8`);
    if (new Set(sentences).size !== 8) throw new Error(`主题 ${t.id} 句子有重复`);

    const qLines = t.items.map((it, qi) => {
      if (!sentences.includes(it.sentence)) throw new Error(`主题 ${t.id} 正确句不在 sentences: ${it.sentence}`);
      return `      { id: 'p1-${t.id}-q${qi + 1}', emoji: '${it.emoji}', imageDesc: '${esc(it.desc)}',\n` +
        `        answer: '${esc(it.sentence)}',\n      },`;
    }).join('\n');

    blocks.push(
      `  {\n` +
      `    id: 'p1-${t.id}',\n` +
      `    title: '${esc(t.title)}',\n` +
      `    titleZh: '${esc(t.titleZh)}',\n` +
      `    difficulty: '${t.difficulty}',\n` +
      `    topic: '${esc(t.topic)}',\n` +
      `    sentences: [\n${sentences.map((s) => `      '${esc(s)}',`).join('\n')}\n    ],\n` +
      `    questions: [\n${qLines}\n    ],\n` +
      `  },`
    );
  });
  return `export const part1Articles: Part1Article[] = [\n${blocks.join('\n')}\n];`;
}

const block = serialize();
const src = fs.readFileSync('src/data/reading.ts', 'utf8');
const startIdx = src.indexOf('export const part1Articles');
const endIdx = src.indexOf('export const part2Articles');
if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) throw new Error('未找到 part1Articles/part2Articles 边界');
const newSrc = src.slice(0, startIdx) + block + '\n\n' + src.slice(endIdx);
fs.writeFileSync('src/data/reading.ts', newSrc, 'utf8');

console.log(`DONE: 生成 ${THEMES.length} 组 / ${THEMES.reduce((n, t) => n + t.items.length, 0)} 题，每组 5 图 + 共享 8 句。已写回 src/data/reading.ts`);
