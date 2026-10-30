// KETZXT · 每日备考题组生成器（纯函数，可单测）
//
// 把「1年备考计划」从静态周任务变成可执行的每日题组：
//   日期 → 定位到第几周第几天 → 今日任务(studyPlan.weeks[].tasks)
//        → 按任务科目从既有题库(语法/词汇/阅读)抽取今日试题 + 写作/口语/听力任务卡
//
// 三条硬约束：
//  1) 确定性：同一天永远出同一套题（用日期做随机种子），刷新页面不会换题
//  2) 不新造内容：客观题全部来自既有题库；写作/口语用既有 scaffold 与题库
//  3) 可判分：每道客观题都能自动判分，答案必须能在数据里定位到

import { studyPlan, type WeeklyTask, type SkillArea, type Phase } from './studyPlan.ts';
import type { WritingPoint } from './writingGrader.ts';
import { GRAMMAR_QUESTIONS, ROADMAP, getPoint } from './grammarRoadmap.ts';
import { spellingQuestions, fillBlankQuestions } from './vocabulary.ts';
import { part3RCArticles } from './reading.ts';
import { speakingPart1 } from './speaking.ts';

// ========== 类型 ==========

export type DailyItemKind =
  | 'grammar_fill'
  | 'grammar_choice'
  | 'grammar_correction'
  | 'vocab_spelling'
  | 'vocab_fill'
  | 'reading_choice';

export interface DailyItem {
  id: string;
  kind: DailyItemKind;
  area: SkillArea;
  module: 'grammar' | 'vocabulary' | 'reading';
  title: string;
  prompt: string;
  options?: string[];
  answer: string;
  hint?: string;
  explanation?: string;
  subjectId: string;
  subjectName: string;
  exerciseType: string;
}

export interface WritingPrompt {
  id: string;
  kind: 'email' | 'story';
  prompt: string;
  requirement: string;
  minWords: number;
  /** 与题目场景匹配的模板（阶段不同会逐级撤除） */
  template: string;
  /** 3 个要点的关键词配置（供写作批改做要点覆盖检测） */
  points: WritingPoint[];
}

export interface WritingTask {
  prompt: WritingPrompt;
  scaffoldId: string;      // 对应 studyPlan.scaffolds 的阶段模板 id
  scaffoldTemplate: string;
  scaffoldRequirement: string;
  showTemplate: boolean;  // 冲刺阶段(撤模板)后不再给模板
}

export interface SpeakingTask {
  questionId: string;
  question: string;
  questionZh: string;
  prompts: string[];
  keywords: string[];
  modelAnswer: string;
}

export interface ListeningTask {
  title: string;
  titleZh: string;
  part: number;
  setId: string;
  hint: string;
}

export interface DailyContext {
  dateStr: string;
  startDate: string;
  dayIndex: number;        // 距起始日的天数（可为负=计划未开始）
  weekIndex: number;       // 0..47
  dayOfWeek: number;       // 1=周一 ... 7=周日
  month: number;
  weekInMonth: number;
  phase: Phase;
  focus: string;
  tasks: WeeklyTask[];     // 今日任务
  totalWeeks: number;
  finished: boolean;       // 已超出 48 周
}

export interface DailySet {
  dateStr: string;
  context: DailyContext;
  items: DailyItem[];      // 客观题组
  writing?: WritingTask;
  speaking?: SpeakingTask;
  listening?: ListeningTask;
}

// ========== 工具 ==========

/** 本地日期字符串 YYYY-MM-DD（不用 toISOString，避免时区偏移串天） */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function diffDays(from: string, to: string): number {
  const a = parseDate(from).getTime();
  const b = parseDate(to).getTime();
  return Math.round((b - a) / 86400000);
}

/** 在某个日期上加 n 天，返回 YYYY-MM-DD */
export function addDays(key: string, n: number): string {
  const d = parseDate(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

/** 字符串 → 32 位种子 */
function seedFrom(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 确定性伪随机 */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 从数组中确定性地取 n 个不重复元素 */
function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  if (arr.length <= 0) return [];
  const pool = [...arr];
  const out: T[] = [];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

// ========== 写作题库（KET A2 写作题，轮转使用；模板与场景一一对应） ==========

export const WRITING_PROMPTS: WritingPrompt[] = [
  { id: 'w-p1-01', kind: 'email', prompt: '你生病了不能去上学。给老师写一封邮件（至少 25 词），说明情况，并问一个关于作业的问题。', requirement: '3 个内容点：表达歉意 / 说清不能上学的原因 / 问作业', minWords: 25,
    template: 'Dear [Teacher],\nI am sorry I am ill today, so I cannot come to school. I have a [fever / headache]. Please could you tell me what homework I should do?\nThank you.\nBest wishes,\n[署名]',
    points: [
      { label: "表达歉意", keywordGroups: [["sorry", "apologies", "apologise", "apologize"], ["ill", "sick", "unwell"]], hint: "用 sorry 说抱歉" },
      { label: "说明不能上学的原因", keywordGroups: [["ill", "sick", "fever", "headache", "cold", "flu", "cannot come", "can't come", "cannot go to school"]], hint: "写明生病的情况（如 I have a fever）" },
      { label: "问作业", keywordGroups: [["homework", "home work", "what work", "assignment", "task", "lesson"], ["could you tell me", "can you tell me", "please tell me", "could you please", "do you know"]], hint: "问老师作业（what homework...）" },
    ] },
  { id: 'w-p1-02', kind: 'email', prompt: '你打算这个周末参加学校组织的环保活动。给朋友写一封邮件（至少 25 词），说说活动时间、地点和你要做的事。', requirement: '3 个内容点：活动名称 / 时间地点 / 你负责的部分', minWords: 25,
    template: 'Hi [Name],\nWe are having a [school clean-up day] this weekend. It starts at [9 o\'clock] at [the school gate]. I am going to [collect rubbish / plant trees]. Would you like to come?\nSee you soon,\n[署名]',
    points: [
      { label: "活动名称", keywordGroups: [["clean-up", "clean up", "cleaning", "environment", "green", "rubbish", "recycling", "plant trees"]], hint: "写出活动名称（clean-up day / environment...）" },
      { label: "时间地点", keywordGroups: [["saturday", "sunday", "weekend"], ["oclock", "o'clock", "am", "pm", "morning", "afternoon"]], hint: "写清时间和地点" },
      { label: "你负责的部分", keywordGroups: [["i am going to", "i'll", "i will", "i am doing", "i want to", "going to collect", "going to plant"]], hint: "写你负责做什么" },
    ] },
  { id: 'w-p1-03', kind: 'email', prompt: '你的朋友要来看你。给他/她写一封邮件（至少 25 词），告诉他怎么走、你家附近有什么可以玩。', requirement: '3 个内容点：怎么到 / 附近有什么 / 什么时候到', minWords: 25,
    template: 'Hi [Name],\nCome to my house on [Saturday] at [2 o\'clock]. Take the [number 12] bus and get off at [the museum]. There is a [big park] near my house, and we can [play football / go to the cinema].\nSee you,\n[署名]',
    points: [
      { label: "怎么到", keywordGroups: [["bus", "train", "car", "bike", "underground", "metro", "subway", "walk", "taxi"]], hint: "写怎么来（bus / on foot...）" },
      { label: "附近有什么", keywordGroups: [["park", "museum", "cinema", "swimming pool", "library", "playground", "shop", "mall", "zoo", "beach", "near my house", "near my home"]], hint: "写附近有什么可玩的" },
      { label: "什么时候到", keywordGroups: [["saturday", "sunday", "weekend", "tomorrow"], ["oclock", "o'clock", "am", "pm"]], hint: "写什么时候到" },
    ] },
  { id: 'w-p1-04', kind: 'email', prompt: '你不能去参加学校的野餐了。给老师写一封邮件（至少 25 词），解释原因并问什么时候会有下一次。', requirement: '3 个内容点：不能去的原因 / 表达遗憾 / 问下次时间', minWords: 25,
    template: 'Dear [Teacher],\nI am sorry I cannot come to the school picnic on [Friday]. I [have a dentist appointment / am going to my cousin\'s birthday]. Will there be another picnic later?\nThank you,\n[署名]',
    points: [
      { label: "不能去的原因", keywordGroups: [["dentist", "doctor", "ill", "sick", "appointment", "birthday", "family", "uncle", "aunt", "cousin", "football match", "trip"]], hint: "写明原因" },
      { label: "表达遗憾", keywordGroups: [["sorry", "unfortunately", "regret", "disappointed", "sad", "unhappy"]], hint: "表达遗憾" },
      { label: "问下次时间", keywordGroups: [["will there be", "another", "next time", "when will", "is there another"]], hint: "问下次什么时候" },
    ] },
  { id: 'w-p1-05', kind: 'email', prompt: '你在学校丢了外套。给老师写一封邮件（至少 25 词），说明外套是什么样子的，并请老师帮你找找。', requirement: '3 个内容点：外套的样子 / 丢失的时间和地点 / 请老师帮忙', minWords: 25,
    template: 'Dear [Teacher],\nI lost my coat at school yesterday. It is [blue] with [a hood] and my name is on the inside. I left it in [the sports hall]. Could you please look for it?\nThank you,\n[署名]',
    points: [
      { label: "外套的样子", keywordGroups: [["blue", "black", "red", "green", "grey", "gray", "white", "yellow", "brown", "pink"], ["hood", "hat", "collar", "button", "pocket", "sleeve", "stripe", "fancy", "school uniform"]], hint: "写外套的样子（颜色/款式）" },
      { label: "丢失的时间和地点", keywordGroups: [["yesterday", "this morning", "today", "at school", "hall", "playground", "lost it"]], hint: "写什么时候在哪丢的" },
      { label: "请老师帮忙", keywordGroups: [["could you please", "can you please", "please help", "look for it", "find it", "help me find", "can you find"]], hint: "请老师帮忙找" },
    ] },
  { id: 'w-p1-06', kind: 'email', prompt: '你下周要搬到新家。给同学写一封邮件（至少 25 词），说说新住在哪、有什么变化。', requirement: '3 个内容点：新地址 / 离学校多远 / 有什么变化', minWords: 25,
    template: 'Hi [Name],\nI am moving to a new house next week. We live at [number 8, Green Street] now. It is [ten minutes] from school by bike. There is a [big garden] behind the house. Write to me at my new address!\n[署名]',
    points: [
      { label: "新地址", keywordGroups: [["moving", "move", "new house", "new home", "new address", "live at", "live in"]], hint: "写新地址" },
      { label: "离学校多远", keywordGroups: [["minutes", "far", "near", "close", "by bike", "by bus", "by car", "walk"]], hint: "写离学校多远" },
      { label: "有什么变化", keywordGroups: [["garden", "bigger", "smaller", "new room", "bedroom", "kitchen", "playground", "now i can"]], hint: "写有什么变化" },
    ] },
  { id: 'w-p1-07', kind: 'email', prompt: '你想加入学校的机器人俱乐部。给老师写一封邮件（至少 25 词），说明你想参加，并说你会做什么。', requirement: '3 个内容点：想参加 / 为什么想参加 / 你会负责什么', minWords: 25,
    template: 'Dear [Teacher],\nI would like to join the robot club. I [love science / am good at maths] and I want to learn more about [programming]. I can [look after the new robots / make the club website].\nThank you,\n[署名]',
    points: [
      { label: "想参加", keywordGroups: [["would like to join", "want to join", "like to join", "would like to be", "can i join", "sign up"]], hint: "写明想参加" },
      { label: "为什么想参加", keywordGroups: [["love science", "good at", "interested in", "like programming", "like robots", "am good at maths", "am good at math", "enjoy", "favourite", "favorite"]], hint: "写为什么想参加" },
      { label: "你会负责什么", keywordGroups: [["look after", "make the", "help with", "build", "design", "program", "i can", "responsible for", "organise", "organize"]], hint: "写你会负责什么" },
    ] },
  { id: 'w-p1-08', kind: 'email', prompt: '你昨晚没做作业。给老师写一封邮件（至少 25 词），解释原因并保证以后会按时交。', requirement: '3 个内容点：道歉 / 原因 / 保证', minWords: 25,
    template: 'Dear [Teacher],\nI am sorry I did not do my homework last night. I [watched a film / helped my mum]. I will do my homework on time from now on. Can I hand it in tomorrow?\nThank you,\n[署名]',
    points: [
      { label: "道歉", keywordGroups: [["sorry", "apologise", "apologize", "apologies"]], hint: "道歉" },
      { label: "原因", keywordGroups: [["watched a film", "watched tv", "helped my mum", "helped my mom", "went to bed", "was busy", "playing", "football practice", "had a party", "internet", "too tired"]], hint: "写明原因" },
      { label: "保证", keywordGroups: [["on time", "tomorrow", "from now on", "i will", "promise", "won't", "will not forget", "hand it in"]], hint: "保证以后按时交" },
    ] },
  { id: 'w-p2-01', kind: 'story', prompt: '写一篇短故事（至少 35 词）：一个孩子在学校捡到一样东西，后来发生了一件事。', requirement: '3 个内容点：开头 / 经过 / 结尾', minWords: 35,
    template: 'One day, [Ben] found a [wallet] in the school playground. He [gave it to the teacher / took it to the office]. Then [the owner came back / the teacher called his mum]. Everyone was very [happy].',
    points: [
      { label: "开头", keywordGroups: [["one day", "once upon a time", "yesterday", "last week", "at school", "in the playground", "in the corridor"]], hint: "开头交代时间和地点" },
      { label: "经过", keywordGroups: [["found", "picked up", "saw", "wallet", "watch", "pencil case", "key", "book", "bag", "glasses", "money", "lost property"]], hint: "写捡到了什么、怎么处理的" },
      { label: "结尾", keywordGroups: [["gave it to", "took it to", "the teacher", "the office", "owner came", "found the owner", "called his mum", "called her mum", "happy", "glad"]], hint: "写结尾（结果/感受）" },
    ] },
  { id: 'w-p2-02', kind: 'story', prompt: '写一篇短故事（至少 35 词）：一个孩子在放学路上遇到一点麻烦，最后是怎么解决的。', requirement: '3 个内容点：开头 / 遇到麻烦 / 解决方式', minWords: 35,
    template: 'On the way home, [Lily] [lost her bag / dropped her phone]. She [looked for it / asked a policeman for help]. At last she [found it in the grass / got it back]. She was very [relieved].',
    points: [
      { label: "开头", keywordGroups: [["on the way home", "walking home", "on my way", "after school", "home from school"]], hint: "开头交代场景" },
      { label: "遇到麻烦", keywordGroups: [["lost", "dropped", "forgot", "left", "bag", "phone", "book", "wallet", "fell", "rain", "broke", "flat tyre", "flat tire", "dog"]], hint: "写遇到什么麻烦" },
      { label: "解决方式", keywordGroups: [["found it", "got it back", "asked", "policeman", "police officer", "helped", "someone", "mum", "mom", "dad", "friend", "relieved", "at last", "finally"]], hint: "写怎么解决的" },
    ] },
  { id: 'w-p2-03', kind: 'story', prompt: '写一篇短故事（至少 35 词）：一个孩子第一次自己做某件事，结果学到了什么。', requirement: '3 个内容点：开头 / 尝试与困难 / 明白的道理', minWords: 35,
    template: '[Sam] decided to [cook dinner / ride a bike] for the first time. At first he [made a mess / fell over]. Then he [tried again / asked for help]. Finally he [learned that practice helps / felt proud].',
    points: [
      { label: "开头", keywordGroups: [["decided", "wanted to", "first time", "one day"]], hint: "开头（谁决定做什么）" },
      { label: "尝试与困难", keywordGroups: [["at first", "made a mess", "fell over", "burnt", "was difficult", "was hard", "could not", "couldn't", "failed", "tried"]], hint: "写过程中的困难" },
      { label: "明白的道理", keywordGroups: [["finally", "learned", "learnt", "understood", "realised", "realized", "felt proud", "proud", "practice", "practise", "keep trying", "never give up"]], hint: "写明白的道理/感受" },
    ] },
  { id: 'w-p2-04', kind: 'story', prompt: '写一篇短故事（至少 35 词）：一个新同学来到班里，大家是怎么对待他的。', requirement: '3 个内容点：开头 / 大家的反应 / 结尾', minWords: 35,
    template: 'A new boy called [Tom] came to our class last Monday. He [did not speak to anyone / looked unhappy]. So we [gave him a seat / showed him our classroom]. After that he [smiled / joined our game].',
    points: [
      { label: "开头", keywordGroups: [["new boy", "new girl", "new student", "new classmate", "came to our class", "joined our class", "called tom", "called max"]], hint: "开头（新同学是谁）" },
      { label: "大家的反应", keywordGroups: [["did not speak", "was quiet", "looked unhappy", "lonely", "no one", "nobody", "sat alone", "was shy", "was nervous", "we said hello", "we talked", "welcomed"]], hint: "写大家怎么对待他" },
      { label: "结尾", keywordGroups: [["smiled", "joined", "played", "made friends", "happy", "glad", "now he", "now she", "next week", "after that", "began to talk"]], hint: "写结尾（后来的变化）" },
    ] },
];

// ========== 上下文解析 ==========

const WEEK_COUNT = studyPlan.weeks.length; // 48

/**
 * 进度式解析：dayIndex 是「已完成套数」（= 当前该做的套索引），不是日历天数。
 * 所以今天没做完 → 明天还是同一套题（不浪费），语法点推进也跟实际掌握同步。
 */
export function resolveContext(startDate: string, dayIndex: number): DailyContext {
  const totalWeeks = WEEK_COUNT;
  const finished = dayIndex >= totalWeeks * 7;
  const clamped = Math.max(0, Math.min(dayIndex, totalWeeks * 7 - 1));
  const weekIndex = Math.floor(clamped / 7);
  // dayOfWeek：起始日算第 1 天（周一），第 8 天进入下一周
  const dayOfWeek = (clamped % 7) + 1;
  const weekPlan = studyPlan.weeks[weekIndex];
  const phase = studyPlan.phases.find((p) => p.id === weekPlan.phase) ?? studyPlan.phases[0];
  const tasks = weekPlan.tasks.filter((t) => t.day === dayOfWeek);
  return {
    dateStr: addDays(startDate, clamped),   // 计划日（起始日 + 第几天），用于展示
    startDate,
    dayIndex,
    weekIndex,
    dayOfWeek,
    month: weekPlan.month,
    weekInMonth: weekPlan.week,
    phase,
    focus: weekPlan.focus,
    tasks,
    totalWeeks,
    finished,
  };
}

// ========== 题目抽取 ==========

function buildGrammarItems(rng: () => number, dayIndex: number): DailyItem[] {
  const items: DailyItem[] = [];
  // 每 2 天推进一个语法点，20 个点循环 40 天一轮
  const pointIdx = Math.floor(Math.max(0, dayIndex) / 2) % ROADMAP.length;
  const gId = ROADMAP[pointIdx];
  const bundle = GRAMMAR_QUESTIONS[gId];
  if (!bundle) return items;
  const point = getPoint(gId);
  const subjectName = point ? `${point.id} ${point.nameZh}` : gId;

  const fills = pickN(bundle.fill, 2, rng);
  for (const q of fills) {
    items.push({
      id: q.id, kind: 'grammar_fill', area: 'reading', module: 'grammar',
      title: `语法填空 · ${subjectName}`,
      prompt: q.sentence, options: q.options, answer: q.answer,
      explanation: q.explanation, subjectId: gId, subjectName,
      exerciseType: 'grammar_fill',
    });
  }
  const choices = pickN(bundle.choice, 2, rng);
  for (const q of choices) {
    items.push({
      id: q.id, kind: 'grammar_choice', area: 'reading', module: 'grammar',
      title: `语法选择 · ${subjectName}`,
      prompt: q.question, options: q.options, answer: q.answer,
      explanation: q.explanation, subjectId: gId, subjectName,
      exerciseType: 'grammar_choice',
    });
  }
  const corrections = pickN(bundle.correction, 1, rng);
  for (const q of corrections) {
    items.push({
      id: q.id, kind: 'grammar_correction', area: 'reading', module: 'grammar',
      title: `语法改错 · ${subjectName}`,
      prompt: q.sentence, answer: q.answer,
      explanation: q.explanation, subjectId: gId, subjectName,
      exerciseType: 'grammar_correction',
    });
  }
  return items;
}

function buildVocabItems(rng: () => number): DailyItem[] {
  const items: DailyItem[] = [];
  const spelling = pickN(spellingQuestions, 3, rng);
  for (const q of spelling) {
    items.push({
      id: q.id, kind: 'vocab_spelling', area: 'reading', module: 'vocabulary',
      title: '单词拼写',
      prompt: `拼写单词：${q.phonetic}`, answer: q.en,
      hint: q.audioText, subjectId: q.wordId, subjectName: q.en,
      exerciseType: 'spelling',
    });
  }
  const fill = pickN(fillBlankQuestions, 2, rng);
  for (const q of fill) {
    items.push({
      id: q.id, kind: 'vocab_fill', area: 'reading', module: 'vocabulary',
      title: '词汇填空',
      prompt: q.sentence, answer: q.answer, hint: q.hint,
      subjectId: q.themeId, subjectName: q.themeId,
      exerciseType: 'fill_blank',
    });
  }
  return items;
}

function buildReadingItems(rng: () => number): DailyItem[] {
  const items: DailyItem[] = [];
  if (part3RCArticles.length === 0) return items;
  const article = part3RCArticles[Math.floor(rng() * part3RCArticles.length)];
  const qs = pickN(article.questions, 3, rng);
  for (const q of qs) {
    items.push({
      id: `${article.id}-${q.id}`, kind: 'reading_choice', area: 'reading', module: 'reading',
      title: `阅读理解 · ${article.titleZh}`,
      prompt: q.question, options: q.options, answer: q.answer,
      hint: q.questionZh, explanation: q.explanation,
      subjectId: article.id, subjectName: article.titleZh,
      exerciseType: 'reading_p3',
    });
  }
  return items;
}

function buildWritingTask(ctx: DailyContext): WritingTask {
  // 提示词按天轮转；模板与题目场景一一对应，避免「模板与题目不符」导致跑题
  const idx = Math.max(0, ctx.dayIndex) % WRITING_PROMPTS.length;
  const prompt = WRITING_PROMPTS[idx];
  // 阶段决定模板的详略：摸底筑基给完整模板，分项突破给要点提示，套题/冲刺完全撤除
  const stage = ctx.phase.id;
  const scaffoldId =
    prompt.kind === 'email'
      ? stage === 'foundation' ? 'email-s1' : stage === 'breakthrough' ? 'email-s2' : 'email-s3'
      : 'story-s1';
  const showTemplate = stage === 'foundation' || stage === 'breakthrough';
  return {
    prompt,
    scaffoldId,
    scaffoldTemplate: prompt.template,
    scaffoldRequirement: prompt.requirement,
    showTemplate,
  };
}

function buildSpeakingTask(rng: () => number): SpeakingTask | undefined {
  if (speakingPart1.length === 0) return undefined;
  const q = speakingPart1[Math.floor(rng() * speakingPart1.length)];
  return {
    questionId: q.id,
    question: q.question,
    questionZh: q.questionZh,
    prompts: q.prompts,
    keywords: q.keywords,
    modelAnswer: q.modelAnswer,
  };
}

// ========== 组装 ==========

export function buildDailySet(startDate: string, dayIndex: number): DailySet {
  const context = resolveContext(startDate, dayIndex);
  // 种子只跟"第几套"有关：同一套题永远相同，与是哪一天做的无关
  const rng = makeRng(seedFrom(`${startDate}#${dayIndex}`));

  const items: DailyItem[] = [];
  items.push(...buildGrammarItems(rng, context.dayIndex));
  items.push(...buildVocabItems(rng));

  const areas = new Set(context.tasks.map((t) => t.area));
  if (areas.has('reading')) items.push(...buildReadingItems(rng));

  const set: DailySet = { dateStr: context.dateStr, context, items };

  if (areas.has('writing')) set.writing = buildWritingTask(context);
  if (areas.has('speaking')) set.speaking = buildSpeakingTask(rng);
  if (areas.has('listening')) {
    set.listening = {
      title: '听力训练',
      titleZh: '听力：KET Part',
      part: context.month <= 3 ? 1 : context.month <= 7 ? 3 : 4,
      setId: '',
      hint: '按计划完成 1 套听力并归类错题（可跳转听力模块）',
    };
  }
  return set;
}

/** 客观题判分：文本归一化后比对（覆盖大小写/空格/标点差异） */
export function judgeText(userAnswer: string, answer: string): boolean {
  const norm = (s: string) =>
    s.trim().toLowerCase().replace(/[.,!?;:'"()]/g, '').replace(/\s+/g, ' ');
  return norm(userAnswer) === norm(answer);
}

/** 口语关键词覆盖率评分（0-100）：发音评分接大模型前的文字版近似 */
export function keywordCoverage(text: string, keywords: string[]): { hit: number; total: number; percent: number; missing: string[] } {
  const lower = text.toLowerCase();
  const missing: string[] = [];
  let hit = 0;
  for (const k of keywords) {
    if (lower.includes(k.toLowerCase())) hit++;
    else missing.push(k);
  }
  const total = keywords.length;
  const percent = total === 0 ? 0 : Math.round((hit / total) * 100);
  return { hit, total, percent, missing };
}
