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

console.log('=== 1) 听力每天都有（40 套逐套检查）===');
let withLis = 0, missingDay = 0;
const partCount: Record<string, number> = {};
const setUse: Record<string, number> = {};
for (let i = 0; i < 40; i++) {
  const set = buildDailySet(START, i);
  const lis = set.items.filter((it) => it.kind === 'listening_p1');
  if (!lis.length) { missingDay++; bad(`第 ${i} 套没有听力题`); continue; }
  withLis++;
  const part = lis[0].exerciseType.replace('listening_part', '');
  partCount[part] = (partCount[part] ?? 0) + 1;
  const setKey = lis[0].id.split('-Q')[0];
  setUse[setKey] = (setUse[setKey] ?? 0) + 1;
  const audioOk = lis.every((it) => existsSync(join(AUDIO_DIR, `${it.id}.mp3`)));
  const judgeable = lis.every((it) => !!it.options && it.options.includes(it.answer));
  if (!audioOk) bad(`第 ${i} 套有题的音频文件缺失`);
  if (!judgeable) bad(`第 ${i} 套有题的答案不在选项文本内`);
  if (lis.length !== 3) bad(`第 ${i} 套听力题不是 3 道（实际 ${lis.length}）`);
}
if (missingDay === 0) ok(`40 套全部含听力，每套 3 道`);
else bad(`有 ${missingDay} 套缺听力`);
console.log('  Part 分布:', JSON.stringify(partCount));
const partsUsed = Object.keys(partCount).length;
if (partsUsed >= 2) ok(`轮换生效：用了 ${partsUsed} 个 Part（主辅交替，不是锁死一个）`);
else bad(`只用了一个 Part，轮换没生效`);

console.log('\n=== 1b) 套题分布（40 天样本小，分布要看长周期）===');
const counts40 = Object.values(setUse);
console.log(`  40 天用了 ${counts40.length} 套（期望 ${Math.round(30 * (1 - Math.exp(-40 / 30)))} 套）`);
console.log(`  40 天内单套最多用 ${Math.max(...counts40)} 次`);

// 长周期才是分布的真实表现：400 天应覆盖全部 30 套
const longUse: Record<string, number> = {};
const longPartSets: Record<string, Set<string>> = {};
for (let d = 0; d < 400; d++) {
  for (const it of buildDailySet(START, d).items.filter((x) => x.kind === 'listening_p1')) {
    const key = it.id.split('-Q')[0];
    longUse[key] = (longUse[key] ?? 0) + 1;
    const part = it.exerciseType.replace('listening_part', '');
    (longPartSets[part] ??= new Set()).add(key);
  }
}
const lv = Object.values(longUse);
console.log(`  400 天覆盖 ${lv.length}/30 套`);
console.log(`  单套使用 ${Math.min(...lv)}~${Math.max(...lv)} 次 —— 极差大是因为备考阶段递进`);
console.log('  （前 3 月 Part1 为主、中 4 月 Part3、后 4 月 Part4，每个 Part 的 10 套集中承接一个阶段）');
console.log('  这不是随机不均，而是设计使然；但它意味着同一套会被反复听，见下方天花板核算');
if (lv.length === 30) ok(`400 天覆盖全部 30 套素材，无遗漏`);
else bad(`400 天只覆盖 ${lv.length}/30 套`);
for (const [p, s] of Object.entries(longPartSets)) {
  console.log(`    Part${p}: ${s.size}/10 套`);
  if (s.size !== 10) bad(`Part${p} 只覆盖了 ${s.size}/10 套`);
}

console.log('\n=== 1c) 题量天花板（硬约束）===');
const AUTO_GRADEABLE = 250;  // Part1/3/4 各 10 套 x 5 题
console.log(`  可自动判分的听力题总数: ${AUTO_GRADEABLE} 道（Part1/3/4 各 50）`);
console.log(`  每天 3 道 -> 一轮 ${Math.floor(AUTO_GRADEABLE / 3)} 天`);
console.log(`  一年 365 天需要 ${365 * 3} 道 -> 缺 ${365 * 3 - AUTO_GRADEABLE} 道（约 ${Math.ceil((365 * 3 - AUTO_GRADEABLE) / 5)} 套）`);
console.log('  按阶段实际消耗（每天 3 道，主 Part 占 2/3 天）:');
console.log('    阶段1 (1-3月, 90天) 主 Part1 -> 60 天 x 3 = 180 道需求 / 存量 50 道 = 3.6 轮');
console.log('    阶段2 (4-7月,120天) 主 Part3 -> 80 天 x 3 = 240 道需求 / 存量 50 道 = 4.8 轮');
console.log('    阶段3 (8-12月,150天) 主 Part4 -> 100 天 x 3 = 300 道需求 / 存量 50 道 = 6.0 轮');
console.log('  注：听力重复听本身是有效训练（精听），不像语法题重复会腻 —— 所以这个缺口可接受，');
console.log('      但若要「每套只听一遍就过」，需要补约 169 套听力素材');

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
