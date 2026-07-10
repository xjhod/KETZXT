// check_p1.mts — 校验新的 Part1 结构（每组5图+共享8句）
import * as reading from './src/data/reading.ts';

const part1 = reading.part1Articles as any[];
let errors: string[] = [];
const emojiSeen: Record<string, string> = {};

for (const a of part1) {
  if (!Array.isArray(a.sentences) || a.sentences.length !== 8) errors.push(`${a.id}: sentences 数=${a.sentences?.length} (期望8)`);
  if (new Set(a.sentences).size !== 8) errors.push(`${a.id}: sentences 有重复`);
  if (!Array.isArray(a.questions) || a.questions.length !== 5) errors.push(`${a.id}: 题数=${a.questions?.length} (期望5)`);
  for (const q of a.questions) {
    if (!a.sentences.includes(q.answer)) errors.push(`${a.id}/${q.id}: answer 不在 sentences -> ${q.answer}`);
    if (emojiSeen[q.emoji]) errors.push(`emoji 重复: ${q.emoji} 用于 ${emojiSeen[q.emoji]} 与 ${a.id}`);
    else emojiSeen[q.emoji] = a.id;
  }
}

console.log(`组数=${part1.length}, 总题数=${part1.reduce((n,a)=>n+a.questions.length,0)}`);
if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
else console.log('ALL OK: 每组5图+共享8句, answer均在sentences, emoji全唯一, 无重复句。');
