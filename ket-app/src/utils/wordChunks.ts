// ========== 单词结构分析（运行时派生，不改动词库大文件）==========
//
// 设计依据（2026-11-07 词汇改造定稿）：
//   · 不再给所有词套统一六步，按词结构分三条路由
//     A 单音节规则词 → 听音分块 + 字母块反查（音素—字形对应可教）
//     B 多音节/派生词 → 词素切 + 同源词推拼写（schwa 靠形态记，不靠音标）
//     C 不规则/强弱读/压缩音标 → 整体音 + 例句语境，明确「这个拼法要单独记」
//   · IPA 只作可点参考层：不朗读符号、不按符号切分、不进掌握判定
//   · 切分是「教学提示」而非音位学标注，一律带 confidence，界面不得写成确定值
//
// 硬约束：本文件不 import 具体词库，纯函数，便于 Node 校验脚本直接引用同一套规则。

import type { Word } from '../types';

export type WordRoute = 'A' | 'B' | 'C';
export type ChunkKind = 'letter' | 'digraph' | 'silent-e' | 'prefix' | 'stem' | 'suffix';

export interface WordChunk {
  /** 显示在拼图/词素卡上的字符串；拼回去必须等于原词 */
  text: string;
  kind: ChunkKind;
}

export interface WordAnalysis {
  wordId: string;
  en: string;
  /** 原样音标，仅作参考层展示 */
  ipa: string;
  route: WordRoute;
  syllables: number;
  /** 重音落在第几块（从 1 起），无法判断时为 null */
  stressedChunk: number | null;
  chunks: WordChunk[];
  chunkKind: 'sound' | 'morpheme' | 'none';
  /** 给孩子看的一句话说明 */
  note: string;
  confidence: 'high' | 'medium' | 'low';
  /** 分类依据，供校验脚本与调试用，不展示给孩子 */
  reason: string;
  /** B 类切出的词干，用于找同源词 */
  stem: string | null;
}

// ---- IPA 处理 ----

/** 双元音优先占位，避免 eɪ 被当成 e + ɪ 数成两个音节 */
const DIPHTHONGS = /(eɪ|aɪ|ɔɪ|aʊ|əʊ|oʊ|ɪə|eə|ʊə|ɛə|ɔː|ɑː|iː|uː|ɜː)/g;
const MONOPHTHONGS = /[iɪeæɑɒɔʊuʌəɜɛœ]/g;

function cleanIpa(ipa: string): string {
  return (ipa || '').replace(/^\/|\/$/g, '').replace(/[ˈˌ.·\s]/g, '');
}

/** 从音标粗估音节数：双元音算 1，其余元音各算 1，最少 1 */
export function countSyllables(ipa: string): number {
  const core = cleanIpa(ipa);
  if (!core) return 1;
  const withPlaceholder = core.replace(DIPHTHONGS, 'V');
  const n = (withPlaceholder.match(/V/g) || []).length +
    (withPlaceholder.replace(/V/g, '').match(MONOPHTHONGS) || []).length;
  return Math.max(1, n);
}

/** 重音所在音节序号（靠 ˈ 之前的元音数推断，仅作提示） */
export function stressedSyllable(ipa: string): number | null {
  const raw = (ipa || '').replace(/^\/|\/$/g, '');
  const mark = raw.indexOf('ˈ');
  if (mark < 0) return null;
  const before = raw.slice(0, mark);
  const seg = countSyllables(`/${before}/`);
  // before 里没有元音 → 重音在第 1 音节
  return Math.max(1, cleanIpa(before) ? seg : 1);
}

/** 音标是否含弱化元音（schwa / 短弱 i），有则不宜按音推形 */
export function hasWeakVowel(ipa: string): boolean {
  return /[əɪ]/.test(cleanIpa(ipa)) && countSyllables(ipa) > 1;
}

// ---- 不规则拼写特征：命中即降级到 C，避免教错 ----
const IRREGULAR: RegExp[] = [
  /ough|augh|eigh|iegh|ieg/,            // though / daughter / eight
  /tion$|sion$|cious$|tious$|geous$/,   // 拉丁后缀压缩音
  /^kn|^wr|^gn|^ps|^pn/,                // 不发音首辅音
  /mb$|gue$|que$|alk$|olk$|alm$|ould$/,// 不发音尾字母
  /[aeiou]{3,}/,                        // 三连元音多为特殊拼法
  /[^a-z]/,                             // 短语、连字符、缩写、大写
];

// ---- A 类：字母块切分（听音分块的拼图素材）----

const TRIGRAPHS = ['igh', 'tch', 'dge', 'eigh', 'air', 'are', 'ere', 'ire', 'ore', 'ure'];
const DIGRAPHS = [
  'ch', 'sh', 'th', 'ph', 'wh', 'ck', 'ng', 'qu',
  'ee', 'ea', 'ai', 'ay', 'oa', 'oo', 'ou', 'ow', 'oi', 'oy', 'ie',
  'ar', 'er', 'ir', 'or', 'ur', 'au', 'aw', 'al', 'ew', 'ey', 'oe', 'ue', 'ui',
  'kn', 'wr', 'gh', 'ss', 'll', 'ff', 'zz', 'ei',
];

const VOWELS = 'aeiou';

function isVowel(c: string): boolean {
  return VOWELS.includes(c);
}

/** magic-e：cake / bike / note，末尾 e 不发音但改变前面元音 */
function hasMagicE(en: string): boolean {
  const n = en.length;
  if (n < 4 || en[n - 1] !== 'e') return false;
  return !isVowel(en[n - 2]) && isVowel(en[n - 3]);
}

/** 把单词切成「可听辨的字母块」；结果拼回去必须等于原词 */
export function makeSoundChunks(en: string): WordChunk[] {
  const magic = hasMagicE(en);
  const body = magic ? en.slice(0, -1) : en;
  const out: WordChunk[] = [];
  let i = 0;
  while (i < body.length) {
    const rest = body.slice(i);
    const tri = TRIGRAPHS.find((d) => rest.startsWith(d));
    const di = DIGRAPHS.find((d) => rest.startsWith(d));
    if (tri) {
      out.push({ text: tri, kind: 'digraph' });
      i += tri.length;
    } else if (di) {
      out.push({ text: di, kind: 'digraph' });
      i += di.length;
    } else {
      out.push({ text: body[i], kind: 'letter' });
      i += 1;
    }
  }
  if (magic) out.push({ text: 'e', kind: 'silent-e' });
  return out;
}

// ---- B 类：词素切分（保守，宁可不切也不乱切）----

const PREFIXES = [
  'under', 'inter', 'super', 'over', 'multi', 'tele', 'auto', 'non', 'mis', 'pre',
  'dis', 'sub', 'ex', 'un', 're', 'in', 'im', 'il', 'ir', 'de', 'en', 'a',
];
const SUFFIXES = [
  'ation', 'ition', 'tion', 'sion', 'ness', 'ment', 'able', 'ible', 'less', 'ful',
  'ious', 'ous', 'ive', 'ity', 'ally', 'ing', 'est', 'ist', 'or', 'er', 'ed',
  'es', 'ly', 'al', 'ic', 'en', 'ish', 'y', 's',
];

export interface MorphemeSplit {
  chunks: WordChunk[];
  stem: string;
  ok: boolean;
}

function validStem(stem: string): boolean {
  if (stem.length < 4) return false;               // 太短多半是误切（sister → sist+er）
  if (!/[aeiouy]/.test(stem)) return false;
  return true;
}

/** 只切一层前缀 + 一层后缀，词干保留原形；切不动返回 ok:false */
export function splitMorphemes(en: string): MorphemeSplit {
  const bad: MorphemeSplit = { chunks: [], stem: '', ok: false };
  if (!/^[a-z]+$/.test(en) || en.length < 6) return bad;

  let prefix = '';
  for (const p of PREFIXES) {
    // 前缀后必须还剩一个像样的词干
    if (en.startsWith(p) && validStem(en.slice(p.length))) {
      prefix = p;
      break;
    }
  }
  let core = prefix ? en.slice(prefix.length) : en;

  let suffix = '';
  for (const s of SUFFIXES) {
    if (!core.endsWith(s)) continue;
    const stem = core.slice(0, -s.length);
    if (!validStem(stem)) continue;
    // -er/-or/-ed/-es/-s/-y 这类短后缀误切率高，词干要求更长
    if (s.length <= 2 && stem.length < 5) continue;
    suffix = s;
    core = stem;
    break;
  }

  if (!prefix && !suffix) return bad;
  const chunks: WordChunk[] = [];
  if (prefix) chunks.push({ text: prefix, kind: 'prefix' });
  chunks.push({ text: core, kind: 'stem' });
  if (suffix) chunks.push({ text: suffix, kind: 'suffix' });
  return { chunks, stem: core, ok: true };
}

/** 找同源词：给 B 类用来推 schwa / 不发音字母的拼写 */
export function findRelatives(en: string, stem: string | null, allWords: Word[], limit = 3): Word[] {
  const key = (stem && stem.length >= 4 ? stem : en.slice(0, Math.max(4, en.length - 2))).toLowerCase();
  const found = allWords.filter(
    (w) => w.en !== en && /^[a-z]+$/.test(w.en) &&
      (w.en.toLowerCase().includes(key) || key.includes(w.en.toLowerCase()))
  );
  return found
    .sort((a, b) => Math.abs(a.en.length - en.length) - Math.abs(b.en.length - en.length))
    .slice(0, limit);
}

// ---- 主入口 ----

export function analyzeWord(word: Word): WordAnalysis {
  const { id: wordId, en, phonetic } = word;
  const ipa = phonetic || '';
  const syllables = countSyllables(ipa);
  const base = { wordId, en, ipa, syllables };

  // C：词形不是纯小写字母（短语、缩写、专有名词）
  if (!/^[a-z]+$/.test(en)) {
    return {
      ...base, route: 'C', stressedChunk: null, chunks: [], chunkKind: 'none',
      note: '这是固定搭配/特殊写法：先听整词、读例句，再凭记忆写。',
      confidence: 'low', reason: 'non-plain-word', stem: null,
    };
  }

  // C：明显不规则拼写，按音推形会教错
  const irregular = IRREGULAR.find((r) => r.test(en));
  if (irregular) {
    return {
      ...base, route: 'C', stressedChunk: null, chunks: [], chunkKind: 'none',
      note: '这个词的拼法要单独记：听整词、读例句，再凭记忆写。',
      confidence: 'low', reason: `irregular:${irregular.source}`, stem: null,
    };
  }
  if (!cleanIpa(ipa)) {
    return {
      ...base, route: 'C', stressedChunk: null, chunks: [], chunkKind: 'none',
      note: '这个词没有音标参考：跟着整词音频读，再凭记忆写。',
      confidence: 'low', reason: 'no-ipa', stem: null,
    };
  }

  // A：单音节、无弱读、字母块数量合理 → 听音分块 + 字母块反查
  const chunks = makeSoundChunks(en);
  const aEligible =
    syllables === 1 &&
    !hasWeakVowel(ipa) &&
    en.length >= 2 && en.length <= 8 &&
    chunks.length >= 2 && chunks.length <= 5;
  if (aEligible) {
    return {
      ...base, route: 'A', stressedChunk: 1, chunks, chunkKind: 'sound',
      note: hasMagicE(en)
        ? '先听整词，把音分成几块，再找出每块对应的字母；末尾的 e 不发音。'
        : '先听整词，把音分成几块，再找出每块对应的字母。',
      confidence: 'medium', reason: 'mono-regular', stem: null,
    };
  }

  // B：多音节能切出词素 → 词素卡 + 同源词提示
  const split = splitMorphemes(en);
  if (split.ok) {
    const stress = stressedSyllable(ipa);
    return {
      ...base, route: 'B', stressedChunk: stress, chunks: split.chunks, chunkKind: 'morpheme',
      note: '这个词由几部分组成，看词素和同源词推拼写；音标只用来核对读音。',
      confidence: 'medium', reason: 'morpheme-split', stem: split.stem,
    };
  }

  // C：其余（多音节但切不动、含弱读、压缩音标等）
  return {
    ...base, route: 'C', stressedChunk: stressedSyllable(ipa), chunks: [], chunkKind: 'none',
    note: '这个词的拼法要单独记：听整词、读例句，再凭记忆写。',
    confidence: 'low',
    reason: syllables > 1 ? 'multisyllabic-no-morpheme' : 'mono-irregular-shape',
    stem: null,
  };
}
