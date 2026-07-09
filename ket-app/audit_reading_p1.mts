// Part 1 看图配对 全量审计脚本
// 运行: node --experimental-strip-types audit_reading_p1.mts
import { part1Articles } from './src/data/reading.ts';

const problems: string[] = [];
const warnings: string[] = [];

let total = 0;
let optGt4 = 0;
let ansNotInOpts = 0;
let dupOpts = 0;

for (const a of part1Articles) {
  for (const q of a.questions) {
    total++;
    if (!q.emoji || !q.imageDesc) problems.push(`${q.id} 缺 emoji/imageDesc`);
    if (!Array.isArray(q.options) || q.options.length === 0) {
      problems.push(`${q.id} 无选项`);
    } else {
      if (q.options.length > 4) optGt4++;
      const uniq = new Set(q.options);
      if (uniq.size !== q.options.length) {
        dupOpts++;
        warnings.push(`${q.id} 选项重复: [${q.options.join(' | ')}]`);
      }
      if (!q.options.includes(q.answer)) {
        ansNotInOpts++;
        problems.push(`${q.id} 答案不在选项中: ans="${q.answer}" opts=[${q.options.join(' | ')}]`);
      }
    }
    if (!q.answer) problems.push(`${q.id} 缺 answer`);
  }
}

console.log('===== DUMP ALL 50 QUESTIONS =====');
for (const a of part1Articles) {
  for (const q of a.questions) {
    console.log(JSON.stringify({ id: q.id, emoji: q.emoji, desc: q.imageDesc, ans: q.answer, opts: q.options }));
  }
}

console.log('===== SUMMARY =====');
console.log(`total=${total} optGt4(>4)=${optGt4} ansNotInOpts=${ansNotInOpts} dupOpts=${dupOpts} problems=${problems.length} warnings=${warnings.length}`);
if (problems.length) {
  console.log('--- PROBLEMS ---');
  problems.forEach(p => console.log('  [FAIL] ' + p));
}
if (warnings.length) {
  console.log('--- DUP WARNINGS ---');
  warnings.forEach(w => console.log('  [WARN] ' + w));
}
