/**
 * 健康检查（EdgeOne Pages Cloud Functions）
 * 路由：/api/health
 *
 * 前端启动时调用一次，据此决定是否显示「AI 批改」入口。
 * 同时探测同步存储是否可用（Blob 是否绑定成功）。
 */

import { json, readEnv } from '../_lib/core';

export async function onRequest(context: any): Promise<Response> {
  const env = readEnv(context);

  // 探测 Blob 是否可用（首次调用会自动创建 namespace，可能稍慢）
  let blobOk = false;
  try {
    const { getStore } = await import('@edgeone/pages-blob');
    const store = getStore({ name: 'ketzxt-sync', consistency: 'strong' });
    await store.list({ prefix: 'probe/', limit: 1 });
    blobOk = true;
  } catch (e) {
    blobOk = false;
  }

  return json({
    ok: true,
    llm: Boolean(env.DEEPSEEK_API_KEY),
    asr: Boolean(env.SILICONFLOW_API_KEY),
    speechMode: env.SILICONFLOW_API_KEY ? 'cloud-asr' : 'browser',
    model: 'deepseek-chat',
    asrModel: 'FunAudioLLM/SenseVoiceSmall',
    runtime: 'edgeone-node',
    node: process.version,
    sync: blobOk,
  });
}
