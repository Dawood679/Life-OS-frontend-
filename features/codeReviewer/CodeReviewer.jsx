import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FeatureLayout from "../../src/components/FeatureLayout";

const DOMAIN_OPTIONS = [
  { id: "auto", label: "✨ Auto Detect" },
  { id: "code", label: "💻 Code & Architecture" },
  { id: "writing", label: "📝 Essay & Writing" },
  { id: "business", label: "💼 Business Pitch" },
  { id: "academic", label: "🎓 Academic Research" },
];

export default function CodeReviewer() {
  const navigate = useNavigate();

  // State Management
  const [content, setContent] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("auto");
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tabs: Technical, Business, Improved
  const [activeTab, setActiveTab] = useState("technical");

  // Server Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  const BACKEND_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

  useEffect(() => {
    fetchReviews(1);
  }, []);

  const fetchReviews = async (page = 1) => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/code-review?page=${page}&limit=10`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.reviews) {
        setReviews(data.reviews);
        if (data.pagination) {
          setPagination({
            page: data.pagination.page,
            totalPages: data.pagination.totalPages,
            total: data.pagination.totalReviews,
            hasNextPage: data.pagination.page < data.pagination.totalPages,
            hasPrevPage: data.pagination.page > 1,
          });
        }
        if (data.reviews.length > 0) {
          fetchReviewDetail(data.reviews[0]._id);
        } else {
          setSelectedReview(null);
        }
      } else {
        setError(data.message || "Failed to load reviews.");
      }
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setInitialFetching(false);
    }
  };

  const fetchReviewDetail = async (id) => {
    try {
      setFetchingDetail(true);
      setError("");

      const res = await fetch(`${BACKEND_URL}/code-review/${id}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.review) {
        setSelectedReview(data.review);
        // If technical is not applicable but business is, default to business tab
        const techApplicable = data.review.perspectives?.technical?.applicable ?? true;
        const bizApplicable = data.review.perspectives?.business?.applicable ?? false;
        if (!techApplicable && bizApplicable) {
          setActiveTab("business");
        } else {
          setActiveTab("technical");
        }
      } else {
        setError(data.message || "Failed to load review details.");
      }
    } catch {
      setError("Error loading selected review details.");
    } finally {
      setFetchingDetail(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchReviews(newPage);
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!content.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/code-review/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: content.trim(),
          code: content.trim(),
          domain: selectedDomain,
          forcedDomain: selectedDomain !== "auto" ? selectedDomain : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.codeReview) {
        setContent("");
        setIsCreatingNew(false);
        setSelectedReview(data.codeReview);
        fetchReviews(1);
      } else {
        setError(data.message || "Failed to analyze asset.");
      }
    } catch {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id, title, e) => {
    e?.stopPropagation();
    setDeleteModal({ isOpen: true, id, title });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null, title: "" });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`${BACKEND_URL}/code-review/${deleteModal.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        closeDeleteModal();
        fetchReviews(pagination.page);
      } else {
        setError("Failed to delete review.");
      }
    } catch {
      setError("Error deleting review.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tabs configuration
  const tabs = [
    { key: "technical", label: "💻 Technical Lens" },
    { key: "business", label: "💼 Business & Strategy Lens" },
    { key: "improved", label: "✨ Polished Asset Draft" },
  ];

  // SECTION 1: FORM (renderForm)
  const renderForm = () => (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Submit Asset for Multi-Lens Review
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate code architecture, essays, business proposals, and action plans from both technical and business angles in a single AI pass.
          </p>
        </div>

        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 hidden sm:inline">
          Gemini 2.5 Dual-Pass
        </span>
      </div>

      {/* Domain Selector Pills */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Domain Category</label>
        <div className="flex flex-wrap gap-2">
          {DOMAIN_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedDomain(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedDomain === opt.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-1 relative">
          <label className="text-xs font-bold text-slate-700">
            Source Content / Work Draft
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your source code snippet, technical design, essay draft, business proposal, marketing copy, or strategy outline..."
            rows={10}
            className="w-full p-4 rounded-2xl bg-slate-50/70 border border-slate-200 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 outline-none transition resize-none leading-relaxed"
          />
          {content && (
            <span className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-400 bg-white/90 px-2 py-0.5 rounded border border-slate-200">
              {content.length} chars
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {reviews.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              loading || !content.trim()
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:opacity-95 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Evaluating Multi-Perspectives...
              </>
            ) : (
              <>
                <span>✦ Analyze Work & Asset</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // SECTION 2: HERO BANNER (renderHero)
  const renderHero = () => {
    if (!selectedReview) return null;

    return (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
              {selectedReview.domain || "Asset"}
            </span>
            <span className="text-xs text-sky-100">
              {new Date(selectedReview.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {selectedReview.summary || "Asset Quality Analysis"}
          </h2>
          <p className="text-xs text-sky-100 max-w-xl line-clamp-2 leading-relaxed">
            Multi-angle evaluation combining code reliability, structural clarity, and strategic business impact.
          </p>
        </div>

        <div className="flex items-center gap-4 z-10 shrink-0">
          <div className="text-right bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
            <p className="text-[10px] uppercase font-bold text-sky-200 tracking-wider">
              Overall Score
            </p>
            <p className="text-2xl font-extrabold text-white font-serif">
              {selectedReview.overallScore}
              <span className="text-xs text-sky-200 font-sans">/100</span>
            </p>
          </div>

          <button
            type="button"
            onClick={(e) =>
              openDeleteModal(
                selectedReview._id,
                selectedReview.summary || "Asset Review",
                e
              )
            }
            className="p-3 rounded-2xl bg-white/10 hover:bg-rose-500/30 text-white border border-white/20 transition cursor-pointer"
            title="Delete Review"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // SECTION 3: SIDEBAR (renderSidebar)
  const renderSidebar = () => (
    <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
      {reviews.map((item) => {
        const isSelected = selectedReview?._id === item._id;

        return (
          <div
            key={item._id}
            onClick={() => {
              fetchReviewDetail(item._id);
              setIsCreatingNew(false);
            }}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
              isSelected
                ? "bg-indigo-50/70 border-indigo-200/80 shadow-xs ring-2 ring-indigo-200/50"
                : "bg-white/60 border-slate-200/80 hover:bg-slate-50 text-slate-600"
            }`}
          >
            <div className="flex items-center gap-3 pr-2 min-w-0">
              <span
                className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-extrabold transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-indigo-100/70 text-indigo-800"
                }`}
              >
                ✦
              </span>
              <div className="truncate">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {item.summary || item.domain || "Asset Review"}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 uppercase font-medium">
                  {item.domain} • Score: {item.overallScore}/100
                </p>
              </div>
            </div>

            <button
              onClick={(e) =>
                openDeleteModal(item._id, item.summary || "Asset Review", e)
              }
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1.5 transition cursor-pointer shrink-0 rounded-lg hover:bg-rose-50"
              title="Delete Review"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );

  // SECTION 4: TAB CONTENT (renderTabContent)
  const renderTabContent = () => {
    if (fetchingDetail) {
      return (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400 animate-pulse">
            Loading review perspectives...
          </p>
        </div>
      );
    }

    if (!selectedReview) return null;

    const technicalData = selectedReview.perspectives?.technical || {
      applicable: true,
      score: selectedReview.overallScore || 0,
      summary: selectedReview.summary || "",
      issues: selectedReview.bugs || [],
      bestPractices: selectedReview.bestPractices || [],
    };

    const businessData = selectedReview.perspectives?.business || {
      applicable: false,
      score: selectedReview.overallScore || 0,
      summary: "Business analysis available for proposals and strategic drafts.",
      marketClarity: "High Viability",
      suggestions: [],
      actionItems: [],
    };

    // 1. Technical Tab
    if (activeTab === "technical") {
      return (
        <div className="space-y-6">
          {!technicalData.applicable ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-xs">
              ⚠️ Technical lens is not applicable for this conceptual / non-code submission.
            </div>
          ) : (
            <>
              {/* Technical Score Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                    Technical Quality Score
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Evaluates architectural integrity, maintainability, and security.
                  </p>
                </div>
                <span className="text-2xl font-bold font-serif text-indigo-600">
                  {technicalData.score}/100
                </span>
              </div>

              {/* Detected Issues */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800">
                  Detected Issues & Optimizations ({technicalData.issues?.length || 0})
                </h4>

                {(!technicalData.issues || technicalData.issues.length === 0) ? (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl font-medium">
                    ✓ Clean pass! No critical bugs or security risks detected.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {technicalData.issues.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {item.lineOrSection || item.line || `Issue #${idx + 1}`}
                          </span>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            Needs Attention
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.issue}
                        </p>
                        {item.suggestion && (
                          <p className="text-xs text-indigo-600 font-medium pt-1 border-t border-slate-100">
                            💡 <strong>Fix:</strong> {item.suggestion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Best Practices */}
              {technicalData.bestPractices?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800">
                    Recommended Best Practices
                  </h4>
                  <div className="space-y-2">
                    {technicalData.bestPractices.map((bp, i) => (
                      <div
                        key={i}
                        className="text-xs text-slate-700 flex items-start gap-2 bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100/60"
                      >
                        <span className="text-indigo-600 font-bold">✓</span>
                        <span>{typeof bp === "string" ? bp : bp.suggestion || bp.issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // 2. Business & Strategy Tab
    if (activeTab === "business") {
      return (
        <div className="space-y-6">
          {!businessData.applicable ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-xs">
              ℹ️ This submission was processed as a technical script. High-level strategic impacts are summarized in the overview.
            </div>
          ) : (
            <>
              {/* Market Clarity Score */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                    Market & Value Proposition Clarity
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {businessData.marketClarity || "High Viability"}
                  </p>
                </div>
                <span className="text-2xl font-bold font-serif text-sky-700">
                  {businessData.score}/100
                </span>
              </div>

              {/* Suggestions */}
              {businessData.suggestions?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800">
                    Value & Persuasion Improvements
                  </h4>
                  <div className="space-y-2">
                    {businessData.suggestions.map((sug, i) => (
                      <div
                        key={i}
                        className="p-3.5 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-700 shadow-xs"
                      >
                        💡 {sug}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {businessData.actionItems?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800">
                    Priority Strategic Action Items
                  </h4>
                  <div className="space-y-2">
                    {businessData.actionItems.map((act, i) => (
                      <div
                        key={i}
                        className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950 font-medium flex items-center gap-2"
                      >
                        <span>🚀</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // 3. Polished Version Tab
    if (activeTab === "improved") {
      const codeOrContent = selectedReview.improvedContent || selectedReview.improvedCode;

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">
              AI Upgraded & Polished Output
            </h4>
            {codeOrContent && (
              <button
                type="button"
                onClick={() => handleCopy(codeOrContent)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1.5"
              >
                {copied ? "✓ Copied!" : "📋 Copy Version"}
              </button>
            )}
          </div>

          {codeOrContent ? (
            <pre className="p-5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800">
              {codeOrContent}
            </pre>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              No alternate draft provided for this submission.
            </p>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <FeatureLayout
        title="Work & Asset Analyzer"
        subtitle="AI Multi-Perspective Analysis for Code, Essays, Business Proposals & Strategy Plans"
        onBack={() => navigate(-1)}
        error={error}
        setError={setError}
        initialFetching={initialFetching}
        isCreatingNew={isCreatingNew}
        setIsCreatingNew={setIsCreatingNew}
        renderForm={renderForm}
        renderHero={renderHero}
        renderSidebar={renderSidebar}
        pagination={pagination}
        onPageChange={handlePageChange}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderTabContent={renderTabContent}
        hasItems={reviews.length > 0}
      />

      {/* Reusable Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold">
              🗑️
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                Delete Asset Review?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-700">
                  "{deleteModal.title}"
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}