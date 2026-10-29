// KETZXT · 1年备考计划模块数据
// 诊断驱动：阅读5/写作2/听力3/口语3 → 专属配比 读20/写35/听20/说25
// 由 UI（StudyPlanPage）读取 weeks[] 渲染周任务卡，scaffolds[] 供写作练习页引用。
// 数据由工厂函数生成，避免手写 48 周低质内容；复用既有模块（grammar/reading/speaking/vocab）。

export type SkillArea = 'reading' | 'writing' | 'listening' | 'speaking';
export type KetzxtModule = 'grammar' | 'reading' | 'speaking' | 'vocab' | 'none';

export interface TaskRef {
  module: KetzxtModule;
  id?: string;
}

export interface WeeklyTask {
  day: number;            // 1=周一 ... 5=周五, 6=周六, 7=周日
  area: SkillArea;
  minutes: number;
  title: string;
  description: string;
  ref?: TaskRef;
}

export type PhaseId = 'foundation' | 'breakthrough' | 'mock' | 'sprint';

export interface Phase {
  id: PhaseId;
  name: string;
  months: [number, number];
  writingFocus: string;
}

export interface WeekPlan {
  month: number;          // 1..12
  week: number;           // 1..4
  phase: PhaseId;
  focus: string;
  tasks: WeeklyTask[];
}

export interface WritingScaffold {
  id: string;
  kind: 'email' | 'story';
  stage: 1 | 2 | 3;
  template: string;
  requirement: string;
}

export interface StudyPlan {
  title: string;
  diagnosis: Record<SkillArea, number>;
  ratios: Record<SkillArea, number>;
  phases: Phase[];
  weeks: WeekPlan[];
  scaffolds: WritingScaffold[];
}

// 专属配比（诊断换算闭合到 100）
export const RATIOS: Record<SkillArea, number> = {
  reading: 20,
  writing: 35,
  listening: 20,
  speaking: 25,
};

export const PHASES: Phase[] = [
  { id: 'foundation',  name: '摸底筑基', months: [1, 3],   writingFocus: 'Part1 邮件模板三阶（填空→半开放→独立）' },
  { id: 'breakthrough',name: '分项突破', months: [4, 7],   writingFocus: 'Part2 故事（35+词）+ 连贯词/时态' },
  { id: 'mock',        name: '套题弱项', months: [8, 10],  writingFocus: 'mock 写作重点批改 + 错题本' },
  { id: 'sprint',      name: '冲刺状态', months: [11, 12], writingFocus: '全真计时模拟 + 考试技巧' },
];

function phaseForMonth(m: number): Phase {
  const p = PHASES.find((x) => m >= x.months[0] && m <= x.months[1]);
  if (!p) throw new Error(`月份 ${m} 未匹配阶段`);
  return p;
}

// 基周任务模板：实现 读20/写35/听20/说25 的周投入分布
// 工作日 5×20 + 周末 45 = 145 分；周累计 写55/说35/读27/听27 ≈ 目标配比
function baseWeek(month: number, week: number, phase: Phase): WeekPlan {
  const wf = phase.writingFocus;
  const tasks: WeeklyTask[] = [
    { day: 1, area: 'writing',   minutes: 20, title: '写作：邮件仿写',     description: `${wf}（填空→半开放）`, ref: { module: 'grammar' } },
    { day: 2, area: 'listening', minutes: 20, title: '听力：KET Part',    description: '完成 1 个 listening part + 错题归类', ref: { module: 'none' } },
    { day: 3, area: 'writing',   minutes: 20, title: '写作：接续/换题',    description: `${wf} 进阶一篇`, ref: { module: 'grammar' } },
    { day: 4, area: 'reading',   minutes: 20, title: '阅读：轻量维持',     description: '1 篇 A2 读物 + 定位词训练（复用阅读精读模块）', ref: { module: 'reading' } },
    { day: 5, area: 'speaking',  minutes: 20, title: '口语：图片描述',     description: '单图描述，低过滤开口（复用口语题模块）', ref: { module: 'speaking' } },
    { day: 6, area: 'writing',   minutes: 15, title: '周末综合·写作',      description: '写作 15 分（偏写攻坚）', ref: { module: 'grammar' } },
    { day: 6, area: 'speaking',  minutes: 15, title: '周末综合·口语',      description: '两图找不同', ref: { module: 'speaking' } },
    { day: 7, area: 'reading',   minutes: 8,  title: '周末综合·阅读',      description: '阅读/听力轮换（本周阅读）', ref: { module: 'reading' } },
    { day: 7, area: 'listening', minutes: 7,  title: '周末综合·听力',      description: '听力泛听磨耳', ref: { module: 'none' } },
  ];
  return { month, week, phase: phase.id, focus: wf, tasks };
}

function buildWeeks(): WeekPlan[] {
  const out: WeekPlan[] = [];
  for (let m = 1; m <= 12; m++) {
    const ph = phaseForMonth(m);
    for (let w = 1; w <= 4; w++) {
      out.push(baseWeek(m, w, ph));
    }
  }
  return out;
}

export const SCAFFOLDS: WritingScaffold[] = [
  { id: 'email-s1', kind: 'email', stage: 1,
    template: 'Hi [名], I am sorry you are ill. At school we [做]. Do you [问]? [署名]',
    requirement: '覆盖 3 内容点：sorry / school day / question' },
  { id: 'email-s2', kind: 'email', stage: 2,
    template: 'Hi [名], I am sorry you are ill. At school we [做] and [做] because [因]. Do you [问]? See you soon, [署名]',
    requirement: '词数 ≥25，含 1 个连接词(because/and)' },
  { id: 'email-s3', kind: 'email', stage: 3,
    template: '（独立）给题目 3 要求点，自行组织，撤模板完成',
    requirement: '独立写 25+ 词，3 点齐全' },
  { id: 'story-s1', kind: 'story', stage: 1,
    template: 'One day, [主角] went to [地]. He/She [动] because [因]. Then [接]. Finally [尾].',
    requirement: '35+ 词、2 连接词、有开头-中间-结尾' },
];

export const studyPlan: StudyPlan = {
  title: 'KET 1年备考计划（诊断驱动·写作优先）',
  diagnosis: { reading: 5, writing: 2, listening: 3, speaking: 3 },
  ratios: RATIOS,
  phases: PHASES,
  weeks: buildWeeks(),
  scaffolds: SCAFFOLDS,
};
