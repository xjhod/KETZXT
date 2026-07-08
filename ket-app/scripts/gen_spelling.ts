/**
 * gen_spelling.ts — 一键重生 spellingQuestions（输出可直接粘贴的 TS 代码）
 *
 * 用法：node --experimental-strip-types scripts/gen_spelling.ts
 *
 * 输出到 stdout，复制替换 vocabulary.ts 中的 spellingQuestions 定义区。
 */

import { allThemes } from '../src/data/vocabulary.ts';

// 复制 makeSpelling 的逻辑（避免循环依赖）
type SpellingQ = { id: string; wordId: string; en: string; phonetic: string; audioText: string };

const make = (words: { id: string; en: string; phonetic: string }[], startId: number): SpellingQ[] =>
  words.map((w, i) => ({
    id: `sq${String(startId + i).padStart(3, '0')}`,
    wordId: w.id,
    en: w.en,
    phonetic: w.phonetic,
    audioText: w.en,
  }));

const parts: string[] = ['export const spellingQuestions: SpellingQuestion[] = ['];

let offset = 0;
for (const t of allThemes) {
  const start = offset + 1;
  parts.push(`  ...makeSpelling(${t.name.replace(/[^a-zA-Z]/g, '')}Theme.words, ${start}),  // ${t.id} ${t.nameZh} (${t.words.length}w)`);
  offset += t.words.length;
}

parts.push('];');
parts.push('');
parts.push(`// Total: ${allThemes.length} themes, ${offset} spelling questions`);
console.log(parts.join('\n'));
