// ========== 语法每日打卡路线图 ==========
// 把 20 个语法点按 KET 教学逻辑由易到难排成顺序，定义"易混搭档"用于对比训练，
// 并把每个点的题库（填空/选择/改错）按点聚合，供每日 session 生成器使用。
import {
  allGrammarPoints,
  g01Fill, g01Choice, g01Correction,
  g02Fill, g02Choice, g02Correction,
  g03Fill, g03Choice, g03Correction,
  g04Fill, g04Choice, g04Correction,
  g05Fill, g05Choice, g05Correction,
  g06Fill, g06Choice, g06Correction,
  g07Fill, g07Choice, g07Correction,
  g08Fill, g08Choice, g08Correction,
  g09Fill, g09Choice, g09Correction,
  g10Fill, g10Choice, g10Correction,
  g11Fill, g11Choice, g11Correction,
  g12Fill, g12Choice, g12Correction,
  g13Fill, g13Choice, g13Correction,
  g14Fill, g14Choice, g14Correction,
  g15Fill, g15Choice, g15Correction,
  g16Fill, g16Choice, g16Correction,
  g17Fill, g17Choice, g17Correction,
  g18Fill, g18Choice, g18Correction,
  g19Fill, g19Choice, g19Correction,
  g20Fill, g20Choice, g20Correction,
} from './grammar';
import type {
  GrammarPoint,
  GrammarFillQuestion,
  GrammarChoiceQuestion,
  GrammarCorrectionQuestion,
} from '../types';

// ========== 1. 路线图顺序（由易到难）==========
// 采用现有 G01→G20 的教学顺序：时态 → 情态 → 比较 → 冠词代词 → 介词连词 → there be → 数量 → 短语 → 条件 → 完成/非谓语
export const ROADMAP: string[] = [
  'G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07', 'G08', 'G09', 'G10',
  'G11', 'G12', 'G13', 'G14', 'G15', 'G16', 'G17', 'G18', 'G19', 'G20',
];

// ========== 2. 易混搭档（用于对比训练）==========
// 每个 [A, B] 表示这两个语法点孩子最容易混淆，需要并排训练"选哪个 + 为什么"。
export const CONFUSABLE_PAIRS: [string, string][] = [
  ['G01', 'G03'], // 一般现在（习惯） vs 现在进行（此刻）
  ['G01', 'G02'], // 一般现在（现在/总是） vs 一般过去（过去）
  ['G02', 'G04'], // 一般过去（过去发生） vs be going to（将来计划）
  ['G03', 'G04'], // 现在进行（此刻正在） vs be going to（打算/计划）
  ['G12', 'G13'], // 时间介词 vs 方位介词
  ['G05', 'G02'], // 现在完成（与现在有关） vs 一般过去（纯过去）
  ['G06', 'G07'], // can（能力） vs must/should（必须/应该）
  ['G10', 'G17'], // 冠词 a/an/the vs 数量 some/any/much/many
];

// ========== 3. 对比提示（解释两者的关键区别）==========
function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

export const CONTRAST_HINTS: Record<string, string> = {
  [pairKey('G01', 'G03')]: '看时间：说"经常/习惯/事实"用一般现在时（He plays football every day）；说"此刻正在"用现在进行时（He is playing football now）。',
  [pairKey('G01', 'G02')]: '看时间：单词 usually / always / every day 多用一般现在时；yesterday / last week / ago 多用一般过去时。',
  [pairKey('G02', 'G04')]: '看时间：已经发生的动作用一般过去时（went）；打算/计划要做的用 be going to（is going to go）。',
  [pairKey('G03', 'G04')]: '现在进行 = 此刻正在发生（is doing）；be going to = 已经决定、马上/将来要做（is going to do）。',
  [pairKey('G12', 'G13')]: '这两组都用 in / on / at，关键看修饰什么：说"时间"用 in July / on Monday / at 8 o\'clock；说"地点/方位"用 in Beijing / on the table / at school；方向用 to（去）/ from（从）。',
  [pairKey('G05', 'G02')]: '一般过去只讲过去（I saw him yesterday）；现在完成连接现在（I have seen him → 强调经历/结果，常配 ever/never/just）。',
  [pairKey('G06', 'G07')]: 'can = 能力/可以（I can swim）；must = 必须，should = 应该（You must stop / should study）。',
  [pairKey('G10', 'G17')]: '单数可数用 a/an（a book）；复数/不可数表"一些"用 some/any（some books / any water）。',
};

// 取得某语法点的最佳对比搭档（首个包含它的配对中的另一个）
export function getPartner(grammarId: string): string | null {
  for (const [a, b] of CONFUSABLE_PAIRS) {
    if (a === grammarId) return b;
    if (b === grammarId) return a;
  }
  return null;
}

export function getContrastHint(a: string, b: string): string | null {
  return CONTRAST_HINTS[pairKey(a, b)] ?? null;
}

// ========== 4. 按点聚合题库 ==========
export interface PointQuestions {
  fill: GrammarFillQuestion[];
  choice: GrammarChoiceQuestion[];
  correction: GrammarCorrectionQuestion[];
}

const POINT_QUESTIONS_RAW: Record<string, PointQuestions> = {
  G01: { fill: g01Fill, choice: g01Choice, correction: g01Correction },
  G02: { fill: g02Fill, choice: g02Choice, correction: g02Correction },
  G03: { fill: g03Fill, choice: g03Choice, correction: g03Correction },
  G04: { fill: g04Fill, choice: g04Choice, correction: g04Correction },
  G05: { fill: g05Fill, choice: g05Choice, correction: g05Correction },
  G06: { fill: g06Fill, choice: g06Choice, correction: g06Correction },
  G07: { fill: g07Fill, choice: g07Choice, correction: g07Correction },
  G08: { fill: g08Fill, choice: g08Choice, correction: g08Correction },
  G09: { fill: g09Fill, choice: g09Choice, correction: g09Correction },
  G10: { fill: g10Fill, choice: g10Choice, correction: g10Correction },
  G11: { fill: g11Fill, choice: g11Choice, correction: g11Correction },
  G12: { fill: g12Fill, choice: g12Choice, correction: g12Correction },
  G13: { fill: g13Fill, choice: g13Choice, correction: g13Correction },
  G14: { fill: g14Fill, choice: g14Choice, correction: g14Correction },
  G15: { fill: g15Fill, choice: g15Choice, correction: g15Correction },
  G16: { fill: g16Fill, choice: g16Choice, correction: g16Correction },
  G17: { fill: g17Fill, choice: g17Choice, correction: g17Correction },
  G18: { fill: g18Fill, choice: g18Choice, correction: g18Correction },
  G19: { fill: g19Fill, choice: g19Choice, correction: g19Correction },
  G20: { fill: g20Fill, choice: g20Choice, correction: g20Correction },
};

export const GRAMMAR_QUESTIONS: Record<string, PointQuestions> = POINT_QUESTIONS_RAW;

export function getPoint(id: string): GrammarPoint | undefined {
  return allGrammarPoints.find((p) => p.id === id);
}

export type PracticeTypeLite = 'fill' | 'choice' | 'correction';

// 按 (grammarId, questionId) 找回题目对象与题型
export function getQuestionById(
  grammarId: string,
  qid: string,
): { q: GrammarFillQuestion | GrammarChoiceQuestion | GrammarCorrectionQuestion; pType: PracticeTypeLite } | null {
  const pq = GRAMMAR_QUESTIONS[grammarId];
  if (!pq) return null;
  const inFill = pq.fill.find((x) => x.id === qid);
  if (inFill) return { q: inFill, pType: 'fill' };
  const inChoice = pq.choice.find((x) => x.id === qid);
  if (inChoice) return { q: inChoice, pType: 'choice' };
  const inCorr = pq.correction.find((x) => x.id === qid);
  if (inCorr) return { q: inCorr, pType: 'correction' };
  return null;
}
