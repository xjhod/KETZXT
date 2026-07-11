import { readFileSync, existsSync, statSync } from 'node:fs';

const words = JSON.parse(
  readFileSync(new URL('./words.json', import.meta.url), 'utf8')
);
const dir =
  'C:/Users/Rywl0/WorkBuddy/2026-06-03-10-50-15/ket-app/public/audio/';

const missing = [];
for (const w of words) {
  const p = dir + w.id + '.mp3';
  if (!existsSync(p) || statSync(p).size < 100) missing.push(w.id);
}

console.log('total words:', words.length);
console.log('missing mp3 :', missing.length);
if (missing.length) {
  console.log('missing ids:', missing.join(' '));
} else {
  console.log('ALL WORD AUDIO PRESENT');
}
