import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rehydrateAllStores } from '../store/rehydrateStores';
import { syncNow } from '../utils/sync';
import {
  sendCloudOtp,
  verifyCloudOtp,
  isCloudConnected,
  takeLastCloudError,
  takeEmailPrefill,
} from '../utils/cloudAuth';

// 构建标识：显示出来便于确认手机是否跑着最新版（PWA 旧缓存是反复失败的常见原因）
const BUILD_HASH = String((import.meta.env as any).VITE_BUILD_HASH ?? 'unknown').slice(0, 7);
const BUILD_TIME = String((import.meta.env as any).VITE_BUILD_TIME ?? '').slice(0, 16).replace('T', ' ');

export default function LoginPage() {
  const navigate = useNavigate();
  // 邮件「确认邮箱并登录」按钮回跳时，取出链接里带回的验证码 / 邮箱预填
  const [prefill] = useState(takeEmailPrefill);
  const [cloudEmail, setCloudEmail] = useState(prefill.email);
  const [cloudCode, setCloudCode] = useState(prefill.code);
  // ⚠️ 预填验证码 **不代表** 本机已经发过码：邮件链接常在另一个浏览器 / 邮箱 App 内打开，
  // 那边没有发码时持久化的凭据。若这里置 true 会禁用「获取验证码」，用户被红色提示
  // 要求「重新获取」却点不了按钮 —— 死锁。因此永远从 false 开始。
  const [otpSent, setOtpSent] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  // 上一次邮箱链接自动登录失败的原始错误（便于定位，不再静默回登录页）
  const [cloudMessage, setCloudMessage] = useState(() => takeLastCloudError() ?? '');
  const [cloudOk, setCloudOk] = useState(false);
  const [cloudConnected, setCloudConnected] = useState(isCloudConnected());

  /** 发送邮箱验证码 */
  const handleSendOtp = async () => {
    setCloudMessage('');
    setCloudOk(false);
    const target = cloudEmail.trim();
    if (!target) {
      setCloudMessage('请先填写邮箱');
      return;
    }
    setCloudBusy(true);
    try {
      const res = await sendCloudOtp({ email: target });
      setCloudMessage(res.message);
      setCloudOk(res.ok);
      if (res.ok) setOtpSent(true);
    } catch (err) {
      setCloudMessage('发送失败：' + String(err));
    } finally {
      setCloudBusy(false);
    }
  };

  /** 验证码登录 + 首次同步 */
  const handleCloudLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloudMessage('');
    setCloudOk(false);
    const target = cloudEmail.trim();
    if (!target || !cloudCode.trim()) {
      setCloudMessage('请填写邮箱和验证码');
      return;
    }
    setCloudBusy(true);
    try {
      const auth = await verifyCloudOtp(cloudCode.trim());
      setCloudMessage(auth.message);
      setCloudOk(auth.ok);
      if (!auth.ok) return;

      // 登录成功：先把三个学习 store 从「当前用户」分片重新载入
      await rehydrateAllStores();

      // 登录成功 -> 立刻做一次完整同步（拉取 + 合并 + 上传）
      const res = await syncNow();
      setCloudMessage(res.ok ? `云端已连接，${res.message}` : `已登录，但同步失败：${res.message}`);
      setCloudOk(res.ok);
      if (res.ok) {
        setCloudConnected(true);
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (err) {
      setCloudMessage('连接失败：' + String(err));
    } finally {
      setCloudBusy(false);
    }
  };

  /** 一键跳出旧版 PWA 缓存：注销 Service Worker + 清空 Cache Storage 后重载 */
  const handleHardRefresh = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
      }
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      // 清理失败也照样重载，不阻塞用户
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo / 标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-3xl font-bold text-gray-800">KET 智学通</h1>
          <p className="text-gray-600 mt-2">用邮箱连接云端，学习进度多设备自动同步</p>
        </div>

        {/* 云端消息提示 */}
        {cloudMessage && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              cloudOk
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {cloudOk ? '✅' : '❌'} {cloudMessage}
          </div>
        )}

        {/* 云端登录（邮箱验证码，多设备自动同步学习进度） */}
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-indigo-800">☁️ 云端登录（多设备）</h3>
            {cloudConnected && (
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                已连接
              </span>
            )}
          </div>
          <p className="text-xs text-indigo-600 mb-3">
            填写邮箱后会收到 6 位数字验证码，填入下方即可。若邮件只有「确认邮箱并登录」按钮，
            请复制按钮的链接网址，取其中「verificationCode=」后面的 6 位数字填入。
            请在同一浏览器内完成。连接后，学习进度（做题记录、打卡、备考计划）会在多台设备间自动同步，
            换设备用同一邮箱登录即可拉回。
          </p>

          <form onSubmit={handleCloudLogin} className="space-y-2">
            <input
              type="email"
              value={cloudEmail}
              onChange={(e) => setCloudEmail(e.target.value)}
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              placeholder="邮箱地址"
              autoComplete="email"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={cloudCode}
                onChange={(e) => setCloudCode(e.target.value)}
                className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="邮件验证码"
                inputMode="numeric"
                maxLength={8}
                autoComplete="one-time-code"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={cloudBusy}
                className="px-3 py-2 rounded-lg text-sm font-semibold border border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {cloudBusy ? '发送中…' : otpSent ? '重新发送' : '获取验证码'}
              </button>
            </div>
            <button
              type="submit"
              disabled={cloudBusy}
              className={`w-full py-2 px-4 rounded-lg text-white text-sm font-semibold transition ${
                cloudBusy
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
              }`}
            >
              {cloudBusy ? '连接中...' : cloudConnected ? '重新连接并同步' : '连接云端并同步'}
            </button>
          </form>
        </div>

        {/* 版本标识 + 一键跳出旧 SW 缓存 */}
        <div className="mt-5 flex items-center justify-between text-[11px] text-gray-400">
          <span>版本 {BUILD_HASH}{BUILD_TIME ? ` · ${BUILD_TIME}` : ''}</span>
          <button
            type="button"
            onClick={handleHardRefresh}
            className="underline decoration-gray-300 hover:text-indigo-500"
          >
            清除缓存并重载
          </button>
        </div>
      </div>
    </div>
  );
}
