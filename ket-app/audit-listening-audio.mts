/**
 * 听力音频与题目的对应完整性审计
 * 目的：确认「把听力内嵌进今日备考页」在数据层没有缺口
 */
import { getListeningSetsByPart } from './src/data/listening.ts';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const AUDIO_DIR = join(process.cwd(), 'public', 'audio');

let totalQ = 0, withAudio = 0, missing: string[] = [];
const perPart: { p: number; q: number; audio: number }[] = [];

for (const p of [1, 2, 3, 4, 5]) {
  const sets = getListeningSetsByPart(p) as any[];
  let pq = 0, pa = 0;
  for (const s of sets) {
    const qs: any[] = s.questions ?? [];
    for (const q of qs) {
      pq++; totalQ++;
      const file = join(AUDIO_DIR, `${q.id}.mp3`);
      if (existsSync(file)) { withAudio++; pa++; }
      else missing.push(`${q.id}`);
    }
    // Part5 之类可能结构不同，看看有没有别的键
    for (const key of Object.keys(s)) {
      if (key === 'questions') continue;
      const v = s[key];
      if (Array.isArray(v) && v.length && typeof v[0] === 'object' && 'id' in v[0] && 'audioText' in v[0]) {
        for (const q of v as any[]) {
          pq++; totalQ++;
          const file = join(AUDIO_DIR, `${q.id}.mp3`);
          if (existsSync(file)) { withAudio++; pa++; }
          else missing.push(`${q.id}`);
        }
      }
    }
  }
  perPart.push({ p, q: pq, audio: pa });
}

console.log('='.repeat(60));
console.log('听力音频完整性');
console.log('='.repeat(60));
for (const r of perPart) {
  const pct = r.q ? Math.round((r.audio / r.q) * 100) : 0;
  console.log(`  Part${r.p}  题 ${String(r.q).padStart(4)}  有音频 ${String(r.audio).padStart(4)}  ${pct}%`);
}
console.log('-'.repeat(60));
console.log(`  合计题 ${totalQ} | 有音频 ${withAudio} | 缺失 ${missing.length}`);
if (missing.length) {
  console.log('  缺失清单（前 12 个）:');
  missing.slice(0, 12).forEach(m => console.log('    ' + m));
  console.log('  按 Part 分布:');
  const byPart: Record<string, number> = {};
  for (const m of missing) {
    const p = m.split('-')[0];
    byPart[p] = (byPart[p] ?? 0) + 1;
  }
  Object.entries(byPart).forEach(([k, v]) => console.log(`    ${k}: ${v}`));
}

// 音频体积
console.log('');
console.log('每日内嵌 5 道题的音频体积估算：');
import { statSync } from 'node:fs';
const sample = ['L1-01-Q1', 'L1-01-Q2', 'L1-01-Q3', 'L1-01-Q4', 'L1-01-Q5'];
let bytes = 0;
for (const id of sample) {
  const f = join(AUDIO_DIR, `${id}.mp3`);
  if (existsSync(f)) bytes += statSync(f).size;
}
console.log(`  5 题共 ${(bytes / 1024).toFixed(1)} KB（平均 ${(bytes / 5 / 1024).toFixed(1)} KB/题）`);
console.log('  → 已在 SW 缓存范围内（audio-mp3 规则），播过一次即本地留存');
