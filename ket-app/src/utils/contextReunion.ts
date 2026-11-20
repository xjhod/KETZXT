// ========== 语境重逢：把当天新词放回题库里的真实短文 ==========
//
// 决策来源：竞品借鉴任务单 #1（扇贝「词文串学」）。孩子当天学的新词，
// 在另一篇真实短文里再遇到一次，比单纯重复复习更能形成记忆。
//
// 口径（严格遵守，避免编造）：
//   · 短文全部来自现有 reading.ts 题库，一个字都不新增
//   · 匹配只用词条自带的 en 字段，容忍常见变形（复数/过去式/进行时）
//   · 命中词用于展示「你今天学的词出现在这篇里」，不进任何掌握判定
//   · 优先有中文译文的连贯短文（Part3RC/Part4），其次完形/填空全文
//
import {
  part1Articles, part2Articles, part3ClozeArticles,
  part3RCArticles, part4TFArticles, part5Articles,
} from '../data/reading';
import type { Word } from '../types';

export type ReunionPart = '1' | '2' | '3c' | '3r' | '4' | '5';

export interface ReunionCandidate {
  part: ReunionPart;
  articleId: string;
  title: string;
  titleZh: string;
  /** 正文（连贯文用 article，完形/填空用 passageFull，Part1/2 用句子拼接） */
  text: string;
  /** 中文参考译文；Part1/2/完形无篇章译文时为 null */
  translation: string | null;
  /** 命中的今日新词英文（原形） */
  matchedWords: string[];
  /** 命中词在 text 中的出现位置，供 UI 高亮 */
  matchSpans: { start: number; end: number; word: string }[];
  /** 是否连贯短文（有译文） */
  coherent: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

/** 词条 en → 可能出现在短文里的变形集合（保守枚举，不做词干猜测） */
export function wordVariants(en: string): string[] {
  const w = (en ?? '').toLowerCase().trim();
  if (!w) return [];
  const set = new Set<string>([w]);
  if (/^[a-z]+$/.test(w)) {
    set.add(w + 's');
    set.add(w + 'es');
    if (w.endsWith('e')) {
      set.add(w + 'd');
      set.add(w + 'ing');
      set.add(w.slice(0, -1) + 'ing');
    } else {
      set.add(w + 'ed');
      set.add(w + 'ing');
    }
    if (w.endsWith('y') && w.length > 2) {
      set.add(w.slice(0, -1) + 'ies');
      set.add(w.slice(0, -1) + 'ied');
    }
    if (w.endsWith('f') && w.length > 2) set.add(w.slice(0, -1) + 'ves');
  }
  return [...set];
}

interface PoolItem {
  part: ReunionPart;
  articleId: string;
  title: string;
  titleZh: string;
  text: string;
  translation: string | null;
  coherent: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

/** 题库里所有可作为「语境」的短文，一次构建，模块级缓存 */
function buildPool(): PoolItem[] {
  const pool: PoolItem[] = [];
  for (const a of part3RCArticles) {
    if (a.article) pool.push({ part: '3r', articleId: a.id, title: a.title, titleZh: a.titleZh, text: a.article, translation: a.articleZh || null, coherent: true, difficulty: a.difficulty });
  }
  for (const a of part4TFArticles) {
    if (a.article) pool.push({ part: '4', articleId: a.id, title: a.title, titleZh: a.titleZh, text: a.article, translation: a.articleZh || null, coherent: true, difficulty: a.difficulty });
  }
  for (const a of part3ClozeArticles) {
    const t = a.passageFull || a.passage || '';
    if (t) pool.push({ part: '3c', articleId: a.id, title: a.title, titleZh: a.titleZh, text: t, translation: null, coherent: false, difficulty: a.difficulty });
  }
  for (const a of part5Articles) {
    const t = a.passageFull || a.passage || '';
    if (t) pool.push({ part: '5', articleId: a.id, title: a.title, titleZh: a.titleZh, text: t, translation: null, coherent: false, difficulty: a.difficulty });
  }
  for (const a of part1Articles) {
    const t = (a.sentences || []).join(' ');
    if (t) pool.push({ part: '1', articleId: a.id, title: a.title, titleZh: a.titleZh, text: t, translation: null, coherent: false, difficulty: a.difficulty });
  }
  for (const a of part2Articles) {
    const t = [...(a.texts || []), ...(a.people || []).map((p) => p.description)].join(' ');
    if (t) pool.push({ part: '2', articleId: a.id, title: a.title, titleZh: a.titleZh, text: t, translation: null, coherent: false, difficulty: a.difficulty });
  }
  return pool;
}

let cachedPool: PoolItem[] | null = null;
function getPool(): PoolItem[] {
  if (!cachedPool) cachedPool = buildPool();
  return cachedPool;
}

/** 在一篇短文里定位所有命中词，返回匹配片段（不重叠，按出现顺序） */
function locateMatches(words: Word[], text: string): { start: number; end: number; word: string }[] {
  const lower = text.toLowerCase();
  const spans: { start: number; end: number; word: string }[] = [];
  const occupied: boolean[] = new Array(text.length).fill(false);
  for (const w of words) {
    const en = (w.en ?? '').trim();
    if (!en) continue;
    for (const v of wordVariants(en)) {
      // 逐词匹配（词边界），避免 cat 命中 category
      const re = new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      let m: RegExpExecArray | null;
      while ((m = re.exec(lower)) !== null) {
        const s = m.index;
        const e = s + m[0].length;
        if (occupied.slice(s, e).some(Boolean)) continue;
        for (let i = s; i < e; i++) occupied[i] = true;
        spans.push({ start: s, end: e, word: en });
      }
    }
  }
  return spans.sort((a, b) => a.start - b.start);
}

/** 难度权重：easy 优先（孩子刚学新词，不该一上来就啃 hard） */
const DIFFICULTY_BONUS: Record<string, number> = { easy: 3, medium: 1, hard: 0 };

/**
 * 为今日新词推荐「语境重逢」短文。
 * @param freshWords 当天新词（通常 6 个）
 * @param limit 返回篇数（默认 1）
 * @returns 按命中词数、连贯性、难度排序的候选；无命中返回空数组
 */
export function findReunionArticles(freshWords: Word[], limit = 1): ReunionCandidate[] {
  const words = freshWords.filter((w) => (w.en ?? '').trim());
  if (!words.length) return [];

  const scored: ReunionCandidate[] = [];
  for (const a of getPool()) {
    const spans = locateMatches(words, a.text);
    if (!spans.length) continue;
    const matchedWords = [...new Set(spans.map((s) => s.word))];
    scored.push({
      part: a.part,
      articleId: a.articleId,
      title: a.title,
      titleZh: a.titleZh,
      text: a.text,
      translation: a.translation,
      matchedWords,
      matchSpans: spans,
      coherent: a.coherent,
      difficulty: a.difficulty,
    });
  }

  scored.sort((x, y) => {
    const yhits = y.matchedWords.length * 10 + (y.coherent ? 5 : 0) + (DIFFICULTY_BONUS[y.difficulty] ?? 0);
    const xhits = x.matchedWords.length * 10 + (x.coherent ? 5 : 0) + (DIFFICULTY_BONUS[x.difficulty] ?? 0);
    return yhits - xhits;
  });

  // 同一篇短文可能命中多个新词，这里只取最相关的前 limit 篇
  return scored.slice(0, Math.max(1, limit));
}

/** 用匹配片段把正文切成展示段：命中词标记 highlight=true，供 UI 加下划线/高亮 */
export function splitHighlighted(text: string, spans: { start: number; end: number; word: string }[]): { text: string; highlight: boolean }[] {
  const out: { text: string; highlight: boolean }[] = [];
  let cursor = 0;
  for (const s of spans) {
    if (s.start > cursor) out.push({ text: text.slice(cursor, s.start), highlight: false });
    out.push({ text: text.slice(s.start, s.end), highlight: true });
    cursor = s.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), highlight: false });
  return out;
}
