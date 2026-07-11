// 导出 Part 1 标准答案（id + modelAnswer）为 JSON，供 edge-tts 批量生成 mp3
import { speakingPart1 } from './speaking';
import { writeFileSync } from 'node:fs';

const items = speakingPart1.map((q) => ({
  id: q.id,
  text: q.modelAnswer,
}));

writeFileSync('scripts/speaking_answers.json', JSON.stringify(items, null, 2));
console.log(`exported ${items.length} Part1 standard answers`);
