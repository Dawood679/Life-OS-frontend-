import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FeatureLayout from "../../src/components/FeatureLayout";

const GOAL_TEMPLATES = [
  "Full-Stack AI SaaS with React & Stripe",
  "Launch a Specialty Coffee Subscription Brand",
  "Pass USMLE / Medical Exam in 90 Days",
  "10k Marathon & 5kg Fat Loss Roadmap",
  "10,000 Subscriber Tech Newsletter",
];

export default function ProjectGenerator() {
  const navigate = useNavigate();
  const location = useLocation();

  // State Management
  const [request, setRequest] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [togglingStep, setTogglingStep] = useState(null);

  // Tabs: Milestones, Resources
  const [activeTab, setActiveTab] = useState("milestones");

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

  // Pre-fill state if redirected from StudyPlan or Roadmap
  useEffect(() => {
    if (location.state?.goal || location.state?.request) {
      setRequest(location.state.goal || location.state.request);
      setIsCreatingNew(true);
    }
  }, [location.state]);

  useEffect(() => {
    fetchProjects(1);
  }, []);

  const fetchProjects = async (page = 1) => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/project-generator?page=${page}&limit=10`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.projects) {
        setProjects(data.projects);
        if (data.pagination) {
          setPagination({
            page: data.pagination.page,
            totalPages: data.pagination.totalPages,
            total: data.pagination.total,
            hasNextPage: data.pagination.page < data.pagination.totalPages,
            hasPrevPage: data.pagination.page > 1,
          });
        }
        if (data.projects.length > 0) {
          fetchProjectDetail(data.projects[0]._id);
        } else {
          setSelectedProject(null);
        }
      } else {
        setError(data.message || "Failed to load action plans.");
      }
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setInitialFetching(false);
    }
  };

  const fetchProjectDetail = async (id) => {
    try {
      setFetchingDetail(true);
      setError("");

      const res = await fetch(`${BACKEND_URL}/project-generator/${id}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.project) {
        setSelectedProject(data.project);
        setActiveTab("milestones");
      } else {
        setError(data.message || "Failed to load plan details.");
      }
    } catch {
      setError("Error loading selected plan details.");
    } finally {
      setFetchingDetail(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProjects(newPage);
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!request.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/project-generator/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ request: request.trim(), goal: request.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.project) {
        setRequest("");
        setIsCreatingNew(false);
        setSelectedProject(data.project);
        fetchProjects(1);
      } else {
        setError(data.message || "Failed to generate action plan.");
      }
    } catch {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMilestone = async (stepNumber) => {
    if (!selectedProject?._id) return;
    setTogglingStep(stepNumber);

    try {
      const res = await fetch(
        `${BACKEND_URL}/project-generator/${selectedProject._id}/milestone/${stepNumber}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (res.ok && data.project) {
        setSelectedProject(data.project);
        setProjects((prev) =>
          prev.map((p) => (p._id === data.project._id ? data.project : p))
        );
      }
    } catch (err) {
      console.error("Error toggling milestone:", err);
    } finally {
      setTogglingStep(null);
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
      const res = await fetch(`${BACKEND_URL}/project-generator/${deleteModal.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        closeDeleteModal();
        fetchProjects(pagination.page);
      } else {
        setError("Failed to delete action plan.");
      }
    } catch {
      setError("Error deleting action plan.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Tabs configuration
  const tabs = [
    { key: "milestones", label: "🎯 Milestone Roadmap" },
    { key: "resources", label: "🛠 Tools & Tech Stack" },
  ];

  // Milestone Progress
  const milestones = selectedProject?.milestones || [];
  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progressPct =
    milestones.length > 0
      ? Math.round((completedCount / milestones.length) * 100)
      : 0;

  // SECTION 1: FORM (renderForm)
  const renderForm = () => (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Create Milestone Action Plan
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Transform any career ambition, software project, startup idea, or academic exam goal into an actionable milestone roadmap.
          </p>
        </div>

        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 hidden sm:inline">
          Milestone Engine
        </span>
      </div>

      {/* Goal Inspiration Chips */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Quick Inspiration Starters</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setRequest(tmpl)}
              className="text-xs text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              ✦ {tmpl}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">
            What do you want to build or achieve?
          </label>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="e.g. 'Build a remote job board with Next.js & Stripe', 'Launch an organic skincare brand in 30 days', 'Prepare for medical licensing board exams'..."
            rows={5}
            className="w-full p-4 rounded-2xl bg-slate-50/70 border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 outline-none transition resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {projects.length > 0 && (
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
            disabled={loading || !request.trim()}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              loading || !request.trim()
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:opacity-95 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Structuring Milestones...
              </>
            ) : (
              <>
                <span>🚀 Generate Action Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // SECTION 2: HERO BANNER (renderHero)
  const renderHero = () => {
    if (!selectedProject) return null;

    return (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                {selectedProject.category || "Action Plan"}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-400/30 text-white text-xs font-bold">
                {selectedProject.difficultyLevel || "Intermediate"}
              </span>
              <span className="text-xs text-sky-100">
                ⏱ {selectedProject.estimatedDuration || "4-6 weeks"}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {selectedProject.planTitle || selectedProject.projectTitle}
            </h2>
            <p className="text-xs text-sky-100 max-w-2xl line-clamp-2 leading-relaxed">
              {selectedProject.description}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
              <p className="text-[10px] uppercase font-bold text-sky-200 tracking-wider">
                Progress
              </p>
              <p className="text-2xl font-extrabold text-white font-serif">
                {progressPct}%
                <span className="text-xs text-sky-200 font-sans ml-1">
                  ({completedCount}/{milestones.length})
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={(e) =>
                openDeleteModal(
                  selectedProject._id,
                  selectedProject.planTitle || selectedProject.projectTitle || "Action Plan",
                  e
                )
              }
              className="p-3 rounded-2xl bg-white/10 hover:bg-rose-500/30 text-white border border-white/20 transition cursor-pointer"
              title="Delete Action Plan"
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

        {/* Full-Width Milestone Progress Bar */}
        <div className="space-y-1.5 z-10 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-sky-100">
            <span>Milestone Execution Progress</span>
            <span>{progressPct}% Completed ({completedCount}/{milestones.length} Milestones)</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  // SECTION 3: SIDEBAR (renderSidebar)
  const renderSidebar = () => (
    <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
      {projects.map((item) => {
        const isSelected = selectedProject?._id === item._id;
        const mList = item.milestones || [];
        const done = mList.filter((m) => m.isCompleted).length;
        const pct = mList.length > 0 ? Math.round((done / mList.length) * 100) : 0;

        return (
          <div
            key={item._id}
            onClick={() => {
              fetchProjectDetail(item._id);
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
                🚀
              </span>
              <div className="truncate">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {item.planTitle || item.projectTitle}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 capitalize">
                    {item.category || "General"}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {pct}% done
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) =>
                openDeleteModal(
                  item._id,
                  item.planTitle || item.projectTitle || "Action Plan",
                  e
                )
              }
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1.5 transition cursor-pointer shrink-0 rounded-lg hover:bg-rose-50"
              title="Delete Plan"
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
            Loading action milestones...
          </p>
        </div>
      );
    }

    if (!selectedProject) return null;

    // 1. Milestones Tab
    if (activeTab === "milestones") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <h4 className="text-sm font-bold text-slate-800">
              Execution Roadmap ({completedCount} of {milestones.length} Done)
            </h4>
            <span className="text-xs text-indigo-600 font-semibold">
              Click milestone to mark progress & boost Life Score
            </span>
          </div>

          <div className="space-y-4">
            {milestones.map((m) => (
              <div
                key={m.stepNumber}
                className={`p-5 md:p-6 rounded-2xl border transition-all shadow-xs space-y-3 ${
                  m.isCompleted
                    ? "bg-emerald-50/40 border-emerald-200/80"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5 ${
                        m.isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      {m.isCompleted ? "✓" : m.stepNumber}
                    </span>

                    <div className="space-y-1">
                      <h5
                        className={`text-sm md:text-base font-bold ${
                          m.isCompleted
                            ? "text-emerald-950 line-through decoration-emerald-500/50"
                            : "text-slate-800"
                        }`}
                      >
                        {m.title}
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleMilestone(m.stepNumber)}
                    disabled={togglingStep === m.stepNumber}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      m.isCompleted
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200"
                        : "bg-white text-slate-700 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 shadow-2xs"
                    }`}
                  >
                    {togglingStep === m.stepNumber ? (
                      "..."
                    ) : m.isCompleted ? (
                      "✓ Completed"
                    ) : (
                      "Mark Complete"
                    )}
                  </button>
                </div>

                {/* Deliverable Badge */}
                {m.deliverable && (
                  <div className="pl-10">
                    <span className="text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 inline-block">
                      📦 <strong>Deliverable:</strong> {m.deliverable}
                    </span>
                  </div>
                )}

                {/* Actionable Checklist */}
                {m.checklist?.length > 0 && (
                  <div className="pl-10 space-y-1.5 pt-1">
                    {m.checklist.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-600 flex items-center gap-2"
                      >
                        <span className="text-indigo-600 font-bold text-sm">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 2. Resources & Tools Tab
    if (activeTab === "resources") {
      return (
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800">
              Recommended Tools & Technology Stack
            </h4>
            <p className="text-xs text-slate-500">
              Essential frameworks, libraries, services, and learning assets suggested for this action plan.
            </p>

            {selectedProject.resourcesOrTools?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {selectedProject.resourcesOrTools.map((tool, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 shadow-xs flex items-center gap-2"
                  >
                    <span className="text-indigo-600">🛠</span>
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No specific tools listed.
              </p>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <FeatureLayout
        title="Action Plan Generator"
        subtitle="Turn Any Ambition, Tech App, Startup Idea, or Exam Goal into an Actionable Milestone Roadmap"
        onBack={() => navigate(-1)}
        loading={loading}
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
        hasItems={projects.length > 0}
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
                Delete Action Plan?
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