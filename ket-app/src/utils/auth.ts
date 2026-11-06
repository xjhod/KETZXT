import type { User, SafeUser } from '../types/user';

// ========== 用户存储键名 ==========
export const USERS_KEY = 'ket-app-users';
const CURRENT_USER_KEY = 'ket-app-current-user';

// ========== 用户管理函数 ==========

/**
 * 获取所有本地镜像用户。
 *
 * 本应用已彻底云端化：本机不再有「本地账号/密码注册登录」逻辑，只会在
 * 云端登录成功后写入**无密码的云端镜像用户**（见 upsertCloudUser），用于
 * 复用既有「按用户分片存储」(userScopedStorage) 与 getCurrentUser() 体系。
 */
export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * 保存用户列表
 */
function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** 剥离密码/哈希后的安全用户 */
export function toSafeUser(u: User): SafeUser {
  const { password: _, passwordHint: __, salt: ___, hash: ____, ...rest } = u as any;
  return rest as SafeUser;
}

/**
 * 获取当前登录用户
 * @returns {SafeUser | null}
 */
export function getCurrentUser(): SafeUser | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * 云端登录成功后，在本机建（或更新）一个**无密码的本地镜像用户**。
 *
 * 设计目的：让现有「按用户分片存储」(userScopedStorage) 与 getCurrentUser()
 * 体系零改动复用 —— 云端 uid 直接当作本地用户 id，每个云端账号对应一个本地
 * 镜像。登录态由云端 SDK 管理，本机不存任何密码。
 *
 * 分片键是 `store名:用户id`，而云端 uid 跨设备稳定，因此同一云端账号在两台设备
 * 上落到同一个分片；再配合云端 sync_payloads 按 owner_id 分区，即可实现换机拉回。
 *
 * @param userId 云端 uid（稳定、跨设备一致）
 * @param name   云端返回的可读标识（邮箱/手机号/昵称），仅用于 UI 展示
 * @returns SafeUser 作为当前登录用户
 */
export function upsertCloudUser(userId: string, name: string): SafeUser {
  if (!userId) throw new Error('云端 uid 不能为空');
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    const newUser: User = {
      id: userId,
      name: name || userId,
      createdAt: new Date().toISOString(),
      // 无 password/hash/salt：纯云端镜像账号，本机不持有密码
    };
    users.push(newUser);
    saveUsers(users);
  } else {
    // 已存在：仅同步展示名（标识可能变化）
    const u = users[idx];
    if (name && u.name !== name) {
      users[idx] = { ...u, name };
      saveUsers(users);
    }
  }
  const user = users.find((u) => u.id === userId)!;
  const safe = toSafeUser(user);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safe));
  return safe;
}

/**
 * 退出登录（清除本地当前用户标记）。
 * 云端登录态的解绑在 cloudAuth.unlinkCloud 中处理，调用方（Header 登出）
 * 应先 unlinkCloud 再 logout。
 */
export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}
