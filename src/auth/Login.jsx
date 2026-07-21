import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import loginHeroImg from '../assets/login.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-400 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden w-[80vw] max-w-6xl min-h-[80vh] grid grid-cols-1 md:grid-cols-[50%_50%] border border-white/60">
        
        {/* Left Section - Hero / Illustration */}
        <div className="bg-pink-50/30 p-6 md:p-8 hidden md:flex md:flex-col md:justify-between md:items-center text-center border-r border-slate-100">
          <div className="bg-blue-50 w-full h-full mx-auto rounded-xl p-4 md:p-5 shadow-md border border-blue-100 flex flex-col justify-between">
            <div className="w-full flex-1 flex items-center justify-center py-8">
              <img
                src={loginHeroImg}
                alt="Login Illustration"
                className="max-h-2xl w-auto object-contain drop-shadow-md"
              />
            </div>

            <div className="text-left w-full my-2">
              <h3 className="text-xl text-center font-bold text-slate-800 leading-tight">
                Welcome Back!
              </h3>
              <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
                Sign in to manage your health insights and stay on track with your goals.
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="bg-pink-50/30 flex flex-col justify-center p-6 md:p-10 overflow-y-auto">
          <h2 className="text-4xl font-serif font-bold text-slate-800 text-center mb-8">
            Welcome Home
          </h2>

          {successMessage && (
            <p className="text-green-600 text-xs mb-4 text-center bg-green-50 p-2.5 rounded-lg border border-green-200 max-w-md mx-auto w-full">
              {successMessage}
            </p>
          )}

          {serverError && (
            <p className="text-red-500 text-xs mb-4 text-center bg-red-50 p-2.5 rounded-lg border border-red-200 max-w-md mx-auto w-full">
              {serverError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto w-full">
            {/* Email Field */}
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
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
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
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
              <Link to="/forgot-password" className="text-xs text-indigo-600 font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              loadingText="Sending OTP..."
              className="mt-2"
              rightIcon={
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              }
            >
              Login
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4 max-w-md mx-auto w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-pink-50/30 px-3 text-slate-400 font-medium">OR</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="max-w-md mx-auto w-full">
            <Button
              type="button"
              variant="outline"
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
          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}