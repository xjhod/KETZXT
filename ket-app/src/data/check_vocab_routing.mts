// ========== 词汇三路由校验（rolldown 打包后由 scripts/run_check_vocab.mjs 执行）==========
// 口径：数字全部来自真实 allThemes 与真实 analyzeWord 运行，不手填。
import { allThemes } from './vocabulary';
import {
  analyzeWord,
  buildCListeningDrill,
  buildOnsetOptions,
  countSyllables,
  makeRecallSegments,
  makeSoundChunks,
  onsetChunk,
  MORPHEME_OVERRIDES,
  splitMorphemes,
  type WordAnalysis,
} from '../utils/wordChunks';
import type { VocabBox, VocabWordProgress, Word } from '../types';
import {
  buildPlacementSample, buildTodayQueue, buildPassage, themeCounts,
  isDictationCorrect, REVIEW_PER_DAY, NEW_PER_DAY,
} from '../utils/vocabSession';
import { applyDictation, emptyProgress, addDays } from '../utils/vocabSchedule';

const words: Word[] = allThemes.flatMap((t) => t.words);
const wordForms: ReadonlySet<string> = new Set(
  words.map((w) => w.en.toLowerCase()).filter((en) => /^[a-z]+$/.test(en))
);
const onsetCandidates: readonly string[] = words
  .map((w) => w.en.toLowerCase())
  .filter((en) => /^[a-z]/.test(en));

const ids = words.map((w) => w.id);
const uniqueIds = new Set(ids);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);

const analyses: WordAnalysis[] = words.map((w) => analyzeWord(w, wordForms));
const byRoute: Record<string, WordAnalysis[]> = { A: [], B: [], C: [] };
for (const a of analyses) byRoute[a.route].push(a);

const syllableDist: Record<number, number> = {};
for (const a of analyses) syllableDist[a.syllables] = (syllableDist[a.syllables] || 0) + 1;

const reasonDist: Record<string, number> = {};
for (const a of analyses) reasonDist[a.reason] = (reasonDist[a.reason] || 0) + 1;

// 拼图/词素还原一致性：切完拼回去必须等于原词
const notRestorable = analyses.filter(
  (a) => a.chunks.length > 0 && a.chunks.map((c) => c.text).join('') !== a.en
);
// A 类硬约束
const badA = byRoute.A.filter((a) => a.syllables !== 1 || a.chunks.length < 2);
// B 类词素自动切比例（以多音节词为分母）
const multi = analyses.filter((a) => a.syllables > 1);
const bSplitOk = byRoute.B.filter((a) => splitMorphemes(a.en, wordForms).ok).length;
const soundChunkOk = byRoute.A.filter(
  (a) => makeSoundChunks(a.en).map((c) => c.text).join('') === a.en
).length;

const pct = (n: number, d: number) => (d ? ((n / d) * 100).toFixed(1) : '0.0');
const sample = (arr: WordAnalysis[], n = 8) =>
  arr.slice(0, n).map((a) => `${a.en}[${a.ipa}] s${a.syllables} ${a.chunks.map((c) => c.text).join('|') || '-'}`);

console.log('=== VOCAB ROUTING CHECK ===');
console.log('THEMES', allThemes.length);
console.log('WORDS', words.length);
console.log('UNIQUE_WORD_IDS', uniqueIds.size, 'DUPLICATE_IDS', dupIds.length, dupIds.slice(0, 6));
console.log('WITH_IPA', words.filter((w) => w.phonetic && w.phonetic.length > 2).length);
console.log('WITH_EXAMPLE', words.filter((w) => !!w.example).length);
console.log('SYLLABLE_DIST', JSON.stringify(syllableDist));
console.log('ROUTE_A', byRoute.A.length, pct(byRoute.A.length, words.length) + '%');
console.log('ROUTE_B', byRoute.B.length, pct(byRoute.B.length, words.length) + '%');
console.log('ROUTE_C', byRoute.C.length, pct(byRoute.C.length, words.length) + '%');
console.log('ROUTE_TOTAL', byRoute.A.length + byRoute.B.length + byRoute.C.length);
console.log('MULTISYLLABIC', multi.length, pct(multi.length, words.length) + '%');
console.log('B_MORPHEME_SPLIT_OK', bSplitOk, '/', byRoute.B.length);
console.log('B_COVERS_MULTISYLLABIC', pct(byRoute.B.length, multi.length) + '%');
console.log('A_SOUND_CHUNK_RESTORABLE', soundChunkOk, '/', byRoute.A.length);
console.log('C_REASON_DIST', JSON.stringify(reasonDist));
console.log('SAMPLE_A', JSON.stringify(sample(byRoute.A)));
console.log('SAMPLE_B', JSON.stringify(sample(byRoute.B)));
console.log('SAMPLE_C', JSON.stringify(sample(byRoute.C)));

// ---- B 轮：词素切分收紧后的质量校验 ----
const realStem = (stem: string): boolean => {
  if (wordForms.has(stem)) return true;
  const n = stem.length;
  return n > 3 && stem[n - 1] === stem[n - 2] && wordForms.has(stem.slice(0, -1));
};
const bShortSuffix = byRoute.B.filter((a) => {
  const last = a.chunks[a.chunks.length - 1];
  return last && last.kind === 'suffix' && last.text.length <= 2;
});
const bFakeStem = byRoute.B.filter((a) => {
  const s = splitMorphemes(a.en, wordForms);
  return s.ok && !s.manual && !realStem(s.stem);
});
const bManual = byRoute.B.filter((a) => splitMorphemes(a.en, wordForms).manual).length;
const overrideMiss = Object.entries(MORPHEME_OVERRIDES).filter(([en, want]) => {
  const found = analyses.find((a) => a.en === en);
  if (!found) return false; // 修正表里的词若不在导出词库，不算漏网
  if (want === null) return found.chunkKind === 'morpheme';
  return found.chunkKind !== 'morpheme' ||
    found.chunks.map((c) => c.text).join('') !== want.join('');
});
console.log('B_SHORT_SUFFIX_COUNT', bShortSuffix.length, '/', byRoute.B.length);
console.log('B_MANUAL_OVERRIDE_COUNT', bManual);
console.log('B_FAKE_STEM_COUNT', bFakeStem.length, JSON.stringify(
  bFakeStem.map((a) => `${a.en}=${a.chunks.map((c) => c.text).join('|')}`)
));
console.log('B_OVERRIDE_MISS', overrideMiss.length, JSON.stringify(overrideMiss.slice(0, 8).map(([en]) => en)));
console.log('B_SAMPLE_AFTER_TIGHTEN', JSON.stringify(sample(byRoute.B, 12)));

// ---- B 轮：C 类听音训练数据全量校验 ----
const drillProblems: string[] = [];
let cWithStress = 0;
const cSyllableDist: Record<number, number> = {};
for (let i = 0; i < words.length; i++) {
  const a = analyses[i];
  if (a.route !== 'C') continue;
  cSyllableDist[a.syllables] = (cSyllableDist[a.syllables] || 0) + 1;
  const d = buildCListeningDrill(words[i], onsetCandidates);
  const en = a.en;
  if (d.onsetOptions.length !== 4 || new Set(d.onsetOptions).size !== 4 ||
      !d.onsetOptions.includes(d.onsetAnswer)) drillProblems.push(`${en}:onset`);
  if (d.recallSegments.join('') !== en) drillProblems.push(`${en}:segment`);
  if (!d.beatOptions.includes(d.beatReference)) drillProblems.push(`${en}:beat`);
  if (d.stressReference !== null) {
    cWithStress++;
    if (!d.stressOptions.includes(d.stressReference)) drillProblems.push(`${en}:stress`);
  }
}
const onsetStable = JSON.stringify(buildOnsetOptions('teacher', onsetCandidates)) ===
  JSON.stringify(buildOnsetOptions('teacher', onsetCandidates));
console.log('C_WITH_STRESS', cWithStress, '/', byRoute.C.length);
console.log('C_SYLLABLE_DIST', JSON.stringify(cSyllableDist));
console.log('C_DRILL_PROBLEMS', drillProblems.length, JSON.stringify(drillProblems.slice(0, 8)));
console.log('ONSET_SANITY', onsetChunk('sheep'), onsetChunk('phone'), onsetChunk('cat'),
  'STABLE', onsetStable, 'SEGMENTS', makeRecallSegments('beautiful').join(''));

// ---- 会话调度 / 记忆判据实跑 ----
console.log('=== SESSION / SCHEDULE CHECK ===');
const themeIds = allThemes.map((t) => t.id);
const dupThemes = themeIds.filter((id, i) => themeIds.indexOf(id) !== i);
console.log('DUPLICATE_THEME_IDS', dupThemes.length, JSON.stringify([...new Set(dupThemes)].slice(0, 10)));

const placement = buildPlacementSample();
const placementThemes = new Set(placement.map((x) => x.themeId)).size;
console.log('PLACEMENT_SIZE', placement.length, 'THEMES_COVERED', placementThemes,
  'UNIQUE_WORDS', new Set(placement.map((x) => x.word.id)).size);

const d0 = '2026-11-07';
const q0 = buildTodayQueue({ words: {}, currentThemeId: 'T01', today: d0 });
console.log('EMPTY_REVIEW', q0.review.length, 'EMPTY_FRESH', q0.fresh.length,
  'FRESH_REMAINING', q0.freshRemaining, 'CURRENT_THEME', q0.currentThemeId);

const prog: Record<string, VocabWordProgress> = {};
const picks = allThemes.slice(0, 5).flatMap((t) => t.words.slice(0, 3).map((w) => ({ w, t })));
picks.forEach(({ w, t }, i) => {
  const p = emptyProgress(w.id, t.id, analyzeWord(w).route, '2026-11-01');
  prog[w.id] = {
    ...p, status: 'learning',
    box: ((i % 5) + 1) as VocabBox,
    dueAt: i < 3 ? '2026-11-03' : d0,
    lastSeen: '2026-11-01',
  };
});
const q1 = buildTodayQueue({ words: prog, currentThemeId: 'T01', today: d0 });
console.log('DUE_TOTAL', q1.dueTotal, 'REVIEW_PICKED', q1.review.length,
  'REVIEW_THEMES', new Set(q1.review.map((x) => x.themeId)).size);

const passage = buildPassage(q0.fresh);
console.log('PASSAGE_SENTENCES', passage.sentences.length, 'BLANK_ANSWER', passage.blankAnswer);
console.log('DICT_CASE_OK', isDictationCorrect('  Mother ', 'mother'),
  'DICT_WRONG_OK', !isDictationCorrect('mothre', 'mother'));
console.log('THEME_COUNTS_SUM', (() => {
  const c = themeCounts(allThemes[0], {}, d0);
  return c.fresh + c.learning + c.mastered === c.total;
})());

// 按真实到期节奏连做 5 次听写：应在第 4 次达到掌握判据
let state = emptyProgress('test-word', 'T01', 'A', d0);
let day = d0;
const trail: string[] = [];
for (let i = 0; i < 5; i++) {
  const r = applyDictation(state, true, day);
  state = r.next;
  trail.push(`${day}:b${r.boxBefore}->b${r.boxAfter},due=${state.dueAt},streak=${state.streak},${state.status}`);
  day = state.dueAt;
}
console.log('MASTER_TRAIL', JSON.stringify(trail));
const wrong = applyDictation(state, false, day);
console.log('WRONG_RESET', `b${wrong.boxAfter}`, `streak=${wrong.next.streak}`,
  `due=${wrong.next.dueAt}`, wrong.next.status);
console.log('ADD_DAYS_MONTH_BOUNDARY', addDays('2026-11-30', 1));

const failures: string[] = [];
if (placement.length !== 20 || new Set(placement.map((x) => x.word.id)).size !== 20) failures.push('placement sample must be 20 unique words');
if (placementThemes < 10) failures.push('placement sample not spread across themes');
if (q0.review.length !== 0 || q0.fresh.length !== NEW_PER_DAY) failures.push('empty-state queue mismatch');
if (q1.review.length !== Math.min(REVIEW_PER_DAY, q1.dueTotal)) failures.push('review cap mismatch');
if (passage.sentences.length !== q0.fresh.length || !passage.blankAnswer) failures.push('passage build failed');
if (!isDictationCorrect('  Mother ', 'mother') || isDictationCorrect('mothre', 'mother')) failures.push('dictation normalize failed');
if (!trail.some((t) => t.includes('mastered'))) failures.push('mastery never reached after spaced correct answers');
if (wrong.boxAfter !== 1 || wrong.next.streak !== 0 || wrong.next.dueAt !== day) failures.push('wrong-answer reset failed');
if (addDays('2026-11-30', 1) !== '2026-12-01') failures.push('addDays month boundary failed');
if (byRoute.A.length + byRoute.B.length + byRoute.C.length !== words.length) failures.push('route total mismatch');
if (notRestorable.length) failures.push('chunks not restorable: ' + notRestorable.slice(0, 5).map((a) => a.en).join(','));
if (badA.length) failures.push('A route violates mono/2+ chunks: ' + badA.slice(0, 5).map((a) => a.en).join(','));
if (dupIds.length) failures.push('duplicate word ids: ' + dupIds.slice(0, 5).join(','));
if (byRoute.A.length < 30) failures.push('A route too small to be useful (<30)');
if (byRoute.B.length < 60) failures.push('B route collapsed after tightening (<60)');
if (countSyllables('/ˈtiːtʃə/') !== 2) failures.push('countSyllables sanity failed');
// ---- B 轮新增断言 ----
if (bFakeStem.length) failures.push('B still shows fake stems: ' + bFakeStem.slice(0, 5).map((a) => a.en).join(','));
if (overrideMiss.length) failures.push('manual morpheme override not applied: ' + overrideMiss.slice(0, 5).map(([en]) => en).join(','));
if (drillProblems.length) failures.push('C listening drill data broken: ' + drillProblems.slice(0, 5).join(','));
if (onsetChunk('sheep') !== 'sh' || onsetChunk('phone') !== 'ph' || onsetChunk('cat') !== 'c') failures.push('onsetChunk sanity failed');
if (makeRecallSegments('beautiful').join('') !== 'beautiful') failures.push('recall segments not restorable');
if (!onsetStable) failures.push('onset options not deterministic');
if (cWithStress < 100) failures.push('C stress reference coverage too low');
if (byRoute.B.filter((a) => a.reason === 'manual-morpheme').length < 2) failures.push('manual compound overrides never took effect');

console.log('ASSERTIONS', failures.length === 0 ? 'PASS' : 'FAIL');
if (failures.length) {
  for (const f of failures) console.log('FAIL:', f);
  process.exitCode = 1;
}

// 供外层脚本核对音频覆盖
(globalThis as any).__VOCAB_CHECK__ = {
  wordIds: ids,
  words: words.map((w, i) => ({ id: w.id, en: w.en, route: analyses[i].route })),
  failures,
};
