import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Shield, FileText, LogOut,
  ChevronRight, Bell, User
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/policy',    icon: Shield,           label: 'My Policy'  },
  { to: '/claims',    icon: FileText,          label: 'Claims'     },
];

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Admin Panel' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = user?.role === 'admin' ? adminNavItems : navItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const platformColors = {
    Zomato: 'text-red-400', Swiggy: 'text-orange-400',
    Blinkit: 'text-yellow-400', Zepto: 'text-purple-400', Other: 'text-gray-400'
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 border-r border-dark-600 flex flex-col fixed h-full z-30">
        {/* Logo */}
        <div className="p-6 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-lg leading-tight">SurakshaPay</span>
              <div className="text-[10px] text-gray-500 font-mono">AI Insurance</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-dark-600">
          <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
            <div className="w-9 h-9 bg-brand-500/20 border border-brand-500/30 rounded-lg flex items-center justify-center">
              <User size={16} className="text-brand-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className={`text-xs font-medium ${platformColors[user?.platform] || 'text-gray-400'}`}>
                {user?.platform}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-600">
          <div className="p-3 bg-dark-700 rounded-xl mb-3 text-center">
            <p className="text-xs text-gray-500">Daily Earnings Target</p>
            <p className="text-lg font-display font-bold text-brand-400">
              ₹{user?.avgDailyIncome?.toLocaleString('en-IN') || '--'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-dark-600 bg-dark-800/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-8">
          <div />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Parametric system live</span>
            </div>
            <button className="w-9 h-9 bg-dark-700 border border-dark-500 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Bell size={16} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 border border-dark-500 rounded-xl">
              <div className="w-6 h-6 bg-brand-500/20 rounded-md flex items-center justify-center">
                <span className="text-brand-400 text-xs font-bold">{user?.name?.[0]}</span>
              </div>
              <span className="text-sm text-gray-300">{user?.city}</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
