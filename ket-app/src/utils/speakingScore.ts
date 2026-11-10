// ========== 口语确定性评分（离线参考分，不是口语能力分）==========
// 只做两件可测的事：目标词是否覆盖、有效词量是否够。
// 不判语法、不判发音、不判流利度；AI 评分成功后本分数自动让位。
// 2026-11-10 P0：从 SpeakingPage.tsx 抽离，修两处漏洞：
//   ① 旧版 w.includes(kw) 会让 dislike 命中 like、families 不命中 family
//   ② 旧版「流利度」按总词数给到 50 分，重复同一个词 50 次即可刷满

export interface ScoreResult {
  score: number;
  matchedKeywords: string[];
  wordCount: number;
  /** 不同词数：用于长度分，防止复读刷分 */
  distinctWordCount: number;
  feedback: string;
}

/** 生成关键词的常见屈折变体，用于词级精确匹配 */
export function keywordVariants(keyword: string): Set<string> {
  const k = keyword.toLowerCase().trim();
  const out = new Set<string>([k]);
  if (!/^[a-z]+$/.test(k)) return out;
  const add = (w: string) => { if (w) out.add(w); };
  add(k + 's');
  add(k + 'es');
  add(k + 'd');
  add(k + 'ed');
  add(k + 'ing');
  if (k.endsWith('e')) { add(k.slice(0, -1) + 'ing'); add(k.slice(0, -1) + 'ed'); }
  if (k.endsWith('y')) { add(k.slice(0, -1) + 'ies'); add(k.slice(0, -1) + 'ied'); }
  // 英式双写：travel -> travelling / travelled，run -> running
  if (/[bcdfghjklmnpqrstvz][aeiou][bcdfghjklmnpqrstvz]$/.test(k)) {
    const last = k[k.length - 1];
    add(k + last + 'ing');
    add(k + last + 'ed');
  }
  return out;
}

/** 词级判定：变体表精确相等，外加「短派生后缀」前缀匹配（near -> nearby / nearer） */
function tokenMatches(token: string, keyword: string): boolean {
  if (keywordVariants(keyword).has(token)) return true;
  // 只在关键词 ≥4 字母时放宽 2 个字母以内；dislike 不以 like 开头，不会误命中
  return keyword.length >= 4 && token.startsWith(keyword) && token.length - keyword.length <= 2;
}

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z]+(?:['’][a-z]+)*/g) ?? [];
}

/** 关键词命中：单词按变体表精确相等；多词关键词按连续 token 短语匹配 */
export function matchKeywords(text: string, keywords: string[]): string[] {
  const tokens = tokenize(text);
  return keywords.filter((kw) => {
    const parts = kw.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return false;
    if (parts.length > 1) {
      for (let i = 0; i <= tokens.length - parts.length; i++) {
        if (parts.every((p, j) => tokenMatches(tokens[i + j], p))) return true;
      }
      return false;
    }
    return tokens.some((t) => tokenMatches(t, parts[0]));
  });
}

/**
 * 离线参考分 = 关键词覆盖 80 分 + 有效词量 20 分（20 个不同词封顶）。
 * 有效词量按不同词数计，重复词不产生分数。
 */
export function scoreAnswer(transcript: string, keywords: string[]): ScoreResult {
  const tokens = tokenize(transcript);
  const wordCount = tokens.length;
  const distinctWordCount = new Set(tokens).size;
  if (!wordCount) {
    return {
      score: 0,
      matchedKeywords: [],
      wordCount: 0,
      distinctWordCount: 0,
      feedback: '还没有可评分的文字。请先录音，或在确认框里打出你的英文回答。',
    };
  }

  const matchedKeywords = matchKeywords(transcript, keywords);
  const keywordScore = keywords.length ? (matchedKeywords.length / keywords.length) * 80 : 0;
  const lengthScore = Math.min(distinctWordCount, 20);
  const score = Math.round(keywordScore + lengthScore);
  const missing = keywords.filter((k) => !matchedKeywords.includes(k));

  let feedback: string;
  if (score >= 80) {
    feedback = `覆盖了 ${matchedKeywords.length} 个关键信息点，内容比较完整。`;
  } else if (score >= 60) {
    feedback = `覆盖了 ${matchedKeywords.length} 个信息点，还可以补充：${missing.join('、') || '更多细节'}。`;
  } else {
    feedback = `试着用完整句子回答，并用到这些词：${keywords.join('、')}。`;
  }

  return { score, matchedKeywords, wordCount, distinctWordCount, feedback };
}
