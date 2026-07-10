/**
 * gen_reading_p2.mts
 * 将现有 Part 2（反转版：8 陈述各自匹配 5 人物之一）转换为 KET 标准模型：
 *   - people: 5 个人物（题目）
 *   - texts:  8 则信息（选项 A–H）
 *   - answers: number[] 长度 5，answers[i] = 第 i 个人物匹配的 text 下标(0..7)
 * 转换规则：对每个 person，从其匹配的 statement 中取“第一个下标”作为该题答案；
 *           其余 statement 自动成为未选中的干扰项（KET 中恰有 3 则信息不被任何人选中）。
 * 用「下一个顶层 const」边界替换 reading.ts 的 part2Articles 块。
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as data from './src/data/reading.ts';

type OldArticle = {
  id: string; title: string; titleZh: string;
  difficulty: 'easy' | 'medium' | 'hard'; topic: string;
  people: { id: string; name: string; description: string }[];
  statements: string[];
  answers: string[]; // 长度=statements，answers[stmtIdx]=personId
};

const old = data.part2Articles as unknown as OldArticle[];

// 保留 UTF-8 原文、仅转义必要字符的双引号字符串化
function qs(s: string): string {
  return '"' + s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t') + '"';
}

const newArticles: {
  id: string; title: string; titleZh: string; difficulty: string; topic: string;
  people: { id: string; name: string; description: string }[];
  texts: string[]; answers: number[];
}[] = [];

const warnings: string[] = [];
let hardFail = 0;

for (const a of old) {
  const pid = a.id;
  const peopleIds = a.people.map(p => p.id);
  const texts = a.statements;
  const N = texts.length;

  // 预计算每个 person 命中的 statement 下标
  const matchIdx: Record<string, number[]> = {};
  a.answers.forEach((ans, i) => {
    if (!matchIdx[ans]) matchIdx[ans] = [];
    matchIdx[ans].push(i);
  });

  const answers: number[] = [];
  for (const pId of peopleIds) {
    const idxs = matchIdx[pId];
    if (!idxs || idxs.length === 0) {
      hardFail++;
      warnings.push(`${pid}: 人物 ${pId} 无任何匹配 statement（无法生成答案）`);
      answers.push(-1);
    } else {
      if (idxs.length > 1) {
        warnings.push(`${pid}: 人物 ${pId} 命中 ${idxs.length} 条 statement(${idxs.join(',')})，取第一条 idx=${idxs[0]} 作为 KET 答案，其余转为干扰项`);
      }
      answers.push(idxs[0]);
    }
  }

  // 校验
  if (a.people.length !== 5) { hardFail++; warnings.push(`${pid}: people=${a.people.length}!=5`); }
  if (N !== 8) { hardFail++; warnings.push(`${pid}: texts=${N}!=8`); }
  if (answers.length !== 5) { hardFail++; warnings.push(`${pid}: answers.length=${answers.length}!=5`); }
  // 答案互异且在 [0,N)
  const seen = new Set<number>();
  for (const x of answers) {
    if (x < 0 || x >= N) { hardFail++; warnings.push(`${pid}: answers 含越界 ${x}`); }
    if (seen.has(x)) { hardFail++; warnings.push(`${pid}: answers 重复下标 ${x}`); }
    seen.add(x);
  }

  newArticles.push({
    id: a.id, title: a.title, titleZh: a.titleZh,
    difficulty: a.difficulty, topic: a.topic,
    people: a.people, texts, answers,
  });
}

if (hardFail > 0) {
  console.error('❌ 转换前校验失败，未写入。问题：');
  warnings.slice(0, 50).forEach(w => console.error('  -', w));
  process.exit(1);
}

// ---- 序列化新块 ----
function serialize(): string {
  const blocks = newArticles.map(a => {
    const peopleStr = a.people
      .map(p => `      { id: ${qs(p.id)}, name: ${qs(p.name)}, description: ${qs(p.description)} }`)
      .join(',\n');
    const textsStr = a.texts.map(t => `      ${qs(t)}`).join(',\n');
    return `  {\n    id: ${qs(a.id)},\n    title: ${qs(a.title)},\n    titleZh: ${qs(a.titleZh)},\n    difficulty: ${qs(a.difficulty)},\n    topic: ${qs(a.topic)},\n    people: [\n${peopleStr}\n    ],\n    texts: [\n${textsStr}\n    ],\n    answers: [${a.answers.join(', ')}],\n  }`;
  });
  return `export const part2Articles: Part2Article[] = [\n${blocks.join(',\n')}\n];\n`;
}

const newBlock = serialize();

// ---- 边界替换 ----
const file = path.resolve('src/data/reading.ts');
const content = fs.readFileSync(file, 'utf-8');
const startTag = 'export const part2Articles';
const startIdx = content.indexOf(startTag);
if (startIdx < 0) { console.error('❌ 找不到', startTag); process.exit(1); }
const endTag = 'export const part3ClozeArticles';
const endIdx = content.indexOf(endTag, startIdx);
if (endIdx < 0) { console.error('❌ 找不到下一个顶层 const', endTag); process.exit(1); }

const newContent = content.slice(0, startIdx) + newBlock + '\n' + content.slice(endIdx);
fs.writeFileSync(file, newContent, 'utf-8');

console.log(`✅ 已重写 part2Articles：${newArticles.length} 组，KET 标准模型(5人物×8信息, answers 长度5)`);
console.log(`⚠️ 选取首匹配的人物：${warnings.length} 条提示（不影响正确性，属 KET 标准应有的 3 则干扰项）`);
warnings.slice(0, 12).forEach(w => console.log('   ·', w));
