// ========== 每日语法打卡 session 生成器 ==========
// 纯函数：根据当前学习状态生成一次打卡流程的题目集合。
// 流程：① 复习(到期点优先 + 错题加权) ② 新点学习(讲解前置) ③ 对比训练(真交错) ④ 产出练习 ⑤ 混合测验(当日反馈)
// 2026-11-10 A 档：新增 errorTagFor（错因标签）与 buildMeaningQuestions（精读真实句子的形式→意义判断题），
// 二者都只从现有数据派生，不新增题库内容；A 档本身不动云同步（B 档在 sync.ts 单独处理）。
// 2026-11-10 B 档：复习按 dueAt 到期点抽、熟练判定走 grammarSchedule、对比题按语法点交替排列。
import {
  ROADMAP,
  GRAMMAR_QUESTIONS,
  getPartners,
  getContrastHint,
  getQuestionById,
  getPoint,
  type PracticeTypeLite,
} from '../data/grammarRoadmap';
import type { PointProgress } from '../store/useDailyCheckinStore';
import { getReading } from '../data/grammarReading';
import {
  grammarDueUrgency,
  isGrammarDue,
  isGrammarMastered,
  migrateGrammarPoint,
  pickNextGrammarPointId,
  todayString,
  type GrammarPointProgress,
} from './grammarSchedule';

// ========== A 档新增（2026-11-10）：错因标签 + 形式→意义判断题 ==========
// 口径：不新增题目内容，全部从现有 explanation / 精读段落派生，零编造。

/**
 * 从题目自带的 explanation 关键字派生错因标签。
 * 只做分类，不生成任何解释文本；匹配不到就返回 null（界面不显示标签）。
 */
export function errorTagFor(explanation: string): string | null {
  const s = explanation ?? '';
  if (/三单|第三人称|加s|加 s|动词原形/.test(s)) return '第三人称单数';
  if (/be\s*动词|am\s*\/\s*is\s*\/\s*are|be动词/.test(s)) return 'be 动词';
  if (/时态|过去式|现在进行|一般过去|一般现在|时间状语/.test(s)) return '时态';
  if (/介词|in\s*\/\s*on\s*\/\s*at/.test(s)) return '介词';
  if (/语序|疑问句|疑问词|倒装/.test(s)) return '语序';
  if (/复数|名词单复数|可数/.test(s)) return '名词复数';
  return null;
}

/**
 * 「形式→意义」判断题：题干用精读段落里的真实英文句子，
 * 正确选项是该句自带的中文翻译，干扰项是同一篇里另一句的真实翻译。
 * 复用 choice 的 question/options/answer 结构，GrammarQuestionCard 无需改题型。
 */
export function buildMeaningQuestions(grammarId: string, count = 2): SessionQuestion[] {
  const reading = getReading(grammarId);
  if (!reading) return [];
  const segs = reading.segments.filter((s) => s.en?.trim() && s.zh?.trim());
  const out: SessionQuestion[] = [];
  for (let i = 0; i < segs.length && out.length < count; i++) {
    const seg = segs[i];
    const distractor = segs.find((s) => s.zh.trim() !== seg.zh.trim());
    if (!distractor) continue;
    out.push({
      grammarId,
      purpose: 'mixed',
      pType: 'choice',
      q: {
        id: `${grammarId}-meaning-${out.length + 1}`,
        grammarId,
        question: `${seg.en.trim()} — 这句话在说什么？留意句中的动词形式。`,
        options: shuffle([seg.zh.trim(), distractor.zh.trim()]),
        answer: seg.zh.trim(),
        explanation: seg.note?.trim() || '把英文句子和它的意思对上，再看用了哪种动词形式。',
        kind: 'meaning',
      },
    });
  }
  return out;
}

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
  // B 档：今日日期 YYYY-MM-DD，可注入以便校验脚本确定性验证；缺省取本机当天
  today?: string;
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
  const t = input.today ?? todayString();
  const ne = (id: string) => notExcluded(id, excludeIds);
  const pointOf = (id: string): GrammarPointProgress | null =>
    points[id] ? migrateGrammarPoint(points[id], t) : null;

  // ---- 今日新点 / 焦点 ----
  let newPointId: string | null;
  if (mode === 'extra') {
    // 额外练习：锚定主打卡今日新点；缺失则取最近已学点；绝不"教新点"
    newPointId =
      (focusPointId && points[focusPointId]?.introduced ? focusPointId : null) ??
      ROADMAP.filter((id) => points[id]?.introduced).slice(-1)[0] ??
      ROADMAP[0];
  } else {
    // B 档：与 store.getNextNewPointId 共用同一判据（不再用 stage<4）
    newPointId = pickNextGrammarPointId(points, ROADMAP, t);
    if (!newPointId) newPointId = ROADMAP[0]; // 全部熟练，复习日
  }

  const validWrong = wrongList.filter((w) => getQuestionById(w.grammarId, w.questionId));

  // ---- ① 复习：固定 5 题。B 档：到期点优先，再错题，最后低盒子补足 ----
  const usedQids = new Set<string>();
  const review: SessionQuestion[] = [];
  const availableOf = (id: string) =>
    shuffle(allOf(id).filter((s) => ne(s.q.id) && !usedQids.has(s.q.id)));
  const pushReview = (id: string, s: SessionQuestion | null | undefined) => {
    if (!s || review.length >= 5 || usedQids.has(s.q.id)) return;
    usedQids.add(s.q.id);
    review.push({ ...s, grammarId: id, purpose: 'review' });
  };

  // ① 到期点优先：按逾期天数降序，每个点先取 1 题，最该复习的不会漏
  const dueIds = ROADMAP
    .filter((id) => isGrammarDue(pointOf(id), t))
    .sort((a, b) => grammarDueUrgency(pointOf(b), t) - grammarDueUrgency(pointOf(a), t));
  for (const id of dueIds) {
    if (review.length >= 5) break;
    pushReview(id, availableOf(id)[0]);
  }
  // ② 错题补足：按「错误数 + 低盒子 + 逾期」加权
  if (review.length < 5) {
    const miss = validWrong
      .filter((w) => ne(w.questionId) && !usedQids.has(w.questionId))
      .map((w) => {
        const p = pointOf(w.grammarId);
        return {
          grammarId: w.grammarId,
          qid: w.questionId,
          w: 10 + (p?.wrong ?? 1) + (p ? 5 - p.box : 4) + grammarDueUrgency(p, t),
        };
      });
    for (const c of weightedPick(miss, (x) => x.w, 5 - review.length)) {
      pushReview(c.grammarId, toSession(c.grammarId, c.qid, 'review'));
    }
  }
  // ③ 不足 5 题：低盒子 + 未熟练点补足（既有产品决策：复习环节固定 5 题）
  if (review.length < 5) {
    const fallbackIds = ROADMAP
      .filter((id) => {
        const p = pointOf(id);
        return p?.introduced && !isGrammarMastered(p, t);
      })
      .sort((a, b) => (pointOf(a)?.box ?? 1) - (pointOf(b)?.box ?? 1));
    for (const id of fallbackIds) {
      if (review.length >= 5) break;
      pushReview(id, availableOf(id)[0]);
    }
  }
  // ④ 额外练习：题目已避开主打卡，还不够就用「所有已学点」去重池补满
  if (mode === 'extra' && review.length < 5) {
    for (const s of weakPoolItems(points, excludeIds)) {
      if (review.length >= 5) break;
      if (!usedQids.has(s.q.id)) pushReview(s.grammarId, s);
    }
  }

  // ---- ② 新点学习（归纳式）----
  let learn: LearnStep | null = null;
  if (newPointId && getPoint(newPointId)) {
    const sample = shuffleFiltered(allOf(newPointId), excludeIds)
      .slice(0, 2)
      .map((s) => ({ ...s, purpose: 'learn' as const }));
    learn = { pointId: newPointId, point: getPoint(newPointId), questions: sample };
  }

  // ---- ③ 对比训练（B 档：只跟「已学过」的点比，题目按点交替排列）----
  let contrast: ContrastStep | null = null;
  if (newPointId) {
    const partners = getPartners(newPointId);
    const learned = (id: string) => Boolean(pointOf(id)?.introduced);
    // 优先已引入且到期的搭档；其次任意已引入搭档；再退其它已引入且到期的点。
    // 没有可比对象就不硬凑（首日不拿没学过的点来"对比"，那等于提前教新点）。
    const otherId =
      partners.find((id) => learned(id) && isGrammarDue(pointOf(id), t)) ??
      partners.find(learned) ??
      dueIds.find((id) => id !== newPointId && learned(id)) ??
      null;
    if (otherId) {
      const fromNew = shuffleFiltered(allOf(newPointId), excludeIds)
        .slice(0, 2)
        .map((s) => ({ ...s, purpose: 'contrast' as const }));
      const fromOther = shuffleFiltered(allOf(otherId), excludeIds)
        .slice(0, 2)
        .map((s) => ({ ...s, purpose: 'contrast' as const }));
      // 真交错：两点的题一题一题交替，而不是 shuffle 后可能连着两题同一点
      const flip = Math.random() < 0.5;
      const interleaved: SessionQuestion[] = [];
      for (let i = 0; i < Math.max(fromNew.length, fromOther.length); i++) {
        const first = flip ? fromOther[i] : fromNew[i];
        const second = flip ? fromNew[i] : fromOther[i];
        if (first) interleaved.push(first);
        if (second) interleaved.push(second);
      }
      contrast = {
        partnerId: otherId,
        hint: getContrastHint(newPointId, otherId),
        questions: interleaved,
      };
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
  // A 档：混合测验至少留 1 道「形式→意义」题，句子取自该点精读真实语料。
  // 单独保留而不参与 shuffle 截断，否则 5 题里经常被挤掉，等于没加。
  const meaningQs = newPointId ? buildMeaningQuestions(newPointId, 1) : [];
  const normalPool = shuffle(mixedPool).filter(
    (s) => !meaningQs.some((m) => m.q.id === s.q.id)
  );
  const mixed = shuffle([
    ...normalPool.slice(0, Math.max(0, 5 - meaningQs.length)),
    ...meaningQs,
  ]);

  return { newPointId, review, learn, contrast, production, mixed };
}
