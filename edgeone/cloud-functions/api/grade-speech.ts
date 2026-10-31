/**
 * AI 口语评分（EdgeOne Pages Cloud Functions）
 * 路由：/api/grade-speech
 *
 * 链路：音频 -> SiliconFlow ASR 转文字 -> DeepSeek 按 KET A2 口语标准四维评分
 */

import { error, handleSpeech, readEnv, type SpeechRequest } from '../_lib/core';

export async function onRequest(context: any): Promise<Response> {
  const env = readEnv(context);
  const request: Request = context.request;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  if (request.method !== 'POST') return error('Method Not Allowed', 405);

  let body: SpeechRequest;
  try {
    body = (await request.json()) as SpeechRequest;
  } catch {
    return error('请求体不是合法 JSON');
  }
  return handleSpeech(body, env);
}
