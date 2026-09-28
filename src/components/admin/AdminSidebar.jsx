import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ArrowLeft, ShieldCheck, LogOut, X, Sparkles, Zap, Sliders, BarChart3 } from 'lucide-react';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

export default function AdminSidebar({ isMobileOpen, setIsMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    window.location.href = '/login';
  };

  const navLinks = [
    {
      path: '/admin',
      altPath: '/admin/dashboard',
      label: 'Overview & KPIs',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      path: '/admin/users',
      label: 'User Directory',
      icon: Users,
      badge: null,
    },
    {
      path: '/admin/ai-analytics',
      label: 'AI Token Economics',
      icon: Zap,
      badge: 'Cost',
    },
    {
      path: '/admin/product-metrics',
      label: 'Product Telemetry',
      icon: BarChart3,
      badge: 'Growth',
    },
    {
      path: '/admin/system',
      label: 'System Operations',
      icon: Sliders,
      badge: 'Ops',
    },
  ];

  const isActive = (link) => {
    if (link.altPath && location.pathname === link.altPath) return true;
    return location.pathname === link.path;
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full p-4 select-none justify-between overflow-hidden">
      {/* 1. Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif font-bold text-slate-900 dark:text-white text-base leading-none">
                  life<span className="text-purple-600 dark:text-purple-400">Admin</span>
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300/60 dark:border-purple-800">
                  HQ
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Universal Command Center
              </p>
            </div>
          </div>

          {setIsMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 2. Admin Navigation Links */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
            Administration
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-xs ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-500 text-white shadow-sm font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Utility & Exit to User Dashboard */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-2.5">
        {/* Return to User App Button */}
        <Link
          to="/dashboard"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold transition group border border-slate-200/60 dark:border-white/5"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Exit to User App</span>
          </div>
          <Sparkles className="w-3 h-3 text-slate-400" />
        </Link>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 text-xs font-bold transition-all flex flex-row items-center justify-center gap-1.5 cursor-pointer shadow-2xs group"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            <span className="shrink-0">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 h-full bg-white/90 dark:bg-[#0b0f19]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-white/10 flex-col justify-between font-sans text-slate-700 dark:text-slate-200 shadow-sm z-30 shrink-0 overflow-hidden transition-colors">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-[#0b0f19] shadow-2xl border-r border-slate-200 dark:border-white/10 flex flex-col z-10 overflow-hidden">
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
}
