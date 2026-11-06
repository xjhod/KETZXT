import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import VocabularyPage from './pages/VocabularyPage';
import GrammarPage from './pages/GrammarPage';
import GrammarDailyPage from './pages/GrammarDailyPage';
import ReadingPage from './pages/ReadingPage';
import ListeningPage from './pages/ListeningPage';
import SpeakingPage from './pages/SpeakingPage';
import WrongPage from './pages/WrongPage';
import StatisticsPage from './pages/StatisticsPage';
import LoginPage from './pages/LoginPage';
import StudyPlanPage from './pages/StudyPlanPage';
import PlanTodayPage from './pages/PlanTodayPage';
import { getCurrentUser } from './utils/auth';
import { restoreCloudSession } from './utils/cloudAuth';
import { useState, useEffect, type ReactElement } from 'react';

// ========== 认证保护组件 ==========
function RequireAuth({ children }: { children: ReactElement }) {
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null; // 或者返回 loading
  }

  return children;
}

// ========== 公共路由组件（登录/注册页面，已登录则跳转首页） ==========
function PublicRoute({ children }: { children: ReactElement }) {
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return children;
}

// ========== 主应用组件 ==========
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ket-theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  // 启动恢复云端会话（含邮箱魔法链接回调）未完成前，不渲染路由，
  // 避免被路由守卫误弹回登录页、或魔法链接落地后无法建会话。
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await restoreCloudSession();
      } catch {
        /* 恢复失败不影响渲染未登录态 */
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ket-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  if (!authReady) {
    return null;
  }

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* 侧边栏 - 桌面端始终显示，移动端 overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isDark={isDark} />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          <Routes>
            {/* 公开路由（未登录可访问） */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

            {/* 受保护路由（需要登录） */}
            <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
            <Route path="/vocabulary" element={<RequireAuth><VocabularyPage /></RequireAuth>} />
            <Route path="/grammar" element={<RequireAuth><GrammarPage /></RequireAuth>} />
            <Route path="/grammar-daily" element={<RequireAuth><GrammarDailyPage /></RequireAuth>} />
            <Route path="/reading" element={<RequireAuth><ReadingPage /></RequireAuth>} />
            <Route path="/listening" element={<RequireAuth><ListeningPage /></RequireAuth>} />
            <Route path="/speaking" element={<RequireAuth><SpeakingPage /></RequireAuth>} />
            <Route path="/plan-today" element={<RequireAuth><PlanTodayPage /></RequireAuth>} />
            <Route path="/study-plan" element={<RequireAuth><StudyPlanPage /></RequireAuth>} />
            <Route path="/wrong" element={<RequireAuth><WrongPage /></RequireAuth>} />
            <Route path="/statistics" element={<RequireAuth><StatisticsPage /></RequireAuth>} />

            {/* 404 重定向 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ========== 应用入口（包含 HashRouter，兼容 APK/Capacitor 文件协议）==========
function App() {
  return (
    <HashRouter>
        <AppContent />
    </HashRouter>
  );
}

export default App;
