/**
 * WorkBuddy 云服务客户端封装
 *
 * 统一初始化一次，全应用复用同一个 client 实例。
 * 初始化参数全部来自 config/cloud.ts（publicConfig 的安全子集）。
 *
 * 为什么用云服务而不是自建后端：
 *   - 域名固定且免 token 门禁（EdgeOne 系统域名对大陆网络只有 3 小时预览链接）
 *   - 免密钥 LLM —— 不再需要自己保管 DeepSeek / SiliconFlow 的 key
 *   - 云数据库带 RLS，用户数据天然隔离
 */

import { createWorkBuddyCloud } from '@tencent-ai/workbuddy-cloud-sdk';
import {
  CLOUD_ENDPOINT,
  CLOUD_OAUTH_RELAY,
  CLOUD_PUBLISHABLE_KEY,
} from '../config/cloud';
import type { Database } from '../config/database.types';

/**
 * 单例客户端 —— 全应用共用，不要重复创建。
 *
 * 泛型 <Database> 决定数据库表的类型；不传的话写入参数会被推成 never，
 * TypeScript 直接报错（详见 config/database.types.ts）。
 */
export const cloud = createWorkBuddyCloud<Database>({
  endpoint: CLOUD_ENDPOINT,
  oauthRelayBaseUrl: CLOUD_OAUTH_RELAY,
  publishableKey: CLOUD_PUBLISHABLE_KEY,
});

/** 云服务是否可用（当前域名是否为受支持的 Origin） */
export function isCloudOriginSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.origin === new URL(CLOUD_ENDPOINT).origin;
}

/** 云服务能力探测结果 */
export interface CloudStatus {
  /** 端点是否可达 */
  reachable: boolean;
  /** 当前 Origin 是否被服务端接受 */
  originOk: boolean;
  /** LLM 是否可用 */
  llm: boolean;
  /** 模型数量 */
  modelCount: number;
  /** 数据库是否可用 */
  database: boolean;
  /** 已登录用户 */
  signedIn: boolean;
  message: string;
}

/**
 * 探测云服务各模块可用性。
 * 失败不抛异常 —— 调用方据此决定是否降级。
 */
export async function probeCloudStatus(): Promise<CloudStatus> {
  const status: CloudStatus = {
    reachable: false,
    originOk: isCloudOriginSupported(),
    llm: false,
    modelCount: 0,
    database: false,
    signedIn: false,
    message: '',
  };

  // 当前页面 Origin 不匹配时，云服务一定 403，直接说明原因，省一次无谓请求
  if (!status.originOk) {
    status.message = '云服务要求在专用域名下使用（当前域名不匹配）';
    return status;
  }

  try {
    const models = await cloud.llm.models.list();
    status.reachable = true;
    status.llm = true;
    status.modelCount = models.length;
  } catch (e) {
    status.message = `云服务不可达：${(e as Error).message}`;
    return status;
  }

  try {
    const { data } = await cloud.auth.getSession();
    status.signedIn = Boolean(data?.user);
  } catch {
    status.signedIn = false;
  }

  // 数据库探针：查一个必定不存在的表，能返回 42P01 说明链路是通的
  try {
    await cloud.database.from('__probe__').select('*').limit(1);
    status.database = true;
  } catch (e) {
    const code = (e as any)?.code;
    // 42P01 = 表不存在，说明请求已到达数据库，只是表没建 —— 链路通
    status.database = code === '42P01';
    if (!status.database) {
      status.message = `数据库探测异常：${(e as Error).message}`;
    }
  }

  if (!status.message) status.message = '云服务正常';
  return status;
}

/** LLM 模型列表（带缓存，避免每次都拉） */
let modelCache: any[] | null = null;

export async function listModels(force = false): Promise<any[]> {
  if (modelCache && !force) return modelCache;
  const models = await cloud.llm.models.list();
  modelCache = models;
  return models;
}

/**
 * 选一个可用的模型。
 *
 * 规则（依据 skill 文档）：
 *   - disabled === true 的模型不可选，也不做兜底
 *   - 排除 'auto' 这类路由别名（它不是具体模型）
 *   - 空列表是合法结果，必须显式处理，不能硬编码模型 id
 */
export async function pickModel(): Promise<{ id: string; name: string } | null> {
  const models = await listModels();
  const usable = models.filter(
    (m: any) => m.disabled !== true && typeof m.id === 'string' && m.id !== 'auto'
  );
  if (usable.length === 0) return null;
  const chosen = usable[0];
  return { id: chosen.id, name: chosen.name ?? chosen.id };
}
