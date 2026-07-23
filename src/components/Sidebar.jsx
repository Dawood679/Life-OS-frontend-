import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  // Dropdown visibility state
  const [openDropdowns, setOpenDropdowns] = useState({
    learning: true, // Default open to showcase backend routes
    health: false,
    career: false,
    finance: false,
  });

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    fetch(`${BACKEND_URL}/auth/me`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setRole(data.user.role);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  // LearningOS Sub-routes
  const learningSubLinks = [
    { path: '/learning/roadmap', label: 'Roadmap Generator' },
    { path: '/learning/study-plan', label: 'Study Planner' },
    { path: '/learning/quiz', label: 'Quiz Center' },
    { path: '/learning/chat', label: 'AI Study Chat' },
    { path: '/learning/code-review', label: 'Code Reviewer' },
    { path: '/learning/project-generator', label: 'Project Generator' },
    { path: '/learning/notes-summarizer', label: 'Notes Summarizer' },
  ];

  // Placeholder sub-routes
  const healthSubLinks = [
    { path: '/health/overview', label: 'Health Tracker' },
    { path: '/health/diet', label: 'Diet & Nutrition' },
  ];

  const careerSubLinks = [
    { path: '/career/job-match', label: 'Job Matcher' },
    { path: '/career/resume', label: 'Resume Optimizer' },
  ];

  const financeSubLinks = [
    { path: '/finance/analytics', label: 'Financial Overview' },
    { path: '/finance/budget', label: 'Budget Tracker' },
  ];

  const handleLogout = async () => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 min-h-screen bg-white/80 backdrop-blur-md border-r border-ink-200/80 flex flex-col justify-between p-4 font-sans text-ink-700 shadow-xl select-none">
      
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

            {/* LearningOS Dropdown */}
            <div>
              <button
                type="button"
                onClick={() => toggleDropdown('learning')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-ink-700 hover:bg-orange-50/70 hover:text-ink-900 transition"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-brand-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-4a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-semibold text-ink-900">LearningOS</span>
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

            {/* HealthOS Dropdown */}
            <div>
              <button
                type="button"
                onClick={() => toggleDropdown('health')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-ink-700 hover:bg-orange-50/70 hover:text-ink-900 transition"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>HealthOS</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-ink-400 transition-transform duration-200 ${openDropdowns.health ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdowns.health && (
                <div className="ml-4 mt-1 pl-3 border-l-2 border-ink-200 space-y-1">
                  {healthSubLinks.map((sub) => (
                    <Link key={sub.path} to={sub.path} className="block px-3 py-1.5 rounded-lg text-[11px] text-ink-500 hover:text-ink-900 hover:bg-orange-50/50 transition">
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
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-ink-700 hover:bg-orange-50/70 hover:text-ink-900 transition"
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
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-ink-700 hover:bg-orange-50/70 hover:text-ink-900 transition"
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

              <Link
                to="/vault"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  isActive('/vault') 
                    ? 'bg-indigo-50 text-brand-indigo font-semibold' 
                    : 'text-ink-700 hover:bg-orange-50/70 hover:text-ink-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Digital Vault</span>
              </Link>
            </div>
          </div>

          {/* TOOLS SECTION */}
          <div className="pt-2">
            <p className="px-3 text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1.5">
              Tools
            </p>
            <div className="space-y-1">
              <Link
                to="/learning/chat"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-ink-700 hover:bg-orange-50/70 hover:text-ink-900 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>AI Assistant</span>
              </Link>

              <Link
                to="/tools/suite"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-ink-700 hover:bg-orange-50/70 hover:text-ink-900 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>AI Suite</span>
              </Link>
            </div>
          </div>

          {/* PROFILE / ADMIN SECTION */}
          <div className="pt-2">
            <p className="px-3 text-[10px] font-bold text-ink-400 tracking-wider uppercase mb-1.5">
              Profile
            </p>
            <div className="space-y-1">
              {role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                    isActive('/admin/dashboard') 
                      ? 'bg-purple-50 text-purple-700 font-semibold' 
                      : 'text-ink-700 hover:bg-orange-50/70 hover:text-ink-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Admin Panel</span>
                </Link>
              )}

              <Link
                to="/profile"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  isActive('/profile') 
                    ? 'bg-indigo-50 text-brand-indigo font-semibold' 
                    : 'text-ink-700 hover:bg-orange-50/70 hover:text-ink-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Settings & Profile</span>
              </Link>
            </div>
          </div>

        </nav>
      </div>

      {/* BOTTOM SECTION: Logout Button */}
      <div className="pt-4 border-t border-ink-100">
        <Button
          variant="danger"
          onClick={handleLogout}
          className="w-full justify-center py-2 text-xs"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Button>
      </div>

    </aside>
  );
}