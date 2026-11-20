// 阅读开放填空（Part 5）判分：单一真源。
// 背景：一道空的正确答案常有不止一种填法，数据用 answer（主答案）+ accept（其他可接受答案）记录。
// 历史 bug：旧判分在 accept 存在时只比 accept，把 answer 自己排除，
// 导致孩子填了展示出来的主答案反而被判错。判分与展示必须都走这里，避免再次分叉。

export interface OpenBlankLike {
  answer: string;
  accept?: string[];
}

/** 归一化用户/标准答案：去首尾空白、忽略大小写；空串归一为 ''。 */
function norm(s: string | undefined | null): string {
  return (s ?? '').trim().toLowerCase();
}

/**
 * 一道空的全部可接受答案（主答案 + accept），已 trim / 去空 / 去重（忽略大小写）。
 * 展示层用它生成「正确答案」串，判分层用它做匹配，二者永远一致。
 */
export function acceptedAnswers(blank: OpenBlankLike): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [blank.answer, ...(blank.accept ?? [])]) {
    const v = norm(raw);
    if (v && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

/** 用户填写是否命中任一可接受答案。空回答恒为 false。 */
export function isBlankCorrect(userAnswer: string | undefined, blank: OpenBlankLike): boolean {
  const u = norm(userAnswer);
  if (!u) return false;
  return acceptedAnswers(blank).includes(u);
}

/** 展示用：把全部可接受答案拼成「got / received」形式。 */
export function acceptedAnswersLabel(blank: OpenBlankLike): string {
  return acceptedAnswers(blank).join(' / ');
}
