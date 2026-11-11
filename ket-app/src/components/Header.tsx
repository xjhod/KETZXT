import { useEffect, useRef, useState } from 'react';
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
import {
  getAutoSyncState,
  subscribeAutoSync,
  flushAutoSync,
  getPeriodicSyncInfo,
  setSyncIntervalDays,
  type AutoSyncState,
  type PeriodicSyncInfo,
} from '../utils/autoSync';
import { SYNC_INTERVAL_OPTIONS, describeNextCheck, formatSyncTime } from '../utils/syncSchedule';
import { isCloudConnected, unlinkCloud, getCloudLinkedUid } from '../utils/cloudAuth';
import { inspectLocalShards, maskUid, type ShardInfo } from '../utils/localShards';
import { rehydrateAllStores } from '../store/rehydrateStores';

interface HeaderProps {
  onMenuClick: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

type HintTone = 'info' | 'ok' | 'error';

export default function Header({ onMenuClick, isDark, onToggleDark }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncHint, setSyncHint] = useState('');
  const [hintTone, setHintTone] = useState<HintTone>('info');
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 个人中心：昵称编辑态
  const [user, setUser] = useState<SafeUser | null>(() => getCurrentUser());
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [profileHint, setProfileHint] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);
  // 自动同步状态（启动 / 防抖 / 切后台 / 退出前的上传都由 autoSync 统一驱动）
  const [autoSync, setAutoSync] = useState<AutoSyncState>(() => getAutoSyncState());
  // 周期兜底：频率、上次成功时间、下次检查，都在个人中心可见
  const [periodic, setPeriodic] = useState<PeriodicSyncInfo>(() => getPeriodicSyncInfo());
  // 本机分片诊断（只读，打开时才扫描 localStorage）
  const [showShards, setShowShards] = useState(false);
  const [shards, setShards] = useState<ShardInfo[]>([]);
  const navigate = useNavigate();
  const cloudOn = isCloudConnected();
  const displayName = getDisplayName(user);

  const syncLabel = (() => {
    if (!cloudOn) return '未连接云端';
    switch (autoSync.phase) {
      case 'syncing': return '同步中…';
      case 'pending': return '待同步';
      case 'error': return `同步失败：${autoSync.lastError}`;
      case 'ok': {
        const t = autoSync.lastOkAt
          ? new Date(autoSync.lastOkAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          : '';
        return `已自动同步 ${t}`.trim();
      }
      default: return '自动同步已开启';
    }
  })();

  useEffect(() => subscribeAutoSync(setAutoSync), []);
  // 同步成功/失败都会刷新「上次成功 / 下次检查」；再每分钟刷一次倒计时
  useEffect(() => subscribeAutoSync(() => setPeriodic(getPeriodicSyncInfo())), []);
  useEffect(() => {
    const id = setInterval(() => setPeriodic(getPeriodicSyncInfo()), 60_000);
    return () => clearInterval(id);
  }, []);

  // 登录、改昵称、云端同步拉回资料都会写 localStorage，这里统一订阅刷新
  useEffect(() => {
    const refresh = () => setUser(getCurrentUser());
    window.addEventListener(USER_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(USER_CHANGED_EVENT, refresh);
  }, []);

  // 手机端唯一可见的同步反馈。多次提示必须清掉上一条的定时器，
  // 否则「正在同步…」的 3 秒定时器会把随后到达的真实结果提前抹掉。
  const showHint = (msg: string, tone: HintTone = 'info') => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    setSyncHint(msg);
    setHintTone(tone);
    hintTimerRef.current = setTimeout(() => {
      setSyncHint('');
      hintTimerRef.current = null;
    }, 4000);
  };

  useEffect(() => () => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
  }, []);

  const handleLogout = async () => {
    // 退出前把本机最新进度推上云；必须在 unlinkCloud 之前完成，
    // 否则会话一注销，这次上传就拿不到 auth.uid() 了。
    await flushAutoSync();
    await unlinkCloud(); // 再解绑云端登录态（不触发 reload）
    logout();
    setUser(null);
    setShowUserMenu(false);
    setEditingNickname(false);
    await rehydrateAllStores(); // 清空内存中上一个用户的数据（载入 guest/空）
    navigate('/login', { replace: true });
  };

  /** 手动同步：走自动同步的同一条串行队列，避免和防抖上传并发 */
  const handleSync = async () => {
    // 任何情况下点击都要有可见反馈，绝不静默 return（旧版这里直接 return，
    // 手机端提示又是 hidden sm:inline，用户看到的就是「点了没反应」）。
    if (syncing) {
      showHint('正在同步，请稍候…', 'info');
      return;
    }
    if (!cloudOn) {
      showHint('未连接云端：请在登录页用同一邮箱连接后再同步', 'error');
      return;
    }
    setSyncing(true);
    showHint('正在同步到云端…', 'info');
    try {
      const res = await flushAutoSync();
      setUser(getCurrentUser()); // 同步可能拉回了另一台设备改过的昵称
      if (res.ok) showHint('已同步到云端', 'ok');
      else if (res.timedOut) showHint(res.message, 'info'); // 后台仍在跑，不误报失败
      else showHint(res.message, 'error');
    } catch (e) {
      showHint(`同步失败：${(e as Error).message}`, 'error');
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
        const res = await flushAutoSync();
        setUser(getCurrentUser());
        setProfileHint(
          res.ok ? '昵称已保存并同步到云端' : `昵称已保存（云端暂未同步：${res.message}）`,
        );
        showHint(res.ok ? '昵称已同步' : '资料同步稍后重试', res.ok ? 'ok' : 'info');
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

  /** 改兜底频率：只写本机偏好（不同设备可以各自设），改完立刻重新评估 */
  const changeSyncInterval = (raw: string) => {
    const d = setSyncIntervalDays(Number(raw));
    setPeriodic(getPeriodicSyncInfo());
    showHint(d === 1 ? '已设为每天自动同步一次' : `已设为每 ${d} 天自动同步一次`, 'ok');
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
            aria-label="立即同步到云端"
            className={`p-2 rounded-lg transition-colors text-lg ${
              !cloudOn
                ? 'text-gray-400 dark:text-gray-500'
                : syncing
                  ? 'text-blue-400 animate-pulse'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
            }`}
            title={
              cloudOn
                ? `${syncLabel} · 点击立即同步`
                : '未连接云端，点击查看详情'
            }
          >
            ☁️
          </button>
        )}

        {/* 宽屏常驻状态；窄屏靠下方的 toast，不占顶栏宽度 */}
        {cloudOn && (
          <span
            className={`text-xs whitespace-nowrap truncate max-w-[170px] hidden sm:inline-block align-middle ${
              autoSync.phase === 'error'
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
            title={syncLabel}
          >
            {syncLabel}
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
                    {/* 周期兜底：可感知、可改频率。应用关闭时不后台运行，文案不夸大 */}
                    <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 mb-1">⏰ 自动同步</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug break-words">
                        做题后自动上传；另外
                        {SYNC_INTERVAL_OPTIONS.find((o) => o.days === periodic.intervalDays)?.label ?? '每天'}
                        自动同步一次（兜底）。应用打开时最长 30 分钟检查一次；关闭时不会后台运行，下次打开会立即同步。
                      </p>
                      <label htmlFor="sync-interval" className="block text-[10px] text-gray-500 dark:text-gray-400 mt-2 mb-1">
                        兜底频率
                      </label>
                      <select
                        id="sync-interval"
                        value={periodic.intervalDays}
                        onChange={(e) => changeSyncInterval(e.target.value)}
                        className="w-full min-w-0 max-w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        {SYNC_INTERVAL_OPTIONS.map((o) => (
                          <option key={o.days} value={o.days}>{o.label}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 break-words">
                        上次成功：{formatSyncTime(periodic.lastSyncAt)}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 break-words">
                        下次检查：{describeNextCheck(periodic.checkInMs)}
                        {periodic.failed ? ' · 上次失败，会自动重试' : ''}
                      </p>
                      <button
                        onClick={handleSync}
                        className="w-full min-w-0 mt-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs transition-colors"
                      >
                        立即同步到云端
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (!showShards) {
                          setShards(inspectLocalShards(getCurrentUser()?.id ?? null, localStorage));
                        }
                        setShowShards(!showShards);
                        setProfileHint('');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      本机数据分片（诊断）
                    </button>
                    {showShards && (
                      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 break-all">
                          账号 ID：{getCloudLinkedUid() ? maskUid(getCloudLinkedUid()!) : '未连接云端'}
                        </p>
                        <div className="mt-1.5 max-h-44 overflow-y-auto space-y-1.5">
                          {shards.length === 0 ? (
                            <p className="text-[11px] text-gray-400">本机没有找到学习数据分片</p>
                          ) : shards.map((s) => (
                            <div key={s.uid} className="rounded border border-gray-200 dark:border-gray-600 p-2">
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="font-mono text-[11px] text-gray-700 dark:text-gray-200 break-all min-w-0">
                                  {maskUid(s.uid)}
                                </span>
                                {s.isCurrent && (
                                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                    当前
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 break-words leading-snug">
                                答题 {s.answerRecords} · 会话 {s.sessionRecords} · 词汇 {s.vocabWords} · 语法点 {s.grammarPoints} · 计划 {s.planLogs} · 造句 {s.sentences}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {(s.bytes / 1024).toFixed(1)} KB · {s.storeKeys.length} 个分片
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 leading-snug">
                          只读诊断，不合并、不删除。两台设备账号 ID 一致才会同步到同一份数据。
                        </p>
                      </div>
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

      {/* 同步结果 toast：手机端唯一可见的反馈。绝对定位不占顶栏宽度，
          max-w-[75vw] + right-3 保证 320px 窄屏也不会横向溢出。 */}
      {syncHint && (
        <div
          role="status"
          aria-live="polite"
          className={`absolute right-3 top-full mt-1.5 z-[60] max-w-[75vw] sm:max-w-[280px] min-w-0 break-words rounded-lg border px-3 py-2 text-xs leading-snug shadow-lg ${
            hintTone === 'error'
              ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
              : hintTone === 'ok'
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                : 'border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300'
          }`}
        >
          {syncHint}
        </div>
      )}
    </header>
  );
}
