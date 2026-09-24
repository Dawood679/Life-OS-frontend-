import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import ThemeToggle from '../ui/ThemeToggle';
import { Menu, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children, title, subtitle }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden w-full max-w-full bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-100 antialiased font-sans transition-colors duration-200">
      {/* Mobile Top Nav */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 py-3 flex items-center justify-between shadow-2xs w-full max-w-full">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-slate-900 dark:text-white text-base">
              life<span className="text-purple-600 dark:text-purple-400">Admin</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/dashboard"
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-white/10"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">User App</span>
          </Link>
        </div>
      </header>

      {/* Docked Admin Sidebar */}
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Admin View Container */}
      <main className="flex-1 w-full max-w-full min-w-0 p-3 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
        {(title || subtitle) && (
          <div className="mb-4 sm:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80 px-3 py-1.5 rounded-full w-fit shrink-0 self-start md:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Admin Authorization Active
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
