import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationDropdown from './ui/NotificationDropdown';
import ThemeToggle from './ui/ThemeToggle';
import GlobalCopilot from './GlobalCopilot';
import { Menu, Sparkles } from 'lucide-react';

export default function Layout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-100 antialiased font-sans transition-colors duration-200">
      {/* MOBILE TOP NAVIGATION BAR (Visible only on < 1024px) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 py-2.5 flex items-center justify-between shadow-2xs transition-colors duration-200">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5 text-slate-800 dark:text-slate-200" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-indigo via-sky-500 to-sky-400 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              ✦
            </div>
            <span className="font-serif font-bold text-slate-900 dark:text-white text-base leading-none">
              life<span className="text-brand-indigo">OS</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationDropdown compact={true} />

          <Link
            to="/dashboard"
            className="px-2.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Chief of Staff</span>
          </Link>
        </div>
      </header>

      {/* DOCKED SIDEBAR & MOBILE DRAWER */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* MAIN VIEW AREA (Auto-scaled for mobile, tablet, and desktop) */}
      <main className="flex-1 w-full max-w-full min-w-0 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>

      {/* OMNIPRESENT GLOBAL AI COPILOT & VOICE ASSISTANT */}
      <GlobalCopilot />
    </div>
  );
}