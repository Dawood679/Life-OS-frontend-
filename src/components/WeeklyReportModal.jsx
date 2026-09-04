import React, { useState, useEffect } from "react";

export default function WeeklyReportModal({ isOpen, onClose }) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchWeeklyReport(false);
    }
  }, [isOpen]);

  const fetchWeeklyReport = async (isRegenerate = false) => {
    try {
      setLoading(true);
      setError("");
      
      const endpoint = isRegenerate 
        ? `${BACKEND_URL}/weekly-report/generate` 
        : `${BACKEND_URL}/weekly-report`;
      
      const res = await fetch(endpoint, {
        method: isRegenerate ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: isRegenerate ? JSON.stringify({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }) : undefined
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setReportData(data.data);
      } else {
        throw new Error(data.message || "Failed to generate weekly life report.");
      }
    } catch (err) {
      console.error("Weekly Report Error:", err);
      setError(err.message || "Unable to connect to LifeOS AI Engine.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!reportData?.report) return;
    const r = reportData.report;
    const s = reportData.stats;
    
    const text = `📊 LIFEOS WEEKLY EXECUTIVE AUDIT (${s?.window?.fromDate} to ${s?.window?.toDate})
Grade: ${r.grade} | 7-Day Avg Life Score: ${s?.lifeScore?.avgScore || 0}/100

📝 Executive Summary:
${r.executiveSummary}

🏆 Top Wins:
${(r.topWins || []).map((w) => `• ${w}`).join("\n")}

⚠️ Productivity Leaks:
${(r.productivityLeaks || []).map((l) => `• ${l}`).join("\n")}

🧘 Burnout Risk: ${r.burnoutAndBalanceRisk?.level?.toUpperCase()} - ${r.burnoutAndBalanceRisk?.assessment}

🎯 Next Week Directives:
• Health: ${r.nextWeekDirectives?.health}
• Learning: ${r.nextWeekDirectives?.learning}
• Career: ${r.nextWeekDirectives?.career}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  const report = reportData?.report;
  const stats = reportData?.stats;

  const getGradeColor = (grade) => {
    if (grade === "A+" || grade === "A") return "from-emerald-500 to-teal-500 text-white border-emerald-400/40";
    if (grade === "B+" || grade === "B") return "from-indigo-500 to-sky-500 text-white border-indigo-400/40";
    if (grade === "C") return "from-amber-500 to-orange-500 text-white border-amber-400/40";
    return "from-rose-500 to-pink-500 text-white border-rose-400/40";
  };

  const getBurnoutColor = (level) => {
    if (level === "low") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (level === "moderate") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Universal Weekly Life Audit
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  AI Synthesis
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {stats?.window?.fromDate && stats?.window?.toDate
                  ? `Period: ${stats.window.fromDate} to ${stats.window.toDate} • 7-Day Multi-Pillar Review`
                  : "7-Day Multi-Pillar Executive Review"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {report?.grade && (
              <div className={`px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r ${getGradeColor(report.grade)} shadow-sm border flex items-center gap-1`}>
                <span className="text-[10px] opacity-80 uppercase tracking-widest">Grade</span>
                <span className="text-sm font-black">{report.grade}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                <div className="w-3 h-3 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">
                Synthesizing Health, Learning & Career Metrics...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => fetchWeeklyReport(true)} className="underline font-bold cursor-pointer">Retry</button>
            </div>
          )}

          {report && !loading && (
            <>
              {/* 4-Pillar Stat Ribbon */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Life Score */}
                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Life Score Avg</span>
                    <span className="text-base">⭐</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-black text-purple-950 dark:text-purple-100 font-serif">
                      {stats?.lifeScore?.avgScore || 0}<span className="text-xs font-medium text-purple-500">/100</span>
                    </div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                      🔥 {stats?.userSummary?.streak || 0} Day Streak
                    </div>
                  </div>
                </div>

                {/* Health & Wellness */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Health & Vitality</span>
                    <span className="text-base">💚</span>
                  </div>
                  <div className="mt-2 space-y-0.5 text-xs text-emerald-950 dark:text-emerald-100 font-bold">
                    <div>💧 {stats?.health?.avgWater || 0} ml / day</div>
                    <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                      😴 {stats?.health?.avgSleep || 0}h sleep • 💊 {stats?.health?.medicineAdherenceRate || 100}% meds
                    </div>
                  </div>
                </div>

                {/* Learning & Skills */}
                <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">Learning & Growth</span>
                    <span className="text-base">📚</span>
                  </div>
                  <div className="mt-2 space-y-0.5 text-xs text-sky-950 dark:text-sky-100 font-bold">
                    <div>🎯 {stats?.learning?.quizzesTaken || 0} Quizzes ({stats?.learning?.avgQuizScore || 0}%)</div>
                    <div className="text-[11px] font-medium text-sky-700 dark:text-sky-300">
                      📑 {stats?.learning?.studyTasksCompleted || 0} study tasks • 🏅 {stats?.learning?.verifiedSkillsCount || 0} badges
                    </div>
                  </div>
                </div>

                {/* Career & Execution */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Career & Action</span>
                    <span className="text-base">💼</span>
                  </div>
                  <div className="mt-2 space-y-0.5 text-xs text-indigo-950 dark:text-indigo-100 font-bold">
                    <div>✅ {stats?.career?.completedTodos || 0}/{stats?.career?.totalTodos || 0} Todos ({stats?.career?.todoCompletionRate || 0}%)</div>
                    <div className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                      📬 {stats?.career?.jobApplicationsSubmitted || 0} apps • 🎙️ {stats?.career?.mockInterviewsTaken || 0} mock tests
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider">✦ Executive Retrospective</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-200">
                  {report.executiveSummary}
                </p>
              </div>

              {/* Top Wins & Productivity Leaks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Wins */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    <span>🏆</span> Top Wins of the Week
                  </div>
                  <ul className="space-y-2">
                    {(report.topWins || []).map((win, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <span>{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Leaks / Bottlenecks */}
                <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <span>⚠️</span> Friction Points & Leaks
                  </div>
                  <ul className="space-y-2">
                    {(report.productivityLeaks || []).map((leak, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>{leak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Burnout & Balance Risk */}
              {report.burnoutAndBalanceRisk && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Balance & Recovery Index:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getBurnoutColor(report.burnoutAndBalanceRisk.level)}`}>
                        {report.burnoutAndBalanceRisk.level} Risk
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {report.burnoutAndBalanceRisk.assessment}
                    </p>
                  </div>
                </div>
              )}

              {/* Next Week Strategic Directives */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs uppercase tracking-wider">
                  <span>🎯</span> Non-Negotiable Directives for Next Week
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100/80 dark:border-indigo-950 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">💚 Health Directive</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                      {report.nextWeekDirectives?.health}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100/80 dark:border-indigo-950 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">📚 Learning Directive</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                      {report.nextWeekDirectives?.learning}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100/80 dark:border-indigo-950 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">💼 Career Directive</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                      {report.nextWeekDirectives?.career}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => fetchWeeklyReport(true)}
            disabled={loading}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>↻</span>
            <span>{loading ? "Regenerating..." : "Regenerate AI Report"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              disabled={!report || loading}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{copied ? "✓ Copied!" : "📋 Copy Summary"}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
