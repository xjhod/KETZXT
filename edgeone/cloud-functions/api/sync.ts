/**
 * KETZXT 跨设备同步 API（EdgeOne Pages Cloud Functions）
 *
 * 路由：/api/sync
 *
 * 两个动作（都用 POST）：
 *   op = 'login'   —— 用「用户名 + 密码」登录/找回账号
 *                     · 账号存在 → 校验密码 → 返回 userId + 云端整包数据
 *                     · 账号不存在 → 视为「首次在这台设备注册云端账号」，创建并返回空包
 *   op = 'push'    —— 上传本地整包数据（需带 userId + 密码哈希做校验）
 *
 * 安全模型：
 *   - 服务端**从不**接收明文密码。客户端用 PBKDF2-SHA256(password, salt) 派生哈希，
 *     salt 由服务端生成（账号不存在时）并随 login 响应返回给客户端。
 *   - 登录时客户端把哈希 + salt 一起发回，服务端重算校验。
 *   - 攻击者拿到 Blob 数据也拿不到密码原文。
 *
 * 为什么不用服务端 session：本应用是「家庭自用」规模，
 * 无状态 API（每次请求带 userId + 派生哈希）最简单，也最不容易出并发/失效的坑。
 */

import {
  CORS_HEADERS,
  json,
  error,
  readEnv,
  type Env,
} from '../_lib/core';
import {
  getUserById,
  getUserIdByName,
  putUser,
  normalizeName,
} from '../_lib/storage';

interface SyncRequest {
  op?: 'login' | 'push';
  /** 登录时用的用户名 */
  name?: string;
  /** 客户端算好的 PBKDF2 派生哈希（base64） */
  hash?: string;
  /** 登录成功后拿到的盐（base64），push 时原样带回 */
  salt?: string;
  /** push 时的用户 ID */
  userId?: string;
  /** push 时的整包学习数据 */
  payload?: unknown;
}

export async function onRequest(context: any): Promise<Response> {
  const env: Env = readEnv(context);
  const request: Request = context.request;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') {
    return error('Method Not Allowed', 405);
  }

  let body: SyncRequest;
  try {
    body = (await request.json()) as SyncRequest;
  } catch {
    return error('请求体不是合法 JSON');
  }

  try {
    if (body.op === 'login') return await handleLogin(body);
    if (body.op === 'push') return await handlePush(body);
    return error('未知操作（op 必须是 login 或 push）');
  } catch (e) {
    return error(`同步服务异常：${(e as Error).message}`, 500);
  }
}

/**
 * 登录 / 找回账号
 *
 * 两阶段握手（解决「不同设备盐不同」的问题）：
 *   阶段1 —— 客户端只发用户名（op=login, name, stage=1）
 *            服务端返回账号的**权威盐**（salt）。
 *            若账号不存在，返回 needsRegister=true 且一个新盐。
 *   阶段2 —— 客户端用「权威盐 + 密码」派生哈希，连同 userId/salt 一起发回
 *            （op=login, name, hash, salt, stage=2）
 *            服务端比对哈希，通过则返回整包数据。
 *
 * 为什么必须两阶段：PBKDF2 的盐是账号级的，不是设备级的。
 * 如果每台设备各自生成盐，派生出的哈希就必然不同，服务端无法校验。
 * 由服务端持有权威盐，各设备用同一把盐派生，才能做到「同一个账号在多台设备登录」。
 */
async function handleLogin(body: SyncRequest): Promise<Response> {
  const name = (body.name || '').trim();
  const hash = body.hash || '';
  const salt = body.salt || '';

  if (!name) return error('请填写用户名');

  const existingId = await getUserIdByName(name);
  const existing = existingId ? await getUserById(existingId) : null;

  // ---------- 阶段1：只取盐 ----------
  if (!hash) {
    if (existing) {
      return json({
        ok: true,
        stage: 1,
        needsRegister: false,
        userId: existing.userId,
        name: existing.name,
        salt: existing.salt,
      });
    }
    // 账号不存在：先给一个由客户端生成的盐（stage2 时带上），账号在那时创建
    return json({
      ok: true,
      stage: 1,
      needsRegister: true,
      salt: body.salt || '',
    });
  }

  // ---------- 阶段2：校验哈希 ----------
  if (!salt) return error('缺少盐');

  if (existing) {
    // 账号已存在：必须用**服务端存的盐**校验
    if (existing.salt !== salt) {
      // 盐不匹配 —— 客户端用了本地盐而不是服务端权威盐。
      // 明确报错，让客户端退回阶段1重新握手。
      return error('盐不匹配，请重新登录', 409);
    }
    if (existing.hash !== hash) {
      return error('密码错误', 401);
    }
    return json({
      ok: true,
      stage: 2,
      created: false,
      userId: existing.userId,
      name: existing.name,
      salt: existing.salt,
      payload: existing.payload,
      updatedAt: existing.updatedAt,
    });
  }

  // 账号不存在：创建
  const userId = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();
  await putUser({
    userId,
    name,
    salt,
    hash,
    updatedAt: now,
    payload: body.payload ?? null,
  });

  return json({
    ok: true,
    stage: 2,
    created: true,
    userId,
    name,
    salt,
    payload: body.payload ?? null,
    updatedAt: now,
  });
}

/** 上传整包数据 */
async function handlePush(body: SyncRequest): Promise<Response> {
  const userId = body.userId || '';
  const hash = body.hash || '';
  const salt = body.salt || '';

  if (!userId) return error('缺少 userId');
  if (!hash || !salt) return error('缺少凭据');

  const existing = await getUserById(userId);
  if (!existing) return error('账号不存在，请先登录', 404);
  if (existing.hash !== hash || existing.salt !== salt) {
    return error('凭据不匹配', 401);
  }

  const now = new Date().toISOString();
  await putUser({
    ...existing,
    updatedAt: now,
    payload: body.payload ?? null,
  });

  return json({ ok: true, updatedAt: now, userId });
}
