import type { User, SafeUser } from '../types/user';

// ========== 用户存储键名 ==========
export const USERS_KEY = 'ket-app-users';
const CURRENT_USER_KEY = 'ket-app-current-user';

/** 昵称长度上限（按 Unicode 码点计，中文 / 字母 / emoji 都算 1 个） */
export const NICKNAME_MAX_LEN = 12;

/** 用户资料变更事件：Header / 首页等展示昵称的组件监听它刷新 */
export const USER_CHANGED_EVENT = 'ket-user-changed';

function notifyUserChanged(): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event(USER_CHANGED_EVENT));
  }
}

/** 昵称规范化：去控制字符、折叠空白、去首尾空格、按码点截断到上限 */
export function normalizeNickname(raw: string): string {
  const cleaned = String(raw ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(cleaned).slice(0, NICKNAME_MAX_LEN).join('');
}

/** 统一展示名：优先自定义昵称，其次云端账号标识，最后兜底 */
export function getDisplayName(user: SafeUser | User | null | undefined): string {
  if (!user) return '';
  const nickname = normalizeNickname(user.nickname ?? '');
  return nickname || user.name || '同学';
}

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
    // 已存在：仅同步账号标识（邮箱可能变化），自定义昵称必须原样保留，
    // 否则每次云端登录 / 启动恢复会话都会把用户改的昵称冲掉。
    const u = users[idx];
    if (name && u.name !== name) {
      users[idx] = { ...u, name };
      saveUsers(users);
    }
  }
  const idx2 = users.findIndex((u) => u.id === userId);
  const user = users[idx2];
  const prev = getCurrentUser();
  // 极端情况：用户列表是旧版写过的、较新的昵称只在当前登录态里 -> 以时间较新的为准，
  // 并回写列表，避免下次登录又被旧值覆盖。
  const hasNewerLocal =
    !!prev && prev.id === userId && (prev.nicknameUpdatedAt ?? '') > (user.nicknameUpdatedAt ?? '');
  if (hasNewerLocal) {
    users[idx2] = {
      ...user,
      nickname: prev!.nickname,
      nicknameUpdatedAt: prev!.nicknameUpdatedAt,
    };
    saveUsers(users);
  }
  const safe = toSafeUser(hasNewerLocal ? users[idx2] : user);
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

// ========== 昵称（个人中心） ==========

/** 供同步包读取的昵称资料 */
export interface NicknameProfile {
  nickname: string;
  nicknameUpdatedAt: string;
}

export function readNicknameProfile(): NicknameProfile {
  const u = getCurrentUser();
  return {
    nickname: u?.nickname ?? '',
    nicknameUpdatedAt: u?.nicknameUpdatedAt ?? '',
  };
}

/** 把昵称同时写进「用户列表」和「当前登录用户」，并广播变更 */
function writeNickname(nickname: string, updatedAt: string): SafeUser {
  const current = getCurrentUser();
  if (!current) throw new Error('未登录，无法写入昵称');

  const users = getUsers();
  const idx = users.findIndex((u) => u.id === current.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], nickname, nicknameUpdatedAt: updatedAt };
  } else {
    users.push({
      id: current.id,
      name: current.name,
      nickname,
      nicknameUpdatedAt: updatedAt,
      createdAt: current.createdAt || updatedAt,
    });
  }
  saveUsers(users);

  const safe = toSafeUser({
    ...current,
    nickname,
    nicknameUpdatedAt: updatedAt,
  } as User);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safe));
  notifyUserChanged();
  return safe;
}

/**
 * 用户在个人中心修改昵称。
 * 传空串（或纯空白）= 清除自定义昵称，恢复显示云端账号标识。
 */
export function setNickname(raw: string): { ok: boolean; message: string; user?: SafeUser } {
  if (!getCurrentUser()) return { ok: false, message: '未登录，无法修改昵称' };
  const nickname = normalizeNickname(raw);
  const user = writeNickname(nickname, new Date().toISOString());
  return {
    ok: true,
    message: nickname ? '昵称已保存' : '已恢复默认显示',
    user,
  };
}

/**
 * 云端同步合并昵称：只接受比本机更新的那份，避免换设备时旧数据盖掉新昵称。
 * @returns 是否真的改动了本机资料
 */
export function applyRemoteNickname(nickname: string, updatedAt?: string): boolean {
  if (!updatedAt) return false; // 旧版同步包没有昵称字段，直接忽略
  const current = getCurrentUser();
  if (!current) return false;
  const localAt = current.nicknameUpdatedAt ?? '';
  if (localAt && localAt >= updatedAt) return false;

  const next = normalizeNickname(nickname);
  if (next === (current.nickname ?? '') && localAt === updatedAt) return false;
  writeNickname(next, updatedAt);
  return true;
}
