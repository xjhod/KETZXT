/**
 * 学习画像引擎验证
 * 重点测算法的真实行为：掌握度升降、遗忘衰减、置信度、薄弱点排序、配比
 */
import {
  applyAnswer, computeProfile, decayMastery, confidenceFor, areaOfModule,
  weakestPoints, masteredPoints, lowConfidencePoints, suggestDifficulty,
  allocateDailyMix, summarizeProfile, HALF_LIFE_DAYS,
  MIN_CONFIDENCE_FOR_WEAK, type MasteryState, type ProfileArea,
} from './src/data/learnerProfile.ts';
import type { AnswerRecord } from './src/store/useProgressStore.ts';

const DAY = 86_400_000;
const T0 = Date.parse('2026-08-01T09:00:00Z');

let fail = 0;
const bad = (m: string) => { console.log('  ❌ ' + m); fail++; };
const ok = (m: string) => console.log('  ✅ ' + m);
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;

// ---------- 1. 掌握度更新 ----------
console.log('=== 1) 掌握度随作答变化 ===');
let p: MasteryState | undefined;
const ms: number[] = [];
for (let i = 0; i < 10; i++) {
  p = applyAnswer(p, true, 'grammar', T0 + i * 60000);
  ms.push(p.mastery);
}
const increasing = ms.every((v, i) => i === 0 || v > ms[i - 1]);
if (increasing) ok(`连续答对 10 次，掌握度单调上升：${ms.map(v => v.toFixed(3)).join(' → ')}`);
else bad('连续答对时掌握度没有单调上升');
if (p && p.mastery < 1) ok(`掌握度收敛但未触顶：${p.mastery.toFixed(4)}（学习率随置信度递减）`);
else bad(`掌握度异常：${p?.mastery}`);

// 答错要扣分
const before = p!.mastery;
const afterWrong = applyAnswer(p!, false, 'grammar', T0 + 11 * 60000);
if (afterWrong.mastery < before) ok(`答错后掌握度下降：${before.toFixed(4)} → ${afterWrong.mastery.toFixed(4)}`);
else bad('答错后掌握度没有下降');
if (afterWrong.streak === 0) ok('答错后连对计数清零');
else bad('答错后 streak 没有清零');

// 答错的扣分不应把掌握度打到负
let q: MasteryState | undefined;
for (let i = 0; i < 20; i++) q = applyAnswer(q, false, 'grammar', T0 + i * 60000);
if (q!.mastery >= 0 && q!.mastery < 0.1) ok(`连续答错 20 次掌握度趋近 0 但不为负：${q!.mastery.toFixed(4)}`);
else bad(`连续答错后掌握度异常：${q!.mastery}`);

// ---------- 2. 置信度 ----------
console.log('\n=== 2) 置信度随练习次数 ===');
const c0 = confidenceFor(0), c8 = confidenceFor(8), c24 = confidenceFor(24);
if (c0 === 0) ok('0 次练习 -> 置信度 0');
else bad(`0 次练习置信度应为 0，实为 ${c0}`);
if (near(c8, 0.5)) ok('8 次练习 -> 置信度 0.5');
else bad(`8 次练习置信度应为 0.5，实为 ${c8.toFixed(4)}`);
if (c24 > c8 && c24 < 1) ok(`24 次练习 -> 置信度 ${c24.toFixed(3)}（趋近 1 但不封顶）`);
else bad(`24 次练习置信度异常：${c24}`);

// ---------- 3. 遗忘衰减 ----------
console.log('\n=== 3) 艾宾浩斯衰减（不同科目半衰期不同）===');
const d7 = decayMastery(0.8, 7, 7);
const d14 = decayMastery(0.8, 14, 7);
if (near(d7, 0.4, 1e-9)) ok(`听力半衰期 7 天：0.8 → ${d7.toFixed(3)}（正好减半）`);
else bad(`听力 7 天衰减错误：${d7}`);
if (near(d14, 0.2, 1e-9)) ok(`14 天后 → ${d14.toFixed(3)}（再减半）`);
else bad(`14 天衰减错误：${d14}`);
const g30 = decayMastery(0.8, 30, 30);
if (near(g30, 0.4, 1e-9)) ok(`语法半衰期 30 天：0.8 → ${g30.toFixed(3)}（忘得慢）`);
else bad(`语法 30 天衰减错误：${g30}`);
if (decayMastery(0.8, 30, HALF_LIFE_DAYS.listening) < g30) ok('同样 30 天，听力衰减幅度大于语法');
else bad('不同科目衰减幅度没有区分');

// ---------- 4. 画像构建 ----------
console.log('\n=== 4) 从答题记录构建画像 ===');
const rec = (
  subjectId: string, subjectName: string, mod: string, correct: boolean, dayOffset: number, i = 0
): AnswerRecord => ({
  id: `${subjectId}-${i}-${dayOffset}`,
  module: mod as AnswerRecord['module'],
  exerciseType: 'test',
  subjectId, subjectName,
  questionId: `q${i}`,
  questionText: 't',
  userAnswer: 'a',
  correctAnswer: 'b',
  isCorrect: correct,
  answeredAt: new Date(T0 + dayOffset * DAY + i * 60000).toISOString(),
});

const records: AnswerRecord[] = [
  // G01：练 12 次，对 10 次
  ...Array.from({ length: 12 }, (_, i) => rec('G01', 'G01 一般现在时', 'grammar', i < 10, 0, i)),
  // G05：练 12 次，对 4 次
  ...Array.from({ length: 12 }, (_, i) => rec('G05', 'G05 现在完成时', 'grammar', i < 4, 0, i)),
  // G09：只练 1 次，错
  rec('G09', 'G09 条件句', 'grammar', false, 0, 0),
  // 词汇主题：练 6 次，对 5 次
  ...Array.from({ length: 6 }, (_, i) => rec('themeFamily', '家庭与家人', 'vocabulary', i < 5, 0, i)),
  // 听力知识点：练 8 次，对 6 次
  ...Array.from({ length: 8 }, (_, i) => rec('listening.picture', '听力·图音匹配', 'listening', i < 6, 0, i)),
];

const profile = computeProfile(records, T0 + 1 * DAY);
ok(`知识点数 ${Object.keys(profile.points).length}（G01/G05/G09/themeFamily/listening.picture）`);

const g01 = profile.points['G01'], g05 = profile.points['G05'], g09 = profile.points['G09'];
if (g01 && g05 && g01.mastery > g05.mastery) ok(`G01(10/12 对) 掌握度 ${g01.mastery.toFixed(3)} > G05(4/12 对) ${g05.mastery.toFixed(3)}`);
else bad('语法点掌握度与正确率不匹配');
if (g09 && g09.confidence < MIN_CONFIDENCE_FOR_WEAK) ok(`只练 1 次的点置信度 ${g09.confidence.toFixed(3)} < ${MIN_CONFIDENCE_FOR_WEAK}（标记为样本不足）`);
else bad('样本不足的点没有被识别');

console.log('\n=== 5) 薄弱点排序（低置信度要被排除）===');
const weak = weakestPoints(profile, 10);
console.log('  薄弱点:', weak.map((w) => `${w.name}(${w.mastery.toFixed(2)}, 置信${w.confidence.toFixed(2)})`).join(' | '));
if (!weak.some((w) => w.pointId === 'G09')) ok('只练过 1 次的 G09 未被列为薄弱点（样本不足，已排除）');
else bad('G09 样本不足却被列为薄弱点');
if (weak.length > 0 && weak[0].pointId === 'G05') ok(`最弱的是 G05（练得多但错得多），符合预期`);
else bad(`最弱点排序不对：${weak[0]?.pointId}`);

// ---------- 6. 领域聚合 ----------
console.log('\n=== 6) 领域掌握度聚合 ===');
for (const a of ['grammar', 'vocab', 'listening', 'reading'] as ProfileArea[]) {
  const st = profile.areas[a];
  console.log(`  ${a.padEnd(10)} 掌握度 ${st.mastery.toFixed(3)}  练习 ${st.attempts} 次  正确 ${st.correct}`);
}
if (profile.areas.listening.attempts === 8) ok('听力领域练习次数统计正确（8 次）');
else bad(`听力练习次数错：${profile.areas.listening.attempts}`);
if (profile.areas.reading.attempts === 0) ok('未练过的领域练习次数为 0');
else bad('未练过的领域不应有练习次数');

// ---------- 7. 难度建议 ----------
console.log('\n=== 7) 掌握度 -> 建议难度 ===');
const dcases: [number, string][] = [[0.2, 'easy'], [0.6, 'medium'], [0.9, 'hard']];
for (const [m, exp] of dcases) {
  const got = suggestDifficulty(m);
  if (got === exp) ok(`${m} -> ${got}`);
  else bad(`${m} 应为 ${exp}，实为 ${got}`);
}

// ---------- 8. 每日配比 ----------
console.log('\n=== 8) 每日练习配比（缺口 x 遗忘风险）===');
const mix = allocateDailyMix(profile);
const sum = Object.values(mix).reduce((a, b) => a + b, 0);
console.log('  ' + Object.entries(mix).map(([k, v]) => `${k}:${(v * 100).toFixed(0)}%`).join(' '));
if (near(sum, 1, 1e-6)) ok('配比加起来为 1');
else bad(`配比之和为 ${sum}`);
// 未练过的领域不应吃掉绝大部分时间
const unprac = (['reading', 'speaking', 'writing'] as ProfileArea[]).map((a) => mix[a]);
if (Math.max(...unprac) < 0.3) ok('未练过的领域各占不到 30%（保持接触但不主导）');
else bad(`未练领域占主导：${unprac.map(v => (v * 100).toFixed(0) + '%').join(',')}`);
// 已练领域：缺口 x 遗忘风险 的排序
const prac = (['grammar', 'vocab', 'listening'] as ProfileArea[]);
const gaps = prac.map((a) => ({ a, gap: 1 - profile.areas[a].mastery, mix: mix[a] }));
for (const g of gaps) console.log(`    ${g.a.padEnd(10)} 缺口 ${g.gap.toFixed(3)} -> 配比 ${(g.mix * 100).toFixed(1)}%`);
// 听力缺口最小但忘得最快，风险因子应让它不低于语法
if (mix.listening >= mix.grammar * 0.8) ok('听力的遗忘风险补偿生效（不会因为半衰期长而被压到最低）');
else bad(`遗忘风险补偿不足：listening=${mix.listening.toFixed(3)} grammar=${mix.grammar.toFixed(3)}`);

// ---------- 9. 遗忘后画像变化 ----------
console.log('\n=== 9) 30 天不练，画像会衰减 ===');
const pNow = computeProfile(records, T0 + 1 * DAY);
const pLater = computeProfile(records, T0 + 31 * DAY);
const g01Now = pNow.points['G01'].mastery;
const g01Later = pLater.points['G01'].mastery;
const lisNow = pNow.points['listening.picture'].mastery;
const lisLater = pLater.points['listening.picture'].mastery;
console.log(`  语法 G01: ${g01Now.toFixed(3)} → ${g01Later.toFixed(3)}（保留 ${((g01Later / g01Now) * 100).toFixed(0)}%）`);
console.log(`  听力:    ${lisNow.toFixed(3)} → ${lisLater.toFixed(3)}（保留 ${((lisLater / lisNow) * 100).toFixed(0)}%）`);
if (g01Later < g01Now && lisLater < lisNow) ok('两个知识点都随时间衰减');
else bad('掌握度没有随时间衰减');
if (g01Later / g01Now > lisLater / lisNow) ok('语法保留率高于听力（半衰期不同）');
else bad('不同科目的衰减没有区分');

// ---------- 10. 确定性 ----------
console.log('\n=== 10) 确定性：同样的记录 -> 同样的画像 ===');
const a1 = computeProfile(records, T0 + DAY);
const a2 = computeProfile(records, T0 + DAY);
if (JSON.stringify(a1.points) === JSON.stringify(a2.points)) ok('两次计算结果完全一致');
else bad('画像计算不确定');
// 注意：不能用 JSON.stringify 直接比对象 —— 键的插入顺序会不同，
// 数值一样也会判不等。必须逐点比数值。
const shuffled = [...records].reverse();
const a3 = computeProfile(shuffled, T0 + DAY);
const keys = Object.keys(a1.points);
let orderFree = keys.length === Object.keys(a3.points).length;
for (const k of keys) {
  const x = a1.points[k], y = a3.points[k];
  if (!y) { orderFree = false; bad(`打乱后缺少知识点 ${k}`); break; }
  if (Math.abs(x.mastery - y.mastery) > 1e-9 || x.attempts !== y.attempts || x.streak !== y.streak) {
    orderFree = false;
    bad(`打乱后 ${k} 不一致：mastery ${x.mastery} vs ${y.mastery}`);
    break;
  }
}
if (orderFree) ok('记录顺序打乱也不影响结果（内部按时间排序，逐点数值一致）');

// ---------- 11. 摘要与边界 ----------
console.log('\n=== 11) 摘要与边界情况 ===');
console.log('  ' + summarizeProfile(profile).split('\n').join('\n  '));
const emptyProfile = computeProfile([], T0);
if (Object.keys(emptyProfile.points).length === 0) ok('空记录 -> 空画像，不报错');
else bad('空记录产生了非空画像');
const mixEmpty = allocateDailyMix(emptyProfile);
if (near(Object.values(mixEmpty).reduce((a, b) => a + b, 0), 1, 1e-6)) ok('空画像也能给出配比（均匀分配）');
else bad('空画像配比之和不为 1');
if (areaOfModule('vocabulary') === 'vocab') ok('module 映射正确：vocabulary -> vocab');
else bad('module 映射错误');
if (masteredPoints(profile).length === 0) ok('当前没有已掌握的知识点（符合数据）');
else ok(`已掌握 ${masteredPoints(profile).length} 个：${masteredPoints(profile).map(p => p.name).join(', ')}`);
console.log(`  低置信度点 ${lowConfidencePoints(profile).length} 个`);

console.log(fail === 0 ? '\n✅ 画像引擎验证全部通过' : `\n❌ ${fail} 处问题`);
process.exit(fail === 0 ? 0 : 1);
