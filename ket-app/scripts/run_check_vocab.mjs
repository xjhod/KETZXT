// ========== 词汇三路由校验入口 ==========
// node --experimental-strip-types 无法解析无扩展名 import，沿用仓库既有做法：
// rolldown 打包 .mts 后在内存里以 data URL 执行。
import { rolldown } from 'rolldown';
import { readdirSync } from 'node:fs';

const bundle = await rolldown({ input: 'src/data/check_vocab_routing.mts' });
const { output } = await bundle.generate({ format: 'esm' });
const code = output[0].code;
const dataUrl = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
await import(dataUrl);

const result = globalThis.__VOCAB_CHECK__;
if (!result) {
  console.log('CHECK SCRIPT FAILED: no result exported');
  process.exit(1);
}

// 音频覆盖：public/audio/<wordId>.mp3
const audioFiles = new Set(readdirSync('public/audio').filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)));
// 已知缺口：w001 (mother) 从未生成 mp3，播放层有 TTS 兜底；不阻断校验，但要显式记录。
const KNOWN_MISSING = new Set(['w001']);
const missing = result.wordIds.filter((id) => !audioFiles.has(id));
const unexpected = missing.filter((id) => !KNOWN_MISSING.has(id));
const missingByRoute = { A: 0, B: 0, C: 0 };
for (const id of missing) {
  const w = result.words.find((x) => x.id === id);
  if (w) missingByRoute[w.route] += 1;
}
console.log('AUDIO_FILES_TOTAL', audioFiles.size);
console.log('WORD_AUDIO_MISSING', missing.length, JSON.stringify(missingByRoute), missing.slice(0, 8));
console.log('UNEXPECTED_MISSING', unexpected.length, unexpected.slice(0, 8));
console.log('CHECK SCRIPT FINISHED', result.failures.length === 0 && unexpected.length === 0 ? 'PASS' : 'FAIL');
if (result.failures.length || unexpected.length) process.exit(1);
