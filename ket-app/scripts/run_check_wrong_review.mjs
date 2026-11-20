// 校验错题复盘提醒：筛选口径（>=3天/排除答对/取最新）、排序、文案、跨月边界、接线。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('  FAIL ' + msg); } };

async function load(entry) {
  const b = await rolldown({ input: entry });
  const { output } = await b.generate({ format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64'));
}

const WR = await load('src/utils/wrongReview.ts');

const TODAY = '2026-11-20';
const DAY = 86400000;
const T0 = new Date('2026-11-20T12:00:00').getTime();
// 造一条错题/对题记录
const rec = (dayAgo, isCorrect = false, id = 'q1') => ({
  id, module: 'grammar', exerciseType: 'grammar_choice',
  subjectId: 'g1', subjectName: '语法点', questionId: id,
  questionText: 't', userAnswer: 'A', correctAnswer: 'B',
  isCorrect, answeredAt: new Date(T0 - dayAgo * DAY).toISOString(),
});

console.log('=== 1. 常量与日期 ===');
ok(WR.WRONG_REVIEW_DAYS === 3, '默认间隔 = 3 天');
ok(WR.isoToDateKey('2026-11-20T23:59:00+08:00').length === 10, 'ISO 转日期 key');
ok(WR.isoToDateKey('bad') === '', '坏日期返回空串');

console.log('=== 2. 筛选口径 ===');
const batch = [rec(4), rec(2), rec(3), rec(1), rec(10, true)]; // 4/2/3/1天前错 + 10天前对
const picked = WR.pickWrongReview(batch, TODAY);
ok(picked.length === 2, `只留 >=3天前的错题（得 ${picked.length} 应 2：4天前+3天前，10天前的答对排除）`);
ok(!picked.some((r) => r.isCorrect), '答对的记录被排除');
ok(picked.every((r) => r.answeredAt), '结果保留完整记录');
ok(picked[0].answeredAt < picked[1].answeredAt, '按答错时间从旧到新排序');

console.log('=== 3. 边界（正好 3 天）===');
ok(WR.pickWrongReview([rec(3)], TODAY).length === 1, '正好 3 天前命中');
ok(WR.pickWrongReview([rec(2)], TODAY).length === 0, '2 天前不命中');
ok(WR.pickWrongReview([rec(0)], TODAY).length === 0, '今天错的不需要复盘');

console.log('=== 4. 自定义间隔与空输入 ===');
ok(WR.pickWrongReview([rec(5)], TODAY, 7).length === 0, '自定义 7 天间隔');
ok(WR.pickWrongReview([rec(8)], TODAY, 7).length === 1, '8 天前在 7 天口径下命中');
ok(WR.pickWrongReview([], TODAY).length === 0, '空输入返回空');
ok(WR.pickWrongReview(null, TODAY).length === 0, 'null 输入不崩');

console.log('=== 5. 纯函数不改入参 ===');
const before = JSON.stringify(batch);
WR.pickWrongReview(batch, TODAY);
ok(JSON.stringify(batch) === before, '不修改入参数组');

console.log('=== 6. 跨月/跨年边界 ===');
const dec = WR.pickWrongReview([{ ...rec(0), answeredAt: '2026-11-28T10:00:00.000Z' }], '2026-12-01');
ok(dec.length === 1, '11/28 -> 12/01 跨月命中（3天）');
const year = WR.pickWrongReview([{ ...rec(0), answeredAt: '2025-12-29T10:00:00.000Z' }], '2026-01-01');
ok(year.length === 1, '12/29 -> 01/01 跨年命中');

console.log('=== 7. 文案 ===');
ok(WR.wrongReviewHint(0) === '', '0 题无文案');
ok(/3 道 3 天前的错题/.test(WR.wrongReviewHint(3)), '文案含数量与天数');
ok(/5 天前/.test(WR.wrongReviewHint(2, 5)), '自定义天数进文案');

console.log('=== 8. 接线断言（源码静态检查）===');
const page = readFileSync('src/pages/WrongPage.tsx', 'utf8');
ok(page.includes('pickWrongReview') && page.includes('wrongReviewHint'), '错题页接了复盘函数与文案');
ok(page.includes('今日复盘'), '错题页有今日复盘区');
ok(page.includes("key={'review-' + record.id}"), '复盘卡片用独立 key 避免与列表冲突');
const store = readFileSync('src/store/useProgressStore.ts', 'utf8');
ok(store.includes('answerRecords') && store.includes('answeredAt'), '数据源仍是现有 AnswerRecord（未改 schema）');

console.log(`\n=== RESULT: pass=${pass} fail=${fail} ===`);
if (fail > 0) process.exit(1);
