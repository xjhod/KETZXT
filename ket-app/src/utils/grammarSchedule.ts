// ========== 语法记忆调度的纯函数层（B 档，2026-11-10）==========
// 与 vocabSchedule.ts 同口径：Leitner 0/1/3/7/15、连续正确、首学间隔、一天最多升一级。
// 抽成纯函数是为了：① store 与 session 生成器共用同一份判定，不会两边写歪；
// ② Node 校验脚本能用真实日期实跑，而不是只靠 tsc 编译通过（vite 不做类型检查）。
// 这一层不 import store / zustand / 浏览器 API，保持零副作用。
import { addDays, daysBetween, todayString } from './vocabSchedule';

export { addDays, daysBetween, todayString };

/** 各盒子的复习间隔（天）。与词汇 Leitner 一致，便于两边对照 */
export const GRAMMAR_BOX_INTERVAL_DAYS: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 15 };
/** 熟练 = Box 5 + 连续 2 次手写正确 + 距首次学习 ≥ 7 天 */
export const GRAMMAR_MASTER_STREAK = 2;
export const GRAMMAR_MASTER_MIN_DAYS = 7;

export interface GrammarPointProgress {
  grammarId: string;
  introduced: boolean; // 是否已被作为"今日新点"学过
  stage: number; // 0 未开始 / 1 已学 / 2 已对比产出 / 4 熟练（旧数据兼容）
  right: number;
  wrong: number;
  box: number; // Leitner 盒子 1-5
  lastSeen: string | null; // 最近一次练题日期 YYYY-MM-DD
  // ---- B 档新增字段 ----
  dueAt: string | null; // 下次到期日 YYYY-MM-DD
  streak: number; // 连续手写正确次数（手写产出是唯一掌握证据）
  firstLearnedAt: string | null; // 首次学习日
  lastPromotedAt: string | null; // 最近一次升盒日期，保证「一天最多升一级」
  mastered: boolean; // 是否已判熟练
  updatedAt: string | null; // 最近一次状态变更日，供云同步判定新旧
}

function clampBox(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(5, Math.max(1, Math.round(n))) : 1;
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function emptyGrammarPoint(id: string, today = todayString()): GrammarPointProgress {
  return {
    grammarId: id,
    introduced: false,
    stage: 0,
    right: 0,
    wrong: 0,
    box: 1,
    lastSeen: null,
    dueAt: today,
    streak: 0,
    firstLearnedAt: null,
    lastPromotedAt: null,
    mastered: false,
    updatedAt: null,
  };
}

/**
 * 旧数据迁移：补齐 B 档字段，不丢任何旧值。
 * - dueAt 缺省按「上次练题日 + 该盒间隔」推回，没练过就当天到期
 * - firstLearnedAt 缺省用 lastSeen（旧版没记首学日，只能近似，不假装精确）
 * - 旧版 stage>=4 表示熟练，直接保留为 mastered=true，避免升级后进度倒退
 */
export function migrateGrammarPoint(
  raw: unknown,
  today = todayString(),
): GrammarPointProgress {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const lastSeen = typeof p.lastSeen === 'string' ? p.lastSeen : null;
  const box = clampBox(p.box);
  return {
    grammarId: String(p.grammarId ?? ''),
    introduced: Boolean(p.introduced),
    stage: num(p.stage),
    right: num(p.right),
    wrong: num(p.wrong),
    box,
    lastSeen,
    dueAt: typeof p.dueAt === 'string'
      ? p.dueAt
      : (lastSeen ? addDays(lastSeen, GRAMMAR_BOX_INTERVAL_DAYS[box]) : today),
    streak: num(p.streak),
    firstLearnedAt: typeof p.firstLearnedAt === 'string'
      ? p.firstLearnedAt
      : (lastSeen ?? null),
    lastPromotedAt: typeof p.lastPromotedAt === 'string' ? p.lastPromotedAt : null,
    mastered: p.mastered === true || num(p.stage) >= 4,
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : (lastSeen ?? null),
  };
}

/** 熟练判定：只认 Box5 + 连续 2 次手写正确 + 首学 ≥7 天；混合测验正确率不参与 */
export function isGrammarMastered(
  p: GrammarPointProgress | null | undefined,
  today = todayString(),
): boolean {
  if (!p) return false;
  if (p.mastered) return true;
  return (
    p.box >= 5 &&
    p.streak >= GRAMMAR_MASTER_STREAK &&
    daysBetween(p.firstLearnedAt, today) >= GRAMMAR_MASTER_MIN_DAYS
  );
}

/** 是否到期：已学、未熟练、到期日已到 */
export function isGrammarDue(
  p: GrammarPointProgress | null | undefined,
  today = todayString(),
): boolean {
  if (!p || !p.introduced || isGrammarMastered(p, today)) return false;
  return (p.dueAt ?? today) <= today;
}

/** 逾期天数，用于复习抽题加权（越久没复习越优先） */
export function grammarDueUrgency(
  p: GrammarPointProgress | null | undefined,
  today = todayString(),
): number {
  if (!p || !isGrammarDue(p, today)) return 0;
  return Math.max(0, daysBetween(p.dueAt ?? today, today));
}

export interface GrammarAnswerOutcome {
  boxBefore: number;
  boxAfter: number;
  promoted: boolean;
  next: GrammarPointProgress;
}

/**
 * 一次常规答题（选择/填空/判断）后的状态转移。
 * B 档关键约束：**一天最多升一级**，首日 11 题不再把 box 从 1 直接刷到 5。
 * 答错回 Box 1、当天重新到期；升盒后按 0/1/3/7/15 排下次到期日。
 * streak（手写连续正确）是另一条证据链，常规选择题不改它。
 */
export function applyGrammarAnswer(
  raw: GrammarPointProgress | unknown,
  correct: boolean,
  today = todayString(),
): GrammarAnswerOutcome {
  const p = migrateGrammarPoint(raw, today);
  const firstLearnedAt = p.firstLearnedAt ?? today;
  let box = p.box;
  let lastPromotedAt = p.lastPromotedAt;

  if (!correct) {
    box = 1;
    // 把当天标记为「已处理排期」：回盒后即使马上蒙对也不许当天再升，
    // 同时兼容设备时钟回拨 / 云端拉回 lastPromotedAt 在未来的情况。
    lastPromotedAt = today;
  } else if (lastPromotedAt !== today) {
    box = Math.min(5, p.box + 1);
    lastPromotedAt = today;
  }

  const next: GrammarPointProgress = {
    ...p,
    box,
    dueAt: addDays(today, GRAMMAR_BOX_INTERVAL_DAYS[box]),
    firstLearnedAt,
    lastPromotedAt,
    right: p.right + (correct ? 1 : 0),
    wrong: p.wrong + (correct ? 0 : 1),
    lastSeen: today,
    updatedAt: today,
  };
  next.mastered = isGrammarMastered(next, today);
  return { boxBefore: p.box, boxAfter: box, promoted: box > p.box, next };
}

/**
 * 一次手写产出后的状态转移（A 档手写在 B 档起计入熟练判定）。
 * 只更新连续手写正确次数，不动 box / dueAt / 升盒节奏：
 * 手写是「掌握证据」，选择题是「排期证据」，两条链分开才不会互相污染。
 * 跳过不调用本函数，因此既不算对也不算错。
 */
export function applyGrammarProduction(
  raw: GrammarPointProgress | unknown,
  correct: boolean,
  today = todayString(),
): { streak: number; mastered: boolean; next: GrammarPointProgress } {
  const p = migrateGrammarPoint(raw, today);
  const next: GrammarPointProgress = {
    ...p,
    streak: correct ? p.streak + 1 : 0,
    firstLearnedAt: p.firstLearnedAt ?? today,
    updatedAt: today,
  };
  next.mastered = isGrammarMastered(next, today);
  return { streak: next.streak, mastered: next.mastered, next };
}

/** 下一个该学的点：先取未学过的；全部学过后，取已学但未熟练的；全熟练返回 null */
export function pickNextGrammarPointId(
  points: Record<string, GrammarPointProgress | unknown> | null | undefined,
  roadmap: readonly string[],
  today = todayString(),
): string | null {
  const p = points ?? {};
  for (const id of roadmap) {
    if (!p[id] || !migrateGrammarPoint(p[id], today).introduced) return id;
  }
  for (const id of roadmap) {
    const cur = p[id] ? migrateGrammarPoint(p[id], today) : null;
    if (cur?.introduced && !isGrammarMastered(cur, today)) return id;
  }
  return null;
}

/** 云同步：哪一份 point 状态更新（整条取，避免 box/dueAt/streak 字段级取 max 自相矛盾） */
export function newerGrammarPoint(
  a: GrammarPointProgress | unknown,
  b: GrammarPointProgress | unknown,
  today = todayString(),
): GrammarPointProgress {
  const pa = migrateGrammarPoint(a, today);
  const pb = migrateGrammarPoint(b, today);
  const rank = (p: GrammarPointProgress) => [
    p.updatedAt ?? '',
    p.lastSeen ?? '',
    p.right + p.wrong,
    p.streak,
  ];
  const ra = rank(pa);
  const rb = rank(pb);
  for (let i = 0; i < ra.length; i++) {
    const av = ra[i];
    const bv = rb[i];
    // 数字项按数值比（否则 '10' < '9' 会误判），日期项按字典序比
    if (typeof av === 'number' && typeof bv === 'number') {
      if (bv > av) return pb;
      if (bv < av) return pa;
    } else {
      if (String(bv) > String(av)) return pb;
      if (String(bv) < String(av)) return pa;
    }
  }
  return pa;
}
