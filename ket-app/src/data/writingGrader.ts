/**
 * 写作批改引擎（纯规则，不依赖任何 API）
 *
 * 两件事：
 *  1) 要点覆盖检测 —— KET A2 写作真正考的是「该说的说了没有」，不是词数够不够。
 *     每道题 3 个要点，各配一组关键词；孩子的作文命中关键词才算该要点覆盖。
 *  2) 语法可疑点提示 —— 只提示「这里可能错了 + 建议改成什么」，不判错。
 *     刻意不做「判对错」：规则引擎对语法错误的误判率不低，误报会打击孩子信心。
 *
 * 设计原则：**宁可漏报，不可误报**。所有规则都只在明确无疑时才提示。
 */

export interface WritingPoint {
  /** 要点标签（中文，展示用） */
  label: string;
  /** 该要点的英文关键词组：命中任意一组即视为覆盖 */
  keywordGroups: string[][];
  /** 给孩子的提示（未覆盖时显示） */
  hint: string;
}

export interface PointCheck {
  label: string;
  covered: boolean;
  /** 命中的关键词（用于展示"你写到了 xxx"） */
  hitKeywords: string[];
  hint: string;
}

export interface GrammarIssue {
  /** 出问题的原文片段 */
  fragment: string;
  /** 中文说明 */
  message: string;
  /** 建议改成 */
  suggestion: string;
}

/** 一个维度的评分结果（规则层/LLM 共用同一形状） */
export interface DimensionScore {
  /** 0-100 的粗略引导分 */
  score: number;
  /** 针对该维度的具体点评（中文） */
  comments: string[];
}

/** 三个能力维度 */
export interface DimensionScores {
  grammar: DimensionScore;
  vocabulary: DimensionScore;
  structure: DimensionScore;
}

export interface WritingReport {
  wordCount: number;
  minWords: number;
  wordCountOk: boolean;
  points: PointCheck[];
  pointsHit: number;
  pointsTotal: number;
  /** 要点覆盖率 0-100 */
  pointsPercent: number;
  /** 全部要点都覆盖且词数达标 */
  passed: boolean;
  grammarIssues: GrammarIssue[];
  /** 一句话总评 */
  summary: string;
  /**
   * 语法/词汇/结构三维反馈（规则层本地算，离线也有）。
   * 可选：旧存档缺此字段不报错；UI 用 ?. 兜底。
   */
  dimensions?: DimensionScores;
}

// ========== 词数统计 ==========

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

// ========== 要点覆盖检测 ==========

/** 把文本归一化后做「词/短语包含」判断，容忍大小写与标点差异 */
function normalize(text: string): string {
  return ' ' + text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
}

export function checkPoints(text: string, points: WritingPoint[]): PointCheck[] {
  const norm = normalize(text);
  return points.map((p) => {
    const hitKeywords: string[] = [];
    for (const group of p.keywordGroups) {
      for (const kw of group) {
        const k = normalize(kw).trim();
        if (k && norm.includes(' ' + k + ' ')) {
          hitKeywords.push(kw);
          break; // 一个组内命中任一即可
        }
      }
    }
    return {
      label: p.label,
      covered: hitKeywords.length > 0,
      hitKeywords,
      hint: p.hint,
    };
  });
}

// ========== 语法可疑点检测（只提示，不判错）==========
//
// 全部为「几乎可以确定是错」的形态：
//  - 第三人称单数缺 -s（he go / she have）
//  - be 动词与实义动词混用（I am agree / he have a book）
//  - 双重过去式（did not went）
//  - there be 与复数不一致
//  - a + 元音开头
//  - 常见拼写错误（recieve / freind）
//  - 句首大写缺失（整句无大写）
//  - 常见中式英语（very like / very love）

interface GrammarRule {
  id: string;
  pattern: RegExp;
  message: string;
  suggestion: string;
  /** 命中后是否跳过该位置附近，避免同一处重复报 */
  skip?: number;
}

const GRAMMAR_RULES: GrammarRule[] = [
  {
    id: 'third-person-s',
    pattern: /\b(he|she|it)\s+(go|have|do|like|play|want|need|know|think|make|take|come|go)\b/gi,
    message: '第三人称单数后动词可能缺 -s',
    suggestion: 'he goes / she has / it likes',
  },
  {
    id: 'be-with-verb',
    pattern: /\b(am|is|are|was|were)\s+(agree|arrive|belong|consist|contain|exist|include|like|love|need|want|prefer|seem|become|appear|feel|help|own|possess|remain|seem|sound|want|wish)\b/gi,
    message: 'be 动词后不能直接跟这种实义动词',
    suggestion: '去掉 be：I agree（不是 I am agree）',
  },
  {
    id: 'double-past',
    pattern: /\b(did|didn't|did not)\s+(went|saw|had|was|were|came|got|made|took|said|bought|found|thought)\b/gi,
    message: 'did 后面要用动词原形',
    suggestion: 'did not go（不是 did not went）',
  },
  {
    id: 'there-be-plural',
    pattern: /\bthere\s+is\s+(many|some|two|three|four|five|several|a lot of|lots of)\b/gi,
    message: 'there is 后接复数名词',
    suggestion: '改成 there are',
  },
  {
    id: 'a-vowel',
    pattern: /\ba\s+[aeiou]\w*/gi,
    message: '元音音素开头的词前面一般用 an',
    suggestion: 'an apple / an egg / an old book',
  },
  {
    id: 'very-like',
    pattern: /\bvery\s+(like|love|enjoy|want|need)\b/gi,
    message: 'very 不能修饰动词',
    suggestion: 'I really like / I like it very much',
  },
  {
    id: 'common-spelling',
    pattern: /\b(recieve|freind|becuase|seperate|definately|occured|untill|neccessary|begining|writeing|tommorow)\b/gi,
    message: '常见拼写错误',
    suggestion: 'receive / friend / because / separate / definitely / occurred / until / necessary / beginning / writing / tomorrow',
  },
  {
    id: 'i-is',
    pattern: /\bi\s+is\b/gi,
    message: '第一人称单数用 am',
    suggestion: 'I am',
  },
  {
    id: 'he-have',
    pattern: /\b(he|she|it)\s+have\b/gi,
    message: '第三人称单数用 has',
    suggestion: 'he has / she has / it has',
  },
];

export function checkGrammar(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const seen = new Set<string>();
  for (const rule of GRAMMAR_RULES) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const fragment = m[0].trim();
      const key = rule.id + '|' + fragment.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      issues.push({
        fragment,
        message: rule.message,
        suggestion: rule.suggestion,
      });
      if (m.index === re.lastIndex) re.lastIndex++; // 防止零宽匹配死循环
    }
  }
  return issues;
}

// ========== 三维度评分（规则层本地算，离线也有反馈）==========
//
// 沿用「宁可漏报，不可误报」：分数只作粗略引导，点评一律给「可以怎么做」，
// 不把可疑点说成铁定错误。三维度与要点覆盖相互独立。

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** 语法维度：复用已有的可疑点检测，按处数温和扣分 */
export function assessGrammar(issues: GrammarIssue[]): DimensionScore {
  const comments = issues.slice(0, 5).map((it) => `${it.fragment}：${it.message}（建议 ${it.suggestion}）`);
  const score = clamp(100 - issues.length * 12);
  if (comments.length === 0) comments.push('没有发现明显的语法可疑点，保持得很好');
  return { score, comments };
}

/** 词汇维度：看拼写可疑点 + 用词多样性，鼓励换词而非判定水平 */
export function assessVocabulary(text: string, issues: GrammarIssue[]): DimensionScore {
  const comments: string[] = [];
  let penalty = 0;

  const spelling = issues.filter((it) => /拼写|an apple|元音/.test(it.message));
  if (spelling.length > 0) {
    penalty += spelling.length * 8;
    comments.push(`有 ${spelling.length} 处拼写/冠词可再检查一下（${spelling.slice(0, 3).map((s) => s.fragment).join('、')}）`);
  }

  const words = text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];
  const wc = words.length;
  if (wc >= 8) {
    const unique = new Set(words).size;
    const ttr = unique / wc; // type-token ratio
    if (ttr < 0.5) {
      penalty += 10;
      comments.push('有些词重复得比较多，可以试着换个说法表达同一个意思');
    } else {
      comments.push('用词有变化，读起来不单调');
    }
  } else {
    comments.push('再多写几句，就能看出用词的变化了');
  }

  const filler = (text.toLowerCase().match(/\b(very|good|nice|happy|things?)\b/g) || []).length;
  if (filler >= 4) {
    penalty += 6;
    comments.push('very / good 这类词用得较多，可以换成更具体的词');
  }
  if (comments.length === 0) comments.push('用词清楚，意思表达得到位');
  return { score: clamp(100 - penalty), comments: comments.slice(0, 5) };
}

/** 结构维度：看句数、逻辑连接词、邮件/故事的格式信号 */
export function assessStructure(text: string, kind: 'email' | 'story' = 'email'): DimensionScore {
  const comments: string[] = [];
  let penalty = 0;

  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  if (sentences.length < 3) {
    penalty += 15;
    comments.push(`目前写了 ${sentences.length} 句，试着再补 1–2 句让内容更完整`);
  } else {
    comments.push(`一共 ${sentences.length} 句，段落结构清楚`);
  }

  const connectors = text.toLowerCase().match(/\b(and|but|because|so|first|then|after|finally|when|because)\b/g) || [];
  const uniqueConnectors = new Set(connectors);
  if (uniqueConnectors.size === 0) {
    penalty += 10;
    comments.push('可以加一两个连接词（and / but / because / then），让句子更连贯');
  } else {
    comments.push(`用到了 ${[...uniqueConnectors].slice(0, 4).join(' / ')} 等连接词`);
  }

  const lower = text.toLowerCase();
  if (kind === 'email') {
    const hasGreeting = /dear\b/.test(lower);
    const hasClosing = /\b(best wishes|see you soon|bye|yours)\b/.test(lower);
    if (!hasGreeting || !hasClosing) {
      penalty += 8;
      comments.push('邮件记得以 Dear 开头、以 Best wishes / See you soon 结尾');
    } else {
      comments.push('邮件的开头和结尾格式正确');
    }
  } else {
    const hasNarrative = /\b(one day|yesterday|last week|finally|suddenly)\b/.test(lower);
    if (!hasNarrative) {
      penalty += 6;
      comments.push('故事可以用 One day / Finally 这类词交代时间顺序');
    } else {
      comments.push('有清楚的时间/叙事线索');
    }
  }
  return { score: clamp(100 - penalty), comments: comments.slice(0, 5) };
}

// ========== 汇总批改 ==========

export function gradeWriting(
  text: string,
  minWords: number,
  points: WritingPoint[],
  kind: 'email' | 'story' = 'email'
): WritingReport {
  const wordCount = countWords(text);
  const wordCountOk = wordCount >= minWords;
  const pointChecks = checkPoints(text, points);
  const pointsHit = pointChecks.filter((p) => p.covered).length;
  const pointsTotal = points.length;
  const pointsPercent = pointsTotal === 0 ? 0 : Math.round((pointsHit / pointsTotal) * 100);
  const grammarIssues = checkGrammar(text);
  const passed = wordCountOk && pointsHit === pointsTotal;

  // 一句话总评
  let summary: string;
  if (!wordCountOk && pointsHit < pointsTotal) {
    summary = `还差 ${minWords - wordCount} 词，并且有 ${pointsTotal - pointsHit} 个要点没写到`;
  } else if (!wordCountOk) {
    summary = `要点都覆盖了，但词数还差 ${minWords - wordCount} 词`;
  } else if (pointsHit < pointsTotal) {
    const missing = pointChecks.filter((p) => !p.covered).map((p) => p.label);
    summary = `词数够了，但还漏了：${missing.join(' / ')}`;
  } else {
    summary = '要点全部覆盖，词数达标';
  }
  if (grammarIssues.length > 0) {
    summary += `；另有 ${grammarIssues.length} 处可能需要检查`;
  }

  return {
    wordCount,
    minWords,
    wordCountOk,
    points: pointChecks,
    pointsHit,
    pointsTotal,
    pointsPercent,
    passed,
    grammarIssues,
    summary,
    dimensions: {
      grammar: assessGrammar(grammarIssues),
      vocabulary: assessVocabulary(text, grammarIssues),
      structure: assessStructure(text, kind),
    },
  };
}
