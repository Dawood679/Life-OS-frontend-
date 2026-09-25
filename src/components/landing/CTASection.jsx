import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function CTASection() {
  const { isDark } = useTheme();

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[150px] opacity-35 ${
            isDark ? "bg-gradient-to-r from-brand-indigo via-brand-sky to-purple-600" : "bg-sky-200/60"
          }`}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`rounded-3xl p-8 sm:p-14 border backdrop-blur-3xl text-center relative overflow-hidden shadow-2xl ${
            isDark
              ? "bg-gradient-to-b from-[#0e131f]/95 via-[#07090e]/95 to-[#07090e]/95 border-brand-indigo/30 shadow-[0_25px_70px_rgba(0,0,0,0.7)]"
              : "bg-gradient-to-b from-white/95 via-indigo-50/40 to-white/95 border-slate-200 shadow-[0_25px_60px_rgba(99,102,241,0.12)]"
          }`}
        >
          {/* Subtle Top Glowing Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-emerald" />

          {/* Floating Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border mb-6 bg-brand-indigo/10 border-brand-indigo/30 text-brand-sky">
            <Sparkles className="w-3.5 h-3.5 text-brand-sky animate-spin" style={{ animationDuration: "6s" }} />
            <span>INSTANT FREE ACTIVATION</span>
          </div>

          <h2
            className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-3xl mx-auto ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Ready to Take Control of Your Entire Life?
          </h2>

          <p
            className={`mt-6 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Join ambitious engineers, founders, and students who have replaced 5+ fragmented apps with a unified, AI-driven operating system.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light hover:opacity-95 shadow-xl shadow-brand-indigo/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Get Started Free Forever</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold border transition-all ${
                isDark
                  ? "text-slate-300 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
                  : "text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
              }`}
            >
              <span>Existing Member? Sign In</span>
            </Link>
          </div>

          {/* Guarantee Badges */}
          <div className="mt-10 pt-6 border-t border-slate-700/20 dark:border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-sky" />
              <span>Private & Encrypted Local Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-indigo" />
              <span>Instant Setup in 30 Seconds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
