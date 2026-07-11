// 校验听力 Part 3（KET 标准：长对话选择题 A/B/C）数据完整性
// 用法：node --experimental-strip-types check_listening_p3.mts
import { part3Sets } from './listening.ts';

let errors = 0;
let warnings = 0;
const err = (m: string) => { console.log('  [ERROR] ' + m); errors++; };
const warn = (m: string) => { console.log('  [WARN]  ' + m); warnings++; };

console.log(`=== 听力 Part 3 校验：共 ${part3Sets.length} 套 ===\n`);

const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?'"]/g, '').trim();

for (const set of part3Sets) {
  const tag = set.id || '(no-id)';
  console.log(`--- ${tag} (${set.titleZh || set.title || '?'}) ---`);

  if (!set.speakerA) warn(`${tag}: 缺 speakerA`);
  if (!set.speakerB) warn(`${tag}: 缺 speakerB`);
  if (!set.conversationAudio || !set.conversationAudio.trim()) err(`${tag}: conversationAudio 为空`);
  if (!set.transcript || !set.transcript.trim()) err(`${tag}: transcript 为空`);

  if (set.conversationAudio && set.transcript && norm(set.conversationAudio) !== norm(set.transcript)) {
    warn(`${tag}: conversationAudio 与 transcript 不完全一致`);
  }

  if (!Array.isArray(set.questions) || set.questions.length === 0) {
    err(`${tag}: 无 questions`);
    continue;
  }
  if (set.questions.length !== 5) warn(`${tag}: questions 数量=${set.questions.length}（KET 标准 5）`);

  const transcriptNorm = norm(set.transcript || '');
  const answerLetters = new Set<string>();

  set.questions.forEach((q, i) => {
    const qt = `${tag}-Q${i + 1}`;
    if (!q.question || !q.question.trim()) err(`${qt}: question 为空`);
    if (!Array.isArray(q.options) || q.options.length === 0) {
      err(`${qt}: 无 options`);
      return;
    }
    if (q.options.length !== 3) warn(`${qt}: options 数量=${q.options.length}（建议 3）`);
    if (!/^[A-C]$/.test(q.answer || '')) err(`${qt}: answer「${q.answer}」非法（应为 A/B/C）`);
    else {
      answerLetters.add(q.answer);
      const correctIdx = q.answer.charCodeAt(0) - 65;
      if (correctIdx >= q.options.length) err(`${qt}: answer 索引越界（选项不足）`);
    }
    if (!q.explanation || !q.explanation.trim()) warn(`${qt}: 缺 explanation 解析`);
    if (q.audioText && !transcriptNorm.includes(norm(q.audioText))) {
      warn(`${qt}: audioText 未在 transcript 中出现：${q.audioText}`);
    }
  });

  if (answerLetters.size < 2) warn(`${tag}: 答案分布单一（仅 ${[...answerLetters].join('')}），建议分散`);
}

console.log(`\n=== 结果：errors=${errors}, warnings=${warnings} ===`);
if (errors === 0) console.log('✅ 数据完整性 ALL OK');
else console.log('❌ 存在数据错误，需修复');
