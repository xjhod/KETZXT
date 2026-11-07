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

// 'a' 已从前缀表移除：2026-11-07 实跑里它把 advanced / address / actress /
// anniversary / already / actually 全部切成 a|…，属于纯误切。
const PREFIXES = [
  'under', 'inter', 'super', 'over', 'multi', 'tele', 'auto', 'non', 'mis', 'pre',
  'dis', 'sub', 'ex', 'un', 're', 'in', 'im', 'il', 'ir', 'de', 'en',
];
const SUFFIXES = [
  'ation', 'ition', 'tion', 'sion', 'ness', 'ment', 'able', 'ible', 'less', 'ful',
  'ious', 'ous', 'ive', 'ity', 'ally', 'ing', 'est', 'ist', 'or', 'er', 'ed',
  'es', 'ly', 'al', 'ic', 'en', 'ish', 'y', 's',
];

/**
 * 人工核过的词素切分（依据 2026-11-07 全量切分抽查结果）。
 *   null  = 确认不是派生/复合词，禁止按词素切 → 降级 C，避免教错
 *   数组  = 确认的复合词块，拼回去必须严格等于原词
 * 这张表是「不教错」的兜底，规则层仍按词干真实词形自动判断。
 */
export const MORPHEME_OVERRIDES: Record<string, readonly string[] | null> = {
  brother: null, mother: null, father: null, sister: null,
  grandmother: ['grand', 'mother'], grandfather: ['grand', 'father'],
  weather: null, shoulder: null, leather: null, computer: null,
  character: null, library: null, history: null, family: null,
  hungry: null, thirsty: null, pretty: null, turkey: null,
  journey: null, chimney: null, valley: null, monkey: null,
  traffic: null, kitchen: null, hospital: null, balcony: null,
  between: null, chicken: null, cucumber: null, strawberry: null,
  vocabulary: null, dictionary: null, emergency: null, necessary: null,
  together: null, however: null, actually: null, already: null,
  address: null, advanced: null, anniversary: null, actress: null,
  subject: null, miserable: null, present: null, prepare: null,
  discuss: null, disappointed: null,
  newspaper: ['news', 'paper'], firefighter: ['fire', 'fighter'],
  hairdresser: ['hair', 'dresser'], sunglasses: ['sun', 'glasses'],
  downstairs: ['down', 'stairs'], snowboarding: ['snow', 'board', 'ing'],
  // 词干不在本词库词形集合里、但词素关系确凿的复合词，人工确认后保留在 B 类
  understand: ['under', 'stand'], underground: ['under', 'ground'],
  underwear: ['under', 'wear'], underline: ['under', 'line'],
  dislike: ['dis', 'like'], discover: ['dis', 'cover'],
};

export interface MorphemeSplit {
  chunks: WordChunk[];
  stem: string;
  ok: boolean;
  /** 命中人工修正表 */
  manual?: boolean;
}

function validStem(stem: string): boolean {
  if (stem.length < 4) return false;               // 太短多半是误切（sister → sist+er）
  if (!/[aeiouy]/.test(stem)) return false;
  return true;
}

/**
 * 词干必须站得住：优先要求它是词库里真实存在的词形。
 *   · 双写辅音（swimm → swim）允许命中，但块文本不变，仍严格拼得回原词
 *   · 未注入词形集合时退回长度判断，保证单独调用也不改变行为
 * 这一条砍掉的是 famil|y / broth|er / librar|y / northw|est 这类假词干。
 */
function stemIsRealWord(stem: string, knownForms?: ReadonlySet<string>): boolean {
  if (!knownForms || knownForms.size === 0) return validStem(stem);
  if (knownForms.has(stem)) return true;
  const n = stem.length;
  if (n > 3 && stem[n - 1] === stem[n - 2] && knownForms.has(stem.slice(0, -1))) return true;
  return false;
}

/** 只切一层前缀 + 一层后缀，词干保留原形；切不动返回 ok:false */
export function splitMorphemes(en: string, knownForms?: ReadonlySet<string>): MorphemeSplit {
  const bad: MorphemeSplit = { chunks: [], stem: '', ok: false };
  if (!/^[a-z]+$/.test(en) || en.length < 6) return bad;

  // 人工修正优先：null 一律不切；数组必须是可还原的合法块
  const manual = MORPHEME_OVERRIDES[en];
  if (manual !== undefined) {
    if (manual === null) return { ...bad, manual: true };
    if (manual.length < 2 || manual.join('') !== en) return { ...bad, manual: true };
    const chunks: WordChunk[] = manual.map((text) => ({ text, kind: 'stem' }));
    return {
      chunks,
      stem: manual.reduce((a, b) => (b.length > a.length ? b : a), ''),
      ok: true,
      manual: true,
    };
  }

  let prefix = '';
  for (const p of PREFIXES) {
    if (!en.startsWith(p)) continue;
    const rest = en.slice(p.length);
    if (!validStem(rest)) continue;
    // 长短前缀一视同仁：去掉前缀后必须仍是真实词形。
    // 否则 mis|erable、inter|esting、sub|ject 这类假词素会混进 B 类。
    // 真复合词（under|stand 等）不在本词库词形里，由人工修正表捞回。
    if (!stemIsRealWord(rest, knownForms)) continue;
    prefix = p;
    break;
  }
  let core = prefix ? en.slice(prefix.length) : en;

  let suffix = '';
  for (const s of SUFFIXES) {
    if (!core.endsWith(s)) continue;
    const stem = core.slice(0, -s.length);
    if (!validStem(stem)) continue;
    // 核心收紧点：假词干一律不切（宁可降级 C，也不要展示 broth|er）
    if (!stemIsRealWord(stem, knownForms)) continue;
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

/**
 * @param knownForms 词库里真实存在的词形集合，用于校验词素切出的词干是否站得住。
 *                   不传时退回宽松的长度判断（仅供独立调用，UI 必须注入）。
 */
export function analyzeWord(word: Word, knownForms?: ReadonlySet<string>): WordAnalysis {
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
  const split = splitMorphemes(en, knownForms);
  if (split.ok) {
    const stress = stressedSyllable(ipa);
    return {
      ...base, route: 'B', stressedChunk: stress, chunks: split.chunks, chunkKind: 'morpheme',
      note: split.manual
        ? '这是个复合词，认清每一部分就好记了；音标只用来核对读音。'
        : '这个词由几部分组成，看词素和同源词推拼写；音标只用来核对读音。',
      confidence: split.manual ? 'high' : 'medium',
      reason: split.manual ? 'manual-morpheme' : 'morpheme-split',
      stem: split.stem,
    };
  }

  // C：其余（多音节但切不动、含弱读、压缩音标等）
  return {
    ...base, route: 'C', stressedChunk: stressedSyllable(ipa), chunks: [], chunkKind: 'none',
    note: '这个词的拼法要单独记：听整词、读例句，再凭记忆写。',
    confidence: 'low',
    reason: split.manual
      ? 'manual:no-split'
      : syllables > 1 ? 'multisyllabic-no-morpheme' : 'mono-irregular-shape',
    stem: null,
  };
}

// ---- C 类听音训练：不用 IPA 符号、不用 ASR，只靠整词音频与字形 ----
//
// 补强原因（2026-11-07 B 轮）：C 类占全词库约四成，原来只有「整体音 + 例句 + 听写」，
// 孩子实际上没有做任何解码动作。这里补三个只需点选的轻练习，把注意力拉回
// 「这个词听起来分几段、重音在哪、开头是什么音」，再进入整词听写。
// 数拍与重音只给参考值、不判对错 —— 音标粗估的音节数本身就是提示，不是考点。

const ONSET_DIGRAPHS = ['th', 'sh', 'ch', 'ph', 'wh', 'qu', 'kn', 'wr', 'gn', 'ps', 'ck'];

/** 词首的字母块（th/sh/ch… 优先，其余取首字母） */
export function onsetChunk(en: string): string {
  const s = (en || '').toLowerCase();
  for (const d of ONSET_DIGRAPHS) if (s.startsWith(d)) return d;
  return s.slice(0, 1);
}

/** 字形分段回忆：按长度切成 2~3 段，拼接必须严格等于原词（只分字形，不声称是音节） */
export function makeRecallSegments(en: string): string[] {
  const s = en || '';
  if (s.length < 4) return [s];
  const n = s.length >= 10 ? 3 : 2;
  const size = Math.ceil(s.length / n);
  const out: string[] = [];
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
  return out;
}

/** 确定性洗牌：同一个词每次渲染选项顺序一致，避免孩子刚看完就跳位 */
function shuffleDeterministic<T>(arr: T[], seed: string): T[] {
  const a = [...arr];
  let s = 0;
  for (const ch of seed) s = (Math.imul(s, 31) + ch.charCodeAt(0)) >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 首音听辨：1 个正确 + 3 个不同干扰项；候选不足时用单字母补齐 */
export function buildOnsetOptions(en: string, candidateForms: readonly string[]): string[] {
  const answer = onsetChunk(en);
  const options = [answer];
  const seen = new Set(options);
  for (const form of candidateForms) {
    if (options.length >= 4) break;
    const o = onsetChunk(form);
    if (o && o !== answer && !seen.has(o)) {
      options.push(o);
      seen.add(o);
    }
  }
  for (const c of 'bcdfghjklmnpqrstvwxyz') {
    if (options.length >= 4) break;
    if (!seen.has(c)) {
      options.push(c);
      seen.add(c);
    }
  }
  return shuffleDeterministic(options, en);
}

export interface CListeningDrill {
  /** 从音标粗估的参考拍数，只作提示不判分 */
  beatReference: number;
  beatOptions: number[];
  /** 无可判断的重音时为 null，界面自动跳过重音这一步 */
  stressReference: number | null;
  stressOptions: number[];
  onsetAnswer: string;
  onsetOptions: string[];
  recallSegments: string[];
}

export function buildCListeningDrill(word: Word, candidateForms: readonly string[]): CListeningDrill {
  const ipa = word.phonetic || '';
  const syllables = countSyllables(ipa);
  const stress = stressedSyllable(ipa);
  // 单音节词没有「重音在第几拍」可选，这一步自动跳过
  const stressReference = syllables >= 2 && stress !== null && stress >= 1 && stress <= syllables
    ? stress
    : null;
  const maxBeat = Math.min(6, Math.max(3, syllables + 2));
  return {
    beatReference: Math.min(syllables, maxBeat),
    beatOptions: Array.from({ length: maxBeat }, (_, i) => i + 1),
    stressReference,
    stressOptions: stressReference
      ? Array.from({ length: syllables }, (_, i) => i + 1)
      : [],
    onsetAnswer: onsetChunk(word.en),
    onsetOptions: buildOnsetOptions(word.en, candidateForms),
    recallSegments: makeRecallSegments(word.en),
  };
}
