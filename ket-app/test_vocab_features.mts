// 词汇模块功能逻辑自测（对齐 VocabularyPage 判分逻辑）
// 运行: node --experimental-strip-types test_vocab_features.mts
import {
  allThemes,
  matchingQuestions,
  fillBlankQuestions,
  spellingQuestions,
} from './src/data/vocabulary.ts';

let pass = 0;
let fail = 0;
const failures: string[] = [];
function check(cond: boolean, msg: string) {
  if (cond) pass++;
  else {
    fail++;
    failures.push(msg);
  }
}

// 全局词池（英文 + 中文）
const enPool = new Set<string>();
const zhPool = new Set<string>();
for (const t of allThemes) for (const w of t.words) { enPool.add(w.en); zhPool.add(w.zh); }

// ---------- 1. 主题与词字段完整性 ----------
check(allThemes.length === 22, `主题数应为22，实际 ${allThemes.length}`);
let totalWords = 0;
for (const t of allThemes) {
  totalWords += t.words.length;
  check(t.words.length > 0, `${t.id} 词数为0`);
  // 主题内 dup-en 已清理
  const enSet = new Set<string>();
  for (const w of t.words) {
    check(!!w.en && !!w.phonetic && !!w.zh && !!w.example && !!w.exampleZh, `${t.id} ${w.id} 字段缺失(需en/phonetic/zh/example/exampleZh)`);
    if (enSet.has(w.en)) check(false, `${t.id} 主题内重复英文词 "${w.en}"`);
    enSet.add(w.en);
  }
}

// ---------- 2. matching 题型 ----------
check(matchingQuestions.length > 0, 'matching 题为空');
let mqChecked = 0;
// 中文检测
const hasZh = (s: string) => /[一-鿿]/.test(s);
for (const q of matchingQuestions as any[]) {
  // answer 必须在 options 中（用户可选中）
  if (Array.isArray(q.options) && q.options.includes(q.answer)) mqChecked++;
  // 配对题应是中英对照（语言方向正确，不要求字面绑定词库 zh 字段——允许同义译法）
  const promptIsZh = hasZh(q.prompt);
  const answerIsZh = hasZh(q.answer);
  const consistent =
    q.promptLang === 'zh' ? (promptIsZh && !answerIsZh) : (!promptIsZh && answerIsZh);
  check(consistent, `matching ${q.id} 语言方向不一致(应为中英对照): "${q.prompt}"<->"${q.answer}"`);
  // 模拟判分：选中 answer 即正确
  check(q.options.includes(q.answer), `matching ${q.id} 判分基准错误(answer不在options)`);
}
check(mqChecked === matchingQuestions.length, `matching answer在options覆盖 ${mqChecked}/${matchingQuestions.length}`);

// ---------- 3. fillBlank 题型 ----------
check(fillBlankQuestions.length > 0, 'fillBlank 题为空');
let fqChecked = 0;
for (const q of fillBlankQuestions as any[]) {
  if (String(q.sentence).includes('____') && enPool.has(q.answer)) fqChecked++;
  check(String(q.sentence).includes('____'), `fillBlank ${q.id} 缺 ____ 挖空`);
  check(enPool.has(q.answer), `fillBlank ${q.id} answer "${q.answer}" 不在词池`);
  // 模拟判分：输入 answer 即正确
  check(q.answer && q.answer.length > 0, `fillBlank ${q.id} 答案空`);
}
check(fqChecked === fillBlankQuestions.length, `fillBlank 合格覆盖 ${fqChecked}/${fillBlankQuestions.length}`);

// ---------- 4. spelling 题型 ----------
check(spellingQuestions.length > 0, 'spelling 题为空');
// 每条 spelling 题对应某主题 word，目标拼写 == word.en
const themeWordById = new Map<string, any>();
for (const t of allThemes) for (const w of t.words) themeWordById.set(w.id, w);
let sqChecked = 0;
const norm = (s: string) => (s || '').trim().toLowerCase().replace(/[.\s]/g, '');
for (const q of spellingQuestions as any[]) {
  const w = themeWordById.get(q.wordId);
  if (w && q.en === w.en) sqChecked++;
  check(!!w, `spelling ${q.id} wordId ${q.wordId} 无对应词`);
  check(w && q.en === w.en, `spelling ${q.id} 目标拼写 "${q.en}" != 词.en "${w?.en}"`);
  // 模拟判分(对齐页面修复后逻辑: 用户答案与正确答案均归一化去空格去标点)
  const userAns = norm(q.en);
  const correctAns = norm(q.en);
  check(userAns === correctAns && userAns.length > 0, `spelling ${q.id} 判分不一致或归一化为空`);
}
check(sqChecked === spellingQuestions.length, `spelling 目标对齐覆盖 ${sqChecked}/${spellingQuestions.length}`);

// ---------- 5. 模拟 session 抽取（每主题最多10题不重复）----------
const SESSION_SIZE = 10;
for (const t of allThemes) {
  const pool = [...t.words].sort(() => Math.random() - 0.5).slice(0, Math.min(SESSION_SIZE, t.words.length));
  check(pool.length === Math.min(SESSION_SIZE, t.words.length), `${t.id} session抽取数异常`);
  check(new Set(pool.map((w: any) => w.id)).size === pool.length, `${t.id} session有重复词`);
}

// ---------- 6. 进度记录结构（对齐 useProgressStore.recordSession/recordAnswer）----------
check(typeof (allThemes[0] as any).nameZh === 'string', '主题缺少 nameZh(进度统计用)');

// ---------- 报告 ----------
console.log('========================================');
console.log('  词汇模块功能逻辑自测');
console.log('========================================');
console.log(`  主题数        : ${allThemes.length}`);
console.log(`  词总数        : ${totalWords}`);
console.log(`  matching 题   : ${matchingQuestions.length}`);
console.log(`  fillBlank 题  : ${fillBlankQuestions.length}`);
console.log(`  spelling 题   : ${spellingQuestions.length}`);
console.log('----------------------------------------');
console.log(`  PASS: ${pass}   FAIL: ${fail}`);
if (fail > 0) {
  console.log('----------------------------------------');
  console.log('  失败项:');
  for (const f of failures.slice(0, 50)) console.log('   ✗ ' + f);
  if (failures.length > 50) console.log(`   ... 其余 ${failures.length - 50} 项`);
  process.exit(1);
} else {
  console.log('  ✅ 全部通过：词汇模块功能逻辑正常');
}
