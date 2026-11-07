// ========== 词汇三路由校验入口 ==========
// node --experimental-strip-types 无法解析无扩展名 import，沿用仓库既有做法：
// rolldown 打包 .mts 后在内存里以 data URL 执行。
import { rolldown } from 'rolldown';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

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

// ---- C 轮：整词音频必须全量覆盖（w001 已于 2026-11-07 补齐）----
const audioFiles = new Set(
  readdirSync('public/audio').filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4))
);
const missing = result.wordIds.filter((id) => !audioFiles.has(id));
const missingByRoute = { A: 0, B: 0, C: 0 };
for (const id of missing) {
  const w = result.words.find((x) => x.id === id);
  if (w) missingByRoute[w.route] += 1;
}
console.log('AUDIO_FILES_TOTAL', audioFiles.size);
console.log('WORD_AUDIO_MISSING', missing.length, JSON.stringify(missingByRoute), missing.slice(0, 8));

// ---- E 轮护栏：归档数据不得回到主词库、不得被 import ----
const main = readFileSync('src/data/vocabulary.ts', 'utf8');
const legacyPath = 'src/data/vocabularyLegacy.ts';
const legacy = existsSync(legacyPath) ? readFileSync(legacyPath, 'utf8') : '';
const deadNames = ['theme06', 'theme07', 'theme08', 'theme09', 'theme10',
  'theme12', 'theme13', 'theme14', 'theme15', 'theme16', 'theme17'];
const legacyInMain = deadNames.filter((n) => main.includes(`export const ${n}:`));
const legacyExports = (legacy.match(/export const theme\d+: VocabularyTheme/g) || []).length;
const legacyWords = (legacy.match(/\{\s*id: ['"]w\d+['"],\s*en:/g) || []).length;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|mts|js|mjs)$/.test(entry.name)) out.push(p);
  }
  return out;
}
const importRe = /import[^;]*['"][^'"]*vocabularyLegacy['"]/;
const importers = walk('src').filter(
  (f) => path.normalize(f) !== path.normalize(legacyPath)
    && importRe.test(readFileSync(f, 'utf8'))
);
const report = JSON.parse(readFileSync('scripts/legacy_vocab_report.json', 'utf8'));
const themeBlocks = (main.match(/export const theme\w+: VocabularyTheme = \{/g) || []).length;
console.log('LEGACY_IN_MAIN', legacyInMain.length, legacyInMain);
console.log('LEGACY_ARCHIVE', `blocks=${legacyExports}`, `words=${legacyWords}`,
  `unique=${report.uniqueWordsNotInCurrent}`, `shared=${report.sharedWithCurrent}`);
console.log('LEGACY_IMPORTERS', importers.length, importers);
console.log('MAIN_THEME_BLOCKS', themeBlocks);

const outerFailures = [];
if (missing.length) outerFailures.push(`missing word audio: ${missing.slice(0, 5).join(',')}`);
if (legacyInMain.length) outerFailures.push('legacy theme blocks still in main vocabulary.ts');
if (legacyExports !== 11 || legacyWords !== 606) outerFailures.push('legacy archive incomplete');
if (importers.length) outerFailures.push('legacy archive is imported by app code');
if (themeBlocks !== 22) outerFailures.push(`main vocabulary.ts has ${themeBlocks} theme blocks (expect 22)`);
if (report.uniqueWordsNotInCurrent !== 155 || report.sharedWithCurrent !== 404) {
  outerFailures.push('legacy report numbers drifted');
}

const ok = result.failures.length === 0 && outerFailures.length === 0;
console.log('CHECK SCRIPT FINISHED', ok ? 'PASS' : 'FAIL');
if (outerFailures.length) for (const f of outerFailures) console.log('OUTER_FAIL:', f);
if (!ok) process.exit(1);
