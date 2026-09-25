import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) { 
      setError('Please enter your email address'); 
      return; 
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { 
      setError('Please enter a valid email address'); 
      return; 
    }

    setLoading(true);

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) { 
        setError(data.message || 'Something went wrong. Please try again.'); 
        return; 
      }

      setSuccess('OTP sent to your email address!');
      
      setTimeout(() => {
        navigate('/verify-otp', {
          state: {
            email: data.email || email,
            type: 'forgotPassword'
          }
        });
      }, 600);

    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-[#07090e] bg-page-gradient p-4 relative overflow-hidden font-sans">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/15 dark:bg-sky-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl min-h-[600px] bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT SECTION: Visual Narrative */}
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
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
              Account Recovery
            </span>
          </div>

          {/* Central Visual Concept: Key & Passcode Shield */}
          <div className="w-full my-auto flex flex-col items-center justify-center relative z-10 py-6">
            <div className="relative w-64 h-64 flex items-center justify-center">
              
              {/* Outer Pulsing Orbit */}
              <div className="absolute inset-0 rounded-full border border-dashed border-indigo-400/30 dark:border-indigo-500/30 animate-[spin_45s_linear_infinite]"></div>
              
              {/* Inner Glowing Ring */}
              <div className="absolute inset-6 rounded-full border border-sky-400/30 dark:border-sky-500/20 bg-gradient-to-tr from-sky-500/10 to-indigo-500/10"></div>

              {/* Central Key/Shield Card */}
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-sky-500 rounded-3xl shadow-xl shadow-indigo-500/25 flex flex-col items-center justify-center text-white transform rotate-3 transition-transform hover:rotate-0 duration-300">
                <svg className="w-9 h-9 drop-shadow-md mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
                </svg>
                <span className="text-[10px] font-bold tracking-wider uppercase opacity-90">Reset Key</span>
              </div>

              {/* Orbiting Badge 1: Verification Email */}
              <div className="absolute top-1 right-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:3.5s]">
                <span className="w-5 h-5 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs">
                  ✉
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-none">OTP Dispatch</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">Instant Email</p>
                </div>
              </div>

              {/* Orbiting Badge 2: Protection */}
              <div className="absolute bottom-1 left-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                  🛡️
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-none">Protection</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">Secure AI Vault</p>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Narrative Banner */}
          <div className="text-center w-full my-2 relative z-10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Don't Worry, We've Got Your Back
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
              LifeOS keeps your personal health, financial, and learning data safe. Recover access in just one step.
            </p>
          </div>

        </div>

        {/* RIGHT SECTION: Forgot Password Form */}
        <div className="flex flex-col justify-center p-6 md:p-10 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            
            {/* Form Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-3 shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Forgot Password?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Enter your registered email address below to receive a 6-digit verification passkey.
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="text-red-600 dark:text-red-400 text-xs mb-5 text-center bg-red-500/10 p-3 rounded-xl border border-red-500/30 font-medium">
                {error}
              </div>
            )}

            {/* Success Message Alert */}
            {success && (
              <div className="text-emerald-700 dark:text-emerald-300 text-xs mb-5 text-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30 font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                loadingText="Sending OTP..."
                rightIcon={
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                }
              >
                Send Verification OTP
              </Button>
            </form>

            {/* Navigation back to login */}
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Remembered your password? Return to Login
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}