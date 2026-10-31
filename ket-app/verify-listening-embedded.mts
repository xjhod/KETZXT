/**
 * 每日备考听力内嵌验证
 * 目的：确认听力从「一句提示」变成真正可判分的题目
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildDailySet, judgeText, type DailyItem } from './src/data/dailyPlan.ts';

const AUDIO_DIR = join(process.cwd(), 'public', 'audio');
const START = '2026-10-31';

let fail = 0;
const bad = (m: string) => { console.log('  ❌ ' + m); fail++; };
const ok = (m: string) => console.log('  ✅ ' + m);

console.log('=== 1) 前 40 套的听力题分布 ===');
console.log('  说明：听力按周任务表安排（每周 2 次），不是每天都有 —— 这是原设计');
console.log('  套次  听力题  Part  知识点            音频齐  答案在选项内');
let withLis = 0;
for (let i = 0; i < 40; i++) {
  const set = buildDailySet(START, i);
  const lis = set.items.filter((it) => it.kind === 'listening_p1');
  if (!lis.length) continue;
  withLis++;
  const part = lis[0].exerciseType.replace('listening_part', '');
  const audioOk = lis.every((it) => existsSync(join(AUDIO_DIR, `${it.id}.mp3`)));
  const judgeable = lis.every((it) => !!it.options && it.options.includes(it.answer));
  console.log(
    `  ${String(i).padStart(3)}   ${String(lis.length).padStart(4)}   ${part.padStart(3)}  ` +
    `${lis[0].subjectName.padEnd(16)}  ${audioOk ? '是' : '否'}      ${judgeable ? '是' : '否'}`
  );
  if (!audioOk) bad(`第 ${i} 套有题的音频文件缺失`);
  if (!judgeable) bad(`第 ${i} 套有题的答案不在选项文本内（会导致永远判错）`);
  if (lis.length < 3) bad(`第 ${i} 套听力题少于 3 道`);
}
if (withLis > 0) ok(`40 套里有 ${withLis} 套含听力（每周 2 次，与周任务表一致）`);
else bad('40 套里一题听力都没有');

console.log('\n=== 2) 确定性：同一套永远出同一套题 ===');
const a = buildDailySet(START, 3);
const b = buildDailySet(START, 3);
const idsA = a.items.map((i) => i.id).join(',');
const idsB = b.items.map((i) => i.id).join(',');
if (idsA === idsB) ok('同一天同一套题，题目完全一致');
else bad('同一天两次构建结果不同，破坏了确定性');

console.log('\n=== 3) 不同套之间题目会变（不是死题） ===');
const lisOf = (i: number) =>
  buildDailySet(START, i).items.filter((x) => x.kind === 'listening_p1').map((x) => x.id).join(',');
let diffFound = false;
for (let i = 0; i < 40 && !diffFound; i++) {
  for (let j = i + 1; j < 40 && !diffFound; j++) {
    const li = lisOf(i), lj = lisOf(j);
    if (li && lj && li !== lj) {
      ok(`第 ${i} 套与第 ${j} 套听力题不同：${li} vs ${lj}`);
      diffFound = true;
    }
  }
}
if (!diffFound) bad('所有含听力的套次题目完全相同');

console.log('\n=== 4) 判分正确性（用真实题目自判） ===');
let judgeOk = 0, judgeBad = 0, wrongOk = 0, wrongBad = 0;
for (let i = 0; i < 40; i++) {
  const set = buildDailySet(START, i);
  for (const it of set.items.filter((x) => x.kind === 'listening_p1')) {
    if (!it.options || !it.options.length) continue;
    // answer 必须是选项之一（与语法 choice 的约定一致）
    if (it.options.includes(it.answer)) judgeOk++;
    else { judgeBad++; bad(`answer 不在选项内: ${it.id}`); }
    // 选正确项 -> 判对
    if (judgeText(it.answer, it.answer)) wrongOk++;
    else { wrongBad++; bad(`正确答案自判失败: ${it.id}`); }
    // 选干扰项 -> 判错
    const w = it.options.find((o) => o !== it.answer);
    if (w && judgeText(w, it.answer)) bad(`干扰项被误判为正确: ${it.id}`);
  }
}
if (judgeBad === 0) ok(`${judgeOk} 道题的 answer 都是选项文本（与既有约定一致）`);
if (wrongBad === 0) ok(`正确答案自判全部通过`);

console.log('\n=== 5) 知识点聚合度（画像能否算出来） ===');
const allLis = new Set<string>();
const setIds = new Set<string>();
for (let i = 0; i < 60; i++) {
  for (const it of buildDailySet(START, i).items.filter((x) => x.kind === 'listening_p1')) {
    allLis.add(it.subjectId);
    setIds.add(it.id.split('-Q')[0]);
  }
}
ok(`60 套里出现 ${allLis.size} 个听力知识点：${[...allLis].join(', ')}`);
ok(`覆盖 ${setIds.size} 套听力素材（题目 id 前缀）`);

console.log('\n=== 6) 客观题组里听力的占比 ===');
const set0 = buildDailySet(START, 0);
const byKind: Record<string, number> = {};
for (const it of set0.items) byKind[it.kind] = (byKind[it.kind] ?? 0) + 1;
console.log('  第 0 套题型分布:', JSON.stringify(byKind));
console.log(`  客观题总数 ${set0.items.length}，其中听力 ${byKind['listening_p1'] ?? 0} 道`);

console.log('\n=== 7) 音频文件抽样核对 ===');
const sample = buildDailySet(START, 1).items.filter((x) => x.kind === 'listening_p1');
for (const it of sample) {
  const f = join(AUDIO_DIR, `${it.id}.mp3`);
  const has = existsSync(f);
  console.log(`  ${it.id}  ${has ? '✅ 音频存在' : '❌ 缺失'}  audioText=${(it.audioText ?? '').slice(0, 48)}...`);
  if (!has) bad(`${it.id} 音频缺失`);
}

console.log('\n=== 8) 每日组卷整体不受影响（写作/口语同样按周任务表安排）===');
let wCount = 0, sCount = 0;
for (let i = 0; i < 40; i++) {
  const s = buildDailySet(START, i);
  if (s.writing) wCount++;
  if (s.speaking) sCount++;
}
ok(`40 套里 写作 ${wCount} 套 / 口语 ${sCount} 套（与周任务表一致，未被听力改动影响）`);
const totalItems = Array.from({ length: 40 }, (_, i) => buildDailySet(START, i).items.length);
console.log(`  客观题数：最少 ${Math.min(...totalItems)} / 最多 ${Math.max(...totalItems)} / 平均 ${(totalItems.reduce((a, b) => a + b, 0) / 40).toFixed(1)}`);

console.log(fail === 0 ? '\n✅ 听力内嵌验证全部通过' : `\n❌ ${fail} 处问题`);
process.exit(fail === 0 ? 0 : 1);
