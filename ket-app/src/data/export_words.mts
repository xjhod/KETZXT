import { writeFileSync } from 'node:fs';
import { allThemes } from './vocabulary.ts';

const words: { id: string; en: string }[] = [];
for (const t of allThemes) {
  for (const w of t.words) {
    words.push({ id: w.id, en: w.en });
  }
}
const out = new URL('./words.json', import.meta.url);
writeFileSync(out, JSON.stringify(words));
console.log('exported', words.length, 'words to', out.pathname);
