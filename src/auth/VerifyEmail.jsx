import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Verifying your email token...');
  const [error, setError] = useState('');
  const [manualToken, setManualToken] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Verification token missing or invalid.');
      setLoading(false);
      return;
    }

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    fetch(`${BACKEND_URL}/auth/verify-email/${token}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(data.message || 'Verification failed. The link may have expired.');
        }
      })
      .catch(() => {
        setLoading(false);
        setError('Unable to connect to server. Please check your connection.');
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-[#07090e] bg-page-gradient p-4 relative overflow-hidden font-sans">
      {/* Ambient Light Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/15 dark:bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Outer Card Container */}
      <div className="relative z-10 w-full max-w-5xl min-h-[600px] bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT SECTION: Visual Stage */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50/50 to-sky-50/70 dark:from-indigo-950/40 dark:via-[#0c1222]/60 dark:to-sky-950/40 p-8 hidden md:flex md:flex-col md:justify-between border-r border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden">
          
          {/* Top Brand Header */}
          <div className="w-full flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                ✦
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                life<span className="text-indigo-600 dark:text-indigo-400">OS</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-sm">
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-sky-500 animate-ping' : error ? 'bg-red-500' : 'bg-emerald-500'}`} />
              {loading ? 'Validating Token' : error ? 'Validation Failed' : 'Verified'}
            </span>
          </div>

          {/* Central Animated Graphic */}
          <div className="w-full my-auto flex flex-col items-center justify-center relative z-10 py-6">
            <div className="relative w-64 h-64 flex items-center justify-center">
              
              {/* Outer Orbit Line */}
              <div className="absolute inset-0 rounded-full border border-dashed border-indigo-400/30 dark:border-indigo-500/30 animate-[spin_35s_linear_infinite]" />
              
              {/* Inner Glowing Ring */}
              <div className="absolute inset-6 rounded-full border border-sky-400/30 dark:border-sky-500/20 bg-gradient-to-tr from-sky-500/10 to-indigo-500/10" />

              {/* Central Dynamic Shield */}
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-sky-500 rounded-3xl shadow-xl shadow-indigo-500/25 flex flex-col items-center justify-center text-white transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                {loading ? (
                  <svg className="w-9 h-9 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : error ? (
                  <svg className="w-9 h-9 drop-shadow-md mb-1 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-9 h-9 drop-shadow-md mb-1 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className="text-[10px] font-bold tracking-wider uppercase opacity-90">
                  {loading ? 'Checking' : error ? 'Error' : 'Activated'}
                </span>
              </div>

              {/* Floating Badge 1 */}
              <div className="absolute top-1 left-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:4s]">
                <span className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-none">Token Validation</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">Automated Link</p>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute bottom-1 right-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                  🚀
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-none">LifeOS Hub</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">Ready To Access</p>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Narrative */}
          <div className="text-center w-full my-2 relative z-10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Email Verification Center
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Verifying your email confirms ownership and unlocks your AI modules, tasks, and system access.
            </p>
          </div>

        </div>

        {/* RIGHT SECTION: Status Pane */}
        <div className="flex flex-col justify-center p-6 md:p-10 overflow-y-auto">
          <div className="max-w-md mx-auto w-full text-center">
            
            {/* Status Header Icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-5 shadow-sm">
              {loading ? (
                <svg className="w-7 h-7 animate-spin text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : error ? (
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Email Verification
            </h2>

            {/* Dynamic Status Boxes */}
            <div className="mt-5">
              {loading && (
                <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 p-4 rounded-2xl text-indigo-600 dark:text-indigo-300 text-xs font-medium flex items-center justify-center gap-3 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-red-600 dark:text-red-400 text-xs font-medium space-y-1 shadow-sm">
                  <p>{error}</p>
                  <p className="text-[11px] text-red-500/80">
                    The verification link may have expired or was already used.
                  </p>
                </div>
              )}

              {!loading && !error && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-medium shadow-sm space-y-1">
                  <p>{message}</p>
                  <p className="text-[11px] text-emerald-600/80">Please wait while we log you in...</p>
                </div>
              )}
            </div>

            {/* Manual Verification Code Input & Actions */}
            <div className="mt-5 space-y-3.5">
              <Input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Enter verification token manually"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
                  </svg>
                }
              />

              <Button
                type="button"
                onClick={() => navigate(manualToken ? `/verify-email/${manualToken}` : '/login')}
                className="w-full"
                rightIcon={
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              >
                {manualToken ? 'Verify Token' : 'Go to Login Screen'}
              </Button>

              <div className="pt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  Need a new verification link?
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}