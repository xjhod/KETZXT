// ========== 自动同步 + 本机分片诊断 校验入口 ==========
// 两层：localShards 纯函数（rolldown 打包后真实执行） -> 静态接线护栏。
// 覆盖：防死循环、退出前上传、启动补传、串行队列、P0 证据不上云、窄屏不溢出。
import { rolldown } from 'rolldown';
import { readFileSync } from 'node:fs';

const failures = [];
let passed = 0;
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`);
  if (cond) passed++;
  else failures.push(name);
};
const read = (p) => readFileSync(p, 'utf8');
const has = (src, s) => src.includes(s);

async function bundleModule(path) {
  const bundle = await rolldown({ input: path });
  const { output } = await bundle.generate({ format: 'esm' });
  const url = 'data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64');
  return import(url);
}

// ---- 1. localShards 纯函数实跑 ----
const shards = await bundleModule('src/utils/localShards.ts');
const { inspectLocalShards, maskUid } = shards;

function mockStorage(entries) {
  const m = new Map(Object.entries(entries));
  return {
    get length() { return m.size; },
    key(i) { return [...m.keys()][i] ?? null; },
    getItem(k) { return m.has(k) ? m.get(k) : null; },
  };
}
const persist = (state) => JSON.stringify({ state, version: 1 });

const U1 = '2118952040737542144';
const U2 = '2118533692308590592';
const st = mockStorage({
  [`ket-progress-v1:${U1}`]: persist({ answerRecords: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], sessionRecords: [{ id: 's1' }] }),
  [`ket-plan-v1:${U1}`]: persist({ logs: { '2026-11-10': {}, '2026-11-11': {} } }),
  [`ket-daily-checkin-v1:${U1}`]: persist({ points: { g1: {}, g2: {}, g3: {} } }),
  [`ket-vocab-v1:${U1}`]: persist({ words: { w1: {}, w2: {} }, sentences: [{ id: 'x' }] }),
  [`ket-progress-v1:${U2}`]: persist({ answerRecords: [{ id: 'z' }], sessionRecords: [] }),
  'ket-progress-v1:__migrated__': '1',
  'ket-progress-v1': persist({ answerRecords: [] }), // 旧版全局键，无 uid，不应被识别
  'ket-theme': 'dark',
});

ok('导出两个纯函数', typeof inspectLocalShards === 'function' && typeof maskUid === 'function');
ok('空 storage 返回空数组', inspectLocalShards(U1, mockStorage({})).length === 0);

const r = inspectLocalShards(U1, st);
ok('识别出 2 个分片', r.length === 2, `got=${r.length}`);
const cur = r.find((x) => x.uid === U1);
const other = r.find((x) => x.uid === U2);
ok('当前分片标记正确', cur?.isCurrent === true && other?.isCurrent === false);
ok('答题记录 3 条', cur?.answerRecords === 3, `got=${cur?.answerRecords}`);
ok('会话记录 1 条', cur?.sessionRecords === 1);
ok('计划日志 2 天', cur?.planLogs === 2);
ok('语法点 3 个', cur?.grammarPoints === 3);
ok('词汇 2 个', cur?.vocabWords === 2);
ok('造句 1 条', cur?.sentences === 1);
ok('四个 store 键都计入', cur?.storeKeys.length === 4);
ok('按体积降序', r[0].bytes >= r[1].bytes);
ok('migrated 标记不产生分片', !r.some((x) => x.uid.includes('__migrated__')));
ok('旧版全局键不产生分片', !r.some((x) => !x.uid));
ok('另一个分片答题 1 条', other?.answerRecords === 1);
ok('未登录时全部 isCurrent=false', inspectLocalShards(null, st).every((x) => !x.isCurrent));

const broken = inspectLocalShards(U1, mockStorage({ [`ket-progress-v1:${U1}`]: '{bad json' }));
ok('损坏 JSON 不抛异常', broken.length === 1 && broken[0].answerRecords === 0);
ok('uid 遮盖不泄露全号', maskUid(U1) === '211895…2144', maskUid(U1));
ok('短 uid 原样返回', maskUid('abc') === 'abc');

// ---- 1b. syncSchedule 周期兜底纯函数实跑（2026-11-11） ----
const schedule = await bundleModule('src/utils/syncSchedule.ts');
const {
  DAY_MS, PERIODIC_CHECK_MS, RETRY_AFTER_MS,
  SYNC_INTERVAL_OPTIONS, LAST_SYNC_KEY, INTERVAL_KEY,
  normalizeIntervalDays, readIntervalDays, writeIntervalDays,
  readLastSyncAt, writeLastSyncAt, decidePeriodicSync,
  describeNextCheck, formatSyncTime,
} = schedule;

function mockKV(initial = {}) {
  const m = new Map(Object.entries(initial));
  return {
    getItem(k) { return m.has(k) ? m.get(k) : null; },
    setItem(k, v) { m.set(k, String(v)); },
    _map: m,
  };
}
const T0 = Date.UTC(2026, 10, 11, 1, 0, 0);
const base = (over = {}) => ({
  now: T0, lastSyncAt: null, intervalMs: DAY_MS, connected: true,
  lastAttemptAt: null, lastFailed: false, ...over,
});

ok('周期常量符合口径', DAY_MS === 86_400_000 && PERIODIC_CHECK_MS === 1_800_000 && RETRY_AFTER_MS === 600_000);
ok('频率只有 1/3/7 天三档', SYNC_INTERVAL_OPTIONS.map((o) => o.days).join(',') === '1,3,7');
ok('非法频率一律回落到每天', [0, 2, 99, -1, 'abc', null, undefined].every((v) => normalizeIntervalDays(v) === 1));
ok('3/7 天频率保留', normalizeIntervalDays(3) === 3 && normalizeIntervalDays(7) === 7 && normalizeIntervalDays('3') === 3);
ok('元数据键不带分片冒号（不会被 localShards 统计）', !LAST_SYNC_KEY.includes(':') && !INTERVAL_KEY.includes(':'));

const kv = mockKV();
ok('默认频率为每天', readIntervalDays(kv) === 1);
ok('频率写入后可持久读回', writeIntervalDays(kv, 3) === 3 && readIntervalDays(kv) === 3 && kv.getItem(INTERVAL_KEY) === '3');
ok('频率写入非法值被纠正', writeIntervalDays(kv, 999) === 1 && readIntervalDays(kv) === 1);
ok('从未同步时读到 null', readLastSyncAt(kv, T0) === null);
writeLastSyncAt(kv, T0 - 2 * DAY_MS);
ok('上次成功时间可持久读回', readLastSyncAt(kv, T0) === T0 - 2 * DAY_MS);
ok('损坏的时间值按无效处理', readLastSyncAt(mockKV({ [LAST_SYNC_KEY]: 'oops' }), T0) === null);
ok('负数时间按无效处理', readLastSyncAt(mockKV({ [LAST_SYNC_KEY]: '-5' }), T0) === null);
ok('未来时间按无效处理（防系统时钟改动锁死兜底）', readLastSyncAt(mockKV({ [LAST_SYNC_KEY]: String(T0 + DAY_MS) }), T0) === null);
ok('storage 抛异常不崩', (() => {
  const bad = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  return readLastSyncAt(bad, T0) === null && readIntervalDays(bad) === 1 && (writeLastSyncAt(bad, T0), true);
})());

const dOff = decidePeriodicSync(base({ connected: false }));
ok('未连接云端不触发、仍定期检查', dOff.shouldSync === false && dOff.reason === 'no-connection' && dOff.checkInMs === PERIODIC_CHECK_MS);
ok('从未成功同步 → 立即兜底一次', decidePeriodicSync(base()).shouldSync === true && decidePeriodicSync(base()).reason === 'never-synced');
ok('刚同步过 → 不重复上传', decidePeriodicSync(base({ lastSyncAt: T0 - 60_000 })).shouldSync === false);
ok('整 1 天到期 → 触发', decidePeriodicSync(base({ lastSyncAt: T0 - DAY_MS })).reason === 'due');
ok('差 1 分钟不到 1 天 → 不触发', (() => {
  const d = decidePeriodicSync(base({ lastSyncAt: T0 - DAY_MS + 60_000 }));
  return d.shouldSync === false && d.reason === 'not-due';
})());
ok('每 3 天：2 天前不触发', decidePeriodicSync(base({ lastSyncAt: T0 - 2 * DAY_MS, intervalMs: 3 * DAY_MS })).shouldSync === false);
ok('每 3 天：3 天前触发', decidePeriodicSync(base({ lastSyncAt: T0 - 3 * DAY_MS, intervalMs: 3 * DAY_MS })).reason === 'due');
ok('每 7 天：6 天前不触发', decidePeriodicSync(base({ lastSyncAt: T0 - 6 * DAY_MS, intervalMs: 7 * DAY_MS })).shouldSync === false);
ok('上次失败、刚失败 → 等重试窗口', (() => {
  const d = decidePeriodicSync(base({ lastSyncAt: T0 - 60_000, lastFailed: true, lastAttemptAt: T0 - 60_000 }));
  return d.shouldSync === false && d.reason === 'not-due' && d.checkInMs <= RETRY_AFTER_MS;
})());
ok('上次失败、过了 10 分钟 → 自动重试', decidePeriodicSync(base({ lastFailed: true, lastAttemptAt: T0 - RETRY_AFTER_MS })).reason === 'retry');
ok('失败优先于「刚同步过」', decidePeriodicSync(base({ lastSyncAt: T0 - 60_000, lastFailed: true, lastAttemptAt: T0 - RETRY_AFTER_MS })).shouldSync === true);
ok('首次失败无尝试时间也会重试', decidePeriodicSync(base({ lastFailed: true, lastAttemptAt: null })).reason === 'retry');
ok('检查间隔夹在 1~30 分钟', (() => {
  const samples = [
    decidePeriodicSync(base({ lastSyncAt: T0 - 1000 })).checkInMs,
    decidePeriodicSync(base({ lastSyncAt: T0 - DAY_MS + 1000 })).checkInMs,
    decidePeriodicSync(base({ lastFailed: true, lastAttemptAt: T0 - 1000 })).checkInMs,
  ];
  return samples.every((ms) => ms >= 60_000 && ms <= PERIODIC_CHECK_MS);
})());
ok('下次检查文案可读', describeNextCheck(PERIODIC_CHECK_MS) === '约 30 分钟后' && describeNextCheck(0) === '即将检查');
ok('上次成功时间文案可读', formatSyncTime(null) === '本机还没有成功同步过' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(formatSyncTime(T0)));

// ---- 2. 静态接线护栏 ----
const auto = read('src/utils/autoSync.ts');
const scheduleSrc = read('src/utils/syncSchedule.ts');
const app = read('src/App.tsx');
const header = read('src/components/Header.tsx');
const login = read('src/pages/LoginPage.tsx');
const sync = read('src/utils/sync.ts');
const evidence = read('src/utils/speechEvidence.ts');

ok('订阅四个学习 store', ['useProgressStore.subscribe', 'usePlanStore.subscribe', 'useDailyCheckinStore.subscribe', 'useVocabStore.subscribe'].every((s) => has(auto, s)));
ok('同步期间屏蔽订阅回调（防死循环）', has(auto, 'if (suppressed) return;'));
ok('所有同步走串行队列', has(auto, 'function enqueue') && has(auto, '.then(task)'));
ok('上传统一用 syncPush（先合并云端再回传）', has(auto, 'syncPush()') && !has(auto, 'syncNow('));
ok('启动补传 + 30 秒节流', has(auto, 'startAutoSync') && has(auto, 'STARTUP_THROTTLE_MS'));
ok('切后台 / 页面隐藏 / 恢复网络都补传', has(auto, 'visibilitychange') && has(auto, 'pagehide') && has(auto, "'online'"));
ok('防抖与最小间隔都在', has(auto, 'DEBOUNCE_MS') && has(auto, 'MIN_INTERVAL_MS'));
ok('flush 有超时上限', has(auto, 'FLUSH_TIMEOUT_MS') && has(auto, 'Promise.race'));
ok('失败不阻塞（catch 内不 rethrow）', has(auto, '失败不阻塞'));

// ---- 2b. 同步反馈可观测性（2026-11-11 真机反馈「点 ☁️ 没反应」） ----
ok('flush 返回真实结果而非 void', has(auto, 'export interface FlushResult') && has(auto, 'Promise<FlushResult>'));
ok('doSync 透传 SyncStatus', has(auto, 'Promise<SyncStatus | null>') && has(auto, 'return res;'));
ok('超时与失败区分开', has(auto, 'timedOut: true') && has(auto, '同步仍在后台进行'));
ok('未连接云端时 flush 也给明确原因', has(auto, "return { ok: false, message: '未连接云端"));
ok('flush 超时定时器会被清理', has(auto, 'clearTimeout(timeoutId)'));
ok('UI 不再靠 getAutoSyncState 猜结果', !has(header, 'const s = getAutoSyncState();'));
ok('手动同步用 flush 的真实返回值', has(header, 'const res = await flushAutoSync();') && has(header, 'res.ok') && has(header, 'res.message'));
ok('超时分支显示为进行中而非失败', has(header, 'res.timedOut') && has(header, "showHint(res.message, 'info')"));
ok('☁️ 按钮不再被静默禁用', !has(header, 'disabled={syncing || !cloudOn}') && !has(header, 'cursor-not-allowed'));
ok('未连接云端点击有可见提示', has(header, "showHint('未连接云端"));
ok('同步中再次点击也有提示', has(header, "showHint('正在同步，请稍候…'"));
ok('点击瞬间先给正在同步反馈', has(header, "showHint('正在同步到云端…'"));
ok('多次提示互相清理定时器', has(header, 'clearTimeout(hintTimerRef.current)') && has(header, 'useRef<ReturnType<typeof setTimeout>'));
ok('组件卸载清理提示定时器', has(header, 'useEffect(() => () =>'));
ok('手机端有可见 toast', has(header, 'role="status"') && has(header, 'aria-live="polite"') && has(header, '{syncHint && ('));
ok('toast 不占顶栏宽度且窄屏不溢出', has(header, 'absolute right-3 top-full') && has(header, 'max-w-[75vw]') && has(header, 'break-words'));
ok('toast 三种色调', has(header, "hintTone === 'error'") && has(header, "hintTone === 'ok'"));
ok('常驻状态只在宽屏显示', has(header, 'hidden sm:inline-block') && has(header, 'title={syncLabel}'));

ok('App 引入并启动 autoSync', has(app, "from './utils/autoSync'") && has(app, 'startAutoSync();') && has(app, 'stopAutoSync();'));
ok('启动顺序在 restoreCloudSession 之后', app.indexOf('await restoreCloudSession()') < app.indexOf('startAutoSync();'));
ok('App 卸载时移除监听', app.indexOf('stopAutoSync();') > app.indexOf('startAutoSync();'));

const logoutAt = header.indexOf('const handleLogout');
const flushAt = header.indexOf('await flushAutoSync();', logoutAt);
const unlinkAt = header.indexOf('await unlinkCloud();', logoutAt);
ok('退出登录前先上传再解绑', logoutAt > -1 && flushAt > -1 && unlinkAt > flushAt, `flush=${flushAt} unlink=${unlinkAt}`);
ok('Header 不再直接调 syncNow', !has(header, 'syncNow('));
ok('手动同步与改昵称都走 flushAutoSync', (header.match(/await flushAutoSync\(\)/g) || []).length >= 2);
ok('Header 订阅自动同步状态', has(header, 'subscribeAutoSync(setAutoSync)'));
ok('Header 显示自动同步状态', has(header, '已自动同步') && has(header, '同步失败'));
ok('分片诊断只读且按需扫描', has(header, 'inspectLocalShards(getCurrentUser()?.id ?? null, localStorage)') && has(header, '只读诊断，不合并、不删除'));
ok('账号 ID 遮盖显示', has(header, 'maskUid(getCloudLinkedUid()!)'));
ok('窄屏防溢出护栏', has(header, 'truncate max-w-[170px]') && has(header, 'break-all min-w-0') && has(header, 'max-h-44 overflow-y-auto'));

ok('登录页文案说明真实同步时机', has(login, '退出登录或切到后台也会补传') && has(login, '右上角 ☁️ 可手动同步'));

ok('P0 证据仍不进云同步', !has(sync, 'speechEvidence') && !has(sync, 'audioBlob'));
ok('autoSync 不导入/不调用本机证据库', !has(auto, "from './speechEvidence'") && !has(auto, 'putSpeechEvidence') && !has(auto, 'saveSpeechEvidence') && !has(auto, 'audioBlob'));
ok('证据文件保留 7 天 TTL', has(evidence, 'EVIDENCE_TTL_DAYS'));

// ---- 2c. 周期兜底（每天/几天自动同步一次）接线 ----
const shardsSrc = read('src/utils/localShards.ts');
const startAt = auto.indexOf('export function startAutoSync');
const periodicRegisterAt = auto.indexOf('schedulePeriodicCheck(PERIODIC_CHECK_MS);', startAt);
const cloudGuardAt = auto.indexOf('if (!isCloudConnected()) return;', startAt);
ok('周期判定来自 syncSchedule 纯函数', has(auto, "from './syncSchedule'") && has(auto, 'decidePeriodicSync({') && has(scheduleSrc, 'export function decidePeriodicSync'));
ok('成功同步持久化上次成功时间', has(auto, 'writeLastSyncAt(safeStorage(), lastPushAt)'));
ok('失败 10 分钟后自动重试', (auto.match(/schedulePeriodicCheck\(RETRY_AFTER_MS\)/g) || []).length >= 2);
ok('成功后重排 30 分钟检查', has(auto, 'schedulePeriodicCheck(PERIODIC_CHECK_MS)'));
ok('周期表是动态 setTimeout，不是死板的 24h 定时器', has(auto, 'periodicTimer = setTimeout') && !has(auto, 'setInterval('));
ok('周期表在云端连接守卫之前注册（登录后不重挂载也生效）', periodicRegisterAt > -1 && cloudGuardAt > periodicRegisterAt);
ok('启动必传仍在，周期表不替代启动同步', has(auto, '// 启动补一次') && has(auto, 'void doSync(true);'));
ok('恢复可见时补周期检查（移动端会冻结后台定时器）', has(auto, 'onVisibilityChange') && has(auto, 'runPeriodicCheck();'));
ok('stopAutoSync 清理周期定时器', has(auto, 'clearTimeout(periodicTimer)'));
ok('多标签去重：每次从 localStorage 重读上次成功时间', has(auto, 'lastSyncAt: readLastSyncAt(safeStorage())') && has(auto, '另一个标签刚成功同步过'));
ok('本机元数据不进云同步 payload', !has(sync, 'ket-autosync') && !has(sync, 'syncSchedule') && !has(auto, 'packPayload'));
ok('元数据键不被分片诊断扫描', !has(shardsSrc, 'ket-autosync'));
ok('Header 显示周期状态与频率设置', ['getPeriodicSyncInfo()', 'setSyncIntervalDays(', 'SYNC_INTERVAL_OPTIONS', 'describeNextCheck(', 'formatSyncTime(', 'id="sync-interval"'].every((s) => has(header, s)));
ok('频率下拉窄屏受控', has(header, 'w-full min-w-0 max-w-full') && has(header, 'break-words'));
ok('个人中心有立即同步入口', (header.match(/立即同步到云端/g) || []).length >= 2);
ok('文案不夸大：应用关闭时不会后台运行', has(header, '关闭时不会后台运行') && has(login, '应用关闭时不会后台运行'));
ok('登录页说明默认频率与可配', has(login, '默认每天') && has(login, '每 7 天'));

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('FAILED:', failures.join(' | '));
  process.exit(1);
}
