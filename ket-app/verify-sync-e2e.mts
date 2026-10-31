/**
 * 端到端联调：真实后端 + 真实前端同步逻辑
 *
 * 运行：node --experimental-strip-types --import ./register-ts-resolver.mjs verify-sync-e2e.mts
 *
 * 场景（模拟用户的真实用法）：
 *   设备A：注册账号 -> 本地做题 -> 首次云端登录（创建账号）
 *   设备B：同账号云端登录 -> 拉回设备A的数据 -> 验证数据一致
 *   设备A：再做题 -> push -> 设备B 再次拉取 -> 验证增量到达
 *
 * 这不是 mock：全部走真实 HTTP 请求到真实部署的 EdgeOne 后端。
 */

import { webcrypto } from 'node:crypto';

if (!globalThis.crypto) (globalThis as any).crypto = webcrypto;
if (!globalThis.btoa) (globalThis as any).btoa = (s: string) => Buffer.from(s, 'binary').toString('base64');
if (!globalThis.atob) (globalThis as any).atob = (s: string) => Buffer.from(s, 'base64').toString('binary');

const store = new Map<string, string>();
const deviceA = new Map<string, string>();
const deviceB = new Map<string, string>();
let currentDevice = deviceA;

/**
 * localStorage 垫片。
 * 注意：必须在 import 任何 store 之前装好 —— zustand v5 的 persist 在模块加载时
 * 就执行 `createJSONStorage(() => window.localStorage)` 去探测 storage 是否可用，
 * 之后我们再替换对象它也拿不到了。
 *
 * 关键点：zustand 取的是 **window.localStorage**（不是 globalThis.localStorage），
 * 所以必须同时提供 window 对象。浏览器里 window.localStorage 是原生实现，
 * 因此这条路径只在 Node 测试环境里需要补。
 */
const storageShim = {
  getItem: (k: string) => (currentDevice.has(k) ? currentDevice.get(k)! : null),
  setItem: (k: string, v: string) => void currentDevice.set(k, String(v)),
  removeItem: (k: string) => void currentDevice.delete(k),
  clear: () => currentDevice.clear(),
  key: (i: number) => Array.from(currentDevice.keys())[i] ?? null,
  get length() { return currentDevice.size; },
};
(globalThis as any).localStorage = storageShim;
(globalThis as any).window = { ...(globalThis as any).window, localStorage: storageShim };

// 后端地址（真实部署）。
// sync.ts 里的 SYNC_BASE 来自 import.meta.env.VITE_SYNC_API_BASE，
// 在 Node 下 envBag 为空 -> 退化成 '/api'，所以这里靠 fetch 包装把它重写到真实地址。
const BASE = process.env.SYNC_BASE || '';
if (!BASE) {
  console.error('缺少 SYNC_BASE 环境变量');
  process.exit(2);
}

let passed = 0, failed = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}${detail ? ' -> ' + detail : ''}`); }
}
function section(t: string) { console.log(`\n=== ${t} ===`); }

// ============ 把前端代码里的相对地址 /api/... 重写到真实后端 ============
// 生产代码不需要为测试加钩子；这里在测试侧包装 fetch 即可。
// 匿名部署的站点需要先带 eo_token 换 cookie，否则返回 401。
const COOKIE = process.env.SYNC_COOKIE || '';
const realFetch = globalThis.fetch;
(globalThis as any).fetch = (input: any, init?: any) => {
  let url = typeof input === 'string' ? input : input?.url;
  const headers: Record<string, string> = { ...((init || {}).headers || {}) };
  if (typeof url === 'string' && url.startsWith('/')) {
    url = BASE + url;
    input = url;
  }
  if (COOKIE && !headers['Cookie']) {
    headers['Cookie'] = COOKIE;
  }
  return realFetch(input, { ...(init || {}), headers });
};

const { generateSalt, hashPassword } = await import('./src/utils/crypto.ts');
const { useProgressStore } = await import('./src/store/useProgressStore.ts');
const { usePlanStore } = await import('./src/store/usePlanStore.ts');
const { useDailyCheckinStore } = await import('./src/store/useDailyCheckinStore.ts');
const { syncLogin, syncPull, syncPush, getCredentials, clearCredentials } = await import('./src/utils/sync.ts');

// ============ 准备：模拟两台设备 ============
// 设备A：把 localStorage 内容存起来
// 设备B：独立的一份（通过切换 currentDevice 实现）

const USER_NAME = 'e2e-' + Date.now().toString(36);
const PASSWORD = 'test-pass-1234';

// 设备A上注册（走真实的 auth.ts，会做 PBKDF2）
section('0. 设备A：注册本地账号');
const { register } = await import('./src/utils/auth.ts');
const reg = await register(USER_NAME, PASSWORD, '测试提示');
check('注册成功', reg.success, reg.message);

const { getUsers } = await import('./src/utils/auth.ts');
const localUser = getUsers().find(u => u.name === USER_NAME)!;
check('本地账号不含明文密码', !('password' in localUser) || !(localUser as any).password);
check('本地账号含 hash 与 salt', !!localUser.hash && !!localUser.salt);

// ============ 设备A：做题 ============
section('1. 设备A：做题并记录');
useProgressStore.getState().recordAnswer({
  module: 'grammar', exerciseType: 'grammar_fill',
  subjectId: 'g-test', subjectName: '测试语法点', questionId: 'q-deviceA-1',
  questionText: '设备A的题目', userAnswer: 'A', correctAnswer: 'B', isCorrect: false,
});
usePlanStore.getState().completeDay({
  date: '2026-10-20', setIndex: 0, itemIds: ['q-deviceA-1'], results: [],
  correctCount: 0, totalCount: 1, writingDone: true, writingWords: 30,
  speakingDone: false, speakingPercent: 0, minutes: 15,
  completedAt: '2026-10-20T10:00:00.000Z',
});
useDailyCheckinStore.getState().completeCheckin('2026-10-20');
check('设备A 本地有 1 条答题记录', useProgressStore.getState().answerRecords.length === 1);
check('设备A 本地有 1 天打卡', useDailyCheckinStore.getState().checkinDates.length === 1);

// ============ 设备A：首次云端登录（创建账号） ============
section('2. 设备A：首次云端登录（创建云端账号）');
const loginA = await syncLogin(USER_NAME, PASSWORD);
check('设备A 云端登录成功', loginA.ok, loginA.message);
check('已保存云端凭据', !!getCredentials());
const credsA = getCredentials()!;
check('凭据不含明文密码', !(credsA as any).password);

// ============ 切换到设备B ============
section('3. 设备B：同账号云端登录（跨设备找回）');
currentDevice = deviceB;
// 设备B 上没有本地账号，先注册一个同名账号（模拟用户在 B 设备上注册同一账号）
const regB = await register(USER_NAME, PASSWORD, '测试提示');
check('设备B 注册本地账号', regB.success, regB.message);
clearCredentials(); // 设备B 尚未连接云端

const loginB = await syncLogin(USER_NAME, PASSWORD);
check('设备B 云端登录成功', loginB.ok, loginB.message);
const credsB = getCredentials()!;
check('设备B 拿到的是同一个 userId（跨设备找回成功）', credsB.userId === credsA.userId,
  `A=${credsA.userId} B=${credsB.userId}`);

// 设备B 应当拉到设备A 的数据
const bRecords = useProgressStore.getState().answerRecords;
check('设备B 拉到设备A 的答题记录', bRecords.length === 1, `实际 ${bRecords.length}`);
check('设备B 记录内容正确', bRecords[0]?.questionId === 'q-deviceA-1');
check('设备B 拉到设备A 的打卡日期', useDailyCheckinStore.getState().checkinDates.includes('2026-10-20'));
check('设备B 拉到设备A 的计划日志', !!usePlanStore.getState().logs['2026-10-20']);

// ============ 设备B：再做题 ============
section('4. 设备B：继续做题（产生新数据）');
useProgressStore.getState().recordAnswer({
  module: 'vocabulary', exerciseType: 'spelling',
  subjectId: 'v-test', subjectName: '测试单词', questionId: 'q-deviceB-1',
  questionText: '设备B的题目', userAnswer: 'x', correctAnswer: 'x', isCorrect: true,
});
check('设备B 现有 2 条记录（1 条来自A + 1 条自己做的）',
  useProgressStore.getState().answerRecords.length === 2,
  `实际 ${useProgressStore.getState().answerRecords.length}`);

const pushB = await syncPush();
check('设备B 上传成功', pushB.ok, pushB.message);

// ============ 切回设备A：拉取增量 ============
section('5. 设备A：拉取设备B 的新数据');
currentDevice = deviceA;
const pullA = await syncPull();
check('设备A 拉取成功', pullA.ok, pullA.message);
check('设备A 拉到设备B 的记录', useProgressStore.getState().answerRecords.length === 2,
  `实际 ${useProgressStore.getState().answerRecords.length}`);
check('设备A 保留了设备B 的记录',
  !!useProgressStore.getState().answerRecords.find(r => r.questionId === 'q-deviceB-1'));
check('设备A 仍保留自己的记录',
  !!useProgressStore.getState().answerRecords.find(r => r.questionId === 'q-deviceA-1'));

// ============ 密码错误 ============
section('6. 安全：密码错误被拒绝');
currentDevice = deviceB;
clearCredentials();
const badLogin = await syncLogin(USER_NAME, 'wrong-password');
check('错误密码被拒绝', !badLogin.ok, badLogin.message);
check('错误密码不会创建新账号', badLogin.message.includes('密码错误'), badLogin.message);

// ============ 汇总 ============
console.log(`\n${'='.repeat(50)}`);
console.log(`端到端联调：通过 ${passed} 项，失败 ${failed} 项`);
console.log(`后端地址：${BASE}`);
console.log('='.repeat(50));
if (failed > 0) process.exit(1);
