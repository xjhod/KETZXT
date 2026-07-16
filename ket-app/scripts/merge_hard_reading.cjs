// 把 readingHard.ts 的 6 个较难数组展开并入 reading.ts 对应数组末尾。
const fs = require('fs');
const p = 'src/data/reading.ts';
let s = fs.readFileSync(p, 'utf8');

const importLine =
  "import { part1Hard, part2Hard, part3ClozeHard, part3RCHard, part4TFHard, part5Hard } from './readingHard';\n";
const marker = '// ==================== 类型定义 ====================';
if (!s.includes(importLine)) {
  s = s.replace(marker, importLine + '\n' + marker);
} else {
  console.log('import already present, skip');
}

const pairs = [
  ['export const part1Articles: Part1Article[] = [', 'part1Hard'],
  ['export const part2Articles: Part2Article[] = [', 'part2Hard'],
  ['export const part3ClozeArticles: Part3ClozeArticle[] = [', 'part3ClozeHard'],
  ['export const part3RCArticles: Part3RCArticle[] = [', 'part3RCHard'],
  ['export const part4TFArticles: Part4TFArticle[] = [', 'part4TFHard'],
  ['export const part5Articles: Part5Article[] = [', 'part5Hard'],
];

for (const [start, hard] of pairs) {
  if (s.includes(`...${hard},`)) {
    console.log(`${hard} already merged, skip`);
    continue;
  }
  const idx = s.indexOf(start);
  if (idx < 0) throw new Error('not found: ' + start);
  // 找数组字面量的 '= ['（类型里的 Part1Article[] 不算）
  const eq = s.indexOf('= [', idx);
  const open = s.indexOf('[', eq);
  let depth = 0;
  let i = open;
  for (; i < s.length; i++) {
    const ch = s[i];
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) break;
    }
  }
  // i = index of the array's closing ']'
  // 判断 ']' 前最后一个非空白字符：若是 '}' 说明末元素无尾随逗号，需补 ','；若是 ',' 则不补
  const lastNonWs = s.slice(0, i).replace(/\s+$/, '').slice(-1);
  const needComma = lastNonWs !== ',';
  const insert = (needComma ? ',\n' : '\n') + `  ...${hard},\n`;
  s = s.slice(0, i) + insert + s.slice(i);
  console.log(`merged ${hard} before index ${i} (needComma=${needComma})`);
}

fs.writeFileSync(p, s);
console.log('DONE');
