export interface User {
  id: string;
  /** 云端账号标识（邮箱 / uid），每次登录都会被云端返回值刷新，不作为昵称使用 */
  name: string;
  /** 个人中心里用户自己设置的昵称；空串表示未设置，此时展示 name */
  nickname?: string;
  /** 昵称最近一次修改时间（ISO）。跨设备同步时按此取较新的一份 */
  nicknameUpdatedAt?: string;
  /** PBKDF2 派生哈希（base64）。新账号必填 */
  hash?: string;
  /** 密码盐（base64），每个用户独立 */
  salt?: string;
  /** @deprecated 旧版本明文密码，仅用于平滑迁移，登录成功后会立即转为 hash 并删除 */
  password?: string;
  passwordHint?: string; // 密码提示（可选）
  createdAt: string; // ISO 日期字符串
}

/** 剥离密码/哈希/盐后的安全用户（本地存储与登录态实际持有的形态） */
export type SafeUser = Omit<User, 'password' | 'passwordHint' | 'hash' | 'salt'>;
