// 校验作文分步精批：三维度纯函数（语法/词汇/结构）算分与点评、向后兼容、LLM 提示词接线。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('  FAIL ' + msg); } };

async function load(entry) {
  const b = await rolldown({ input: entry });
  const { output } = await b.generate({ format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64'));
}

const G = await load('src/data/writingGrader.ts');

const P = [
  { label: ' apologize', keywordGroups: [['sorry', 'apologize']], hint: '表达歉意' },
  { label: 'reason', keywordGroups: [['because', 'reason']], hint: '说明原因' },
  { label: 'question', keywordGroups: [['homework', 'question']], hint: '问一个问题' },
];

console.log('=== 1. 语法维度 assessGrammar ===');
const cleanIssues = [];
const gClean = G.assessGrammar(cleanIssues);
ok(gClean.score === 100, '无问题语法满分');
ok(gClean.comments.length === 1 && /没有发现/.test(gClean.comments[0]), '无问题给正向点评');
const badIssues = [
  { fragment: 'he go', message: '第三人称单数', suggestion: 'he goes' },
  { fragment: 'I is', message: '第一人称', suggestion: 'I am' },
];
const gBad = G.assessGrammar(badIssues);
ok(gBad.score === 76, `2处问题扣24分（得 ${gBad.score}）`);
ok(gBad.comments.length === 2 && /he go/.test(gBad.comments[0]), '点评引用原文片段+建议');

console.log('=== 2. 词汇维度 assessVocabulary ===');
const diverse = 'I like playing football and reading books with my friends at school every week';
const vDiverse = G.assessVocabulary(diverse, []);
ok(vDiverse.score >= 90, `用词多样分数高（得 ${vDiverse.score}）`);
ok(vDiverse.comments.some((c) => /变化/.test(c)), '提示用词有变化');
const repetitive = 'good very good nice good very nice good good good nice very good good';
const vRep = G.assessVocabulary(repetitive, []);
ok(vRep.score < 90, `重复堆砌扣分（得 ${vRep.score}）`);
ok(vRep.comments.some((c) => /重复|very/.test(c)), '提示重复用词');
const spelling = [{ fragment: 'recieve', message: '常见拼写错误', suggestion: 'receive' }];
const vSpell = G.assessVocabulary('I recieve a letter', spelling);
ok(vSpell.score < 100 && vSpell.comments.some((c) => /拼写/.test(c)), '拼写可疑点纳入词汇维度');
ok(G.assessVocabulary('short', []).comments.some((c) => /再多写/.test(c)), '太短时提示多写');

console.log('=== 3. 结构维度 assessStructure ===');
const emailGood = 'Dear Tom, I am sorry. Because I was ill, I stayed at home. How is your homework? Best wishes, Li Hua';
const sEmail = G.assessStructure(emailGood, 'email');
ok(sEmail.score === 100, `邮件格式齐全满分（得 ${sEmail.score}）`);
ok(sEmail.comments.some((c) => /开头和结尾格式正确/.test(c)), '邮件格式正确有正向点评');
const emailBad = 'I am sorry. I was ill. What about homework?';
const sBad = G.assessStructure(emailBad, 'email');
ok(sBad.score < 100 && sBad.comments.some((c) => /Dear/.test(c)), '邮件缺称呼扣分+提示');
ok(sBad.comments.some((c) => /连接词/.test(c)), '缺连接词有提示');
const story = 'One day I went to the park. Then I saw a dog. Finally we went home.';
const sStory = G.assessStructure(story, 'story');
ok(sStory.score === 100, `故事叙事信号齐全满分（得 ${sStory.score}）`);
ok(G.assessStructure('hello world', 'story').comments.some((c) => /1–2 句|句子/.test(c)), '句子太少有提示');

console.log('=== 4. gradeWriting 汇总含三维 ===');
const text = 'Dear Tom, I am sorry I can not come. Because I was ill yesterday. How is your homework? Best wishes, Li Hua';
const report3 = G.gradeWriting(text, 20, P, 'email');
ok(report3.dimensions !== undefined, '报告带 dimensions 字段');
ok(['grammar', 'vocabulary', 'structure'].every((k) => report3.dimensions[k] && typeof report3.dimensions[k].score === 'number'), '三维度齐全');
ok(report3.dimensions.grammar.score >= 0 && report3.dimensions.grammar.score <= 100, '分数在 0-100');
const report4 = G.gradeWriting(text, 20, P);
ok(report4.dimensions !== undefined, '不传 kind 也能出三维（默认 email，向后兼容）');
ok(report3.wordCount === report4.wordCount && report3.pointsHit === report4.pointsHit, '三维不影响原有判分');

console.log('=== 5. 接线断言（源码静态检查）===');
const llm = readFileSync('src/utils/llm.ts', 'utf8');
ok(/"grammarScore": 0-100/.test(llm) && /"vocabularyScore": 0-100/.test(llm) && /"structureScore": 0-100/.test(llm), 'LLM 提示词含三维度分');
ok(/grammarScore: typeof parsed\.grammarScore/.test(llm), 'LLM 结果解析映射三维度');
ok(/grammarScore\?: number/.test(llm), 'LlmWritingResult 三维字段可选（兼容旧存档）');
const page = readFileSync('src/pages/WritingPage.tsx', 'utf8');
ok(page.includes('<DimensionBars'), '作文页渲染三维分数条');
ok(/gradeWriting\(text, prompt\.minWords, prompt\.points, prompt\.kind\)/.test(page), 'gradeWriting 传入 kind');
ok(page.includes('report.dimensions'), '作文页读规则层三维');
ok(page.includes('llmResult.grammarScore'), '作文页读 LLM 三维');

console.log(`\n=== RESULT: pass=${pass} fail=${fail} ===`);
if (fail > 0) process.exit(1);
