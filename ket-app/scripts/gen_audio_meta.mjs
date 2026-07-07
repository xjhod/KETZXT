// 提取听力模块所有需要生成音频的 (id, text) 清单
// 用项目自带的 typescript 包转译 listening.ts（剥离类型），再导出数据
import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.resolve(__dirname, '../src/data/listening.ts');
const src = fs.readFileSync(srcPath, 'utf8');

// 转译：剥离类型与 type-only import，得到自包含的 ESM
const out = ts.transpileModule(src, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
    isolatedModules: true,
  },
}).outputText;

const tmp = path.resolve(__dirname, '_listening_data.mjs');
fs.writeFileSync(tmp, out);
const mod = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

const items = [];
const push = (id, text) => {
  if (!id || !text || !text.trim()) return;
  items.push({ id, text: text.trim() });
};

for (const set of mod.part1Sets || []) {
  for (const q of set.questions || []) push(q.id, q.audioText);
}
for (const set of mod.part2Sets || []) push(set.id, set.conversationAudio);
for (const set of mod.part3Sets || []) push(set.id, set.monologueAudio);
for (const set of mod.part4Sets || []) push(set.id, set.monologueAudio);
for (const set of mod.part5Sets || []) push(set.id, set.monologueAudio);

const outPath = path.resolve(__dirname, 'audio_manifest.json');
fs.writeFileSync(outPath, JSON.stringify(items, null, 2));
console.log(`✅ 提取 ${items.length} 条音频清单 -> ${outPath}`);
// 去重校验
const ids = new Set(items.map(i => i.id));
if (ids.size !== items.length) {
  console.warn('⚠️ 存在重复 id，请检查数据');
}
