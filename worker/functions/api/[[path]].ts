/**
 * Cloudflare Pages Functions 入口（部署到 *.pages.dev —— 国内直连可用）
 *
 * 为什么不用 workers.dev：实测该域名在国内被 DNS 污染
 *   workers.dev → 108.160.163.112（被污染的 IP 段，直连超时）
 *   pages.dev   → 104.18.21.135（Cloudflare 真实 IP，直连正常）
 * pages.dev 未被污染，且 Pages Functions 可单独部署（只放 functions/，无静态资源），
 * 静态站继续留在 GitHub Pages —— 两者解耦。
 *
 * 路由约定（Pages Functions 文件名即路由）：
 *   functions/api/[[path]].ts  ->  /api/*
 */

import { handleRequest } from '../../src/index';

interface Env {
  DEEPSEEK_API_KEY?: string;
  SILICONFLOW_API_KEY?: string;
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  return handleRequest(request, env);
};
