// ========== 词汇造句 / 手写产出层校验 ==========
// 用法：node scripts/run_check_sentence.mjs （在 ket-app 目录下）
// rolldown 打包 TS 后以 data URL 在内存执行，避开 node 对无扩展名 import 的限制。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

async function loadTs(entry) {
  const bundle = await rolldown({ input: entry });
  const { output } = await bundle.generate({ format: 'esm' });
  const url = 'data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64');
  return import(url);
}

const m = await loadTs('src/utils/writtenProduction.ts');
const {
  normalizeWritten, isWrittenCorrect, containsTargetWord,
  validateVocabSentence, mergeWrittenSentences, MAX_WRITTEN_SENTENCES,
} = m;

let pass = 0;
let fail = 0;
function ok(name, cond, extra = '') {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra); }
}

console.log('--- 1. 归一化 / 整句比对 ---');
ok('大小写 + 空格 + 句末句号', normalizeWritten('  He  goes to school. ') === 'he goes to school');
ok('弯引号归一', normalizeWritten('It’s mine!') === "it's mine");
ok('语法手写：仅标点差异算对', isWrittenCorrect('He goes to school.', 'he goes to school'));
ok('语法手写：词形不同算错', !isWrittenCorrect('He go to school', 'he goes to school'));
ok('语法手写：空输入不算对', !isWrittenCorrect('', 'he goes to school'));

console.log('--- 2. 目标词识别（含屈折、词边界、短语）---');
const wordCases = [
  ['I play football', 'play', true],
  ['I played football yesterday.', 'play', true],
  ['She is playing now', 'play', true],
  ['The boxes are big', 'box', true],
  ['He studies English', 'study', true],
  ['I am running late', 'run', true],
  ['Making a cake', 'make', true],
  ['PLAY is fun', 'play', true],
  ['I like football', 'play', false],
  ['I paly football', 'play', false],
  ['The playground is big', 'play', false],
  ['as you know', 'a', false],
  ['a cat', 'a', true],
  ['I get up early', 'get up', true],
  ['I got up early', 'get up', false],
];
for (const [s, w, expected] of wordCases) {
  ok(`contains("${s}", "${w}")=${expected}`, containsTargetWord(s, w) === expected,
    `got ${containsTargetWord(s, w)}`);
}

console.log('--- 3. 造句校验（不判语法）---');
const sentCases = [
  ['', 'play', false, '空'],
  ['play', 'play', false, '只有一个词'],
  ['I play', 'play', true, '最短合法句'],
  ['I PLAY FOOTBALL!', 'play', true, '全大写'],
  ['I like it', 'play', false, '没用目标词'],
  ['I plai it', 'play', false, '拼错'],
  ['x'.repeat(161), 'play', false, '超长'],
  ['He plays football every day, and I watch.', 'play', true, '屈折 + 长句'],
];
for (const [s, w, expected, label] of sentCases) {
  const r = validateVocabSentence(s, w);
  ok(`${label} → ${expected}`, r.ok === expected, JSON.stringify(r));
}
// 明确不判语法：时态/主谓一致错误只要用到目标词就应通过
ok('不判语法：He play football 也通过', validateVocabSentence('He play football', 'play').ok);

console.log('--- 4. 全词库目标词匹配（防止 en 里特殊字符导致误伤）---');
const vocabSrc = readFileSync('src/data/vocabulary.ts', 'utf8');
const ens = [];
const re = /\ben:\s*(['"])(.*?)\1/g;
let mm;
while ((mm = re.exec(vocabSrc)) !== null) ens.push(mm[2]);
let bad = [];
for (const en of ens) {
  if (!validateVocabSentence(`I ${en} it today`, en).ok) bad.push(en);
}
console.log('  VOCAB_EN_TOTAL', ens.length, 'MATCH_FAIL', bad.length, bad.slice(0, 8));
ok('词库每个 en 都能被自己的句子识别', ens.length > 1000 && bad.length === 0, bad.slice(0, 8).join(','));

console.log('--- 5. 跨设备合并 ---');
const A = { id: 'a', createdAt: '2026-11-10T01:00:00Z' };
const B = { id: 'b', createdAt: '2026-11-10T02:00:00Z' };
const C = { id: 'c', createdAt: '2026-11-10T03:00:00Z' };
const merged = mergeWrittenSentences([A], [A, B, C]);
ok('按 id 去重且并集', merged.length === 3);
ok('按 createdAt 倒序', merged[0].id === 'c' && merged[2].id === 'a');
ok('旧同步包无 sentences 时保留本地', mergeWrittenSentences([A], []).length === 1);
const many = Array.from({ length: MAX_WRITTEN_SENTENCES + 20 }, (_, i) => ({
  id: `x${i}`, createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(),
}));
ok('截断到上限', mergeWrittenSentences([], many).length === MAX_WRITTEN_SENTENCES);

console.log('--- 6. 源码护栏（静态）---');
const store = readFileSync('src/store/useVocabStore.ts', 'utf8');
const sync = readFileSync('src/utils/sync.ts', 'utf8');
const page = readFileSync('src/pages/VocabToday.tsx', 'utf8');
const comp = readFileSync('src/components/WrittenProduction.tsx', 'utf8');
ok('store 初始 sentences 为空数组', /sentences:\s*\[\]/.test(store));
ok('store 有 saveSentence', /saveSentence:\s*\(input\)/.test(store));
ok('store reset 清空 sentences', /reset:[\s\S]{0,220}sentences:\s*\[\]/.test(store));
ok('sync 合并 sentences', /mergeWrittenSentences\(/.test(sync) && /\bsentences,/.test(sync));
ok('造句只在首学出现', /phase === 'learn' \? \([\s\S]{0,160}SentenceStep/.test(page));
ok('有跳过按钮', /跳过，下一题/.test(page));
ok('复习回看已接入', /PastSentences wordId=/.test(page));
ok('结算统计今日句子数', /writtenToday/.test(page));
// 写之前不能出现可照抄的英文例句：hint 块只给中文，英文例句只能出现在 reveal 块
const hintBlock = page.slice(page.indexOf('hint={'), page.indexOf('reveal={'));
const revealBlock = page.slice(page.indexOf('reveal={'), page.indexOf('onAccepted={(text)'));
ok('错两次的提示不含英文例句', !hintBlock.includes('word.example') && !hintBlock.includes('{example}'),
  hintBlock.slice(0, 160));
ok('词库英文例句只在写完后对照', revealBlock.includes('{example}') && !hintBlock.includes('{example}'));
ok('提示需错两次才显示', /attempts >= 2 && hint/.test(comp));
ok('对照只在通过之后显示', comp.indexOf('reveal &&') > comp.indexOf('!accepted ?'));

console.log('--- RESULT ---');
console.log(`PASS ${pass} / FAIL ${fail}`);
if (fail > 0) process.exit(1);
console.log('SENTENCE_CHECK_OK');
