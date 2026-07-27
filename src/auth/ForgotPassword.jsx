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
    <div className="min-h-screen w-full flex items-center justify-center bg-page-gradient p-4 font-sans">
      
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden w-[90vw] max-w-6xl min-h-[82vh] grid grid-cols-1 md:grid-cols-2 border border-white/60">
        
        {/* LEFT SECTION: Visual Narrative */}
        <div className="bg-surface-blue/50 p-8 hidden md:flex md:flex-col md:justify-between md:items-center text-center border-r border-surface-blue-border relative overflow-hidden">
          
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-10 left-10 w-52 h-52 bg-brand-sky/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-brand-indigo/20 rounded-full blur-3xl pointer-events-none"></div>

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

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-ink-200 text-[11px] font-semibold text-ink-600 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-brand-sky-light animate-ping"></span>
              Account Recovery
            </span>
          </div>

          {/* Central Visual Concept: Key & Passcode Shield */}
          <div className="w-full my-auto flex flex-col items-center justify-center relative z-10 py-6">
            <div className="relative w-72 h-72 flex items-center justify-center">
              
              {/* Outer Pulsing Orbit */}
              <div className="absolute inset-0 rounded-full border border-dashed border-brand-indigo/30 animate-[spin_45s_linear_infinite]"></div>
              
              {/* Inner Glowing Ring */}
              <div className="absolute inset-8 rounded-full border border-brand-sky/30 bg-gradient-to-tr from-brand-sky/10 to-brand-indigo/10"></div>

              {/* Central Key/Shield Card */}
              <div className="w-28 h-28 bg-brand-gradient rounded-3xl shadow-xl flex flex-col items-center justify-center text-white transform rotate-3 transition-transform hover:rotate-0 duration-300">
                <svg className="w-10 h-10 drop-shadow-md mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
                </svg>
                <span className="text-[10px] font-bold tracking-wider uppercase opacity-90">Reset Key</span>
              </div>

              {/* Orbiting Badge 1: Verification Email */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md border border-ink-200 shadow-md px-3.5 py-2 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:3.5s]">
                <span className="w-6 h-6 rounded-lg bg-surface-blue text-brand-sky flex items-center justify-center text-xs">
                  ✉
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-ink-400 font-medium leading-none">OTP Dispatch</p>
                  <p className="text-xs font-semibold text-ink-700 mt-0.5">Instant Email</p>
                </div>
              </div>

              {/* Orbiting Badge 2: Protection */}
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md border border-ink-200 shadow-md px-3.5 py-2 rounded-xl flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-surface-blue text-brand-indigo flex items-center justify-center text-xs font-bold">
                  🛡️
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-ink-400 font-medium leading-none">Protection</p>
                  <p className="text-xs font-semibold text-ink-700 mt-0.5">Secure AI Vault</p>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Narrative Banner */}
          <div className="text-center w-full my-2 relative z-10">
            <h3 className="text-xl font-bold text-ink-900 leading-tight">
              Don't Worry, We've Got Your Back
            </h3>
            <p className="text-xs text-ink-500 mt-2 leading-relaxed max-w-sm mx-auto">
              LifeOS keeps your personal health, financial, and learning data safe. Recover access in just one step.
            </p>
          </div>

        </div>

        {/* RIGHT SECTION: Forgot Password Form */}
        <div className="bg-surface-pink flex flex-col justify-center p-6 md:p-12 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            
            {/* Form Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-blue text-brand-indigo border border-surface-blue-border mb-4 shadow-sm">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink-900">
                Forgot Password?
              </h2>
              <p className="text-xs text-ink-500 mt-2 leading-relaxed">
                Enter your registered email address below to receive a 6-digit verification passkey.
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <p className="text-danger-text text-xs mb-6 text-center bg-danger-bg p-3 rounded-lg border border-danger-border font-medium">
                {error}
              </p>
            )}

            {/* Success Message Alert */}
            {success && (
              <p className="text-success-text text-xs mb-6 text-center bg-success-bg p-3 rounded-lg border border-success-border font-medium">
                {success}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                leftIcon={
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
                className="py-3 rounded-xl"
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
                className="text-xs text-brand-link hover:text-brand-link-hover font-medium hover:underline inline-flex items-center gap-1.5 transition"
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