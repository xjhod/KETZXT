// ========== 个人中心昵称校验入口 ==========
// node --experimental-strip-types 无法解析无扩展名 import，沿用仓库既有做法：
// rolldown 打包 auth.ts 后在内存里以 data URL 执行。
// 用内存版 localStorage / window 打桩，验证昵称读写、登录不覆盖、云端按时间合并。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

const failures = [];
const check = (name, cond, detail = '') => {
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`);
  if (!cond) failures.push(name);
};

// ---- 浏览器 API 打桩 ----
const store = new Map();
let eventCount = 0;
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = {
  dispatchEvent: () => { eventCount++; return true; },
};

const bundle = await rolldown({ input: 'src/utils/auth.ts' });
const { output } = await bundle.generate({ format: 'esm' });
const dataUrl = 'data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64');
const m = await import(dataUrl);

// ---- 1. 规范化 ----
check('NICKNAME_MAX_LEN = 12', m.NICKNAME_MAX_LEN === 12);
check('空白昵称规范化为空', m.normalizeNickname('   \n  ') === '');
check('首尾空白与中间多空格折叠', m.normalizeNickname('  小   明  ') === '小 明');
check('控制字符被去除', m.normalizeNickname('小\u0000明\t') === '小明');
check('超长按码点截断', Array.from(m.normalizeNickname('abcdefghijklmnop')).length === 12);
check('emoji 按码点计数', Array.from(m.normalizeNickname('小🙂明')).length === 3);

// ---- 2. 未登录保护 ----
check('未登录 setNickname 被拒绝', m.setNickname('小明').ok === false);
check('未登录 getDisplayName 为空', m.getDisplayName(null) === '');

// ---- 3. 云端登录建镜像用户 ----
const u1 = m.upsertCloudUser('uid-001', 'kid@example.com');
check('登录后展示账号标识', m.getDisplayName(u1) === 'kid@example.com', m.getDisplayName(u1));
check('初始昵称资料为空', m.readNicknameProfile().nickname === '' && m.readNicknameProfile().nicknameUpdatedAt === '');

// ---- 4. 改昵称 ----
const r1 = m.setNickname('  小明  ');
check('setNickname 成功', r1.ok === true, r1.message);
check('当前用户昵称已写入', m.getCurrentUser().nickname === '小明');
check('展示名切换为昵称', m.getDisplayName(m.getCurrentUser()) === '小明');
check('用户列表同步写入', m.getUsers().find((u) => u.id === 'uid-001')?.nickname === '小明');
check('昵称写入带时间戳', Boolean(m.getCurrentUser().nicknameUpdatedAt));
check('变更事件已广播', eventCount > 0, `count=${eventCount}`);

// ---- 5. 再次云端登录 / 启动恢复会话不得冲掉昵称 ----
const u2 = m.upsertCloudUser('uid-001', 'kid2@example.com');
check('账号标识已刷新', u2.name === 'kid2@example.com', u2.name);
check('昵称在重新登录后仍在', u2.nickname === '小明', String(u2.nickname));
check('展示名仍是昵称', m.getDisplayName(u2) === '小明');

// ---- 6. 远程合并按时间取新 ----
const oldAt = m.getCurrentUser().nicknameUpdatedAt;
check('较旧的远端昵称被忽略', m.applyRemoteNickname('旧昵称', '2020-01-01T00:00:00.000Z') === false);
check('忽略后本机昵称不变', m.getCurrentUser().nickname === '小明');
check('无时间戳的旧版同步包被忽略', m.applyRemoteNickname('旧包', undefined) === false);

const futureAt = new Date(Date.now() + 60_000).toISOString();
check('较新的远端昵称被采纳', m.applyRemoteNickname('远端昵称', futureAt) === true);
check('采纳后展示名更新', m.getDisplayName(m.getCurrentUser()) === '远端昵称');
check('采纳后用户列表同步', m.getUsers().find((u) => u.id === 'uid-001')?.nickname === '远端昵称');
check('重复合并同一时间戳不重复写', m.applyRemoteNickname('远端昵称', futureAt) === false);
check('本地时间戳不早于合并来源', (m.getCurrentUser().nicknameUpdatedAt ?? '') >= futureAt);
check('旧时间戳仍不能回退', (oldAt ?? '') < futureAt);

// ---- 7. 清除昵称（恢复默认） ----
const r2 = m.setNickname('');
check('清空昵称成功', r2.ok === true && m.getCurrentUser().nickname === '');
check('清空后恢复账号标识', m.getDisplayName(m.getCurrentUser()) === 'kid2@example.com');
check('清空也写时间戳（可覆盖远端）', Boolean(m.getCurrentUser().nicknameUpdatedAt));
const clearAt = m.getCurrentUser().nicknameUpdatedAt;
const laterAt = new Date(Date.now() + 120_000).toISOString();
check('清空状态可被更新的远端昵称覆盖', m.applyRemoteNickname('新昵称', laterAt) === true);
check('覆盖后展示名正确', m.getDisplayName(m.getCurrentUser()) === '新昵称');
check('时间戳单调前进', (clearAt ?? '') < laterAt);

// ---- 8. 静态接线断言（防止只改了 auth 忘了同步与 UI） ----
const syncSrc = readFileSync('src/utils/sync.ts', 'utf8');
const headerSrc = readFileSync('src/components/Header.tsx', 'utf8');
const homeSrc = readFileSync('src/pages/HomePage.tsx', 'utf8');
const userSrc = readFileSync('src/types/user.ts', 'utf8');
check('SyncPayload 含 profile', /profile\??:\s*NicknameProfile/.test(syncSrc));
check('packPayload 打包昵称', /profile:\s*readNicknameProfile\(\)/.test(syncSrc));
check('mergePayload 合并昵称', /applyRemoteNickname\(/.test(syncSrc));
check('owner_name 跟随昵称', /getDisplayName\(user\)/.test(syncSrc));
check('User 类型含 nickname', /nickname\?:/.test(userSrc) && /nicknameUpdatedAt\?:/.test(userSrc));
check('Header 有个人中心与修改昵称', headerSrc.includes('个人中心') && headerSrc.includes('修改昵称'));
check('Header 用 setNickname 保存', /setNickname\(/.test(headerSrc));
check('Header 订阅用户变更事件', /USER_CHANGED_EVENT/.test(headerSrc));
check('首页欢迎语用 getDisplayName', /getDisplayName\(currentUser\)/.test(homeSrc));
check('首页订阅用户变更事件', /USER_CHANGED_EVENT/.test(homeSrc));
check('首页不再直接显示账号标识', !/currentUser\.name/.test(homeSrc));

console.log('CHECK SCRIPT FINISHED', failures.length === 0 ? 'PASS' : `FAIL (${failures.length})`);
for (const f of failures) console.log('FAILURE:', f);
if (failures.length) process.exit(1);
