// 校验听力 Part 5（notes 填空 / KET note completion）数据完整性
// 用法：node --experimental-strip-types check_listening_p5.mts
import { part5Sets } from './listening.ts';

let errors = 0;
let warnings = 0;
const err = (m: string) => { console.log('  [ERROR] ' + m); errors++; };
const warn = (m: string) => { console.log('  [WARN]  ' + m); warnings++; };

console.log(`=== 听力 Part 5 校验（notes 填空）：共 ${part5Sets.length} 套 ===\n`);

const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?'"]/g, '').trim();

for (const set of part5Sets) {
  const tag = set.id || '(no-id)';
  console.log(`--- ${tag} (${set.titleZh || set.title || '?'}) ---`);

  if (!set.title) warn(`${tag}: 缺 title`);
  if (!set.titleZh) warn(`${tag}: 缺 titleZh`);
  if (!set.speaker) warn(`${tag}: 缺 speaker`);
  if (!set.monologueAudio || !set.monologueAudio.trim()) err(`${tag}: monologueAudio 为空`);
  if (!set.transcript || !set.transcript.trim()) err(`${tag}: transcript 为空`);
  if (set.monologueAudio && set.transcript && norm(set.monologueAudio) !== norm(set.transcript)) {
    warn(`${tag}: monologueAudio 与 transcript 不完全一致`);
  }

  if (!Array.isArray(set.notes) || set.notes.length === 0) {
    err(`${tag}: 无 notes`);
    continue;
  }
  if (set.notes.length !== 5) warn(`${tag}: notes 数量=${set.notes.length}（KET 标准 5）`);

  const transcriptNorm = norm(set.transcript || '');
  set.notes.forEach((n: any, i: number) => {
    const nt = `${tag}-N${i + 1}`;
    if (!n.field) warn(`${nt}: 缺 field`);
    if (!n.fieldZh) warn(`${nt}: 缺 fieldZh`);
    if (!n.hint) warn(`${nt}: 缺 hint`);
    if (!n.audioText || !n.audioText.trim()) warn(`${nt}: 缺 audioText（单句播放文本）`);
    if (!n.answer || !n.answer.trim()) {
      err(`${nt}: answer 为空`);
      return;
    }
    const variants = n.answer.split('/').map((v: string) => norm(v));
    const allIn = variants.every((v: string) => v === '' || transcriptNorm.includes(v));
    if (!allIn) warn(`${nt}: 答案「${n.answer}」主写法未在 transcript 中出现`);
  });
}

console.log(`\n=== 结果：errors=${errors}, warnings=${warnings} ===`);
if (errors === 0) console.log('✅ 数据完整性 ALL OK（结构已是 KET note completion）');
else console.log('❌ 存在数据错误，需修复');
