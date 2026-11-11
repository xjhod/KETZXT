// ========== 语法 A 档校验（2026-11-10）==========
// 用法：node scripts/run_check_grammar_a.mjs （在 ket-app 目录下）
// 校验范围：真手写产出、讲解前置、错因标签、形式→意义判断题、零编造。
// B 档（dueAt / 熟练判定 / 交错）不在本脚本范围。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

async function loadTs(entry) {
  const bundle = await rolldown({ input: entry });
  const { output } = await bundle.generate({ format: 'esm' });
  const url = 'data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64');
  return import(url);
}

const gs = await loadTs('src/utils/grammarSession.ts');
const wp = await loadTs('src/utils/writtenProduction.ts');
const gr = await loadTs('src/data/grammarReading.ts');

let pass = 0;
let fail = 0;
function ok(name, cond, extra = '') {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra); }
}

const POINT_IDS = Array.from({ length: 20 }, (_, i) => `G${String(i + 1).padStart(2, '0')}`);

console.log('--- 1. 错因标签（从 explanation 派生，不生成解释文本）---');
const tagCases = [
  ['第三人称单数要加 s', '第三人称单数'],
  ['这里要用 be 动词 am/is/are', 'be 动词'],
  ['一般过去时的时间状语', '时态'],
  ['介词 in / on / at 的区别', '介词'],
  ['疑问句语序要倒装', '语序'],
  ['名词复数变化', '名词复数'],
  ['这句话没有特别说明', null],
  ['', null],
];
for (const [text, expected] of tagCases) {
  ok(`「${text}」→ ${expected}`, gs.errorTagFor(text) === expected, `got ${gs.errorTagFor(text)}`);
}

console.log('--- 2. 形式→意义判断题（精读真实句子，零编造）---');
let totalMeaning = 0;
let badMeaning = 0;
const seenIds = new Set();
for (const id of POINT_IDS) {
  const reading = gr.getReading(id);
  if (!reading) { badMeaning++; continue; }
  const qs = gs.buildMeaningQuestions(id, 2);
  totalMeaning += qs.length;
  const zhSet = new Set(reading.segments.map((s) => s.zh.trim()));
  const enSet = new Set(reading.segments.map((s) => s.en.trim()));
  for (const sq of qs) {
    const q = sq.q;
    if (seenIds.has(q.id)) badMeaning++;
    seenIds.add(q.id);
    if (sq.pType !== 'choice' || sq.purpose !== 'mixed') badMeaning++;
    if (!q.options?.includes(q.answer)) badMeaning++;
    if (!zhSet.has(q.answer)) badMeaning++;
    if (new Set(q.options).size !== q.options.length) badMeaning++;
    // 题干必须含该篇里真实存在的一句英文
    if (![...enSet].some((en) => q.question.includes(en))) badMeaning++;
  }
}
console.log('  MEANING_QUESTIONS', totalMeaning, 'BAD', badMeaning, 'UNIQUE_IDS', seenIds.size);
ok('20 个语法点都有精读语料', POINT_IDS.every((id) => gr.getReading(id)));
ok('意义题全部来自真实语料且选项不重复', badMeaning === 0, `bad=${badMeaning}`);
ok('意义题 id 全局唯一', seenIds.size === totalMeaning);

console.log('--- 3. 首日混合测验必含意义题（20 次随机）---');
let missed = 0;
let wrongLen = 0;
for (let i = 0; i < 20; i++) {
  const s = gs.generateSession({ points: {}, wrongList: [] });
  if (!s.mixed.some((x) => x.q.kind === 'meaning')) missed++;
  if (s.mixed.length !== 5) wrongLen++;
}
ok('20 次生成都含至少 1 道意义题', missed === 0, `missed=${missed}`);
ok('混合测验固定 5 题', wrongLen === 0, `wrongLen=${wrongLen}`);

console.log('--- 4. 手写判定（复用词汇造句的归一化层）---');
ok('忽略大小写与句末标点', wp.isWrittenCorrect('She likes dancing.', 'she likes dancing'));
ok('词形不同判错', !wp.isWrittenCorrect('She like dancing', 'She likes dancing.'));
ok('中文提示不算英文答案', !wp.isWrittenCorrect('她喜欢跳舞', 'She likes dancing.'));

console.log('--- 5. 源码护栏（静态）---');
const page = readFileSync('src/pages/GrammarDailyPage.tsx', 'utf8');
const card = readFileSync('src/components/GrammarQuestionCard.tsx', 'utf8');
const session = readFileSync('src/utils/grammarSession.ts', 'utf8');

ok('产出阶段接入真手写组件', /function ProductionWrite\(/.test(page) && /<ProductionWrite/.test(page));
ok('手写复用 WrittenProduction', /<WrittenProduction/.test(page) && /isWrittenCorrect\(t, answer\)/.test(page));
// B 档起手写计入「累计手写正确」（熟练证据之一），但仍不进 box / 排期
ok('手写只进累计手写正确、不进 box 排期', /if \(isProduction\) dc\.recordProduction\(sq\.grammarId, correct\)/.test(page)
  && /else dc\.recordQuestion\(sq\.grammarId, correct\)/.test(page)
  && /recordAnswer\(curQuestions\[qIdx\], correct, text, true\)/.test(page));
ok('手写可跳过', /done \? '继续 →' : '跳过，继续 →'/.test(page));
ok('两次失败后才给看答案按钮', /实在想不起来，看正确写法/.test(page)
  && /showAnswer/.test(page));
ok('写完后才展示正确写法', /reveal=\{[\s\S]{0,300}正确写法：\{answer\}/.test(page));
ok('讲解前置：先看规则卡', /先看规则/.test(page) && /先看规则，再读例句/.test(page));
ok('看完讲解才出学习题', /learnQuizStarted/.test(page)
  && /currentPhase === 'learn' && !learnQuizStarted/.test(page));
ok('精读小注默认收起、点句才展开', /activeSeg === i && seg\.note/.test(page)
  && !/\{seg\.note && \(/.test(page));
ok('规则卡取正例与反例（现有数据）', /point\.examples\?\.\[0\]\?\.en/.test(page)
  && /GRAMMAR_QUESTIONS\[session\.learn\.pointId\]\?\.correction/.test(page));
ok('答题反馈加错因标签', /errorTagFor\(q\.explanation\)/.test(card) && /这类题多错在/.test(card));
ok('意义题单独保留不被截断', /5 - meaningQs\.length/.test(session));
ok('A 档注明不动云同步', /不动云同步/.test(session));

console.log('--- RESULT ---');
console.log(`PASS ${pass} / FAIL ${fail}`);
if (fail > 0) process.exit(1);
console.log('GRAMMAR_A_CHECK_OK');
