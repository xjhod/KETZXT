import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

interface MenuItem {
  to: string;
  label: string;
  icon: string;
  locked?: boolean;
}

const menuItems: MenuItem[] = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/vocabulary', label: '词汇学习', icon: '📚' },
  { to: '/grammar', label: '语法学习', icon: '📝' },
  { to: '/grammar-daily', label: '每日语法', icon: '📆' },
  { to: '/reading', label: '阅读理解', icon: '📖' },
  { to: '/listening', label: '听力训练', icon: '🎧' },
  { to: '/speaking', label: '口语练习', icon: '🎤' },
  { to: '/statistics', label: '学习统计', icon: '📊' },
  { to: '/wrong', label: '错题本', icon: '📕' },
];

export default function Sidebar({ isOpen, onClose, isDark }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 移动端 overlay 点击背景关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'sidebar-overlay') {
      onClose();
    }
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transition-colors duration-200`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <span className="text-2xl">🎓</span>
        <div>
          <h1 className={`text-base font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} leading-tight transition-colors`}>KET 智学通</h1>
          <p className="text-xs text-gray-400">KET 备考助手</p>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.locked ? '#' : item.to}
            onClick={item.locked ? (e) => e.preventDefault() : onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                item.locked
                  ? 'text-gray-300 cursor-not-allowed'
                  : isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
              }`
            }
          >
            <span className="text-lg w-7 text-center">{item.icon}</span>
            <span>{item.label}</span>
            {item.locked && (
              <span className="ml-auto text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">P2</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 底部信息 */}
      <div className={`px-5 py-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <p className="text-xs text-gray-400">Phase 1+</p>
        <p className="text-xs text-gray-300 mt-0.5">词汇 + 语法 + 阅读 + 听力</p>
      </div>
    </div>
  );

  // 移动端：overlay + 滑出侧栏
  if (isMobile) {
    return isOpen ? (
      <div
        id="sidebar-overlay"
        className="fixed inset-0 z-50 bg-black/40 lg:hidden"
        onClick={handleOverlayClick}
      >
        <div className="w-64 h-full">{sidebarContent}</div>
      </div>
    ) : null;
  }

  // 桌面端：固定侧栏
  return (
    <aside className="hidden lg:flex w-64 h-screen fixed left-0 top-0 z-40">
      {sidebarContent}
    </aside>
  );
}
