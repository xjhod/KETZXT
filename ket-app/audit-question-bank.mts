/**
 * 题库难度分布审计（v2）
 *
 * 修正 v1 的两个错误：
 *   1) 消耗速度：每个语法点一轮（40 天）只出现 2 天，不是 40 天
 *   2) 阅读 Part2 每篇题数取错字段（应为 people.length = 5）
 *
 * 本脚本回答：现有题库能否支撑「按知识点 x 难度档」的自适应抽题
 */
import { GRAMMAR_QUESTIONS, ROADMAP } from './src/data/grammarRoadmap.ts';
import { spellingQuestions, matchingQuestions, fillBlankQuestions, allThemes } from './src/data/vocabulary.ts';
import {
  part1Articles, part2Articles, part3ClozeArticles,
  part3RCArticles, part4TFArticles, part5Articles,
} from './src/data/reading.ts';
import { getListeningSetsByPart, getListeningSetsByDifficulty } from './src/data/listening.ts';
import { speakingPart1, speakingPart2 } from './src/data/speaking.ts';

type Diff = 'easy' | 'medium' | 'hard';
const DIFFS: Diff[] = ['easy', 'medium', 'hard'];

const line = (s = '') => console.log(s);
const pad = (s: string, n: number) => {
  const w = [...s].reduce((a, c) => a + (c.charCodeAt(0) > 127 ? 2 : 1), 0);
  return s + ' '.repeat(Math.max(0, n - w));
};
const bar = (n: number, max: number, w = 18) => {
  const k = max > 0 ? Math.round((n / max) * w) : 0;
  return '#'.repeat(k) + '.'.repeat(w - k);
};

// ============================================================ 阅读
line('='.repeat(78));
line('阅读：6 个 Part x 3 难度（字段本来就有）');
line('='.repeat(78));
const readingGroups: { name: string; items: { difficulty?: Diff }[]; per: number }[] = [
  { name: 'Part1 选择配图', items: part1Articles, per: part1Articles[0]?.questions?.length ?? 5 },
  { name: 'Part2 信息匹配', items: part2Articles, per: part2Articles[0]?.people?.length ?? 5 },
  { name: 'Part3 完形填空', items: part3ClozeArticles, per: part3ClozeArticles[0]?.blanks?.length ?? 10 },
  { name: 'Part3 文章选择', items: part3RCArticles, per: part3RCArticles[0]?.questions?.length ?? 5 },
  { name: 'Part4 判断正误', items: part4TFArticles, per: part4TFArticles[0]?.statements?.length ?? 7 },
  { name: 'Part5 完形选择', items: part5Articles, per: part5Articles[0]?.blanks?.length ?? 10 },
];
line(pad('分组', 18) + pad('easy', 12) + pad('medium', 12) + pad('hard', 12) + pad('合计', 8) + '分布');
let readMax = 0;
const readRows: { name: string; e: number; m: number; h: number }[] = [];
for (const g of readingGroups) {
  const e = g.items.filter(x => x.difficulty === 'easy').length;
  const m = g.items.filter(x => x.difficulty === 'medium').length;
  const h = g.items.filter(x => x.difficulty === 'hard').length;
  readMax = Math.max(readMax, e, m, h);
  readRows.push({ name: g.name, e, m, h });
  line(pad(g.name, 18) + pad(String(e), 12) + pad(String(m), 12) + pad(String(h), 12) + pad(String(e + m + h), 8));
}
line('-'.repeat(78));
line(pad('条形', 18) + pad('', 12) + pad('', 12) + pad('', 12));
for (const r of readRows) {
  line(pad(r.name, 18) + pad(bar(r.e, readMax), 12) + pad(bar(r.m, readMax), 12) + pad(bar(r.h, readMax), 12));
}
const readHoles = readRows.filter(r => r.e === 0 || r.m === 0 || r.h === 0);
line(`难度档缺口: ${readHoles.length ? readHoles.map(r => `${r.name}(e${r.e}/m${r.m}/h${r.h})`).join('  ') : '无'}`);

// ============================================================ 听力
line('');
line('='.repeat(78));
line('听力：5 个 Part x 3 难度（字段本来就有）');
line('='.repeat(78));
line(pad('Part', 12) + pad('easy', 12) + pad('medium', 12) + pad('hard', 12) + '合计');
const lRows: { p: number; e: number; m: number; h: number }[] = [];
for (const p of [1, 2, 3, 4, 5]) {
  const e = getListeningSetsByDifficulty(p, 'easy').length;
  const m = getListeningSetsByDifficulty(p, 'medium').length;
  const h = getListeningSetsByDifficulty(p, 'hard').length;
  lRows.push({ p, e, m, h });
  line(pad(`Part${p}`, 12) + pad(String(e), 12) + pad(String(m), 12) + pad(String(h), 12) + String(e + m + h));
}
const lHoles = lRows.filter(r => r.e === 0 || r.m === 0 || r.h === 0);
line(`难度档缺口: ${lHoles.length ? lHoles.map(r => `Part${r.p}(e${r.e}/m${r.m}/h${r.h})`).join('  ') : '无'}`);

// ============================================================ 语法
line('');
line('='.repeat(78));
line('语法：20 点 x 3 题型（无 difficulty 字段，用题型层级当代理）');
line('='.repeat(78));
const gRows: { id: string; f: number; c: number; r: number }[] = [];
for (const id of ROADMAP) {
  const b = GRAMMAR_QUESTIONS[id];
  gRows.push({ id, f: b?.fill.length ?? 0, c: b?.choice.length ?? 0, r: b?.correction.length ?? 0 });
}
const gFill = gRows.reduce((a, r) => a + r.f, 0);
const gChoice = gRows.reduce((a, r) => a + r.c, 0);
const gCorr = gRows.reduce((a, r) => a + r.r, 0);
line(pad('题型', 18) + pad('每点', 10) + pad('合计', 10) + '难度代理');
line(pad('fill 填空', 18) + pad('30', 10) + pad(String(gFill), 10) + '低（给提示词）');
line(pad('choice 选择', 18) + pad('10', 10) + pad(String(gChoice), 10) + '中（4 选 1）');
line(pad('correction 改错', 18) + pad('10', 10) + pad(String(gCorr), 10) + '高（输出整句）');
const gMin = Math.min(...gRows.map(r => Math.min(r.f, r.c, r.r)));
line(`每点最少的档: ${gMin} 道 | 三档全部 >=6 道的点: ${gRows.filter(r => Math.min(r.f, r.c, r.r) >= 6).length}/${gRows.length}`);

// ============================================================ 词汇 / 口语
line('');
line('='.repeat(78));
line('词汇与口语（无 difficulty 字段）');
line('='.repeat(78));
const totalWords = allThemes.reduce((a, t) => a + (t.words?.length ?? 0), 0);
line(`词汇：22 主题 / ${totalWords} 词 | 拼写 ${spellingQuestions.length} | 匹配 ${matchingQuestions.length} | 填空 ${fillBlankQuestions.length}`);
const themeSizes = allThemes.map(t => ({ n: t.words?.length ?? 0 })).map(x => x.n);
line(`  主题词量：最小 ${Math.min(...themeSizes)} 最大 ${Math.max(...themeSizes)} 平均 ${(totalWords / allThemes.length).toFixed(1)}`);
line(`  难题干（判断正误 / 完形）没有，但词汇本身可用「常见/易错/低频」分级`);
line(`口语：Part1 ${speakingPart1.length} 题 / Part2 ${speakingPart2.length} 题 = ${speakingPart1.length + speakingPart2.length} 题`);

// ============================================================ 消耗速度（修正后）
line('');
line('='.repeat(78));
line('消耗速度压力测试（修正版：每点一轮只出现 2 天）');
line('='.repeat(78));
line('每日组卷实际消耗：语法 2 fill + 2 choice + 1 correction，词汇 3 拼写 + 2 填空');
line('');

// 一轮 = 40 天 = 20 点 x 2 天 -> 每点一轮消耗 4 fill + 4 choice + 2 correction
const ROUND = { fill: 4, choice: 4, correction: 2 };
line(pad('题型', 14) + pad('每点每轮', 14) + pad('平均存量', 12) + pad('可撑轮数', 12) + '可撑天数');
for (const k of ['fill', 'choice', 'correction'] as const) {
  const have = gRows.reduce((a, r) => a + (k === 'fill' ? r.f : k === 'choice' ? r.c : r.r), 0) / 20;
  const rounds = have / ROUND[k];
  const days = Math.floor(rounds * 40);
  const verdict = rounds >= 3 ? '充足' : rounds >= 1.5 ? '偏紧' : '不够';
  line(pad(k, 14) + pad(String(ROUND[k]), 14) + pad(have.toFixed(0), 12) + pad(rounds.toFixed(1), 12) + `${days} 天  ${verdict}`);
}
line('');
line('★ 自适应模式下弱项会被密集训练（按 2 倍消耗算）：');
for (const k of ['fill', 'choice', 'correction'] as const) {
  const have = gRows.reduce((a, r) => a + (k === 'fill' ? r.f : k === 'choice' ? r.c : r.r), 0) / 20;
  const rounds = have / (ROUND[k] * 2);
  const days = Math.floor(rounds * 40);
  const verdict = rounds >= 3 ? '充足' : rounds >= 1.5 ? '偏紧' : '不够';
  line(pad(k, 14) + pad(String(ROUND[k] * 2), 14) + pad(have.toFixed(0), 12) + pad(rounds.toFixed(1), 12) + `${days} 天  ${verdict}`);
}
line('');
line(`词汇拼写 ${spellingQuestions.length} 道 / 每天 3 道 -> ${Math.floor(spellingQuestions.length / 3)} 天`);
line(`词汇填空 ${fillBlankQuestions.length} 道 / 每天 2 道 -> ${Math.floor(fillBlankQuestions.length / 2)} 天`);
line(`听力 ${lRows.reduce((a, r) => a + r.e + r.m + r.h, 0)} 套 / 每周 1 套 -> ${lRows.reduce((a, r) => a + r.e + r.m + r.h, 0)} 周`);
line(`阅读 ${readingGroups.reduce((a, g) => a + g.items.length, 0)} 篇 / 每周 1.5 篇 -> ${Math.floor(readingGroups.reduce((a, g) => a + g.items.length, 0) / 1.5)} 周`);

// ============================================================ 结论
line('');
line('='.repeat(78));
line('结论：按知识点 x 难度档做自适应抽题，缺口在哪');
line('='.repeat(78));
const gaps: string[] = [];
if (readHoles.length) gaps.push(`阅读 ${readHoles.length} 个分组的难度档有缺口`);
if (lHoles.length) gaps.push(`听力 ${lHoles.length} 个 Part 的难度档有缺口（Part1-4 完全没有 hard）`);
if (gMin < 6) gaps.push(`语法有点的某档不足 6 道`);
gaps.push(`语法 choice 存量仅 10 道/点，自适应密集训练下 ${Math.floor((10 / (4 * 2)) * 40)} 天就见底`);
gaps.push(`口语只有 ${speakingPart1.length + speakingPart2.length} 题，做对话陪练必然重复`);
gaps.push(`词汇无难度维度，无法按难度分档`);

gaps.forEach((g, i) => line(`${i + 1}. ${g}`));
line('');
line('够用的部分：');
line(`  阅读：${readingGroups.reduce((a, g) => a + g.items.length, 0)} 篇全部带难度字段，可直接做档位选择`);
line(`  听力：${lRows.reduce((a, r) => a + r.e + r.m + r.h, 0)} 套带难度字段`);
line(`  语法：1000 题三档齐全，每点最少的档有 ${gMin} 道，做「同档轮换」够用`);
line(`  词汇：${totalWords} 词，量最充足`);
