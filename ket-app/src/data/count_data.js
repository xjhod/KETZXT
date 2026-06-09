const fs = require('fs');
const path = require('path');

// 读取文件
const reading = fs.readFileSync(path.join(__dirname, 'reading.ts'), 'utf8');
const vocabulary = fs.readFileSync(path.join(__dirname, 'vocabulary.ts'), 'utf8');
const grammar = fs.readFileSync(path.join(__dirname, 'grammar.ts'), 'utf8');
const listening = fs.readFileSync(path.join(__dirname, 'listening.ts'), 'utf8');

console.log('=== 阅读模块 ===');
console.log('Part1 文章数:', (reading.match(/id: 'p1-/g) || []).length);
console.log('Part2 文章数:', (reading.match(/id: 'p2-/g) || []).length);
console.log('Part3-1 文章数:', (reading.match(/id: 'p3c-/g) || []).length);
console.log('Part3-2 文章数:', (reading.match(/id: 'p3r-/g) || []).length);
console.log('Part4 文章数:', (reading.match(/id: 'p4-/g) || []).length);

console.log('\n=== 词汇模块 ===');
// 统计主题（allThemes 数组中的对象）
const themeMatch = vocabulary.match(/export const allThemes[\s\S]*?=\s*\[/);
if (themeMatch) {
  const startIdx = vocabulary.indexOf(themeMatch[0]) + themeMatch[0].length;
  let depth = 1;
  let endIdx = startIdx;
  for (let i = startIdx; i < vocabulary.length; i++) {
    if (vocabulary[i] === '[') depth++;
    if (vocabulary[i] === ']') { depth--; if (depth === 0) { endIdx = i; break; } }
  }
  const themeBlock = vocabulary.substring(startIdx, endIdx);
  const themeCount = (themeBlock.match(/id:/g) || []).length;
  console.log('主题数 (allThemes):', themeCount);
}

console.log('拼写题数 (spellingQuestions):', (vocabulary.match(/id: 'sp\d+/g) || []).length);
console.log('匹配题数 (matchingQuestions):', (vocabulary.match(/id: 'mt\d+/g) || []).length);
console.log('填空题数 (fillBlankQuestions):', (vocabulary.match(/id: 'fb\d+/g) || []).length);

console.log('\n=== 语法模块 ===');
console.log('语法点数 (grammarGxx):', (grammar.match(/export const grammarG\d+/g) || []).length);
console.log('填空题型数 (gxxFill):', (grammar.match(/export const g\d+Fill/g) || []).length);
console.log('选择题型数 (gxxChoice):', (grammar.match(/export const g\d+Choice/g) || []).length);
console.log('改错题型数 (gxxCorrect):', (grammar.match(/export const g\d+Correct/g) || []).length);

console.log('\n=== 听力模块 ===');
console.log('part1Sets 套数:', (listening.match(/export const part1Sets/g) || []).length);
const p1Items = (listening.match(/id: 'p1s-/g) || []).length;
const p2Items = (listening.match(/id: 'p2s-/g) || []).length;
const p3Items = (listening.match(/id: 'p3s-/g) || []).length;
const p4Items = (listening.match(/id: 'p4s-/g) || []).length;
const p5Items = (listening.match(/id: 'p5s-/g) || []).length;
console.log('Part1 题目数:', p1Items);
console.log('Part2 题目数:', p2Items);
console.log('Part3 题目数:', p3Items);
console.log('Part4 题目数:', p4Items);
console.log('Part5 题目数:', p5Items);
