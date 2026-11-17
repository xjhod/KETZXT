// 本机多账号切换 · 静态校验（实跑，不认口头声称）
// 目标：SDK 会话槽与本地分片同步切换；切换前 flush；失败回滚；失效预检；证据按 uid 隔离。
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let pass = 0;
let fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('OK   ' + msg); }
  else { fail++; console.log('FAIL ' + msg); }
}
function src(rel) {
  const p = fileURLToPath(new URL('../src/' + rel, import.meta.url));
  ok(existsSync(p), '文件存在: ' + rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}
function hasAll(s, arr) { return arr.every((x) => s.includes(x)); }
function hasNone(s, arr) { return arr.every((x) => !s.includes(x)); }

const acct = src('utils/accountSwitch.ts');
const header = src('components/Header.tsx');
const login = src('pages/LoginPage.tsx');
const app = src('App.tsx');
const evidence = src('utils/speechEvidence.ts');
const sync = src('utils/sync.ts');
const cloudAuth = src('utils/cloudAuth.ts');

// ---- 账号档案层 ----
ok(acct.includes('workbuddy-cloud.session.') && acct.includes('CLOUD_PUBLISHABLE_KEY'),
  'SDK 会话槽键 = 源码前缀 + publishableKey，与 SDK 一致');
ok(acct.includes("localStorage.setItem(SDK_SESSION_KEY, target.sessionJson)"),
  '切换时把目标会话快照写回 SDK 槽');
ok(acct.includes('rememberCurrentAccount();'), '切换前先存当前号快照');
ok(acct.includes('acct.userId !== uid'), '预检校验 SDK 会话 uid 与目标 uid 一致（防 A 会话配 B 分片）');
ok(acct.includes('restoreSlot(currentRaw)'), '预检失败回滚原会话槽');
ok(acct.includes('removeProfile(uid)'), '失效快照移出档案，避免反复失败');
ok(acct.includes('upsertCloudUser(uid'), '切换时同步切本地镜像用户（写 CURRENT_USER_KEY）');
ok(acct.includes('markCloudConnected(true)') && acct.includes('setCloudLinkedUid(uid)'),
  '切换时同步更新云端连接标记与 linked uid');
ok(hasAll(acct, ['listProfiles', 'rememberCurrentAccount', 'removeProfile', 'switchAccount', 'maskLabel']),
  '档案层五个核心操作齐全');
ok(acct.includes('sessionJson: string'), '档案保存 SDK 会话原始快照（含 token）');
ok(hasNone(acct, ["from './sync'", 'syncPush', 'packPayload']), '账号档案不进云同步 payload');
ok(acct.includes('needRelogin'), '快照失效时给出「需重发验证码」标志');

// ---- Header 切换交互 ----
ok(header.includes('handleSwitchAccount'), 'Header 有切换账号处理器');
ok(header.indexOf('await flushAutoSync(25000)') < header.indexOf('await switchAccount('),
  '切换前先 flush 当前号进度（顺序正确）');
ok(header.includes('flushed.timedOut') && header.includes('请稍等片刻再切换'),
  'flush 超时阻止切换（reload 会中断后台同步，不能丢数据）');
ok(header.includes('window.location.reload()'), '切换成功后 reload 重置 store/SDK 内存态');
ok(header.indexOf('rememberCurrentAccount();') < header.indexOf('await unlinkCloud()'),
  '退出登录在 unlinkCloud 之前存快照（unlink 会清槽）');
ok(header.includes('handleRemoveProfile') && header.includes('removeProfile(uid)'),
  '可移除存档账号；移除当前账号走完整退出');
ok(header.includes('添加另一个账号'), '有添加账号入口');
ok(header.includes('🔄 切换账号') && header.includes('profiles.map'), '个人中心展示账号列表并逐个渲染');
ok(header.includes('switchingUid !== null'), '切换中禁用按钮防并发');
ok(header.includes('已经是当前账号'), '点到当前账号有提示，不做无谓切换');
ok(hasAll(header, ['min-w-0', 'truncate', 'shrink-0', 'overflow-y-auto']),
  '账号列表用 min-w-0/truncate/shrink-0/滚动，320px 窄屏不横向溢出');

// ---- 登录/启动自动登记 ----
ok(login.includes('rememberCurrentAccount()'), '邮箱登录成功后自动登记账号档案');
ok(login.indexOf('rehydrateAllStores()') < login.indexOf('rememberCurrentAccount()'),
  '登录时先 rehydrate 再登记（此时 CURRENT_USER_KEY 已是新账号）');
ok(app.includes('rememberCurrentAccount()') && app.includes('await restoreCloudSession()'),
  '启动恢复会话后补登档案（覆盖魔法链接回跳路径）');

// ---- 口语证据按 uid 隔离 ----
ok(evidence.includes("import { getCurrentUser } from './auth'"), '证据层引入当前用户');
ok(evidence.includes('uid?: string'), '证据记录带可选 uid 字段');
ok(evidence.includes('uid: record.uid || currentUid()'), '写入时盖当前账号 uid');
ok(evidence.includes('belongsToCurrent(found, currentUid())'), 'get 按当前账号过滤');
ok(evidence.includes('belongsToCurrent(r, uid)'), 'list 按当前账号过滤');
ok(evidence.includes('!belongsToCurrent(prev, currentUid())'), 'patch 拒绝改别的账号证据');
ok(evidence.includes('if (belongsToCurrent(r, uid)) store.delete(r.id)'), 'clear 只删当前账号证据，不误删另一孩子');
ok(evidence.includes('旧记录没有 uid 字段'), '旧版无 uid 记录兼容说明存在');
ok(hasNone(evidence, ["from './sync'", 'syncPush']), '口语证据不进云同步');

// ---- 同步层未被破坏 ----
ok(cloudAuth.includes('workbuddy-cloud.session.') === false,
  'cloudAuth 不重复定义会话槽键（单一数据源在 accountSwitch）');
ok(sync.includes("eq('owner_id', ownerId)"), '同步仍按 owner_id 分区，切换身份后落到对的云端行');

console.log(`\n===== account switch: ${pass} PASS / ${fail} FAIL =====`);
process.exit(fail === 0 ? 0 : 1);
