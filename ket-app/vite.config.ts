import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'

// 自动注入 Git commit 短哈希 + 构建时间，便于在手机上确认是否已更新到最新版
function getGitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}
const BUILD_HASH = getGitHash();
const BUILD_TIME = new Date().toISOString();

// 部署基路径。
//   GitHub Pages    -> /KETZXT/（仓库名作为子路径）
//   WorkBuddy 域名 -> /（根路径）
//
// ⚠️ Windows + Git Bash 的坑：MSYS 会把命令行传入的 "/" 当路径分隔符，
// 自动转换成 Git 安装目录（实测 VITE_BASE_PATH=/KETZXT/ 变成了
// "<PortableGit>/KETZXT/"），base 因此写进产物，页面所有资源 404。
// MSYS_NO_PATHCONV=1 也救不了 —— 它会让脚本路径同时失效。
//
// → 解法：base 一律从**文件**读（Node 读文件不经过 shell，不受影响）：
//   1. base-path.txt        —— 仓库内的目标平台配置（部署用）
//   2. .env 文件的 BASE_PATH —— 本地临时覆盖
//   3. 环境变量              —— 兜底（CI 在 Linux 上没有这个问题）
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// vite.config.ts 所在目录（用绝对路径，避免 cwd 不确定导致读不到文件）
const APP_DIR = dirname(fileURLToPath(import.meta.url));

function readBaseFromFile(): string | null {
  // 读取优先级（必须与 scripts/build-cloud.mjs 一致）：
  //   1. BASE_PATH_FILE 环境变量 —— 部署时显式指定（CI 用它覆盖）
  //   2. .env.local                —— build-cloud 脚本写的值
  //   3. base-path.txt             —— 仓库内默认部署平台
  //
  // ⚠️ build-cloud.mjs **不读 .env.local**（那是它写出去的输出文件，
  //    读回来会读到上次的残留值）。所以这里的 .env.local 只可能是
  //    本次构建刚写的，或开发者手动放的临时值。

  // 1) BASE_PATH_FILE
  if (process.env.BASE_PATH_FILE && existsSync(process.env.BASE_PATH_FILE)) {
    try {
      const v = readFileSync(process.env.BASE_PATH_FILE, 'utf8').trim();
      if (v) return v;
    } catch {
      /* 读不到就跳过 */
    }
  }
  // 2) .env 文件系列（.env.local 优先）
  for (const f of ['.env.local', '.env.production.local', '.env.production', '.env']) {
    const p = join(APP_DIR, f);
    if (!existsSync(p)) continue;
    try {
      const m = readFileSync(p, 'utf8').match(/^\s*BASE_PATH\s*=\s*(.+?)\s*$/m);
      if (m) return m[1].trim().replace(/^["']|["']$/g, '');
    } catch {
      /* 读不到就跳过 */
    }
  }
  // 3) base-path.txt —— 仓库默认
  const target = join(APP_DIR, 'base-path.txt');
  if (existsSync(target)) {
    try {
      const v = readFileSync(target, 'utf8').trim();
      if (v) return v;
    } catch {
      /* 读不到就跳过 */
    }
  }
  return null;
}

function resolveBasePath(): string {
  // 1) 首选文件（不受 MSYS 参数转换影响）
  const fromFile = readBaseFromFile();
  // 2) 其次环境变量（BASE_PATH 优先于 VITE_BASE_PATH）
  const raw = fromFile ?? process.env.BASE_PATH ?? process.env.VITE_BASE_PATH ?? '/KETZXT/';
  if (!raw) return '/';
  console.warn(`[vite] base 路径 = ${raw}${fromFile ? '（来自文件）' : ''}`);

  // 3) MSYS 转换后的产物形如 "C:/.../PortableGit/KETZXT/"
  //    尾部才是真正的 base，剥掉前缀还原
  if (/^[A-Za-z]:[\\/]/.test(raw)) {
    const m = raw.match(/PortableGit[\\/](.*)$/);
    const restored = m && m[1] ? '/' + m[1].replace(/\\/g, '/') : '/';
    console.warn(`[vite] 检测到 MSYS 路径转换，已还原为 ${restored}`);
    return normalizeBase(restored);
  }
  return normalizeBase(raw);
}

function normalizeBase(raw: string): string {
  let b = raw.trim().replace(/\\/g, '/');
  if (!b) return '/';
  if (!b.startsWith('/')) b = '/' + b;
  if (!b.endsWith('/')) b = b + '/';
  return b;
}

const BASE_PATH = resolveBasePath();

// https://vite.dev/config/
export default defineConfig({
  base: BASE_PATH,  // 部署基路径（GitHub Pages 子路径 / WorkBuddy 根路径）
  define: {
    'import.meta.env.VITE_BUILD_HASH': JSON.stringify(BUILD_HASH),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(BUILD_TIME),
  },
  server: {
    // 历史遗留：早期 Cloudflare Worker 后端的本地调试代理（wrangler dev，默认 8787）。
    // 现网 AI 批改走 WorkBuddy 云服务 SDK，不经过 /llm；此代理仅老版本本地调试用，可安全移除。
    proxy: {
      '/llm': {
        target: process.env.LLM_DEV_TARGET || 'http://127.0.0.1:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/llm/, ''),
      },
    },
    // 云服务反向代理会用域名访问，必须监听 0.0.0.0 并放行 Host 检查，
    // 否则 Vite 报 "Blocked request. This host is not allowed."
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    // 同上：生产预览服务也要监听 0.0.0.0 并放行 Host
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            // 题库数据（源码 79%）单独成 chunk：主 bundle 变小，首屏解析快；
            // chunk 仍会被 precache，离线可用性不受影响。
            { name: 'data', test: /[\\/]src[\\/]data[\\/]/ },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'KET智学通',
        short_name: 'KET智学通',
        description: 'KET/PET 英语学习助手 - 词汇、语法、阅读一站式练习',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        // scope / start_url 必须与 base 路径一致，否则 Service Worker 注册范围不对，
        // PWA 装到桌面后打不开（旧版硬编码 /KETZXT/，迁到 WorkBuddy 根路径会失效）
        scope: BASE_PATH,
        start_url: BASE_PATH,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // 主 bundle 约 2.1MB（题库数据占了源码 79%），超过 workbox 默认的 2MiB 限制
        // 会导致它「不会被预缓存」—— 离线时站点直接打不开，且 build 以退出码 1 结束（CI 变红）。
        // 这里放宽到 4MiB：题库必须离线可用（孩子可能在没网的地方做题）。
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // 口语配图（public/speaking/*.png，10 张共 12MB，单张最大 1.1MB）
        // 不进 precache：precache 是「装 SW 时全量预下载」，12MB 会拖慢首次安装、
        // 浪费流量。改为下面的 runtimeCaching 按需缓存。
        globIgnores: ['**/speaking/*.png'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // ========== 单词/句子音频缓存 ==========
          // 背景：public/audio 下有 2268 个预生成 mp3（34MB），原本既不在 precache
          // 也没有 runtimeCaching —— 孩子每点一次发音都要联网下载，国内网络下经常转圈失败。
          //
          // 关键技术前提（不能省略，否则这条规则等于没加）：
          // 浏览器用 <audio> 播放时会发 Range: bytes=0- 请求，而 GitHub Pages 对此返回
          // 206 Partial Content。workbox v7 的缓存策略只接受 status 200 入缓存
          // （workbox-strategies/StrategyHandler.ts:612），所以直接写 CacheFirst
          // 会导致「206 不入缓存 → 每次仍走网络」，缓存完全失效。
          //
          // 解决：
          //  1) requestWillFetch 剥掉 Range 头 → 让服务器返回完整 200 → 可入缓存；
          //  2) 命中缓存时用 workbox 的 rangeRequests 简写把完整响应切片回 206 给浏览器。
          //     （workbox-build 支持 options.rangeRequests: true，等价于挂 RangeRequestsPlugin）
          // 这样「播过一次即本地留存」，之后完全离线可用。
          {
            urlPattern: /\/audio\/[^/]+\.mp3$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-mp3',
              // 剥掉 Range 头，让完整文件（200）能进缓存
              plugins: [
                {
                  requestWillFetch: ({ request }: { request: Request }) => {
                    if (!request.headers.has('range')) return request;
                    const headers = new Headers(request.headers);
                    headers.delete('range');
                    return new Request(request, { headers });
                  },
                },
              ],
              // 命中缓存时按 Range 头切片回 206，满足 <audio> 的分段播放
              rangeRequests: true,
              expiration: {
                maxEntries: 2400,
                maxAgeSeconds: 60 * 60 * 24 * 90,
                purgeOnQuotaError: true,
              },
            },
          },
          // ========== 口语配图缓存 ==========
          // public/speaking 下 10 张 png（约 12MB，单张最大 1.1MB）。
          // 虽然已在 precache 里（globPatterns 含 png），但 precache 是「全量预下载」，
          // 首次安装 SW 就要拉 12MB，会拖慢首屏。这里改为按需缓存，不进 precache。
          {
            urlPattern: /\/speaking\/[^/]+\.png$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'speaking-img',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 90,
                purgeOnQuotaError: true,
              },
            },
          },
        ],
      },
    }),
  ],
})
