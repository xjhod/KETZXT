/**
 * 云数据库类型定义
 *
 * SDK 的 `createWorkBuddyCloud<Database>()` 泛型决定 `cloud.database.from(...)`
 * 能接受哪些表名与字段。不传泛型时行类型是 `unknown`、写入参数是 `never`
 * （TypeScript 会直接报错），所以这里给 sync_payloads 表定义一个最小类型。
 *
 * 注意：`owner_id` **不出现在** Insert 类型里 —— 它由数据库的
 * `DEFAULT auth.uid()` 服务端填充，前端传了会被 RLS 拒绝。
 */

/** sync_payloads 表的行 */
export interface SyncPayloadRow {
  id: number;
  owner_id: string;
  owner_name: string | null;
  device_id: string | null;
  payload: unknown;
  updated_at: string;
}

/** 可插入的字段（不含 owner_id —— 服务端填） */
export interface SyncPayloadInsert {
  owner_name?: string | null;
  device_id?: string | null;
  payload: unknown;
  updated_at?: string;
}

/** 可更新的字段 */
export interface SyncPayloadUpdate {
  owner_name?: string | null;
  device_id?: string | null;
  payload?: unknown;
  updated_at?: string;
}

/**
 * 数据库 schema 映射表。
 * 新增表时在这里加一个键即可。
 */
export interface Database {
  public: {
    Tables: {
      sync_payloads: {
        Row: SyncPayloadRow;
        Insert: SyncPayloadInsert;
        Update: SyncPayloadUpdate;
      };
    };
  };
}
