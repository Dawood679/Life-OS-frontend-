import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  ShieldAlert,
  Moon,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Flame,
  ArrowRight,
  Clock,
  HeartPulse,
  Brain,
} from "lucide-react";

export default function HumanEAShowcase() {
  const { isDark } = useTheme();
  const [snoozed, setSnoozed] = useState(false);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/3 left-10 w-[500px] h-[400px] rounded-full blur-[140px] opacity-25 ${
            isDark ? "bg-amber-500/20" : "bg-amber-100/60"
          }`}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border mb-4 backdrop-blur-md ${
              isDark
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>PROACTIVE "HUMAN EA" INTELLIGENCE</span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            An AI That Protects You From Burnout.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
              Propose, Don't Impose.
            </span>
          </h2>

          <p
            className={`mt-4 text-sm sm:text-base md:text-lg font-normal leading-relaxed ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            When HealthOS detects high physiological strain (e.g. sleep &lt; 5.5 hours), LifeOS doesn't overload you—it actively negotiates with you to snooze low-priority tasks while safeguarding your daily streak.
          </p>
        </div>

        {/* Interactive EA Simulation Card */}
        <div
          className={`max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 border backdrop-blur-2xl transition-all duration-500 shadow-2xl ${
            isDark
              ? "bg-[#0e131f]/90 border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              : "bg-white/90 border-slate-200 shadow-[0_20px_50px_rgba(99,102,241,0.08)]"
          }`}
        >
          {/* Deficit Alert Banner */}
          <div
            className={`p-5 rounded-2xl border mb-6 transition-all ${
              isDark
                ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Health Deficit Evaluator Triggered
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    Sleep: 4.8h Logged
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold mt-1">
                  "You slept less than 5.5 hours last night. Heavy cognitive overload is not recommended today."
                </h4>
                <p className="text-xs mt-1 leading-relaxed text-slate-400 dark:text-slate-300">
                  Would you like LifeOS to defer 3 low-priority tasks to tomorrow? <strong>Your 14-day streak will remain 100% protected.</strong>
                </p>

                {/* Consent Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {!snoozed ? (
                    <button
                      onClick={() => setSnoozed(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 shadow-md shadow-amber-500/30 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Batch-Snooze (Protect Streak)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSnoozed(false)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Undo / Restore Original Agenda</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Agenda Transformation Visualizer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Today's Live Agenda State:</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Flame className="w-4 h-4" /> 14-Day Streak Safe
              </span>
            </div>

            {/* Task Items */}
            {[
              { title: "Review High Priority System Design Core", priority: "HIGH", snoozed: false },
              { title: "Refactor Database Indexing Schema", priority: "LOW", snoozed: true },
              { title: "Organize Notion Resource Bookmarks", priority: "MEDIUM", snoozed: true },
              { title: "Review 10 Flashcards for CSS Tokens", priority: "LOW", snoozed: true },
            ].map((task, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                  task.snoozed && snoozed
                    ? isDark
                      ? "bg-slate-900/40 border-slate-800 opacity-50 line-through"
                      : "bg-slate-100 border-slate-200 opacity-50 line-through"
                    : isDark
                    ? "bg-[#07090e]/70 border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      task.priority === "HIGH" ? "bg-red-500" : "bg-amber-400"
                    }`}
                  />
                  <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      task.priority === "HIGH"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-slate-700/20 text-slate-400"
                    }`}
                  >
                    {task.priority}
                  </span>
                  {task.snoozed && snoozed && (
                    <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                      Deferred to Tomorrow
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/20 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Autonomous snapshot rollbacks available anytime in 1-click.
            </span>
            <Link
              to="/register"
              className="text-xs font-bold text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Explore AI EA in LifeOS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
