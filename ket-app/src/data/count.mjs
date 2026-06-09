import fs from 'fs';
import path from 'path';

const DIR = '.';

function readFile(name) {
  return fs.readFileSync(path.join(DIR, name), 'utf8');
}

function countIds(content, prefix) {
  // 统计形如  id: 'PREFIXxxx' 的数量
  const re = new RegExp('id:\\s*\\'' + prefix, 'g');
  return (content.match(re) || []).length;
}

function countArrayItems(content, arrayName) {
  // 找到数组开始位置，统计其中 id: 的数量
  const re = new RegExp('export const ' + arrayName + '\\s*=\\s*\\[');
  const m = content.match(re);
  if (!m) return 0;
  const idx = content.indexOf(m[0]) + m[0].length;
  let depth = 1;
  let end = idx;
  for (let i = idx; i < content.length; i++) {
    if (content[i] === '[') depth++;
    if (content[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
  }
  const block = content.substring(idx, end);
  return (block.match(/id:\s*'/g) || []).length;
}

function countGrammarQuestions(content, gNum, suffix) {
  const re = new RegExp('export const g' + gNum + suffix, 'g');
  const matches = content.match(re) || [];
  if (matches.length === 0) return 0;
  // 找到第一个匹配的位置，提取数组内容统计 id:
  const mIdx = content.indexOf(matches[0]);
  const arrStart = content.indexOf('[', mIdx);
  if (arrStart === -1) return 0;
  let depth = 1;
  let end = arrStart + 1;
  for (let i = arrStart + 1; i < content.length; i++) {
    if (content[i] === '[') depth++;
    if (content[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
  }
  const block = content.substring(arrStart, end);
  return (block.match(/id:\s*'/g) || []).length;
}

const reading = readFile('reading.ts');
console.log('=== 阅读模块 ===');
const rP1 = countIds(reading, 'p1-');
const rP2 = countIds(reading, 'p2-');
const rP3c = countIds(reading, 'p3c-');
const rP3r = countIds(reading, 'p3r-');
const rP4 = countIds(reading, 'p4-');
console.log(`Part1: ${rP1} 篇 (目标30篇)`);
console.log(`Part2: ${rP2} 篇 (目标30篇)`);
console.log(`Part3-1: ${rP3c} 篇 (目标30篇)`);
console.log(`Part3-2: ${rP3r} 篇 (目标30篇)`);
console.log(`Part4: ${rP4} 篇 (目标30篇)`);
console.log(`阅读合计: ${rP1+rP2+rP3c+rP3r+rP4} 篇 (目标150篇)`);

const vocabulary = readFile('vocabulary.ts');
console.log('\n=== 词汇模块 ===');
const vThemes = countArrayItems(vocabulary, 'allThemes');
console.log(`主题数: ${vThemes} 个 (目标21个)`);
const vSpell = countArrayItems(vocabulary, 'spellingQuestions');
console.log(`拼写题: ${vSpell} 题 (目标1500题)`);
const vMatch = countArrayItems(vocabulary, 'matchingQuestions');
console.log(`匹配题: ${vMatch} 题 (目标1050题)`);
const vFill = countArrayItems(vocabulary, 'fillBlankQuestions');
console.log(`填空题: ${vFill} 题 (目标1050题)`);
console.log(`词汇合计: ${vSpell+vMatch+vFill} 题 (目标3600题)`);

const grammar = readFile('grammar.ts');
console.log('\n=== 语法模块 ===');
const gPoints = (grammar.match(/export const grammarG\d+/g) || []).length;
console.log(`语法点数: ${gPoints} 个 (目标20个)`);
let gFillTotal = 0, gChoiceTotal = 0, gCorrectTotal = 0;
for (let i = 1; i <= 20; i++) {
  const g = String(i).padStart(2, '0');
  gFillTotal += countGrammarQuestions(grammar, g, 'Fill\\[');
  gChoiceTotal += countGrammarQuestions(grammar, g, 'Choice\\[');
  gCorrectTotal += countGrammarQuestions(grammar, g, 'Correct\\[');
}
console.log(`填空题型: ${gFillTotal} 题 (目标1000题中部分)`);
console.log(`选择题型: ${gChoiceTotal} 题`);
console.log(`改错题型: ${gCorrectTotal} 题`);
console.log(`语法合计(练习): ${gFillTotal+gChoiceTotal+gCorrectTotal} 题 (目标2000题)`);

const listening = readFile('listening.ts');
console.log('\n=== 听力模块 ===');
const l1 = countIds(listening, "L1-');
const l2 = countIds(listening, "L2-');
const l3 = countIds(listening, "L3-");
const l4 = countIds(listening, "L4-");
const l5 = countIds(listening, "L5-");
console.log(`Part1: ${l1} 套 (目标15套)`);
console.log(`Part2: ${l2} 套 (目标15套)`);
console.log(`Part3: ${l3} 套 (目标15套)`);
console.log(`Part4: ${l4} 套 (目标15套)`);
console.log(`Part5: ${l5} 套 (目标15套)`);
console.log(`听力合计: ${l1+l2+l3+l4+l5} 套 (目标75套)`);
