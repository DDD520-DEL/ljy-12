import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  Shield,
  Scale,
  History,
  Bell,
  Sparkles,
  PieChart,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/reports', label: '关系报表', icon: PieChart },
  { path: '/assets', label: '数字资产', icon: FolderKanban },
  { path: '/vault', label: '密码保险箱', icon: KeyRound },
  { path: '/heirs', label: '继承人管理', icon: Users },
  { path: '/will', label: '数字遗嘱', icon: FileText },
  { path: '/simulation', label: '沙箱模拟', icon: Sparkles },
  { path: '/mfa', label: '身份验证', icon: Shield },
  { path: '/witnesses', label: '见证授权', icon: Scale },
  { path: '/audit', label: '审计日志', icon: History },
];

export default function Sidebar() {
  const unreadCount = useAppStore((state) =>
    state.notifications.filter((n) => !n.read).length
  );

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">数字遗产</h1>
            <p className="text-xs text-slate-400">托管平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.path === '/audit' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">安全提示</span>
          </div>
          <p className="text-xs text-slate-400">
            请定期登录以保持账号活跃，避免遗嘱被误触发。
          </p>
        </div>
      </div>
    </aside>
  );
}
