import React, { useEffect, useState } from "react";
import Input from "../../src/components/ui/Input";

export default function RoadmapGenerator() {
  const [goal, setGoal] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [error, setError] = useState("");
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Fetch Existing Roadmap on Component Mount
  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/roadmap`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.roadmap) {
        setRoadmap(data.roadmap);
      }
    } catch {
      // Backend error or non-existent roadmap
    } finally {
      setInitialFetching(false);
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!goal.trim()) return;

    setError("");
    setLoading(true);

    try {
      const endpoint = isRegenerating
        ? `${BACKEND_URL}/roadmap/regenerate`
        : `${BACKEND_URL}/roadmap/generate`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ goal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to generate roadmap.");
        return;
      }

      setRoadmap(data.roadmap);
      setIsRegenerating(false);
      setGoal("");
      setActivePhaseIndex(0);
    } catch {
      setError("Unable to connect to AI server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate total estimated weeks in a phase
  const getPhaseWeeks = (milestones = []) => {
    return milestones.reduce((sum, m) => sum + (m.estimatedWeeks || 0), 0);
  };

  // Initial Full Screen Fetching Skeleton
  if (initialFetching) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 animate-pulse">
          Retrieving LifeOS AI Roadmap...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-orange-50/30 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                LearningOS Hub
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
              AI Roadmap Generator
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Powered by Gemini 2.5 Flash • Structured Chronological Skill Path
            </p>
          </div>

          {roadmap && !isRegenerating && (
            <button
              onClick={() => setIsRegenerating(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200/80 transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New Goal / Regenerate
            </button>
          )}
        </header>

        {/* ERROR BANNER */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold text-red-800 cursor-pointer">
              ×
            </button>
          </div>
        )}

        {/* CONDITION 1: GOAL FORM (Initial state or regenerating) */}
        {(!roadmap || isRegenerating) && (
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
            <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-xl mx-auto text-center space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
                ✦
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
                What career goal or tech stack do you want to master?
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                LifeOS AI will design a detailed multi-phase roadmap complete with books, courses, documentation, and estimated timelines.
              </p>

              <form onSubmit={handleGenerate} className="mt-6 space-y-4">
                <Input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. UI/UX Designer, Senior React Developer, DevOps Engineer..."
                  disabled={loading}
                />

                <div className="flex gap-2 justify-end">
                  {isRegenerating && (
                    <button
                      type="button"
                      onClick={() => setIsRegenerating(false)}
                      className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !goal.trim()}
                    className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                        Generating Roadmap...
                      </>
                    ) : (
                      <>
                        <span>Generate Roadmap</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CONDITION 2: LOADING SKELETON */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 border border-slate-200 text-center space-y-6 shadow-xl">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                ✦
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Building Structured Learning Path
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Fetching top-rated books, official documentation, and creating chronological milestones...
              </p>
            </div>
          </div>
        )}

        {/* CONDITION 3: ROADMAP DISPLAY */}
        {roadmap && !loading && !isRegenerating && (
          <div className="space-y-6">
            
            {/* HERO HEADER BANNER */}
            <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase">
                    Active Learning Goal
                  </span>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold">
                    {roadmap.title}
                  </h2>
                  <p className="text-xs text-indigo-100">
                    Goal: <span className="font-semibold text-white">{roadmap.goal}</span>
                  </p>
                </div>

                {roadmap.duration && (
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl flex items-center gap-3 self-start md:self-auto">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-sky-200">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">
                        Est. Completion Time
                      </p>
                      <p className="text-xs font-bold text-white">{roadmap.duration}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TWO-COLUMN GRID: PHASE SELECTOR + MILESTONE CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT SIDEBAR: PHASE SELECTOR */}
              <div className="lg:col-span-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                  Phases ({roadmap.phases?.length || 0})
                </h3>

                <div className="space-y-2">
                  {roadmap.phases?.map((phase, idx) => {
                    const isSelected = activePhaseIndex === idx;
                    const phaseWeeks = getPhaseWeeks(phase.milestones);

                    return (
                      <button
                        key={phase._id || idx}
                        onClick={() => setActivePhaseIndex(idx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-orange-50/70 border-orange-200/80 shadow-xs ring-2 ring-orange-200/50"
                            : "bg-white/60 border-slate-200/80 hover:bg-orange-50/30 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                              isSelected
                                ? "bg-orange-500 text-white shadow-xs"
                                : "bg-orange-100/70 text-orange-800"
                            }`}
                          >
                            {phase.phaseNumber || idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800 line-clamp-1">
                              {phase.phaseTitle}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {phase.milestones?.length || 0} Milestones • {phaseWeeks > 0 ? `~${phaseWeeks} wks` : "Flex duration"}
                            </p>
                          </div>
                        </div>

                        <svg
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? "rotate-90 text-orange-600" : "text-slate-400"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT DISPLAY: ACTIVE PHASE & MILESTONE CARDS */}
              <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
                {roadmap.phases?.[activePhaseIndex] && (
                  <>
                    {/* PHASE HEADER */}
                    <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                          Phase {roadmap.phases[activePhaseIndex].phaseNumber || activePhaseIndex + 1}
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 mt-0.5">
                          {roadmap.phases[activePhaseIndex].phaseTitle}
                        </h3>
                      </div>

                      <span className="px-3 py-1 bg-orange-50/80 border border-orange-200/80 text-orange-700 rounded-full text-[11px] font-semibold self-start md:self-auto">
                        ~{getPhaseWeeks(roadmap.phases[activePhaseIndex].milestones)} Weeks Allocated
                      </span>
                    </div>

                    {/* MILESTONES LIST */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Actionable Milestones
                      </h4>

                      <div className="space-y-4">
                        {roadmap.phases[activePhaseIndex].milestones?.map(
                          (milestone, mIdx) => (
                            <div
                              key={milestone._id || mIdx}
                              className="p-5 rounded-2xl bg-orange-50/30 border border-slate-200/70 hover:border-orange-200 hover:bg-orange-50/50 transition-all space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                    {mIdx + 1}
                                  </div>
                                  <h5 className="text-sm font-bold text-slate-800">
                                    {milestone.title}
                                  </h5>
                                </div>

                                {milestone.estimatedWeeks && (
                                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
                                    {milestone.estimatedWeeks} {milestone.estimatedWeeks === 1 ? 'Week' : 'Weeks'}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                                {milestone.description}
                              </p>

                              {/* CURATED RESOURCES LIST */}
                              {milestone.resources && milestone.resources.length > 0 && (
                                <div className="pt-2 pl-8 space-y-2">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Recommended Resources
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {milestone.resources.map((res, rIdx) => {
                                      const isUrl = typeof res === "string" && (res.includes("http") || res.includes(".com") || res.includes(".org"));
                                      return (
                                        <div
                                          key={rIdx}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs"
                                        >
                                          <span className="text-indigo-500 font-bold">📖</span>
                                          {isUrl ? (
                                            <a
                                              href={res.startsWith("http") ? res : `https://${res.split(" ")[0]}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-indigo-600 font-semibold hover:underline"
                                            >
                                              {res}
                                            </a>
                                          ) : (
                                            <span>{res}</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}