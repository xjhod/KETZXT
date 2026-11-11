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

// ---- 2. 静态接线护栏 ----
const auto = read('src/utils/autoSync.ts');
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

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('FAILED:', failures.join(' | '));
  process.exit(1);
}
