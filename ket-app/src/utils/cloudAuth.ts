/**
 * 云端账号（WorkBuddy Auth）—— 跨设备同步的身份基础
 *
 * 为什么需要它：
 *   云数据库的 RLS 用 `auth.uid()` 做行级隔离，即「谁能读自己的同步数据」取决于
 *   登录身份。本地那套 kid 用户名/密码是**离线**账号体系；云端则用 WorkBuddy 账号
 *   （手机号 / 邮箱验证码）作为身份 —— 两者是不同维度：
 *     · 本地 kid 账号：决定这台设备上「当前是哪个孩子在用」
 *     · 云端账号：决定「这台设备连到云端的哪份数据」
 *
 * 注册与登录统一走 `sendOtp` + `verifyOtp` 两步流程：
 *   - 家长/新用户输入手机号或邮箱 → sendOtp 发码（上游区分新老用户，返回 isExistingUser）
 *   - 输入验证码 → verifyOtp（带上 isExistingUser），由 SDK 决定走登录还是自动注册
 *   - 无需自建后台发码，新手机号/邮箱首次验码即自动建号
 *
 * 登录成功后：建一个本地镜像用户（id=云端 uid，无密码），复用现有分片存储；
 * 标记本机已连云端，记录 linked uid，并 rehydrate 三个学习 store。
 */

import { cloud } from './cloud';
import { upsertCloudUser } from './auth';
import { rehydrateAllStores } from '../store/rehydrateStores';

const SIGNED_IN_KEY = 'ket-cloud-signed-in';
const LINKED_UID_KEY = 'ket-cloud-linked-uid';

/** 云端登录状态 */
export interface CloudAccount {
  /** 用户 id（auth.uid()，文本） */
  userId: string;
  /** 显示名（可能为空） */
  name: string | null;
  /** 登录方式标识 */
  identifier: string | null;
}

export interface CloudAuthStatus {
  signedIn: boolean;
  account: CloudAccount | null;
  /** 未登录时的原因说明 */
  message: string;
}

/** OTP 流程中间态：发码返回的 challenge，验码时要用 */
interface PendingChallenge {
  verificationId: string;
  isExistingUser: boolean;
  /** 发码时用的标识（手机号或邮箱），验码必须传回同一个 */
  identifier: string;
}

let pendingChallenge: PendingChallenge | null = null;

/** 发码挑战持久化：点邮件链接会重开/跳转页面，内存里的 pendingChallenge 会丢 */
const PENDING_KEY = 'ket-cloud-pending-challenge';
/** 邮箱链接自动验码失败时，把后端原始错误留给登录页展示（便于一次定位） */
const LAST_ERROR_KEY = 'ket-cloud-last-error';
const PREFILL_CODE_KEY = 'ket-cloud-prefill-code';
const PREFILL_EMAIL_KEY = 'ket-cloud-prefill-email';

function persistChallenge(c: PendingChallenge | null): void {
  try {
    if (c) localStorage.setItem(PENDING_KEY, JSON.stringify(c));
    else localStorage.removeItem(PENDING_KEY);
  } catch {
    /* 隐私模式下 localStorage 不可用，忽略 */
  }
}

function loadChallenge(): PendingChallenge | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as PendingChallenge;
    if (c && typeof c.verificationId === 'string' && typeof c.identifier === 'string') return c;
  } catch {
    /* ignore */
  }
  return null;
}

/** 取出并清除「上一次邮箱链接登录失败」的原始错误（登录页启动调用一次） */
export function takeLastCloudError(): string | null {
  try {
    const v = localStorage.getItem(LAST_ERROR_KEY);
    if (v) localStorage.removeItem(LAST_ERROR_KEY);
    return v;
  } catch {
    return null;
  }
}

/** 取出邮箱链接带回的验证码 / 邮箱，供登录页预填（手动重试用） */
export function takeEmailPrefill(): { email: string; code: string } {
  try {
    const email = sessionStorage.getItem(PREFILL_EMAIL_KEY) ?? '';
    const code = sessionStorage.getItem(PREFILL_CODE_KEY) ?? '';
    sessionStorage.removeItem(PREFILL_EMAIL_KEY);
    sessionStorage.removeItem(PREFILL_CODE_KEY);
    return { email, code };
  } catch {
    return { email: '', code: '' };
  }
}

/** 当前会话（没有会话返回 null） */
export async function getCloudSession(): Promise<CloudAccount | null> {
  try {
    const { data, error } = await cloud.auth.getSession();
    if (error || !data) return null;
    // getSession() 返回的 data 本身是 CloudSession（不是 { session } 包装）
    const session: any = data;
    const user: any = session?.user ?? {};
    const uid = user?.id ?? user?.sub ?? session?.user_id ?? null;
    if (!uid) return null;
    return {
      userId: String(uid),
      name: user?.name ?? user?.nickname ?? null,
      identifier: user?.phone ?? user?.email ?? null,
    };
  } catch {
    return null;
  }
}

/** 查询登录状态（供 UI 展示） */
export async function getCloudAuthStatus(): Promise<CloudAuthStatus> {
  const account = await getCloudSession();
  if (account) {
    return { signedIn: true, account, message: '已连接云端' };
  }
  return {
    signedIn: false,
    account: null,
    message: '未连接云端：输入手机号或邮箱接收验证码即可连接，多台设备间自动同步',
  };
}

/** 本机是否已连接云端（会话本身由 SDK 管理，这里只做 UI 用的快速判断） */
export function isCloudConnected(): boolean {
  return localStorage.getItem(SIGNED_IN_KEY) === '1';
}

/** 标记本机已连接云端 */
export function markCloudConnected(connected: boolean): void {
  if (connected) localStorage.setItem(SIGNED_IN_KEY, '1');
  else localStorage.removeItem(SIGNED_IN_KEY);
}

/** 记录当前云端账号的 uid（与本地镜像用户 id 一致） */
export function setCloudLinkedUid(uid: string): void {
  if (uid) localStorage.setItem(LINKED_UID_KEY, uid);
}

/** 读取当前云端账号的 uid */
export function getCloudLinkedUid(): string | null {
  return localStorage.getItem(LINKED_UID_KEY);
}

/** 清除云端账号 uid 记录 */
export function clearCloudLinkedUid(): void {
  localStorage.removeItem(LINKED_UID_KEY);
}

/**
 * 发送验证码（手机号或邮箱二选一）。
 *
 * 走 `sendOtp`：它只发码并返回一个 `verificationId`，上游同时给出
 * `isExistingUser`（决定验码后走登录还是注册，由 SDK 处理，本端不猜）。
 *
 * @returns { ok, message, verificationId?, isExistingUser? }
 */
export async function sendCloudOtp(input: {
  phone?: string;
  email?: string;
}): Promise<{
  ok: boolean;
  message: string;
  /** 邮箱渠道为「魔法链接」模式时返回 true：邮件已发，需点链接完成登录 */
  magicLink?: boolean;
  verificationId?: string;
  isExistingUser?: boolean;
}> {
  const phone = (input.phone ?? '').trim();
  const email = (input.email ?? '').trim();

  let identifier: string;
  if (phone) {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return { ok: false, message: '请输入正确的 11 位手机号' };
    }
    identifier = phone;
  } else if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, message: '请输入正确的邮箱地址' };
    }
    identifier = email;
  } else {
    return { ok: false, message: '请填写手机号或邮箱' };
  }

  try {
    let challenge: { verificationId: string; isExistingUser: boolean };

    if (phone) {
      // 手机：走 SDK 正常 OTP（后端返回 verification_id + 发短信）
      const res = await cloud.auth.sendOtp({ phone });
      if (res?.error) {
        return { ok: false, message: `发送失败：${res.error.message || '未知错误'}` };
      }
      const c: any = res?.data;
      if (!c?.verificationId) {
        return { ok: false, message: '发送失败：服务端未返回可用的验证码流程' };
      }
      challenge = {
        verificationId: String(c.verificationId),
        isExistingUser: Boolean(c.isExistingUser),
      };
    } else {
      // 邮箱：走 SDK 原生 sendOtp（usage:'email'）。后端据此发送「确认链接」邮件，
      // 用户点链接 → 平台 /__auth/ 完成验证并写回本应用同源的云端会话，
      // 应用启动时的 restoreCloudSession 会把该会话恢复为本地镜像用户。
      // SDK 对邮箱分支刻意不回传 verification_id，会误报 "provider returned no verification_id"，
      // 但邮件其实已发出 —— 这里当作「链接已发送」成功处理。
      const sp = new URLSearchParams(window.location.search);
      const sc = sp.get('sharecode') || 'ILJMMGGVHE';
      const emailRedirectTo = `${window.location.origin}/?sharecode=${sc}`;
      // 记住邮箱，邮件链接回跳后登录页自动回填
      try {
        sessionStorage.setItem(PREFILL_EMAIL_KEY, email);
      } catch {
        /* ignore */
      }
      const res = await cloud.auth.sendOtp({ email, emailRedirectTo });
      if (res?.error) {
        const errMsg = res.error.message || '';
        // 邮箱分支固定误报这条；邮件已发，视为「链接已发送」
        if (/verification_id/i.test(errMsg)) {
          return {
            ok: true,
            magicLink: true,
            message:
              '登录邮件已发送：请打开邮件点「确认邮箱并登录」按钮，应用会自动完成登录（邮件正文不含数字验证码，无需手输）。收不到请检查垃圾邮件箱',
          };
        }
        return { ok: false, message: `发送失败：${errMsg || '未知错误'}` };
      }
      // 理论上海箱分支不会回传 verification_id；若极端情况下回了，则走与手机一致的验码流程
      const c: any = res?.data;
      if (!c?.verificationId) {
        return {
          ok: true,
          magicLink: true,
          message:
            '登录链接已发送到邮箱，请查收邮件并点击其中的「确认邮箱并登录」按钮完成登录（若收件箱没有，请检查垃圾邮件箱）',
        };
      }
      challenge = {
        verificationId: String(c.verificationId),
        isExistingUser: Boolean(c.isExistingUser),
      };
    }

    pendingChallenge = {
      verificationId: challenge.verificationId,
      isExistingUser: challenge.isExistingUser,
      identifier,
    };
    persistChallenge(pendingChallenge);
    return {
      ok: true,
      message: phone
        ? '验证码已发送，请查收短信'
        : '验证码已发送，请查收邮件（邮件里点确认按钮即可，无需手输）',
      verificationId: pendingChallenge.verificationId,
      isExistingUser: pendingChallenge.isExistingUser,
    };
  } catch (e) {
    return { ok: false, message: `发送失败：${(e as Error).message}` };
  }
}

/**
 * 调用 SDK 的 `verifyOtp` 完成登录 / 注册，并做本地收尾（建镜像用户、标记、切分片）。
 * 手机验证码（依赖发码时建立的 pendingChallenge）与邮箱验证码回调（依赖 URL 里的 env_id）
 * 共用同一套「调 SDK + 建本地镜像」逻辑，避免重复。
 */
async function runVerifyOtp(params: {
  email?: string;
  phone?: string;
  verificationId: string;
  token: string;
  isExistingUser: boolean;
}): Promise<{ ok: boolean; message: string; account?: CloudAccount; isNewUser?: boolean }> {
  try {
    const res = await cloud.auth.verifyOtp(params as any);
    if (res?.error) {
      const e: any = res.error;
      // 带上 kind / status，邮箱链接验码失败时登录页会把后端原始错误显示出来，便于定位
      const detail = [e.message, e.kind ? `[${e.kind}]` : '', e.status ? `HTTP ${e.status}` : '']
        .filter(Boolean)
        .join(' ');
      return { ok: false, message: `验证失败：${detail || '验证码错误'}` };
    }
    const session: any = res.data; // CloudSession
    const user: any = session?.user ?? {};
    const uid = String(user?.id ?? user?.sub ?? '');
    if (!uid) {
      return { ok: false, message: '登录未生效，请重试' };
    }

    const displayName = user?.name ?? user?.phone ?? user?.email ?? uid;

    // 建本地镜像用户（id=云端 uid，无密码），并设为当前用户
    upsertCloudUser(uid, displayName);
    // 标记本机已连云端 + 记录 linked uid
    markCloudConnected(true);
    setCloudLinkedUid(uid);
    // 让三个学习 store 立即切到新身份的分片
    await rehydrateAllStores();

    const account: CloudAccount = {
      userId: uid,
      name: displayName,
      identifier: user?.phone ?? user?.email ?? null,
    };
    return {
      ok: true,
      message: params.isExistingUser ? '云端已连接' : '注册成功，云端已连接',
      account,
      isNewUser: !params.isExistingUser,
    };
  } catch (e) {
    return { ok: false, message: `验证失败：${(e as Error).message}` };
  }
}

/**
 * 用验证码登录（手机渠道，依赖发码时建立的 pendingChallenge）。
 * 新用户会自动注册。
 */
export async function verifyCloudOtp(token: string): Promise<{
  ok: boolean;
  message: string;
  account?: CloudAccount;
  isNewUser?: boolean;
}> {
  const code = (token ?? '').trim();
  if (!code) {
    return { ok: false, message: '请输入验证码' };
  }
  // 邮箱链接回跳会重开页面，内存挑战丢失时从 localStorage 恢复
  const pc = pendingChallenge ?? loadChallenge();
  if (!pc) {
    return { ok: false, message: '请先点击「获取验证码」' };
  }
  const { verificationId, isExistingUser, identifier } = pc;
  const params: any = { verificationId, token: code, isExistingUser };
  // 验码必须传回与发码一致的标识（手机号或邮箱）
  if (identifier.includes('@')) params.email = identifier;
  else params.phone = identifier;

  const result = await runVerifyOtp(params);
  if (result.ok) {
    pendingChallenge = null;
    persistChallenge(null);
  }
  return result;
}

/** 退出云端登录（只解除本机，不删云端数据） */
export async function signOutCloud(): Promise<void> {
  try {
    await cloud.auth.signOut();
  } catch {
    /* 忽略：即使后端失败也要清掉本地状态 */
  }
}

/** 解除本机与云端的绑定（不影响云端已存的数据） */
export async function unlinkCloud(): Promise<void> {
  try {
    await cloud.auth.signOut();
  } catch {
    /* 忽略：即使后端失败也要清掉本地状态 */
  }
  markCloudConnected(false);
  clearCloudLinkedUid();
}

/**
 * 完成云端登录的本地收尾：建本地镜像用户、标记已连接、记 uid、切分片。
 * verifyCloudOtp（手机验证码）与 restoreCloudSession（邮箱魔法链接回调）共用。
 */
async function finishCloudSignIn(account: CloudAccount): Promise<void> {
  upsertCloudUser(account.userId, account.name ?? account.userId);
  markCloudConnected(true);
  setCloudLinkedUid(account.userId);
  await rehydrateAllStores();
}

/**
 * 读取邮件「确认邮箱并登录」按钮回跳时 URL 上的参数。
 * 实测链接形如：
 *   /__auth/?email=...&env_id=wb-...&is_user=false&redirect_uri=...&verificationCode=147162&verifyOpt=email_code#/login
 * 托管层把 /__auth/ 回退到本 SPA，因此这些 query 参数在本页可读。
 */
function readEmailCodeCallback(): {
  email: string;
  code: string;
  verificationId: string;
  isExistingUser: boolean;
} | null {
  try {
    const sp = new URLSearchParams(window.location.search);
    const email = sp.get('email');
    const code = sp.get('verificationCode');
    const envId = sp.get('env_id');
    if (!email || !code || !envId) return null;
    return {
      email,
      code,
      verificationId: envId,
      isExistingUser: sp.get('is_user') === 'true',
    };
  } catch {
    return null;
  }
}

/** 清掉邮件回跳参数，避免刷新重复触发（保留 sharecode，回到根路径） */
function cleanEmailCallbackParams(): void {
  try {
    const sp = new URLSearchParams(window.location.search);
    ['email', 'verificationCode', 'env_id', 'is_user', 'verifyOpt', 'redirect_uri'].forEach((k) =>
      sp.delete(k),
    );
    const s = sp.toString();
    history.replaceState(null, '', '/' + (s ? `?${s}` : '') + '#/login');
  } catch {
    /* ignore */
  }
}

/**
 * 应用启动时恢复云端会话 / 完成邮箱链接登录。
 *
 * 邮箱渠道：平台邮件只给「确认链接」按钮（正文无数字验证码），链接回跳时带着
 * `verificationCode` 与 `env_id`（验证会话 id）。这里取出二者直接走 verifyOtp 完成登录；
 * 失败时把后端原始错误写入 localStorage，由登录页展示，便于一次定位。
 *
 * 手机渠道 / 普通回访：直接读 SDK 已持久化的会话。
 */
export async function restoreCloudSession(): Promise<boolean> {
  const cb = readEmailCodeCallback();
  if (cb) {
    // 先落一份挑战 + 预填码，万一自动验码失败，用户仍可在登录页手动重试
    persistChallenge({
      verificationId: cb.verificationId,
      isExistingUser: cb.isExistingUser,
      identifier: cb.email,
    });
    try {
      sessionStorage.setItem(PREFILL_EMAIL_KEY, cb.email);
      sessionStorage.setItem(PREFILL_CODE_KEY, cb.code);
    } catch {
      /* ignore */
    }

    const r = await runVerifyOtp({
      email: cb.email,
      verificationId: cb.verificationId,
      token: cb.code,
      isExistingUser: cb.isExistingUser,
    });
    cleanEmailCallbackParams();
    if (r.ok) {
      pendingChallenge = null;
      persistChallenge(null);
      try {
        localStorage.removeItem(LAST_ERROR_KEY);
      } catch {
        /* ignore */
      }
      return true;
    }
    try {
      localStorage.setItem(LAST_ERROR_KEY, r.message);
    } catch {
      /* ignore */
    }
    return false;
  }

  const existing = await getCloudSession();
  if (existing) {
    await finishCloudSignIn(existing);
    return true;
  }
  return false;
}
