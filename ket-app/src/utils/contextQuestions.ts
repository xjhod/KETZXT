// ========== 语境填空：全部从词库真实例句派生，不编造句子 ==========
//
// 背景：原 fillBlankQuestions 有 1329 题，其中约 1104 题取自例句，
// 另有 200 余题是 `This is a ____.` 一类模板句，短句重复度高、语境信息少。
// 这里直接以每个词条自带的 example 为句子来源，运行时挖空生成题目：
//   · 不新增任何英文内容，挖掉的词一定是词库里真实存在的词条原形
//   · 只认原形：例句中出现复数/过去式（parents、played）的词跳过，
//     否则答案写原形、句子里却是变形，会教错
//   · 无法定位原形的词（fog→foggy、tooth→teeth、take off→takes off）跳过，
//     由校验脚本统计覆盖率，不硬凑
import { allThemes } from '../data/vocabulary';
import type { FillBlankQuestion, Word } from '../types';

export const BLANK_MARK = '____';

export interface ContextQuestion extends FillBlankQuestion {
  wordId: string;
  /** 例句中文，用于做完后的对照 */
  zh: string;
  /** 原始例句（未挖空），校验「零编造」时直接比对 */
  plain: string;
  /** 例句中被挖掉的实际文本，可能句首大写（Fish / Teenagers） */
  matched: string;
  /** 句子来源标记，界面与校验都可追溯 */
  source: 'word-example';
}

/** 转义正则元字符，避免 a.m. / ice-cream 之类词条破坏匹配 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 在词条自带例句里定位该词的原形，返回挖空后的句子。
 * 找不到原形返回 null（调用方应跳过，而不是退而求其次挖一个变形词）。
 */
export function blankSentence(word: Word): {
  sentence: string;
  answer: string;
  plain: string;
  matched: string;
} | null {
  const plain = (word.example ?? '').trim();
  const en = (word.en ?? '').trim();
  if (!plain || !en) return null;
  const re = /^[a-z]+$/.test(en)
    ? new RegExp(`\\b${escapeRegExp(en)}\\b`, 'i')
    : new RegExp(escapeRegExp(en), 'i');
  const m = re.exec(plain);
  if (!m) return null;
  return {
    sentence: plain.slice(0, m.index) + BLANK_MARK + plain.slice(m.index + m[0].length),
    answer: en,
    plain,
    matched: m[0],
  };
}

/**
 * 生成语境填空题。不传 themeId 时为全库（供校验脚本统计）。
 * 同一句例句可能对应多个词，按句子去重，避免孩子连着做两道一模一样的题。
 */
export function buildContextQuestions(themeId?: string): ContextQuestion[] {
  const themes = themeId ? allThemes.filter((t) => t.id === themeId) : allThemes;
  const out: ContextQuestion[] = [];
  const seenSentences = new Set<string>();
  for (const theme of themes) {
    for (const word of theme.words) {
      const blanked = blankSentence(word);
      if (!blanked) continue;
      if (seenSentences.has(blanked.plain)) continue;
      seenSentences.add(blanked.plain);
      out.push({
        id: `cq-${word.id}`,
        themeId: theme.id,
        sentence: blanked.sentence,
        answer: blanked.answer,
        hint: word.zh,
        zh: word.exampleZh,
        wordId: word.id,
        plain: blanked.plain,
        matched: blanked.matched,
        source: 'word-example',
      });
    }
  }
  return out;
}
