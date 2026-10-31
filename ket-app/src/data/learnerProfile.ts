/**
 * 学习画像引擎（L1）
 *
 * ============================ 设计要点 ============================
 *
 * 1) **画像是派生的，不是存储的**
 *    画像 = f(AnswerRecord[])，每次实时算出来，不单独持久化。
 *    好处：
 *      - 答题记录是唯一真相源，不可能出现「画像和记录不一致」
 *      - 遗忘衰减天然生效（拿 lastPracticed 和当前时间一算就是现在的掌握度）
 *      - 以后换算法（贝叶斯知识追踪 BKT / IRT）只需改 computeProfile，上层无感
 *
 * 2) **掌握度不是正确率，是「掌握概率 + 置信度」两个数**
 *    - mastery 0..1：估计当前掌握程度
 *    - confidence 0..1：这个估计有多可信（取决于练过几次）
 *    只看 mastery 排序会把「只做过 1 次且答错」的点和「练了 20 次总错 2 次」混为一谈。
 *
 * 3) **遗忘用艾宾浩斯衰减，且不同科目半衰期不同**
 *    听过的很快就忘（7 天），语法规则忘得慢（30 天）。
 *
 * 4) **答错要扣分，但扣得温和（-0.3 倍增益）**
 *    「不会」和「忘了」不一样 —— 全错应该比偶尔错扣得多，
 *    但一次失误不该把掌握度打回原点。
 *
 * 5) **学习率随置信度递减**
 *    α = 基础 × (1 - confidence)：越接近掌握，越难再提升。
 *    这才符合真实学习曲线（越学越慢），否则掌握度会无限逼近 1。
 * =================================================================
 */

import type { AnswerRecord } from '../store/useProgressStore';

export type ProfileArea = 'grammar' | 'vocab' | 'reading' | 'listening' | 'speaking' | 'writing';

export const PROFILE_AREAS: ProfileArea[] = [
  'grammar', 'vocab', 'reading', 'listening', 'speaking', 'writing',
];

export const AREA_LABEL: Record<ProfileArea, string> = {
  grammar: '语法',
  vocab: '词汇',
  reading: '阅读',
  listening: '听力',
  speaking: '口语',
  writing: '写作',
};

/** 单个知识点的掌握状态 */
export interface MasteryState {
  pointId: string;
  area: ProfileArea;
  name: string;
  /** 0..1 掌握概率 */
  mastery: number;
  /** 0..1 估计置信度（练习次数决定） */
  confidence: number;
  attempts: number;
  correct: number;
  /** 连续答对次数 */
  streak: number;
  /** 最后一次练习时间戳 */
  lastPracticed: number;
}

/** 领域聚合 */
export interface AreaState {
  area: ProfileArea;
  /** 0..1 按练习次数加权的平均掌握度 */
  mastery: number;
  attempts: number;
  correct: number;
}

export interface LearnerProfile {
  version: number;
  points: Record<string, MasteryState>;
  areas: Record<ProfileArea, AreaState>;
  updatedAt: number;
}

// ======================== 参数 ========================

/** 各科目的遗忘半衰期（天）—— 听过的忘得快，语法规则忘得慢 */
export const HALF_LIFE_DAYS: Record<ProfileArea, number> = {
  listening: 7,
  reading: 10,
  vocab: 14,
  speaking: 21,
  writing: 21,
  grammar: 30,
};

/** 基础学习率 */
const BASE_ALPHA = 0.35;
/** 答错的惩罚系数（相对答对的增益） */
const WRONG_PENALTY = 0.3;
/** 置信度达到 0.5 所需练习次数的指数底：confidence = 1 - 0.5^(attempts/K) */
const CONFIDENCE_K = 8;
/** 低于这个置信度的点不算「薄弱点」（样本不足，说明不了什么） */
export const MIN_CONFIDENCE_FOR_WEAK = 0.3;
/** 认为某知识点「已掌握」的门槛 */
export const MASTERY_MASTERED = 0.8;
/** 认为某知识点「待强化」的门槛 */
export const MASTERY_WEAK = 0.5;
/** 完全没练过的领域的基础份额（相对单位）—— 保持接触，但不与「缺口」竞争 */
const UNPRACTICED_SHARE = 0.5;

const DAY_MS = 86_400_000;

// ======================== 工具 ========================

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** 艾宾浩斯式衰减：掌握度随时间按半衰期指数衰减 */
export function decayMastery(mastery: number, elapsedDays: number, halfLifeDays: number): number {
  if (elapsedDays <= 0) return mastery;
  return mastery * Math.pow(0.5, elapsedDays / halfLifeDays);
}

/** 练习 n 次后的置信度 */
export function confidenceFor(attempts: number): number {
  if (attempts <= 0) return 0;
  return 1 - Math.pow(0.5, attempts / CONFIDENCE_K);
}

/** AnswerRecord.module -> ProfileArea */
export function areaOfModule(mod: string): ProfileArea {
  switch (mod) {
    case 'grammar': return 'grammar';
    case 'vocabulary': return 'vocab';
    case 'reading': return 'reading';
    case 'listening': return 'listening';
    case 'speaking': return 'speaking';
    case 'writing': return 'writing';
    default: return 'grammar';
  }
}

function emptyPoint(pointId: string, area: ProfileArea, name: string): MasteryState {
  return {
    pointId,
    area,
    name,
    mastery: 0,
    confidence: 0,
    attempts: 0,
    correct: 0,
    streak: 0,
    lastPracticed: 0,
  };
}

/**
 * 单次作答对掌握度的影响（纯函数，便于单测）
 *
 * @param prev  上一次的状态（首次为空）
 * @param correct 本次是否答对
 * @param area 领域（决定半衰期）
 * @param now 本次作答时间戳
 */
export function applyAnswer(
  prev: MasteryState | undefined,
  correct: boolean,
  area: ProfileArea,
  now: number
): MasteryState {
  const p = prev ?? emptyPoint('', area, '');
  const elapsedDays = p.lastPracticed ? (now - p.lastPracticed) / DAY_MS : 0;

  // 1) 先按时间衰减（只衰减已有掌握度，不影响初值）
  const decayed = decayMastery(p.mastery, Math.max(0, elapsedDays), HALF_LIFE_DAYS[area]);

  // 2) 学习率随置信度递减：越接近掌握越难再提升
  const alpha = BASE_ALPHA * (1 - p.confidence);

  // 3) 增益：答对往 1 走，答错往 0 走（扣得温和）
  const gain = (1 - decayed) * alpha * (correct ? 1 : -WRONG_PENALTY);
  const mastery = clamp01(decayed + gain);

  const attempts = p.attempts + 1;
  const correctCount = p.correct + (correct ? 1 : 0);

  return {
    pointId: p.pointId,
    area,
    name: p.name,
    mastery,
    confidence: confidenceFor(attempts),
    attempts,
    correct: correctCount,
    streak: correct ? p.streak + 1 : 0,
    lastPracticed: now,
  };
}

// ======================== 从答题记录构建画像 ========================

/**
 * 把答题记录重放成画像。
 *
 * 做法：按时间排序逐条 applyAnswer —— 这样每次作答的间隔用的是
 * 「上一次作答到这一次」的真实间隔，而不是一律用 now。
 * 最后再把每个点从 lastPracticed 衰减到 now，得到「此刻」的掌握度。
 */
export function computeProfile(records: AnswerRecord[], now: number = Date.now()): LearnerProfile {
  const points: Record<string, MasteryState> = {};
  const nameOf: Record<string, string> = {};

  // 按时间排序用数值比较而不是 localeCompare ——
  // localeCompare 走本地化规则，同一 locale 下对 ISO 字符串的排序不保证与码点序一致，
  // 会导致「打乱输入顺序 -> 画像不同」的诡异问题。
  const sorted = [...records].sort(
    (a, b) => (Date.parse(a.answeredAt) || 0) - (Date.parse(b.answeredAt) || 0)
  );

  for (const r of sorted) {
    const t = new Date(r.answeredAt).getTime();
    if (Number.isNaN(t)) continue;
    const area = areaOfModule(r.module);
    const key = r.subjectId || `unknown:${r.module}`;
    // 名字取最新一次记录里的（AnswerRecord 已带 subjectName）
    if (r.subjectName) nameOf[key] = r.subjectName;

    const prev = points[key];
    points[key] = applyAnswer(
      prev ? { ...prev, pointId: key, name: nameOf[key] ?? prev.name } : undefined,
      r.isCorrect,
      area,
      t
    );
    points[key].pointId = key;
    if (nameOf[key]) points[key].name = nameOf[key];
  }

  // 从最后一次练习衰减到「此刻」
  for (const key of Object.keys(points)) {
    const p = points[key];
    const elapsedDays = (now - p.lastPracticed) / DAY_MS;
    points[key] = {
      ...p,
      mastery: decayMastery(p.mastery, Math.max(0, elapsedDays), HALF_LIFE_DAYS[p.area]),
    };
  }

  return {
    version: 1,
    points,
    areas: aggregateAreas(points),
    updatedAt: now,
  };
}

/** 各领域掌握度（按练习次数加权平均 —— 练得多的说话更有分量） */
export function aggregateAreas(points: Record<string, MasteryState>): Record<ProfileArea, AreaState> {
  const out = {} as Record<ProfileArea, AreaState>;
  for (const a of PROFILE_AREAS) out[a] = { area: a, mastery: 0, attempts: 0, correct: 0 };

  for (const p of Object.values(points)) {
    const s = out[p.area];
    if (!s) continue;
    s.attempts += p.attempts;
    s.correct += p.correct;
  }
  for (const a of PROFILE_AREAS) {
    const s = out[a];
    const pts = Object.values(points).filter((p) => p.area === a);
    if (!pts.length) continue;
    let wSum = 0;
    let mSum = 0;
    for (const p of pts) {
      // 置信度低的点权重也低（样本不足，说明不了多少）
      const w = p.attempts * (0.4 + 0.6 * p.confidence);
      wSum += w;
      mSum += w * p.mastery;
    }
    s.mastery = wSum > 0 ? clamp01(mSum / wSum) : 0;
  }
  return out;
}

// ======================== 查询 ========================

/**
 * 薄弱知识点排序。
 * 排除低置信度的点 —— 只做过 1 次且答错，排最前面是没有意义的。
 */
export function weakestPoints(profile: LearnerProfile, limit = 10): MasteryState[] {
  return Object.values(profile.points)
    .filter((p) => p.confidence >= MIN_CONFIDENCE_FOR_WEAK && p.mastery < MASTERY_MASTERED)
    .sort((a, b) => a.mastery - b.mastery || b.attempts - a.attempts)
    .slice(0, limit);
}

/** 已掌握的知识点 */
export function masteredPoints(profile: LearnerProfile, limit = 10): MasteryState[] {
  return Object.values(profile.points)
    .filter((p) => p.confidence >= MIN_CONFIDENCE_FOR_WEAK && p.mastery >= MASTERY_MASTERED)
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, limit);
}

/** 样本不足、暂时无法判断的点（只练过很少次） */
export function lowConfidencePoints(profile: LearnerProfile): MasteryState[] {
  return Object.values(profile.points).filter((p) => p.confidence < MIN_CONFIDENCE_FOR_WEAK);
}

/**
 * 根据掌握度建议难度档位。
 * 三个档位对应到题库的 easy / medium / hard。
 */
export function suggestDifficulty(mastery: number): 'easy' | 'medium' | 'hard' {
  if (mastery < MASTERY_WEAK) return 'easy';
  if (mastery < MASTERY_MASTERED) return 'medium';
  return 'hard';
}

/**
 * 分配每日练习配比（按领域掌握度缺口 + 遗忘风险）。
 *
 * 缺口越大、忘得越快的领域分到的时间越多。
 * 返回值加起来为 1。
 */
export function allocateDailyMix(
  profile: LearnerProfile,
  weights: Partial<Record<ProfileArea, number>> = {}
): Record<ProfileArea, number> {
  const maxHalfLife = Math.max(...PROFILE_AREAS.map((a) => HALF_LIFE_DAYS[a]));
  const raw = {} as Record<ProfileArea, number>;
  let sum = 0;
  for (const a of PROFILE_AREAS) {
    const st = profile.areas[a];
    const w = weights[a] ?? 1;
    if (!st || st.attempts === 0) {
      // 没练过的领域给固定的基础份额（保持接触与探索），不参与「缺口」竞争
      raw[a] = UNPRACTICED_SHARE * w;
    } else {
      // 缺口 × 遗忘风险 × 外部权重
      // 遗忘风险用半衰期比值的平方根：直接用 1/halfLife 会把长半衰期科目压得过狠
      // （语法 1/30 vs 听力 1/7 差 4.3 倍，会让语法几乎分不到时间）
      const gap = 1 - st.mastery;
      const forgetRisk = Math.sqrt(maxHalfLife / HALF_LIFE_DAYS[a]);
      raw[a] = gap * forgetRisk * w;
    }
    sum += raw[a];
  }
  const out = {} as Record<ProfileArea, number>;
  if (sum <= 0) {
    for (const a of PROFILE_AREAS) out[a] = 1 / PROFILE_AREAS.length;
    return out;
  }
  for (const a of PROFILE_AREAS) out[a] = raw[a] / sum;
  return out;
}

/** 给家长看的一段画像摘要 */
export function summarizeProfile(profile: LearnerProfile): string {
  const lines: string[] = [];
  const order = [...PROFILE_AREAS].sort((a, b) => profile.areas[a].mastery - profile.areas[b].mastery);
  for (const a of order) {
    const st = profile.areas[a];
    const pct = Math.round(st.mastery * 100);
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
    lines.push(`${AREA_LABEL[a]} ${bar} ${pct}%（练习 ${st.attempts} 次）`);
  }
  return lines.join('\n');
}
