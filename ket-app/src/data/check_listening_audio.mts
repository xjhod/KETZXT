// 检查听力各 Part 实际请求的音频文件是否都存在。
// 模拟 ListeningPage 里 playAudioFile(id) 的调用，逐 id 比对 public/audio/{id}.mp3。
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { part1Sets, part2Sets, part3Sets, part4Sets, part5Sets } from './listening.ts';

const AUDIO_DIR = join(process.cwd(), 'public', 'audio');

// 模拟代码中每个 playAudioFile(id) 调用，返回 [id, 来源说明]
function collectIds(): { id: string; src: string }[] {
  const out: { id: string; src: string }[] = [];

  // Part 1: playAudioFile(q.id)
  for (const s of part1Sets) {
    for (const q of s.questions) out.push({ id: q.id, src: `P1 ${s.id} Q ${q.id}` });
  }
  // Part 2: playAudioFile(set.id) + playAudioFile(b.id)  [修复后 b.id 已是完整 id]
  for (const s of part2Sets) {
    out.push({ id: s.id, src: `P2 ${s.id} 整段` });
    for (const b of s.blanks) out.push({ id: b.id, src: `P2 ${s.id} 空 ${b.id}` });
  }
  // Part 3: playAudioFile(set.id) + playAudioFile(q.id)  [仅 audioText 存在的题]
  for (const s of part3Sets) {
    out.push({ id: s.id, src: `P3 ${s.id} 整段` });
    for (const q of s.questions) if (q.audioText) out.push({ id: q.id, src: `P3 ${s.id} 题 ${q.id}` });
  }
  // Part 4: playAudioFile(q.id)
  for (const s of part4Sets) {
    for (const q of s.questions) out.push({ id: q.id, src: `P4 ${s.id} Q ${q.id}` });
  }
  // Part 5: playAudioFile(set.id) + playAudioFile(n.id)  [修复后新增单笔记重播]
  for (const s of part5Sets) {
    out.push({ id: s.id, src: `P5 ${s.id} 整段` });
    for (const n of s.notes) out.push({ id: n.id, src: `P5 ${s.id} 笔记 ${n.id}` });
  }
  return out;
}

const all = collectIds();
const byPart: Record<string, { total: number; missing: { id: string; src: string }[] }> = {};
for (const { id, src } of all) {
  const p = src.slice(0, 2);
  if (!byPart[p]) byPart[p] = { total: 0, missing: [] };
  byPart[p].total++;
  const fp = join(AUDIO_DIR, `${id}.mp3`);
  if (!existsSync(fp)) byPart[p].missing.push({ id, src });
}

let grandTotal = 0;
let grandMissing = 0;
console.log('=== 听力音频覆盖率检查 ===');
for (const p of ['P1', 'P2', 'P3', 'P4', 'P5']) {
  const info = byPart[p];
  if (!info) continue;
  grandTotal += info.total;
  grandMissing += info.missing.length;
  const ok = info.total - info.missing.length;
  const status = info.missing.length === 0 ? '✅ ALL OK' : `⚠️ 缺 ${info.missing.length}`;
  console.log(`${p}: 请求 ${info.total} / 存在 ${ok} / 缺失 ${info.missing.length}  ${status}`);
  if (info.missing.length > 0) {
    const sample = info.missing.slice(0, 6).map((m) => m.id).join(', ');
    console.log(`   示例缺失: ${sample}${info.missing.length > 6 ? ' ...' : ''}`);
  }
}
console.log('--------------------------------');
console.log(`总计: 请求 ${grandTotal} / 缺失 ${grandMissing}`);
if (grandMissing === 0) console.log('🎉 全部音频文件齐备，无需 TTS 回退');
else console.log(`⚠️ 有 ${grandMissing} 个音频文件缺失 → 对应按钮会回退到 TTS（安卓可能无声/卡顿）`);
