import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { Sparkles, Heart, Code2, Activity, ShieldCheck } from "lucide-react";

export default function Footer() {
  const { isDark } = useTheme();

  return (
    <footer
      className={`border-t transition-colors duration-300 ${
        isDark ? "bg-[#05070a] border-slate-800/80 text-slate-400" : "bg-white border-slate-200 text-slate-600"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info (Span 2) */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-sky p-0.5 shadow-md shadow-brand-indigo/30">
                <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isDark ? "bg-[#07090e]" : "bg-white"}`}>
                  <Sparkles className="w-4 h-4 text-brand-sky" />
                </div>
              </div>
              <span className={`text-xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Life<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light">OS</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed max-w-sm mb-4">
              Universal AI-powered personal organization, 90-day career blueprints, wellness tracking, and unified 0–100 Life Score engine.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (v2.5)</span>
            </div>
          </div>

          {/* Column 1: Ecosystem */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Ecosystem
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/register" className="hover:text-brand-sky transition-colors">
                  90-Day Roadmap Engine
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-sky transition-colors">
                  AI Mock Interview Studio
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-sky transition-colors">
                  Study Planner & Micro-Quizzes
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-sky transition-colors">
                  Prescription OCR Scanner
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-sky transition-colors">
                  Verified Skill Ledger
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: CareerOS */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              CareerOS
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/register" className="hover:text-brand-sky transition-colors">
                  16-Col Excel Job Tracker
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-sky transition-colors">
                  Job Matcher & Gap Analyzer
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-sky transition-colors">
                  Profile & Pitch ATS Analyzer
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-sky transition-colors">
                  Daily Voice Audio Briefing
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-sky transition-colors">
                  Human EA Burnout Guard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Account & Support */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Get Started
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/register" className="hover:text-brand-sky transition-colors font-bold text-brand-indigo">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-sky transition-colors">
                  Member Sign In
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-brand-sky transition-colors">
                  Account Recovery
                </Link>
              </li>
              <li>
                <a href="#pipeline" className="hover:text-brand-sky transition-colors">
                  Magic Pipeline Demo
                </a>
              </li>
              <li>
                <a href="#sandbox" className="hover:text-brand-sky transition-colors">
                  Focus Mode Sandbox
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 border-t border-slate-700/20 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © {new Date().getFullYear()} LifeOS Universal Intelligence. Built with ❤️ for peak human potential.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
