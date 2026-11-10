/**
 * 生产静态服务器（部署到 WorkBuddy 云服务用）
 *
 * 为什么不用 vite preview：
 *   vite preview 不处理 SPA 的 history fallback，且在云沙箱里需要额外装 vite。
 *   这里用 Node 内置 http + fs 实现，零依赖，行为可预期。
 *
 * 要点：
 *   1) 监听 PORT 环境变量绑 0.0.0.0（云平台反向代理要求）
 *   2) SPA fallback：非静态资源路径一律回 index.html
 *      （前端用 react-router，/plan /vocab 这类前端路由直接刷新必须能打开）
 *   3) Service Worker 与 manifest 不做缓存，保证更新能立刻生效；
 *      带 hash 的构建产物（assets/*.js|css）可以长期缓存
 *   4) 正确设置 Content-Type，避免 .mp3 / .wasm 等被浏览器误判
 *   5) /api/health：只读探针，用于验证同源 /api/* 是否被边缘层放行、
 *      POST 大 body 是否可达，以及冷启动 / 热请求的真实延迟。
 *      只统计字节数，不缓冲、不回显请求体、不落盘、不记日志。
 *      正式 ASR 接口必须另加鉴权、限流与体积上限，不要复用本端点的宽松行为。
 */

import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname, normalize } from 'path';
import { fileURLToPath } from 'url';

const APP_DIR = join(fileURLToPath(new URL('.', import.meta.url)), '..');
// 静态根目录：可用 BUILD_OUT_DIR 指定（与 build-cloud.mjs 的输出一致），
// C 盘空间紧张时可以指到别的盘。
const ROOT = process.env.BUILD_OUT_DIR
  ? join(process.env.BUILD_OUT_DIR, '')
  : join(APP_DIR, 'dist');
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const HEALTH_PATH = '/api/health';
// 只有 Origin 命中白名单才回 CORS 头，绝不发 Access-Control-Allow-Origin: *
const ALLOWED_ORIGINS = new Set(
  (process.env.ASR_ALLOWED_ORIGINS || 'https://ketzxt-99302.app.workbuddy.host')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

/** 这些文件必须每次都回源，否则改了版本用户还拿到旧的 */
const NO_CACHE = new Set(['/sw.js', '/registerSW.js', '/index.html', '/manifest.webmanifest']);

async function tryFile(pathname) {
  // 防目录穿越：normalize 后必须仍在 ROOT 之内
  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const full = join(ROOT, safe);
  if (!full.startsWith(ROOT)) return null;
  try {
    const s = await stat(full);
    if (!s.isFile()) return null;
    return full;
  } catch {
    return null;
  }
}

function healthHeaders(req, extra = {}) {
  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    ...extra,
  };
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }
  return headers;
}

function sendHealthJson(req, res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, healthHeaders(req, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  }));
  res.end(body);
}

/** 流式计数，不保留音频内容；超限也不提前断开，避免客户端拿到空响应 */
async function countBodyBytes(req) {
  let bytes = 0;
  for await (const chunk of req) bytes += chunk.length;
  return bytes;
}

async function handleHealth(req, res, url, startedAt) {
  const method = (req.method || 'GET').toUpperCase();
  const base = {
    ok: true,
    service: 'ket-serve-dist-health',
    method,
    path: url.pathname,
    uptimeSec: Math.round(process.uptime()),
    serverTime: new Date().toISOString(),
  };

  if (method === 'OPTIONS') {
    res.writeHead(204, healthHeaders(req, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '600',
    }));
    res.end();
    return;
  }
  if (method !== 'GET' && method !== 'POST') {
    sendHealthJson(req, res, 405, { ...base, ok: false, error: 'method_not_allowed' });
    return;
  }

  // 探针故意不设体积上限：要测的正是「边缘层会不会拦大 body」
  const receivedBytes = method === 'POST' ? await countBodyBytes(req) : 0;
  sendHealthJson(req, res, 200, {
    ...base,
    receivedBytes,
    handlerMs: Date.now() - startedAt,
  });
}

const server = createServer(async (req, res) => {
  const startedAt = Date.now();
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);

    // API 探针必须排在 SPA fallback 之前，否则会被回成 index.html
    if (pathname === HEALTH_PATH) {
      await handleHealth(req, res, url, startedAt);
      return;
    }

    let file = await tryFile(pathname);

    // SPA fallback：非静态资源路径回 index.html
    if (!file) {
      const ext = extname(pathname);
      if (ext && ext !== '.html') {
        // 带了扩展名却不存在 —— 是真的 404，不要回 index.html
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }
      file = await tryFile('/index.html');
      if (!file) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('dist/index.html not found - did you run the build?');
        return;
      }
    }

    const body = await readFile(file);
    const ext = extname(file).toLowerCase();
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': body.length,
    };

    if (NO_CACHE.has(pathname)) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else if (pathname.startsWith('/assets/')) {
      // 带 hash 的构建产物，内容变了文件名也变，可以长期缓存
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
      headers['Cache-Control'] = 'public, max-age=3600';
    }

    res.writeHead(200, headers);
    res.end(body);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Error: ' + (err && err.message ? err.message : String(err)));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[serve-dist] listening on http://${HOST}:${PORT}, root=${ROOT}`);
});
