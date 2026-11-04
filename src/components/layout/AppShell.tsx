import { NavLink, Outlet } from 'react-router-dom';
import { Home, BarChart2, Bell, User } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavItem {
  to: string;
  icon: typeof Home;
  label: string;
  badge?: number;
}

export function AppShell({ notifCount = 0 }: { notifCount?: number }) {
  const navItems: NavItem[] = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/history', icon: BarChart2, label: 'History' },
    { to: '/notifications', icon: Bell, label: 'Alerts', badge: notifCount },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FC] dark:bg-[#0F1117]">
      {/* Top brand bar */}
      <div className="px-5 pt-4 pb-2 safe-top">
        <BrandLogo size="sm" />
      </div>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="border-t border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#0F1117] safe-bottom">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all ${
                  isActive
                    ? 'text-[#4F7A00] dark:text-[#B5E82C]'
                    : 'text-[#9CA3AF] dark:text-[#4A5568]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-6 h-6 transition-all ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 1.75} />
                    {!!badge && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6B6B] text-white text-[10px] font-bold flex items-center justify-center">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
