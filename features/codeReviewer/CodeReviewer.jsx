import React, { useEffect, useState } from "react";
import FeatureLayout from "../../src/components/FeatureLayout";

// Define tab keys as constants for better maintainability and to prevent typos
const TAB_KEYS = {
  OVERVIEW: "overview",
  BUGS: "bugs",
  PERFORMANCE: "performance",
  SECURITY: "security",
  BEST_PRACTICES: "bestPractices",
  IMPROVED_CODE: "improvedCode",
};

export default function CodeReviewer() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(TAB_KEYS.OVERVIEW); // Use constants
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Fetch all user code reviews on initial mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/code-review`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.reviews) {
        setReviews(data.reviews);
        if (data.reviews.length > 0) {
          // Fetch full single review detail for the first item
          await fetchReviewDetail(data.reviews[0]._id);
        }
      } else {
        // Handle non-OK responses for review list
        setError(data.message || "Failed to load code reviews.");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error); // Log error
      setError("Unable to connect to server to load code reviews.");
    } finally {
      setInitialFetching(false);
    }
  };

  const fetchReviewDetail = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/code-review/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.review) {
        setSelectedReview(data.review);
      } else {
        setError(data.message || "Failed to fetch complete review details.");
      }
    } catch (error) {
      console.error(`Error fetching review detail for ID ${id}:`, error); // Log error
      setError("Failed to fetch complete review details.");
    }
  };

  const handleReviewCode = async (e) => {
    e?.preventDefault();
    if (!code.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/code-review/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to analyze code.");
        return;
      }

      const newReview = data.codeReview;
      setReviews((prev) => [newReview, ...prev]);
      setSelectedReview(newReview);
      setIsCreatingNew(false);
      setCode("");
      setActiveTab(TAB_KEYS.OVERVIEW); // Use constant
    } catch (error) {
      console.error("Error reviewing code:", error); // Log error
      setError("Unable to connect to AI review engine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this code review?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/code-review/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const updated = reviews.filter((r) => r._id !== id);
        setReviews(updated);
        if (selectedReview?._id === id) {
          if (updated.length > 0) {
            fetchReviewDetail(updated[0]._id);
          } else {
            setSelectedReview(null);
          }
        }
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete review.");
      }
    } catch (error) {
      console.error(`Error deleting review with ID ${id}:`, error); // Log error
      setError("Error attempting to delete review.");
    }
  };

  // Dynamic Tabs definition
  const tabs = [
    { key: TAB_KEYS.OVERVIEW, label: "Overview" },
    {
      key: TAB_KEYS.BUGS,
      label: `Bugs (${selectedReview?.bugs?.length || 0})`, // Use direct length check
    },
    {
      key: TAB_KEYS.PERFORMANCE,
      label: `Performance (${selectedReview?.performanceIssues?.length || 0})`, // Use direct length check
    },
    {
      key: TAB_KEYS.SECURITY,
      label: `Security (${selectedReview?.securityIssues?.length || 0})`, // Use direct length check
    },
    {
      key: TAB_KEYS.BEST_PRACTICES,
      label: "Best Practices",
    },
    {
      key: TAB_KEYS.IMPROVED_CODE,
      label: "Improved Code",
    },
  ];

  // Helper to color-code overall score
  const getScoreBadge = (score) => {
    if (score >= 80) return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
    if (score >= 60) return "bg-amber-500/20 text-amber-300 border-amber-400/30";
    return "bg-rose-500/20 text-rose-300 border-rose-400/30";
  };

  // Section 1: Code Submission Form
  const renderForm = () => (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
      <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto text-center space-y-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
          💻
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
          Paste your snippet for automated AI code review
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Get instantaneous feedback on critical bugs, runtime performance bottlenecks, security vulnerabilities, and cleaner refactoring solutions.
        </p>

        <form onSubmit={handleReviewCode} className="mt-6 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Source Code
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="html/css">HTML / CSS</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <textarea
              rows={10}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste raw code function, class, or module here..."
              disabled={loading}
              className="w-full p-4 text-xs font-mono bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition resize-y"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            {reviews.length > 0 && isCreatingNew && (
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
              disabled={loading || !code.trim()}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Analyzing Code Architecture...
                </>
              ) : (
                <>
                  <span>Review Code</span>
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
    if (!selectedReview) return null;
    const score = selectedReview.overallScore ?? "--";

    return (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
                Language: {selectedReview.language || "javascript"}
              </span>
              <span className="text-xs text-indigo-200">
                • {new Date(selectedReview.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold line-clamp-2">
              {selectedReview.summary || "Code Audit Summary"}
            </h2>
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto shrink-0 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
            <div className="text-center">
              <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Overall Quality</p>
              <div className="flex items-baseline gap-1 justify-center">
                <span className="text-3xl font-black text-white">{score}</span>
                <span className="text-xs text-sky-200">/100</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${getScoreBadge(score)}`}>
              {score >= 80 ? "Pass" : score >= 60 ? "Warning" : "Critical"}
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
        Recent Audits ({reviews.length})
      </h3>

      <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
        {reviews.map((rev) => {
          const isSelected = selectedReview?._id === rev._id;

          return (
            <div
              key={rev._id}
              onClick={async () => {
                setIsCreatingNew(false);
                await fetchReviewDetail(rev._id);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                isSelected
                  ? "bg-indigo-50/80 border-indigo-200/80 shadow-xs ring-2 ring-indigo-200/50"
                  : "bg-white/60 border-slate-200/80 hover:bg-indigo-50/30 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3 pr-2 min-w-0">
                <span
                  className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  {rev.overallScore ?? "—"}
                </span>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {rev.summary ? rev.summary.slice(0, 32) + "..." : "Code Review"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 uppercase font-medium">
                    {rev.language || "js"} • {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(rev._id, e)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 transition cursor-pointer shrink-0"
                title="Delete Code Review"
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

  // Helper to render lists of review findings
  const renderIssuesList = (items, emptyMessage, badgeColor) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <p className="text-sm text-slate-500 italic p-4">{emptyMessage}</p>;
    }

    return (
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.id || idx} // Use a unique ID if available, otherwise fallback to index
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3"
          >
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 mt-0.5 ${badgeColor}`}>
              #{idx + 1}
            </span>
            <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
              {/* Updated to match the schema: line, issue, suggestion */}
              {item.line && <p className="font-bold text-slate-900">Line: {item.line}</p>}
              {item.issue && <p>{item.issue}</p>}
              {item.suggestion && (
                <p className="text-indigo-600 font-medium mt-1">💡 Suggestion: {item.suggestion}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Section 4: Active Tab Content Render
  const renderTabContent = () => {
    if (!selectedReview) return null;

    if (activeTab === TAB_KEYS.OVERVIEW) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Executive Summary
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed p-5 rounded-2xl bg-indigo-50/40 border border-slate-200/70">
              {selectedReview.summary || "No detailed summary available for this code."}
            </p>
          </div>

          {selectedReview.code && (
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Submitted Snippet
              </h4>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 max-h-60">
                <code>{selectedReview.code}</code>
              </pre>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === TAB_KEYS.BUGS) {
      return renderIssuesList(
        selectedReview.bugs,
        "No bugs detected in this review.",
        "bg-rose-100 text-rose-800"
      );
    }

    if (activeTab === TAB_KEYS.PERFORMANCE) {
      return renderIssuesList(
        selectedReview.performanceIssues,
        "No performance bottlenecks found.",
        "bg-amber-100 text-amber-800"
      );
    }

    if (activeTab === TAB_KEYS.SECURITY) {
      return renderIssuesList(
        selectedReview.securityIssues,
        "No security vulnerabilities detected.",
        "bg-purple-100 text-purple-800"
      );
    }

    if (activeTab === TAB_KEYS.BEST_PRACTICES) {
      return renderIssuesList(
        selectedReview.bestPractices,
        "Code adheres well to core best practices.",
        "bg-sky-100 text-sky-800"
      );
    }

    if (activeTab === TAB_KEYS.IMPROVED_CODE) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Refactored & Optimized Code
            </h4>
            {selectedReview.improvedCode && (
              <button
                onClick={() => navigator.clipboard.writeText(selectedReview.improvedCode)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 transition cursor-pointer"
              >
                Copy Code
              </button>
            )}
          </div>

          {selectedReview.improvedCode ? (
            <pre className="p-5 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-[480px]">
              <code>{selectedReview.improvedCode}</code>
            </pre>
          ) : (
            <p className="text-sm text-slate-500 italic p-4">No improved version generated.</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <FeatureLayout
      badgeText="Developer Tooling"
      title="AI Code Reviewer & Auditor"
      subtitle="Powered by Gemini 2.5 Flash • Catch Bugs, Security Hazards & Performance Bottlenecks"
      loading={loading}
      initialFetching={initialFetching}
      error={error}
      setError={setError}
      isCreatingNew={isCreatingNew}
      setIsCreatingNew={setIsCreatingNew}
      hasItems={reviews.length > 0}
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