// ========== 每日综合训练 组题器 ==========
// 纯函数：把 词汇 / 语法 / 听力 / 阅读 四个模块的真实题目混合成一次打卡。
// 设计原则：
//  1) 所有题目都来自现有数据源（含选项/音频/答案），渲染永不缺字段；
//  2) 按"薄弱模块"加权分配题量（正确率越低题越多）；
//  3) 每个模块内优先抽"薄弱主题"（来自错题本 subjectId），巩固弱点；
//  4) 四模块轮转穿插，避免同类型连续出现。

import { allThemes, spellingQuestions, matchingQuestions, fillBlankQuestions } from '../data/vocabulary';
import { GRAMMAR_QUESTIONS, ROADMAP, getPoint } from '../data/grammarRoadmap';
import { part1Sets, part3Sets, part4Sets } from '../data/listening';
import { part3ClozeArticles } from '../data/reading';

export type MixModule = 'vocabulary' | 'grammar' | 'listening' | 'reading';
export type MixKind = 'choice' | 'input';

export interface MixQuestion {
  key: string;
  module: MixModule;
  moduleLabel: string;   // 词汇/语法/听力/阅读
  moduleIcon: string;    // emoji
  exerciseType: string;  // 对齐 useProgressStore 的取值
  subjectId: string;
  subjectName: string;
  questionId: string;
  kind: MixKind;
  prompt: string;        // 主指令 / 题干
  promptZh?: string;     // 中文题干（听力/阅读）
  passage?: string;      // 阅读上下文
  options?: string[];    // choice 选项
  answer: string;        // 正确答案文本（choice=选项文本；input=期望文本）
  accept?: string[];     // input 额外可接受答案
  audioText?: string;    // 听力/拼写 → TTS 文本
  audioId?: string;      // 若存在预生成 mp3
  hint?: string;
  explain?: string;
  source: 'weak' | 'new';
}

export interface DailyMixInput {
  weak: Record<MixModule, string[]>;              // 各模块薄弱 subjectId 列表（来自错题本）
  moduleAccuracy: Record<MixModule, number>;      // 各模块正确率 0..1，-1 表示无数据
  total?: number;                                 // 目标题量，默认 15
}

const MODULE_META: Record<MixModule, { label: string; icon: string }> = {
  vocabulary: { label: '词汇', icon: '📚' },
  grammar: { label: '语法', icon: '✏️' },
  listening: { label: '听力', icon: '🎧' },
  reading: { label: '阅读', icon: '📖' },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function letterToIndex(ans: string): number {
  const c = ans.trim().toUpperCase().charCodeAt(0);
  return c >= 65 && c <= 90 ? c - 65 : -1;
}

/** 把可能是"字母/文字"的答案统一成选项文本 */
function resolveAnswerText(answer: string, options: string[]): string {
  const exact = options.find((o) => o === answer);
  if (exact) return exact;
  const idx = letterToIndex(answer);
  if (idx >= 0 && idx < options.length) return options[idx];
  return answer;
}

// wordId -> theme 映射（拼写题只带 wordId）
const WORD_THEME = (() => {
  const m = new Map<string, { id: string; nameZh: string }>();
  for (const t of allThemes) for (const w of t.words) m.set(w.id, { id: t.id, nameZh: t.nameZh });
  return m;
})();
const THEME_NAME = (() => {
  const m = new Map<string, string>();
  for (const t of allThemes) m.set(t.id, t.nameZh);
  return m;
})();

// ---------------- 各模块题目构造 ----------------

function buildVocab(count: number, weak: string[]): MixQuestion[] {
  const weakSet = new Set(weak);
  const out: MixQuestion[] = [];
  const used = new Set<string>();

  // 三种题型的候选，优先薄弱主题
  const spell = shuffle(spellingQuestions);
  const match = shuffle(matchingQuestions);
  const fill = shuffle(fillBlankQuestions);
  const prefer = <T extends { themeId?: string }>(list: T[], themeOf: (t: T) => string) =>
    [...list].sort((a, b) => Number(weakSet.has(themeOf(b))) - Number(weakSet.has(themeOf(a))));

  const spellP = prefer(spell, (q) => WORD_THEME.get(q.wordId)?.id ?? '');
  const matchP = prefer(match, (q) => q.themeId);
  const fillP = prefer(fill, (q) => q.themeId);

  let si = 0, mi = 0, fi = 0;
  const kinds = ['spell', 'match', 'fill'] as const;
  let k = 0;
  while (out.length < count && (si < spellP.length || mi < matchP.length || fi < fillP.length)) {
    const kind = kinds[k % 3]; k++;
    if (kind === 'spell' && si < spellP.length) {
      const q = spellP[si++];
      if (used.has(q.id)) continue; used.add(q.id);
      const th = WORD_THEME.get(q.wordId);
      out.push({
        key: `voc-${q.id}`, module: 'vocabulary', moduleLabel: '词汇', moduleIcon: '📚',
        exerciseType: 'spelling', subjectId: th?.id ?? 'vocab', subjectName: th?.nameZh ?? '词汇',
        questionId: q.id, kind: 'input',
        prompt: '听发音，拼写这个单词', promptZh: `音标：${q.phonetic}`,
        answer: q.en, audioText: q.audioText, hint: q.phonetic,
        source: weakSet.has(th?.id ?? '') ? 'weak' : 'new',
      });
    } else if (kind === 'match' && mi < matchP.length) {
      const q = matchP[mi++];
      if (used.has(q.id)) continue; used.add(q.id);
      out.push({
        key: `voc-${q.id}`, module: 'vocabulary', moduleLabel: '词汇', moduleIcon: '📚',
        exerciseType: 'matching', subjectId: q.themeId, subjectName: THEME_NAME.get(q.themeId) ?? '词汇',
        questionId: q.id, kind: 'choice',
        prompt: q.promptLang === 'zh' ? `选出对应的英文：${q.prompt}` : `选出对应的中文：${q.prompt}`,
        options: q.options, answer: q.answer,
        source: weakSet.has(q.themeId) ? 'weak' : 'new',
      });
    } else if (kind === 'fill' && fi < fillP.length) {
      const q = fillP[fi++];
      if (used.has(q.id)) continue; used.add(q.id);
      out.push({
        key: `voc-${q.id}`, module: 'vocabulary', moduleLabel: '词汇', moduleIcon: '📚',
        exerciseType: 'fill_blank', subjectId: q.themeId, subjectName: THEME_NAME.get(q.themeId) ?? '词汇',
        questionId: q.id, kind: 'input',
        prompt: '用正确的单词填空', promptZh: q.sentence,
        answer: q.answer, hint: q.hint,
        source: weakSet.has(q.themeId) ? 'weak' : 'new',
      });
    }
  }
  return out.slice(0, count);
}

function buildGrammar(count: number, weak: string[]): MixQuestion[] {
  const out: MixQuestion[] = [];
  // 候选语法点：优先薄弱点，其次 ROADMAP 顺序
  const ids = [...new Set([...weak.filter((id) => GRAMMAR_QUESTIONS[id]), ...shuffle(ROADMAP)])];
  const weakSet = new Set(weak);
  outer: for (const gid of ids) {
    const pq = GRAMMAR_QUESTIONS[gid];
    if (!pq) continue;
    const name = getPoint(gid)?.nameZh ?? gid;
    const pool = [
      ...pq.fill.map((q) => ({ t: 'fill' as const, q })),
      ...pq.choice.map((q) => ({ t: 'choice' as const, q })),
      ...pq.correction.map((q) => ({ t: 'correction' as const, q })),
    ];
    for (const item of shuffle(pool).slice(0, 2)) {
      if (out.length >= count) break outer;
      const q: any = item.q;
      if (item.t === 'correction') {
        out.push({
          key: `gra-${q.id}`, module: 'grammar', moduleLabel: '语法', moduleIcon: '✏️',
          exerciseType: 'grammar_correction', subjectId: gid, subjectName: name,
          questionId: q.id, kind: 'input',
          prompt: '改正下面句子中的错误，写出正确句子', promptZh: q.sentence,
          answer: q.answer, explain: q.explanation,
          source: weakSet.has(gid) ? 'weak' : 'new',
        });
      } else {
        // fill / choice 都有 options
        out.push({
          key: `gra-${q.id}`, module: 'grammar', moduleLabel: '语法', moduleIcon: '✏️',
          exerciseType: item.t === 'fill' ? 'grammar_fill' : 'grammar_choice', subjectId: gid, subjectName: name,
          questionId: q.id, kind: 'choice',
          prompt: item.t === 'fill' ? '选出正确的词填空' : (q.question ?? '选择正确答案'),
          promptZh: item.t === 'fill' ? q.sentence : undefined,
          options: q.options, answer: resolveAnswerText(q.answer, q.options), explain: q.explanation,
          source: weakSet.has(gid) ? 'weak' : 'new',
        });
      }
    }
  }
  return out.slice(0, count);
}

function buildListening(count: number, weak: string[]): MixQuestion[] {
  const out: MixQuestion[] = [];
  const weakSet = new Set(weak);
  // 收集 (set, question) 候选，Part1/3/4 都是选择题
  type Cand = { setId: string; setName: string; part: number; q: any; options: string[] };
  const cands: Cand[] = [];
  const pushSet = (sets: any[], part: number, optOf: (q: any) => string[]) => {
    for (const s of shuffle(sets).slice(0, 25)) {
      const qs = s.questions ?? [];
      for (const q of qs) cands.push({ setId: s.id, setName: s.titleZh, part, q, options: optOf(q) });
    }
  };
  pushSet(part1Sets, 1, (q) => q.options);
  pushSet(part3Sets, 3, (q) => q.options);
  pushSet(part4Sets, 4, (q) => q.options.map((o: any) => `${o.emoji} ${o.desc}`));
  // 优先薄弱套题
  const sorted = cands.sort((a, b) => Number(weakSet.has(b.setId)) - Number(weakSet.has(a.setId)));
  const used = new Set<string>();
  for (const c of sorted) {
    if (out.length >= count) break;
    if (used.has(c.q.id)) continue; used.add(c.q.id);
    const answer = resolveAnswerText(c.q.answer, c.options);
    out.push({
      key: `lis-${c.q.id}`, module: 'listening', moduleLabel: '听力', moduleIcon: '🎧',
      exerciseType: `Part${c.part}-${c.setId}`, subjectId: c.setId, subjectName: c.setName,
      questionId: c.q.id, kind: 'choice',
      prompt: '先听音频，再选择正确答案', promptZh: c.q.questionZh ?? c.q.question,
      options: c.options, answer, audioText: c.q.audioText,
      explain: c.q.explanation, source: weakSet.has(c.setId) ? 'weak' : 'new',
    });
  }
  return out.slice(0, count);
}

function buildReading(count: number, weak: string[]): MixQuestion[] {
  const out: MixQuestion[] = [];
  const weakSet = new Set(weak);
  // 用完形填空：短文自带上下文 + 每空三选一，自洽好渲染
  const arts = [...part3ClozeArticles].sort(
    (a, b) => Number(weakSet.has(b.id)) - Number(weakSet.has(a.id))
  );
  for (const a of arts) {
    if (out.length >= count) break;
    const blank = shuffle(a.blanks)[0];
    if (!blank) continue;
    out.push({
      key: `rea-${a.id}-${blank.id}`, module: 'reading', moduleLabel: '阅读', moduleIcon: '📖',
      exerciseType: 'reading_p3', subjectId: a.id, subjectName: a.titleZh,
      questionId: blank.id, kind: 'choice',
      prompt: '阅读短文，选出最合适的词填入空格',
      passage: a.passage,
      options: blank.options, answer: resolveAnswerText(blank.answer, blank.options),
      explain: blank.explanation, source: weakSet.has(a.id) ? 'weak' : 'new',
    });
  }
  return out.slice(0, count);
}

// ---------------- 题量分配 + 组装 ----------------

/** 根据各模块正确率，为四模块分配题量（弱者多练）。base 每模块起步，弱模块 +2/+1。 */
function allocate(total: number, acc: Record<MixModule, number>): Record<MixModule, number> {
  const mods: MixModule[] = ['vocabulary', 'grammar', 'listening', 'reading'];
  const base = Math.max(2, Math.floor((total - 3) / 4));
  const counts: Record<MixModule, number> = { vocabulary: base, grammar: base, listening: base, reading: base };
  // 无数据(-1) 视为中等偏弱 0.55，鼓励练习
  const score = (m: MixModule) => (acc[m] < 0 ? 0.55 : acc[m]);
  const ranked = [...mods].sort((a, b) => score(a) - score(b)); // 正确率低的在前
  let remain = total - base * 4;
  const bonus = [2, 1, 1, 0];
  for (let i = 0; i < ranked.length && remain > 0; i++) {
    const add = Math.min(bonus[i], remain);
    counts[ranked[i]] += add;
    remain -= add;
  }
  return counts;
}

export function generateDailyMix(input: DailyMixInput): MixQuestion[] {
  const total = input.total ?? 15;
  const counts = allocate(total, input.moduleAccuracy);
  const perModule: Record<MixModule, MixQuestion[]> = {
    vocabulary: buildVocab(counts.vocabulary, input.weak.vocabulary),
    grammar: buildGrammar(counts.grammar, input.weak.grammar),
    listening: buildListening(counts.listening, input.weak.listening),
    reading: buildReading(counts.reading, input.weak.reading),
  };
  // 轮转穿插（词汇→语法→听力→阅读→…），避免同模块连续
  const order: MixModule[] = ['vocabulary', 'grammar', 'listening', 'reading'];
  const idx: Record<MixModule, number> = { vocabulary: 0, grammar: 0, listening: 0, reading: 0 };
  const mixed: MixQuestion[] = [];
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const m of order) {
      if (idx[m] < perModule[m].length) {
        mixed.push(perModule[m][idx[m]++]);
        progressed = true;
      }
    }
  }
  return mixed;
}

export { MODULE_META };
