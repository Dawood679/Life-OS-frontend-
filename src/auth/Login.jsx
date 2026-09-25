import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import loginHeroImg from '../assets/login.png';
import useAuthStore from '../lib/authStore';
import { triggerGoogleSignIn } from '../lib/googleAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  const successMessage = location.state?.message || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);

    try {
      const rawUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
      const BACKEND_URL = rawUrl.endsWith('/api') ? rawUrl : rawUrl.endsWith('/') ? `${rawUrl}api` : `${rawUrl}/api`;

      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || 'Login failed');
        return;
      }

      navigate('/verify-otp', {
        state: { email: data.email || email, type: 'login' },
      });
    } catch {
      setServerError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setServerError('');
    setGoogleLoading(true);

    try {
      const authPayload = await triggerGoogleSignIn();
      const rawUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
      const BACKEND_URL = rawUrl.endsWith('/api') ? rawUrl : rawUrl.endsWith('/') ? `${rawUrl}api` : `${rawUrl}/api`;

      const res = await fetch(`${BACKEND_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(authPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || 'Google sign-in failed');
        return;
      }

      setUser(data.user, data.token);
      toast.success(data.message || `Welcome to LifeOS, ${data.user?.name || ''}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Google login error:', err);
      setServerError(err.message || 'Unable to connect to Google Sign-In.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-[#07090e] bg-page-gradient p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/15 dark:bg-sky-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl min-h-[600px] bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Section - AI Showcase */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50/50 to-sky-50/70 dark:from-indigo-950/40 dark:via-[#0c1222]/60 dark:to-sky-950/40 p-8 hidden md:flex md:flex-col md:justify-between border-r border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden">
          {/* Top Brand Tag */}
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
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              AI Core Online
            </span>
          </div>

          {/* Center Visual: AI Orbital System */}
          <div className="w-full my-auto flex flex-col items-center justify-center relative z-10 py-6">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer Orbit Line */}
              <div className="absolute inset-0 rounded-full border border-dashed border-indigo-400/30 dark:border-indigo-500/30 animate-[spin_40s_linear_infinite]"></div>

              {/* Inner Glow Ring */}
              <div className="absolute inset-6 rounded-full border border-sky-400/30 dark:border-sky-500/20 bg-gradient-to-tr from-sky-500/10 to-indigo-500/10"></div>

              {/* Central AI Core Shield */}
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-sky-500 rounded-3xl shadow-xl shadow-indigo-500/25 flex flex-col items-center justify-center text-white transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                <svg
                  className="w-9 h-9 drop-shadow-md mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.75"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-90">
                  AI Core
                </span>
              </div>

              {/* Orbiting Feature Badges */}
              <div className="absolute top-1 left-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:4s]">
                <span className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                  ♥
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Health
                </span>
              </div>

              <div className="absolute top-3 right-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs font-bold">
                  $
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Finance
                </span>
              </div>

              <div className="absolute bottom-3 left-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                  🧠
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Learning
                </span>
              </div>

              <div className="absolute bottom-1 right-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:3.5s]">
                <span className="w-5 h-5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">
                  🔒
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Secure
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Narrative */}
          <div className="text-center w-full my-2 relative z-10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              One Unified Intelligence for Your Life
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Sign in to manage health insights, financial metrics, and stay on track with your daily goals.
            </p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex flex-col justify-center p-6 md:p-10 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Sign in to your LifeOS personal account
              </p>
            </div>

            {successMessage && (
              <div className="text-emerald-700 dark:text-emerald-300 text-xs mb-4 text-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
                {successMessage}
              </div>
            )}

            {serverError && (
              <div className="text-red-600 dark:text-red-400 text-xs mb-4 text-center bg-red-500/10 p-3 rounded-xl border border-red-500/30 font-medium">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                error={errors.email}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              {/* Password Field */}
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                error={errors.password}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                }
              />

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                loadingText="Sending OTP..."
                rightIcon={
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              >
                Sign In to LifeOS
              </Button>
            </form>

            {/* Clean Segmented Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200/80 dark:bg-slate-800/80"></div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase select-none">
                OR
              </span>
              <div className="flex-1 h-px bg-slate-200/80 dark:bg-slate-800/80"></div>
            </div>

            {/* Google Sign In */}
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                loading={googleLoading}
                loadingText="Connecting to Google..."
                leftIcon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                }
              >
                Continue with Google
              </Button>
            </div>

            {/* Footer Link */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}