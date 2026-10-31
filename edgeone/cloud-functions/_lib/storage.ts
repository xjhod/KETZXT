/**
 * KETZXT 跨设备同步 —— 服务端存储层（EdgeOne Blob）
 *
 * 设计目标（用户原话：自己用，可能 2 个小孩、多台移动端，要简单）：
 *   - 不改任何前端 store 的数据结构，只做「整包上传 / 整包下载」
 *   - 服务端不存明文密码，只存 PBKDF2 派生出的哈希 + 每个用户独立的盐
 *   - 用 Blob 的强一致读（consistency: 'strong'）避免刚上传完在另一台设备读不到
 *
 * 存储布局（Blob namespace = 'ketzxt-sync'）：
 *   user/<userId>            -> { userId, name, salt, hash, updatedAt, payload }
 *   name/<normalizedName>    -> { userId }        （用户名 -> userId 的索引，用于跨设备找回账号）
 *
 * 为什么需要 name 索引：手机 A 注册的账号，手机 B 上没有本地记录，
 * 必须能凭「用户名 + 密码」找回同一个 userId，否则没法同步。
 */

import { getStore } from '@edgeone/pages-blob';

const STORE_NAME = 'ketzxt-sync';

/** 单个用户整包数据的上限（防止有人往里塞大文件） */
const MAX_PAYLOAD_BYTES = 512 * 1024; // 512KB

export interface StoredUser {
  userId: string;
  name: string;
  /** 密码盐（base64），每个用户独立 */
  salt: string;
  /** PBKDF2 派生哈希（base64） */
  hash: string;
  updatedAt: string;
  /** 整包学习数据（前端打包上传） */
  payload: unknown;
}

function store() {
  // 首次调用会自动为当前项目创建同名 namespace
  return getStore({ name: STORE_NAME, consistency: 'strong' });
}

function keyOf(userId: string): string {
  return `user/${userId}`;
}

function nameKeyOf(name: string): string {
  return `name/${normalizeName(name)}`;
}

/** 用户名归一化：去空格 + 转小写，用于跨设备查找 */
export function normalizeName(name: string): string {
  return (name || '').trim().toLowerCase();
}

/** 账号不存在时返回 null */
export async function getUserById(userId: string): Promise<StoredUser | null> {
  if (!userId) return null;
  const raw = await store().get(keyOf(userId), { type: 'json' });
  return (raw as StoredUser) || null;
}

/** 按用户名查 userId（跨设备找回账号用） */
export async function getUserIdByName(name: string): Promise<string | null> {
  const raw = await store().get(nameKeyOf(name), { type: 'json' });
  const obj = raw as { userId?: string } | null;
  return obj?.userId || null;
}

/**
 * 创建或覆盖用户数据。
 * 若 name 索引指向别的 userId（旧账号残留），会一并清理，避免名字被抢占。
 */
export async function putUser(rec: StoredUser): Promise<void> {
  const s = store();
  const payloadText = JSON.stringify(rec.payload ?? null);
  if (payloadText.length > MAX_PAYLOAD_BYTES) {
    throw new Error(`同步数据过大（${Math.round(payloadText.length / 1024)}KB），上限 ${MAX_PAYLOAD_BYTES / 1024}KB`);
  }
  await s.set(keyOf(rec.userId), JSON.stringify(rec));

  // 名字索引：指向当前 userId
  const existingId = await getUserIdByName(rec.name);
  if (existingId && existingId !== rec.userId) {
    // 旧账号残留：删除旧的 user 数据（换用户名重注册的极端情况）
    try {
      await s.delete(keyOf(existingId));
    } catch {
      /* 旧数据删除失败不影响新数据 */
    }
  }
  await s.set(nameKeyOf(rec.name), JSON.stringify({ userId: rec.userId }));
}

/** 删除用户数据与名字索引（用于「注销账号」） */
export async function deleteUser(userId: string, name: string): Promise<void> {
  const s = store();
  await s.delete(keyOf(userId));
  await s.delete(nameKeyOf(name));
}
