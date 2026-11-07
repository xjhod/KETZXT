import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SafeUser } from '../types/user';
import {
  getCurrentUser,
  getDisplayName,
  logout,
  setNickname,
  NICKNAME_MAX_LEN,
  normalizeNickname,
  USER_CHANGED_EVENT,
} from '../utils/auth';
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
  // 个人中心：昵称编辑态
  const [user, setUser] = useState<SafeUser | null>(() => getCurrentUser());
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [profileHint, setProfileHint] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);
  const navigate = useNavigate();
  const cloudOn = isCloudConnected();
  const displayName = getDisplayName(user);

  // 登录、改昵称、云端同步拉回资料都会写 localStorage，这里统一订阅刷新
  useEffect(() => {
    const refresh = () => setUser(getCurrentUser());
    window.addEventListener(USER_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(USER_CHANGED_EVENT, refresh);
  }, []);

  const showHint = (msg: string) => {
    setSyncHint(msg);
    setTimeout(() => setSyncHint(''), 3000);
  };

  const handleLogout = async () => {
    await unlinkCloud(); // 先解绑云端登录态（不触发 reload）
    logout();
    setUser(null);
    setShowUserMenu(false);
    setEditingNickname(false);
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
      setUser(getCurrentUser()); // 同步可能拉回了另一台设备改过的昵称
      showHint(res.ok ? (res.merged ? `已同步 ${res.merged} 条` : '已同步') : res.message);
    } finally {
      setSyncing(false);
    }
  };

  /**
   * 保存昵称：先落到本机（立即生效），再尽力推到云端。
   * 云端失败不回滚本机修改，等下次手动/自动同步补上。
   * 传空串 = 清除自定义昵称，恢复显示账号标识。
   */
  const saveNickname = async (raw: string) => {
    if (savingNickname) return;
    setSavingNickname(true);
    setProfileHint('');
    const res = setNickname(raw);
    if (!res.ok) {
      setProfileHint(res.message);
      setSavingNickname(false);
      return;
    }
    setUser(res.user ?? getCurrentUser());
    setEditingNickname(false);

    if (isCloudConnected()) {
      setProfileHint('昵称已保存，正在同步到云端…');
      try {
        const s = await syncNow();
        setUser(getCurrentUser());
        setProfileHint(
          s.ok ? '昵称已保存并同步到云端' : `昵称已保存（云端暂未同步：${s.message}）`,
        );
        showHint(s.ok ? '昵称已同步' : '资料同步稍后重试');
      } catch (e) {
        setProfileHint(`昵称已保存（云端暂未同步：${(e as Error).message}）`);
      }
    } else {
      setProfileHint('昵称已保存（未连接云端，仅本机显示）');
    }
    setSavingNickname(false);
    setTimeout(() => setProfileHint(''), 4000);
  };

  const openNicknameEditor = () => {
    setNicknameDraft(user?.nickname ?? '');
    setProfileHint('');
    setEditingNickname(true);
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
        {user && (
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

        {/* 用户头像 / 个人中心 */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setEditingNickname(false);
                setProfileHint('');
              }}
              className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm font-medium transition-colors hover:bg-blue-200 dark:hover:bg-blue-800"
              title={`${displayName} · 个人中心`}
            >
              {Array.from(displayName)[0]?.toUpperCase() ?? 'K'}
            </button>

            {/* 个人中心下拉面板 */}
            {showUserMenu && (
              <div className="absolute right-0 top-10 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">个人中心</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5" title={user.name}>
                    账号：{user.name}
                  </p>
                  <p className="text-xs mt-1">
                    <span className={cloudOn ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                      {cloudOn ? '☁️ 云端已连接 · 进度与昵称跨设备同步' : '☁️ 未连接云端 · 仅本机有效'}
                    </span>
                  </p>
                </div>

                {editingNickname ? (
                  <div className="px-4 py-3">
                    <label htmlFor="nickname-input" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                      设置昵称
                    </label>
                    <input
                      id="nickname-input"
                      autoFocus
                      type="text"
                      value={nicknameDraft}
                      maxLength={NICKNAME_MAX_LEN * 2}
                      placeholder="例如：小明"
                      onChange={(e) => setNicknameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void saveNickname(nicknameDraft);
                        if (e.key === 'Escape') setEditingNickname(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      {Array.from(normalizeNickname(nicknameDraft)).length}/{NICKNAME_MAX_LEN} 字 · 留空则恢复显示账号
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        disabled={savingNickname}
                        onClick={() => void saveNickname(nicknameDraft)}
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                      >
                        {savingNickname ? '保存中…' : '保存'}
                      </button>
                      <button
                        disabled={savingNickname}
                        onClick={() => setEditingNickname(false)}
                        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm transition-colors"
                      >
                        取消
                      </button>
                    </div>
                    {Boolean(user.nickname) && (
                      <button
                        disabled={savingNickname}
                        onClick={() => void saveNickname('')}
                        className="w-full mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        恢复默认（显示账号）
                      </button>
                    )}
                    {profileHint && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">{profileHint}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={openNicknameEditor}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ✏️ 修改昵称
                    </button>
                    {profileHint && (
                      <p className="px-4 pb-2 text-xs text-blue-600 dark:text-blue-400">{profileHint}</p>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
                    >
                      🚪 退出登录
                    </button>
                  </>
                )}
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
