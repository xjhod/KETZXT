/**
 * 验证写作批改引擎：要点覆盖检测 + 语法可疑点提示。
 *
 * 双向验证（关键）：
 *  - 正向：模板原文/标准范文应当**零语法告警**（说明规则不误报）
 *  - 反向：典型中式英语错误应当**被检出**（说明规则有效）
 *  - 要点检测：用标准范文应全覆盖；用"只写一件事"的短文应漏掉某些要点
 *
 * 运行：node --experimental-strip-types verify-writing-grader.mts
 */
import { WRITING_PROMPTS } from './src/data/dailyPlan.ts';
import {
  gradeWriting,
  checkGrammar,
  checkPoints,
  countWords,
  type WritingPoint,
} from './src/data/writingGrader.ts';

let fail = 0;
const bad = (m: string) => { console.log('  ❌ ' + m); fail++; };
const ok = (m: string) => console.log('  ✅ ' + m);

console.log('=== 1) 词数统计 ===');
const wcCases: [string, number][] = [
  ['', 0],
  ['hello', 1],
  ['hello world', 2],
  ['  hello   world  ', 2],
  ['Dear Teacher,\nI am ill.', 5],
];
for (const [t, expect] of wcCases) {
  const got = countWords(t);
  if (got !== expect) bad(`countWords(${JSON.stringify(t)}) = ${got}, 期望 ${expect}`);
}
ok('词数统计全部正确');

console.log('\n=== 2) 要点覆盖检测 ===');
{
  const p1 = WRITING_PROMPTS[0];
  // 标准答案（把模板里的占位符填实）应覆盖 3 个要点
  const good =
    'Dear Teacher,\n' +
    'I am sorry I am ill today, so I cannot come to school. I have a fever.\n' +
    'Please could you tell me what homework I should do?\n' +
    'Thank you.\nBest wishes,\nBen';
  const r = checkPoints(good, p1.points);
  const covered = r.filter((x) => x.covered).length;
  if (covered !== 3) bad(`标准答案应覆盖 3 个要点，实为 ${covered}：${JSON.stringify(r.map(x => [x.label, x.covered]))}`);
  else ok(`标准答案覆盖 3/3 要点（命中：${r.map((x) => x.hitKeywords.join('/')).join(' | ')}）`);

  // 只写道歉，不写原因和问作业 -> 应漏 2 个
  const poor = 'Dear Teacher, I am sorry I cannot come to school. Thank you.';
  const r2 = checkPoints(poor, p1.points);
  const covered2 = r2.filter((x) => x.covered).length;
  if (covered2 >= 3) bad(`只写道歉应漏掉至少 1 个要点，实为覆盖 ${covered2}`);
  else ok(`只写道歉正确漏掉 ${3 - covered2} 个要点（漏：${r2.filter(x => !x.covered).map(x => x.label).join(' / ')}）`);

  // 大小写/标点不应影响判定
  const upper = good.toUpperCase();
  const r3 = checkPoints(upper, p1.points);
  if (r3.filter((x) => x.covered).length !== 3) bad('大写文本的要点覆盖数变了 -> 归一化有问题');
  else ok('大小写归一化生效');
}

console.log('\n=== 3) 语法规则：反向（典型错误应被检出）===');
const shouldCatch: [string, string][] = [
  ['he go to school every day', 'third-person-s'],
  ['she have a new bike', 'third-person-s'],
  ['it do not matter', 'third-person-s'],
  ['I am agree with you', 'be-with-verb'],
  ['there is many people here', 'there-be-plural'],
  ['I did not went to school', 'double-past'],
  ['a apple is red', 'a-vowel'],
  ['I very like football', 'very-like'],
  ['I recieve a letter', 'common-spelling'],
  ['my freind is kind', 'common-spelling'],
  ['I is happy today', 'i-is'],
  ['he have a cat', 'he-have'],
];
for (const [text, ruleId] of shouldCatch) {
  const issues = checkGrammar(text);
  if (!issues.some((i) => i.fragment.toLowerCase().replace(/\s+/g, ' ').includes(text.split(' ')[0].toLowerCase()) || issues.length > 0)) {
    bad(`未检出: "${text}"`);
  } else if (issues.length === 0) {
    bad(`未检出: "${text}"`);
  } else {
    ok(`检出 "${text}" -> ${issues.map((i) => i.message).join('; ')}`);
  }
}

console.log('\n=== 4) 语法规则：正向（正确句子不应被误报）===');
const shouldNotCatch: string[] = [
  'He goes to school every day.',
  'She has a new bike.',
  'It does not matter.',
  'I agree with you.',
  'There are many people here.',
  'I did not go to school.',
  'An apple is red.',
  'I really like football.',
  'I received a letter yesterday.',
  'My friend is kind.',
  'I am happy today.',
  'He has a cat.',
  'I will go to the park tomorrow.',
  'They are playing football now.',
  'We went to the cinema last week.',
  'My brother is twelve years old.',
  'She likes swimming and dancing.',
  'There is a big park near my house.',
  'I have a fever and a headache.',
  'Could you please help me?',
  'Thank you for your help.',
  'Dear Tom, How are you? See you soon.',
  'One day, Ben found a wallet in the playground.',
  'Finally, she felt proud of herself.',
];
let fp = 0;
for (const text of shouldNotCatch) {
  const issues = checkGrammar(text);
  if (issues.length > 0) {
    fp++;
    bad(`误报: "${text}" -> ${issues.map((i) => `${i.fragment}(${i.message})`).join('; ')}`);
  }
}
if (fp === 0) ok(`${shouldNotCatch.length} 个正确句子全部零误报`);
else bad(`共 ${fp} 处误报`);

console.log('\n=== 5) 12 道题的数据完整性 ===');
{
  for (const p of WRITING_PROMPTS) {
    if (!Array.isArray(p.points) || p.points.length !== 3) {
      bad(`${p.id} 的 points 应为 3 个，实际 ${p.points?.length}`);
      continue;
    }
    for (const pt of p.points) {
      if (!pt.label || !pt.hint) bad(`${p.id} 的要点缺少 label/hint`);
      if (!Array.isArray(pt.keywordGroups) || pt.keywordGroups.length === 0) {
        bad(`${p.id}/${pt.label} 缺 keywordGroups`);
      }
      for (const g of pt.keywordGroups) {
        if (!Array.isArray(g) || g.length === 0) bad(`${p.id}/${pt.label} 有空关键词组`);
      }
    }
  }
  ok(`12 道题 × 3 要点配置齐全（共 ${WRITING_PROMPTS.length * 3} 个要点）`);
}

console.log('\n=== 6) gradeWriting 汇总 ===');
{
  const p1 = WRITING_PROMPTS[0];
  const good =
    'Dear Teacher,\nI am sorry I am ill today, so I cannot come to school. I have a fever.\n' +
    'Please could you tell me what homework I should do?\nThank you.\nBest wishes,\nBen';
  const r = gradeWriting(good, p1.minWords, p1.points);
  if (!r.wordCountOk) bad(`词数应达标（${r.wordCount} >= ${p1.minWords}）`);
  if (r.pointsHit !== 3) bad(`要点应 3/3，实为 ${r.pointsHit}`);
  if (!r.passed) bad('标准答案应判为 passed');
  else ok(`标准答案：${r.wordCount} 词、要点 ${r.pointsHit}/${r.pointsTotal}（${r.pointsPercent}%）、通过=${r.passed}`);
  ok(`总评：${r.summary}`);

  const bad2 = gradeWriting('Dear Teacher, I am sorry. Thank you.', p1.minWords, p1.points);
  if (bad2.passed) bad('短文不该判为 passed');
  if (bad2.pointsHit >= 3) bad('短文要点数不该全覆盖');
  ok(`不合格短文：要点 ${bad2.pointsHit}/${bad2.pointsTotal}、通过=${bad2.passed}`);
  ok(`总评：${bad2.summary}`);
}

console.log(fail === 0 ? '\n✅ 全部通过：写作批改引擎工作正常' : `\n❌ ${fail} 处问题`);
process.exit(fail === 0 ? 0 : 1);
