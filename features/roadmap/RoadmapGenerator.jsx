import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FeatureLayout from "../../src/components/FeatureLayout";
import {
  Compass,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Mic,
  HelpCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Clock,
  Briefcase,
  Code2,
  Flame,
  ChevronRight,
  Zap,
  Target,
  RotateCw
} from "lucide-react";

export default function RoadmapGenerator() {
  const navigate = useNavigate();

  // State Management
  const [goal, setGoal] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmapIndex, setActiveRoadmapIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [error, setError] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [bridgingMilestoneId, setBridgingMilestoneId] = useState(null);

  // Server Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRoadmaps, setTotalRoadmaps] = useState(0);
  const itemsPerPage = 10;

  // Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roadmapToDeleteIndex, setRoadmapToDeleteIndex] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  const BACKEND_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

  useEffect(() => {
    fetchRoadmaps(currentPage);
  }, [currentPage]);

  const fetchRoadmaps = async (page = 1) => {
    try {
      setInitialFetching(true);
      const res = await fetch(
        `${BACKEND_URL}/roadmap?page=${page}&limit=${itemsPerPage}`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (res.ok && data.roadmaps) {
        const list = Array.isArray(data.roadmaps) ? data.roadmaps : [];
        setRoadmaps(list);
        setActiveRoadmapIndex(0);

        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalRoadmaps(data.pagination.totalRoadmaps || list.length);
        }
      }
    } catch {
      setError("Failed to load roadmaps.");
    } finally {
      setInitialFetching(false);
    }
  };

  const paginationConfig = {
    page: currentPage,
    totalPages: totalPages,
    total: totalRoadmaps,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Generate 90-Day Transformation Roadmap
  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!goal.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ goal: goal.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to generate roadmap.");
        return;
      }

      if (data.roadmap) {
        setRoadmaps((prev) => [data.roadmap, ...prev]);
        setActiveRoadmapIndex(0);
        setIsCreatingNew(false);
        setGoal("");
        toast.success("90-Day Transformation Blueprint created! 🚀");
      } else {
        fetchRoadmaps(1);
      }
    } catch {
      setError("Unable to connect to AI server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Milestone Completion
  const handleToggleMilestone = async (phaseNumber, milestoneId) => {
    const activeRoadmap = roadmaps[activeRoadmapIndex];
    if (!activeRoadmap?._id) return;

    // Optimistic Update
    const updatedRoadmaps = [...roadmaps];
    const targetRoadmap = { ...updatedRoadmaps[activeRoadmapIndex] };
    const phase = targetRoadmap.phases?.find((p) => p.phaseNumber === phaseNumber);
    if (!phase || !Array.isArray(phase.milestones)) return;
    const milestone = phase.milestones.find((m) => m._id === milestoneId);
    if (!milestone) return;

    const previousState = milestone.isCompleted;
    milestone.isCompleted = !previousState;
    setRoadmaps(updatedRoadmaps);

    try {
      const res = await fetch(
        `${BACKEND_URL}/roadmap/${targetRoadmap._id}/phases/${phaseNumber}/milestones/${milestoneId}/toggle`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (res.ok) {
        if (!previousState) {
          toast.success("Milestone achieved! +Life Score points earned 🔥");
        } else {
          toast("Milestone unmarked.");
        }
      } else {
        // Rollback
        milestone.isCompleted = previousState;
        setRoadmaps([...roadmaps]);
        toast.error(data.message || "Failed to update milestone.");
      }
    } catch {
      milestone.isCompleted = previousState;
      setRoadmaps([...roadmaps]);
      toast.error("Network error updating milestone.");
    }
  };

  // 1-Click Action Bridge: Add Milestone to Active Agenda
  const handleBridgeToTodo = async (phaseNumber, milestoneId) => {
    const activeRoadmap = roadmaps[activeRoadmapIndex];
    if (!activeRoadmap?._id) return;

    try {
      setBridgingMilestoneId(milestoneId);
      const res = await fetch(
        `${BACKEND_URL}/roadmap/${activeRoadmap._id}/phases/${phaseNumber}/milestones/${milestoneId}/bridge-todo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ priority: "high" }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        // Optimistically update milestone state
        const updatedRoadmaps = [...roadmaps];
        const targetRoadmap = { ...updatedRoadmaps[activeRoadmapIndex] };
        const phase = targetRoadmap.phases?.find((p) => p.phaseNumber === phaseNumber);
        const milestone = phase?.milestones?.find((m) => m._id === milestoneId);
        if (milestone) {
          milestone.isBridgedToTodo = true;
          setRoadmaps(updatedRoadmaps);
        }

        if (data.alreadyExists) {
          toast("This milestone is already on your active Agenda! 📅", { icon: "ℹ️" });
        } else {
          toast.success("Scheduled directly to your Today's Agenda / 7-Day Horizon! 📅");
        }
      } else {
        toast.error(data.message || "Failed to schedule milestone.");
      }
    } catch {
      toast.error("Network error scheduling milestone.");
    } finally {
      setBridgingMilestoneId(null);
    }
  };

  // Delete Roadmap
  const handleDeleteRoadmap = async () => {
    if (roadmapToDeleteIndex === null) return;
    setIsDeleting(true);
    setError("");

    const targetRoadmap = roadmaps[roadmapToDeleteIndex];

    try {
      if (targetRoadmap?._id) {
        await fetch(`${BACKEND_URL}/roadmap/${targetRoadmap._id}`, {
          method: "DELETE",
          credentials: "include",
        });
      }

      setShowDeleteModal(false);
      setRoadmapToDeleteIndex(null);
      toast.success("Roadmap deleted.");
      fetchRoadmaps(currentPage);
    } catch {
      setError("Failed to delete roadmap.");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeRoadmap = roadmaps[activeRoadmapIndex] || null;

  // Calculate Roadmap Progress Analytics
  const progressStats = useMemo(() => {
    if (!activeRoadmap?.phases || !Array.isArray(activeRoadmap.phases)) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    let total = 0;
    let completed = 0;

    activeRoadmap.phases.forEach((phase) => {
      if (phase && Array.isArray(phase.milestones)) {
        total += phase.milestones.length;
        completed += phase.milestones.filter((m) => m && m.isCompleted).length;
      }
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [activeRoadmap]);

  // 1. INPUT FORM
  const renderForm = () => (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 md:p-10 shadow-xs relative overflow-hidden transition-all text-left">
      <div className="max-w-2xl mx-auto space-y-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
            90-Day Transformation Architecture
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-serif font-black text-slate-900 tracking-tight">
          Generate a 90-Day Career & Skill Transformation Blueprint
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Enter your target job role or mastery goal. AI will design a 3-month milestone strategy (Foundation ➔ Proof-of-Work Capstones ➔ Interview Dominance) connected with your Study Planner and Job Tracker.
        </p>

        <form onSubmit={handleGenerate} className="mt-6 space-y-4 text-left">
          <input
            type="text"
            required
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Senior Backend Engineer, Lead Product Designer, Machine Learning Engineer..."
            disabled={loading}
            className="w-full p-4 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800 placeholder-slate-400"
          />

          <div className="flex gap-2 justify-end pt-2">
            {roadmaps.length > 0 && isCreatingNew && (
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2.5 text-xs text-slate-600 hover:text-slate-800 font-medium rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !goal.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-indigo via-sky-500 to-sky-400 hover:opacity-95 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? "Designing 90-Day Strategy..." : "Generate 90-Day Blueprint"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 2. ACTIVE 90-DAY ROADMAP VIEW
  const renderActiveRoadmap = () => {
    if (!activeRoadmap) return null;
    const safePhases = Array.isArray(activeRoadmap.phases) ? activeRoadmap.phases : [];

    return (
      <div className="space-y-6 text-left">
        {/* ROADMAP HERO SUMMARY CARD */}
        <div className="bg-gradient-to-br from-white/95 via-sky-50/40 to-indigo-50/30 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                  🎯 90-Day Transformation Horizon
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {activeRoadmap.duration || "90 Days (3 Months)"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 tracking-tight">
                {activeRoadmap.title}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Goal: <strong className="text-indigo-900">{activeRoadmap.goal}</strong>
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setIsCreatingNew(true)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>New Roadmap</span>
              </button>
            </div>
          </div>

          {/* PROGRESS ANALYTICS BAR */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Transformation Progress: {progressStats.completed} / {progressStats.total} Milestones</span>
              </span>
              <span className="text-brand-indigo font-black text-sm">{progressStats.percentage}% Completed</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/70">
              <div
                className="bg-gradient-to-r from-brand-indigo via-sky-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, progressStats.percentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3 STRATEGIC PHASES (MONTH 1, MONTH 2, MONTH 3) */}
        <div className="space-y-6">
          {safePhases.map((phase, pIdx) => {
            const phaseNumber = phase.phaseNumber || pIdx + 1;
            const phaseSubtitle =
              phaseNumber === 1
                ? "Month 1 • Weeks 1-4 • Foundation & Core Principles"
                : phaseNumber === 2
                ? "Month 2 • Weeks 5-8 • Proof-of-Work & Portfolio Capstones"
                : "Month 3 • Weeks 9-12 • Market Velocity, Mock Interviews & Offer Pitch";

            const phaseBadgeColor =
              phaseNumber === 1
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : phaseNumber === 2
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200";

            const safeMilestones = Array.isArray(phase.milestones) ? phase.milestones : [];

            return (
              <div
                key={phase._id || pIdx}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5"
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${phaseBadgeColor}`}>
                        Phase {phaseNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{phaseSubtitle}</span>
                    </div>
                    <h3 className="text-lg font-serif font-black text-slate-900 tracking-tight">
                      {phase.phaseTitle}
                    </h3>
                  </div>

                  <span className="text-xs font-bold text-slate-500 self-start sm:self-auto">
                    {safeMilestones.filter((m) => m && m.isCompleted).length} / {safeMilestones.length} Done
                  </span>
                </div>

                {/* Milestones Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeMilestones.map((milestone) => {
                    if (!milestone) return null;
                    const isBridging = bridgingMilestoneId === milestone._id;

                    return (
                      <div
                        key={milestone._id || Math.random()}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
                          milestone.isCompleted
                            ? "bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-500/20"
                            : "bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-indigo-200 hover:shadow-2xs"
                        }`}
                      >
                        {/* Milestone Top Row */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <button
                                onClick={() => handleToggleMilestone(phaseNumber, milestone._id)}
                                className="mt-0.5 text-slate-300 hover:text-emerald-600 transition cursor-pointer shrink-0"
                                title={milestone.isCompleted ? "Mark incomplete" : "Mark milestone complete"}
                              >
                                {milestone.isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <Circle className="w-5 h-5 hover:scale-110 transition" />
                                )}
                              </button>

                              <div>
                                <h4
                                  className={`text-sm font-bold tracking-tight ${
                                    milestone.isCompleted ? "text-emerald-950 line-through opacity-80" : "text-slate-900"
                                  }`}
                                >
                                  {milestone.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  Est. {milestone.estimatedWeeks || 1} {milestone.estimatedWeeks === 1 ? "Week" : "Weeks"}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                                milestone.category === "project"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : milestone.category === "interview"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-sky-50 text-sky-700 border border-sky-200"
                              }`}
                            >
                              {milestone.category || "Milestone"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-normal pl-7">
                            {milestone.description}
                          </p>

                          {/* Recommended Resources */}
                          {Array.isArray(milestone.resources) && milestone.resources.length > 0 && (
                            <div className="pl-7 flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="text-[10px] font-bold text-slate-400">Resources:</span>
                              {milestone.resources.map((res, rIdx) => (
                                <span
                                  key={rIdx}
                                  className="text-[10px] font-semibold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100"
                                >
                                  {res}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* ⚡ 1-CLICK CROSS-MODULE ACTION BRIDGES */}
                        <div className="pt-3 border-t border-slate-200/60 pl-7 flex items-center gap-1.5 flex-wrap">
                          {/* 1. Bridge to Study Plan */}
                          <button
                            onClick={() =>
                              navigate("/learning/study-plan", {
                                state: {
                                  subject: milestone.actionBridge?.studyTopic || `${activeRoadmap.goal}: ${milestone.title}`,
                                  initialGoal: milestone.actionBridge?.studyTopic || `${activeRoadmap.goal}: ${milestone.title}`
                                },
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                            title="Generate a focused study curriculum for this topic"
                          >
                            <BookOpen className="w-3 h-3 text-sky-600" />
                            <span>Study Plan</span>
                          </button>

                          {/* 2. Bridge to Mock Interview */}
                          <button
                            onClick={() =>
                              navigate("/career/mock-interview", {
                                state: {
                                  roleTitle: activeRoadmap.goal,
                                  targetRole: activeRoadmap.goal,
                                  customTopic: milestone.actionBridge?.interviewTopic || milestone.title
                                },
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                            title="Launch AI Mock Interview drill on this topic"
                          >
                            <Mic className="w-3 h-3 text-indigo-600" />
                            <span>Mock Interview</span>
                          </button>

                          {/* 3. Bridge to Quiz */}
                          <button
                            onClick={() =>
                              navigate("/learning/quiz", {
                                state: {
                                  topic: milestone.actionBridge?.quizTopic || milestone.title,
                                  initialTopic: milestone.actionBridge?.quizTopic || milestone.title,
                                  isVerificationMode: true
                                },
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                            title="Verify mastery with AI Quiz (+Verified Skill Badge on 80%+)"
                          >
                            <HelpCircle className="w-3 h-3 text-emerald-600" />
                            <span>Verify Quiz</span>
                          </button>

                          {/* 4. Bridge to Project Action Plan */}
                          <button
                            onClick={() =>
                              navigate("/learning/action-plan", {
                                state: {
                                  goal: `${activeRoadmap.goal}: ${milestone.actionBridge?.capstoneTitle || milestone.title}`,
                                  title: `${activeRoadmap.goal}: ${milestone.actionBridge?.capstoneTitle || milestone.title}`
                                },
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                            title="Generate a full tech stack and milestone blueprint for this project"
                          >
                            <Code2 className="w-3 h-3 text-purple-600" />
                            <span>Action Plan</span>
                          </button>

                          {/* 4. Schedule Directly to Agenda */}
                          {milestone.isBridgedToTodo ? (
                            <span
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition flex items-center gap-1 ml-auto cursor-default"
                              title="Already scheduled on your active agenda"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>In Agenda</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleBridgeToTodo(phaseNumber, milestone._id)}
                              disabled={isBridging}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ml-auto disabled:opacity-50 active:scale-95"
                              title="Push milestone into today's active tasks"
                            >
                              <Calendar className="w-3 h-3 text-indigo-600" />
                              <span>{isBridging ? "Scheduling..." : "+ Agenda"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <FeatureLayout
      badgeText="90-Day Strategy"
      title="90-Day Career & Skill Transformation Roadmap"
      subtitle="Design and execute strategic 3-month blueprints with 1-click cross-module bridges to Study Planner, AI Mock Interviews, and Verified Skills."
      onBack={() => navigate(-1)}
      backTooltip="Back to Dashboard"
      hasItems={roadmaps.length > 0}
      initialFetching={initialFetching}
      loading={loading}
      error={error}
      setError={setError}
      isCreatingNew={isCreatingNew}
      setIsCreatingNew={setIsCreatingNew}
      onDelete={() => {
        setRoadmapToDeleteIndex(activeRoadmapIndex);
        setShowDeleteModal(true);
      }}
      pagination={paginationConfig}
      onPageChange={handlePageChange}
    >
      {/* 1. LOADING PROGRESS STATE */}
      {loading ? (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-12 border border-slate-200/90 text-center space-y-5 shadow-xs animate-fadeIn">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
              🧭
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Architecting 90-Day Transformation Blueprint...</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Synthesizing Month 1 (Foundations), Month 2 (Proof-of-Work Capstones), and Month 3 (Interview Velocity)
            </p>
          </div>
        </div>
      ) : isCreatingNew || roadmaps.length === 0 ? (
        renderForm()
      ) : (
        renderActiveRoadmap()
      )}

      {/* DELETE ROADMAP CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900">Delete Transformation Blueprint?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete this 90-day roadmap? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRoadmap}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Roadmap"}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeatureLayout>
  );
}