import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  Search,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Calendar,
  Award,
  ChevronRight,
  Compass,
} from "lucide-react";

export default function SpotlightInput() {
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedGoal, setSelectedGoal] = useState(0);

  const presets = [
    {
      id: 0,
      title: "Crack Senior Full-Stack Engineer in 90 Days",
      category: "Career & LearningOS",
      badge: "Target: $140k+ Remote / Onsite",
      steps: [
        "Month 1: Deep Distributed Systems & React 19 Foundations (+20 Life Score)",
        "Month 2: Shipped 2 Live Scalable Microservices & Verified Skill Badges",
        "Month 3: 5 AI Mock Interviews with Live Scorecard & Resume Tuning",
      ],
      skillGain: "React Architecture, Redis Caching, System Design",
      scoreGain: "+8.4 Life Score Boost",
    },
    {
      id: 1,
      title: "Fix 4.5h Sleep Strain & Reschedule Agenda Safely",
      category: "HealthOS & Human EA",
      badge: "Zero Streak Loss Guarantee",
      steps: [
        "Health Deficit Evaluator: Sleep deficit detected (< 5.5h)",
        "Autonomous EA Consent: Propose batch-snooze of 3 low-priority tasks",
        "Streak Protection: Daily streak remains intact, agenda balanced",
      ],
      skillGain: "Wellness Recovery, Optimized Focus Window",
      scoreGain: "+5.2 Wellness Score Restoration",
    },
    {
      id: 2,
      title: "Master Redis in 3 Days for Upcoming Job Interview",
      category: "LearningOS Express",
      badge: "Diagnostic AI Quiz Included",
      steps: [
        "Day 1: In-Memory Data Structures, Caching Strategies & LRU Eviction",
        "Day 2: Pub/Sub Architecture, Redis Streams & Rate Limiting",
        "Day 3: Timed Diagnostic Quiz (80%+ awards Verified Redis Badge)",
      ],
      skillGain: "Redis Caching, High-Concurrency Queues",
      scoreGain: "+4.0 Verified Skill Score",
    },
    {
      id: 3,
      title: "Practice AI Mock Interview with Turn-by-Turn Voice",
      category: "CareerOS Powerhouse",
      badge: "Voice Synthesis & Diagnostic Radar",
      steps: [
        "Turn-by-turn conversational AI simulation with browser speech audio",
        "Detailed Scorecard: Readiness Verdict (Strong Hire / Needs Prep)",
        "1-Click Weak Topic Bridge directly to Study Planner",
      ],
      skillGain: "Behavioral Pitch, Technical Articulation",
      scoreGain: "+6.5 Interview Readiness",
    },
  ];

  const activePlan = presets[selectedGoal];

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 sm:mt-10 px-1 sm:px-0">
      {/* Spotlight Command Bar */}
      <div
        className={`relative rounded-2xl sm:rounded-3xl p-2 sm:p-3 border backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
          isDark
            ? "bg-[#0e131f]/80 border-brand-indigo/30 shadow-[0_15px_60px_rgba(0,0,0,0.6)]"
            : "bg-white/85 border-slate-200/90 shadow-[0_20px_50px_rgba(99,102,241,0.1)]"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2">
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-sky text-white shadow-md shadow-brand-indigo/30 shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type any goal... e.g. 'Senior Full Stack in 90 Days'"
              className={`w-full bg-transparent text-xs sm:text-base font-medium focus:outline-none placeholder:text-slate-400 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            />
          </div>

          <Link
            to="/register"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-indigo to-brand-sky hover:opacity-95 shadow-md shadow-brand-indigo/25 transition-all shrink-0"
          >
            <span>Launch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Preset Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-1 sm:px-2 pt-2 pb-1 overflow-x-auto scrollbar-none">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5 sm:mr-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-brand-sky" />
            Try:
          </span>
          {presets.map((preset, index) => (
            <button
              key={preset.id}
              onClick={() => setSelectedGoal(index)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                selectedGoal === index
                  ? "bg-gradient-to-r from-brand-indigo via-brand-sky to-brand-sky-light text-white shadow-md shadow-brand-indigo/25 scale-[1.02]"
                  : isDark
                  ? "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {preset.title.split(" in ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Instant Blueprint Preview Card */}
      <div
        className={`mt-3 sm:mt-4 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border backdrop-blur-xl transition-all duration-300 ${
          isDark
            ? "bg-[#07090e]/70 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            : "bg-white/80 border-slate-200/80 shadow-[0_20px_45px_rgba(99,102,241,0.06)]"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-slate-700/20 dark:border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/30 tracking-wider">
                {activePlan.category}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {activePlan.badge}
              </span>
            </div>
            <h3
              className={`text-base sm:text-xl font-extrabold mt-1 sm:mt-1.5 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {activePlan.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0 mt-1 md:mt-0">
            <span className="px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-500 border border-emerald-500/20">
              {activePlan.scoreGain}
            </span>
          </div>
        </div>

        {/* 3 Step Execution Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 my-3 sm:my-4">
          {activePlan.steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all ${
                isDark
                  ? "bg-[#0e131f]/60 border-slate-800 hover:border-brand-indigo/40"
                  : "bg-slate-50/80 border-slate-200/70 hover:border-brand-indigo/30"
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg bg-brand-sky/15 text-brand-sky flex items-center justify-center font-extrabold text-[10px] sm:text-[11px]">
                  {idx + 1}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Step {idx + 1}
                </span>
              </div>
              <p className={`text-xs font-medium leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Action Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-700/20 dark:border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">Target Skills: <strong className={isDark ? "text-slate-200" : "text-slate-800"}>{activePlan.skillGain}</strong></span>
          </div>

          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-indigo hover:text-brand-sky transition-colors group"
          >
            <span>Launch in LifeOS Free</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
