// ========== 词汇记忆调度的纯函数层（无浏览器依赖，可被 Node 校验脚本直接跑）==========
// 抽出来是为了让「升盒 / 回盒 / 掌握判据」有单一数据源，且能用真实数据实跑验证，
// 而不是只靠 TypeScript 编译通过（vite/esbuild 不做类型检查，编译通过掩盖不了逻辑错）。
import type { VocabBox, VocabRoute, VocabWordProgress, VocabWordStatus } from '../types';

/** 各盒子的复习间隔（天）。Box 1 答错当天再来；Box 5 掌握后 15 天回看 */
export const BOX_INTERVAL_DAYS: Record<VocabBox, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 15 };
export const MASTER_STREAK = 2;
export const MASTER_MIN_DAYS = 7;

export function todayString(d = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return todayString(d);
}

export function daysBetween(a: string | null, b: string): number {
  if (!a) return 0;
  const da = new Date(`${a}T00:00:00`).getTime();
  const db = new Date(`${b}T00:00:00`).getTime();
  return Math.round((db - da) / 86400000);
}

export function emptyProgress(
  wordId: string,
  themeId: string,
  route: VocabRoute,
  today: string
): VocabWordProgress {
  return {
    wordId, themeId, route,
    box: 1, dueAt: today, streak: 0, right: 0, wrong: 0,
    lastSeen: null, firstLearnedAt: null, status: 'new',
  };
}

export interface DictationOutcome {
  boxBefore: VocabBox;
  boxAfter: VocabBox;
  mastered: boolean;
  next: VocabWordProgress;
}

/**
 * 一次听写后的状态转移。
 * 答对升一盒（上限 5），答错回 Box 1、连续正确清零、当天重新到期。
 * 掌握 = Box 5 + 连续 2 次听写正确 + 距首次学习 ≥ 7 天。
 */
export function applyDictation(
  prev: VocabWordProgress,
  correct: boolean,
  today: string
): DictationOutcome {
  const boxBefore = prev.box;
  const boxAfter: VocabBox = correct ? (Math.min(5, prev.box + 1) as VocabBox) : 1;
  const streak = correct ? prev.streak + 1 : 0;
  const firstLearnedAt = prev.firstLearnedAt ?? today;
  const mastered =
    correct && boxAfter === 5 && streak >= MASTER_STREAK &&
    daysBetween(firstLearnedAt, today) >= MASTER_MIN_DAYS;
  const status: VocabWordStatus = mastered ? 'mastered' : 'learning';
  const next: VocabWordProgress = {
    ...prev,
    box: boxAfter,
    dueAt: addDays(today, BOX_INTERVAL_DAYS[boxAfter]),
    streak,
    right: prev.right + (correct ? 1 : 0),
    wrong: prev.wrong + (correct ? 0 : 1),
    lastSeen: today,
    firstLearnedAt,
    status,
  };
  return { boxBefore, boxAfter, mastered, next };
}
