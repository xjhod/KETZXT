import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, getUserList, deleteUser } from '../utils/auth';
import type { User } from '../types/user';

interface HeaderProps {
  onMenuClick: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export default function Header({ onMenuClick, isDark, onToggleDark }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userList = getUserList().filter(u => u.id !== currentUser?.id);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login', { replace: true });
  };

  const handleSwitchUser = () => {
    setShowUserMenu(false);
    navigate('/login', { replace: true });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`确定要删除用户"${userName}"吗？删除后数据无法恢复！`)) {
      const result = deleteUser(userId, currentUser?.id || '');
      if (result.success) {
        alert(result.message);
        setShowUserMenu(false);
        // 如果删除成功，刷新用户列表
        window.location.reload();
      } else {
        alert(result.message);
      }
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

                {userList.length > 0 && (
                  <button
                    onClick={handleSwitchUser}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    🔄 切换用户
                  </button>
                )}

                {/* 其他用户管理（删除）*/}
                {userList.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                    <p className="px-4 py-1 text-xs text-gray-400 dark:text-gray-500">其他用户</p>
                    {userList.map(u => (
                      <div key={u.id} className="flex items-center justify-between px-4 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{u.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(u.id, u.name);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="删除此用户"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}

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
