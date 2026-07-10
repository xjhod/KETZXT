// fix_reading_p1.mts
// 修复 Reading Part 1（看图配对）数据：
//  - 每个 emoji/imageDesc 对应唯一正确英文句（CORRECT 映射）
//  - 重建 options 为 4 项（正确句 + 3 个同范畴干扰项），压掉原来 7~8 个模板化重复选项
//  - answer 设为正确句，消除系统性答案错配
//  - 用「下一个顶层 const part2Articles」做边界，整体替换 part1Articles 块（避开括号定位坑）
//
// 运行：node --experimental-strip-types fix_reading_p1.mts

import * as fs from 'node:fs';
import * as reading from './src/data/reading.ts';

type Q = { id: string; emoji: string; imageDesc: string; options: string[]; answer: string };
type Article = {
  id: string; title: string; titleZh: string; difficulty: string; topic: string;
  questions: Q[];
};

const part1 = reading.part1Articles as unknown as Article[];

// 每个问题的正确英文句（依据 emoji + imageDesc 语义人工核对）
const CORRECT: Record<string, string> = {
  'p1q001-1': "This is an elephant.",
  'p1q002-1': "This is a park.",
  'p1q003-1': "This is a supermarket.",
  'p1q004-1': "This is a zoo.",
  'p1q005-1': "This is a beach.",
  'p1q006-1': "This is a school.",
  'p1q007-1': "This is a home.",
  'p1q008-1': "This is a kitchen.",
  'p1q009-1': "This is a bedroom.",
  'p1q010-1': "This is a garden.",
  'p1q011-1': "This is a restaurant.",
  'p1q012-1': "This is a cinema.",
  'p1q013-1': "This is a library.",
  'p1q014-1': "This is a hospital.",
  'p1q015-1': "This is a post office.",
  'p1q016-1': "This is a bank.",
  'p1q017-1': "This is a train station.",
  'p1q018-1': "This is an airport.",
  'p1q019-1': "This is a bus.",
  'p1q020-1': "This is a car.",
  'p1q021-1': "This is a bike.",
  'p1q022-1': "This is a museum.",
  'p1q023-1': "This is a theatre.",
  'p1q024-1': "This is a concert.",
  'p1q025-1': "This is a gym.",
  'p1q026-1': "This is a swimming pool.",
  'p1q027-1': "This is a playground.",
  'p1q028-1': "This is a forest.",
  'p1q029-1': "This is a farm.",
  'p1q030-1': "This is a lake.",
  'p1q031-1': "This is a mountain.",
  'p1q032-1': "This is a shopping centre.",
  'p1q033-1': "This is a clothes shop.",
  'p1q034-1': "This is a bookshop.",
  'p1q035-1': "This is a bakery.",
  'p1q036-1': "This is a butcher.",
  'p1q037-1': "This is a fish shop.",
  'p1q038-1': "This is a toy shop.",
  'p1q039-1': "This is a classroom.",
  'p1q040-1': "This is a computer room.",
  'p1q041-1': "This is a science lab.",
  'p1q042-1': "This is a sports centre.",
  'p1q043-1': "This is a doctor's.",
  'p1q044-1': "This is a dentist's.",
  'p1q045-1': "This is a hairdresser's.",
  'p1q046-1': "This is a police station.",
  'p1q047-1': "This is a fire station.",
  'p1q048-1': "This is a hotel.",
  'p1q049-1': "This is a cafe.",
  'p1q050-1': "This is a stadium.",
};

const CATEGORY: Record<string, string> = {
  'p1q001-1': 'animal', 'p1q002-1': 'publicBldg', 'p1q003-1': 'shops', 'p1q004-1': 'zoo',
  'p1q005-1': 'nature', 'p1q006-1': 'publicBldg', 'p1q007-1': 'homeRooms', 'p1q008-1': 'homeRooms',
  'p1q009-1': 'homeRooms', 'p1q010-1': 'nature', 'p1q011-1': 'eating', 'p1q012-1': 'leisure',
  'p1q013-1': 'schoolRooms', 'p1q014-1': 'medical', 'p1q015-1': 'publicBldg', 'p1q016-1': 'publicBldg',
  'p1q017-1': 'transport', 'p1q018-1': 'transport', 'p1q019-1': 'transport', 'p1q020-1': 'transport',
  'p1q021-1': 'transport', 'p1q022-1': 'publicBldg', 'p1q023-1': 'leisure', 'p1q024-1': 'leisure',
  'p1q025-1': 'leisure', 'p1q026-1': 'leisure', 'p1q027-1': 'leisure', 'p1q028-1': 'nature',
  'p1q029-1': 'nature', 'p1q030-1': 'nature', 'p1q031-1': 'nature', 'p1q032-1': 'shops',
  'p1q033-1': 'shops', 'p1q034-1': 'shops', 'p1q035-1': 'shops', 'p1q036-1': 'shops',
  'p1q037-1': 'shops', 'p1q038-1': 'shops', 'p1q039-1': 'schoolRooms', 'p1q040-1': 'schoolRooms',
  'p1q041-1': 'schoolRooms', 'p1q042-1': 'leisure', 'p1q043-1': 'medical', 'p1q044-1': 'medical',
  'p1q045-1': 'medical', 'p1q046-1': 'publicBldg', 'p1q047-1': 'publicBldg', 'p1q048-1': 'publicBldg',
  'p1q049-1': 'eating', 'p1q050-1': 'leisure',
};

// 同范畴干扰池（ plausible 错误答案 ）
const POOLS: Record<string, string[]> = {
  animal: ["This is a lion.", "This is a tiger.", "This is a monkey.", "This is a giraffe.", "This is a zebra."],
  zoo: ["This is a park.", "This is a farm.", "This is a garden.", "This is a forest."],
  nature: ["This is a beach.", "This is a garden.", "This is a forest.", "This is a farm.", "This is a lake.", "This is a mountain.", "This is a park."],
  transport: ["This is a bus.", "This is a car.", "This is a bike.", "This is a train station.", "This is an airport.", "This is a taxi."],
  homeRooms: ["This is a kitchen.", "This is a bedroom.", "This is a living room.", "This is a bathroom.", "This is a dining room."],
  schoolRooms: ["This is a classroom.", "This is a library.", "This is a computer room.", "This is a science lab.", "This is a playground."],
  shops: ["This is a clothes shop.", "This is a bookshop.", "This is a bakery.", "This is a butcher.", "This is a fish shop.", "This is a toy shop.", "This is a supermarket.", "This is a market."],
  eating: ["This is a restaurant.", "This is a cafe.", "This is a bakery.", "This is a supermarket."],
  publicBldg: ["This is a school.", "This is a hospital.", "This is a post office.", "This is a bank.", "This is a museum.", "This is a police station.", "This is a fire station.", "This is a hotel.", "This is a library."],
  leisure: ["This is a cinema.", "This is a theatre.", "This is a museum.", "This is a concert.", "This is a gym.", "This is a swimming pool.", "This is a playground.", "This is a sports centre.", "This is a stadium."],
  medical: ["This is a hospital.", "This is a doctor's.", "This is a dentist's.", "This is a hairdresser's.", "This is a chemist's."],
};

const GENERAL: string[] = Object.values(CORRECT);

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildOptions(id: string, idx: number): string[] {
  const correct = CORRECT[id];
  const cat = CATEGORY[id];
  let pool = (POOLS[cat] || []).filter((x) => x !== correct);
  if (pool.length < 3) {
    const extra = GENERAL.filter((x) => x !== correct && !pool.includes(x));
    pool = pool.concat(extra);
  }
  const distractors = pool.slice(0, 3);
  const arr = [correct, ...distractors];
  const rot = idx % 4; // 让正确项不在固定位置
  return arr.slice(rot).concat(arr.slice(0, rot));
}

// 序列化单个问题
function serializeQuestion(q: Q, idx: number): string {
  const correct = CORRECT[q.id];
  if (!correct) throw new Error(`缺少正确句映射: ${q.id}`);
  const options = buildOptions(q.id, idx);
  if (!options.includes(correct)) throw new Error(`正确句未进入 options: ${q.id}`);
  if (new Set(options).size !== options.length) throw new Error(`options 有重复: ${q.id}`);
  const optLines = options.map((o) => `          '${esc(o)}',`).join('\n');
  return `      { id: '${q.id}', emoji: '${q.emoji}', imageDesc: '${esc(q.imageDesc)}',\n` +
    `        options: [\n${optLines}\n        ],\n` +
    `        answer: '${esc(correct)}',\n` +
    `      },`;
}

function serializeArticle(a: Article): string {
  const qLines = a.questions.map((q, i) => serializeQuestion(q, i)).join('\n');
  return `  {\n` +
    `    id: '${a.id}',\n` +
    `    title: '${esc(a.title)}',\n` +
    `    titleZh: '${esc(a.titleZh)}',\n` +
    `    difficulty: '${a.difficulty}',\n` +
    `    topic: '${esc(a.topic)}',\n` +
    `    questions: [\n${qLines}\n    ],\n` +
    `  },`;
}

// 重建
const newArticles = part1.map((a) => ({
  ...a,
  questions: a.questions.map((q) => {
    const correct = CORRECT[q.id];
    if (!correct) throw new Error(`未知题目 id: ${q.id}`);
    return { ...q, answer: correct, options: buildOptions(q.id, 0) };
  }),
}));

const block =
  `export const part1Articles: Part1Article[] = [\n` +
  newArticles.map(serializeArticle).join('\n') +
  `\n];`;

// 用边界替换
const src = fs.readFileSync('src/data/reading.ts', 'utf8');
const startIdx = src.indexOf('export const part1Articles');
const endIdx = src.indexOf('export const part2Articles');
if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) {
  throw new Error('未找到 part1Articles / part2Articles 边界');
}
const newSrc = src.slice(0, startIdx) + block + '\n\n' + src.slice(endIdx);
fs.writeFileSync('src/data/reading.ts', newSrc, 'utf8');

// 统计
let ok = 0, bad = 0;
for (const a of newArticles) {
  for (const q of a.questions) {
    if (q.answer === CORRECT[q.id] && q.options.includes(q.answer) && q.options.length === 4) ok++;
    else { bad++; console.log('BAD', q.id, q.answer, CORRECT[q.id]); }
  }
}
console.log(`\nDONE: 重写 ${newArticles.length} 篇 / 共 ${ok} 题通过自校验（bad=${bad}）`);
console.log('options 数均=4, answer=正确句, 无重复。文件已写回 src/data/reading.ts');
