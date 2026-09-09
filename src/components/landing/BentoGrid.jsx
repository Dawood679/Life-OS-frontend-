import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  Compass,
  Briefcase,
  Activity,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mic,
  FileSpreadsheet,
  Brain,
  Layers,
  ShieldCheck,
  TrendingUp,
  Volume2,
  Zap,
  Clock,
  Scan,
} from "lucide-react";

export default function BentoGrid() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("all");

  return (
    <section id="features" className="relative py-20 md:py-28 overflow-hidden">
      {/* Background Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/4 right-0 w-[550px] h-[450px] rounded-full blur-[140px] opacity-30 ${
            isDark ? "bg-brand-indigo/25" : "bg-indigo-100/60"
          }`}
        />
        <div
          className={`absolute bottom-10 left-0 w-[500px] h-[400px] rounded-full blur-[130px] opacity-25 ${
            isDark ? "bg-brand-sky/20" : "bg-sky-100/60"
          }`}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border mb-4 backdrop-blur-md ${
              isDark
                ? "bg-brand-indigo/10 border-brand-indigo/30 text-brand-sky"
                : "bg-indigo-50 border-indigo-200 text-brand-indigo"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-brand-sky" />
            <span>BENTO GRID 2.0</span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Designed Like an Operating System.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-emerald">
              Engineered For High Achievers.
            </span>
          </h2>

          <p
            className={`mt-4 text-sm sm:text-base md:text-lg font-normal leading-relaxed ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Every module in LifeOS communicates with the centralized 0–100 Life Score engine. No silos, no manual data entry.
          </p>
        </div>

        {/* Bento Grid Layout (3 Columns / Multi Span) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
          {/* Card 1: LearningOS (Span 7) */}
          <div
            className={`md:col-span-3 lg:col-span-7 rounded-3xl p-6 sm:p-8 border backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between group ${
              isDark
                ? "bg-[#0e131f]/80 border-slate-800 hover:border-brand-indigo/50 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                : "bg-white/85 border-slate-200/90 hover:border-brand-indigo/30 shadow-[0_20px_45px_rgba(99,102,241,0.08)]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-brand-indigo/15 text-brand-indigo flex items-center justify-center font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-indigo">
                      LearningOS
                    </span>
                    <h3
                      className={`text-xl font-extrabold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      90-Day Transformation Blueprint
                    </h3>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20">
                  40% Life Score Weight
                </span>
              </div>

              <p
                className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Structured 3-Month blueprints designed to take you from foundational principles to production capstones and interview dominance with built-in Socratic AI tutoring.
              </p>

              {/* Visual Mock: 3-Month Roadmap Stepper */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                {[
                  { month: "Month 1", title: "Foundation & Diagnostics", score: "+20 Pts", status: "Completed", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                  { month: "Month 2", title: "Proof-of-Work Capstones", score: "+30 Pts", status: "In Progress", color: "text-brand-sky bg-brand-sky/10 border-brand-sky/20" },
                  { month: "Month 3", title: "Market Velocity & Mock Qs", score: "+25 Pts", status: "Upcoming", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isDark ? "bg-[#07090e]/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className="text-slate-400 uppercase">{item.month}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] ${item.color}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {item.title}
                    </div>
                    <div className="text-[11px] font-extrabold text-brand-indigo mt-1">
                      {item.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/20 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Includes Active Recall Micro-Quizzes & Socratic Chat
              </span>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-indigo hover:text-brand-sky transition-colors group-hover:translate-x-1 duration-200"
              >
                <span>Generate Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: CareerOS Powerhouse (Span 5) */}
          <div
            className={`md:col-span-3 lg:col-span-5 rounded-3xl p-6 sm:p-8 border backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between group ${
              isDark
                ? "bg-[#0e131f]/80 border-slate-800 hover:border-brand-sky/50 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                : "bg-white/85 border-slate-200/90 hover:border-brand-sky/30 shadow-[0_20px_45px_rgba(99,102,241,0.08)]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-brand-sky/15 text-brand-sky flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
                      CareerOS
                    </span>
                    <h3
                      className={`text-xl font-extrabold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      AI Mock Interview Studio
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-sky/10 text-brand-sky border border-brand-sky/20 flex items-center gap-1">
                  <Mic className="w-3 h-3 animate-pulse" />
                  Voice AI
                </span>
              </div>

              <p
                className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Turn-by-turn interactive voice simulation with browser speech synthesis, diagnostic radar scorecards, and 1-click weak topic remediation.
              </p>

              {/* Visual Mock: Diagnostic Scorecard Mini Box */}
              <div
                className={`p-4 rounded-2xl border my-3 ${
                  isDark ? "bg-[#07090e]/70 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Readiness Verdict:</span>
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    STRONG HIRE (89%)
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-400">System Architecture</span>
                    <span className="text-brand-sky">92/100</span>
                  </div>
                  <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-sky h-full rounded-full" style={{ width: "92%" }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold pt-1">
                    <span className="text-slate-400">Communication & Behavioral</span>
                    <span className="text-emerald-400">86/100</span>
                  </div>
                  <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: "86%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/20 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-brand-sky" />
                Dual Kanban + 16-Col Excel Tracker
              </span>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-sky hover:underline"
              >
                <span>Start Mock Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: HealthOS & Wellness Tracker (Span 4) */}
          <div
            className={`md:col-span-3 lg:col-span-4 rounded-3xl p-6 sm:p-7 border backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between group ${
              isDark
                ? "bg-[#0e131f]/80 border-slate-800 hover:border-emerald-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                : "bg-white/85 border-slate-200/90 hover:border-emerald-500/30 shadow-[0_20px_45px_rgba(99,102,241,0.08)]"
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    HealthOS (35% Weight)
                  </span>
                  <h3
                    className={`text-lg font-extrabold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Wellness & Prescription OCR
                  </h3>
                </div>
              </div>

              <p
                className={`text-xs leading-relaxed mb-4 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Log hydration, sleep hours, and medication routines with image-based OCR parsing. Direct feed to Life Score.
              </p>

              {/* Micro Status Widget */}
              <div
                className={`p-3 rounded-2xl border space-y-2 ${
                  isDark ? "bg-[#07090e]/70 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">💧 Daily Water</span>
                  <span className="text-sky-400">1,750ml / 2,000ml</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">😴 Sleep Duration</span>
                  <span className="text-emerald-400">7.8 hrs (Optimal)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">📷 Prescription OCR</span>
                  <span className="text-brand-indigo flex items-center gap-1">
                    <Scan className="w-3 h-3" /> Auto-Parsed
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/20 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">Zero Burnout Guard</span>
              <Link
                to="/register"
                className="text-xs font-bold text-emerald-500 hover:underline inline-flex items-center gap-1"
              >
                <span>Track Health</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Verified Skill Ledger (Span 4) */}
          <div
            className={`md:col-span-3 lg:col-span-4 rounded-3xl p-6 sm:p-7 border backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between group ${
              isDark
                ? "bg-[#0e131f]/80 border-slate-800 hover:border-amber-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                : "bg-white/85 border-slate-200/90 hover:border-amber-500/30 shadow-[0_20px_45px_rgba(99,102,241,0.08)]"
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    Credentialing
                  </span>
                  <h3
                    className={`text-lg font-extrabold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Verified Skill Ledger
                  </h3>
                </div>
              </div>

              <p
                className={`text-xs leading-relaxed mb-4 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Earn permanent cryptographic-style badges by scoring 80%+ on timed diagnostic AI quizzes.
              </p>

              {/* Golden Badge Showcase Chips */}
              <div className="space-y-2">
                {[
                  { name: "React 19 Architecture", score: "94%", date: "Verified" },
                  { name: "Distributed Systems & Redis", score: "88%", date: "Verified" },
                ].map((badge, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      isDark
                        ? "bg-amber-500/5 border-amber-500/20 text-amber-300"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">{badge.name}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400">
                      {badge.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/20 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">Auto-injects to Resume</span>
              <Link
                to="/register"
                className="text-xs font-bold text-amber-500 hover:underline inline-flex items-center gap-1"
              >
                <span>Take Diagnostic Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 5: Daily Voice Morning Briefing & AI EA (Span 4) */}
          <div
            className={`md:col-span-3 lg:col-span-4 rounded-3xl p-6 sm:p-7 border backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between group ${
              isDark
                ? "bg-[#0e131f]/80 border-slate-800 hover:border-brand-purple/50 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                : "bg-white/85 border-slate-200/90 hover:border-brand-purple/30 shadow-[0_20px_45px_rgba(99,102,241,0.08)]"
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Proactive Intelligence
                  </span>
                  <h3
                    className={`text-lg font-extrabold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    AI Morning & Night Recap
                  </h3>
                </div>
              </div>

              <p
                className={`text-xs leading-relaxed mb-4 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Timezone-aware synthesis that aggregates your to-dos, upcoming job follow-ups, and wellness into an audio briefing.
              </p>

              <div
                className={`p-3 rounded-2xl border flex items-center gap-3 ${
                  isDark ? "bg-[#07090e]/70 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-300 dark:text-slate-200">
                    "Morning John, you have 3 high priority tasks..."
                  </span>
                  <span className="text-[10px] text-slate-400">04:00 - 18:00 Timezone Sync</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/20 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">Zero Hallucination</span>
              <Link
                to="/register"
                className="text-xs font-bold text-purple-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Listen Sample</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
