import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  Activity,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Sliders,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function InteractiveSandbox() {
  const { isDark } = useTheme();
  const [activeMode, setActiveMode] = useState("balanced");

  const focusModes = {
    balanced: {
      name: "Balanced Mode",
      desc: "Optimal daily balance between career progression, structured learning, and deep wellness.",
      weights: { health: 35, learning: 40, career: 25 },
      score: 88.4,
      healthVal: 92,
      learningVal: 87,
      careerVal: 85,
      activeTasks: [
        "Complete 30-min Socratic Study Plan for Redis",
        "Log 2000ml hydration & 8h sleep target",
        "Follow up with Stripe & Google job applications",
      ],
      badge: "Standard Default Setting",
    },
    career: {
      name: "Career Sprint Mode",
      desc: "Prioritizes job applications, technical interviews, and resume tailoring before imminent hiring deadlines.",
      weights: { health: 20, learning: 30, career: 50 },
      score: 92.6,
      healthVal: 84,
      learningVal: 89,
      careerVal: 98,
      activeTasks: [
        "AI Mock Interview: 5 System Design Questions",
        "Review 16-Column Job Tracker follow-up alerts",
        "Tailor resume pitch to Senior Full-Stack role",
      ],
      badge: "High-Intensity Job Search",
    },
    student: {
      name: "Student Exam Mode",
      desc: "Maximizes cognitive recall, micro-quiz certifications, and deep conceptual learning blueprints.",
      weights: { health: 30, learning: 50, career: 20 },
      score: 89.8,
      healthVal: 88,
      learningVal: 96,
      careerVal: 78,
      activeTasks: [
        "Complete 90-Day Transformation Month 2 Milestone",
        "Score 80%+ on Diagnostic Distributed Systems Quiz",
        "Review AI Study Notes & Socratic chat takeaways",
      ],
      badge: "Deep Academic Mastery",
    },
  };

  const current = focusModes[activeMode];

  return (
    <section id="sandbox" className="relative py-20 md:py-28 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute bottom-0 right-1/4 w-[600px] h-[400px] rounded-full blur-[140px] opacity-25 ${
            isDark ? "bg-brand-emerald/20" : "bg-emerald-100/60"
          }`}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border mb-4 backdrop-blur-md ${
              isDark
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-emerald-50 border-emerald-200 text-emerald-600"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>LIVE INTERACTIVE SANDBOX</span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Switch Your Life Focus Mode.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-brand-sky">
              Watch The Algorithm Recalculate Live.
            </span>
          </h2>

          <p
            className={`mt-4 text-sm sm:text-base md:text-lg font-normal leading-relaxed ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            LifeOS adapts its mathematical scoring engine to your current life phase. Toggle a mode below to test the instant recalculation.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {[
            { id: "balanced", label: "Balanced Mode", icon: Sliders, color: "text-brand-sky" },
            { id: "career", label: "Career Sprint Mode", icon: Briefcase, color: "text-amber-400" },
            { id: "student", label: "Student Exam Mode", icon: BookOpen, color: "text-brand-indigo" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer border ${
                activeMode === mode.id
                  ? isDark
                    ? "bg-gradient-to-r from-brand-indigo to-brand-sky text-white border-transparent shadow-[0_0_25px_rgba(99,102,241,0.4)] scale-105"
                    : "bg-gradient-to-r from-brand-indigo to-brand-sky text-white border-transparent shadow-[0_10px_25px_rgba(99,102,241,0.25)] scale-105"
                  : isDark
                  ? "bg-[#0e131f]/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <mode.icon className="w-4 h-4" />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Interactive Sandbox Dashboard Mockup Card */}
        <div
          className={`rounded-3xl p-6 sm:p-10 border backdrop-blur-2xl transition-all duration-500 shadow-2xl ${
            isDark
              ? "bg-[#0e131f]/90 border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              : "bg-white/90 border-slate-200 shadow-[0_20px_50px_rgba(99,102,241,0.08)]"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Dynamic Score Breakdown Dial */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-6 rounded-2xl border bg-gradient-to-b from-brand-indigo/5 to-transparent border-slate-700/20 dark:border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-sky mb-1">
                {current.badge}
              </span>
              <h3 className={`text-xl font-extrabold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                {current.name}
              </h3>

              {/* Dynamic Score Ring */}
              <div className="relative flex items-center justify-center my-2">
                <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full border-4 border-dashed border-brand-indigo/30 animate-spin" style={{ animationDuration: "25s" }} />
                <div className="absolute inset-0 m-auto w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center p-4">
                  <span className={`text-4xl sm:text-5xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    {current.score}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/100 Total Score</span>
                </div>
              </div>

              {/* Formula explanation */}
              <p className="text-xs text-slate-400 mt-4 leading-relaxed font-mono">
                Formula: Score = (Health × {current.weights.health}%) + (Learning × {current.weights.learning}%) + (Career × {current.weights.career}%)
              </p>
            </div>

            {/* Right: Dimension Bars & Active Priority Agenda */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h4 className={`text-base font-bold mb-3 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Mathematical Dimension Weights
                </h4>

                <div className="space-y-3">
                  {/* Health Dimension */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> Health & Wellness ({current.weights.health}% Weight)
                      </span>
                      <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                        {current.healthVal}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/20 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${current.healthVal}%` }}
                      />
                    </div>
                  </div>

                  {/* Learning Dimension */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-brand-indigo flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> Learning & Quizzes ({current.weights.learning}% Weight)
                      </span>
                      <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                        {current.learningVal}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/20 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-indigo h-full rounded-full transition-all duration-500"
                        style={{ width: `${current.learningVal}%` }}
                      />
                    </div>
                  </div>

                  {/* Career Dimension */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-brand-sky flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> Career & Roadmaps ({current.weights.career}% Weight)
                      </span>
                      <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                        {current.careerVal}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/20 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-sky h-full rounded-full transition-all duration-500"
                        style={{ width: `${current.careerVal}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Priorities for this mode */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? "bg-[#07090e]/70 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Auto-Calculated Priority Agenda for this Mode:
                </div>
                <div className="space-y-2">
                  {current.activeTasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4 text-brand-sky shrink-0" />
                      <span className={isDark ? "text-slate-300" : "text-slate-700"}>{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Instant switch anytime from your LifeOS Dashboard
                </span>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light hover:opacity-95 shadow-md shadow-brand-indigo/30 transition-all"
                >
                  <span>Activate Mode in LifeOS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
