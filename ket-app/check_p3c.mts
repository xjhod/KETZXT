// 校验 part3ClozeArticles（完形填空）— KET 标准模型：每组 10 空 × 3 选项(A/B/C)
// 维度：每组 10 空、每空 3 选项、positions 连续 1..10、占位符数字==positions、
//       blank id 组内/跨组唯一、answer∈options、options 无重复、explanation 非空。
import * as data from './src/data/reading.ts';

const articles = data.part3ClozeArticles as any[];
let hardFail = 0;
let softWarn = 0;
const issues: string[] = [];
const allIds = new Set<string>();
const dup: string[] = [];
const optsLen: Record<number, number> = {};
const diff: Record<string, number> = {};
const PH = /\(\d+\)\s*____/g;

for (const a of articles) {
  const p = `[${a.id}] `;
  const phNums = (a.passage.match(PH) || []).map(s => parseInt(s.replace(/[()]/g, ''), 10));
  const bCount = (a.blanks || []).length;
  if (bCount !== 10) { hardFail++; issues.push(`${p}空数=${bCount} (KET 标准应为10)`); }
  if (phNums.length !== bCount) { hardFail++; issues.push(`${p}占位符数(${phNums.length}) != blanks(${bCount})`); }
  const expected = Array.from({ length: bCount }, (_, i) => i + 1);
  const positions = (a.blanks || []).map(b => b.position).slice().sort((x, y) => x - y);
  if (bCount === 10 && JSON.stringify(positions) !== JSON.stringify(expected)) { hardFail++; issues.push(`${p}positions=[${positions}] 不连续`); }
  if (bCount === 10 && JSON.stringify(phNums) !== JSON.stringify(expected)) { hardFail++; issues.push(`${p}占位符=[${phNums}] 与 positions 不一致 → 渲染错位`); }
  const gids = new Set<string>();
  for (const b of (a.blanks || [])) {
    if (gids.has(b.id)) { hardFail++; issues.push(`${p}组内 id 重复 ${b.id}`); }
    gids.add(b.id);
    if (allIds.has(b.id)) dup.push(b.id);
    allIds.add(b.id);
    const olen = Array.isArray(b.options) ? b.options.length : 0;
    optsLen[olen] = (optsLen[olen] || 0) + 1;
    if (olen !== 3) { hardFail++; issues.push(`${p}${b.id} 选项数=${olen} (应为3)`); }
    if (!Array.isArray(b.options) || !b.options.includes(b.answer)) { hardFail++; issues.push(`${p}${b.id} answer="${b.answer}" 不在 options`); }
    if (olen > 0 && new Set(b.options).size !== olen) { hardFail++; issues.push(`${p}${b.id} options 重复: [${b.options.join('|')}]`); }
    if (!b.explanation || !String(b.explanation).trim()) { softWarn++; issues.push(`${p}${b.id} 缺解析`); }
  }
  diff[a.difficulty] = (diff[a.difficulty] || 0) + 1;
}

if (dup.length) { hardFail++; issues.push(`跨组 id 重复: [${[...new Set(dup)].join(', ')}]`); }

const total = articles.reduce((s, a) => s + a.blanks.length, 0);
console.log(`组数=${articles.length}`);
console.log(`总空数=${total}`);
console.log(`选项长度分布: ${Object.entries(optsLen).map(([k, v]) => `${k}:${v}`).join(', ')}`);
console.log(`难度分布: ${Object.entries(diff).map(([k, v]) => `${k}:${v}`).join(', ')}`);
console.log(`含 hard 难度: ${(diff['hard'] || 0) > 0 ? '是' : '否(建议补充)'}`);
console.log(`KET 标准: 10空×3选项(A/B/C)`);
console.log(`硬 FAIL=${hardFail}; 软告警=${softWarn}`);
if (issues.length) { console.log('问题:'); issues.forEach(i => console.log('  - ' + i)); }
console.log(hardFail === 0 ? 'ALL OK (KET 标准结构通过)' : '有硬错误，需修复');
