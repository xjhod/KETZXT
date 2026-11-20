// ========== 删除入场测 + 残留词重走首学 校验 ==========
// 用 rolldown 打包 TS 纯函数模块后在内存执行，避免 --experimental-strip-types 不认无扩展名 import。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL:', label); }
}

async function load(entry) {
  const b = await rolldown({ input: entry });
  const { output } = await b.generate({ format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64'));
}

const S = await load('src/utils/vocabSchedule.ts');
const V = await load('src/utils/vocabSession.ts');

const today = '2026-11-20';

// ---- 1. isPlacementRemnant 判定边界 ----
const remnant = (over = {}) => ({
  wordId: 'w1', themeId: 't1', route: 'A', box: 3, dueAt: today,
  streak: 0, right: 0, wrong: 0, lastSeen: null, firstLearnedAt: null,
  status: 'learning', ...over,
});
ok(S.isPlacementRemnant(remnant()), '自报认识(learning/box3/无记录) = 残留词');
ok(S.isPlacementRemnant(remnant({ box: 2 })), '自报不确定(learning/box2/无记录) = 残留词');
ok(!S.isPlacementRemnant(remnant({ status: 'new' })), '正常新词空记录(status=new) 不算残留');
ok(!S.isPlacementRemnant(remnant({ lastSeen: today })), '有听写时间戳 → 真学过，不算残留');
ok(!S.isPlacementRemnant(remnant({ firstLearnedAt: today })), '有首学时间 → 真学过，不算残留');
ok(!S.isPlacementRemnant(remnant({ right: 1 })), 'right>0 → 真学过，不算残留');
ok(!S.isPlacementRemnant(remnant({ wrong: 1 })), 'wrong>0 → 真学过，不算残留');
ok(!S.isPlacementRemnant(remnant({ status: 'mastered' })), '已掌握不算残留');

// ---- 2. buildTodayQueue：残留词不进复习、进新词且从 Box1 ----
// 取词库前 3 个词做样本，当前主题设为它们的主题
const firstTheme = V.allThemes ? V.allThemes[0] : null;
// allThemes 由 vocabulary.ts re-export；兜底从 data 直接取
const DATA = V.allThemes ? V : await load('src/data/vocabulary.ts');
const themes = DATA.allThemes;
const t = themes[0];
const sampleWords = t.words.slice(0, 3).map((w) => w.id);

// 造进度：第1词 = 入场测残留(learning/box3)，第2词 = 真学过到期(learning/box2/有记录)，第3词不建记录(新词)
const progress = {
  [sampleWords[0]]: remnant({ wordId: sampleWords[0], themeId: t.id, box: 3, dueAt: today }),
  [sampleWords[1]]: remnant({
    wordId: sampleWords[1], themeId: t.id, box: 2, dueAt: today,
    lastSeen: '2026-11-15', firstLearnedAt: '2026-11-15', right: 2,
  }),
};
const queue = V.buildTodayQueue({
  words: progress, currentThemeId: t.id, today, dailyNew: 6, dailyReview: 8,
});
ok(!queue.review.some((it) => it.word.id === sampleWords[0]), '残留词不进复习队列');
ok(queue.review.some((it) => it.word.id === sampleWords[1]), '真学过的到期词仍进复习队列');
const freshRemnant = queue.fresh.find((it) => it.word.id === sampleWords[0]);
ok(!!freshRemnant, '残留词进新词队列重学');
ok(freshRemnant && freshRemnant.box === 1, '残留词在新词队列里从 Box 1 起（不继承假 box3）');
ok(freshRemnant && freshRemnant.progress === null, '残留词新词项不带旧 progress');
const freshNormal = queue.fresh.find((it) => it.word.id === sampleWords[2]);
ok(!!freshNormal, '无记录的新词正常进队列');

// ---- 3. applyDictation：残留词首次听写从 Box1 起算 ----
const storedRemnant = progress[sampleWords[0]];
ok(S.isPlacementRemnant(storedRemnant), '前提：该词被判为残留');
const outcome = S.applyDictation(storedRemnant, true, today);
// 注意：纯函数层不重置（重置在 store 层）；此处验证「若直接转写会升到 box4」这一风险确实存在，
// 从而说明 store 层重置的必要性。真正的从 Box1 起在下方 store 接线静态断言覆盖。
ok(outcome.boxAfter === 4, '未经重置直接听写会从假 box3 升到 box4（说明 store 重置必要）');
const resetThen = S.applyDictation(S.emptyProgress(sampleWords[0], t.id, 'A', today), true, today);
ok(resetThen.boxAfter === 2 && resetThen.boxBefore === 1, '重置为空进度后首次写对从 Box1→Box2');

// ---- 4. UI/接线静态断言：入口已删、两处复用同一判定 ----
const vocabToday = readFileSync('src/pages/VocabToday.tsx', 'utf8');
const vocabPage = readFileSync('src/pages/VocabularyPage.tsx', 'utf8');
const store = readFileSync('src/store/useVocabStore.ts', 'utf8');
const session = readFileSync('src/utils/vocabSession.ts', 'utf8');
ok(!vocabToday.includes("'placement'"), 'VocabToday Phase 已无 placement');
ok(!vocabToday.includes('function Placement('), 'Placement 组件已删除');
ok(!vocabToday.includes('buildPlacementSample'), 'VocabToday 不再调用入场测样本');
ok(!vocabToday.includes('placementDone'), 'VocabToday 不再读 placementDone');
ok(!vocabPage.includes('入场测'), '词汇页入场测提示文案已删');
ok(!vocabPage.includes('placementDone'), '词汇页不再读 placementDone');
ok(store.includes('isPlacementRemnant(stored)'), 'store.recordDictation 复用残留判定重置进度');
ok(session.includes('isPlacementRemnant'), 'buildTodayQueue 复用残留判定');
ok(!/const isPlacementRemnant = \(p: VocabWordProgress\)/.test(session), 'vocabSession 无重复本地判定（单一真源）');

console.log(`\n=== RESULT: pass=${pass} fail=${fail} ===`);
if (fail > 0) process.exit(1);
