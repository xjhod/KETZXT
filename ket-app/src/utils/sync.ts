/**
 * 跨设备同步客户端
 *
 * 场景（用户原话）：自己用，可能 2 个小孩、多台移动端，要求简单。
 *
 * 设计取舍：
 *   1. **整包同步**，不做细粒度增量 —— 三个 store 打包成一份 JSON 传上去。
 *      数据量小（几千条答题记录也就几百 KB），整包让冲突处理变得可预测。
 *   2. **合并而非覆盖** —— 下载云端数据后与本地合并再上传，
 *      避免「另一台设备刚做的题被这台旧数据冲掉」。
 *   3. **服务端不存明文密码** —— 只传 PBKDF2 派生哈希 + 盐。
 *   4. **失败不阻塞使用** —— 网络不通时所有同步接口返回失败原因，
 *      应用继续本地可用，不影响做题。
 */

import { getUsers, getCurrentUser } from './auth';
import { hashPassword } from './crypto';
import { useProgressStore } from '../store/useProgressStore';
import { usePlanStore } from '../store/usePlanStore';
import { useDailyCheckinStore } from '../store/useDailyCheckinStore';

// 后端地址：与 AI 批改共用同一个 EdgeOne Pages 项目。
// 约定与 utils/llm.ts 保持一致 —— BASE 是「API 源站根」，具体路径里再带 /api：
//   VITE_LLM_API_BASE=https://xxx.edgeone.app  ->  https://xxx.edgeone.app/api/sync
// 未配置时走同源（前端与后端同域部署的场景）。
// 注意：import.meta.env 在非 Vite 运行时（如 Node 验证脚本）不存在，用可选链兜底。
const envBag = (import.meta as any)?.env ?? {};
const SYNC_BASE =
  (envBag.VITE_SYNC_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  (envBag.VITE_LLM_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  '';
const TIMEOUT_MS = 20_000;

/** 云端账号凭据（存本地，供后续 push 时复用） */
const CREDENTIALS_KEY = 'ket-sync-credentials';

interface Credentials {
  userId: string;
  name: string;
  salt: string;
  hash: string;
}

/** 同步包的负载结构 */
export interface SyncPayload {
  progress: unknown;
  plan: unknown;
  checkin: unknown;
  /** 客户端打包时间，用于判断新旧 */
  packedAt: string;
}

export interface SyncStatus {
  ok: boolean;
  message: string;
  /** 本次同步拉回并合并的记录条数 */
  merged?: number;
  updatedAt?: string;
}

// ========== 凭据管理 ==========

export function getCredentials(): Credentials | null {
  const raw = localStorage.getItem(CREDENTIALS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Credentials;
  } catch {
    return null;
  }
}

function saveCredentials(c: Credentials): void {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(c));
}

export function clearCredentials(): void {
  localStorage.removeItem(CREDENTIALS_KEY);
}

// ========== 打包 / 解包 ==========

/** 把三个 store 的持久化数据打包 */
export function packPayload(): SyncPayload {
  return {
    progress: useProgressStore.getState(),
    plan: usePlanStore.getState(),
    checkin: useDailyCheckinStore.getState(),
    packedAt: new Date().toISOString(),
  };
}

/**
 * 把云端包合并进本地 store。
 *
 * 合并规则（按「记录级」而非「整块级」，避免一台设备的旧状态盖掉另一台的新状态）：
 *   - answerRecords / sessionRecords：按 id 去重，时间新的胜出
 *   - plan.logs：按日期合并，同日取 completedAt 更新的
 *   - plan.cursor：取较大值（进度只能前进）
 *   - checkin.points：按语法点合并，right/wrong 取较大值，stage 取较大值
 *   - checkin.checkinDates：并集
 *   - checkin.streak / lastCheckinDate：取较新的
 */
export function mergePayload(remote: Partial<SyncPayload> | null | undefined): number {
  if (!remote) return 0;

  let mergedCount = 0;

  // ---- progress ----
  if (remote.progress) {
    const rp = remote.progress as {
      answerRecords?: Array<Record<string, any>>;
      sessionRecords?: Array<Record<string, any>>;
    };
    const local = useProgressStore.getState();

    if (Array.isArray(rp.answerRecords) && rp.answerRecords.length) {
      const byId = new Map<string, any>();
      for (const r of local.answerRecords) byId.set(r.id, r);
      for (const r of rp.answerRecords) {
        if (!r?.id) continue;
        const cur = byId.get(r.id);
        // 同一题记录：时间新的胜出；本地没有则直接加入
        if (!cur || String(r.answeredAt || '') > String(cur.answeredAt || '')) {
          // 无论新增还是覆盖，只要本地状态变了就计数
          mergedCount++;
          byId.set(r.id, r);
        }
      }
      const merged = [...byId.values()].sort(
        (a, b) => String(b.answeredAt || '').localeCompare(String(a.answeredAt || ''))
      );
      useProgressStore.setState({ answerRecords: merged.slice(0, 1000) } as any);
    }

    if (Array.isArray(rp.sessionRecords) && rp.sessionRecords.length) {
      const byId = new Map<string, any>();
      for (const s of local.sessionRecords) byId.set(s.id, s);
      for (const s of rp.sessionRecords) {
        if (!s?.id) continue;
        const cur = byId.get(s.id);
        if (!cur || String(s.completedAt || '') > String(cur.completedAt || '')) {
          mergedCount++;
          byId.set(s.id, s);
        }
      }
      const merged = [...byId.values()].sort(
        (a, b) => String(b.completedAt || '').localeCompare(String(a.completedAt || ''))
      );
      useProgressStore.setState({ sessionRecords: merged.slice(0, 200) } as any);
    }
  }

  // ---- plan ----
  if (remote.plan) {
    const rp = remote.plan as {
      startDate?: string | null;
      cursor?: number;
      logs?: Record<string, any>;
      skips?: Record<string, number>;
    };
    const local = usePlanStore.getState();
    const logs = { ...local.logs };
    for (const [date, log] of Object.entries(rp.logs || {})) {
      const cur = logs[date];
      if (!cur) {
        logs[date] = log;
        mergedCount++;
      } else if (String((log as any)?.completedAt || '') > String((cur as any)?.completedAt || '')) {
        logs[date] = log;
        mergedCount++;
      }
    }    const skips = { ...local.skips, ...(rp.skips || {}) };
    usePlanStore.setState({
      // 起始日取较早的那个（谁先开始算谁的）
      startDate: pickEarlier(local.startDate, rp.startDate),
      cursor: Math.max(local.cursor, rp.cursor || 0),
      logs,
      skips,
    } as any);
  }

  // ---- checkin ----
  if (remote.checkin) {
    const rp = remote.checkin as {
      points?: Record<string, any>;
      streak?: number;
      lastCheckinDate?: string | null;
      checkinDates?: string[];
    };
    const local = useDailyCheckinStore.getState();
    const points = { ...local.points };
    for (const [id, p] of Object.entries(rp.points || {})) {
      const cur = points[id];
      if (!cur) {
        points[id] = p;
        mergedCount++;
      } else {
        // 计数类字段取较大值（两台设备各做了一些题，取多的那个更接近真实总量）
        points[id] = {
          ...cur,
          introduced: cur.introduced || (p as any).introduced,
          stage: Math.max(cur.stage, (p as any).stage || 0),
          right: Math.max(cur.right, (p as any).right || 0),
          wrong: Math.max(cur.wrong, (p as any).wrong || 0),
          box: Math.max(cur.box, (p as any).box || 1),
          lastSeen: pickLater(cur.lastSeen, (p as any).lastSeen) ?? cur.lastSeen,
        };
      }
    }
    const dates = Array.from(new Set([...(local.checkinDates || []), ...(rp.checkinDates || [])])).sort();
    useDailyCheckinStore.setState({
      points,
      streak: Math.max(local.streak, rp.streak || 0),
      lastCheckinDate: pickLater(local.lastCheckinDate, rp.lastCheckinDate) ?? local.lastCheckinDate,
      checkinDates: dates,
    } as any);
  }

  return mergedCount;
}

function pickEarlier(a: string | null | undefined, b: string | null | undefined): string | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return a < b ? a : b;
}

function pickLater(a: string | null | undefined, b: string | null | undefined): string | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return a > b ? a : b;
}

// ========== 网络请求 ==========

async function postSync(body: unknown): Promise<{ ok: true; data: any } | { ok: false; reason: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(`${SYNC_BASE}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await resp.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      return { ok: false, reason: `服务端返回非 JSON（HTTP ${resp.status}）` };
    }
    if (!resp.ok || json?.ok === false) {
      return { ok: false, reason: json?.error || `HTTP ${resp.status}` };
    }
    return { ok: true, data: json };
  } catch (e) {
    const err = e as Error;
    if (err.name === 'AbortError') return { ok: false, reason: '请求超时' };
    return { ok: false, reason: err.message || '网络错误' };
  } finally {
    clearTimeout(timer);
  }
}

// ========== 对外接口 ==========

/**
 * 云端登录 —— 用「用户名 + 密码」在云端找回/创建账号。
 *
 * 两阶段握手（与服务端约定）：
 *   阶段1：用用户名换取服务端持有的**权威盐**
 *   阶段2：用「权威盐 + 密码」派生哈希，提交认证
 *
 * 为什么必须两阶段：PBKDF2 的盐是账号级而非设备级。
 * 若每台设备各自生成盐，派生出的哈希必然不同，服务端无法校验，
 * 也就无法做到「同一个账号在多台设备登录」。
 *
 * @param name 用户名
 * @param password 明文密码（只在内存中用于派生哈希，不落盘、不上传）
 */
export async function syncLogin(name: string, password: string): Promise<SyncStatus> {
  const local = getUsers().find(u => u.name.toLowerCase() === name.trim().toLowerCase());
  if (!local) {
    return { ok: false, message: '本机没有这个账号，请先在本机注册' };
  }

  // ---------- 阶段1：换权威盐 ----------
  const stage1 = await postSync({ op: 'login', name: name.trim() });
  if (!stage1.ok) {
    return { ok: false, message: stage1.reason };
  }

  const serverSalt: string = stage1.data?.salt || '';
  const needsRegister = Boolean(stage1.data?.needsRegister);

  // 账号已存在：必须用服务端给的盐；新账号则用本地账号的盐（没有就现生成）
  let salt = serverSalt;
  if (!salt) {
    salt = local.salt || generateSaltFallback();
  }
  if (!needsRegister && serverSalt && local.salt && local.salt !== serverSalt) {
    // 本地盐与服务端不一致（多设备场景），以服务端为准，并回写本地
    local.salt = serverSalt;
    saveUsersLocal();
  }

  // ---------- 阶段2：派生并认证 ----------
  const hash = await hashPassword(password, salt);
  // 同步回写本地账号的哈希，保证下次本机登录仍可用
  local.salt = salt;
  local.hash = hash;
  delete (local as any).password;
  saveUsersLocal();

  const res = await postSync({
    op: 'login',
    name: name.trim(),
    hash,
    salt,
  });

  if (!res.ok) {
    return { ok: false, message: res.reason };
  }

  const d = res.data;
  const creds: Credentials = {
    userId: d.userId,
    name: d.name,
    salt: d.salt,
    hash,
  };
  saveCredentials(creds);

  // 合并云端数据
  const merged = mergePayload(d.payload);

  // 合并后把完整数据回传，保证云端是最新的完整状态
  const push = await postSync({
    op: 'push',
    userId: creds.userId,
    hash: creds.hash,
    salt: creds.salt,
    payload: packPayload(),
  });

  if (!push.ok) {
    return { ok: false, message: `已登录但上传失败：${push.reason}` };
  }

  return {
    ok: true,
    message: d.created ? '云端账号已创建' : '同步完成',
    merged,
    updatedAt: push.data?.updatedAt,
  };
}

/**
 * 上传本地数据（需先 syncLogin 过）
 */
export async function syncPush(): Promise<SyncStatus> {
  const creds = getCredentials();
  if (!creds) {
    return { ok: false, message: '尚未连接云端，请先在「同步」里登录' };
  }
  const res = await postSync({
    op: 'push',
    userId: creds.userId,
    hash: creds.hash,
    salt: creds.salt,
    payload: packPayload(),
  });
  if (!res.ok) return { ok: false, message: res.reason };
  return { ok: true, message: '已上传', updatedAt: res.data?.updatedAt };
}

/**
 * 拉取云端数据并合并到本地
 */
export async function syncPull(): Promise<SyncStatus> {
  const creds = getCredentials();
  if (!creds) {
    return { ok: false, message: '尚未连接云端，请先在「同步」里登录' };
  }
  // 已持有凭据，直接带哈希请求（服务端会校验），不需要两阶段握手
  const res = await postSync({
    op: 'login',
    name: creds.name,
    hash: creds.hash,
    salt: creds.salt,
  });
  if (!res.ok) return { ok: false, message: res.reason };
  const merged = mergePayload(res.data?.payload);
  return {
    ok: true,
    message: merged > 0 ? `已同步 ${merged} 条新记录` : '已是最新',
    merged,
    updatedAt: res.data?.updatedAt,
  };
}

/** 当前是否已连接云端 */
export function isCloudConnected(): boolean {
  return getCredentials() !== null;
}

/** 当前登录用户是否与云端账号一致 */
export function isCurrentUserSynced(): boolean {
  const cur = getCurrentUser();
  const creds = getCredentials();
  if (!cur || !creds) return false;
  return creds.name.toLowerCase() === cur.name.toLowerCase();
}

// ========== 内部工具 ==========

function saveUsersLocal(): void {
  // 复用 auth.ts 的存储键，避免出现两份用户数据
  const users = getUsers();
  localStorage.setItem('ket-app-users', JSON.stringify(users));
}

function generateSaltFallback(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
