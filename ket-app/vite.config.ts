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
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
