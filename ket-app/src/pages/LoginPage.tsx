import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, hasRegisteredUsers, forgotPassword, getRegisteredUsers, generateSyncUrl, importFromUrlHash, USERS_KEY } from '../utils/auth';
import type { User } from '../types/user';

export default function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 忘记密码相关
  const [showForgot, setShowForgot] = useState(false);
  const [forgotName, setForgotName] = useState('');
  const [forgotResult, setForgotResult] = useState<{ success: boolean; message: string; hint?: string; password?: string } | null>(null);

  // 调试相关
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{ users: string[]; url: string; storageAvailable: boolean } | null>(null);

  // 跨设备同步相关
  const [showSync, setShowSync] = useState(false);
  const [syncUrl, setSyncUrl] = useState('');
  const [syncMessage, setSyncMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 模拟网络延迟（提升用户体验）
    setTimeout(() => {
      const result = login(name, password);
      
      if (result.success && result.user) {
        // 登录成功，跳转到首页
        navigate('/');
      } else {
        setError(result.message);
      }
      
      setLoading(false);
    }, 500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotResult(null);

    if (!forgotName.trim()) {
      setError('请输入姓名');
      return;
    }

    const result = forgotPassword(forgotName);

    if (result.success) {
      setForgotResult({
        success: true,
        message: result.message,
        hint: result.hint,
        password: result.password,
      });
    } else {
      setError(result.message);
    }
  };

  // 调试信息
  const handleShowDebug = () => {
    try {
      const users = getRegisteredUsers();
      const url = window.location.href;
      const storageAvailable = typeof Storage !== 'undefined';
      
      setDebugInfo({
        users: users.map(u => u.name),
        url: url,
        storageAvailable: storageAvailable,
      });
      setShowDebug(true);
    } catch (e) {
      setError('无法读取调试信息：' + String(e));
    }
  };

  const handleExportData = () => {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ket-users-backup.json';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert('没有数据可以导出');
      }
    } catch (e) {
      alert('导出失败：' + String(e));
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const data = event.target.result;
            localStorage.setItem(USERS_KEY, data);
            alert('导入成功！请刷新页面。');
          } catch (err) {
            alert('导入失败：' + String(err));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // ========== 跨设备同步功能 ==========
  
  // 自动从 URL 导入（如果 URL 包含同步数据）
  useEffect(() => {
    const result = importFromUrlHash();
    if (result.success && result.imported > 0) {
      setSyncMessage(`✅ ${result.message}，现在可以使用导入的账号登录了！`);
      setTimeout(() => setSyncMessage(''), 5000);
    } else if (!result.success && result.message !== 'URL中没有同步数据') {
      setError(result.message);
    }
  }, []);

  // 生成同步链接
  const handleGenerateSyncUrl = () => {
    const url = generateSyncUrl();
    setSyncUrl(url);
    setShowSync(true);
  };

  // 复制同步链接
  const handleCopySyncUrl = async () => {
    try {
      await navigator.clipboard.writeText(syncUrl);
      alert('✅ 链接已复制到剪贴板！请在另一台设备上打开此链接。');
    } catch {
      const textarea = document.getElementById('sync-url-text') as HTMLTextAreaElement;
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
        alert('✅ 链接已复制！');
      }
    }
  };

  // 忘记密码界面
  if (showForgot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-gray-800">忘记密码</h1>
            <p className="text-gray-600 mt-2">输入您的姓名找回密码</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          {/* 找回结果 */}
          {forgotResult && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              <p className="font-semibold mb-2">✅ {forgotResult.message}</p>
              {forgotResult.hint && (
                <p className="mt-2">💡 <span className="font-medium">密码提示：</span>{forgotResult.hint}</p>
              )}
              {forgotResult.password && (
                <div className="mt-3 p-3 bg-white rounded border border-green-300">
                  <p className="text-sm text-gray-600 mb-1">您的密码是：</p>
                  <p className="text-2xl font-bold text-green-600 font-mono">{forgotResult.password}</p>
                </div>
              )}
            </div>
          )}

          {/* 忘记密码表单 */}
          {!forgotResult && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label htmlFor="forgotName" className="block text-sm font-medium text-gray-700 mb-2">
                  👤 姓名
                </label>
                <input
                  id="forgotName"
                  type="text"
                  value={forgotName}
                  onChange={(e) => setForgotName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="请输入注册时的姓名"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg text-white font-semibold text-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition"
              >
                🔍 找回密码
              </button>
            </form>
          )}

          {/* 返回登录 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setShowForgot(false);
                setForgotResult(null);
                setError('');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← 返回登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo / 标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-3xl font-bold text-gray-800">KET 学习软件</h1>
          <p className="text-gray-600 mt-2">登录后开始学习</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        {/* 同步成功消息 */}
        {syncMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {syncMessage}
          </div>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名输入 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              👤 姓名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="请输入您的姓名"
              autoFocus
            />
          </div>

          {/* 密码输入 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              🔒 密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="请输入密码"
            />
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-lg transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {loading ? '登录中...' : '🚀 登录'}
          </button>
        </form>

        {/* 忘记密码 & 注册链接 */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-600">
            <button
              onClick={() => setShowForgot(true)}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              🔒 忘记密码？
            </button>
          </p>

          {hasRegisteredUsers() && (
            <p className="text-gray-600">
              还没有账户？
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold ml-1">
                立即注册
              </Link>
            </p>
          )}
          
          {/* 如果没有任何用户注册，提示先注册 */}
          {!hasRegisteredUsers() && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-semibold">🎉 欢迎使用 KET 学习软件！</p>
              <p className="text-yellow-700 text-sm mt-1">
                还没有用户，请先
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold ml-1">
                  注册第一个账户
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* 跨设备同步按钮 */}
        <div className="mt-4 text-center">
          <button
            onClick={handleGenerateSyncUrl}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            📱 跨设备同步账号
          </button>
        </div>

        {/* 同步面板 */}
        {showSync && syncUrl && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h3 className="text-sm font-bold text-blue-700 mb-2">📱 跨设备同步账号</h3>
            <div className="text-xs text-blue-600 space-y-1 mb-3">
              <p>1. 复制下面的链接</p>
              <p>2. 将链接发送到另一台设备（手机/平板）</p>
              <p>3. 在另一台设备上打开链接，账号将自动导入</p>
            </div>
            <div className="mt-2">
              <textarea
                id="sync-url-text"
                value={syncUrl}
                readOnly
                className="w-full px-2 py-1 text-xs border border-blue-300 rounded bg-white"
                rows={3}
              />
            </div>
            <div className="mt-2 space-x-2">
              <button
                onClick={handleCopySyncUrl}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                📋 复制链接
              </button>
              <button
                onClick={() => { setShowSync(false); setSyncUrl(''); }}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                关闭
              </button>
            </div>
          </div>
        )}

        {/* 调试面板 */}
        <div className="mt-4 text-center">
          <button
            onClick={handleShowDebug}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            🔧 调试信息
          </button>
        </div>

        {/* 调试信息展开 */}
        {showDebug && debugInfo && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left">
            <h3 className="text-sm font-bold text-gray-700 mb-2">🔧 调试信息</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-semibold">当前 URL：</span>{debugInfo.url}</p>
              <p><span className="font-semibold">localStorage 可用：</span>{debugInfo.storageAvailable ? '✅ 是' : '❌ 否'}</p>
              <p><span className="font-semibold">已注册用户：</span>{debugInfo.users.length > 0 ? debugInfo.users.join(', ') : '无'}</p>
            </div>
            <div className="mt-3 space-x-2">
              <button
                onClick={handleExportData}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                📤 导出数据
              </button>
              <button
                onClick={handleImportData}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              >
                📥 导入数据
              </button>
              <button
                onClick={() => setShowDebug(false)}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
