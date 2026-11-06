import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/auth';
import { syncNow } from '../utils/sync';
import { isCloudConnected, unlinkCloud } from '../utils/cloudAuth';
import { rehydrateAllStores } from '../store/rehydrateStores';

interface HeaderProps {
  onMenuClick: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export default function Header({ onMenuClick, isDark, onToggleDark }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncHint, setSyncHint] = useState('');
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const cloudOn = isCloudConnected();

  const handleLogout = async () => {
    await unlinkCloud(); // 先解绑云端登录态（不触发 reload）
    logout();
    setShowUserMenu(false);
    await rehydrateAllStores(); // 清空内存中上一个用户的数据（载入 guest/空）
    navigate('/login', { replace: true });
  };

  /** 手动同步：拉取云端合并后，把合并结果回传（保证云端是完整状态） */
  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncHint('');
    try {
      const res = await syncNow();
      setSyncHint(res.ok ? (res.merged ? `已同步 ${res.merged} 条` : '已同步') : res.message);
      setTimeout(() => setSyncHint(''), 3000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 relative">
      {/* 移动端菜单按钮 */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 页面标题 - 移动端居中 */}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 lg:hidden transition-colors">KET 智学通</h2>

      {/* 右侧信息 */}
      <div className="flex items-center gap-3 ml-auto">
        {/* 深色模式切换按钮 */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors text-xl"
          title={isDark ? '切换到浅色模式' : '切换到深色模式'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <span className="text-sm text-gray-400 dark:text-gray-500 hidden md:inline">Phase 1 Demo</span>

        {/* 云端同步按钮 */}
        {currentUser && (
          <button
            onClick={handleSync}
            disabled={syncing || !cloudOn}
            className={`p-2 rounded-lg transition-colors text-lg ${
              !cloudOn
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : syncing
                  ? 'text-blue-400 animate-pulse'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
            }`}
            title={
              cloudOn
                ? syncing ? '同步中...' : '点击同步到云端'
                : '未连接云端，请在登录页连接'
            }
          >
            ☁️
          </button>
        )}

        {/* 同步结果提示 */}
        {syncHint && (
          <span className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap hidden sm:inline">
            {syncHint}
          </span>
        )}

        {/* 用户头像/菜单 */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm font-medium transition-colors hover:bg-blue-200 dark:hover:bg-blue-800"
              title={currentUser.name}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </button>

            {/* 用户下拉菜单 */}
            {showUserMenu && (
              <div className="absolute right-0 top-10 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">当前用户</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
                >
                  🚪 退出登录
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 点击空白关闭菜单 */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
