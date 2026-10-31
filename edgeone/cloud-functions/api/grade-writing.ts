/**
 * AI 写作增强批改（EdgeOne Pages Cloud Functions）
 * 路由：/api/grade-writing
 */

import { error, handleWriting, readEnv, type WritingRequest } from '../_lib/core';

export async function onRequest(context: any): Promise<Response> {
  const env = readEnv(context);
  const request: Request = context.request;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  if (request.method !== 'POST') return error('Method Not Allowed', 405);

  let body: WritingRequest;
  try {
    body = (await request.json()) as WritingRequest;
  } catch {
    return error('请求体不是合法 JSON');
  }
  return handleWriting(body, env);
}
