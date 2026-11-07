/**
 * 云端账号（WorkBuddy Auth）—— 跨设备同步的身份基础
 *
 * 为什么需要它：
 *   云数据库的 RLS 用 `auth.uid()` 做行级隔离，即「谁能读自己的同步数据」取决于
 *   登录身份。本地那套 kid 用户名/密码是**离线**账号体系；云端则用 WorkBuddy 账号
 *   （邮箱验证码）作为身份 —— 两者是不同维度：
 *     · 本地 kid 账号：决定这台设备上「当前是哪个孩子在用」
 *     · 云端账号：决定「这台设备连到云端的哪份数据」
 *
 * 注册与登录统一走「发码 + 验码」两步流程：
 *   - 家长/新用户输入邮箱 → 发码端点返回 verification_id（JWT）
 *   - 输入验证码 → verifyOtp（带上 isExistingUser），由 SDK 决定走登录还是自动注册
 *   - 无需自建后台发码，新邮箱首次验码即自动建号
 *   - 手机短信登录已关闭（短信按条计费），只保留邮箱渠道
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

/** 线上站点地址（云应用已登记的域名，云端登录只在这里生效） */
const CLOUD_SITE_URL = `${CLOUD_ENDPOINT}/?sharecode=ILJMMGGVHE`;

/** 当前是否为本地开发预览（127.0.0.1 / localhost 未在云应用回跳白名单登记） */
function isLocalPreview(): boolean {
  return /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(window.location.hostname);
}

/** 本地预览不支持云端登录落地，给提示补上说明 */
function appendLocalPreviewHint(msg: string): string {
  return isLocalPreview()
    ? `${msg}。注意：当前是本地开发预览，邮件链接会跳到已登记的线上站点完成登录，本机预览不会同步登录状态；验证邮箱登录请直接打开 ${CLOUD_SITE_URL}`
    : msg;
}

/** JWT 形态：header.payload.signature 三段 base64url。
 *  后端 /v1/verification/verify 会把 verification_id 当 JWT 解析，
 *  非 JWT（如邮件链接里的 env_id = "wb-..."）会报 malformed jwt: expected 3 parts got 1。 */
function isJwtLike(s: string): boolean {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(s);
}

/** 从发码响应体里找出可作 verification_id 的 JWT（优先标准字段名，再递归兜底） */
function pickVerificationId(payload: any): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const direct = payload.verification_id ?? payload.verificationId;
  if (typeof direct === 'string' && isJwtLike(direct)) return direct;
  // 标准字段缺失或不是 JWT（如 wb-... 形式的 env_id）时，继续在响应体里找
  const seen = new Set<unknown>();
  const walk = (v: unknown, depth: number): string | null => {
    if (depth > 4 || v == null) return null;
    if (typeof v === 'string') return isJwtLike(v) ? v : null;
    if (typeof v !== 'object' || seen.has(v)) return null;
    seen.add(v);
    const values = Array.isArray(v) ? v : Object.values(v as Record<string, unknown>);
    for (const item of values) {
      const found = walk(item, depth + 1);
      if (found) return found;
    }
    return null;
  };
  return walk(payload, 0);
}

/**
 * 发码并保留原始响应体。
 *
 * ⚠️ 真实地址是 `/.cloud/auth/v1/verification`：SDK 的 auth baseUrl =
 * `config.endpoint + CLOUD_MODULE_PATHS.auth`（`/.cloud/auth`）。早期版本裸拼
 * `${CLOUD_ENDPOINT}/v1/verification`，请求落到托管层的 SPA 回退页、返回 HTML，
 * `res.json()` 解析失败 → 诊断显示 `HTTP 200[]`，一个字段都拿不到。
 *
 * 统一用裸 fetch：这条路径已在线上用 curl 实测（带 x-wb-webapp-access-key 即可
 * 返回 verification_id JWT）。不再依赖 SDK 内部 request 的返回结构 —— 后者把
 * status 硬编码成 200、且 raw 可能为空，会把真实失败伪装成 `HTTP 200[]`。
 */
async function postVerificationRaw(
  body: Record<string, unknown>,
): Promise<{ status: number; payload: any; raw: string }> {
  // 托管层分享门：页面 URL 带 sharecode 才稳定放行，API 请求一并带上更保险
  const sc = new URLSearchParams(window.location.search).get('sharecode') || 'ILJMMGGVHE';
  const url = `${CLOUD_ENDPOINT}/.cloud/auth/v1/verification?sharecode=${encodeURIComponent(sc)}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wb-webapp-access-key': CLOUD_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let payload: any = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }
    return { status: res.status, payload, raw: text.slice(0, 300) };
  } catch (e) {
    return { status: 0, payload: null, raw: String((e as Error).message ?? e) };
  }
}

/** 当前构建标识：诊断信息带上它，才能一眼分辨用户是否跑着旧版缓存 */
const BUILD_TAG = String((import.meta.env as any).VITE_BUILD_HASH ?? 'unknown').slice(0, 7);

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
  /** 发码时用的邮箱，验码必须传回同一个 */
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
    message: '未连接云端：输入邮箱接收验证码即可连接，多台设备间自动同步',
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
 * 发送邮箱验证码。
 *
 * ⚠️ 手机短信登录已关闭（2026-11-07）：短信按条消耗云服务资源点，
 * 邮箱验证码没有按条计费项。这里显式拒绝 phone 入参，且**不再保留任何
 * 调用 cloud.auth.sendOtp({ phone }) 的代码路径**，确保不会误发短信。
 *
 * 邮箱发码直接命中 `/.cloud/auth/v1/verification`，自己读原始响应里的
 * verification_id（JWT）。不能走 SDK 的 sendOtp：它对邮箱分支只会在缺
 * verification_id 时直接 fail() 并丢弃响应体，拿不到验码必需的凭据；
 * 此前拿邮件链接里的 env_id 顶替，后端报 malformed jwt: expected 3 parts got 1。
 *
 * 实测（正确地址 /.cloud/auth/v1/verification）：
 *   {email, target:'ANY'}                     → {verification_id:<JWT>, expires_in:600}
 *   {email, target:'ANY', email_redirect_to}  → {expires_in:600}   ← 带回跳就切魔法链接、不给 JWT
 *   {email, usage:'email', email_redirect_to} → {expires_in:600}   ← SDK 一直误报 no verification_id 的原因
 * 结论：**绝不能带 email_redirect_to**；后端会用默认登记地址生成邮件链接。
 *
 * @returns { ok, message, verificationId?, isExistingUser? }
 */
export async function sendCloudOtp(input: {
  email?: string;
}): Promise<{
  ok: boolean;
  message: string;
  verificationId?: string;
  isExistingUser?: boolean;
}> {
  // 防御：即使还有旧调用点传入 phone，也绝不发短信
  if ((input as { phone?: string }).phone) {
    return { ok: false, message: '手机短信登录已关闭，请使用邮箱登录' };
  }
  const email = (input.email ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: '请输入正确的邮箱地址' };
  }

  try {
    const attempts: Array<Record<string, unknown>> = [
      { email, target: 'ANY' },
      { email, usage: 'email', target: 'ANY' }, // 兜底，同样不带 redirect
    ];
    let jwt = '';
    let isUser = false;
    const diag: string[] = [];
    for (const body of attempts) {
      const { status, payload, raw } = await postVerificationRaw(body);
      const keys =
        payload && typeof payload === 'object'
          ? Object.keys(payload).join(',')
          : String(payload ?? '').slice(0, 60);
      // 带上响应体片段：一次区分「后端真的返回空」与「又被回退成 HTML 页面」
      diag.push(`HTTP ${status}[${keys}] ${raw.slice(0, 120)}`);
      if (status >= 400 || status === 0) continue;
      const found = pickVerificationId(payload);
      if (found) {
        jwt = found;
        isUser = payload?.is_user === true || payload?.isUser === true;
        break;
      }
    }
    if (!jwt) {
      // 带上两次响应的字段清单 + 构建版本：一次区分「后端真的没给凭据」与
      // 「用户手机仍跑着旧版 PWA 缓存」（旧版诊断不会带 BUILD_TAG 和响应体片段）
      return {
        ok: false,
        message: `发送失败：服务端未返回可用的验证码凭据（${diag.join(' / ')}）。版本 ${BUILD_TAG}，请把这行提示原文发给我`,
      };
    }
    // 记住邮箱，邮件链接回跳后登录页自动回填
    try {
      sessionStorage.setItem(PREFILL_EMAIL_KEY, email);
    } catch {
      /* ignore */
    }

    pendingChallenge = {
      verificationId: jwt,
      isExistingUser: isUser,
      identifier: email,
    };
    persistChallenge(pendingChallenge);
    const emailHint =
      '验证码已发送，请查收邮件：正文若有 6 位数字验证码请直接填入下方；若只有「确认邮箱并登录」按钮，请复制按钮的链接网址，取其中 verificationCode= 后的 6 位数字填入。再点「连接云端并同步」（请在同一浏览器内完成）';
    return {
      ok: true,
      message: appendLocalPreviewHint(emailHint),
      verificationId: pendingChallenge.verificationId,
      isExistingUser: pendingChallenge.isExistingUser,
    };
  } catch (e) {
    return { ok: false, message: `发送失败：${(e as Error).message}` };
  }
}

/**
 * 调用 SDK 的 `verifyOtp` 完成登录 / 注册，并做本地收尾（建镜像用户、标记、切分片）。
 * 手机验证码与邮箱验证码回调（都依赖发码时持久化的 JWT verificationId）
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
    // 发码响应不带 is_user，isExistingUser 恒为 false（走注册）。已有账号复登时后端会
    // 明确报「已存在」，此时改走登录重试一次 —— 只在错误文案明确时才重试，不掩盖其它错误。
    let existing = params.isExistingUser;
    let res = await cloud.auth.verifyOtp({ ...params, isExistingUser: existing } as any);
    if (res?.error && !existing) {
      const msg = String((res.error as any)?.message ?? '');
      if (/already|exist|已存在|已被注册|user_exists/i.test(msg)) {
        existing = true;
        res = await cloud.auth.verifyOtp({ ...params, isExistingUser: true } as any);
      }
    }
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
      message: existing ? '云端已连接' : '注册成功，云端已连接',
      account,
      isNewUser: !existing,
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
  // 验码必须传回与发码一致的邮箱；手机短信登录已关闭，旧挑战一律要求重新发码
  if (!identifier.includes('@')) {
    return { ok: false, message: '手机短信登录已关闭，请用邮箱重新获取验证码' };
  }
  params.email = identifier;

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
 *
 * ⚠️ 只取 email + verificationCode。`env_id` 是平台环境 ID，**不是** verification_id
 * （后端会把它当 JWT 解析并报 malformed jwt: expected 3 parts got 1）；
 * 真正的 verification_id 来自发码响应，已持久化在 ket-cloud-pending-challenge。
 */
function readEmailCodeCallback(): { email: string; code: string } | null {
  try {
    const sp = new URLSearchParams(window.location.search);
    const email = sp.get('email');
    const code = sp.get('verificationCode');
    if (!email || !code) return null;
    return { email, code };
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
 * `verificationCode`。真正的 `verification_id`（JWT）在**发码时**就已持久化，
 * 这里把两者配对走 verifyOtp 完成登录；失败时把后端原始错误写入 localStorage，
 * 由登录页展示，便于一次定位。
 *
 * 手机渠道 / 普通回访：直接读 SDK 已持久化的会话。
 */
export async function restoreCloudSession(): Promise<boolean> {
  const cb = readEmailCodeCallback();
  if (cb) {
    // 预填邮箱 / 验证码，自动验码失败时用户仍可在登录页手动重试
    try {
      sessionStorage.setItem(PREFILL_EMAIL_KEY, cb.email);
      sessionStorage.setItem(PREFILL_CODE_KEY, cb.code);
    } catch {
      /* ignore */
    }
    // 关键：verificationId 只能取发码响应里的 JWT，绝不能用链接里的 env_id
    const pc = pendingChallenge ?? loadChallenge();
    cleanEmailCallbackParams();
    if (
      !pc ||
      !isJwtLike(pc.verificationId) ||
      pc.identifier.toLowerCase() !== cb.email.toLowerCase()
    ) {
      // 带上具体原因，一次定位（最常见：邮件链接在另一个浏览器 / 邮箱 App 内打开，
      // localStorage 与发码时不是同一份）
      const why = !pc
        ? '本机没有本次发码记录'
        : !isJwtLike(pc.verificationId)
          ? '本机发码凭据格式不是有效凭据'
          : `发码邮箱与链接邮箱不一致（${pc.identifier} / ${cb.email}）`;
      try {
        localStorage.setItem(
          LAST_ERROR_KEY,
          `邮件链接已收到，但${why}（常见于邮件在另一个浏览器或邮箱 App 内打开）。请在本页点「重新发送」重新获取验证码，再把新邮件链接网址里 verificationCode= 后的 6 位数字填入下方，点「连接云端并同步」`,
        );
      } catch {
        /* ignore */
      }
      return false;
    }

    const r = await runVerifyOtp({
      email: cb.email,
      verificationId: pc.verificationId,
      token: cb.code,
      isExistingUser: pc.isExistingUser,
    });
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
