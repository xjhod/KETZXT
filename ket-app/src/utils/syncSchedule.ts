/**
 * 周期同步调度（2026-11-11）
 *
 * 变更驱动同步（做题后 4s、启动、切后台、退出、恢复网络）已经覆盖「有新数据」
 * 的场景，这里补一层时间兜底：应用长时间开着、或者没人记得点 ☁️ 时，
 * 每隔 N 天自动做一次完整同步，避免人为忘记。
 *
 * syncPush() 会先合并云端再回传，因此定时同步同时也是「定时拉取」——
 * 一直开着的设备也能看到另一台设备新做的题，不只是把本机数据推上去。
 *
 * 诚实边界：应用完全关闭时浏览器不执行 JS，不可能后台定时同步；
 * 这层靠「下次打开必然启动同步」覆盖，不承诺后台常驻。
 *
 * 本机元数据（上次成功时间、频率）只写 localStorage，不进 sync.ts 的
 * payload、不跨设备同步、不含任何学习数据，也不被 localShards 统计。
 */

export const DAY_MS = 24 * 60 * 60 * 1000;
/** 应用开着时的最长检查间隔：移动端后台会冻结定时器，恢复可见时会补检查 */
export const PERIODIC_CHECK_MS = 30 * 60 * 1000;
/** 上次同步失败后的重试间隔，比正常检查更积极 */
export const RETRY_AFTER_MS = 10 * 60 * 1000;

export const LAST_SYNC_KEY = 'ket-autosync-last-ok-v1';
export const INTERVAL_KEY = 'ket-autosync-interval-days-v1';

export const SYNC_INTERVAL_OPTIONS = [
  { days: 1, label: '每天' },
  { days: 3, label: '每 3 天' },
  { days: 7, label: '每 7 天' },
] as const;

export type SyncIntervalDays = 1 | 3 | 7;

/** 只依赖这三个方法，便于在 Node 里用 mock 真实执行纯函数 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function safeGet(storage: StorageLike | null | undefined, key: string): string | null {
  try {
    return storage ? storage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSet(storage: StorageLike | null | undefined, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {
    /* 隐私模式禁用 storage：只影响本机偏好，不影响同步主链路 */
  }
}

/** 只接受 1 / 3 / 7，其它值一律回落到每天，避免脏数据把兜底频率改成几年 */
export function normalizeIntervalDays(raw: unknown): SyncIntervalDays {
  const n = Number(raw);
  return n === 3 || n === 7 ? n : 1;
}

export function readIntervalDays(storage: StorageLike | null | undefined): SyncIntervalDays {
  return normalizeIntervalDays(safeGet(storage, INTERVAL_KEY));
}

export function writeIntervalDays(
  storage: StorageLike | null | undefined,
  days: number
): SyncIntervalDays {
  const d = normalizeIntervalDays(days);
  safeSet(storage, INTERVAL_KEY, String(d));
  return d;
}

/** 读上次成功同步的 epoch ms；未来时间（改过系统时钟）视为无效，否则兜底会被永久推迟 */
export function readLastSyncAt(
  storage: StorageLike | null | undefined,
  now = Date.now()
): number | null {
  const n = Number(safeGet(storage, LAST_SYNC_KEY));
  if (!Number.isFinite(n) || n <= 0 || n > now + 5 * 60_000) return null;
  return n;
}

export function writeLastSyncAt(
  storage: StorageLike | null | undefined,
  at: number
): void {
  safeSet(storage, LAST_SYNC_KEY, String(Math.round(at)));
}

export type PeriodicSyncReason =
  | 'no-connection'
  | 'never-synced'
  | 'due'
  | 'retry'
  | 'not-due';

export interface PeriodicSyncInput {
  now: number;
  /** 上次成功同步时间，null = 本机从未成功过 */
  lastSyncAt: number | null;
  intervalMs: number;
  connected: boolean;
  /** 上次尝试时间（含失败），用于失败后短间隔重试 */
  lastAttemptAt: number | null;
  lastFailed: boolean;
  retryAfterMs?: number;
  checkIntervalMs?: number;
}

export interface PeriodicSyncDecision {
  shouldSync: boolean;
  reason: PeriodicSyncReason;
  /** 建议多久后再次检查，已夹在 [1 分钟, checkIntervalMs] 内 */
  checkInMs: number;
}

/**
 * 纯函数：给定当前时刻与本机状态，判断此刻要不要触发一次兜底同步。
 * 优先级：未连接 > 失败待重试 > 从未成功 > 到期 > 未到期。
 */
export function decidePeriodicSync(input: PeriodicSyncInput): PeriodicSyncDecision {
  const {
    now,
    lastSyncAt,
    intervalMs,
    connected,
    lastAttemptAt,
    lastFailed,
    retryAfterMs = RETRY_AFTER_MS,
    checkIntervalMs = PERIODIC_CHECK_MS,
  } = input;
  const clamp = (ms: number) =>
    Math.max(60_000, Math.min(checkIntervalMs, Math.ceil(ms)));

  if (!connected) {
    return { shouldSync: false, reason: 'no-connection', checkInMs: checkIntervalMs };
  }

  // 失败优先于「刚同步过」：否则一次失败后要等满 N 天才会重试
  if (lastFailed) {
    const waited = lastAttemptAt == null ? retryAfterMs : now - lastAttemptAt;
    if (waited >= retryAfterMs) {
      return { shouldSync: true, reason: 'retry', checkInMs: checkIntervalMs };
    }
    return { shouldSync: false, reason: 'not-due', checkInMs: clamp(retryAfterMs - waited) };
  }

  if (lastSyncAt == null) {
    return { shouldSync: true, reason: 'never-synced', checkInMs: checkIntervalMs };
  }

  const elapsed = now - lastSyncAt;
  if (elapsed >= intervalMs) {
    return { shouldSync: true, reason: 'due', checkInMs: checkIntervalMs };
  }
  return { shouldSync: false, reason: 'not-due', checkInMs: clamp(intervalMs - elapsed) };
}

/** UI：「下次检查」文案 */
export function describeNextCheck(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '即将检查';
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `约 ${Math.max(1, mins)} 分钟后`;
  const hours = Math.round(ms / 3_600_000);
  if (hours < 24) return `约 ${hours} 小时后`;
  return `约 ${Math.round(ms / DAY_MS)} 天后`;
}

/** UI：上次成功同步时间，本地时区 */
export function formatSyncTime(at: number | null): string {
  if (at == null) return '本机还没有成功同步过';
  const d = new Date(at);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
