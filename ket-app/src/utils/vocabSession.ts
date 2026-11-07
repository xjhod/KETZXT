// ========== 词汇每日队列（纯函数，可 Node 校验）==========
//
// 定稿口径：
//   · 复习优先、固定 8 题，按 dueAt 全局排序（天然跨主题），再交错打散
//   · 当前主题新词 6 个，按词表顺序取（不是随机，保证能续学）
//   · 提示按盒撤除：Box1/2 给字母块，Box3/4 给音标+播放，Box5 只给音频
//   · 6/8 与 0-1-3-7-15 天是工程默认值，界面不得写成"最优记忆参数"
import { allThemes } from '../data/vocabulary';
import type { VocabularyTheme, Word, VocabBox, VocabHintLevel, VocabWordProgress } from '../types';
import { analyzeWord, findRelatives, type WordAnalysis } from './wordChunks';

export const NEW_PER_DAY = 6;
export const REVIEW_PER_DAY = 8;
export const PLACEMENT_SIZE = 20;

export interface VocabQueueItem {
  word: Word;
  themeId: string;
  themeZh: string;
  analysis: WordAnalysis;
  kind: 'review' | 'new';
  box: VocabBox;
  hintLevel: VocabHintLevel;
  progress: VocabWordProgress | null;
  /** B 类同源词提示；找不到时界面把词素降级为「仅供参考」 */
  relatives: Word[];
}

export interface VocabTodayQueue {
  review: VocabQueueItem[];
  fresh: VocabQueueItem[];
  currentThemeId: string;
  /** 全账号待复习总数（可能 > 8，界面显示"今日做 8 题"） */
  dueTotal: number;
  /** 当前主题剩余未学词数 */
  freshRemaining: number;
  today: string;
}

export interface ThemeCounts {
  total: number;
  fresh: number;
  learning: number;
  mastered: number;
  due: number;
}

const flatWords: { word: Word; themeId: string; themeZh: string }[] = allThemes.flatMap((t) =>
  t.words.map((word) => ({ word, themeId: t.id, themeZh: t.nameZh }))
);

const wordIndex = new Map<string, { word: Word; themeId: string; themeZh: string }>(
  flatWords.map((x) => [x.word.id, x])
);

export function allVocabWords(): Word[] {
  return flatWords.map((x) => x.word);
}

export function getWordMeta(wordId: string): { word: Word; themeId: string; themeZh: string } | undefined {
  return wordIndex.get(wordId);
}

export function hintLevelFor(box: VocabBox): VocabHintLevel {
  if (box <= 2) return 1;
  if (box <= 4) return 2;
  return 3;
}

function toItem(
  meta: { word: Word; themeId: string; themeZh: string },
  kind: 'review' | 'new',
  progress: VocabWordProgress | null
): VocabQueueItem {
  const analysis = analyzeWord(meta.word);
  const all = allVocabWords();
  return {
    ...meta,
    analysis,
    kind,
    box: progress?.box ?? 1,
    hintLevel: hintLevelFor(progress?.box ?? 1),
    progress,
    relatives: analysis.route === 'B' ? findRelatives(meta.word.en, analysis.stem, all) : [],
  };
}

/** 相邻两题尽量来自不同主题（跨主题交错练习） */
function interleave(items: VocabQueueItem[]): VocabQueueItem[] {
  const groups = new Map<string, VocabQueueItem[]>();
  for (const it of items) {
    const arr = groups.get(it.themeId) ?? [];
    arr.push(it);
    groups.set(it.themeId, arr);
  }
  const queues = [...groups.values()];
  const out: VocabQueueItem[] = [];
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const q of queues) {
      const next = q.shift();
      if (next) {
        out.push(next);
        remaining = true;
      }
    }
  }
  return out;
}

/** 首次入场测：跨主题均匀抽 20 词，固定顺序（刷新不变） */
export function buildPlacementSample(): { word: Word; themeId: string; themeZh: string; analysis: WordAnalysis }[] {
  const perTheme = Math.max(1, Math.floor(PLACEMENT_SIZE / allThemes.length));
  const picked: { word: Word; themeId: string; themeZh: string; analysis: WordAnalysis }[] = [];
  for (const t of allThemes) {
    const step = Math.max(1, Math.floor(t.words.length / perTheme));
    for (let i = 0; i < perTheme && i * step < t.words.length; i++) {
      const w = t.words[i * step];
      picked.push({ word: w, themeId: t.id, themeZh: t.nameZh, analysis: analyzeWord(w) });
    }
  }
  // 22 主题 × 1 = 22 条，截到 20；不足则从剩余词补齐
  const out = picked.slice(0, PLACEMENT_SIZE);
  if (out.length < PLACEMENT_SIZE) {
    const seen = new Set(out.map((x) => x.word.id));
    for (const meta of flatWords) {
      if (out.length >= PLACEMENT_SIZE) break;
      if (seen.has(meta.word.id)) continue;
      out.push({ ...meta, analysis: analyzeWord(meta.word) });
      seen.add(meta.word.id);
    }
  }
  return out;
}

export function buildTodayQueue(input: {
  words: Record<string, VocabWordProgress>;
  currentThemeId: string;
  today: string;
}): VocabTodayQueue {
  const { words, today } = input;
  const theme = allThemes.find((t) => t.id === input.currentThemeId) ?? allThemes[0];
  const currentThemeId = theme.id;

  // ---- 复习：全局到期，先按 dueAt（逾期越久越优先），再按盒子小优先 ----
  const due = Object.values(words)
    .filter((p) => p.status !== 'new' && p.dueAt <= today)
    .filter((p) => wordIndex.has(p.wordId))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt) || a.box - b.box || b.wrong - a.wrong);
  const review = interleave(
    due.slice(0, REVIEW_PER_DAY).map((p) => toItem(wordIndex.get(p.wordId)!, 'review', p))
  );

  // ---- 新词：当前主题内按词表顺序，跳过已入场/已学词 ----
  const freshMeta: { word: Word; themeId: string; themeZh: string }[] = [];
  for (const meta of flatWords) {
    if (meta.themeId !== currentThemeId) continue;
    const p = words[meta.word.id];
    if (p && p.status !== 'new') continue;
    freshMeta.push(meta);
  }
  const fresh = freshMeta.slice(0, NEW_PER_DAY).map((m) => toItem(m, 'new', words[m.word.id] ?? null));

  return {
    review,
    fresh,
    currentThemeId,
    dueTotal: due.length,
    freshRemaining: freshMeta.length,
    today,
  };
}

export function themeCounts(theme: VocabularyTheme, words: Record<string, VocabWordProgress>, today: string): ThemeCounts {
  let fresh = 0;
  let learning = 0;
  let mastered = 0;
  let due = 0;
  for (const w of theme.words) {
    const p = words[w.id];
    if (!p || p.status === 'new') fresh++;
    else if (p.status === 'mastered') mastered++;
    else learning++;
    if (p && p.status !== 'new' && p.dueAt <= today) due++;
  }
  return { total: theme.words.length, fresh, learning, mastered, due };
}

/** 主题小短文：复用现有例句，不编造新内容；最后一句挖一个空 */
export function buildPassage(items: VocabQueueItem[]): {
  sentences: { text: string; zh: string; wordId: string }[];
  blankWordId: string | null;
  blankAnswer: string;
} {
  const sentences = items
    .filter((it) => !!it.word.example)
    .map((it) => ({ text: it.word.example, zh: it.word.exampleZh, wordId: it.word.id }));
  const blank = sentences.length ? sentences[sentences.length - 1] : null;
  const word = blank ? wordIndex.get(blank.wordId)?.word : null;
  return {
    sentences,
    blankWordId: blank?.wordId ?? null,
    blankAnswer: word?.en ?? '',
  };
}

/** 听写判定：忽略大小写与首尾空格；连字符/空格型短语允许空格数量不同 */
export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isDictationCorrect(input: string, answer: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(answer);
}
