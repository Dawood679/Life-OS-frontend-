import { useEffect, useState } from "react";
import FeatureLayout from "../../src/components/FeatureLayout";
import { useNavigate } from "react-router-dom";

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState(""); // optional
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "skills" | "ats" | "suggestions"
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Fetch all past resume analyses on initial mount
  useEffect(() => {
    fetchResumeAnalyses();
  }, []);

  const fetchResumeAnalyses = async () => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/resume`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.analyses) {
        setAnalyses(data.analyses);
        if (data.analyses.length > 0) {
          fetchAnalysisDetail(data.analyses[0]._id);
        }
      }
    } catch {
      setError("Unable to connect to server to load resume analyses.");
    } finally {
      setInitialFetching(false);
    }
  };

  const fetchAnalysisDetail = async (id) => {
    try {
      setFetchingDetail(true);
      const res = await fetch(`${BACKEND_URL}/resume/${id}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.analysis) {
        setSelectedAnalysis(data.analysis);
      } else {
        setError(data.message || "Failed to load resume analysis details.");
      }
    } catch {
      setError("Error loading selected resume analysis.");
    } finally {
      setFetchingDetail(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported for resume upload.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Resume file is too large. Max size is 5MB.");
      return;
    }

    setError("");
    setResumeFile(file);
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!resumeFile) return;

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription.trim());
      }

      // NOTE: no "Content-Type" header here — the browser sets the correct
      // multipart/form-data boundary automatically for FormData bodies.
      const res = await fetch(`${BACKEND_URL}/resume/analyze`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to analyze resume.");
        return;
      }

      const newAnalysis = data.resumeAnalysis;
      setAnalyses((prev) => [newAnalysis, ...prev]);
      setSelectedAnalysis(newAnalysis);
      setIsCreatingNew(false);
      setResumeFile(null);
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
    if (!window.confirm("Are you sure you want to delete this resume analysis?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/resume/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const updated = analyses.filter((item) => item._id !== id);
        setAnalyses(updated);
        if (selectedAnalysis?._id === id) {
          if (updated.length > 0) {
            fetchAnalysisDetail(updated[0]._id);
          } else {
            setSelectedAnalysis(null);
          }
        }
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete resume analysis.");
      }
    } catch {
      setError("Error attempting to delete resume analysis.");
    }
  };

  // Dynamic Tabs definition for FeatureLayout
  const tabs = [
    { key: "overview", label: "Overview" },
    {
      key: "skills",
      label: `Skills Breakdown (${(selectedAnalysis?.matchedSkills?.length || 0) + (selectedAnalysis?.missingSkills?.length || 0)})`,
    },
    {
      key: "ats",
      label: `ATS Issues (${selectedAnalysis?.atsIssues?.length || 0})`,
    },
    {
      key: "suggestions",
      label: `Suggestions (${selectedAnalysis?.improvementSuggestions?.length || 0})`,
    },
  ];

  // Helper for score styling
  const getScoreBadgeColor = (score = 0) => {
    if (score >= 80) return "bg-emerald-500 text-white";
    if (score >= 60) return "bg-amber-500 text-white";
    return "bg-rose-500 text-white";
  };

  const getScoreBarColor = (score = 0) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const priorityBadge = (priority) => {
    const map = {
      high: "bg-rose-50 border-rose-200 text-rose-700",
      medium: "bg-amber-50 border-amber-200 text-amber-700",
      low: "bg-slate-50 border-slate-200 text-slate-600",
    };
    return map[priority?.toLowerCase()] || map.low;
  };

  // Section 1: Form Render
  const renderForm = () => (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
      <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl mx-auto text-center space-y-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
          📄
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
          Analyze Your Resume
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Upload your resume as a PDF. LifeOS AI will score it like an ATS + recruiter would,
          flag missing skills, and give you prioritized improvement suggestions.
        </p>

        <form onSubmit={handleAnalyze} className="mt-6 space-y-4 text-left">
          {/* File upload */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Resume (PDF only, max 5MB)
            </label>
            <label
              htmlFor="resume-upload"
              className={`w-full flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition ${
                resumeFile
                  ? "border-indigo-300 bg-indigo-50/40"
                  : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30"
              }`}
            >
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {resumeFile ? (
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-800">{resumeFile.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB — click to change
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600">Click to upload your resume</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF only</p>
                </div>
              )}
              <input
                id="resume-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>

          {/* Optional job description */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Target Job Description <span className="text-slate-300 normal-case font-medium">(optional)</span>
            </label>
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a specific job description to tailor the missing skills & keyword analysis to that role. Leave blank for a general analysis."
              disabled={loading}
              className="w-full p-4 text-xs bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition resize-y text-slate-800"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            {analyses.length > 0 && isCreatingNew && (
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
              disabled={loading || !resumeFile}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Scanning Resume...
                </>
              ) : (
                <>
                  <span>Analyze Resume</span>
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
    if (!selectedAnalysis) return null;
    const score = selectedAnalysis.atsScore || 0;

    return (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
              Resume Analysis
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold line-clamp-2">
              {selectedAnalysis.fileName || "Resume"}
            </h2>
            <p className="text-xs text-indigo-100">
              Analyzed on: {new Date(selectedAnalysis.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl flex items-center gap-5 self-start md:self-auto shrink-0">
            <div className="text-center">
              <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">ATS Score</p>
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
                <span className="text-emerald-300">{selectedAnalysis.matchedSkills?.length || 0}</span>
                <span className="text-white/60 mx-1">/</span>
                <span className="text-rose-300">{selectedAnalysis.missingSkills?.length || 0}</span>
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
        Past Analyses ({analyses.length})
      </h3>

      <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
        {analyses.map((item) => {
          const isSelected = selectedAnalysis?._id === item._id;

          return (
            <div
              key={item._id}
              onClick={() => {
                fetchAnalysisDetail(item._id);
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
                  {item.atsScore || 0}%
                </span>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {item.fileName || "Resume"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
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
          <p className="text-xs font-semibold text-slate-400 animate-pulse">Loading resume analysis details...</p>
        </div>
      );
    }

    if (!selectedAnalysis) return null;

    if (activeTab === "overview") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Analysis Summary
            </h4>
            <p className="text-base text-slate-700 leading-relaxed p-5 rounded-2xl bg-orange-50/30 border border-slate-200/70">
              {selectedAnalysis.summary || "No summary available."}
            </p>
          </div>

          {/* ATS Breakdown bars */}
          {selectedAnalysis.atsBreakdown && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                ATS Score Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(selectedAnalysis.atsBreakdown).map(([key, value]) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="font-bold text-slate-800">{value}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getScoreBarColor(value)}`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {Array.isArray(selectedAnalysis.strengths) && selectedAnalysis.strengths.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <span>💪</span> Strengths
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedAnalysis.strengths.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 text-sm text-slate-700"
                  >
                    {s}
                  </div>
                ))}
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
              <span>✅</span> Matched Skills ({selectedAnalysis.matchedSkills?.length || 0})
            </h4>
            {Array.isArray(selectedAnalysis.matchedSkills) && selectedAnalysis.matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedAnalysis.matchedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No clearly matched skills found.</p>
            )}
          </div>

          {/* Missing Skills */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚠️</span> Missing Skills ({selectedAnalysis.missingSkills?.length || 0})
            </h4>
            {Array.isArray(selectedAnalysis.missingSkills) && selectedAnalysis.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedAnalysis.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No critical missing skills detected.</p>
            )}
          </div>

          {/* Recommended Keywords */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔑</span> Recommended Keywords ({selectedAnalysis.recommendedKeywords?.length || 0})
            </h4>
            {Array.isArray(selectedAnalysis.recommendedKeywords) && selectedAnalysis.recommendedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedAnalysis.recommendedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No additional keyword suggestions.</p>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "ats") {
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            ATS Parsing Issues
          </h4>

          {Array.isArray(selectedAnalysis.atsIssues) && selectedAnalysis.atsIssues.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {selectedAnalysis.atsIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/60 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    !
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed">{issue}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No major ATS parsing issues detected.</p>
          )}
        </div>
      );
    }

    if (activeTab === "suggestions") {
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Prioritized Improvement Suggestions
          </h4>

          {Array.isArray(selectedAnalysis.improvementSuggestions) && selectedAnalysis.improvementSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {selectedAnalysis.improvementSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-orange-50/30 border border-slate-200/70 space-y-2 hover:border-orange-200 transition"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-7 h-7 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-bold text-slate-800">{item.area}</p>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${priorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-9">
                    <span className="font-semibold text-slate-600">Issue: </span>{item.issue}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed pl-9">
                    <span className="font-semibold text-slate-600">Suggestion: </span>{item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No specific improvement suggestions provided.</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <FeatureLayout
      badgeText="CareerOS Hub"
      title="AI Resume Analyzer"
      subtitle="Powered by Gemini 2.5 Flash • ATS Scoring, Skill Gaps & Improvement Suggestions"
      onBack={() => navigate("/dashboard")}
      loading={loading}
      initialFetching={initialFetching}
      error={error}
      setError={setError}
      isCreatingNew={isCreatingNew}
      setIsCreatingNew={setIsCreatingNew}
      hasItems={analyses.length > 0}
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