// 校验错词 AI 助记：筛词阈值/排序/词表对齐、prompt 拼装、结果解析容错、
// LLM 调用接线、缓存 store 分片、UI 接线、手机防溢出。纯函数单测不联网。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('  FAIL ' + msg); } };

async function load(entry) {
  const b = await rolldown({ input: entry });
  const { output } = await b.generate({ format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64'));
}

const M = await load('src/utils/mnemonic.ts');
const V = await load('src/data/vocabulary.ts');

const W = (id, en, zh) => ({ id, en, zh, phonetic: 'f', example: 'ex', exampleZh: '例' });
const P = (wrong) => ({ wordId: 'w', themeId: 't', route: 'A', box: 1, dueAt: '2026-11-20', streak: 0, right: 0, wrong, lastSeen: null, firstLearnedAt: null, status: 'learning' });

console.log('=== 1. 常量 ===');
ok(M.MNEMONIC_MIN_WRONG === 3, '触发阈值 = 3');
ok(M.MNEMONIC_MAX_WORDS === 8, '展示上限 = 8');
ok(M.MNEMONIC_MAX_CHARS === 140, '长度上限 = 140');

console.log('=== 2. buildMnemonicUser prompt 拼装 ===');
const user = M.buildMnemonicUser({ en: 'apple', zh: '苹果', phonetic: '/ˈæpl/', example: 'I eat an apple.' });
ok(user.includes('apple') && user.includes('苹果'), '含英文与中文释义');
ok(user.includes('/ˈæpl/') && user.includes('I eat an apple.'), '含可选音标与例句');
const userMin = M.buildMnemonicUser({ en: 'run', zh: '跑' });
ok(!userMin.includes('undefined'), '缺可选字段不出现 undefined');
ok(userMin.includes('JSON'), '要求 JSON 输出');

console.log('=== 3. parseMnemonic 容错 ===');
ok(M.parseMnemonic('{"hint":"苹果谐音：阿婆"}') === '苹果谐音：阿婆', '标准 JSON');
ok(M.parseMnemonic('```json\n{"hint":"跑跑跑"}\n```') === '跑跑跑', 'markdown 代码块包裹');
ok(M.parseMnemonic('blah {"mnemonic":"用谐音记"} blah') === '用谐音记', '杂字符里抽 mnemonic 字段');
ok(M.parseMnemonic('{"hint":""}') === null, '空 hint 判失败');
ok(M.parseMnemonic('') === null, '空串判失败');
ok(M.parseMnemonic(null) === null, 'null 判失败');
ok(M.parseMnemonic('这里直接一句纯文本助记') === '这里直接一句纯文本助记', '纯文本兜底');
const long = M.parseMnemonic('{"hint":"' + '很'.repeat(300) + '"}');
ok(long && long.length <= M.MNEMONIC_MAX_CHARS, '超长截断到上限内');
const markdown = M.parseMnemonic('{"hint":"**谐音** `阿婆` #记"}');
ok(markdown && !/[*_#`]/.test(markdown), '清除 markdown 符号');

console.log('=== 4. sanitizeHint ===');
ok(M.sanitizeHint('  多  余   空格  ') === '多 余 空格', '压缩空白');
ok(M.sanitizeHint('```json{"hint":"x"}```') !== '', '去代码块标记不报错');

console.log('=== 5. buildWordIndex + pickHardWords ===');
const idx = M.buildWordIndex([{ id: 'T1', words: [W('w1', 'apple', '苹果'), W('w2', 'run', '跑')] }]);
ok(idx.size === 2 && idx.get('w1').en === 'apple', '索引按 wordId 建');
const progress = {
  w1: P(5), w2: P(3), ghost: P(9), // ghost 不在词表
  low: P(2), exact: P(3),
};
// exact 不在词表也被过滤；只留词表里的 w1/w2
const hard = M.pickHardWords({ w1: progress.w1, w2: progress.w2, ghost: progress.ghost }, idx);
ok(hard.length === 2, '只留词表里存在的难词（ghost 过滤）');
ok(hard[0].wordId === 'w1' && hard[0].wrong === 5, '按错次降序');
ok(hard[0].word.en === 'apple' && hard[0].word.zh === '苹果', '挂上词表 en/zh');
const threshold = M.pickHardWords({ a: P(2), b: P(3), c: P(4) }, new Map([['a', W('a', 'a', '甲')], ['b', W('b', 'b', '乙')], ['c', W('c', 'c', '丙')]]));
ok(threshold.length === 2 && !threshold.some((x) => x.wordId === 'a'), '错次<3 不入');
const capped = M.pickHardWords(
  Object.fromEntries(Array.from({ length: 12 }, (_, i) => ['w' + i, P(i + 3)])),
  new Map(Array.from({ length: 12 }, (_, i) => ['w' + i, W('w' + i, 'e' + i, '中' + i)]))
);
ok(capped.length === M.MNEMONIC_MAX_WORDS, `展示上限截断到 ${M.MNEMONIC_MAX_WORDS}`);
ok(M.countHardWords({ a: P(2), b: P(3), c: P(7) }) === 2, 'countHardWords 统计全部（不含截断）');
ok(M.countHardWords({}) === 0, 'countHardWords 空输入');

console.log('=== 6. 真实词表对齐 ===');
const realIdx = M.buildWordIndex(V.allThemes);
ok(realIdx.size > 1000, `真实词表索引 ${realIdx.size} 词（应 >1000）`);
const firstWord = V.allThemes[0].words[0];
ok(realIdx.get(firstWord.id)?.en === firstWord.en, '真实词 id 能反查到正确单词');

console.log('=== 7. 接线断言（源码静态检查）===');
const llm = readFileSync('src/utils/llm.ts', 'utf8');
ok(/export async function generateMnemonic/.test(llm), 'llm.ts 导出 generateMnemonic');
ok(llm.includes('parseMnemonic(res.text)'), 'generateMnemonic 用 parseMnemonic 解析');
const card = readFileSync('src/components/MnemonicCard.tsx', 'utf8');
ok(card.includes('pickHardWords') && card.includes('generateMnemonic'), '卡片接了筛词与生成');
ok(card.includes('useMnemonicStore') && card.includes('setHint'), '卡片读写缓存 store');
ok(card.includes('speakText'), '卡片带发音');
ok(card.includes('flex-wrap'), '卡片用 flex-wrap 防手机溢出');
const page = readFileSync('src/pages/VocabularyPage.tsx', 'utf8');
ok(page.includes('<MnemonicCard />'), '词汇页挂载了助记卡片');
const store = readFileSync('src/store/useMnemonicStore.ts', 'utf8');
ok(store.includes("name: 'ket-mnemonic-v1'"), '缓存 key 正确');
ok(store.includes('userScopedStorage'), '缓存按用户分片');
ok(!/from ['"].*sync/.test(store), '缓存不 import sync 模块');
const scoped = readFileSync('src/store/userScopedStorage.ts', 'utf8');
ok(scoped.includes("'ket-mnemonic-v1'"), '清理清单含助记缓存 key');

console.log(`\n=== RESULT: pass=${pass} fail=${fail} ===`);
if (fail > 0) process.exit(1);
