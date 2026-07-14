// ========== 每日语法打卡 session 生成器 ==========
// 纯函数：根据当前学习状态生成一次打卡流程的题目集合。
// 流程：① 复习(间隔加权抽旧错点) ② 新点学习(归纳式) ③ 对比训练(易混搭档) ④ 产出练习 ⑤ 混合测验(穿插)
import {
  ROADMAP,
  GRAMMAR_QUESTIONS,
  getPartner,
  getContrastHint,
  getQuestionById,
  getPoint,
  type PracticeTypeLite,
} from '../data/grammarRoadmap';
import type { PointProgress } from '../store/useDailyCheckinStore';

export interface SessionQuestion {
  grammarId: string;
  q: any; // GrammarFillQuestion | GrammarChoiceQuestion | GrammarCorrectionQuestion
  pType: PracticeTypeLite;
  purpose: 'review' | 'learn' | 'contrast' | 'production' | 'mixed';
}

export interface LearnStep {
  pointId: string;
  point: any; // GrammarPoint
  questions: SessionQuestion[];
}

export interface ContrastStep {
  partnerId: string | null;
  hint: string | null;
  questions: SessionQuestion[];
}

export interface DailySession {
  newPointId: string | null;
  review: SessionQuestion[];
  learn: LearnStep | null;
  contrast: ContrastStep | null;
  production: SessionQuestion[];
  mixed: SessionQuestion[];
}

export interface GenInput {
  points: Record<string, PointProgress>;
  // 来自 progressStore.getWrongAnswers('grammar') 的 (grammarId, questionId)
  wrongList: { grammarId: string; questionId: string }[];
  // 'checkin' 主打卡（默认）| 'extra' 额外练习（不推进路线图、去重不重复）
  mode?: 'checkin' | 'extra';
  // 额外练习时排除主打卡已出过的题目 id，防止重复出题
  excludeIds?: Set<string>;
  // 额外练习的焦点语法点（主打卡今日新点），避免额外练习"教新点"
  focusPointId?: string | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 额外练习去重：排除主打卡已出过的题目
function notExcluded(qid: string, exclude?: Set<string>): boolean {
  return !exclude || !exclude.has(qid);
}
function shuffleFiltered(items: SessionQuestion[], exclude?: Set<string>): SessionQuestion[] {
  return shuffle(items.filter((s) => notExcluded(s.q.id, exclude)));
}
// 所有已学点的题目（打乱并去重），用于额外练习复习兜底
function weakPoolItems(points: Record<string, PointProgress>, exclude?: Set<string>): SessionQuestion[] {
  const out: SessionQuestion[] = [];
  for (const id of ROADMAP) {
    if (points[id]?.introduced) out.push(...allOf(id));
  }
  return shuffleFiltered(out, exclude);
}

// 从某语法点取全部题目（含题型），用于抽样
function allOf(grammarId: string): SessionQuestion[] {
  const pq = GRAMMAR_QUESTIONS[grammarId];
  if (!pq) return [];
  const out: SessionQuestion[] = [];
  pq.fill.forEach((q) => out.push({ grammarId, q, pType: 'fill', purpose: 'mixed' }));
  pq.choice.forEach((q) => out.push({ grammarId, q, pType: 'choice', purpose: 'mixed' }));
  pq.correction.forEach((q) => out.push({ grammarId, q, pType: 'correction', purpose: 'mixed' }));
  return out;
}

// 加权无放回抽样
function weightedPick<T>(items: T[], weight: (t: T) => number, n: number): T[] {
  const pool = [...items];
  const chosen: T[] = [];
  while (chosen.length < n && pool.length > 0) {
    const total = pool.reduce((s, it) => s + Math.max(1, weight(it)), 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= Math.max(1, weight(pool[i]));
      if (r <= 0) { idx = i; break; }
      idx = i;
    }
    chosen.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return chosen;
}

function toSession(
  grammarId: string,
  qid: string,
  purpose: SessionQuestion['purpose'],
): SessionQuestion | null {
  const found = getQuestionById(grammarId, qid);
  if (!found) return null;
  return { grammarId, q: found.q, pType: found.pType, purpose };
}

export function generateSession(input: GenInput): DailySession {
  const { points, wrongList, mode = 'checkin', excludeIds, focusPointId } = input;
  const ne = (id: string) => notExcluded(id, excludeIds);

  // ---- 今日新点 / 焦点 ----
  let newPointId: string | null;
  if (mode === 'extra') {
    // 额外练习：锚定主打卡今日新点；缺失则取最近已学点；绝不"教新点"
    newPointId =
      (focusPointId && points[focusPointId]?.introduced ? focusPointId : null) ??
      ROADMAP.filter((id) => points[id]?.introduced).slice(-1)[0] ??
      ROADMAP[0];
  } else {
    newPointId = null;
    for (const id of ROADMAP) {
      if (!points[id]?.introduced) { newPointId = id; break; }
    }
    if (!newPointId) {
      for (const id of ROADMAP) {
        if ((points[id]?.stage ?? 0) < 4) { newPointId = id; break; }
      }
    }
    // 若全部熟练，选第一个点做复习日
    if (!newPointId) newPointId = ROADMAP[0];
  }

  const validWrong = wrongList.filter((w) => getQuestionById(w.grammarId, w.questionId));

  // ---- ① 复习：间隔加权抽旧错点（题数随错题量动态伸缩，3~5）----
  const reviewCandidates: { grammarId: string; qid: string; w: number }[] = [];
  for (const w of validWrong) {
    const p = points[w.grammarId];
    const weight = (p?.wrong ?? 1) + (p ? 5 - p.box : 4) + 1;
    reviewCandidates.push({ grammarId: w.grammarId, qid: w.questionId, w: weight });
  }
  // 错题不足时，用"低盒子 + 未熟练"的补充池
  if (reviewCandidates.length < 2) {
    for (const id of ROADMAP) {
      const p = points[id];
      if (p?.introduced && (p.stage ?? 0) < 4) {
        const all = allOf(id);
        if (all.length) {
          const pick = shuffle(all)[0];
          reviewCandidates.push({ grammarId: id, qid: pick.q.id, w: 5 - p.box + 1 });
        }
      }
    }
  }
  // 额外练习：先排除主打卡已出的题；若过滤后为空，回退到"所有已学点"去重池，避免重复刚错的题
  const reviewPool = (() => {
    if (mode !== 'extra') return reviewCandidates;
    const filtered = reviewCandidates.filter((c) => ne(c.qid));
    if (filtered.length) return filtered;
    return weakPoolItems(points, excludeIds)
      .slice(0, Math.min(5, Math.max(3, Math.ceil(validWrong.length / 2))))
      .map((s) => ({ grammarId: s.grammarId, qid: s.q.id, w: 2 }));
  })();
  const reviewCount = Math.min(5, Math.max(3, Math.ceil(validWrong.length / 2)));
  const review = weightedPick(reviewPool, (c) => c.w, reviewCount)
    .map((c) => toSession(c.grammarId, c.qid, 'review'))
    .filter((x): x is SessionQuestion => x !== null);

  // ---- ② 新点学习（归纳式）----
  let learn: LearnStep | null = null;
  if (newPointId && getPoint(newPointId)) {
    const sample = shuffleFiltered(allOf(newPointId), excludeIds)
      .slice(0, 2)
      .map((s) => ({ ...s, purpose: 'learn' as const }));
    learn = { pointId: newPointId, point: getPoint(newPointId), questions: sample };
  }

  // ---- ③ 对比训练（易混搭档）----
  let contrast: ContrastStep | null = null;
  if (newPointId) {
    const partner = getPartner(newPointId);
    if (partner) {
      const hint = getContrastHint(newPointId, partner);
      const fromNew = shuffleFiltered(allOf(newPointId), excludeIds)
        .slice(0, 2)
        .map((s) => ({ ...s, purpose: 'contrast' as const }));
      const fromPartner = shuffleFiltered(allOf(partner), excludeIds)
        .slice(0, 1)
        .map((s) => ({ ...s, purpose: 'contrast' as const }));
      contrast = { partnerId: partner, hint, questions: shuffle([...fromNew, ...fromPartner]) };
    }
  }

  // ---- ④ 产出练习（改错优先，逼孩子"写出来/改出来"）----
  let production: SessionQuestion[] = [];
  if (newPointId) {
    const pq = GRAMMAR_QUESTIONS[newPointId];
    if (pq) {
      const corr = shuffleFiltered(
        pq.correction.map((q) => ({
          grammarId: newPointId!,
          q,
          pType: 'correction' as const,
          purpose: 'production' as const,
        })),
        excludeIds,
      ).slice(0, 2);
      production = corr.length
        ? corr
        : shuffleFiltered(
            pq.fill.map((q) => ({
              grammarId: newPointId!,
              q,
              pType: 'fill' as const,
              purpose: 'production' as const,
            })),
            excludeIds,
          ).slice(0, 2);
    }
  }

  // ---- ⑤ 混合测验（穿插：新点 + 之前学过其他点）----
  const mixedPool: SessionQuestion[] = [];
  if (newPointId) {
    mixedPool.push(
      ...shuffleFiltered(allOf(newPointId), excludeIds)
        .slice(0, 2)
        .map((s) => ({ ...s, purpose: 'mixed' as const })),
    );
  }
  const otherPoints = ROADMAP.filter(
    (id) => id !== newPointId && (points[id]?.introduced || (points[id]?.stage ?? 0) >= 1),
  );
  const otherSample = shuffle(otherPoints).slice(0, 3);
  for (const id of otherSample) {
    const one = shuffleFiltered(allOf(id), excludeIds)[0];
    if (one) mixedPool.push({ ...one, purpose: 'mixed' });
  }
  // 若混合池仍不足，用新点补足（同样去重）
  if (mixedPool.length < 4 && newPointId) {
    const extra = shuffleFiltered(allOf(newPointId), excludeIds)
      .slice(0, 4 - mixedPool.length)
      .map((s) => ({ ...s, purpose: 'mixed' as const }));
    mixedPool.push(...extra);
  }
  const mixed = shuffle(mixedPool).slice(0, 5);

  return { newPointId, review, learn, contrast, production, mixed };
}
