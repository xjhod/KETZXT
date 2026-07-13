// 导出听力各 Part 的「单句」音频清单（id + 朗读文本），供 edge-tts 批量生成。
// 仅导出代码中真正请求的 per-blank / per-question / per-note 单句（整段文件已存在）。
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { part2Sets, part3Sets, part4Sets, part5Sets } from './listening.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out: { id: string; text: string }[] = [];

// Part 2: 每个填空的句子
for (const s of part2Sets) {
  for (const b of s.blanks) if (b.audioText) out.push({ id: b.id, text: b.audioText });
}
// Part 3: 每个有 audioText 的问题片段
for (const s of part3Sets) {
  for (const q of s.questions) if (q.audioText) out.push({ id: q.id, text: q.audioText });
}
// Part 4: 每个短对话
for (const s of part4Sets) {
  for (const q of s.questions) if (q.audioText) out.push({ id: q.id, text: q.audioText });
}
// Part 5: 每个笔记的句子
for (const s of part5Sets) {
  for (const n of s.notes) if (n.audioText) out.push({ id: n.id, text: n.audioText });
}

const fp = join(__dirname, 'listening_snippets.json');
writeFileSync(fp, JSON.stringify(out, null, 0));
console.log(`导出 ${out.length} 条单句音频清单 -> ${fp}`);
