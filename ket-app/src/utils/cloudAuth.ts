/**
 * 云端账号（WorkBuddy Auth）—— 跨设备同步的身份基础
 *
 * 为什么需要它：
 *   云数据库的 RLS 用 `auth.uid()` 做行级隔离，也就是说「谁能读自己的同步数据」
 *   取决于登录身份。本地那套 kid 用户名/密码是**离线**用的账号体系，
 *   云端则用 WorkBuddy 账号（手机号验证码登录）作为身份 —— 两者是不同维度的事：
 *     · 本地 kid 账号：决定这台设备上「当前是哪个孩子在用」
 *     · 云端账号：决定「这台设备连到云端的哪份数据」
 *
 * 家长实际体验：换手机 / 换平板时，输一次手机号验证码，就把孩子的进度拉回来。
 */

import { cloud } from './cloud';

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

/** 当前会话（没有会话返回 null） */
export async function getCloudSession(): Promise<CloudAccount | null> {
  try {
    const { data, error } = await cloud.auth.getSession();
    if (error || !data) return null;
    // getSession() 返回的 data 本身就是 CloudSession（不是 { session } 包装）
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
    message: '未连接云端：输入手机号接收验证码即可连接，多台设备间自动同步',
  };
}

/** OTP 流程中间态：发码返回的 challenge，验码时要用 */
let pendingChallenge: any = null;

/**
 * 发送手机验证码。
 *
 * 走 `signInWithOtp`（gotrue 风格）：它同时完成「发码」并返回一个带
 * `verify()` 的 challenge，验码时直接 challenge.verify({ token }) 即可，
 * 新用户会自动注册，不需要先注册再登录。
 *
 * @param phone 手机号（11 位中国大陆手机号）
 */
export async function sendPhoneOtp(phone: string): Promise<{
  ok: boolean;
  message: string;
}> {
  const trimmed = phone.trim();
  if (!/^1[3-9]\d{9}$/.test(trimmed)) {
    return { ok: false, message: '请输入正确的 11 位手机号' };
  }
  try {
    const res = await cloud.auth.signInWithOtp({ phone: trimmed });
    if (res?.error) {
      return { ok: false, message: `发送失败：${res.error.message || '未知错误'}` };
    }
    const challenge = (res as any)?.data;
    if (!challenge?.verify) {
      return { ok: false, message: '发送失败：服务端未返回可用的验证码流程' };
    }
    pendingChallenge = challenge;
    return { ok: true, message: '验证码已发送，请查收短信' };
  } catch (e) {
    return { ok: false, message: `发送失败：${(e as Error).message}` };
  }
}

/**
 * 用手机号 + 验证码登录（新手机号会自动注册）。
 */
export async function signInWithPhoneOtp(
  phone: string,
  token: string
): Promise<{ ok: boolean; message: string; account?: CloudAccount }> {
  const trimmed = phone.trim();
  const code = token.trim();
  if (!/^1[3-9]\d{9}$/.test(trimmed)) {
    return { ok: false, message: '请输入正确的手机号' };
  }
  if (!code) {
    return { ok: false, message: '请输入验证码' };
  }
  if (!pendingChallenge?.verify) {
    return { ok: false, message: '请先点击「获取验证码」' };
  }
  try {
    const res = await pendingChallenge.verify({ token: code });
    if (res?.error) {
      return { ok: false, message: `登录失败：${res.error.message || '验证码错误'}` };
    }
    pendingChallenge = null;
    const account = await getCloudSession();
    if (!account) {
      return { ok: false, message: '登录未生效，请重试' };
    }
    return { ok: true, message: '云端已连接', account };
  } catch (e) {
    return { ok: false, message: `登录失败：${(e as Error).message}` };
  }
}

/** 退出云端登录（只解除本机，不删云端数据） */
export async function signOutCloud(): Promise<void> {
  try {
    await cloud.auth.signOut();
  } catch {
    /* 忽略：即使后端失败也要清掉本地状态 */
  }
}
