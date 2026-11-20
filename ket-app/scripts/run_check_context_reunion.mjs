// 校验语境重逢：匹配率、无编造、排序、高亮切分、变形容忍、空输入。
import { rolldown } from 'rolldown';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('  FAIL ' + msg); } };

async function load(entry) {
  const b = await rolldown({ input: entry });
  const { output } = await b.generate({ format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64'));
}

const CR = await load('src/utils/contextReunion.ts');
const V = await load('src/data/vocabulary.ts');
const R = await load('src/data/reading.ts');

const allWords = V.allThemes.flatMap((t) => t.words);
const W = (en, id = 'w') => ({ id, en, zh: en, phonetic: '', example: '', exampleZh: '' });

console.log('=== 1. 变形容忍 ===');
ok(CR.wordVariants('apple').includes('apples'), 'apple → apples');
ok(CR.wordVariants('bus').includes('buses'), 'bus → buses');
ok(CR.wordVariants('play').includes('played') && CR.wordVariants('play').includes('playing'), 'play → played/playing');
ok(CR.wordVariants('like').includes('liked') && CR.wordVariants('like').includes('liking'), 'like（e 结尾）→ liked/liking');
ok(CR.wordVariants('city').includes('cities'), 'city → cities');
ok(CR.wordVariants('').length === 0, '空词返回空变形');
ok(!CR.wordVariants('ice-cream').some((v) => v.includes(' ')), '带连字符的词不产生空格变形');

console.log('=== 2. 匹配：命中真实例子 ===');
const hits = CR.findReunionArticles([W('mother'), W('father'), W('sister')], 3);
ok(hits.length >= 1, 'mother/father/sister 至少命中 1 篇');
ok(hits[0].matchedWords.length >= 2, `最优篇命中 ${hits[0]?.matchedWords.length} 个词（应≥2）`);
ok(hits.every((h) => h.matchSpans.length > 0), '每个候选都有高亮片段');
ok(hits.every((h) => h.text.length > 0 && h.title.length > 0), '候选有正文与标题');

console.log('=== 3. 无编造：正文必须来自题库 ===');
const poolTexts = [
  ...R.part3RCArticles.map((a) => a.article), ...R.part4TFArticles.map((a) => a.article),
  ...R.part3ClozeArticles.map((a) => a.passageFull || a.passage), ...R.part5Articles.map((a) => a.passageFull || a.passage),
  ...R.part1Articles.map((a) => (a.sentences || []).join(' ')), ...R.part2Articles.map((a) => (a.texts || []).join(' ')),
].filter(Boolean);
ok(hits.every((h) => poolTexts.includes(h.text)), '所有返回正文逐字来自题库');

console.log('=== 4. 排序：连贯短文+多命中优先 ===');
const schoolHits = CR.findReunionArticles([W('school'), W('teacher'), W('student'), W('book')], 5);
ok(schoolHits.length >= 1, 'school 词组有推荐');
ok(schoolHits[0].coherent || schoolHits[0].matchedWords.length >= schoolHits[schoolHits.length - 1].matchedWords.length,
  '排序以命中数/连贯性优先');

console.log('=== 5. 高亮切分 ===');
const text = 'My mother and father are here.';
const spans = [{ start: 3, end: 9, word: 'mother' }, { start: 14, end: 20, word: 'father' }];
const parts = CR.splitHighlighted(text, spans);
ok(parts.map((p) => p.text).join('') === text, '切分后拼回原文无损');
ok(parts.filter((p) => p.highlight).map((p) => p.text).join(',') === 'mother,father', '高亮片段正确');
ok(CR.splitHighlighted('abc', []).length === 1 && !CR.splitHighlighted('abc', [])[0].highlight, '无匹配时整段不高亮');

console.log('=== 6. 边界：空输入/生僻词 ===');
ok(CR.findReunionArticles([], 1).length === 0, '空词表返回空');
ok(CR.findReunionArticles([W('')], 1).length === 0, '空字符串词返回空');
ok(CR.findReunionArticles([W('zzzzqqqq')], 1).length === 0, '不存在的词返回空');

console.log('=== 7. 真实覆盖率：22 主题 × 前 6 新词 ===');
let themesWithHit = 0, totalCandidates = 0, coherentFirst = 0;
for (const t of V.allThemes) {
  const fresh = t.words.slice(0, 6).map((w, i) => ({ ...w, id: `${t.id}-${i}` }));
  const rec = CR.findReunionArticles(fresh, 1);
  if (rec.length) { themesWithHit++; totalCandidates++; if (rec[0].coherent) coherentFirst++; }
}
ok(themesWithHit >= 20, `${themesWithHit}/22 主题能找到语境短文（应≥20）`);
console.log(`  覆盖 ${themesWithHit}/22 主题，其中 ${coherentFirst} 个首选是有译文的连贯短文`);

console.log(`\n结果: ${pass} PASS / ${fail} FAIL`);
if (fail) process.exit(1);
