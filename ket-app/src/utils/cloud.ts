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
 *
 * 部署说明：应用仅通过 GitHub Pages 提供（https://xjhod.github.io/KETZXT/），
 * 无需部署到 CLOUD_ENDPOINT 对应的域名。CLOUD_ENDPOINT 仅作为数据面地址，
 * 2026-11-03 已用真实 SDK 逐模块实测：两个 Origin（GitHub Pages 与云域名）调用云服务均正常。
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
