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
      const endpoint =
        type === "login"
          ? `${BACKEND_URL}/auth/verify-login-otp`
          : `${BACKEND_URL}/auth/verify-forgot-otp`;

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
        setUser(data.user);
        navigate("/dashboard");
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
    <div className="min-h-screen w-full flex items-center justify-center bg-page-gradient p-4 font-sans">
      {/* Outer Card Wrapper */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden w-[90vw] max-w-6xl min-h-[82vh] grid grid-cols-1 md:grid-cols-2 border border-white/60">
        
        {/* LEFT SECTION: Brand Hero & AI Visual System */}
        <div className="bg-surface-blue/50 p-8 hidden md:flex md:flex-col md:justify-between md:items-center text-center border-r border-surface-blue-border relative overflow-hidden">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-12 left-10 w-52 h-52 bg-brand-sky/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-12 right-10 w-64 h-64 bg-brand-indigo/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Brand Tag */}
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
              <span className="w-2 h-2 rounded-full bg-success-text animate-pulse"></span>
              AI Core Online
            </span>
          </div>

          {/* Centerpiece: AI Orbital System */}
          <div className="w-full my-auto flex flex-col items-center justify-center relative z-10 py-6">
            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Outer Orbit Line */}
              <div className="absolute inset-0 rounded-full border border-dashed border-brand-indigo/30 animate-[spin_40s_linear_infinite]"></div>

              {/* Inner Glow Ring */}
              <div className="absolute inset-8 rounded-full border border-brand-sky/30 bg-gradient-to-tr from-brand-sky/10 to-brand-indigo/10"></div>

              {/* Central AI Core Shield */}
              <div className="w-28 h-28 bg-brand-gradient rounded-3xl shadow-xl flex flex-col items-center justify-center text-white transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                <svg
                  className="w-10 h-10 drop-shadow-md mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-90">
                  AI Core
                </span>
              </div>

              {/* Orbiting Satellites */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md border border-ink-200 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:4s]">
                <span className="w-6 h-6 rounded-lg bg-success-bg text-success-text flex items-center justify-center text-xs font-bold">
                  ♥
                </span>
                <span className="text-xs font-semibold text-ink-700">
                  Health
                </span>
              </div>

              <div className="absolute top-4 right-2 bg-white/90 backdrop-blur-md border border-ink-200 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-surface-blue text-brand-sky flex items-center justify-center text-xs font-bold">
                  $
                </span>
                <span className="text-xs font-semibold text-ink-700">
                  Finance
                </span>
              </div>

              <div className="absolute bottom-4 left-2 bg-white/90 backdrop-blur-md border border-ink-200 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-surface-orange text-ink-700 flex items-center justify-center text-xs font-bold">
                  🧠
                </span>
                <span className="text-xs font-semibold text-ink-700">
                  Learning
                </span>
              </div>

              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md border border-ink-200 shadow-md px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce [animation-duration:3.5s]">
                <span className="w-6 h-6 rounded-lg bg-surface-blue text-brand-indigo flex items-center justify-center text-xs font-bold">
                  🔒
                </span>
                <span className="text-xs font-semibold text-ink-700">
                  2FA Verified
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Narrative Copy */}
          <div className="text-center w-full my-2 relative z-10">
            <h3 className="text-xl font-bold text-ink-900 leading-tight">
              One AI Assistant for Your Entire Life
            </h3>
            <p className="text-xs text-ink-500 mt-2 leading-relaxed max-w-sm mx-auto">
              Securing your personal hub for health tracking, financial
              insights, and continuous learning.
            </p>
          </div>
        </div>

        {/* RIGHT SECTION: Verification Form */}
        <div className="bg-surface-pink flex flex-col justify-center p-6 md:p-12 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            {/* Header / Security Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-blue text-brand-indigo border border-surface-blue-border mb-4 shadow-sm">
                <svg
                  className="w-7 h-7"
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

              <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink-900">
                Authenticate Access
              </h2>
              <p className="text-xs text-ink-500 mt-2 leading-relaxed">
                LifeOS sent a 6-digit security key to
                <br />
                <span className="font-semibold text-ink-700">{email}</span>
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <p className="text-danger-text text-xs mb-6 text-center bg-danger-bg p-3 rounded-lg border border-danger-border font-medium">
                {error}
              </p>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-400 text-center mb-3">
                  Passcode
                </label>
                <OtpInput
                  otp={otp}
                  inputRefs={inputRefs}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                />
              </div>

              {/* Submit CTA using Reusable Button */}
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                loadingText="Authenticating..."
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
                Unlock LifeOS
              </Button>
            </form>

            {/* Resend / Back Options */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-xs text-brand-link hover:text-brand-link-hover font-medium hover:underline inline-flex items-center gap-1.5 transition"
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