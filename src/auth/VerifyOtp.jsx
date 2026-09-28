import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import useAuthStore from "../lib/authStore";

// Reusable OTP Input Field Component using design system Input
function OtpInput({ otp, inputRefs, onChange, onKeyDown, onPaste }) {
  return (
    <div
      className="flex justify-between gap-2 max-w-xs mx-auto"
      onPaste={onPaste}
    >
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          className="w-11 h-12 md:w-12 md:h-14 text-center font-bold text-xl text-ink-900 px-0 rounded-xl"
        />
      ))}
    </div>
  );
}

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "user@example.com";
  const type = location.state?.type || "login";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const inputRefs = useRef([]);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Handle single digit entry & auto-focus shift
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace key navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Full 6-digit paste support
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const fullOtp = otp.join("");

    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);

    try {
      const rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
      const normalizedBackend = rawUrl.endsWith('/api') ? rawUrl : rawUrl.endsWith('/') ? `${rawUrl}api` : `${rawUrl}/api`;

      const endpoint =
        type === "login"
          ? `${normalizedBackend}/auth/verify-login-otp`
          : `${normalizedBackend}/auth/verify-forgot-otp`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp: fullOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid or expired verification code");
        return;
      }

      if (type === "login") {
        setUser(data.user, data.token);
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/reset-password", {
          state: { email },
        });
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-[#07090e] bg-page-gradient p-4 relative overflow-hidden font-sans">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/15 dark:bg-sky-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Outer Card Wrapper */}
      <div className="relative z-10 w-full max-w-5xl min-h-[600px] bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT SECTION: Brand Hero & AI Visual System */}
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
              2FA Shield
            </span>
          </div>

          {/* Centerpiece: AI Orbital System */}
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-90">
                  Secured
                </span>
              </div>

              {/* Orbiting Satellites */}
              <div className="absolute top-1 left-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:4s]">
                <span className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Encrypted
                </span>
              </div>

              <div className="absolute bottom-1 right-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:3.5s]">
                <span className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                  🔒
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Narrative Copy */}
          <div className="text-center w-full my-2 relative z-10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              One Unified Intelligence for Your Life
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Securing your personal hub for health tracking, financial insights, and continuous learning.
            </p>
          </div>
        </div>

        {/* RIGHT SECTION: Verification Form */}
        <div className="flex flex-col justify-center p-6 md:p-10 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            {/* Header / Security Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-3 shadow-sm">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Two-Step Verification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                LifeOS sent a 6-digit passcode to<br />
                <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="text-red-600 dark:text-red-400 text-xs mb-5 text-center bg-red-500/10 p-3 rounded-xl border border-red-500/30 font-medium">
                {error}
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center mb-3">
                  Enter 6-Digit Passcode
                </label>
                <OtpInput
                  otp={otp}
                  inputRefs={inputRefs}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                />
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                loading={loading}
                loadingText="Authenticating..."
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
                Unlock LifeOS
              </Button>
            </form>

            {/* Resend / Back Options */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-1.5 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Wrong email or need a new code?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}