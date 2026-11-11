/**
 * 自动同步调度器（2026-11-11）
 *
 * 背景：换设备后进度空白。排查发现全仓只有「登录成功 / 手动点 ☁️ / 改昵称」
 * 三处会写云端，做题、打卡、背词、退出登录都不上传；云端两行 sync_payloads
 * 都是登录时生成的空包。这里把上传补成常态。
 *
 * 设计要点：
 *   1) 订阅四个学习 store，任何进度变化 → 4 秒防抖 → syncPush（先合并云端再回传）。
 *   2) 同步期间必须屏蔽订阅回调：syncPush 内部 mergePayload 会 setState，
 *      若不屏蔽会形成「同步 → setState → 再同步」死循环。
 *      期间的用户改动不会丢：flushAutoSync / 下次动作 / 下次启动都打包完整当前状态。
 *   3) 所有同步串行排队，避免退出登录、切后台、防抖任务并发互相踩。
 *   4) 失败不阻塞使用，只记状态；UI 通过 subscribeAutoSync 展示。
 *   5) 不改 sync.ts 的合并规则；口语本机证据库仍只存本机，不进云。
 */

import { isCloudConnected } from './cloudAuth';
import { syncPush } from './sync';
import { useProgressStore } from '../store/useProgressStore';
import { usePlanStore } from '../store/usePlanStore';
import { useDailyCheckinStore } from '../store/useDailyCheckinStore';
import { useVocabStore } from '../store/useVocabStore';

const DEBOUNCE_MS = 4_000;
const MIN_INTERVAL_MS = 15_000;
const STARTUP_THROTTLE_MS = 30_000;
const FLUSH_TIMEOUT_MS = 8_000;

export type AutoSyncPhase = 'off' | 'idle' | 'pending' | 'syncing' | 'ok' | 'error';

export interface AutoSyncState {
  phase: AutoSyncPhase;
  lastOkAt: string | null;
  lastError: string;
}

type Listener = (s: AutoSyncState) => void;

let state: AutoSyncState = { phase: 'off', lastOkAt: null, lastError: '' };
const listeners = new Set<Listener>();

let started = false;
/** 同步进行中：mergePayload 触发的 setState 不得再排队 */
let suppressed = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let lastPushAt = 0;
let lastStartupSyncAt = 0;
let unsubs: Array<() => void> = [];
let queue: Promise<void> = Promise.resolve();

function emit(patch: Partial<AutoSyncState>): void {
  const next = { ...state, ...patch };
  if (
    next.phase === state.phase &&
    next.lastOkAt === state.lastOkAt &&
    next.lastError === state.lastError
  ) return;
  state = next;
  for (const l of listeners) l(state);
}

export function getAutoSyncState(): AutoSyncState {
  return state;
}

export function subscribeAutoSync(listener: Listener): () => void {
  listeners.add(listener);
  listener(state);
  return () => { listeners.delete(listener); };
}

/** 串行队列：任何时刻只有一个同步请求在飞 */
function enqueue(task: () => Promise<void>): Promise<void> {
  queue = queue.then(task).catch(() => { /* 失败不阻断后续任务 */ });
  return queue;
}

function onStoreChange(): void {
  if (!isCloudConnected()) return;
  if (suppressed) return; // 见文件头第 2 条，防死循环
  schedulePush(false);
}

export function schedulePush(immediate = false, force = false): void {
  if (!isCloudConnected()) return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  emit({ phase: 'pending' });
  if (immediate) {
    void doSync(force);
    return;
  }
  timer = setTimeout(() => {
    timer = null;
    void doSync(false);
  }, DEBOUNCE_MS);
}

function doSync(force: boolean): Promise<void> {
  return enqueue(async () => {
    if (!force && Date.now() - lastPushAt < MIN_INTERVAL_MS) {
      // 距离上次上传太近：顺延，不丢改动
      schedulePush(false);
      return;
    }
    suppressed = true;
    emit({ phase: 'syncing' });
    try {
      // syncPush 本身先 readCloudRow + mergePayload，再打包上传，
      // 因此不会用空本地状态覆盖云端，也能把本机未上传的改动补上。
      const res = await syncPush();
      if (res.ok) {
        lastPushAt = Date.now();
        emit({ phase: 'ok', lastOkAt: new Date().toISOString(), lastError: '' });
      } else {
        emit({ phase: 'error', lastError: res.message });
      }
    } catch (e) {
      emit({ phase: 'error', lastError: (e as Error).message });
    } finally {
      suppressed = false;
    }
  });
}

/**
 * 立即上传并等待完成：退出登录、切后台、手动点 ☁️ 用。
 * 有超时上限，网络挂起时不卡住退出流程。
 */
export async function flushAutoSync(timeoutMs = FLUSH_TIMEOUT_MS): Promise<void> {
  if (!isCloudConnected()) return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  try {
    await Promise.race([
      doSync(true),
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  } catch {
    /* 失败不阻塞退出 */
  }
}

function onHidden(): void {
  if (document.visibilityState === 'hidden') schedulePush(true, true);
}
function onPageHide(): void {
  schedulePush(true, true);
}
function onOnline(): void {
  schedulePush(true, true);
}

/** App 启动、云端会话恢复之后调用；幂等，StrictMode 双挂载也安全 */
export function startAutoSync(): void {
  if (started) return;
  started = true;
  unsubs = [
    useProgressStore.subscribe(onStoreChange),
    usePlanStore.subscribe(onStoreChange),
    useDailyCheckinStore.subscribe(onStoreChange),
    useVocabStore.subscribe(onStoreChange),
  ];
  document.addEventListener('visibilitychange', onHidden);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('online', onOnline);
  emit({ phase: isCloudConnected() ? 'idle' : 'off' });

  if (!isCloudConnected()) return;
  if (Date.now() - lastStartupSyncAt < STARTUP_THROTTLE_MS) return;
  lastStartupSyncAt = Date.now();
  // 启动补一次：把上次会话没来得及上传的进度推上云，同时合并云端数据
  void doSync(true);
}

export function stopAutoSync(): void {
  if (!started) return;
  started = false;
  for (const u of unsubs) u();
  unsubs = [];
  document.removeEventListener('visibilitychange', onHidden);
  window.removeEventListener('pagehide', onPageHide);
  window.removeEventListener('online', onOnline);
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}
