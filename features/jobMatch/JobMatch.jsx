import { useEffect, useState } from "react";
import FeatureLayout from "../../src/components/FeatureLayout";

export default function JobMatch() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobMatches, setJobMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "skills" | "learningPlan" | "recommendations"
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Fetch all user job matches on initial mount
  useEffect(() => {
    fetchJobMatches();
  }, []);

  const fetchJobMatches = async () => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/job-match`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.jobMatches) {
        setJobMatches(data.jobMatches);
        if (data.jobMatches.length > 0) {
          // Fetch full detail for the first item
          fetchJobMatchDetail(data.jobMatches[0]._id);
        }
      }
    } catch {
      setError("Unable to connect to server to load job matches.");
    } finally {
      setInitialFetching(false);
    }
  };

  const fetchJobMatchDetail = async (id) => {
    try {
      setFetchingDetail(true);
      const res = await fetch(`${BACKEND_URL}/job-match/${id}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.jobMatch) {
        setSelectedMatch(data.jobMatch);
      } else {
        setError(data.message || "Failed to load job match details.");
      }
    } catch {
      setError("Error loading selected job match analysis.");
    } finally {
      setFetchingDetail(false);
    }
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!jobDescription.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/job-match/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to analyze job description.");
        return;
      }

      const newMatch = data.jobMatch;
      setJobMatches((prev) => [newMatch, ...prev]);
      setSelectedMatch(newMatch);
      setIsCreatingNew(false);
      setJobDescription("");
      setActiveTab("overview");
    } catch {
      setError("Unable to connect to AI server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this job match result?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/job-match/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const updated = jobMatches.filter((item) => item._id !== id);
        setJobMatches(updated);
        if (selectedMatch?._id === id) {
          if (updated.length > 0) {
            fetchJobMatchDetail(updated[0]._id);
          } else {
            setSelectedMatch(null);
          }
        }
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete job match.");
      }
    } catch {
      setError("Error attempting to delete job match.");
    }
  };

  // Dynamic Tabs definition for FeatureLayout
  const tabs = [
    { key: "overview", label: "Overview" },
    {
      key: "skills",
      label: `Skills Breakdown (${(selectedMatch?.matchedSkills?.length || 0) + (selectedMatch?.missingSkills?.length || 0)})`,
    },
    {
      key: "learningPlan",
      label: `Learning Plan (${selectedMatch?.learningPlan?.length || 0})`,
    },
    {
      key: "recommendations",
      label: `Recommendations (${selectedMatch?.recommendations?.length || 0})`,
    },
  ];

  // Helper for match score styling
  const getScoreBadgeColor = (score = 0) => {
    if (score >= 80) return "bg-emerald-500 text-white";
    if (score >= 60) return "bg-amber-500 text-white";
    return "bg-rose-500 text-white";
  };

  // Section 1: Form Render
  const renderForm = () => (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
      <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl mx-auto text-center space-y-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
          🎯
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
          Analyze Job Match & Skill Gaps
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Paste a target job posting below. LifeOS AI will evaluate your candidate profile against its requirements to calculate your match score, missing skills, and an action plan.
        </p>

        <form onSubmit={handleAnalyze} className="mt-6 space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Job Description / Posting Text
            </label>
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description, key responsibilities, and required qualifications here..."
              disabled={loading}
              className="w-full p-4 text-xs bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition resize-y text-slate-800"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            {jobMatches.length > 0 && isCreatingNew && (
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !jobDescription.trim()}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Evaluating Qualifications...
                </>
              ) : (
                <>
                  <span>Analyze Compatibility</span>
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
  );

  // Section 2: Hero Banner Render
  const renderHero = () => {
    if (!selectedMatch) return null;
    const score = selectedMatch.matchPercentage || 0;

    return (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
              {selectedMatch.company ? `${selectedMatch.company}` : "Job Match Analysis"}
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold line-clamp-2">
              {selectedMatch.jobTitle || "Job Analysis"}
            </h2>
            <p className="text-xs text-indigo-100">
              Analyzed on: {new Date(selectedMatch.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl flex items-center gap-5 self-start md:self-auto shrink-0">
            <div className="text-center">
              <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Match Score</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className={`text-xl font-extrabold px-2 py-0.5 rounded-lg ${getScoreBadgeColor(score)}`}>
                  {score}%
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-center">
              <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Matched / Missing</p>
              <p className="text-base font-bold text-white mt-0.5">
                <span className="text-emerald-300">{selectedMatch.matchedSkills?.length || 0}</span>
                <span className="text-white/60 mx-1">/</span>
                <span className="text-rose-300">{selectedMatch.missingSkills?.length || 0}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Section 3: Sidebar Render
  const renderSidebar = () => (
    <>
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">
        Analyzed Jobs ({jobMatches.length})
      </h3>

      <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
        {jobMatches.map((item) => {
          const isSelected = selectedMatch?._id === item._id;

          return (
            <div
              key={item._id}
              onClick={() => {
                fetchJobMatchDetail(item._id);
                setIsCreatingNew(false);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                isSelected
                  ? "bg-orange-50/70 border-orange-200/80 shadow-xs ring-2 ring-orange-200/50"
                  : "bg-white/60 border-slate-200/80 hover:bg-orange-50/30 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3 pr-2 min-w-0">
                <span
                  className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-extrabold transition-colors ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-xs"
                      : "bg-orange-100/70 text-orange-800"
                  }`}
                >
                  {item.matchPercentage || 0}%
                </span>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {item.jobTitle || "Job Analysis"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.company || "Company not specified"}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(item._id, e)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 transition cursor-pointer shrink-0"
                title="Delete Result"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );

  // Section 4: Active Tab Content Render
  const renderTabContent = () => {
    if (fetchingDetail) {
      return (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400 animate-pulse">Loading job analysis details...</p>
        </div>
      );
    }

    if (!selectedMatch) return null;

    if (activeTab === "overview") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Compatibility Match Summary
            </h4>
            <p className="text-base text-slate-700 leading-relaxed p-5 rounded-2xl bg-orange-50/30 border border-slate-200/70">
              {selectedMatch.matchSummary || "No summary available."}
            </p>
          </div>

          {selectedMatch.jobDescription && (
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Target Job Description
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 max-h-48 overflow-y-auto">
                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                  {selectedMatch.jobDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "skills") {
      return (
        <div className="space-y-6">
          {/* Matched Skills */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <span>✅</span> Matched Skills ({selectedMatch.matchedSkills?.length || 0})
            </h4>
            {Array.isArray(selectedMatch.matchedSkills) && selectedMatch.matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedMatch.matchedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"
                  >
                    {typeof skill === "string" ? skill : skill.name || JSON.stringify(skill)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No direct skill matches found.</p>
            )}
          </div>

          {/* Missing Skills */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚠️</span> Missing Skills ({selectedMatch.missingSkills?.length || 0})
            </h4>
            {Array.isArray(selectedMatch.missingSkills) && selectedMatch.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedMatch.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
                  >
                    {typeof skill === "string" ? skill : skill.name || JSON.stringify(skill)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Great news! No critical missing skills detected.</p>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "learningPlan") {
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Prioritized Learning Plan
          </h4>

          {Array.isArray(selectedMatch.learningPlan) && selectedMatch.learningPlan.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {selectedMatch.learningPlan.map((step, idx) => {
                const title = typeof step === "string" ? step : step.skill || step.title || `Phase ${idx + 1}`;
                const detail = typeof step === "object" ? step.description || step.action : null;
                const time = typeof step === "object" ? step.timeframe || step.duration : null;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-orange-50/30 border border-slate-200/70 flex items-start gap-4 hover:border-orange-200 transition"
                  >
                    <span className="w-7 h-7 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-800">{title}</p>
                        {time && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                            {time}
                          </span>
                        )}
                      </div>
                      {detail && <p className="text-xs text-slate-600 leading-relaxed">{detail}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No specific learning plan provided.</p>
          )}
        </div>
      );
    }

    if (activeTab === "recommendations") {
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Recommendations to Elevate Your Candidate Profile
          </h4>

          {Array.isArray(selectedMatch.recommendations) && selectedMatch.recommendations.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {selectedMatch.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-sky-50/50 border border-slate-200/70 flex items-start gap-3 hover:border-sky-300 transition"
                >
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    💡
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {typeof rec === "string" ? rec : rec.text || JSON.stringify(rec)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No additional recommendations provided.</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <FeatureLayout
      badgeText="CareerOS Hub"
      title="AI Job Match & Gap Analyzer"
      subtitle="Powered by Gemini 2.5 Flash • Intelligent Profile-to-Job Qualification Scoring"
      loading={loading}
      initialFetching={initialFetching}
      error={error}
      setError={setError}
      isCreatingNew={isCreatingNew}
      setIsCreatingNew={setIsCreatingNew}
      hasItems={jobMatches.length > 0}
      renderForm={renderForm}
      renderHero={renderHero}
      renderSidebar={renderSidebar}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      renderTabContent={renderTabContent}
    />
  );
}