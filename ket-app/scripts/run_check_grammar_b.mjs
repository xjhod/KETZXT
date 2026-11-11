// ========== 语法 B 档校验（2026-11-10）==========
// 用法：node scripts/run_check_grammar_b.mjs （在 ket-app 目录下）
// 校验范围：dueAt 到期调度、一天最多升一级、熟练判定（Box5+累计手写+7天）、
// 混合测验降级、旧数据迁移、云同步整条合并、20 点易混搭档、对比题真交错。
// 与 A 档脚本互补：A 档管「内容/呈现」，B 档管「调度/持久化」。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

async function loadTs(entry) {
  const bundle = await rolldown({ input: entry });
  const { output } = await bundle.generate({ format: 'esm' });
  const url = 'data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64');
  return import(url);
}

const sch = await loadTs('src/utils/grammarSchedule.ts');
const gs = await loadTs('src/utils/grammarSession.ts');
const rm = await loadTs('src/data/grammarRoadmap.ts');

let pass = 0;
let fail = 0;
function ok(name, cond, extra = '') {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra); }
}

const DAY = '2026-11-10';
const POINT_IDS = Array.from({ length: 20 }, (_, i) => `G${String(i + 1).padStart(2, '0')}`);
const read = (p) => readFileSync(p, 'utf8');

function mk(id, o = {}) {
  return {
    grammarId: id, introduced: true, stage: 2, right: 5, wrong: 1, box: 2,
    lastSeen: '2026-11-01', dueAt: '2026-11-05', streak: 0,
    firstLearnedAt: '2026-10-20', lastPromotedAt: null, mastered: false,
    updatedAt: '2026-11-01', ...o,
  };
}

console.log('--- 1. 间隔表与升盒（0/1/3/7/15、一天最多升一级）---');
ok('间隔表对齐词汇 Leitner', JSON.stringify(sch.GRAMMAR_BOX_INTERVAL_DAYS) === JSON.stringify({ 1: 0, 2: 1, 3: 3, 4: 7, 5: 15 }));
ok('熟练常量 = 累计 2 次 / ≥7 天', sch.GRAMMAR_MASTER_STREAK === 2 && sch.GRAMMAR_MASTER_MIN_DAYS === 7);

const empty = sch.emptyGrammarPoint('G01', DAY);
ok('新点默认 Box1、当天到期、streak0', empty.box === 1 && empty.dueAt === DAY && empty.streak === 0);
const first = sch.applyGrammarAnswer(empty, true, DAY);
ok('首次答对 1→2、次日到期', first.boxAfter === 2 && first.next.dueAt === '2026-11-11' && first.promoted);
ok('记录首学日与升盒日', first.next.firstLearnedAt === DAY && first.next.lastPromotedAt === DAY);

let sameDay = first.next;
for (let i = 0; i < 10; i++) sameDay = sch.applyGrammarAnswer(sameDay, true, DAY).next;
ok('同日连做 11 题全对，box 仍停在 2（一天最多升一级）', sameDay.box === 2, `box=${sameDay.box}`);
ok('同日重复答题不改写 dueAt', sameDay.dueAt === '2026-11-11');
ok('同日 11 题计数仍累计', sameDay.right === 11);

let across = first.next;
const expectedBoxes = [3, 4, 5, 5];
const expectedDue = ['2026-11-14', '2026-11-21', '2026-12-06', '2026-12-21'];
const days = ['2026-11-11', '2026-11-14', '2026-11-21', '2026-12-06'];
for (let i = 0; i < days.length; i++) {
  across = sch.applyGrammarAnswer(across, true, days[i]).next;
  ok(`跨天第 ${i + 1} 次升盒 → box ${expectedBoxes[i]} / due ${expectedDue[i]}`,
    across.box === expectedBoxes[i] && across.dueAt === expectedDue[i],
    `got box=${across.box} due=${across.dueAt}`);
}

const wrong = sch.applyGrammarAnswer(across, false, DAY);
ok('答错回 Box1、当天重新到期', wrong.boxAfter === 1 && wrong.next.dueAt === DAY);
ok('答错不动手写 streak', wrong.next.streak === across.streak);
const afterWrong = sch.applyGrammarAnswer(wrong.next, true, DAY);
ok('回盒当天不允许再连升', afterWrong.boxAfter === 1, `box=${afterWrong.boxAfter}`);

console.log('--- 2. 熟练判定：Box5 + 累计 2 次手写正确 + 首学 ≥7 天 ---');
const base = mk('G01', { box: 5, streak: 0, firstLearnedAt: '2026-11-01', dueAt: '2026-11-25' });
ok('仅 Box5 + 7 天，没有手写 → 不熟练', !sch.isGrammarMastered(base, DAY));
const oneWrite = sch.applyGrammarProduction(base, true, DAY).next;
ok('手写 1 次 → streak=1，仍不熟练', oneWrite.streak === 1 && !sch.isGrammarMastered(oneWrite, DAY));
const twoWrites = sch.applyGrammarProduction(oneWrite, true, DAY).next;
ok('累计手写 2 次 → 判熟练', twoWrites.streak === 2 && sch.isGrammarMastered(twoWrites, DAY));
ok('手写不动 box / dueAt', twoWrites.box === base.box && twoWrites.dueAt === base.dueAt);
const broke = sch.applyGrammarProduction(twoWrites, false, DAY).next;
ok('手写写错 → streak 清零，但已熟练不倒退', broke.streak === 0 && broke.mastered === true);
const fresh = mk('G01', { box: 5, streak: 2, firstLearnedAt: '2026-11-04' });
ok('首学仅 6 天 → 不熟练', !sch.isGrammarMastered(fresh, DAY));
const box4 = mk('G01', { box: 4, streak: 2, firstLearnedAt: '2026-11-01' });
ok('Box4 即使手写够也不熟练', !sch.isGrammarMastered(box4, DAY));
const promoted = sch.applyGrammarAnswer(mk('G01', { box: 4, streak: 2, firstLearnedAt: '2026-11-01', lastPromotedAt: null }), true, DAY);
ok('Box4 答对升到 5 且当场判熟练', promoted.next.box === 5 && promoted.next.mastered);

console.log('--- 3. 到期判定 ---');
ok('已到期且未熟练 → due', sch.isGrammarDue(mk('G01', { dueAt: '2026-11-09' }), DAY));
ok('未到期 → 不 due', !sch.isGrammarDue(mk('G01', { dueAt: '2026-11-12' }), DAY));
ok('已熟练 → 不再 due', !sch.isGrammarDue(mk('G01', { dueAt: '2026-11-01', mastered: true }), DAY));
ok('未学过的点不 due', !sch.isGrammarDue(mk('G01', { introduced: false, dueAt: '2026-11-01' }), DAY));
ok('逾期天数计算正确', sch.grammarDueUrgency(mk('G01', { dueAt: '2026-11-05' }), DAY) === 5);
ok('未到期逾期天数为 0', sch.grammarDueUrgency(mk('G01', { dueAt: '2026-11-12' }), DAY) === 0);

console.log('--- 4. 旧数据迁移（不丢进度、不倒退）---');
const legacy = { grammarId: 'G07', introduced: true, stage: 2, right: 9, wrong: 3, box: 3, lastSeen: '2026-11-01' };
const mig = sch.migrateGrammarPoint(legacy, DAY);
ok('旧字段 right/wrong/box/lastSeen 原样保留',
  mig.right === 9 && mig.wrong === 3 && mig.box === 3 && mig.lastSeen === '2026-11-01');
ok('dueAt 按 lastSeen + box3 间隔(3天) 推回', mig.dueAt === '2026-11-04', mig.dueAt);
ok('firstLearnedAt 近似取 lastSeen', mig.firstLearnedAt === '2026-11-01');
ok('旧数据 streak/updatedAt 补齐', mig.streak === 0 && mig.updatedAt === '2026-11-01');
const legacyMaster = sch.migrateGrammarPoint({ ...legacy, stage: 4 }, DAY);
ok('旧版 stage=4 保留为熟练，不倒退', legacyMaster.mastered === true && sch.isGrammarMastered(legacyMaster, DAY));
ok('迁移幂等（再迁一次结果不变）', JSON.stringify(sch.migrateGrammarPoint(mig, DAY)) === JSON.stringify(mig));
ok('脏数据不炸（null / 空对象）',
  sch.migrateGrammarPoint(null, DAY).box === 1 && sch.migrateGrammarPoint({}, DAY).dueAt === DAY);

console.log('--- 5. 新点选择与云同步合并 ---');
ok('空进度 → 从 G01 开始', sch.pickNextGrammarPointId({}, rm.ROADMAP, DAY) === 'G01');
const allIntroduced = Object.fromEntries(POINT_IDS.map((id) => [id, mk(id, { mastered: true })]));
ok('全部熟练 → 返回 null', sch.pickNextGrammarPointId(allIntroduced, rm.ROADMAP, DAY) === null);
const someMastered = { ...allIntroduced, G05: mk('G05', { mastered: false, box: 3 }) };
ok('已学但未熟练的点会被回捞', sch.pickNextGrammarPointId(someMastered, rm.ROADMAP, DAY) === 'G05');
const oldState = mk('G01', { box: 2, streak: 0, updatedAt: '2026-11-01', lastSeen: '2026-11-01' });
const newState = mk('G01', { box: 5, streak: 2, dueAt: '2026-11-25', updatedAt: '2026-11-09', lastSeen: '2026-11-09' });
ok('同步整条取较新的一份（不是字段级 max）',
  sch.newerGrammarPoint(oldState, newState, DAY).box === 5 &&
  sch.newerGrammarPoint(newState, oldState, DAY).box === 5);
ok('较新一份的 box/dueAt/streak 来自同一版本',
  sch.newerGrammarPoint(oldState, newState, DAY).dueAt === '2026-11-25');

console.log('--- 6. 易混搭档覆盖 20 个语法点 ---');
const covered = new Set(rm.CONFUSABLE_PAIRS.flat());
ok('20 个点全部有搭档', POINT_IDS.every((id) => covered.has(id)), `missing=${POINT_IDS.filter((id) => !covered.has(id))}`);
ok('每个点 getPartners 至少 1 个', POINT_IDS.every((id) => rm.getPartners(id).length >= 1));
ok('搭档不含自身、不重复', POINT_IDS.every((id) => {
  const ps = rm.getPartners(id);
  return !ps.includes(id) && new Set(ps).size === ps.length;
}));
ok('每对都有对比提示（无空 hint）',
  rm.CONFUSABLE_PAIRS.every(([a, b]) => typeof rm.getContrastHint(a, b) === 'string' && rm.getContrastHint(a, b).length > 8));
ok('配对无自环、无重复对',
  rm.CONFUSABLE_PAIRS.every(([a, b]) => a !== b) &&
  new Set(rm.CONFUSABLE_PAIRS.map(([a, b]) => [a, b].sort().join('|'))).size === rm.CONFUSABLE_PAIRS.length);

console.log('--- 7. 复习按到期点抽 + 对比题真交错 ---');
const duePoints = Object.fromEntries(POINT_IDS.map((id) => [id, mk(id, {
  dueAt: '2026-12-01', // 大多未到期
  firstLearnedAt: '2026-11-01',
})]));
duePoints.G03 = mk('G03', { dueAt: '2026-11-05', box: 1 }); // 逾期 5 天
duePoints.G04 = mk('G04', { dueAt: '2026-11-08', box: 2 }); // 逾期 2 天
const wrongList = [
  { grammarId: 'G01', questionId: 'g01f01' },
  { grammarId: 'G02', questionId: 'g02f01' },
  { grammarId: 'G05', questionId: 'g05f01' },
  { grammarId: 'G06', questionId: 'g06f01' },
];
let dueFirst = 0;
let lenBad = 0;
for (let i = 0; i < 30; i++) {
  const s = gs.generateSession({ points: duePoints, wrongList, today: DAY });
  if (s.review[0]?.grammarId === 'G03') dueFirst++;
  if (s.review.length !== 5) lenBad++;
}
ok('30 次生成复习恒为固定 5 题', lenBad === 0, `lenBad=${lenBad}`);
ok('逾期最久的 G03 恒为复习首题', dueFirst === 30, `dueFirst=${dueFirst}/30`);
const sDue = gs.generateSession({ points: duePoints, wrongList, today: DAY });
ok('复习前两题来自到期点 G03 / G04',
  sDue.review.slice(0, 2).every((q) => q.grammarId === 'G03' || q.grammarId === 'G04'),
  sDue.review.slice(0, 2).map((q) => q.grammarId).join(','));
ok('复习题不重复', new Set(sDue.review.map((q) => q.q.id)).size === sDue.review.length);

// 新点 = G01（未引入），已引入且到期的搭档 G03 → 对比题应两点交替
const interPoints = { ...duePoints };
delete interPoints.G01;
let interBad = 0;
let onlyOnePoint = 0;
let partnerBad = 0;
for (let i = 0; i < 30; i++) {
  const s = gs.generateSession({ points: interPoints, wrongList: [], today: DAY });
  const qs = s.contrast?.questions ?? [];
  if (!s.contrast || s.contrast.partnerId !== 'G03') partnerBad++;
  if (new Set(qs.map((q) => q.grammarId)).size < 2) onlyOnePoint++;
  if (qs.some((q, j) => j > 0 && q.grammarId === qs[j - 1].grammarId)) interBad++;
}
ok('对比搭档选已引入且到期的 G03', partnerBad === 0, `bad=${partnerBad}`);
ok('对比题覆盖至少 2 个语法点', onlyOnePoint === 0, `bad=${onlyOnePoint}`);
ok('30 次生成相邻题恒来自不同语法点（真交错）', interBad === 0, `bad=${interBad}`);
const firstDay = gs.generateSession({ points: {}, wrongList: [], today: DAY });
ok('首日不拿没学过的点做对比', firstDay.contrast === null);
ok('首日仍保留 5 题混合测验 + 至少 1 道意义题',
  firstDay.mixed.length === 5 && firstDay.mixed.some((q) => q.q.kind === 'meaning'));

console.log('--- 8. 源码护栏（静态）---');
const store = read('src/store/useDailyCheckinStore.ts');
const sync = read('src/utils/sync.ts');
const page = read('src/pages/GrammarDailyPage.tsx');
const session = read('src/utils/grammarSession.ts');

ok('store 升版本并逐条迁移旧 points', /version: 2/.test(store) && /migrateGrammarPoint\(p, t\)/.test(store));
ok('store 的 recordQuestion 走纯函数层', /applyGrammarAnswer\(prev, isCorrect/.test(store));
ok('store 新增 recordProduction（手写计入熟练）', /recordProduction: \(grammarId/.test(store) && /applyGrammarProduction\(prev, isCorrect/.test(store));
ok('store 的新点选择共用 pickNextGrammarPointId', /pickNextGrammarPointId\(get\(\)\.points, ROADMAP/.test(store));
ok('finishPoint 把熟练上限钳到 2', /Math\.min\(2, stageReached\)/.test(store));
ok('混合测验不再用正确率判 stage', /finishPoint\(session\.newPointId, 2\)/.test(page) && !/acc >= 0\.8 \? 4/.test(page));
ok('页面手写走 recordProduction', /recordAnswer\(curQuestions\[qIdx\], correct, text, true\)/.test(page)
  && /if \(isProduction\) dc\.recordProduction/.test(page));
ok('页面熟练数用新判据', /isGrammarMastered\(migrateGrammarPoint/.test(page));
ok('session 生成可注入 today', /today\?: string/.test(session) && /input\.today \?\? todayString\(\)/.test(session));
ok('复习按到期点抽', /isGrammarDue\(pointOf\(id\), t\)/.test(session) && /grammarDueUrgency/.test(session));
ok('对比题交替排列', /const interleaved: SessionQuestion\[\]/.test(session) && /const flip = Math\.random\(\) < 0\.5/.test(session));
ok('云同步整条取较新的一份', /newerGrammarPoint\(cur, r, gToday\)/.test(sync)
  && !/box: Math\.max\(cur\.box/.test(sync));
ok('云同步直接 setState 也补齐旧结构', /points\[id\] = migrateGrammarPoint\(p, gToday\)/.test(sync));
ok('同步口径注释写明整条取', /整条按 updatedAt\/lastSeen 取较新/.test(sync));

console.log('--- RESULT ---');
console.log(`PASS ${pass} / FAIL ${fail}`);
if (fail > 0) process.exit(1);
console.log('GRAMMAR_B_CHECK_OK');
