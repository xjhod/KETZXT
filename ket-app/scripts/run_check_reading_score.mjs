// 校验阅读开放填空（Part 5）判分：主答案 + 多答案 accept 都必须算对。
// 用 rolldown 打包纯函数后在内存执行（本机无 tsx，node strip-types 不解析无扩展名 import）。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (cond, msg) => {
  if (cond) { pass++; console.log('  PASS ' + msg); }
  else { fail++; console.error('  FAIL ' + msg); }
};

const bundle = await rolldown({ input: 'src/utils/readingScore.ts' });
const { output } = await bundle.generate({ format: 'esm', platform: 'node' });
const dataUrl = 'data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64');
const { isBlankCorrect, acceptedAnswers, acceptedAnswersLabel } = await import(dataUrl);

console.log('=== 1. 多答案判分（核心回归：主答案不能被 accept 排除）===');
const b1 = { answer: 'got', accept: ['received', 'obtained'] };
ok(isBlankCorrect('got', b1) === true, '主答案 answer "got" 判对（旧 bug 会判错）');
ok(isBlankCorrect('received', b1) === true, 'accept 答案 "received" 判对');
ok(isBlankCorrect('obtained', b1) === true, 'accept 答案 "obtained" 判对');
ok(isBlankCorrect('GOT', b1) === true, '主答案大写 "GOT" 判对（忽略大小写）');
ok(isBlankCorrect('  received  ', b1) === true, 'accept 答案带首尾空格判对');
ok(isBlankCorrect('wrong', b1) === false, '错误答案判错');
ok(isBlankCorrect('', b1) === false, '空回答判错');
ok(isBlankCorrect(undefined, b1) === false, 'undefined 判错不崩溃');

console.log('=== 2. 无 accept 的单答案空 ===');
const b2 = { answer: 'birthday' };
ok(isBlankCorrect('birthday', b2) === true, '单答案主答案判对');
ok(isBlankCorrect('BirthDay', b2) === true, '单答案忽略大小写');
ok(isBlankCorrect('cake', b2) === false, '单答案错误项判错');

console.log('=== 3. 可接受答案列表（判分与展示共用）===');
ok(JSON.stringify(acceptedAnswers(b1)) === JSON.stringify(['got', 'received', 'obtained']), 'acceptedAnswers 含主答案且顺序正确');
const bDup = { answer: 'like', accept: ['LIKE', ' enjoy ', 'enjoy', ''] };
ok(JSON.stringify(acceptedAnswers(bDup)) === JSON.stringify(['like', 'enjoy']), '去重(忽略大小写)+去空+trim');
ok(acceptedAnswersLabel(b1) === 'got / received / obtained', '展示串含全部答案且与判分一致');
ok(acceptedAnswersLabel(b2) === 'birthday', '单答案展示串正常');

console.log('=== 4. 真实数据抽样（读 reading.ts 的文本，验证主答案始终在可接受列表首位）===');
const readingSrc = readFileSync('src/data/reading.ts', 'utf8');
const lines = readingSrc.split(/\r?\n/).filter(l => /id:\s*"p5-\d+-b\d+"/.test(l));
let n = 0, withAccept = 0, answerMissing = 0;
for (const line of lines) {
  const answerM = line.match(/answer:\s*"([^"]*)"/);
  if (!answerM) continue;
  n++;
  const answer = answerM[1];
  const acceptM = line.match(/accept:\s*\[([^\]]*)\]/);
  const accepts = acceptM ? [...acceptM[1].matchAll(/"([^"]*)"/g)].map(x => x[1]) : [];
  if (accepts.length) withAccept++;
  // 用与页面相同的纯函数判定：主答案必须恒判对
  const blank = { answer, accept: accepts };
  if (!isBlankCorrect(answer, blank)) answerMissing++;
}
ok(n >= 200, `解析到 Part5 空 ${n} 条（应 ≥200）`);
ok(withAccept > 0, `其中带多答案的空 ${withAccept} 条`);
ok(answerMissing === 0, '全部空的主答案都能被判为正确（回归旧 bug）');

console.log(`\n结果: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) process.exit(1);
