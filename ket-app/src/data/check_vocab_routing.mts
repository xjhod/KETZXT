// ========== 词汇三路由校验（rolldown 打包后由 scripts/run_check_vocab.mjs 执行）==========
// 口径：数字全部来自真实 allThemes 与真实 analyzeWord 运行，不手填。
import { allThemes } from './vocabulary';
import {
  analyzeWord,
  countSyllables,
  makeSoundChunks,
  splitMorphemes,
  type WordAnalysis,
} from '../utils/wordChunks';
import type { Word } from '../types';

const words: Word[] = allThemes.flatMap((t) => t.words);

const ids = words.map((w) => w.id);
const uniqueIds = new Set(ids);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);

const analyses: WordAnalysis[] = words.map(analyzeWord);
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
const bSplitOk = byRoute.B.filter((a) => splitMorphemes(a.en).ok).length;
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

const failures: string[] = [];
if (byRoute.A.length + byRoute.B.length + byRoute.C.length !== words.length) failures.push('route total mismatch');
if (notRestorable.length) failures.push('chunks not restorable: ' + notRestorable.slice(0, 5).map((a) => a.en).join(','));
if (badA.length) failures.push('A route violates mono/2+ chunks: ' + badA.slice(0, 5).map((a) => a.en).join(','));
if (dupIds.length) failures.push('duplicate word ids: ' + dupIds.slice(0, 5).join(','));
if (byRoute.A.length < 30) failures.push('A route too small to be useful (<30)');
if (countSyllables('/ˈtiːtʃə/') !== 2) failures.push('countSyllables sanity failed');

console.log('ASSERTIONS', failures.length === 0 ? 'PASS' : 'FAIL');
if (failures.length) {
  for (const f of failures) console.log('FAIL:', f);
  process.exitCode = 1;
}

// 供外层脚本核对音频覆盖
(globalThis as any).__VOCAB_CHECK__ = {
  wordIds: ids,
  words: words.map((w) => ({ id: w.id, en: w.en, route: analyzeWord(w).route })),
  failures,
};
