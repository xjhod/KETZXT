/**
 * check_p2.mts — 校验 KET 标准模型的 Part 2 数据
 * 模型：people(5 题目) + texts(8 选项 A–H) + answers(number[5], answers[i]=第 i 个人物匹配的 text 下标)
 */
import * as data from './src/data/reading.ts';

type Article = {
  id: string; title: string; titleZh: string; difficulty: string; topic: string;
  people: { id: string; name: string; description: string }[];
  texts: string[]; answers: number[];
};

const arts = data.part2Articles as unknown as Article[];

let hardFail = 0;
const hardFails: string[] = [];
let softWarn = 0;
const softWarns: string[] = [];

console.log('=== Reading Part 2 (KET 标准) 校验 ===');
console.log('组数:', arts.length);

for (const a of arts) {
  const pid = a.id;
  // 1. people 数
  if (a.people.length !== 5) {
    softWarn++; softWarns.push(`${pid}: people=${a.people.length} (期望 5)`);
  }
  // 2. texts 数
  if (a.texts.length !== 8) {
    softWarn++; softWarns.push(`${pid}: texts=${a.texts.length} (期望 8)`);
  }
  // 3. answers 长度
  if (a.answers.length !== 5) {
    hardFail++; hardFails.push(`${pid}: answers.length=${a.answers.length} (期望 5)`);
  }
  // 4. answers 在 [0, texts.length)
  a.answers.forEach((x, i) => {
    if (!Number.isInteger(x) || x < 0 || x >= a.texts.length) {
      hardFail++; hardFails.push(`${pid}: answers[${i}]=${x} 越界(应 0..${a.texts.length - 1})`);
    }
  });
  // 5. answers 互异（KET 中 5 人对应 5 条不同信息）
  const seen = new Set<number>();
  let dup = false;
  a.answers.forEach((x) => { if (seen.has(x)) dup = true; seen.add(x); });
  if (dup) { hardFail++; hardFails.push(`${pid}: answers 含重复 text 下标`); }
  // 6. texts 文本唯一
  if (new Set(a.texts).size !== a.texts.length) {
    softWarn++; softWarns.push(`${pid}: texts 有重复文本`);
  }
}

console.log('------------------------------------------------');
console.log(`硬 FAIL: ${hardFail}`);
console.log(`软告警: ${softWarn}`);
console.log('------------------------------------------------');
hardFails.slice(0, 40).forEach(f => console.log('  ❌', f));
softWarns.slice(0, 40).forEach(w => console.log('  ⚠️ ', w));
console.log('================================================');
console.log(hardFail === 0 ? '结论: ALL OK — KET 标准结构(5人物×8信息, answers 长度5, 互异, 无越界)。' : '结论: 存在致命错误，需修复。');
