import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FeatureLayout from "../../src/components/FeatureLayout";

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner (Fundamentals)" },
  { value: "intermediate", label: "Intermediate (Deepening Mastery)" },
  { value: "advanced", label: "Advanced (High-Yield / Expert)" },
];

const SUGGESTED_TOPICS = [
  "React.js & State Management",
  "Node.js Backend & REST APIs",
  "Financial Modeling & Valuation",
  "Human Anatomy & Physiology",
  "Digital Marketing & SEO Funnels",
];

const TASKS_PER_PAGE = 10;

export default function StudyPlan() {
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [subject, setSubject] = useState("");
  const [currentLevel, setCurrentLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Data & List State
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Pagination for Plans (Sidebar)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Client-side Task Pagination (10 tasks per page)
  const [taskPage, setTaskPage] = useState(1);

  // Tabs: Tasks, Capstone
  const [activeTab, setActiveTab] = useState("tasks");

  // Micro-Quiz Active State
  const [activeMicroQuiz, setActiveMicroQuiz] = useState({
    isOpen: false,
    task: null,
    answers: {},
    result: null,
    isSubmitting: false,
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

  // Check if routed from RoadmapGenerator with state
  useEffect(() => {
    if (location.state?.subject) {
      setSubject(location.state.subject);
      setIsCreatingNew(true);
    }
  }, [location.state]);

  useEffect(() => {
    fetchPlans(1);
  }, []);

  const fetchPlans = async (page = 1) => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/study-plan?page=${page}&limit=10`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.studyPlans) {
        setPlans(data.studyPlans);
        if (data.pagination) {
          setPagination({
            page: data.pagination.currentPage,
            totalPages: data.pagination.totalPages,
            total: data.pagination.totalCount,
            hasNextPage: data.pagination.hasNextPage,
            hasPrevPage: data.pagination.hasPrevPage,
          });
        }
        if (data.studyPlans.length > 0) {
          fetchPlanDetail(data.studyPlans[0]._id);
        } else {
          setSelectedPlan(null);
        }
      } else {
        setError(data.message || "Failed to load study plans.");
      }
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setInitialFetching(false);
    }
  };

  const fetchPlanDetail = async (id) => {
    try {
      setFetchingDetail(true);
      setError("");

      const res = await fetch(`${BACKEND_URL}/study-plan/${id}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.studyPlan) {
        setSelectedPlan(data.studyPlan);
        setTaskPage(1);
        setActiveTab("tasks");
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
      fetchPlans(newPage);
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!subject.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/study-plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subject: subject.trim(),
          currentLevel,
          sourceRoadmapId: location.state?.sourceRoadmapId,
          roadmapPhases: location.state?.roadmapPhases,
        }),
      });

      const data = await res.json();

      if (res.ok && data.studyPlan) {
        setSubject("");
        setIsCreatingNew(false);
        setSelectedPlan(data.studyPlan);
        fetchPlans(1);
      } else {
        setError(data.message || "Failed to generate study plan.");
      }
    } catch {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  // Open Micro-Quiz Modal for a specific task
  const openMicroQuiz = (task) => {
    setActiveMicroQuiz({
      isOpen: true,
      task,
      answers: {},
      result: null,
      isSubmitting: false,
      isRegenerating: false,
    });
  };

  const closeMicroQuiz = () => {
    setActiveMicroQuiz({
      isOpen: false,
      task: null,
      answers: {},
      result: null,
      isSubmitting: false,
      isRegenerating: false,
    });
  };

  const handleAnswerSelect = (qIdx, optKey) => {
    setActiveMicroQuiz((prev) => ({
      ...prev,
      answers: { ...prev.answers, [qIdx]: optKey },
    }));
  };

  const handleRetryRegenerateQuiz = async () => {
    if (!selectedPlan?._id || !activeMicroQuiz.task) return;

    setActiveMicroQuiz((prev) => ({
      ...prev,
      isRegenerating: true,
    }));

    try {
      const res = await fetch(
        `${BACKEND_URL}/study-plan/${selectedPlan._id}/task/${activeMicroQuiz.task.taskNumber}/regenerate-quiz`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (res.ok && data.task) {
        setActiveMicroQuiz((prev) => ({
          ...prev,
          task: data.task,
          answers: {},
          result: null,
          isRegenerating: false,
        }));
      } else {
        setActiveMicroQuiz((prev) => ({
          ...prev,
          result: null,
          answers: {},
          isRegenerating: false,
        }));
      }
    } catch {
      setActiveMicroQuiz((prev) => ({
        ...prev,
        result: null,
        answers: {},
        isRegenerating: false,
      }));
    }
  };

  const submitMicroQuiz = async () => {
    if (!selectedPlan?._id || !activeMicroQuiz.task) return;

    setActiveMicroQuiz((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const res = await fetch(
        `${BACKEND_URL}/study-plan/${selectedPlan._id}/task/${activeMicroQuiz.task.taskNumber}/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ answers: activeMicroQuiz.answers }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setActiveMicroQuiz((prev) => ({
          ...prev,
          result: data,
          isSubmitting: false,
        }));

        if (data.passed && data.studyPlan) {
          setSelectedPlan(data.studyPlan);
          setPlans((prev) =>
            prev.map((p) => (p._id === data.studyPlan._id ? data.studyPlan : p))
          );
        }
      } else {
        setError(data.message || "Verification failed.");
        setActiveMicroQuiz((prev) => ({ ...prev, isSubmitting: false }));
      }
    } catch {
      setError("Network error verifying answers.");
      setActiveMicroQuiz((prev) => ({ ...prev, isSubmitting: false }));
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
      const res = await fetch(`${BACKEND_URL}/study-plan/${deleteModal.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        closeDeleteModal();
        fetchPlans(pagination.page);
      } else {
        setError("Failed to delete study plan.");
      }
    } catch {
      setError("Error deleting study plan.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Tabs configuration
  const tabs = [
    { key: "tasks", label: "📋 Task Execution List" },
    { key: "capstone", label: "🏆 Competency & Capstone" },
  ];

  // Helper task calculations
  const rawTasks = selectedPlan?.tasks || [];
  // Backward compatibility fallback for legacy 7-day plans
  const tasks =
    rawTasks.length > 0
      ? rawTasks
      : (selectedPlan?.dailyPlan || []).flatMap((d, dIdx) =>
          (d.tasks || []).map((tStr, tIdx) => ({
            taskNumber: dIdx * 3 + tIdx + 1,
            title: `Day ${d.day}: ${d.topic || 'Task'}`,
            description: tStr,
            tier: "core_mechanism",
            estimatedMinutes: 30,
            points: 20,
            isCompleted: false,
            microQuiz: [],
          }))
        );

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const earnedPoints = selectedPlan?.earnedPoints || 0;
  const totalPoints = selectedPlan?.totalPoints || Math.max(100, tasks.length * 20);
  const progressPct =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  // Task Pagination Slicing (10 per page)
  const totalTaskPages = Math.ceil(tasks.length / TASKS_PER_PAGE) || 1;
  const visibleTasks = tasks.slice(
    (taskPage - 1) * TASKS_PER_PAGE,
    taskPage * TASKS_PER_PAGE
  );

  const getTierBadge = (tier) => {
    if (tier === "quick_concept") {
      return { label: "⚡ Quick Concept", style: "bg-sky-50 text-sky-700 border-sky-200" };
    }
    if (tier === "hands_on_exercise") {
      return { label: "🛠 Hands-on Exercise", style: "bg-purple-50 text-purple-700 border-purple-200" };
    }
    return { label: "🧠 Core Mechanism", style: "bg-amber-50 text-amber-800 border-amber-200" };
  };

  // SECTION 1: FORM (renderForm)
  const renderForm = () => (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Generate Task-Based Study Blueprint
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Create an actionable, point-tier study plan with embedded 2-question Micro-Quizzes for active recall and Life Score boosts.
          </p>
        </div>

        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 hidden sm:inline">
          Active Learning Engine
        </span>
      </div>

      {/* Suggested Topic Chips */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Quick Inspiration Topics</label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TOPICS.map((topic, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSubject(topic)}
              className="text-xs text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              ✦ {topic}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Subject or Learning Goal
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. React.js Component Lifecycle, Financial Statement Analysis, Physiology..."
              className="w-full p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 outline-none transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Current Level</label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 outline-none transition cursor-pointer"
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {plans.length > 0 && (
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
            disabled={loading || !subject.trim()}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              loading || !subject.trim()
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:opacity-95 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Structuring Tasks & Micro-Quizzes...
              </>
            ) : (
              <>
                <span>📅 Generate Study Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // SECTION 2: HERO BANNER (renderHero)
  const renderHero = () => {
    if (!selectedPlan) return null;

    return (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                {selectedPlan.canonicalSkill || selectedPlan.subject}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-400/30 text-white text-xs font-bold capitalize">
                {selectedPlan.currentLevel || "Beginner"}
              </span>
              <span className="text-xs text-sky-100">
                {tasks.length} Actionable Tasks
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {selectedPlan.planTitle}
            </h2>
            <p className="text-xs text-sky-100 max-w-2xl line-clamp-2 leading-relaxed">
              {selectedPlan.summary || "Structured task-based curriculum for rapid mastery."}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
              <p className="text-[10px] uppercase font-bold text-sky-200 tracking-wider">
                Earned Points
              </p>
              <p className="text-2xl font-extrabold text-white font-serif">
                {earnedPoints}
                <span className="text-xs text-sky-200 font-sans ml-1">
                  / {totalPoints} pts ({progressPct}%)
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={(e) =>
                openDeleteModal(selectedPlan._id, selectedPlan.planTitle, e)
              }
              className="p-3 rounded-2xl bg-white/10 hover:bg-rose-500/30 text-white border border-white/20 transition cursor-pointer"
              title="Delete Plan"
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

        {/* Full-Width Points Progress Bar */}
        <div className="space-y-1.5 z-10 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-sky-100">
            <span>Overall Plan Completion</span>
            <span>{progressPct}% Completed ({completedCount}/{tasks.length} Tasks)</span>
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
      {plans.map((item) => {
        const isSelected = selectedPlan?._id === item._id;
        const itemTasks = item.tasks || [];
        const itemDone = itemTasks.filter((t) => t.isCompleted).length;
        const itemPct =
          item.completionPercentage ||
          (itemTasks.length > 0 ? Math.round((itemDone / itemTasks.length) * 100) : 0);

        return (
          <div
            key={item._id}
            onClick={() => {
              fetchPlanDetail(item._id);
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
                📅
              </span>
              <div className="truncate">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {item.planTitle || item.subject}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 capitalize">
                    {item.canonicalSkill || item.subject}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {itemPct}% done
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => openDeleteModal(item._id, item.planTitle, e)}
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
            Loading study tasks & active quizzes...
          </p>
        </div>
      );
    }

    if (!selectedPlan) return null;

    // 1. Tasks List Tab
    if (activeTab === "tasks") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <h4 className="text-sm font-bold text-slate-800">
              Tasks List ({completedCount} of {tasks.length} Completed)
            </h4>
            <span className="text-xs text-indigo-600 font-semibold">
              Complete task ➔ Pass 2-question Micro-Quiz ➔ Earn Points
            </span>
          </div>

          <div className="space-y-4">
            {visibleTasks.map((t) => {
              const tierInfo = getTierBadge(t.tier);

              return (
                <div
                  key={t.taskNumber}
                  className={`p-5 md:p-6 rounded-2xl border transition-all shadow-xs space-y-3 ${
                    t.isCompleted
                      ? "bg-emerald-50/40 border-emerald-200/80"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5 ${
                          t.isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-indigo-600 text-white"
                        }`}
                      >
                        {t.isCompleted ? "✓" : t.taskNumber}
                      </span>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5
                            className={`text-sm md:text-base font-bold ${
                              t.isCompleted
                                ? "text-emerald-950 line-through decoration-emerald-500/50"
                                : "text-slate-800"
                            }`}
                          >
                            {t.title}
                          </h5>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierInfo.style}`}
                          >
                            {tierInfo.label}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ⏱ {t.estimatedMinutes || 30}m
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    {/* Complete / Verified Button */}
                    <button
                      type="button"
                      onClick={() => openMicroQuiz(t)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        t.isCompleted
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200"
                          : "bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-xs hover:opacity-95 active:scale-95"
                      }`}
                    >
                      {t.isCompleted ? (
                        <>✓ Verified (+{t.points} pts)</>
                      ) : (
                        <>Complete Task ➔</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Client-side Task Pagination (if > 10 tasks) */}
          {totalTaskPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <button
                type="button"
                disabled={taskPage === 1}
                onClick={() => setTaskPage((prev) => Math.max(1, prev - 1))}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Previous Tasks
              </button>

              <span className="text-xs font-bold text-slate-500">
                Page {taskPage} of {totalTaskPages}
              </span>

              <button
                type="button"
                disabled={taskPage === totalTaskPages}
                onClick={() => setTaskPage((prev) => Math.min(totalTaskPages, prev + 1))}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Next Tasks
              </button>
            </div>
          )}
        </div>
      );
    }

    // 2. Capstone & Next Steps Tab
    if (activeTab === "capstone") {
      return (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 via-sky-50/50 to-white border border-indigo-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Mastery Progression
              </span>
              <span className="text-xs font-extrabold text-slate-800 font-mono">
                {earnedPoints} / {totalPoints} Points Earned
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Ready to apply your knowledge in the real world?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Theory is only the first step. To solidify competence, verify your skill with a comprehensive assessment exam or generate an execution action plan with milestone deliverables.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Option 1: Action Plan Capstone */}
              <div
                onClick={() =>
                  navigate("/learning/action-plan", {
                    state: {
                      goal: `Build a real-world project or execution plan for ${selectedPlan.canonicalSkill || selectedPlan.subject}`,
                    },
                  })
                }
                className="p-4 bg-white border border-slate-200/80 rounded-2xl hover:border-emerald-400 hover:shadow-xs transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    🚀 Build Capstone Action Plan
                  </span>
                  <span className="text-xs font-bold text-emerald-600 group-hover:underline">
                    Generate ➔
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Transform this study topic into a chronological deliverable blueprint with milestone checkoffs.
                </p>
              </div>

              {/* Option 2: Skill Exam */}
              <div
                onClick={() =>
                  navigate("/learning/quiz", {
                    state: {
                      topic: selectedPlan.canonicalSkill || selectedPlan.subject,
                      isVerificationMode: true,
                    },
                  })
                }
                className="p-4 bg-white border border-slate-200/80 rounded-2xl hover:border-indigo-400 hover:shadow-xs transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    🏆 Take 10-Question Skill Exam
                  </span>
                  <span className="text-xs font-bold text-indigo-600 group-hover:underline">
                    Start Exam ➔
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Take the official competency assessment for {selectedPlan.canonicalSkill || selectedPlan.subject} to earn a verified profile badge.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <FeatureLayout
        title="AI Study Planner"
        subtitle="Outcome-driven study plans with point tiers, active recall micro-quizzes, and seamless capstone handoffs."
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
        hasItems={plans.length > 0}
      />

      {/* ACTIVE RECALL MICRO-QUIZ MODAL */}
      {activeMicroQuiz.isOpen && activeMicroQuiz.task && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Active Recall Verification • Task #{activeMicroQuiz.task.taskNumber}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeMicroQuiz.task.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeMicroQuiz}
                className="text-slate-400 hover:text-slate-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* If Results are returned */}
            {activeMicroQuiz.result ? (
              <div className="space-y-4 animate-fadeIn">
                <div
                  className={`p-4 rounded-2xl border text-center space-y-1 ${
                    activeMicroQuiz.result.passed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  <p className="text-2xl">{activeMicroQuiz.result.passed ? "🎉" : "💡"}</p>
                  <h4 className="text-base font-bold">
                    {activeMicroQuiz.result.passed
                      ? "Concept Verified!"
                      : "Keep Practicing!"}
                  </h4>
                  <p className="text-xs">
                    {activeMicroQuiz.result.message}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {!activeMicroQuiz.result.passed && (
                    <button
                      type="button"
                      onClick={handleRetryRegenerateQuiz}
                      disabled={activeMicroQuiz.isRegenerating}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      {activeMicroQuiz.isRegenerating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Generating Fresh Questions...
                        </>
                      ) : (
                        "🔄 Retry with Fresh Questions"
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={closeMicroQuiz}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Micro-Quiz Questions */
              <div className="space-y-6">
                {(activeMicroQuiz.task.microQuiz?.length > 0
                  ? activeMicroQuiz.task.microQuiz
                  : [
                      {
                        question: `Did you complete the reading and exercise for: ${activeMicroQuiz.task.title}?`,
                        options: [
                          "A) Yes, fully completed with understanding",
                          "B) Partially completed",
                          "C) Not yet completed",
                          "D) Need to review again",
                        ],
                        correctAnswer: "A",
                      },
                    ]
                ).map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3"
                  >
                    <p className="text-xs font-bold text-slate-800">
                      Q{qIdx + 1}: {q.question}
                    </p>

                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const key = String.fromCharCode(65 + optIdx); // "A", "B", "C", "D"
                        const isSelected =
                          activeMicroQuiz.answers[qIdx] === key ||
                          activeMicroQuiz.answers[qIdx] === opt;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleAnswerSelect(qIdx, key)}
                            className={`p-3 rounded-xl border text-xs text-left transition cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {key}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeMicroQuiz}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={submitMicroQuiz}
                    disabled={activeMicroQuiz.isSubmitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    {activeMicroQuiz.isSubmitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Verifying Answers...
                      </>
                    ) : (
                      "Submit & Claim Points ➔"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold">
              🗑️
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                Delete Study Plan?
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