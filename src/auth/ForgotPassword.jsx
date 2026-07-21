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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-400 p-4 font-sans">
      
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden w-[90vw] max-w-6xl min-h-[82vh] grid grid-cols-1 md:grid-cols-2 border border-white/60">
        
        {/* LEFT SECTION*/}
        <div className="bg-gradient-to-b from-blue-50/80 via-pink-50/40 to-indigo-50/60 p-8 hidden md:flex md:flex-col md:justify-between md:items-center text-center border-r border-slate-100 relative overflow-hidden">
          
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-10 left-10 w-52 h-52 bg-sky-300/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-300/30 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Brand Header */}
          <div className="w-full flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                ✦
              </div>
              <span className="font-serif font-bold text-slate-800 text-lg tracking-tight">
                life<span className="text-indigo-600">OS</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Account Recovery
            </span>
          </div>

          {/* Central Custom Visual Concept: Key & Passcode Shield */}
          <div className="w-full my-auto flex flex-col items-center justify-center relative z-10 py-6">
            <div className="relative w-72 h-72 flex items-center justify-center">
              
              {/* Outer Pulsing Orbit */}
              <div className="absolute inset-0 rounded-full border border-dashed border-indigo-300/60 animate-[spin_45s_linear_infinite]"></div>
              
              {/* Inner Glowing Ring */}
              <div className="absolute inset-8 rounded-full border border-sky-200/70 bg-gradient-to-tr from-sky-100/30 to-indigo-100/40"></div>

              {/* Central Key/Shield Card */}
              <div className="w-28 h-28 bg-gradient-to-br from-indigo-600 via-sky-500 to-sky-400 rounded-3xl shadow-xl flex flex-col items-center justify-center text-white transform rotate-3 transition-transform hover:rotate-0 duration-300">
                <svg className="w-10 h-10 drop-shadow-md mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
                </svg>
                <span className="text-[10px] font-bold tracking-wider uppercase opacity-90">Reset Key</span>
              </div>

              {/* Orbiting Badge 1: Verification Email */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md px-3.5 py-2 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:3.5s]">
                <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center text-xs">
                  ✉
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 font-medium leading-none">OTP Dispatch</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">Instant Email</p>
                </div>
              </div>


              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md px-3.5 py-2 rounded-xl flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  🛡️
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 font-medium leading-none">Protection</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">Secure AI Vault</p>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Narrative Banner */}
          <div className="text-center w-full my-2 relative z-10">
            <h3 className="text-xl font-bold text-slate-800 leading-tight">
              Don't Worry, We've Got Your Back
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-sm mx-auto">
              LifeOS keeps your personal health, financial, and learning data safe. Recover access in just one step.
            </p>
          </div>

        </div>

        {/* RIGHT SECTION: Forgot Password Form */}
        <div className="bg-pink-50/30 flex flex-col justify-center p-6 md:p-12 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            
            {/* Form Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4 shadow-sm">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800">
                Forgot Password?
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Enter your registered email address below to receive a 6-digit verification passkey.
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <p className="text-red-500 text-xs mb-6 text-center bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            {/* Success Message Alert */}
            {success && (
              <p className="text-emerald-600 text-xs mb-6 text-center bg-emerald-50 p-3 rounded-lg border border-emerald-200 font-medium">
                {success}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                loadingText="Sending OTP..."
                variant="primary"
                fullWidth
                showArrow
              >
                Send Verification OTP
              </Button>
            </form>

            {/* Navigation back to login */}
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="text-xs text-indigo-600 font-medium hover:underline inline-flex items-center gap-1.5 transition"
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