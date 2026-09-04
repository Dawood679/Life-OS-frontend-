import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  BookOpen,
  Award,
  Search,
  FileText,
  Mic,
  Briefcase,
  Droplets,
  Pill,
  FileSearch,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  ChevronRight,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function LifeJourneyFlow({ user, lifeScore, todos = [], verifiedSkills = [] }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("learning"); // 'learning' | 'career' | 'health'
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasVerifiedSkills = (verifiedSkills && verifiedSkills.length > 0) || (user?.verifiedSkills && user.verifiedSkills.length > 0);
  const hasTodos = todos && todos.length > 0;
  const isHydrated = (lifeScore?.breakdown?.waterConsumedMl || 0) >= 1000;

  const JOURNEYS = {
    learning: {
      id: "learning",
      title: "Learning & Skill Mastery OS",
      badge: "3-Step Growth Pipeline",
      color: "from-purple-600 via-indigo-600 to-indigo-700",
      accentBg: "bg-purple-50 text-purple-700 border-purple-200",
      strategyTip:
        "Macro roadmaps define direction ➔ Study plans break them into 30-min habits ➔ AI Quizzes verify skills to permanently boost your verified talent ledger.",
      steps: [
        {
          number: "1",
          title: "90-Day Career Roadmap",
          shortName: "Roadmap",
          description: "Establish your high-level macro transformation & quarterly milestones.",
          path: "/learning/roadmap",
          actionLabel: "Open Roadmap",
          icon: Compass,
          status: "Active Macro Goal",
          isNextAction: false,
          isCompleted: true
        },
        {
          number: "2",
          title: "Study Plan & Practice",
          shortName: "Study Plan",
          description: "Breakdown goals into focused 30-min micro-lessons and active practice.",
          path: "/learning/study-plan",
          actionLabel: "Generate Study Plan",
          icon: BookOpen,
          status: hasVerifiedSkills ? "In Progress" : "Next Best Action",
          isNextAction: !hasVerifiedSkills,
          isCompleted: false
        },
        {
          number: "3",
          title: "AI Skill Quiz & Verification",
          shortName: "Skill Quiz",
          description: "Score 80%+ to unlock official verified skill credentials for your resume.",
          path: "/learning/quiz",
          actionLabel: "Take Skill Quiz",
          icon: Award,
          status: hasVerifiedSkills ? "Verified Mastery" : "Next Milestone",
          isNextAction: hasVerifiedSkills,
          isCompleted: hasVerifiedSkills
        }
      ],
      companionTools: [
        { name: "Work & Asset Analyzer", path: "/learning/work-review", icon: "✦" },
        { name: "Action Plan Generator", path: "/learning/action-plan", icon: "🚀" },
        { name: "Notes Summarizer", path: "/learning/notes-summarizer", icon: "📝" }
      ]
    },

    career: {
      id: "career",
      title: "Career & Interview Velocity OS",
      badge: "4-Stage Hiring Pipeline",
      color: "from-indigo-600 via-sky-600 to-teal-600",
      accentBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      strategyTip:
        "Identify skill gaps against live market roles ➔ Tailor your resume pitch ➔ Rehearse in the AI Studio ➔ Track offers in your candidate pipeline.",
      steps: [
        {
          number: "1",
          title: "Job Match & Gap Analyzer",
          shortName: "Job Match",
          description: "Compare target job descriptions against your skills to find high-impact gaps.",
          path: "/career/job-match",
          actionLabel: "Run Job Match",
          icon: Search,
          status: "Market Diagnostic",
          isNextAction: true,
          isCompleted: false
        },
        {
          number: "2",
          title: "Profile & Resume Pitch",
          shortName: "Resume Pitch",
          description: "Generate tailored elevator pitches and ATS-optimized bullet points.",
          path: "/career/resume",
          actionLabel: "Analyze Resume",
          icon: FileText,
          status: "High Impact",
          isNextAction: false,
          isCompleted: false
        },
        {
          number: "3",
          title: "AI Mock Interview Studio",
          shortName: "Mock Interview",
          description: "Simulate turn-by-turn technical & behavioral interviews with instant scorecards.",
          path: "/career/mock-interview",
          actionLabel: "Launch Interview",
          icon: Mic,
          status: "Interview Ready",
          isNextAction: false,
          isCompleted: false
        },
        {
          number: "4",
          title: "Job Application Pipeline",
          shortName: "Applications",
          description: "Manage applications across Kanban stages and dense 16-column Excel suites.",
          path: "/career/applications",
          actionLabel: "Track Applications",
          icon: Briefcase,
          status: "Offer Velocity",
          isNextAction: false,
          isCompleted: false
        }
      ],
      companionTools: [
        { name: "Todo Planner", path: "/todos", icon: "✅" },
        { name: "Verified Talent Ledger", path: "/profile", icon: "🛡️" }
      ]
    },

    health: {
      id: "health",
      title: "Health, Medicine & Vitality OS",
      badge: "3-Pillar Foundation",
      color: "from-rose-600 via-pink-600 to-amber-600",
      accentBg: "bg-rose-50 text-rose-700 border-rose-200",
      strategyTip:
        "Physical energy directly powers cognitive output. Track daily sleep & hydration ➔ Adhere to medicines ➔ Digitize medical records for complete vitality.",
      steps: [
        {
          number: "1",
          title: "Wellness & Sleep Logger",
          shortName: "Wellness Log",
          description: "Log hydration, sleep hours, screen time, and mood to drive your daily Energy Score.",
          path: "/wellness/tracker",
          actionLabel: "Open Wellness Tracker",
          icon: Droplets,
          status: isHydrated ? "Goal Tracked" : "Daily Foundation",
          isNextAction: !isHydrated,
          isCompleted: isHydrated
        },
        {
          number: "2",
          title: "Medicine Routine & Alerts",
          shortName: "Medicines",
          description: "Schedule dosage frequencies with automatic background notification reminders.",
          path: "/health/medicines",
          actionLabel: "Manage Routine",
          icon: Pill,
          status: "Active Routine",
          isNextAction: isHydrated,
          isCompleted: false
        },
        {
          number: "3",
          title: "Prescription OCR & History",
          shortName: "Medical Records",
          description: "Scan doctor prescriptions with AI OCR and store historical medical records.",
          path: "/health/prescriptions",
          actionLabel: "Scan Prescription",
          icon: FileSearch,
          status: "Health Ledger",
          isNextAction: false,
          isCompleted: false
        }
      ],
      companionTools: [
        { name: "Medical History", path: "/health/medical-history", icon: "🩺" },
        { name: "Water Reminder Settings", path: "/wellness/tracker", icon: "💧" }
      ]
    }
  };

  const currentJourney = JOURNEYS[activeTab];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-indigo to-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                LifeOS Master Growth Playbook
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Connected Lifecycles
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow the recommended step-by-step lifecycle flow to maximize momentum & career velocity
            </p>
          </div>
        </div>

        {/* Tab Selector & Collapse Toggle */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-bold">
            <button
              onClick={() => setActiveTab("learning")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "learning"
                  ? "bg-white text-purple-700 shadow-xs border border-slate-200/60 font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📚 Learning Flow</span>
            </button>

            <button
              onClick={() => setActiveTab("career")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "career"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200/60 font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>💼 Career Flow</span>
            </button>

            <button
              onClick={() => setActiveTab("health")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "health"
                  ? "bg-white text-rose-700 shadow-xs border border-slate-200/60 font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>💚 Health Flow</span>
            </button>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition cursor-pointer"
            title={isCollapsed ? "Expand Master Journey" : "Collapse Master Journey"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {!isCollapsed && (
        <div className="p-5 sm:p-6 space-y-5 animate-fadeIn">
          {/* Strategy Tip Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-start gap-2.5 text-xs text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-950">Lifecycle Strategy: </span>
              <span className="text-indigo-800/90 font-medium leading-relaxed">{currentJourney.strategyTip}</span>
            </div>
          </div>

          {/* Connected Step Nodes Grid */}
          <div
            className={`grid gap-3.5 items-stretch ${
              currentJourney.steps.length === 4
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {currentJourney.steps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === currentJourney.steps.length - 1;

              return (
                <div
                  key={idx}
                  className={`relative p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 group ${
                    step.isNextAction
                      ? "bg-gradient-to-br from-indigo-50/90 via-sky-50/50 to-white border-indigo-400 ring-2 ring-indigo-500/20 shadow-md scale-[1.01]"
                      : step.isCompleted
                      ? "bg-slate-50/80 border-slate-200/90 hover:bg-white"
                      : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  {/* Next Best Action Glow Badge */}
                  {step.isNextAction && (
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-indigo via-indigo-600 to-sky-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1 animate-pulse">
                      <Zap className="w-2.5 h-2.5 fill-white" />
                      <span>Next Best Action</span>
                    </div>
                  )}

                  {/* Step Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-[11px] font-black flex items-center justify-center font-mono shadow-2xs">
                          {step.number}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Stage 0{step.number}
                        </span>
                      </div>

                      {step.isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Done</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {step.status}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-2.5 pt-1">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-800 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step Action Launcher */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => navigate(step.path)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        step.isNextAction
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      <span>{step.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Companion Power Tools Chips */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-bold text-slate-700">⚡ Companion Tools:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentJourney.companionTools.map((tool, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(tool.path)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <span>{tool.icon}</span>
                    <span>{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              1-Click bridge navigation active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
