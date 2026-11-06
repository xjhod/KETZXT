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
import { CLOUD_ENDPOINT, CLOUD_PUBLISHABLE_KEY } from '../config/cloud';

const SIGNED_IN_KEY = 'ket-cloud-signed-in';
const LINKED_UID_KEY = 'ket-cloud-linked-uid';

/**
 * SDK 持久化云端会话的 localStorage key（与 SDK 内部 SessionStore 一致：
 * `workbuddy-cloud.session.<publishableKey>`）。邮箱魔法链接回调时，SDK 自身没有
 * 对应的「完成登录」API，这里需要 best-effort 直接写入这个 key 来重建会话。
 */
const SESSION_STORAGE_KEY = `workbuddy-cloud.session.${CLOUD_PUBLISHABLE_KEY}`;

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
      // 邮箱：直接命中 /v1/verification，请求体与手机同构（用 email 替代 phone_number、
      // 同样带 target:'ANY'），让后端像手机一样回传 verification_id 并发送「数字验证码」，
      // 彻底绕开 SDK 默认的 usage:'email' 魔法链接分支（它不发 verification_id，
      // 导致客户端无法走验码登录）。之后完全复用手机的 verifyOtp 链路。
      const res = await fetch(`${CLOUD_ENDPOINT}/v1/verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wb-webapp-access-key': CLOUD_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ email, target: 'ANY' }),
      });
      let payload: any = null;
      try {
        payload = await res.json();
      } catch {
        /* 响应体非 JSON 时忽略，下面按失败处理 */
      }
      if (!res.ok || !payload || typeof payload !== 'object') {
        const msg =
          (payload && (payload.message || payload.error)) || `发送失败（HTTP ${res.status}）`;
        return { ok: false, message: String(msg) };
      }
      const verificationId =
        typeof payload.verification_id === 'string' ? payload.verification_id : '';
      if (!verificationId) {
        // 兜底：后端仍走魔法链接、未回传 verification_id —— 降级为「去邮件点链接」
        return {
          ok: true,
          magicLink: true,
          message:
            '登录链接已发送到邮箱，请查收邮件并点击"确认登录"按钮完成登录（若收件箱没有，请检查垃圾箱）',
        };
      }
      challenge = {
        verificationId,
        isExistingUser: Boolean(payload.is_user === true),
      };
    }

    pendingChallenge = {
      verificationId: challenge.verificationId,
      isExistingUser: challenge.isExistingUser,
      identifier,
    };
    return {
      ok: true,
      message: phone
        ? '验证码已发送，请查收短信'
        : '验证码已发送，请查收邮件（若收不到请检查垃圾箱）',
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
      return { ok: false, message: `验证失败：${res.error.message || '验证码错误'}` };
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
  if (!pendingChallenge) {
    return { ok: false, message: '请先点击「获取验证码」' };
  }
  const { verificationId, isExistingUser, identifier } = pendingChallenge;
  const params: any = { verificationId, token: code, isExistingUser };
  // 验码必须传回与发码一致的标识（手机号或邮箱）
  if (identifier.includes('@')) params.email = identifier;
  else params.phone = identifier;

  const result = await runVerifyOtp(params);
  pendingChallenge = null;
  return result;
}

/**
 * 解析邮箱验证码回调：点邮件里的「确认登录」链接跳回
 *   /__auth/?email=...&env_id=...&is_user=false&redirect_uri=...&verificationCode=147162&verifyOpt=email_code#/login
 * 后端把验证会话 ID 以 `env_id` 形式放进链接（SDK 的 sendOtp 响应未回传它，只能从这里取），
 * `verificationCode` 即验证码，`is_user` 表示是否已有账号（决定走登录还是注册）。
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
    const verifyOpt = sp.get('verifyOpt');
    if (!email || !code || !envId) return null;
    // 仅处理明确的邮箱验证码回调；其它 verifyOpt 不在这里接管
    if (verifyOpt && verifyOpt !== 'email_code') return null;
    const isUserRaw = sp.get('is_user');
    return {
      email,
      code,
      verificationId: envId,
      isExistingUser: isUserRaw === 'true',
    };
  } catch {
    return null;
  }
}

/**
 * 用邮件链接回调里的验证码完成登录（邮箱渠道专用，不依赖 pendingChallenge）。
 * 把链接里的 `env_id` 当作 verificationId 传给 SDK 的 verifyOtp。
 */
async function verifyCloudOtpFromEmailLink(
  email: string,
  code: string,
  verificationId: string,
  isExistingUser: boolean,
): Promise<{ ok: boolean; message: string; account?: CloudAccount }> {
  return runVerifyOtp({ email, verificationId, token: code, isExistingUser });
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

/** 解码 base64url（兼容 UTF-8，如中文昵称） */
function base64UrlDecode(str: string): string {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/**
 * 从 URL 的 hash / query 读取隐式授权令牌（邮箱魔法链接回调大概率走这个）。
 * Gotrue 风格的魔法链接点击后，服务端会重定向回 emailRedirectTo 并在 URL 的
 * fragment / query 里带上 access_token / refresh_token / expires_in。
 */
function readImplicitGrantFromUrl(): {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  exp?: number;
  sub: string;
  name?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  raw?: Record<string, unknown>;
} | null {
  const fromHash = (() => {
    const h = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    // 去掉 HashRouter 可能遗留的前导斜杠（如 #/access_token=...）
    return new URLSearchParams(h.replace(/^\/+/, ''));
  })();
  const fromSearch = new URLSearchParams(window.location.search);
  const params = fromHash.has('access_token')
    ? fromHash
    : fromSearch.has('access_token')
      ? fromSearch
      : null;
  if (!params) return null;
  const accessToken = params.get('access_token');
  if (!accessToken) return null;
  const refreshToken = params.get('refresh_token') ?? undefined;
  const expiresInRaw = params.get('expires_in');
  const expiresIn = expiresInRaw ? Number(expiresInRaw) : undefined;

  let claims: Record<string, unknown> = {};
  try {
    const part = accessToken.split('.')[1];
    if (part) claims = JSON.parse(base64UrlDecode(part));
  } catch {
    claims = {};
  }
  const sub = claims.sub ?? claims.user_id;
  if (!sub || typeof sub !== 'string') return null;
  return {
    accessToken,
    refreshToken,
    expiresIn: typeof expiresIn === 'number' && !Number.isNaN(expiresIn) ? expiresIn : undefined,
    exp: typeof claims.exp === 'number' ? claims.exp : undefined,
    sub,
    name: (claims.name as string) ?? (claims.nickname as string) ?? null,
    avatarUrl: (claims.avatar_url as string) ?? (claims.picture as string) ?? null,
    email: (claims.email as string) ?? null,
    phone: (claims.phone_number as string) ?? (claims.phone as string) ?? null,
    raw: claims,
  };
}

/** 清掉 URL 里的 auth 令牌/参数，避免污染 HashRouter 路由（保留 sharecode 等业务参数） */
function cleanAuthParamsFromUrl(): void {
  try {
    const sp = new URLSearchParams(window.location.search);
    [
      'code', 'state', 'provider', 'provider_id',
      'access_token', 'refresh_token', 'expires_in', 'token_type',
      // 邮箱验证码回调参数：避免刷新重复触发 / 污染 HashRouter
      'email', 'verificationCode', 'env_id', 'is_user', 'verifyOpt', 'redirect_uri',
    ].forEach((k) => sp.delete(k));
    const search = sp.toString();
    // 回到应用根路径（脱离 /__auth/ 中转路径），保留 sharecode 等业务参数
    const newUrl = '/' + (search ? `?${search}` : '') + '#/';
    history.replaceState(null, '', newUrl);
  } catch {
    /* 忽略：清不掉也不影响登录 */
  }
}

/**
 * 应用启动时恢复云端会话，并处理邮箱魔法链接回调。
 *
 * 流程：
 *   1) 已有会话（普通回访）→ 直接复用；
 *   2) best-effort：从 URL 读隐式授权令牌（邮箱魔法链接点开后的回调）。
 *      SDK 自身没有提供处理邮箱魔法链接的 API，这里自行解析 JWT 并重建 SDK 的
 *      localStorage 会话（key = `workbuddy-cloud.session.<publishableKey>`），
 *      使之能被 getCloudSession 读到；
 *   3) 仍未恢复 → 正常未登录。
 *
 * 返回 true 表示已恢复 / 建立了云端会话（并已建好本地镜像用户）。
 */
export async function restoreCloudSession(): Promise<boolean> {
  // 0) 邮箱验证码回调：点邮件里的「确认登录」链接跳回
  //    /__auth/?...&verificationCode=...&env_id=...&verifyOpt=email_code
  //    后端把验证会话 ID 以 env_id 形式放进链接（sendOtp 响应未回传它），这里取出直接验码登录。
  const emailCb = readEmailCodeCallback();
  if (emailCb) {
    const r = await verifyCloudOtpFromEmailLink(
      emailCb.email,
      emailCb.code,
      emailCb.verificationId,
      emailCb.isExistingUser,
    );
    // 无论成败都清掉 URL 参数（避免刷新重复触发、脱离 /__auth/ 中转路径）
    cleanAuthParamsFromUrl();
    if (r.ok) return true;
    return false; // 链接失效则回登录页，让用户重新获取验证码
  }

  // 1) 已有会话（普通回访），直接复用
  const existing = await getCloudSession();
  if (existing) {
    await finishCloudSignIn(existing);
    return true;
  }

  // 2) best-effort：从 URL 读隐式授权令牌（邮箱魔法链接回调）
  const token = readImplicitGrantFromUrl();
  if (token) {
    try {
      // 计算过期时间：优先用 expires_in；没有 refreshToken 时强制给 1 小时，
      // 避免 SDK 的 ensure() 因「即将过期且无 refreshToken」直接 abandon 会话。
      let expiresAt: number;
      if (token.refreshToken && token.expiresIn && token.expiresIn > 0) {
        expiresAt = Date.now() + token.expiresIn * 1000;
      } else if (token.exp && token.exp > 0) {
        expiresAt = token.exp * 1000;
      } else {
        expiresAt = Date.now() + 3600_000;
      }
      const stored = {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken ?? '',
        expiresAt,
        user: {
          id: token.sub,
          name: token.name ?? null,
          avatarUrl: token.avatarUrl ?? null,
          isAnonymous: false,
          email: token.email ?? null,
          phone: token.phone ?? null,
          raw: token.raw ?? {},
        },
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stored));
      cleanAuthParamsFromUrl();
    } catch {
      /* 重建失败则当作未登录 */
    }
    const restored = await getCloudSession();
    if (restored) {
      await finishCloudSignIn(restored);
      return true;
    }
  }

  // 3) 仍未恢复，正常未登录
  return false;
}
