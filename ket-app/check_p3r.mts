import * as data from './src/data/reading.ts';

const arts = (data as any).part3RCArticles as any[];

let hardFail = 0;
let soft = 0;
let missingQuestionZh = 0;
let letterAnswer = 0;
let totalQ = 0;
const optLenCount: Record<number, number> = {};
const diffCount: Record<string, number> = {};
const qPerGroup: Record<number, number> = {};

for (const a of arts) {
  const qs = a.questions || [];
  diffCount[a.difficulty] = (diffCount[a.difficulty] || 0) + 1;
  qPerGroup[qs.length] = (qPerGroup[qs.length] || 0) + 1;
  const seen = new Set<string>();
  for (const q of qs) {
    totalQ++;
    // questionZh
    if (!q.questionZh || typeof q.questionZh !== 'string' || q.questionZh.trim() === '') {
      missingQuestionZh++; hardFail++; console.log(`FAIL no questionZh ${a.id}/${q.id}`);
    }
    // options
    const nOpt = (q.options || []).length;
    optLenCount[nOpt] = (optLenCount[nOpt] || 0) + 1;
    if (nOpt < 3 || nOpt > 4) { hardFail++; console.log(`FAIL bad opt count ${nOpt} ${a.id}/${q.id}`); }
    // answer 必须是选项文本
    if (typeof q.answer !== 'string' || q.answer.trim() === '') {
      hardFail++; console.log(`FAIL empty answer ${a.id}/${q.id}`);
    } else if (q.answer.length === 1 && /[A-H]/.test(q.answer)) {
      letterAnswer++; hardFail++; console.log(`FAIL letter answer (应为文本) ${a.id}/${q.id}=${q.answer}`);
    } else if (!q.options.includes(q.answer)) {
      hardFail++; console.log(`FAIL answer 不在 options ${a.id}/${q.id}=${q.answer}`);
    }
    // id 唯一
    if (seen.has(q.id)) { hardFail++; console.log(`FAIL dup qid ${q.id}`); }
    seen.add(q.id);
    // explanation
    if (!q.explanation || !q.explanation.trim()) { soft++; }
    // question
    if (!q.question || !q.question.trim()) { hardFail++; console.log(`FAIL empty question ${a.id}/${q.id}`); }
  }
}

console.log('========================================');
console.log(`Part3RC 组数=${arts.length}`);
console.log(`题目总数=${totalQ}`);
console.log(`缺失 questionZh=${missingQuestionZh}`);
console.log(`仍为字母 answer=${letterAnswer}`);
console.log(`选项数分布=`, optLenCount);
console.log(`难度分布=`, diffCount);
console.log(`每题数分布=`, qPerGroup);
console.log(`硬 FAIL=${hardFail}, 软告警=${soft}`);
console.log(hardFail === 0 ? 'ALL OK: answer 均为选项文本, questionZh 全覆盖, 无重复 id, 选项4个' : 'HAS HARD FAIL');
