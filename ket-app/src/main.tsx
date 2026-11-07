import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// ========== 全局运行时错误捕获 ==========
// 加在入口处，在任何模块加载之前生效
// 发生运行时错误时直接显示在页面上，不再白屏
if (typeof window !== 'undefined') {
  const origOnError = (window as any).onerror;
  (window as any).onerror = (msg: any, _url: any, _line: any, _col: any, error: any) => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;padding:14px 20px;background:#ef4444;color:white;font-size:13px;font-family:monospace;white-space:pre-wrap;word-break:break-all;';
    el.textContent = '🚨 Runtime Error: ' + (error?.message || (typeof msg === 'string' ? msg : String(msg)));
    document.body.prepend(el);
    if (origOnError) origOnError(msg, _url, _line, _col, error);
  };

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;padding:14px 20px;background:#f59e0b;color:white;font-size:13px;font-family:monospace;white-space:pre-wrap;word-break:break-all;';
    el.textContent = '🚨 Unhandled Promise: ' + ((e as any).reason?.message || String((e as any).reason));
    document.body.prepend(el);
  });
}

// ========== PWA 缓存自愈 ==========
// 线上部署新版本后，旧的 Service Worker 可能仍返回 precache 里的旧 index.html / 旧 JS，
// 用户会连续几轮都跑在旧代码上（典型症状：报错文字始终一模一样）。
//
// 思路：用一次普通 fetch（mode 非 navigate，不会被 workbox 的 NavigationRoute 拦截）
// 拉取线上最新 HTML，比对主 bundle 文件名；不一致就注销所有 SW、清空 Cache Storage
// 并重载，强制跳到线上最新版。版本一致时不做任何事，不影响离线使用。
async function forceUpdateIfStale(): Promise<void> {
  if (!('serviceWorker' in navigator) || !window.caches) return;
  try {
    const current = Array.from(
      document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]'),
    )
      .map((s) => s.src.split('/').pop() ?? '')
      .find((name) => /^index-.*\.js$/.test(name));
    if (!current) return;

    const url = new URL(window.location.href);
    url.searchParams.set('__vcheck', String(Date.now())); // 同时保留 sharecode 等业务参数
    const res = await fetch(url.toString(), { cache: 'no-store', headers: { Accept: 'text/html' } });
    if (!res.ok) return;
    const html = await res.text();
    const match = html.match(/src="[^"]*\/assets\/(index-[^"]+\.js)"/);
    if (!match || match[1] === current) return;

    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    window.location.reload();
  } catch {
    // 检查失败（离线 / 边缘拦截）不影响正常使用
  }
}
void forceUpdateIfStale();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
