// ========== 词汇每日队列（纯函数，可 Node 校验）==========
//
// 定稿口径：
//   · 复习优先、固定 8 题，按 dueAt 全局排序（天然跨主题），再交错打散
//   · 当前主题新词 6 个，按词表顺序取（不是随机，保证能续学）
//   · 提示按盒撤除：Box1/2 给字母块，Box3/4 给音标+播放，Box5 只给音频
//   · 6/8 与 0-1-3-7-15 天是工程默认值，界面不得写成"最优记忆参数"
import { allThemes } from '../data/vocabulary';
import type { VocabularyTheme, Word, VocabBox, VocabHintLevel, VocabWordProgress } from '../types';
import {
  analyzeWord,
  buildCListeningDrill,
  findRelatives,
  type CListeningDrill,
  type WordAnalysis,
} from './wordChunks';
import { blankSentence } from './contextQuestions';

export const NEW_PER_DAY = 6;
export const REVIEW_PER_DAY = 8;
export const PLACEMENT_SIZE = 20;
/** 每日词量档位（2026-11-09 起可自定义；仍是工程默认值，不宣称最优） */
export const DAILY_NEW_OPTIONS: readonly number[] = [4, 6, 8, 10];
export const DAILY_REVIEW_OPTIONS: readonly number[] = [4, 6, 8, 10, 12];

/** 云端脏数据 / 旧包缺字段一律回落默认，避免把队列清空 */
export function clampDailyCount(value: unknown, fallback: number, options: readonly number[]): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const rounded = Math.round(n);
  return options.includes(rounded) ? rounded : fallback;
}

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
  /** C 类听音三小问的数据；非 C 类为 null */
  drill: CListeningDrill | null;
}

export interface VocabTodayQueue {
  review: VocabQueueItem[];
  fresh: VocabQueueItem[];
  currentThemeId: string;
  /** 全账号待复习总数（可能 > 8，界面显示"今日做 8 题"） */
  dueTotal: number;
  /** 当前主题剩余未学词数 */
  freshRemaining: number;
  /** 本次队列实际采用的每日词量（用户可自定义） */
  dailyNew: number;
  dailyReview: number;
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

/**
 * 词素切分的词干白名单：只有词库里真实存在的词形才允许被当作词干展示。
 * 2026-11-07 实跑发现旧规则把 brother 切成 broth|er、family 切成 famil|y，
 * 都是假词干；注入这份集合后这类词一律降级 C，不再教错。
 */
export const KNOWN_WORD_FORMS: ReadonlySet<string> = new Set(
  flatWords.map((x) => x.word.en.toLowerCase()).filter((en) => /^[a-z]+$/.test(en))
);

/** 首音听辨的干扰项来源（只取纯字母开头的词形） */
export const ONSET_CANDIDATE_FORMS: readonly string[] = flatWords
  .map((x) => x.word.en.toLowerCase())
  .filter((en) => /^[a-z]/.test(en));

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
  const analysis = analyzeWord(meta.word, KNOWN_WORD_FORMS);
  const all = allVocabWords();
  return {
    ...meta,
    analysis,
    kind,
    box: progress?.box ?? 1,
    hintLevel: hintLevelFor(progress?.box ?? 1),
    progress,
    relatives: analysis.route === 'B' ? findRelatives(meta.word.en, analysis.stem, all) : [],
    drill: analysis.route === 'C'
      ? buildCListeningDrill(meta.word, ONSET_CANDIDATE_FORMS)
      : null,
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
      picked.push({ word: w, themeId: t.id, themeZh: t.nameZh, analysis: analyzeWord(w, KNOWN_WORD_FORMS) });
    }
  }
  // 22 主题 × 1 = 22 条，截到 20；不足则从剩余词补齐
  const out = picked.slice(0, PLACEMENT_SIZE);
  if (out.length < PLACEMENT_SIZE) {
    const seen = new Set(out.map((x) => x.word.id));
    for (const meta of flatWords) {
      if (out.length >= PLACEMENT_SIZE) break;
      if (seen.has(meta.word.id)) continue;
      out.push({ ...meta, analysis: analyzeWord(meta.word, KNOWN_WORD_FORMS) });
      seen.add(meta.word.id);
    }
  }
  return out;
}

export function buildTodayQueue(input: {
  words: Record<string, VocabWordProgress>;
  currentThemeId: string;
  today: string;
  dailyNew?: number;
  dailyReview?: number;
}): VocabTodayQueue {
  const { words, today } = input;
  const theme = allThemes.find((t) => t.id === input.currentThemeId) ?? allThemes[0];
  const currentThemeId = theme.id;
  const dailyNew = clampDailyCount(input.dailyNew, NEW_PER_DAY, DAILY_NEW_OPTIONS);
  const dailyReview = clampDailyCount(input.dailyReview, REVIEW_PER_DAY, DAILY_REVIEW_OPTIONS);

  // ---- 复习：全局到期，先按 dueAt（逾期越久越优先），再按盒子小优先 ----
  const due = Object.values(words)
    .filter((p) => p.status !== 'new' && p.dueAt <= today)
    .filter((p) => wordIndex.has(p.wordId))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt) || a.box - b.box || b.wrong - a.wrong);
  const review = interleave(
    due.slice(0, dailyReview).map((p) => toItem(wordIndex.get(p.wordId)!, 'review', p))
  );

  // ---- 新词：当前主题内按词表顺序，跳过已入场/已学词 ----
  const freshMeta: { word: Word; themeId: string; themeZh: string }[] = [];
  for (const meta of flatWords) {
    if (meta.themeId !== currentThemeId) continue;
    const p = words[meta.word.id];
    if (p && p.status !== 'new') continue;
    freshMeta.push(meta);
  }
  const fresh = freshMeta.slice(0, dailyNew).map((m) => toItem(m, 'new', words[m.word.id] ?? null));

  return {
    review,
    fresh,
    currentThemeId,
    dueTotal: due.length,
    freshRemaining: freshMeta.length,
    dailyNew,
    dailyReview,
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

// ========== 主题语境段 ==========
//
// 只做「把词放回真实例句」这一层，不谎称是连贯故事：
//   · 每句都取自该主题里某个词的 example，优先本轮 6 个新词
//   · 连接词只是顺序标记（First / Then / ...），不新增任何事实内容
//   · 多空回填（默认 3 个）替代原来「最后一句挖 1 个空」，提高提取次数
//   · 不计入掌握判定，听写仍是唯一掌握证据
export interface PassageSentence {
  /** 展示文本，被挖空的句子含 ____；未挖空则为原句 */
  text: string;
  /** 原始例句，用于朗读与校验「没有编造」 */
  plain: string;
  zh: string;
  wordId: string;
  /** 该句对应的空序号（0-based），null 表示不挖空 */
  blankIndex: number | null;
}

export interface PassageBlank {
  wordId: string;
  answer: string;
  hint: string;
}

export interface ContextPassage {
  sentences: PassageSentence[];
  blanks: PassageBlank[];
  connectors: string[];
  note: string;
}

const PASSAGE_CONNECTORS = ['First,', 'Then,', 'Also,', 'After that,', 'Finally,', 'And'];
const PASSAGE_SIZE = 6;
const PASSAGE_BLANKS = 3;

export function buildPassage(items: VocabQueueItem[], themeId?: string): ContextPassage {
  const tid = themeId ?? items[0]?.themeId ?? allThemes[0].id;
  const theme = allThemes.find((t) => t.id === tid) ?? allThemes[0];

  // 本轮新词优先，不足 6 句时用同主题其它词的例句补齐
  const chosen: Word[] = [];
  const picked = new Set<string>();
  for (const it of items) {
    if (chosen.length >= PASSAGE_SIZE) break;
    if (it.word.example && !picked.has(it.word.id)) {
      chosen.push(it.word);
      picked.add(it.word.id);
    }
  }
  for (const w of theme.words) {
    if (chosen.length >= PASSAGE_SIZE) break;
    if (w.example && !picked.has(w.id)) {
      chosen.push(w);
      picked.add(w.id);
    }
  }

  // 能定位原形的句子才可挖空；按本轮顺序取前 3 个
  const blankWords: Word[] = [];
  for (const w of chosen) {
    if (blankWords.length >= PASSAGE_BLANKS) break;
    if (blankSentence(w)) blankWords.push(w);
  }
  const blankIndexOf = new Map(blankWords.map((w, i) => [w.id, i]));

  const sentences: PassageSentence[] = chosen.map((w) => {
    const blankIndex = blankIndexOf.get(w.id) ?? null;
    const blanked = blankIndex !== null ? blankSentence(w) : null;
    return {
      text: blanked?.sentence ?? w.example,
      plain: w.example,
      zh: w.exampleZh,
      wordId: w.id,
      blankIndex,
    };
  });

  return {
    sentences,
    blanks: blankWords.map((w) => ({ wordId: w.id, answer: w.en, hint: w.zh })),
    connectors: PASSAGE_CONNECTORS.slice(0, sentences.length),
    note: '每一句都来自词库里该词的真实例句，按场景顺序排列。它不是连贯故事，重点是让刚学的词回到句子里再认一次。',
  };
}

// ========== 词义四选一（补「选」层，2026-11-09）==========
//
// 口径：干扰项只取词库里其它词的真实中文释义，零编造；同主题优先。
//   · 不进掌握判定、不保存、答错可重选、允许跳过
//   · 正确项位置由 wordId 决定，刷新不变（避免孩子靠记住位置蒙对）
function stableHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function buildMeaningOptions(item: VocabQueueItem, size = 4): string[] {
  const correct = (item.word.zh || '').trim();
  if (!correct) return [];
  const sameTheme = flatWords.filter(
    (x) => x.themeId === item.themeId && x.word.id !== item.word.id
  );
  const pool = [...sameTheme.map((x) => x.word), ...flatWords.map((x) => x.word)];
  const seen = new Set<string>([correct]);
  const distractors: string[] = [];
  for (const w of pool) {
    if (distractors.length >= size - 1) break;
    const zh = (w.zh || '').trim();
    if (!zh || seen.has(zh)) continue;
    seen.add(zh);
    distractors.push(zh);
  }
  const opts = [...distractors];
  opts.splice(stableHash(item.word.id) % (opts.length + 1), 0, correct);
  return opts;
}

/** 听写判定：忽略大小写与首尾空格；连字符/空格型短语允许空格数量不同 */
export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isDictationCorrect(input: string, answer: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(answer);
}
