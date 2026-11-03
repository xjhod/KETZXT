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
 */

import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname, normalize } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

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

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);

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
