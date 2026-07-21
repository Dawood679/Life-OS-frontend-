import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper checks for dynamic feedback
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password) {
      setError("Password is required");
      return;
    }
    if (!hasMinLength) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (!hasNumber) {
      setError("Password must contain at least one number");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password");
        return;
      }

      setSuccess("Password reset successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Password reset successful! Please login with your new password.",
          },
        });
      }, 2000);
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-400 p-4 font-sans">
      
      {/* Main Container */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden w-[90vw] max-w-6xl min-h-[82vh] grid grid-cols-1 md:grid-cols-2 border border-white/60">
        
        {/* LEFT SECTION: Vault Key Visualization */}
        <div className="bg-gradient-to-b from-blue-50/80 via-pink-50/40 to-indigo-50/60 p-6 hidden md:flex md:flex-col md:justify-between md:items-center text-center border-r border-slate-100 relative overflow-hidden">
          
          {/* Ambient Light Orbs */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-sky-300/30 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-indigo-300/30 rounded-full blur-2xl pointer-events-none"></div>

          {/* Top Brand Header */}
          <div className="w-full flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                ✦
              </div>
              <span className="font-serif font-bold text-slate-800 text-base tracking-tight">
                life<span className="text-indigo-600">OS</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200/80 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Vault Refresh
            </span>
          </div>

          {/* Key Exchange Illustration Area */}
          <div className="w-full my-auto flex flex-col items-center justify-center relative z-10 py-4">
            <div className="relative w-56 h-56 flex items-center justify-center">
              
              <div className="absolute inset-0 rounded-full border border-dashed border-indigo-300/60 animate-[spin_35s_linear_infinite]"></div>
              <div className="absolute inset-6 rounded-full border border-sky-200/70 bg-gradient-to-tr from-sky-100/30 to-indigo-100/40"></div>

              {/* Central Shield Badge */}
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 via-sky-500 to-sky-400 rounded-2xl shadow-lg flex flex-col items-center justify-center text-white transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                <svg className="w-8 h-8 drop-shadow-md mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[9px] font-bold tracking-wider uppercase opacity-90">New Key</span>
              </div>

              {/* Floating Security Badges */}
              <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
                <div className="text-left">
                  <p className="text-[8px] text-slate-400 font-medium leading-none">Security</p>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">SHA-256 Vault</p>
                </div>
              </div>

              <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                  ⚡
                </span>
                <div className="text-left">
                  <p className="text-[8px] text-slate-400 font-medium leading-none">AI Assistant</p>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">Instant Sync</p>
                </div>
              </div>

            </div>
          </div>

          {/* Descriptive Title */}
          <div className="text-center w-full my-1 relative z-10">
            <h3 className="text-lg font-bold text-slate-800 leading-tight">
              Create a Strong New Password
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs mx-auto">
              Your new password automatically protects all connected modules across Health, Finance, and Learning.
            </p>
          </div>

        </div>

        {/* RIGHT SECTION: Reset Form Pane */}
        <div className="bg-pink-50/30 flex flex-col justify-center p-5 md:p-8 overflow-y-auto">
          <div className="max-w-sm mx-auto w-full">
            
            {/* Header Block */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-2 shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
                </svg>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-800">
                Reset Password
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Updating security credentials for<br />
                <span className="font-semibold text-slate-700">{email || "your account"}</span>
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <p className="text-red-500 text-xs mb-4 text-center bg-red-50 p-2.5 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            {/* Success Banner */}
            {success && (
              <p className="text-emerald-600 text-xs mb-4 text-center bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 font-medium">
                {success}
              </p>
            )}

            {/* Form using Reusable Inputs and Button */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* New Password Field */}
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.015 10.015 0 014.122-.863c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                }
              />

              {/* Confirm Password Field */}
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showConfirmPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.015 10.015 0 014.122-.863c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                }
              />

              {/* Requirement Micro-Badges */}
              <div className="bg-white/60 p-2.5 rounded-xl border border-slate-200/60 space-y-1 my-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Password Requirements
                </p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className={`inline-flex items-center gap-1 font-medium ${hasMinLength ? "text-emerald-600" : "text-slate-400"}`}>
                    {hasMinLength ? "✓" : "○"} At least 8 chars
                  </span>
                  <span className={`inline-flex items-center gap-1 font-medium ${hasNumber ? "text-emerald-600" : "text-slate-400"}`}>
                    {hasNumber ? "✓" : "○"} One number
                  </span>
                  <span className={`inline-flex items-center gap-1 font-medium ${passwordsMatch ? "text-emerald-600" : "text-slate-400"}`}>
                    {passwordsMatch ? "✓" : "○"} Passwords match
                  </span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <Button
                type="submit"
                loading={loading}
                loadingText="Updating Password..."
                className="mt-2 py-2 text-sm"
                rightIcon={
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              >
                Reset & Save Password
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-xs text-indigo-600 font-medium hover:underline inline-flex items-center gap-1.5 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Cancel and return to Login
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}