import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import NotificationDropdown from './ui/NotificationDropdown';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  const [openDropdowns, setOpenDropdowns] = useState({
    learning: true,
    health: true, // Opened by default for Health OS visibility
    career: false,
    finance: false,
  });

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [lifeScoreData, setLifeScoreData] = useState(null);

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
    { path: '/health/diet', label: 'Diet & Nutrition' },
  ];

  const careerSubLinks = [
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

  return (
    <aside className="w-64 min-h-screen bg-white/80 backdrop-blur-md border-r border-ink-200/80 flex flex-col justify-between p-4 font-sans text-ink-700 shadow-xl select-none relative z-30">
      {/* TOP SECTION: Logo + Navigation */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-2 py-2 flex items-center justify-between border-b border-ink-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-indigo via-sky-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
              ✦
            </div>
            <div>
              <h1 className="font-serif font-bold text-ink-900 text-lg leading-none tracking-tight">
                life<span className="text-brand-indigo">OS</span>
              </h1>
              <p className="text-[10px] text-ink-400 font-medium tracking-wide mt-0.5">
                AI Life Operating System
              </p>
            </div>
          </div>

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
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="space-y-4 text-xs font-medium">
          {/* MAIN MODULES */}
          <div className="space-y-1">
            {/* Home Link */}
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'bg-gradient-to-r from-brand-indigo via-sky-500 to-sky-400 text-white shadow-md font-semibold'
                  : 'text-ink-700 hover:bg-orange-50/70 hover:text-ink-900'
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
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-ink-700 hover:bg-orange-50/70 hover:text-ink-900 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-semibold text-ink-900">HealthOS</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-ink-400 transition-transform duration-200 ${openDropdowns.health ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdowns.health && (
                <div className="ml-4 mt-1 pl-3 border-l-2 border-emerald-200 space-y-1">
                  {healthSubLinks.map((sub) => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={`block px-3 py-1.5 rounded-lg text-[11px] transition ${
                        isActive(sub.path)
                          ? 'bg-emerald-50 text-emerald-700 font-semibold'
                          : 'text-ink-500 hover:text-ink-900 hover:bg-orange-50/50'
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
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-ink-700 hover:bg-orange-50/70 hover:text-ink-900 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-brand-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-4a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>LearningOS</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-ink-400 transition-transform duration-200 ${openDropdowns.learning ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdowns.learning && (
                <div className="ml-4 mt-1 pl-3 border-l-2 border-indigo-200 space-y-1">
                  {learningSubLinks.map((sub) => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={`block px-3 py-1.5 rounded-lg text-[11px] transition ${
                        isActive(sub.path)
                          ? 'bg-indigo-50 text-brand-indigo font-semibold'
                          : 'text-ink-500 hover:text-ink-900 hover:bg-orange-50/50'
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
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-ink-700 hover:bg-orange-50/70 hover:text-ink-900 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>CareerOS</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-ink-400 transition-transform duration-200 ${openDropdowns.career ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdowns.career && (
                <div className="ml-4 mt-1 pl-3 border-l-2 border-ink-200 space-y-1">
                  {careerSubLinks.map((sub) => (
                    <Link key={sub.path} to={sub.path} className="block px-3 py-1.5 rounded-lg text-[11px] text-ink-500 hover:text-ink-900 hover:bg-orange-50/50 transition">
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* FinanceOS Dropdown */}
            <div>
              <button
                type="button"
                onClick={() => toggleDropdown('finance')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-ink-700 hover:bg-orange-50/70 hover:text-ink-900 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>FinanceOS</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-ink-400 transition-transform duration-200 ${openDropdowns.finance ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdowns.finance && (
                <div className="ml-4 mt-1 pl-3 border-l-2 border-ink-200 space-y-1">
                  {financeSubLinks.map((sub) => (
                    <Link key={sub.path} to={sub.path} className="block px-3 py-1.5 rounded-lg text-[11px] text-ink-500 hover:text-ink-900 hover:bg-orange-50/50 transition">
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PLANNING SECTION */}
          <div className="pt-2">
            <p className="px-3 text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1.5">
              Planning
            </p>
            <div className="space-y-1">
              <Link
                to="/create-todo"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  isActive('/create-todo') 
                    ? 'bg-indigo-50 text-brand-indigo font-semibold' 
                    : 'text-ink-700 hover:bg-orange-50/70 hover:text-ink-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Smart Planner</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* BOTTOM SECTION: Notifications, Profile & Logout */}
      <div className="pt-3 border-t border-ink-100 space-y-2">
        {/* Live Life Score Mini Card */}
        <Link
          to="/dashboard"
          className="block p-2.5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-sky-50/50 to-white border border-indigo-100/80 shadow-xs hover:border-indigo-300 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-ink-800 tracking-tight">Life Score</span>
            </div>
            <span className="text-xs font-extrabold text-brand-indigo font-mono">
              {lifeScoreData ? `${lifeScoreData.totalScore}/100` : '--/100'}
            </span>
          </div>
          <div className="mt-2 w-full bg-indigo-100/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-indigo via-sky-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, lifeScoreData?.totalScore || 20)}%` }}
            ></div>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-500 font-medium">
            <span>🔥 {lifeScoreData?.streak?.current || 0} Day Streak</span>
            <span className="text-brand-indigo group-hover:underline font-bold">Details ➔</span>
          </div>
        </Link>

        {/* Mount the In-Nav Notification Dropdown */}
        <NotificationDropdown />

        {/* Profile Settings */}
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
            isActive('/profile') 
              ? 'bg-indigo-50 text-brand-indigo' 
              : 'text-ink-700 hover:bg-orange-50/70 hover:text-ink-900'
          }`}
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Settings & Profile</span>
        </Link>

        {/* Logout Button */}
        <Button
          variant="danger"
          onClick={handleLogout}
          className="w-full py-2"
        >
          <div className="flex flex-row items-center justify-center gap-1.5 w-full text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </div>
        </Button>
      </div>
    </aside>
  );
}