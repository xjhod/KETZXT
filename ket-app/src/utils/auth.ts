import LZString from 'lz-string';
import type { User } from '../types/user';

// ========== 用户存储键名 ==========
export const USERS_KEY = 'ket-app-users';
const CURRENT_USER_KEY = 'ket-app-current-user';

// ========== 用户管理函数 ==========

/**
 * 获取所有注册用户
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

/**
 * 注册新用户
 * @returns { success: boolean; message: string }
 */
export function register(name: string, password: string, passwordHint?: string): { success: boolean; message: string } {
  // 验证输入
  if (!name || !password) {
    return { success: false, message: '请输入姓名和密码' };
  }

  if (name.trim().length < 2) {
    return { success: false, message: '姓名至少需要2个字符' };
  }

  if (password.length < 4) {
    return { success: false, message: '密码至少需要4个字符' };
  }

  // 检查用户是否已存在
  const users = getUsers();
  if (users.find(u => u.name.toLowerCase() === name.trim().toLowerCase())) {
    return { success: false, message: '该用户名已存在，请使用其他姓名' };
  }

  // 创建新用户（密码明文存储，方便忘记密码时查看）
  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    password: password, // 直接存储明文密码
    passwordHint: passwordHint || '',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, message: '注册成功！' };
}

/**
 * 用户登录
 * @returns { success: boolean; message: string; user?: User }
 */
export function login(name: string, password: string): { success: boolean; message: string; user?: User } {
  // 验证输入
  if (!name || !password) {
    return { success: false, message: '请输入姓名和密码' };
  }

  // 查找用户
  const users = getUsers();
  const user = users.find(u => u.name.toLowerCase() === name.trim().toLowerCase());

  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  // 验证密码（明文比较）
  if (user.password !== password) {
    return { success: false, message: '密码错误' };
  }

  // 保存当前登录用户（不保存密码）
  const { password: _, passwordHint: __, ...safeUser } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

  return { success: true, message: '登录成功！', user: safeUser };
}

/**
 * 获取当前登录用户
 * @returns {User | null}
 */
export function getCurrentUser(): User | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * 退出登录
 */
export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * 检查是否有用户注册
 * @returns {boolean}
 */
export function hasRegisteredUsers(): boolean {
  return getUsers().length > 0;
}

/**
 * 获取所有注册用户的姓名列表（用于切换用户）
 * @returns {Array<{id: string; name: string}>}
 */
export function getUserList(): Array<{ id: string; name: string }> {
  return getUsers().map(({ id, name }) => ({ id, name }));
}

/**
 * 获取所有注册用户信息（用于调试，不包含密码）
 * @returns {Array<{id: string; name: string; createdAt: string}>}
 */
export function getRegisteredUsers(): Array<{ id: string; name: string; createdAt: string }> {
  return getUsers().map(({ id, name, createdAt }) => ({ id, name, createdAt }));
}

/**
 * 忘记密码 - 获取密码提示或直接获取密码
 * @param name 用户名
 * @returns { success: boolean; message: string; hint?: string; password?: string }
 */
export function forgotPassword(name: string): { success: boolean; message: string; hint?: string; password?: string } {
  const users = getUsers();
  const user = users.find(u => u.name.toLowerCase() === name.trim().toLowerCase());

  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  // 如果有密码提示，返回提示
  if (user.passwordHint) {
    return { success: true, message: '密码提示', hint: user.passwordHint };
  }

  // 如果没有提示，直接返回密码（因为同一台设备使用）
  return { success: true, message: '您的密码是', password: user.password };
}

/**
 * 删除用户（用于忘记密码时重置）
 * @param userId 用户ID
 * @param currentUserId 当前登录用户ID（不能删除自己）
 * @returns { success: boolean; message: string }
 */
export function deleteUser(userId: string, currentUserId: string): { success: boolean; message: string } {
  if (userId === currentUserId) {
    return { success: false, message: '不能删除当前登录的用户' };
  }

  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== userId);

  if (filteredUsers.length === users.length) {
    return { success: false, message: '用户不存在' };
  }

  saveUsers(filteredUsers);
  return { success: true, message: '用户已删除，可以重新注册' };
}

// ========== 跨设备同步功能（lz-string 压缩） ==========

/**
 * 导出用户数据为可同步的字符串（lz-string 压缩）
 * @returns {string} 压缩后的字符串（URL-safe）
 */
export function exportUsersForSync(): string {
  const users = getUsers();
  const json = JSON.stringify(users);
  // 使用 lz-string 压缩（输出 URL-safe 字符串）
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
}

/**
 * 从同步字符串导入用户数据（合并模式，不覆盖现有用户）
 * @param syncData 压缩后的同步数据
 * @returns { success: boolean; message: string; imported: number }
 */
export function importUsersFromSync(syncData: string): { success: boolean; message: string; imported: number } {
  try {
    // 解压
    const json = LZString.decompressFromEncodedURIComponent(syncData);
    if (json === null) {
      return { success: false, message: '数据解压失败', imported: 0 };
    }

    const importedUsers: User[] = JSON.parse(json);

    if (!Array.isArray(importedUsers)) {
      return { success: false, message: '数据格式错误', imported: 0 };
    }

    const existingUsers = getUsers();
    let importedCount = 0;

    for (const importedUser of importedUsers) {
      // 验证数据格式
      if (!importedUser.id || !importedUser.name || !importedUser.password) {
        continue;
      }

      // 检查是否已存在（按ID和姓名判断）
      const exists = existingUsers.some(
        u => u.id === importedUser.id || u.name.toLowerCase() === importedUser.name.toLowerCase()
      );

      if (!exists) {
        existingUsers.push(importedUser);
        importedCount++;
      }
    }

    if (importedCount > 0) {
      saveUsers(existingUsers);
    }

    return {
      success: true,
      message: importedCount > 0 ? `成功导入 ${importedCount} 个用户` : '没有新用户需要导入',
      imported: importedCount,
    };
  } catch (e) {
    return { success: false, message: '导入失败：数据格式错误', imported: 0 };
  }
}

/**
 * 生成同步URL（包含压缩后的用户数据）
 * @returns {string} 完整的同步URL
 */
export function generateSyncUrl(): string {
  const syncData = exportUsersForSync();
  // 使用 BASE_URL 确保路径始终正确（Vite 构建时会替换为 /KETZXT/）
  const baseUrl = window.location.origin + import.meta.env.BASE_URL;
  return `${baseUrl}#sync=${syncData}`;
}

/**
 * 从URL Hash导入用户数据
 * @returns { success: boolean; message: string; imported: number }
 */
export function importFromUrlHash(): { success: boolean; message: string; imported: number } {
  const hash = window.location.hash;
  const match = hash.match(/^#sync=(.+)$/);

  if (!match) {
    return { success: false, message: 'URL中没有同步数据', imported: 0 };
  }

  const result = importUsersFromSync(match[1]);

  // 清除URL中的同步数据（避免重复导入）
  if (result.success && result.imported > 0) {
    // 使用 history.replaceState 避免页面刷新
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  return result;
}

// ========== 默认测试账号（预置，避免每次更新部署后都要重新注册） ==========
const SEED_USERS: User[] = [
  {
    id: 'user_seed_1234',
    name: '1234',
    password: '123456',
    passwordHint: '123456',
    createdAt: '2026-07-09T00:00:00.000Z',
  },
];

/**
 * 预置默认测试账号：若测试账号不存在则自动写入 localStorage。
 * 应用启动时（本模块被 import 时）自动执行一次，避免每次更新部署后都要重新注册。
 * 仅按 name 查重追加，不会覆盖用户已有的账号，也不会重复写入。
 */
export function seedDefaultUsers(): void {
  const users = getUsers();
  let changed = false;
  for (const seed of SEED_USERS) {
    if (!users.some((u) => u.name.toLowerCase() === seed.name.toLowerCase())) {
      users.push(seed);
      changed = true;
    }
  }
  if (changed) saveUsers(users);
}

// 应用启动即确保测试账号存在（纯前端 localStorage，无后端，故启动时 seed）
seedDefaultUsers();
