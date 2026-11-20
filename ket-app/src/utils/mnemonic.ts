/**
 * 错词 AI 助记（纯函数层，不依赖 cloud SDK，可独立单测）。
 *
 * 借鉴扇贝「个性化记忆线索」：对错次 >= 3 的单词，用 LLM 生成一句中文联想助记。
 *  - 数据源是 useVocabStore.words[wordId].wrong（听写答错累计），不是错题本的 AnswerRecord。
 *  - 本模块只做「筛词 / 拼 prompt / 解析结果」，真正的 LLM 调用在 llm.ts 的 generateMnemonic。
 *  - 助记只是记忆线索，不进掌握判定、不进云同步，可随时重新生成。
 */
import type { VocabularyTheme, Word, VocabWordProgress } from '../types';

/** 触发助记的最低错次 */
export const MNEMONIC_MIN_WRONG = 3;
/** 卡片最多展示的难词数（防止题库大时刷屏） */
export const MNEMONIC_MAX_WORDS = 8;
/** 助记文本最大长度（防止模型啰嗦） */
export const MNEMONIC_MAX_CHARS = 140;

/** 一个待助记的难词 */
export interface HardWord {
  wordId: string;
  word: Word;
  wrong: number;
}

/** 系统提示：稳定的行为规则，不含用户输入 */
export const MNEMONIC_SYSTEM = `你是 KET（A2）英语单词记忆老师，面向中国五年级学生。
你的任务：为给定单词写一句「中文联想助记」，帮孩子把这个英文词和它的中文意思牢牢挂钩。

规则：
1. 只用中文写，不超过 60 个汉字；简短、具体、画面感强。
2. 可用的手法：谐音、词根词缀、拆分、和生活场景挂钩、和中文释义形成夸张联想。选最贴切的一种，不要堆砌。
3. 必须紧扣给定的中文释义，绝不编造词义；不确定时就用最朴素的拆分或谐音。
4. 不要输出 Markdown 符号、代码块或解释过程，只输出 JSON：{"hint":"你的助记句子"}`;

/** 拼给 LLM 的 user 内容 */
export function buildMnemonicUser(word: { en: string; zh: string; phonetic?: string; example?: string }): string {
  const lines = [
    `请为下面这个 KET 单词生成一句中文联想助记（不超过 60 字）。`,
    ``,
    `【英文单词】${word.en}`,
    `【中文释义】${word.zh}`,
  ];
  if (word.phonetic) lines.push(`【音标】${word.phonetic}`);
  if (word.example) lines.push(`【例句】${word.example}`);
  lines.push(``, `只输出 JSON：{"hint":"..."}`);
  return lines.join('\n');
}

/** 清洗模型吐出的助记文本：去 markdown、压空白、限长 */
export function sanitizeHint(raw: string): string {
  return String(raw || '')
    .replace(/```(?:json)?/gi, '')
    .replace(/[*_#`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MNEMONIC_MAX_CHARS);
}

/**
 * 从模型返回里稳妥地抽出助记文本。
 * 兼容：标准 JSON、markdown 代码块包裹、字段名 hint/mnemonic、模型只回纯文本。
 */
export function parseMnemonic(raw: string): string | null {
  if (!raw || !String(raw).trim()) return null;
  const cleaned = String(raw)
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  let hint = '';
  const pick = (obj: unknown): string => {
    if (!obj || typeof obj !== 'object') return '';
    const o = obj as Record<string, unknown>;
    if (typeof o.hint === 'string') return o.hint;
    if (typeof o.mnemonic === 'string') return o.mnemonic;
    return '';
  };

  try {
    hint = pick(JSON.parse(cleaned));
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try { hint = pick(JSON.parse(m[0])); } catch { /* 落到纯文本兜底 */ }
    }
    if (!hint) hint = cleaned;
  }

  const s = sanitizeHint(hint);
  return s.length >= 2 ? s : null;
}

/** 用词表建立 wordId -> Word 索引（主题里 words 的 id 即进度里的 wordId） */
export function buildWordIndex(themes: VocabularyTheme[]): Map<string, Word> {
  const index = new Map<string, Word>();
  for (const t of themes) {
    for (const w of t.words || []) {
      if (w && w.id && !index.has(w.id)) index.set(w.id, w);
    }
  }
  return index;
}

/**
 * 从词汇进度里挑出错次 >= minWrong 的词，挂上词表信息，按错次降序。
 * 只在词表里存在的 wordId 才会入选（防止残留脏进度导致 en/zh 为空）。
 */
export function pickHardWords(
  progress: Record<string, VocabWordProgress>,
  index: Map<string, Word>,
  minWrong = MNEMONIC_MIN_WRONG,
  maxCount = MNEMONIC_MAX_WORDS
): HardWord[] {
  const out: HardWord[] = [];
  for (const [wordId, p] of Object.entries(progress || {})) {
    if (!p || typeof p.wrong !== 'number' || p.wrong < minWrong) continue;
    const w = index.get(wordId);
    if (!w) continue;
    out.push({ wordId, word: w, wrong: p.wrong });
  }
  out.sort((a, b) => b.wrong - a.wrong || a.wordId.localeCompare(b.wordId));
  return out.slice(0, maxCount);
}

/** 难词总数（用于卡片副标题，不受 maxCount 截断） */
export function countHardWords(
  progress: Record<string, VocabWordProgress>,
  minWrong = MNEMONIC_MIN_WRONG
): number {
  let n = 0;
  for (const p of Object.values(progress || {})) {
    if (p && typeof p.wrong === 'number' && p.wrong >= minWrong) n++;
  }
  return n;
}
