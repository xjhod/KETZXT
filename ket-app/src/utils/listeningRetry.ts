// 听力错题「真重做」反查层：由 AnswerRecord 的 questionId / exerciseType 定位到题库原题，
// 拿到可重听的音频文本、题干、选项与判分基准。纯函数，可独立单测。
// 数据全部来自 listening.ts，零编造；查不到返回 null，UI 回退到手动自评。

import {
  part1Sets, part2Sets, part3Sets, part4Sets, part5Sets,
} from '../data/listening';

export type RetryKind = 'choice' | 'fill';

export interface ListeningRetry {
  kind: RetryKind;
  /** 播放用：mp3 id（有则优先放本地音频）+ TTS 兜底文本 */
  audioId: string;
  audioText: string;
  /** 题干展示（中文优先，供理解） */
  prompt: string;
  /** 选择题：规范化后的选项文本数组（原顺序，不在此处打乱） */
  options: string[];
  /** 正确答案（选择题为选项文本；填空题为答案串） */
  correctAnswer: string;
  /** 完整原文，答后对照 */
  transcript: string;
  part: number;
}

/** 从 exerciseType（如 'Part3-L3-01'）解析 part 号，取不到返回 null */
export function parsePart(exerciseType: string): number | null {
  const m = /^Part([1-5])-/.exec(exerciseType || '');
  return m ? Number(m[1]) : null;
}

/** A/B/C 字母转选项下标 */
function letterIndex(answer: string): number {
  return (answer || '').trim().toUpperCase().charCodeAt(0) - 65;
}

function findChoice(
  part: number, questionId: string
): ListeningRetry | null {
  if (part === 1) {
    for (const set of part1Sets) for (const q of set.questions) {
      if (q.id !== questionId) continue;
      const ci = letterIndex(q.answer);
      return {
        kind: 'choice', audioId: q.id, audioText: q.audioText,
        prompt: q.imageDesc || q.audioText, options: [...q.options],
        correctAnswer: q.options[ci] ?? q.answer, transcript: q.transcript || q.audioText, part,
      };
    }
  }
  if (part === 3) {
    for (const set of part3Sets) for (const q of set.questions) {
      if (q.id !== questionId) continue;
      const ci = letterIndex(q.answer);
      return {
        kind: 'choice', audioId: q.audioText ? q.id : set.id, audioText: q.audioText || set.conversationAudio,
        prompt: q.question + (q.questionZh ? `（${q.questionZh}）` : ''), options: [...q.options],
        correctAnswer: q.options[ci] ?? q.answer, transcript: set.transcript || set.conversationAudio, part,
      };
    }
  }
  if (part === 4) {
    for (const set of part4Sets) for (const q of set.questions) {
      if (q.id !== questionId) continue;
      const ci = letterIndex(q.answer);
      const opts = (q.options || []).map((o) => o.emoji + ' ' + o.desc);
      return {
        kind: 'choice', audioId: q.id, audioText: q.audioText,
        prompt: q.question + (q.questionZh ? `（${q.questionZh}）` : ''), options: opts,
        correctAnswer: opts[ci] ?? q.answer,
        transcript: set.questions.map((x) => `${x.speakerA}: ${x.audioText}`).join('\n'), part,
      };
    }
  }
  return null;
}

function findFill(
  part: number, questionId: string
): ListeningRetry | null {
  if (part === 2) {
    for (const set of part2Sets) for (const b of set.blanks) {
      if (b.id !== questionId) continue;
      return {
        kind: 'fill', audioId: b.id, audioText: b.audioText,
        prompt: `${b.fieldZh}（${b.field}）` + (b.hint ? ` · 提示：${b.hint}` : ''),
        options: b.choices ? [...b.choices] : [], correctAnswer: b.answer,
        transcript: set.transcript || set.monologueAudio, part,
      };
    }
  }
  if (part === 5) {
    for (const set of part5Sets) for (const n of set.notes) {
      if (n.id !== questionId) continue;
      return {
        kind: 'fill', audioId: n.id, audioText: n.audioText,
        prompt: `${n.fieldZh}（${n.field}）` + (n.hint ? ` · 提示：${n.hint}` : ''),
        options: [], correctAnswer: n.answer,
        transcript: set.transcript || set.monologueAudio, part,
      };
    }
  }
  return null;
}

/** 按错题记录反查原题；排除非听力或查不到的记录 */
export function findListeningRetry(
  exerciseType: string, questionId: string
): ListeningRetry | null {
  const part = parsePart(exerciseType);
  if (part === null || !questionId) return null;
  return findChoice(part, questionId) || findFill(part, questionId);
}

/** 填空判分：trim + 忽略大小写；支持 'a / b' 多答案（与 P2 判分一致） */
export function isFillCorrect(userAnswer: string, correctAnswer: string): boolean {
  const u = (userAnswer || '').trim().toLowerCase();
  if (!u) return false;
  return (correctAnswer || '').split(' / ').some((a) => a.trim().toLowerCase() === u);
}

/** 选择题判分：比对规范化后的选项文本 */
export function isChoiceCorrect(userAnswer: string, correctAnswer: string): boolean {
  return (userAnswer || '').trim() === (correctAnswer || '').trim();
}
