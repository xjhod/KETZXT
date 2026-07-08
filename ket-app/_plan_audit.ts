import { allThemes, fillBlankQuestions, matchingQuestions, spellingQuestions } from './src/data/vocabulary.ts';

console.log('=== allThemes 主题数 ===', allThemes.length);

// 各主题：id / 中文名 / 词数 / 内部重复 word id 数
console.log('\n=== 各主题词数 & 内部id冲突 ===');
for (const t of allThemes) {
  const ids = t.words.map(w => w.id);
  const dup = ids.length - new Set(ids).size;
  console.log(`${t.id}\t${t.nameZh}\t词:${ids.length}\t内部重复id:${dup}`);
}

// 全局 word id 冲突
const allIds = allThemes.flatMap(t => t.words.map(w => w.id));
console.log('\n总词数:', allIds.length, '全局重复word id:', allIds.length - new Set(allIds).size);

// 全局英文词重复（不同 id 但同 en）
const enMap = new Map<string, number>();
for (const t of allThemes) for (const w of t.words) enMap.set(w.en.toLowerCase(), (enMap.get(w.en.toLowerCase()) || 0) + 1);
const enDup = [...enMap.values()].filter(c => c > 1).reduce((a, c) => a + c - 1, 0);
console.log('全局重复英文词(同en不同id):', enDup);

// 派生题规模
console.log('\nspelling 题数:', spellingQuestions.length);
console.log('matching 题数:', matchingQuestions.length, '覆盖 themeId:', [...new Set(matchingQuestions.map(q => q.themeId))].join(','));
console.log('fillBlank 题数:', fillBlankQuestions.length);
console.log('fillBlank 样例:', JSON.stringify(fillBlankQuestions[0]));
