import { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function VerifyForgotOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieves email from location state or sessionStorage fallback
  const email = location.state?.email || sessionStorage.getItem('forgotEmail') || 'your email';

  // Array of 6 single-character strings for the segmented OTP inputs
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // References for focusing the 6 input boxes
  const inputRefs = useRef([]);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Handle single digit entry & auto-advance
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; 

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/auth/verify-forgot-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp: fullOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid or expired OTP code.');
        return;
      }

      navigate('/reset-password', {
        state: { email },
      });
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-page-gradient p-4 font-sans">
      
      {/* Outer Card Shell */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden w-[90vw] max-w-6xl min-h-[82vh] grid grid-cols-1 md:grid-cols-2 border border-white/60">
        
        {/* LEFT SECTION: Visual Narrative */}
        <div className="bg-surface-blue/50 p-8 hidden md:flex md:flex-col md:justify-between md:items-center text-center border-r border-surface-blue-border relative overflow-hidden">
          
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-12 left-10 w-52 h-52 bg-brand-sky/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-12 right-10 w-64 h-64 bg-brand-indigo/20 rounded-full blur-3xl pointer-events-none"></div>

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
              OTP Verification
            </span>
          </div>

          {/* Central Stage: Custom Key Shield System */}
          <div className="w-full my-auto flex flex-col items-center justify-center relative z-10 py-6">
            <div className="relative w-72 h-72 flex items-center justify-center">
              
              {/* Outer Orbit Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-brand-indigo/30 animate-[spin_40s_linear_infinite]"></div>
              
              {/* Inner Glowing Aura */}
              <div className="absolute inset-8 rounded-full border border-brand-sky/30 bg-gradient-to-tr from-brand-sky/10 to-brand-indigo/10"></div>

              {/* Center Lock Badge */}
              <div className="w-28 h-28 bg-brand-gradient rounded-3xl shadow-xl flex flex-col items-center justify-center text-white transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                <svg className="w-10 h-10 drop-shadow-md mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[10px] font-bold tracking-wider uppercase opacity-90">Verify</span>
              </div>

              {/* Floating Badge 1: Instant Dispatch */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md border border-ink-200 shadow-md px-3.5 py-2 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:3.8s]">
                <span className="w-6 h-6 rounded-lg bg-surface-blue text-brand-sky flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-ink-400 font-medium leading-none">Code Sent</p>
                  <p className="text-xs font-semibold text-ink-700 mt-0.5">Inbox Ready</p>
                </div>
              </div>

              {/* Floating Badge 2: One-Time Passcode */}
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md border border-ink-200 shadow-md px-3.5 py-2 rounded-xl flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-surface-blue text-brand-indigo flex items-center justify-center text-xs font-bold">
                  🔑
                </span>
                <div className="text-left">
                  <p className="text-[9px] text-ink-400 font-medium leading-none">Passcode</p>
                  <p className="text-xs font-semibold text-ink-700 mt-0.5">Single-Use 2FA</p>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Descriptive Copy */}
          <div className="text-center w-full my-2 relative z-10">
            <h3 className="text-xl font-bold text-ink-900 leading-tight">
              One Step Away From Recovery
            </h3>
            <p className="text-xs text-ink-500 mt-2 leading-relaxed max-w-sm mx-auto">
              Confirming your identity ensures nobody else can reset the password to your LifeOS assistant.
            </p>
          </div>

        </div>

        {/* RIGHT SECTION: Verification Form */}
        <div className="bg-surface-pink flex flex-col justify-center p-6 md:p-12 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            
            {/* Header / Key Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-blue text-brand-indigo border border-surface-blue-border mb-4 shadow-sm">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
                </svg>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink-900">
                Verify Forgot OTP
              </h2>
              <p className="text-xs text-ink-500 mt-2 leading-relaxed">
                Enter the 6-digit recovery code sent to<br />
                <span className="font-semibold text-ink-700">{email}</span>
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <p className="text-danger-text text-xs mb-6 text-center bg-danger-bg p-3 rounded-lg border border-danger-border font-medium">
                {error}
              </p>
            )}

            {/* OTP Entry Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-400 text-center mb-3">
                  6-Digit Passcode
                </label>
                
                {/* 6 Segmented Input Boxes */}
                <div 
                  className="flex justify-between gap-2 max-w-xs mx-auto" 
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      inputClassName="w-11 h-12 md:w-12 md:h-14 text-center font-bold text-xl text-ink-900 bg-white/80 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-indigo/40 focus:border-brand-indigo shadow-sm transition-all p-0"
                    />
                  ))}
                </div>
              </div>

              {/* Submit CTA Button */}
              <Button
                type="submit"
                loading={loading}
                loadingText="Verifying OTP..."
                variant="primary"
                className="py-3 rounded-xl"
                rightIcon={
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              >
                Verify & Continue
              </Button>
            </form>

            {/* Back / Resend Links */}
            <div className="text-center mt-6 space-y-2">
              <Link
                to="/forgot-password"
                className="text-xs text-brand-link hover:text-brand-link-hover font-medium hover:underline inline-flex items-center gap-1.5 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Resend code or change email address
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}