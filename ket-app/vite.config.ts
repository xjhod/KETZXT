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

// https://vite.dev/config/
export default defineConfig({
  base: '/KETZXT/',  // GitHub Pages 需要仓库名作为子路径
  define: {
    'import.meta.env.VITE_BUILD_HASH': JSON.stringify(BUILD_HASH),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(BUILD_TIME),
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
        scope: '/KETZXT/',           // ✅ 修复：匹配 base 路径
        start_url: '/KETZXT/',       // ✅ 修复：匹配 base 路径
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
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
