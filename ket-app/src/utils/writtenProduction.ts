// ========== 手写产出共用层（词汇造句 / 语法手写）==========
//
// 口径（2026-11-10 定稿）：
//   · 只做字符串层校验：有没有用到目标词 / 句子是否与标准答案一致
//   · **不判语法、不打分、不计入任何掌握判定**（词汇仍只认听写）
//   · 不给 AI 打分，不做内容理解；写不出来可跳过，不卡住学习流程
//   · 词汇造句与语法手写共用这一个模块，避免造两套归一化规则
//
// 这一层是纯函数，可在 Node 里直接实跑校验（见 scripts/run_check_sentence.mjs）。

/** 存档上限：按时间倒序只留最近这么多条，防止同步包无限膨胀 */
export const MAX_WRITTEN_SENTENCES = 300;

export interface WrittenCheck {
  ok: boolean;
  /** 不通过时给孩子看的短提示，不解释语法 */
  reason?: string;
}

/**
 * 归一化：忽略大小写、首尾与连续空白、弯引号、句末标点。
 * 语法手写比对用它；词汇造句只用它清理目标词本身。
 */
export function normalizeWritten(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/[.!?。！？,，;；:：]+$/g, '')
    .trim();
}

/** 语法手写判定：整句归一化后相等即算写对，不做部分匹配、不判语法 */
export function isWrittenCorrect(input: string, answer: string): boolean {
  return normalizeWritten(input) === normalizeWritten(answer);
}

/** 一个词的常见规则屈折形式。短词（≤2 字母）只允许精确匹配，避免 a→as 之类误判 */
function wordVariants(base: string): string[] {
  if (base.length <= 2) return [base];
  const out = [base, `${base}s`, `${base}es`, `${base}d`, `${base}ed`, `${base}ing`];
  if (base.endsWith('e')) {
    out.push(`${base.slice(0, -1)}ing`, `${base.slice(0, -1)}ed`);
  }
  if (base.endsWith('y')) {
    out.push(`${base.slice(0, -1)}ies`, `${base.slice(0, -1)}ied`);
  }
  // 重读闭音节双写末尾辅音：run→running / swim→swimming
  if (/[^aeiou][aeiou][^aeiou]$/.test(base)) {
    const last = base.slice(-1);
    out.push(`${base}${last}ing`, `${base}${last}ed`);
  }
  return Array.from(new Set(out));
}

/**
 * 句子里是否用到了目标词（大小写不敏感、按词边界）。
 * 允许常见屈折（plays / played / playing / boxes / studies / running），
 * 因为孩子写 "I played football" 时确实是在用 play，硬拦会挫伤表达。
 * 短语型词（get up）按连续词序列匹配。
 */
export function containsTargetWord(sentence: string, word: string): boolean {
  // 不用 normalizeWritten 清目标词：它会吃掉 a.m. / p.m. 的尾点
  const raw = word.trim().toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, ' ');
  if (!raw) return false;

  // 数字、缩写（a.m. / p.m. / 3）等非常规词：按字面片段匹配，不做屈折推导
  if (/[^a-z' -]/.test(raw)) {
    const lit = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${lit}(?=$|[^a-z0-9])`, 'i').test(sentence.toLowerCase());
  }

  const parts = raw.replace(/[^a-z' -]/g, '').split(/\s+/).filter(Boolean);
  const tokens = sentence.toLowerCase().match(/[a-z]+(?:['’-][a-z]+)*/g) ?? [];

  if (parts.length > 1) {
    for (let i = 0; i <= tokens.length - parts.length; i++) {
      if (parts.every((p, j) => tokens[i + j] === p)) return true;
    }
    return false;
  }

  const allowed = new Set(wordVariants(parts[0]));
  return tokens.some((t) => allowed.has(t));
}

/**
 * 词汇造句的唯一校验：非空、像一句话、用到目标词（拼写因此对）。
 * 不检查时态、主谓一致、冠词——这一版明确不判语法。
 */
export function validateVocabSentence(text: string, word: string): WrittenCheck {
  const t = text.trim();
  if (!t) return { ok: false, reason: '先写一句再提交' };
  if (t.length > 160) return { ok: false, reason: '太长了，写一句就好' };
  const tokens = t.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) ?? [];
  if (tokens.length < 2) return { ok: false, reason: '至少写两个词，才算一句话' };
  if (!containsTargetWord(t, word)) {
    return { ok: false, reason: `把 ${word} 用进句子里，注意拼写` };
  }
  return { ok: true };
}

/**
 * 跨设备合并：按 id 并集，按 createdAt 倒序、截断到上限。
 * 本地优先（同 id 不覆盖），旧同步包没有 sentences 时原样保留本地。
 */
export function mergeWrittenSentences<T extends { id: string; createdAt?: string }>(
  local: readonly T[],
  remote: readonly T[]
): T[] {
  const byId = new Map<string, T>();
  for (const s of local) if (s?.id) byId.set(s.id, s);
  for (const s of remote) if (s?.id && !byId.has(s.id)) byId.set(s.id, s);
  return Array.from(byId.values())
    .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
    .slice(0, MAX_WRITTEN_SENTENCES);
}
