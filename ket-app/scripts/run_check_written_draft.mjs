// 手写产出草稿校验（离线，内存 mock localStorage）
// 验证：
//  1. 保存后原样恢复（text/attempts/accepted）
//  2. 多次保存同题按字段合并，不丢未涉及的字段
//  3. 提交成功后清除，读不到
//  4. 7 天过期草稿自动清除
//  5. 切账号草稿隔离（不串号）
//  6. localStorage 不可用时静默不崩
//  7. 空 key 直接忽略
// 用 rolldown 打包 TS 模块后在内存执行（KETZXT 项目自带 rolldown，无 esbuild）
import { rolldown } from 'rolldown';

async function loadTs(entry) {
  const b = await rolldown({ input: entry });
  const { output } = await b.generate({ format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64'));
}

// ---- 内存 mock localStorage + 可控当前账号 ----
const store = new Map();
let broken = false;
function setAccount(id) {
  // auth.ts 的 getCurrentUser 读 'ket-app-current-user'
  store.set('ket-app-current-user', JSON.stringify({ id, name: id }));
}
globalThis.localStorage = {
  getItem: (k) => (broken ? (() => { throw new Error('blocked'); })() : (store.has(k) ? store.get(k) : null)),
  setItem: (k, v) => { if (broken) throw new Error('blocked'); store.set(k, String(v)); },
  removeItem: (k) => { if (broken) throw new Error('blocked'); store.delete(k); },
  clear: () => store.clear(),
};
setAccount('uid-A');

const m = await loadTs('src/utils/writtenDraft.ts');

let pass = 0, fail = 0;
function check(name, cond, extra = '') {
  if (cond) pass++; else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
}

console.log('=== 1. 保存后原样恢复 ===');
m.saveWrittenDraft('grammar:G01-1', { text: 'He go to school', attempts: 1 });
let d = m.loadWrittenDraft('grammar:G01-1');
check('text 恢复', d?.text === 'He go to school');
check('attempts 恢复', d?.attempts === 1);
check('accepted 默认空', d?.accepted === '');

console.log('=== 2. 多次保存合并（不丢字段）===');
m.saveWrittenDraft('grammar:G01-1', { accepted: 'He goes to school' });
d = m.loadWrittenDraft('grammar:G01-1');
check('text 保留', d?.text === 'He go to school');
check('attempts 保留', d?.attempts === 1);
check('accepted 更新', d?.accepted === 'He goes to school');

console.log('=== 3. 清除（提交成功）===');
m.clearWrittenDraft('grammar:G01-1');
check('清除后读不到', m.loadWrittenDraft('grammar:G01-1') === null);

console.log('=== 4. 词汇/语法作用域不串 ===');
m.saveWrittenDraft('vocab:apple', { text: 'I eat an apple' });
m.saveWrittenDraft('grammar:G02-1', { text: 'She are happy' });
check('词汇草稿独立', m.loadWrittenDraft('vocab:apple')?.text === 'I eat an apple');
check('语法草稿独立', m.loadWrittenDraft('grammar:G02-1')?.text === 'She are happy');

console.log('=== 5. 账号隔离（切换不串号）===');
setAccount('uid-B');
check('B 看不到 A 的草稿', m.loadWrittenDraft('vocab:apple') === null);
m.saveWrittenDraft('vocab:apple', { text: 'B 的答案' });
setAccount('uid-A');
check('切回 A 仍是 A 的答案', m.loadWrittenDraft('vocab:apple')?.text === 'I eat an apple');

console.log('=== 6. 过期草稿自动清除 ===');
setAccount('uid-C');
m.saveWrittenDraft('vocab:old', { text: 'stale' });
const ckey = 'ket-written-draft-v1:uid-C';
const cdata = JSON.parse(store.get(ckey));
cdata['vocab:old'].savedAt = Date.now() - 8 * 24 * 3600 * 1000;
store.set(ckey, JSON.stringify(cdata));
check('过期返回 null', m.loadWrittenDraft('vocab:old') === null);
check('过期后被删除', !JSON.parse(store.get(ckey))['vocab:old']);

console.log('=== 7. localStorage 不可用静默不崩 ===');
setAccount('uid-A');
broken = true;
let crashed = false;
try {
  m.saveWrittenDraft('x', { text: 'y' });
  const rr = m.loadWrittenDraft('x');
  m.clearWrittenDraft('x');
  check('不可用时读为 null', rr === null);
} catch { crashed = true; }
check('不可用时无异常', !crashed);
broken = false;

console.log('=== 8. 空 key 忽略 ===');
m.saveWrittenDraft('', { text: 'ignored' });
check('空 key 不落地', m.loadWrittenDraft('') === null);

console.log('\n=== 结果：' + pass + ' 通过 / ' + fail + ' 失败 ===');
if (fail > 0) process.exit(1);
