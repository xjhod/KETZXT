// 校验听力 Part 4（KET 标准：图片选择题）数据完整性
// 用法：node --experimental-strip-types check_listening_p4.mts
import { part4Sets } from './listening.ts';

let errors = 0;
let warnings = 0;
const err = (m: string) => { console.log('  [ERROR] ' + m); errors++; };
const warn = (m: string) => { console.log('  [WARN]  ' + m); warnings++; };

console.log(`=== 听力 Part 4 校验（图片选择题）：共 ${part4Sets.length} 套 ===\n`);

for (const set of part4Sets) {
  const tag = set.id || '(no-id)';
  console.log(`--- ${tag} (${set.titleZh || set.title || '?'}) ---`);

  if (!Array.isArray(set.questions) || set.questions.length === 0) {
    err(`${tag}: 无 questions`);
    continue;
  }
  if (set.questions.length !== 5) warn(`${tag}: questions 数量=${set.questions.length}（KET 标准 5）`);

  const answerLetters = new Set<string>();

  set.questions.forEach((q, i) => {
    const qt = `${tag}-Q${i + 1}`;
    if (!q.speakerA) warn(`${qt}: 缺 speakerA`);
    if (!q.speakerB) warn(`${qt}: 缺 speakerB`);
    if (!q.audioText || !q.audioText.trim()) err(`${qt}: audioText 为空`);
    if (!q.question || !q.question.trim()) err(`${qt}: question 为空`);
    if (!Array.isArray(q.options) || q.options.length === 0) {
      err(`${qt}: 无 options`);
      return;
    }
    if (q.options.length !== 3) warn(`${qt}: options 数量=${q.options.length}（应为 3 图）`);
    q.options.forEach((o: any, oi: number) => {
      if (!o.emoji) warn(`${qt}-opt${oi + 1}: 缺 emoji`);
      if (!o.desc) warn(`${qt}-opt${oi + 1}: 缺 desc`);
    });
    if (!/^[A-C]$/.test(q.answer || '')) err(`${qt}: answer「${q.answer}」非法（应为 A/B/C）`);
    else {
      answerLetters.add(q.answer);
      const correctIdx = q.answer.charCodeAt(0) - 65;
      if (correctIdx >= q.options.length) err(`${qt}: answer 索引越界（选项不足）`);
    }
    if (!q.explanation || !q.explanation.trim()) warn(`${qt}: 缺 explanation 解析`);
  });

  if (answerLetters.size < 2) warn(`${tag}: 答案分布单一（仅 ${[...answerLetters].join('')}）`);
}

console.log(`\n=== 结果：errors=${errors}, warnings=${warnings} ===`);
if (errors === 0) console.log('✅ 数据完整性 ALL OK');
else console.log('❌ 存在数据错误，需修复');
