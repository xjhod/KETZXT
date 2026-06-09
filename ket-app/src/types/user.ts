export interface User {
  id: string;
  name: string;
  password: string; // 明文存储密码（本地软件，同一设备使用）
  passwordHint?: string; // 密码提示（可选）
  createdAt: string; // ISO 日期字符串
}
