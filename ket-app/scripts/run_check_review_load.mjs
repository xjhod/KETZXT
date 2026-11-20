// 校验复习负载预警：聚合正确性、逾期归今天、30天窗口、预警等级、文案、只读性。
import { rolldown } from 'rolldown';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('  FAIL ' + msg); } };

async function load(entry) {
  const b = await rolldown({ input: entry });
  const { output } = await b.generate({ format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64'));
}

const RL = await load('src/utils/reviewLoad.ts');
const SCHED = await load('src/utils/vocabSchedule.ts');
const V = await load('src/data/vocabulary.ts');

const TODAY = '2026-11-20';
const P = (id, dueAt, status = 'learning') => ({ wordId: id, themeId: 't', route: 'A', box: 2, dueAt, streak: 0, right: 0, wrong: 0, lastSeen: null, firstLearnedAt: null, status });

console.log('=== 1. 空输入 ===');
const empty = RL.buildReviewLoad({}, TODAY, 8);
ok(empty.today === 0 && empty.next7 === 0 && empty.next30 === 0, '空进度全为 0');
ok(empty.level === 'ok', '空进度 level=ok');
ok(empty.buckets.length === 30, '30 天桶齐全');
ok(RL.loadWarningText(empty).includes('还没有'), '空进度文案提示先学词');

console.log('=== 2. 逾期与今天都归 offset 0 ===');
const overdue = RL.buildReviewLoad({
  a: P('a', '2026-11-10'), b: P('b', '2026-11-19'), c: P('c', TODAY),
}, TODAY, 8);
ok(overdue.today === 3, `逾期2+今天1 全归今天（得 ${overdue.today}，应 3）`);
ok(overdue.buckets[0].count === 3 && overdue.buckets[1].count === 0, '分布首桶=3，次日=0');

console.log('=== 3. 新词不计入 ===');
const withNew = RL.buildReviewLoad({
  a: P('a', '2026-11-22'), n: P('n', TODAY, 'new'), m: P('m', '2026-11-21', 'mastered'),
}, TODAY, 8);
ok(withNew.today === 0, 'new 状态不计（今天=0）');
ok(withNew.next7 === 2, 'mastered 仍计入复习（next7=2）');

console.log('=== 4. 未来窗口聚合 ===');
const window = RL.buildReviewLoad({
  d1: P('d1', SCHED.addDays(TODAY, 1)),
  d6: P('d6', SCHED.addDays(TODAY, 6)),
  d7: P('d7', SCHED.addDays(TODAY, 7)),
  d29: P('d29', SCHED.addDays(TODAY, 29)),
  d30: P('d30', SCHED.addDays(TODAY, 30)),
}, TODAY, 8);
ok(window.next7 === 2, `未来 7 天含今天=2（得 ${window.next7}）`);
ok(window.next30 === 4, `未来 30 天=4（第 30 天不计，得 ${window.next30}）`);

console.log('=== 5. 预警等级 ===');
const calm = RL.buildReviewLoad({ a: P('a', SCHED.addDays(TODAY, 3)) }, TODAY, 8);
ok(calm.level === 'ok', '单日 1 个 = ok');
const busy = RL.buildReviewLoad(
  Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`b${i}`, P(`b${i}`, SCHED.addDays(TODAY, 5))])),
  TODAY, 8);
ok(busy.level === 'busy', `单日 10 > 容量 8 = busy（得 ${busy.level}）`);
const overload = RL.buildReviewLoad(
  Object.fromEntries(Array.from({ length: 21 }, (_, i) => [`o${i}`, P(`o${i}`, TODAY)])),
  TODAY, 8);
ok(overload.level === 'overload', `今天积压 21 > 2×8 = overload（得 ${overload.level}）`);
ok(overload.peak.offset === 0 && overload.peak.count === 21, '峰值日=今天，21 个');

console.log('=== 6. 文案 ===');
ok(RL.loadWarningText(busy).includes('5 天后') && RL.loadWarningText(busy).includes('10'), 'busy 文案含峰值日与数量');
ok(RL.loadWarningText(overload).includes('集中到期'), 'overload 文案提示集中到期');
ok(RL.loadWarningText(calm).includes('节奏平稳'), 'ok 文案说节奏平稳');

console.log('=== 7. 只读性（不修改传入 progress）===');
const snapshot = { a: P('a', '2026-11-25') };
const before = JSON.stringify(snapshot);
RL.buildReviewLoad(snapshot, TODAY, 8);
ok(JSON.stringify(snapshot) === before, '聚合后原进度对象不变');

console.log('=== 8. 真实数据（全库 1859 词都当作已学，跑聚合不崩）===');
const realProgress = {};
V.allThemes.forEach((t, ti) => t.words.forEach((w, wi) => {
  realProgress[w.id] = P(w.id, SCHED.addDays(TODAY, (ti * 7 + wi) % 20), wi % 9 === 0 ? 'mastered' : 'learning');
}));
const real = RL.buildReviewLoad(realProgress, TODAY, 8);
ok(real.next30 === 1859, `真实 1859 词全部落入 30 天窗口（得 ${real.next30}）`);
ok(real.buckets.reduce((s, b) => s + b.count, 0) === real.next30, '各桶之和 = next30');
ok(real.level === 'overload', '全库同时学必然 overload（合理）');

console.log(`\n结果: ${pass} PASS / ${fail} FAIL`);
if (fail) process.exit(1);
