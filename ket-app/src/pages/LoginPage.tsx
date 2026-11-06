import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rehydrateAllStores } from '../store/rehydrateStores';
import { syncNow } from '../utils/sync';
import { sendCloudOtp, verifyCloudOtp, isCloudConnected } from '../utils/cloudAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [cloudMode, setCloudMode] = useState<'phone' | 'email'>('phone');
  const [cloudPhone, setCloudPhone] = useState('');
  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudCode, setCloudCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMessage, setCloudMessage] = useState('');
  const [cloudOk, setCloudOk] = useState(false);
  const [cloudConnected, setCloudConnected] = useState(isCloudConnected());

  /** 发送验证码（手机号或邮箱，由 cloudMode 决定） */
  const handleSendOtp = async () => {
    setCloudMessage('');
    setCloudOk(false);
    const target = cloudMode === 'phone' ? cloudPhone.trim() : cloudEmail.trim();
    if (!target) {
      setCloudMessage(cloudMode === 'phone' ? '请先填写手机号' : '请先填写邮箱');
      return;
    }
    setCloudBusy(true);
    try {
      const res =
        cloudMode === 'phone'
          ? await sendCloudOtp({ phone: target })
          : await sendCloudOtp({ email: target });
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
    const target = cloudMode === 'phone' ? cloudPhone.trim() : cloudEmail.trim();
    if (!target || !cloudCode.trim()) {
      setCloudMessage(cloudMode === 'phone' ? '请填写手机号和验证码' : '请填写邮箱和验证码');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo / 标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-3xl font-bold text-gray-800">KET 智学通</h1>
          <p className="text-gray-600 mt-2">用手机号或邮箱连接云端后开始学习</p>
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

        {/* 云端登录（推荐：多设备自动同步学习进度） */}
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
            用手机号或邮箱接收验证码即可连接云端。连接后，学习进度（做题记录、打卡、备考计划）会在多台设备间自动同步。
            一个手机号/邮箱对应一个小孩，换设备时用同一个账号登录，进度自动拉回。
          </p>

          {/* 手机号 / 邮箱 切换 */}
          <div className="flex gap-1 mb-2 p-1 bg-white/70 rounded-lg border border-indigo-200">
            <button
              type="button"
              onClick={() => { setCloudMode('phone'); setOtpSent(false); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                cloudMode === 'phone' ? 'bg-indigo-600 text-white' : 'text-indigo-700'
              }`}
            >
              📱 手机号
            </button>
            <button
              type="button"
              onClick={() => { setCloudMode('email'); setOtpSent(false); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                cloudMode === 'email' ? 'bg-indigo-600 text-white' : 'text-indigo-700'
              }`}
            >
              ✉️ 邮箱
            </button>
          </div>

          <form onSubmit={handleCloudLogin} className="space-y-2">
            {cloudMode === 'phone' ? (
              <input
                type="tel"
                value={cloudPhone}
                onChange={(e) => setCloudPhone(e.target.value)}
                className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="手机号"
                inputMode="numeric"
                maxLength={11}
                autoComplete="tel"
              />
            ) : (
              <input
                type="email"
                value={cloudEmail}
                onChange={(e) => setCloudEmail(e.target.value)}
                className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="邮箱地址"
                autoComplete="email"
              />
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={cloudCode}
                onChange={(e) => setCloudCode(e.target.value)}
                className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder={cloudMode === 'phone' ? '短信验证码' : '邮件验证码'}
                inputMode="numeric"
                maxLength={8}
                autoComplete="one-time-code"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={cloudBusy || otpSent}
                className="px-3 py-2 rounded-lg text-sm font-semibold border border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {cloudBusy ? '发送中…' : otpSent ? '已发送' : '获取验证码'}
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
      </div>
    </div>
  );
}
