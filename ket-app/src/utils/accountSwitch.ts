/**
 * 本机多账号切换（一台设备给两个孩子用）
 *
 * 为什么不用每次发验证码：
 *   登录的唯一目的是让云端 RLS 认得「现在是谁」，从而同步到对的 owner_id。
 *   WorkBuddy SDK 把登录会话存在 localStorage 的**单个固定槽**里
 *   （`workbuddy-cloud.session.<publishableKey>`），且每次请求都从该槽重读
 *   （SDK session-store.ts 的 `ensure()` → `store.read()`）。
 *   所以把「这个槽的内容 + 当前本地用户」一起换掉，就等于换账号 —— 不需要重新验码。
 *
 * 两个必须同时换的东西（缺一个就串号）：
 *   1. SDK 会话槽（决定 auth.uid() → 云端 owner_id）
 *   2. ket-app-current-user（决定五个 store 读哪份本地分片）
 *
 * 会话快照会失效的两种情况（诚实告知，不承诺永久免验证码）：
 *   - refreshToken 是每次续期轮换、旧句柄立即失效的句柄；同一账号若在**另一台设备**
 *     续了期，本机存的老快照就作废 → 预检会发现，提示重新验码一次。
 *   - 快照含 accessToken/refreshToken，属敏感凭据。只存本机 localStorage，
 *     不上传、不进日志（与 SDK 自身存储同安全级别）；共用设备的人能看到，属已知取舍。
 *
 * 预检策略：切换时把目标快照写回 SDK 槽 → 调 getCloudSession() 校验 uid 一致
 *   → 失败则恢复原槽并提示重新验码，绝不让「A 的会话配 B 的分片」发生。
 */

import { getCurrentUser, upsertCloudUser } from './auth';
import { CLOUD_PUBLISHABLE_KEY } from '../config/cloud';
import {
  getCloudSession,
  isCloudConnected,
  markCloudConnected,
  setCloudLinkedUid,
} from './cloudAuth';

/** 账号档案列表键（与五个学习分片分开，不进 sync payload） */
export const ACCOUNT_PROFILES_KEY = 'ket-account-profiles-v1';

/** SDK 会话槽键：与 SDK 源码 `STORAGE_KEY_PREFIX + publishableKey` 保持一致 */
export const SDK_SESSION_KEY = `workbuddy-cloud.session.${CLOUD_PUBLISHABLE_KEY}`;

export interface AccountProfile {
  /** 云端 uid = 本地镜像用户 id */
  uid: string;
  /** 邮箱 / 手机标识（脱敏前的原始值，仅本机） */
  label: string;
  /** 本机昵称 */
  nickname: string | null;
  /** SDK 会话原始 JSON（含凭据，仅本机） */
  sessionJson: string;
  /** 最近一次使用时间（毫秒） */
  savedAt: number;
}

export interface SwitchResult {
  ok: boolean;
  message: string;
  /** 目标账号快照失效，需要走一次邮箱验证码 */
  needRelogin?: boolean;
  uid?: string;
}

function readProfiles(): AccountProfile[] {
  try {
    const raw = localStorage.getItem(ACCOUNT_PROFILES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (p): p is AccountProfile =>
        !!p && typeof p.uid === 'string' && typeof p.sessionJson === 'string' && p.sessionJson.length > 0
    );
  } catch {
    return [];
  }
}

function writeProfiles(list: AccountProfile[]): void {
  try {
    localStorage.setItem(ACCOUNT_PROFILES_KEY, JSON.stringify(list));
  } catch {
    /* 隐私模式下 localStorage 不可用，静默失败 */
  }
}

/** 档案列表，按最近使用倒序 */
export function listProfiles(): AccountProfile[] {
  return readProfiles().sort((a, b) => b.savedAt - a.savedAt);
}

/** 当前账号是否已存档 */
export function isCurrentAccountSaved(): boolean {
  const uid = getCurrentUser()?.id;
  return !!uid && readProfiles().some((p) => p.uid === uid);
}

/**
 * 把「当前正在用的账号」存进档案。
 * 退出登录 / 切换账号 / 添加新账号之前都要先调一次，确保快照是最新的
 * （flush 可能触发 token 续期，所以要在这之后调用）。
 */
export function rememberCurrentAccount(): AccountProfile | null {
  if (!isCloudConnected()) return null;
  const raw = localStorage.getItem(SDK_SESSION_KEY);
  if (!raw) return null;
  let uid = '';
  let label = '';
  try {
    const s = JSON.parse(raw);
    uid = String(s?.user?.id ?? s?.user?.sub ?? '');
    label = String(s?.user?.email ?? s?.user?.phone ?? '');
  } catch {
    return null;
  }
  if (!uid) return null;

  const cur = getCurrentUser();
  const profile: AccountProfile = {
    uid,
    label: label || cur?.name || uid,
    nickname: cur?.nickname ?? null,
    sessionJson: raw,
    savedAt: Date.now(),
  };
  const list = readProfiles().filter((p) => p.uid !== uid);
  list.push(profile);
  writeProfiles(list);
  return profile;
}

/** 从档案移除一个账号（不影响云端数据） */
export function removeProfile(uid: string): void {
  writeProfiles(readProfiles().filter((p) => p.uid !== uid));
}

/**
 * 切换账号：先存当前号 → 校验目标会话 → 同时换 SDK 槽和本地当前用户。
 * 成功后调用方应 reload 页面，重置五个 store 内存 / autoSync / SDK 内存状态。
 */
export async function switchAccount(uid: string): Promise<SwitchResult> {
  if (!uid) return { ok: false, message: '账号 id 为空', needRelogin: true };

  // 1) 存当前号的最新快照（此刻 SDK 槽还是当前号）
  const currentRaw = localStorage.getItem(SDK_SESSION_KEY);
  rememberCurrentAccount();

  const target = readProfiles().find((p) => p.uid === uid);
  if (!target) {
    return { ok: false, message: '本机没有这个账号的登录记录', needRelogin: true };
  }

  // 2) 把目标快照写回 SDK 槽；SDK 每次请求都从槽重读，因此立即生效
  try {
    localStorage.setItem(SDK_SESSION_KEY, target.sessionJson);
  } catch {
    return { ok: false, message: '无法写入本机会话槽，请检查浏览器存储权限' };
  }

  // 3) 预检：验证会话有效且 uid 对齐，绝不让「A 会话 + B 分片」发生
  try {
    const acct = await getCloudSession();
    if (!acct || acct.userId !== uid) {
      restoreSlot(currentRaw);
      removeProfile(uid); // 失效快照留着只会反复失败，删掉让用户重新验码
      return {
        ok: false,
        message: '该账号登录已过期，请用邮箱验证码重新连接一次',
        needRelogin: true,
      };
    }

    // 4) 预检可能触发了续期，把换到的新 token 回写档案，避免旧快照下次失效
    const freshRaw = localStorage.getItem(SDK_SESSION_KEY);
    if (freshRaw) {
      const list = readProfiles().filter((p) => p.uid !== uid);
      list.push({ ...target, label: target.label, nickname: target.nickname, sessionJson: freshRaw, savedAt: Date.now() });
      writeProfiles(list);
    }

    // 5) 同时切本地身份：镜像用户（写 CURRENT_USER_KEY）+ 云端标记 + linked uid
    upsertCloudUser(uid, acct.name ?? target.label);
    markCloudConnected(true);
    setCloudLinkedUid(uid);

    return { ok: true, message: '已切换，正在重新加载…', uid };
  } catch {
    restoreSlot(currentRaw);
    return { ok: false, message: '切换失败：网络异常，请重试' };
  }
}

function restoreSlot(raw: string | null): void {
  try {
    if (raw) localStorage.setItem(SDK_SESSION_KEY, raw);
    else localStorage.removeItem(SDK_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** 邮箱 / 长 id 脱敏，供切换列表展示 */
export function maskLabel(label: string): string {
  const at = label.indexOf('@');
  if (at > 0) {
    const name = label.slice(0, at);
    const domain = label.slice(at + 1);
    return `${name.slice(0, 2)}${name.length > 2 ? '…' : ''}@${domain}`;
  }
  return label.length > 10 ? `${label.slice(0, 5)}…${label.slice(-4)}` : label;
}
