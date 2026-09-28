import React from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Sparkles,
  Shield,
  Zap,
  Target,
  Layers,
  HeartPulse,
  Briefcase,
  GraduationCap,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function AboutSection() {
  const { isDark } = useTheme();

  const stats = [
    { label: "AI Orchestration Latency", value: "<500ms", sub: "Groq & Gemini Dual-Core" },
    { label: "Connected Life Domains", value: "3 Pillars", sub: "Learning • Career • Health" },
    { label: "Data Retention Policy", value: "0% Retained", sub: "Enterprise Zero-Data Privacy" },
    { label: "Autonomous Life Score", value: "Real-time", sub: "Dynamic Energy & Focus Engine" },
  ];

  const pillars = [
    {
      icon: GraduationCap,
      color: "from-brand-indigo to-brand-sky",
      title: "Learning Intelligence",
      description:
        "Transforming abstract goals into week-by-week interactive study roadmaps, AI quiz generation, and adaptive note synthesis.",
    },
    {
      icon: Briefcase,
      color: "from-brand-sky to-emerald-400",
      title: "Career & Execution Matrix",
      description:
        "Instant resume ATS gap analysis, AI project architecting, mock interview evaluations, and automated job pipeline tracking.",
    },
    {
      icon: HeartPulse,
      color: "from-rose-500 to-amber-400",
      title: "Health & Vitality Guardian",
      description:
        "Prescription OCR parsing, circadian hydration alerts, mood & sleep tracking that actively shields you from burnout.",
    },
  ];

  return (
    <section
      id="about"
      className={`py-24 relative overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-[#05070c]" : "bg-white"
      }`}
    >
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-brand-indigo/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-96 h-96 bg-brand-sky/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-indigo/30 bg-brand-indigo/5 text-brand-indigo text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-sky animate-pulse" />
            <span>The Vision Behind LifeOS</span>
          </div>

          <h2
            className={`text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Why We Built the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light">
              Universal Life System
            </span>
          </h2>

          <p
            className={`text-base sm:text-lg leading-relaxed ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Modern life is scattered across 10 disconnected apps—notes in one tool, tasks in another,
            health logs forgotten, and career milestones untracked. We created LifeOS to give every human
            a single, sovereign AI operating system for total life alignment.
          </p>
        </div>

        {/* Narrative Comparison Card */}
        <div
          className={`rounded-3xl p-8 sm:p-12 mb-16 border transition-all duration-300 ${
            isDark
              ? "bg-gradient-to-r from-[#0b0e17] via-[#101424] to-[#0b0e17] border-white/10 shadow-2xl"
              : "bg-gradient-to-r from-slate-50 via-brand-indigo/[0.03] to-slate-50 border-slate-200 shadow-xl"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: The Broken Past */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping" />
                The Fragmentation Crisis
              </span>
              <h3
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Cognitive overload from juggling disconnected tools
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                When your study plans don't know your energy levels, and your job tracker is isolated
                from your daily tasks, you waste hours managing your productivity instead of actually
                achieving your goals.
              </p>
              <div className="space-y-2 pt-2">
                {[
                  "Context-switching fatigue between isolated apps",
                  "Burnout caused by unmonitored work schedules",
                  "No unified feedback loop on daily progress",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: The LifeOS Solution */}
            <div
              className={`rounded-2xl p-6 sm:p-8 border ${
                isDark
                  ? "bg-brand-indigo/10 border-brand-indigo/30 shadow-inner"
                  : "bg-white border-brand-indigo/20 shadow-md"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-brand-sky flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                The LifeOS Breakthrough
              </span>
              <h4
                className={`text-xl font-bold mb-3 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                One Autonomous AI Nerve Center
              </h4>
              <p
                className={`text-xs leading-relaxed mb-4 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                LifeOS dynamically syncs your health telemetry, career sprint roadmap, and daily action
                matrix into a real-time **Life Score**, acting as a 24/7 proactive Executive Assistant.
              </p>
              <div className="space-y-2.5">
                {[
                  "Dual-Engine Sub-second Intelligence (Gemini 2.5 + Groq LLaMA)",
                  "Burnout Shield with circadian water and rest pacing",
                  "Verified Skill Ledger with automated job ATS alignment",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className={isDark ? "text-slate-200" : "text-slate-800"}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className={`rounded-3xl p-8 border transition-all duration-300 group hover:-translate-y-1.5 ${
                isDark
                  ? "bg-[#0b0e17] border-white/10 hover:border-brand-indigo/50 hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)]"
                  : "bg-white border-slate-200 hover:border-brand-indigo/40 hover:shadow-xl hover:shadow-brand-indigo/10"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${pillar.color} p-0.5 mb-6 flex items-center justify-center shadow-md`}
              >
                <div
                  className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                    isDark ? "bg-[#0b0e17]" : "bg-white"
                  }`}
                >
                  <pillar.icon className="w-5 h-5 text-brand-sky" />
                </div>
              </div>

              <h3
                className={`text-lg font-bold mb-2.5 group-hover:text-brand-sky transition-colors ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {pillar.title}
              </h3>

              <p
                className={`text-xs leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        {/* Telemetry Stats Bar */}
        <div
          className={`rounded-3xl p-6 sm:p-8 border grid grid-cols-2 lg:grid-cols-4 gap-6 text-center ${
            isDark
              ? "bg-[#090b12] border-white/10"
              : "bg-slate-50 border-slate-200 shadow-sm"
          }`}
        >
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {stat.value}
              </div>
              <div
                className={`text-xs font-bold ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
