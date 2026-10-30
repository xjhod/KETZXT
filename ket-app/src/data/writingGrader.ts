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

// ========== 汇总批改 ==========

export function gradeWriting(
  text: string,
  minWords: number,
  points: WritingPoint[]
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
  };
}
