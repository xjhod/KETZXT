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
import { pickTextModel } from './modelPicker';

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
 * ⚠️ 不能简单取列表第一个：目录首个是推理型 `hy4free`，它把输出全部放进
 * `delta.reasoning_content`，`delta.content` 恒为空，会让 llm.ts 拿到空文本，
 * 口语 / 写作 AI 评分一律失败（2026-11-08 线上实测）。
 * 具体筛选规则见 utils/modelPicker.ts（纯函数，可用脚本单测）。
 */
export async function pickModel(): Promise<{ id: string; name: string } | null> {
  const models = await listModels();
  return pickTextModel(models);
}
