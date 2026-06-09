import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../utils/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 前端验证
    if (!name.trim() || !password || !confirmPassword) {
      setError('请填写所有必填字段');
      return;
    }

    if (name.trim().length < 2) {
      setError('姓名至少需要2个字符');
      return;
    }

    if (password.length < 4) {
      setError('密码至少需要4个字符');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    // 模拟网络延迟
    setTimeout(() => {
      const result = register(name, password, passwordHint.trim());

      if (result.success) {
        setSuccess(result.message + ' 正在跳转到登录页面...');
        // 2秒后跳转到登录页面
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message);
      }

      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-gray-800">注册新账户</h1>
          <p className="text-gray-600 mt-2">创建您的 KET 学习账户</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        {/* 成功提示 */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            ✅ {success}
          </div>
        )}

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名输入 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              👤 姓名 *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="请输入您的姓名"
              autoFocus
            />
          </div>

          {/* 密码输入 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              🔒 密码 *
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="至少4个字符"
            />
          </div>

          {/* 确认密码 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              🔒 确认密码 *
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="再次输入密码"
            />
          </div>

          {/* 密码提示（可选）*/}
          <div>
            <label htmlFor="passwordHint" className="block text-sm font-medium text-gray-700 mb-2">
              💡 密码提示（可选）
            </label>
            <input
              id="passwordHint"
              type="text"
              value={passwordHint}
              onChange={(e) => setPasswordHint(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="例如：我的生日月份是？（忘记密码时会显示）"
            />
            <p className="text-xs text-gray-400 mt-1">忘记密码时，此提示会帮助您回忆（同一台设备使用）</p>
          </div>

          {/* 注册按钮 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-lg transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
            }`}
          >
            {loading ? '注册中...' : '📝 注册'}
          </button>
        </form>

        {/* 登录链接 */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            已有账户？
            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold ml-1">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
