// 校验交错打散：interleaveBy 稳定轮转/不改入参/组内保序、语法 mixed 接线、阅读难度交错接线。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('  FAIL ' + msg); } };

async function load(entry) {
  const b = await rolldown({ input: entry });
  const { output } = await b.generate({ format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64'));
}

const I = await load('src/utils/interleave.ts');
const key = (x) => x.k;

console.log('=== 1. interleaveBy 轮转 ===');
const input = [
  { k: 'A', id: 1 }, { k: 'A', id: 2 }, { k: 'A', id: 3 },
  { k: 'B', id: 4 }, { k: 'B', id: 5 }, { k: 'C', id: 6 },
];
const out = I.interleaveBy(input, key);
ok(out.map((x) => x.id).join(',') === '1,4,6,2,5,3', `按组轮转（得 ${out.map((x) => x.id).join(',')}）`);
ok(out.length === input.length, '不丢条目');

console.log('=== 2. 稳定可复现 / 纯函数 ===');
const again = I.interleaveBy(input, key);
ok(out.map((x) => x.id).join(',') === again.map((x) => x.id).join(','), '同输入同输出（无随机）');
const before = JSON.stringify(input);
I.interleaveBy(input, key);
ok(JSON.stringify(input) === before, '不改入参');

console.log('=== 3. 组内保序 + 边界 ===');
ok(out.filter((x) => x.k === 'A').map((x) => x.id).join(',') === '1,2,3', 'A 组内保持原序');
ok(I.interleaveBy([], key).length === 0, '空输入');
ok(I.interleaveBy(null, key).length === 0, 'null 输入不崩');
const one = I.interleaveBy([{ k: 'X', id: 9 }], key);
ok(one.length === 1 && one[0].id === 9, '单项输入');

console.log('=== 4. 交错效果：相邻同类不连做 ===');
// 模拟阅读：hard 全堆末尾
const pile = [
  ...Array.from({ length: 6 }, (_, i) => ({ k: 'easy', id: 'e' + i })),
  ...Array.from({ length: 6 }, (_, i) => ({ k: 'medium', id: 'm' + i })),
  ...Array.from({ length: 6 }, (_, i) => ({ k: 'hard', id: 'h' + i })),
];
const beforeRun = I.maxSameKeyRun(pile, key);
const afterRun = I.maxSameKeyRun(I.interleaveBy(pile, key), key);
ok(beforeRun === 6, `交错前最多 6 连同难度（得 ${beforeRun}）`);
ok(afterRun === 1, `交错后无相邻同难度（得 ${afterRun}）`);
// 数量不均时
const uneven = [{ k: 'A', id: 1 }, { k: 'A', id: 2 }, { k: 'A', id: 3 }, { k: 'A', id: 4 }, { k: 'B', id: 5 }];
ok(I.maxSameKeyRun(I.interleaveBy(uneven, key), key) === 3, '某组远多于其他组时仍有连块，但已尽量打散');

console.log('=== 5. 接线断言（源码静态检查）===');
const gs = readFileSync('src/utils/grammarSession.ts', 'utf8');
ok(gs.includes("import { interleaveBy } from './interleave'"), '语法 session 引入交错函数');
ok(/interleaveBy\(\s*normalPool\.slice/.test(gs) || /interleaveBy\([\s\S]{0,80}pType/.test(gs), '语法 mixed 用 interleaveBy 按 pType 打散');
ok(gs.includes('(s) => s.pType'), '语法按题型交错');
ok(gs.includes('...normalMixed, ...meaningQs'), 'meaning 题仍保留在末尾');
const rp = readFileSync('src/pages/ReadingPage.tsx', 'utf8');
ok(rp.includes("import { interleaveBy } from '../utils/interleave'"), '阅读页引入交错函数');
ok(/interleaveBy\(rawFiltered/.test(rp), '阅读全部档按难度交错');
ok(rp.includes("map((a, i) => ({ a, i }))"), '阅读仍保留原始索引映射（答案不错位）');
ok(rp.includes('onSelectArticle(i)'), '阅读仍用原索引选文章');

console.log(`\n=== RESULT: pass=${pass} fail=${fail} ===`);
if (fail > 0) process.exit(1);
