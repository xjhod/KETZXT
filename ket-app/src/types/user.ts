export interface User {
  id: string;
  name: string;
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
