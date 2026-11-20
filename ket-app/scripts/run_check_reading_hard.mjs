// 校验阅读较难题库增补：6 类各 6 篇、结构完整、答案一致、合并生效、难度筛选存在。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error('  FAIL ' + msg); } };

async function load(entry) {
  const b = await rolldown({ input: entry });
  const { output } = await b.generate({ format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64'));
}

const E = await load('src/data/readingHardExtra.ts');
const R = await load('src/data/reading.ts');

console.log('=== 1. 增量篇数：6 类各 6 篇 ===');
const groups = {
  part1: E.part1HardExtra, part2: E.part2HardExtra, part3c: E.part3ClozeHardExtra,
  part3r: E.part3RCHardExtra, part4: E.part4TFHardExtra, part5: E.part5HardExtra,
};
for (const [k, arr] of Object.entries(groups)) {
  ok(arr.length === 6, `${k} 增补 ${arr.length} 篇（应 6）`);
  ok(arr.every(a => a.difficulty === 'hard'), `${k} 全部 difficulty=hard`);
  const ids = arr.map(a => a.id);
  ok(new Set(ids).size === ids.length, `${k} id 唯一`);
  ok(ids.every(id => id.includes('-xh')), `${k} id 用 -xh 前缀`);
}

console.log('=== 2. 结构完整性与答案一致性 ===');
for (const a of E.part1HardExtra) {
  ok(a.sentences.length === 8, `${a.id} 8 个共享句子`);
  ok(a.questions.length === 5, `${a.id} 5 道题`);
  ok(a.questions.every(q => a.sentences.includes(q.answer)), `${a.id} 每题答案在 sentences 内`);
}
for (const a of E.part2HardExtra) {
  ok(a.people.length === 5 && a.texts.length === 8 && a.answers.length === 5, `${a.id} 结构 5/8/5`);
  ok(a.answers.every(x => Number.isInteger(x) && x >= 0 && x < 8), `${a.id} 匹配下标 0..7`);
}
for (const a of E.part3ClozeHardExtra) {
  ok((a.passage.match(/____/g) || []).length === a.blanks.length, `${a.id} 空格数=blanks`);
  ok(a.blanks.every(b => b.options.includes(b.answer)), `${a.id} 答案在 options`);
  ok(a.blanks.every(b => a.passageFull.includes(b.answer)), `${a.id} passageFull 含各答案`);
}
for (const a of E.part3RCHardExtra) {
  ok(a.questions.every(q => q.options.length === 4 && q.options.includes(q.answer)), `${a.id} 四选一答案在 options`);
  ok(/[一-龥]/.test(a.articleZh) && !a.articleZh.includes('eration'), `${a.id} 中文译文正常无乱码`);
}
for (const a of E.part4TFHardExtra) {
  ok(a.statements.length === 7, `${a.id} 7 条陈述`);
  ok(a.statements.every(s => ['T', 'F', 'DN'].includes(s.answer)), `${a.id} 答案 T/F/DN`);
}
for (const a of E.part5HardExtra) {
  ok((a.passage.match(/____/g) || []).length === a.blanks.length, `${a.id} 空格数=blanks`);
  ok(a.blanks.every(b => a.passageFull.includes(b.answer)), `${a.id} passageFull 含各答案`);
}

console.log('=== 3. 合并到主题库生效 ===');
const merged = {
  part1: R.part1Articles, part2: R.part2Articles, part3c: R.part3ClozeArticles,
  part3r: R.part3RCArticles, part4: R.part4TFArticles, part5: R.part5Articles,
};
for (const [k, arr] of Object.entries(merged)) {
  ok(arr.filter(a => a.id.includes('-xh')).length === 6, `${k} 主题库含 6 篇增补`);
}

console.log('=== 4. 文章列表难度筛选存在且不改索引 ===');
const page = readFileSync('src/pages/ReadingPage.tsx', 'utf8');
ok(/diffFilter/.test(page), '文章列表有难度筛选状态');
ok(/a\.difficulty === diffFilter/.test(page), '按 difficulty 过滤');
ok(/map\(\(a, i\) => \(\{ a, i \}\)\)/.test(page), '筛选保留原始索引（防点开错位）');
ok(/onSelectArticle\(i\)/.test(page), '点击用原始索引');
ok(/flex flex-wrap gap-2 mb-4/.test(page), '筛选按钮用 flex-wrap 防 320px 溢出');
ok(/rounded-full text-xs/.test(page), '筛选按钮用紧凑圆角样式');

const hardSrc = readFileSync('src/data/readingHard.ts', 'utf8');
ok(!hardSrc.includes('eration'), '第一批 hard 译文乱码已修');

console.log(`\n结果: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) process.exit(1);
