// ========== 按当前登录用户隔离的 persist 存储层 ==========
// 让四个学习 store（进度/计划/打卡/词汇）在单台设备上按账号分片：
//   实际 localStorage 键 = `${name}:${uid}`
// 登录 A 账号就读写 A 的分片，登录 B 就读写 B 的分片，互不串。
//
// 升级兼容：旧版本把数据写在无前缀的全局键（如 ket-progress-v1）上。
// 升级后首个真实用户登录/启动时，把旧全局数据搬到此用户名下（仅执行一次，
// 用全局标记防止单设备多账号重复迁移同一份旧数据）。
import type { StateStorage } from 'zustand/middleware';
import { getCurrentUser } from '../utils/auth';

const MIGRATED_SUFFIX = ':__migrated__';

function currentUid(): string | null {
  return getCurrentUser()?.id ?? null;
}

/**
 * 按当前用户隔离的 StateStorage（字符串读写，交给 createJSONStorage 包成 JSON）。
 * 未登录（guest）时不读写任何学习数据，返回 null。
 */
export const userScopedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const uid = currentUid();
    if (!uid) return null; // 未登录不读取学习数据

    const key = `${name}:${uid}`;
    let raw = localStorage.getItem(key);

    // 该用户分片尚不存在 -> 尝试把旧版全局键迁移过来（仅一次，移走而非复制，避免被第二用户重复迁移）
    if (raw == null) {
      const migratedFlag = `${name}${MIGRATED_SUFFIX}`;
      if (!localStorage.getItem(migratedFlag)) {
        const legacy = localStorage.getItem(name);
        if (legacy != null) {
          localStorage.setItem(key, legacy);
          localStorage.removeItem(name); // 移走旧全局键，避免被第二个用户再次迁移
        }
        localStorage.setItem(migratedFlag, '1');
      }
      raw = localStorage.getItem(key);
    }

    return raw;
  },

  setItem: (name: string, value: string): void => {
    const uid = currentUid();
    if (!uid) return; // 未登录不写学习数据
    localStorage.setItem(`${name}:${uid}`, value);
  },

  removeItem: (name: string): void => {
    const uid = currentUid();
    if (!uid) return;
    localStorage.removeItem(`${name}:${uid}`);
  },
};

export default userScopedStorage;

// 四个 store 的持久化基础键名（单一数据源，供清理/校验使用）
export const STORE_BASE_KEYS = [
  'ket-progress-v1',
  'ket-plan-v1',
  'ket-daily-checkin-v1',
  'ket-vocab-v1',
];
