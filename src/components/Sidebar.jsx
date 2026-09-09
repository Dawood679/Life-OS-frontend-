import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Button from '../components/ui/Button';
import NotificationDropdown from './ui/NotificationDropdown';
import SidebarFeatureTooltip from './ui/SidebarFeatureTooltip';
import { SIDEBAR_FEATURE_DATA } from '../data/sidebarFeatureData';
import { X, Flame, LogOut, Settings } from 'lucide-react';

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const hoverTimeoutRef = useRef(null);

  // All OS sub-modules open by default for immediate 1-click access
  const [openDropdowns, setOpenDropdowns] = useState({
    learning: true,
    health: true,
    career: true,
    finance: true,
  });

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [lifeScoreData, setLifeScoreData] = useState(null);

  const handleLinkMouseEnter = (path, e) => {
    const data = SIDEBAR_FEATURE_DATA[path];
    if (!data) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredFeature({
        data,
        pos: {
          top: rect.top,
          left: rect.right + 12,
        },
      });
    }, 120);
  };

  const handleLinkMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredFeature(null);
  };

  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
    fetch(`${BACKEND_URL}/auth/me`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setRole(data.user.role);
      })
      .catch(() => navigate('/login'));

    // Fetch Today's Life Score & Streak
    fetch(`${BACKEND_URL}/life-score/today`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setLifeScoreData(data.data);
        }
      })
      .catch(() => {});
  }, [navigate]);

  // Close mobile sidebar and clear tooltip whenever location changes
  useEffect(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredFeature(null);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, setIsMobileOpen]);

  const learningSubLinks = [
    { path: '/learning/roadmap', label: 'Roadmap Generator' },
    { path: '/learning/study-plan', label: 'Study Planner' },
    { path: '/learning/quiz', label: 'Quiz Center' },
    { path: '/learning/chat', label: 'AI Study Chat' },
    { path: '/learning/work-review', label: 'Work & Asset Analyzer' },
    { path: '/learning/notes-summarizer', label: 'Notes Summarizer' },
    { path: '/todos', label: 'Todo List' },
  ];

  const healthSubLinks = [
    { path: '/health/wellness', label: 'Wellness Tracker' },
    { path: '/health/prescriptions', label: 'Prescription Scanner' },
    { path: '/health/medicines', label: 'Medicine & Reminders' },
    { path: '/health/history', label: 'Medical History' },
  ];

  const careerSubLinks = [
    { path: '/career/applications', label: 'Application Tracker' },
    { path: '/career/mock-interview', label: 'AI Mock Interview' },
    { path: '/learning/job-match', label: 'Job Matcher' },
    { path: '/career/resume', label: 'Profile & Pitch Analyzer' },
    { path: '/learning/action-plan', label: 'Action Plan Generator' },
  ];

  const financeSubLinks = [
    { path: '/finance/analytics', label: 'Financial Overview' },
    { path: '/finance/budget', label: 'Budget Tracker' },
  ];

  const handleLogout = async () => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Sidebar Inner Content Component (Pinned Header & Footer with Independent Scrollable Nav)
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full p-3.5 select-none overflow-hidden">
      {/* 1. TOP BRAND HEADER (Always pinned at top, shrink-0) */}
      <div className="shrink-0 px-1 py-1.5 flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-indigo via-sky-500 to-sky-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
            ✦
          </div>
          <div>
            <h1 className="font-serif font-bold text-slate-900 text-base leading-none tracking-tight">
              life<span className="text-brand-indigo">OS</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5">
              AI Life Operating System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {role && (
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                role === 'admin'
                  ? 'bg-purple-50 text-purple-600 border-purple-200'
                  : 'bg-indigo-50 text-brand-indigo border-indigo-200'
              }`}
            >
              {role}
            </span>
          )}

          {/* Close Button on Mobile Drawer */}
          {setIsMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. MIDDLE NAVIGATION (Takes flex-1, scrolls smoothly with 0 overflow cutoff) */}
      <nav className="flex-1 min-h-0 overflow-y-auto pr-1 py-3 space-y-2 text-xs font-medium custom-scrollbar">
        {/* Home Link */}
        <Link
          to="/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 ${
            isActive('/dashboard')
              ? 'bg-gradient-to-r from-brand-indigo via-sky-500 to-sky-400 text-white shadow-xs font-semibold'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Home</span>
        </Link>

        {/* HealthOS Dropdown */}
        <div>
          <button
            type="button"
            onClick={() => toggleDropdown('health')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-semibold text-slate-900">HealthOS</span>
            </div>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openDropdowns.health ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openDropdowns.health && (
            <div className="ml-3 mt-1 pl-2.5 border-l-2 border-emerald-200 space-y-0.5">
              {healthSubLinks.map((sub) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  onMouseEnter={(e) => handleLinkMouseEnter(sub.path, e)}
                  onMouseLeave={handleLinkMouseLeave}
                  className={`block px-2.5 py-1.5 rounded-lg text-[11px] transition ${
                    isActive(sub.path)
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* LearningOS Dropdown */}
        <div>
          <button
            type="button"
            onClick={() => toggleDropdown('learning')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-brand-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-4a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>LearningOS</span>
            </div>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openDropdowns.learning ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openDropdowns.learning && (
            <div className="ml-3 mt-1 pl-2.5 border-l-2 border-indigo-200 space-y-0.5">
              {learningSubLinks.map((sub) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  onMouseEnter={(e) => handleLinkMouseEnter(sub.path, e)}
                  onMouseLeave={handleLinkMouseLeave}
                  className={`block px-2.5 py-1.5 rounded-lg text-[11px] transition ${
                    isActive(sub.path)
                      ? 'bg-indigo-50 text-brand-indigo font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CareerOS Dropdown */}
        <div>
          <button
            type="button"
            onClick={() => toggleDropdown('career')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>CareerOS</span>
            </div>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openDropdowns.career ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openDropdowns.career && (
            <div className="ml-3 mt-1 pl-2.5 border-l-2 border-sky-200 space-y-0.5">
              {careerSubLinks.map((sub) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  onMouseEnter={(e) => handleLinkMouseEnter(sub.path, e)}
                  onMouseLeave={handleLinkMouseLeave}
                  className={`block px-2.5 py-1.5 rounded-lg text-[11px] transition ${
                    isActive(sub.path)
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Finance Dropdown */}
        <div>
          <button
            type="button"
            onClick={() => toggleDropdown('finance')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Finance</span>
            </div>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openDropdowns.finance ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openDropdowns.finance && (
            <div className="ml-3 mt-1 pl-2.5 border-l-2 border-emerald-200 space-y-0.5">
              {financeSubLinks.map((sub) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  onMouseEnter={(e) => handleLinkMouseEnter(sub.path, e)}
                  onMouseLeave={handleLinkMouseLeave}
                  className={`block px-2.5 py-1.5 rounded-lg text-[11px] transition ${
                    isActive(sub.path)
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* 3. BOTTOM PINNED FOOTER (Always 100% visible on laptop screens, shrink-0) */}
      <div className="shrink-0 pt-2.5 border-t border-slate-200/80 space-y-1.5 bg-white/40">
        {/* Compact Live Life Score Mini Strip */}
        <Link
          to="/dashboard"
          className="block p-2 rounded-xl bg-gradient-to-br from-indigo-50/90 via-sky-50/50 to-white border border-indigo-100/80 shadow-2xs hover:border-indigo-300 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-800 tracking-tight">Life Score</span>
            </div>
            <span className="text-xs font-black text-brand-indigo font-mono">
              {lifeScoreData ? `${lifeScoreData.totalScore}/100` : '--/100'}
            </span>
          </div>
          <div className="mt-1.5 w-full bg-indigo-100/60 rounded-full h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-indigo via-sky-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, lifeScoreData?.totalScore || 20)}%` }}
            ></div>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              {lifeScoreData?.streak?.current || 0}d Streak
            </span>
            <span className="text-brand-indigo group-hover:underline font-bold">View ➔</span>
          </div>
        </Link>

        {/* Notifications & Profile Compact Row */}
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <NotificationDropdown />
          </div>

          <Link
            to="/profile"
            className={`p-2 rounded-xl border border-slate-200/80 transition flex items-center justify-center ${
              isActive('/profile') 
                ? 'bg-indigo-50 text-brand-indigo border-indigo-200' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white'
            }`}
            title="Settings & Profile"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        {/* Logout Button (Pinned firmly at bottom) */}
        <Button
          variant="danger"
          onClick={handleLogout}
          className="w-full py-1.5 text-xs font-bold shadow-2xs rounded-xl flex items-center justify-center gap-1.5"
        >
          <div className='flex gap-2'>
          <LogOut className="w-3.5 h-3.5" />
          <div>Logout</div>
          </div>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP DOCKED SIDEBAR (Visible on lg >= 1024px, fixed viewport height h-screen) */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 bg-white/85 backdrop-blur-md border-r border-slate-200/80 flex-col justify-between font-sans text-slate-700 shadow-sm z-30 shrink-0 overflow-hidden">
        {renderSidebarContent()}
      </aside>

      {/* Floating Feature Hover Tooltip (Rendered outside overflow containers) */}
      {hoveredFeature && (
        <SidebarFeatureTooltip
          feature={hoveredFeature.data}
          position={hoveredFeature.pos}
        />
      )}

      {/* 2. MOBILE & TABLET SLIDE-OVER DRAWER (< 1024px) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn cursor-pointer"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl border-r border-slate-200 flex flex-col z-10 animate-slideRight overflow-hidden">
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
}