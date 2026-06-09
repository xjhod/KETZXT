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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
