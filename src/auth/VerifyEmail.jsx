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
    <div className="min-h-screen w-full flex items-center justify-center bg-page-gradient p-4 font-sans">
      
      {/* Outer Card Container */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden w-[90vw] max-w-6xl min-h-[82vh] grid grid-cols-1 md:grid-cols-2 border border-white/60">
        
        {/* LEFT SECTION: Visual Stage */}
        <div className="bg-surface-blue p-8 hidden md:flex md:flex-col md:justify-between md:items-center text-center border-r border-ink-100 relative overflow-hidden">
          
          {/* Ambient Light Orbs */}
          <div className="absolute top-12 left-10 w-52 h-52 bg-brand-sky/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-12 right-10 w-64 h-64 bg-brand-indigo/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="w-full flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-sm shadow-md">
                ✦
              </div>
              <span className="font-serif font-bold text-ink-900 text-lg tracking-tight">
                life<span className="text-brand-indigo">OS</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-ink-200/80 text-[11px] font-semibold text-ink-700 shadow-sm backdrop-blur-sm">
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-brand-sky-light animate-ping' : error ? 'bg-danger-text' : 'bg-success-text'}`} />
              {loading ? 'Validating Token' : error ? 'Validation Failed' : 'Verified'}
            </span>
          </div>

          {/* Central Animated Graphic */}
          <div className="w-full my-auto flex flex-col items-center justify-center relative z-10 py-6">
            <div className="relative w-72 h-72 flex items-center justify-center">
              
              {/* Outer Orbit Line */}
              <div className="absolute inset-0 rounded-full border border-dashed border-brand-indigo/30 animate-[spin_35s_linear_infinite]" />
              
              {/* Inner Glowing Ring */}
              <div className="absolute inset-8 rounded-full border border-surface-blue-border bg-gradient-to-tr from-brand-sky/10 to-brand-indigo/10" />

              {/* Central Dynamic Shield */}
              <div className="w-28 h-28 bg-brand-gradient rounded-3xl shadow-xl flex flex-col items-center justify-center text-white transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                {loading ? (
                  <svg className="w-10 h-10 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : error ? (
                  <svg className="w-10 h-10 drop-shadow-md mb-1 text-danger-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 drop-shadow-md mb-1 text-success-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className="text-[10px] font-bold tracking-wider uppercase opacity-90">
                  {loading ? 'Checking' : error ? 'Error' : 'Activated'}
                </span>
              </div>

              {/* Floating Badge 1 */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md border border-ink-200/80 shadow-md px-3.5 py-2 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:4s]">
                <span className="w-6 h-6 rounded-lg bg-success-bg text-success-text flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-ink-400 font-medium leading-none">Token Validation</p>
                  <p className="text-xs font-semibold text-ink-700 mt-0.5">Automated Link</p>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md border border-ink-200/80 shadow-md px-3.5 py-2 rounded-xl flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-surface-blue border border-surface-blue-border text-brand-indigo flex items-center justify-center text-xs font-bold">
                  🚀
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-ink-400 font-medium leading-none">LifeOS Workspace</p>
                  <p className="text-xs font-semibold text-ink-700 mt-0.5">Ready To Access</p>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Narrative */}
          <div className="text-center w-full my-2 relative z-10">
            <h3 className="text-xl font-bold text-ink-900 leading-tight">
              Email Verification Center
            </h3>
            <p className="text-xs text-ink-500 mt-2 leading-relaxed max-w-sm mx-auto">
              Verifying your email confirms ownership and unlocks your AI modules, tasks, and system access.
            </p>
          </div>

        </div>

        {/* RIGHT SECTION: Status Pane */}
        <div className="bg-surface-pink/30 flex flex-col justify-center p-6 md:p-12 overflow-y-auto">
          <div className="max-w-md mx-auto w-full text-center">
            
            {/* Status Header Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-blue text-brand-indigo border border-surface-blue-border mb-6 shadow-sm">
              {loading ? (
                <svg className="w-8 h-8 animate-spin text-brand-indigo" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : error ? (
                <svg className="w-8 h-8 text-danger-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-success-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <h2 className="text-3xl font-serif font-bold text-ink-900">
              Email Verification
            </h2>

            {/* Dynamic Status Boxes */}
            <div className="mt-6">
              {loading && (
                <div className="bg-surface-blue border border-surface-blue-border p-4 rounded-2xl text-brand-indigo text-sm font-medium flex items-center justify-center gap-3 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-indigo animate-ping" />
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-danger-bg border border-danger-border p-4 rounded-2xl text-danger-text text-sm font-medium space-y-1 shadow-sm">
                  <p>{error}</p>
                  <p className="text-xs text-danger-text/80">
                    The verification link may have expired or was already used.
                  </p>
                </div>
              )}

              {!loading && !error && (
                <div className="bg-success-bg border border-success-border p-4 rounded-2xl text-success-text text-sm font-medium shadow-sm space-y-1">
                  <p>{message}</p>
                  <p className="text-xs text-success-text/80">Please wait while we log you in...</p>
                </div>
              )}
            </div>

            {/* Manual Verification Code Input & Actions */}
            <div className="mt-6 space-y-3">
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

              <div>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-link hover:text-brand-link-hover font-medium inline-flex items-center gap-1 transition"
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