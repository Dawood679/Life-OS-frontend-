import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import SmartOnboardingModal from "../components/SmartOnboardingModal";
import SkillCelebrationModal from "../components/SkillCelebrationModal";
import AIAssistantDashboard from "../components/AIAssistantDashboard";
import LifeJourneyFlow from "../components/LifeJourneyFlow";
import DeleteModal from "../components/DeleteModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  const API_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

  const [user, setUser] = useState(null);
  const [lifeScore, setLifeScore] = useState(null);
  const [todos, setTodos] = useState([]);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [selectedBadgeModal, setSelectedBadgeModal] = useState({
    isOpen: false,
    badge: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [loggingWater, setLoggingWater] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [addingQuickTask, setAddingQuickTask] = useState(false);

  // Todo Edit State
  const [editTodo, setEditTodo] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');

    if (paymentStatus === 'success') {
      const verifyPayment = async () => {
        try {
          if (sessionId) {
            const res = await fetch(`${API_URL}/payments/verify-session?session_id=${sessionId}`, {
              credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
              const isYearly = data.subscription?.billingCycle === 'yearly' || data.subscription?.plan === 'pro_yearly';
              toast.success(`🎉 ${isYearly ? 'Pro Yearly Pass (365 Days)' : 'Pro Monthly'} Activated! Welcome to VIP!`, { duration: 5000 });
            }
          } else {
            toast.success("🎉 Payment successful! Welcome to LifeOS Pro VIP!", { duration: 5000 });
          }
        } catch (err) {
          console.error("Payment verification error:", err);
        } finally {
          // Clean up URL query parameters without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
          fetchDashboardData();
        }
      };
      verifyPayment();
    } else {
      fetchDashboardData();
    }

    const handleRefreshEvent = () => {
      fetchDashboardData();
    };

    window.addEventListener("lifeos-data-refresh", handleRefreshEvent);
    return () => window.removeEventListener("lifeos-data-refresh", handleRefreshEvent);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch User Profile
      const userRes = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });
      const userData = await userRes.json();
      if (userData.user) {
        setUser(userData.user);
        if (!userData.user.focusGoal) {
          setIsOnboardingOpen(true);
        }
      }

      // 2. Fetch Today's Life Score & Deltas
      const todayDate = getLocalDate();
      const scoreRes = await fetch(`${API_URL}/life-score/today?date=${todayDate}`, {
        credentials: "include",
      });
      const scoreData = await scoreRes.json();
      if (scoreData.success && scoreData.data) {
        setLifeScore(scoreData.data);
      }

      // 3. Fetch Todos
      const todosRes = await fetch(`${API_URL}/to-dos`, {
        credentials: "include",
      });
      const todosData = await todosRes.json();
      if (todosData.success) {
        setTodos(todosData.todos || []);
      }

      // 4. Fetch Verified Skills
      const skillsRes = await fetch(`${API_URL}/life-score/verified-skills`, {
        credentials: "include",
      });
      const skillsData = await skillsRes.json();
      if (skillsData.success && skillsData.data) {
        setVerifiedSkills(skillsData.data);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Unable to load some dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get user's local date YYYY-MM-DD
  const getLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Quick Action: Log Water (+250ml or +500ml) with instant Life Score update
  const handleQuickWater = async (amountMl) => {
    try {
      setLoggingWater(true);
      const todayDate = getLocalDate();

      const res = await fetch(`${API_URL}/wellness/water`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: todayDate, amountMl }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`💧 Logged ${amountMl}ml water! Life Score updated.`);
        // Refresh Life Score
        const scoreRes = await fetch(`${API_URL}/life-score/today?date=${todayDate}`, {
          credentials: "include",
        });
        const scoreData = await scoreRes.json();
        if (scoreData.success && scoreData.data) {
          setLifeScore(scoreData.data);
        }
      } else {
        toast.error(data.message || "Failed to log water.");
      }
    } catch {
      toast.error("Unable to log water.");
    } finally {
      setLoggingWater(false);
    }
  };

  // Quick Action: Log Mood (1-5)
  const handleQuickMood = async (value, note = "") => {
    try {
      const todayDate = getLocalDate();
      const res = await fetch(`${API_URL}/wellness/mood`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: todayDate, value, note }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Mood logged! Energy score updated 😊`);
        const scoreRes = await fetch(`${API_URL}/life-score/today`, {
          credentials: "include",
        });
        const scoreData = await scoreRes.json();
        if (scoreData.success && scoreData.data) {
          setLifeScore(scoreData.data);
        }
      }
    } catch {
      toast.error("Failed to log mood.");
    }
  };

  // Quick Action: Log Sleep (hours)
  const handleQuickSleep = async (hours) => {
    try {
      const todayDate = getLocalDate();
      const res = await fetch(`${API_URL}/wellness/sleep`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: todayDate, hours, quality: hours >= 7 ? "good" : "fair" }),
      });
      if (res.ok) {
        toast.success(`Sleep logged (${hours}h)! Energy restored 😴`);
        const scoreRes = await fetch(`${API_URL}/life-score/today`, { credentials: "include" });
        const scoreData = await scoreRes.json();
        if (scoreData.success && scoreData.data) setLifeScore(scoreData.data);
      }
    } catch {
      toast.error("Failed to log sleep.");
    }
  };

  // Quick Brain Dump Action: Create priority task immediately from Dashboard
  const handleQuickTaskSubmit = async (e) => {
    e?.preventDefault();
    if (!quickTaskTitle.trim()) return;
    try {
      setAddingQuickTask(true);
      const res = await fetch(`${API_URL}/to-dos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: quickTaskTitle.trim(),
          priority: "high",
        }),
      });
      const data = await res.json();
      if (data.success && data.todo) {
        setTodos((prev) => [data.todo, ...prev]);
        setQuickTaskTitle("");
        toast.success("Action priority added! ⚡");
        const scoreRes = await fetch(`${API_URL}/life-score/today`, { credentials: "include" });
        const scoreData = await scoreRes.json();
        if (scoreData.success && scoreData.data) setLifeScore(scoreData.data);
      }
    } catch {
      toast.error("Failed to add action priority.");
    } finally {
      setAddingQuickTask(false);
    }
  };

  // Toggle Todo Completion
  const handleToggleTodo = async (todo) => {
    try {
      const res = await fetch(`${API_URL}/to-dos/${todo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isCompleted: !todo.isCompleted }),
      });
      const data = await res.json();
      if (data.success) {
        setTodos((prev) =>
          prev.map((t) => (t._id === todo._id ? { ...t, isCompleted: !t.isCompleted } : t))
        );
        toast.success(todo.isCompleted ? "Task marked active" : "Task completed! Life Score boosted 🎉");
        // Refresh score
        const scoreRes = await fetch(`${API_URL}/life-score/today`, {
          credentials: "include",
        });
        const scoreData = await scoreRes.json();
        if (scoreData.success && scoreData.data) {
          setLifeScore(scoreData.data);
        }
      }
    } catch {
      toast.error("Failed to update task.");
    }
  };

  const [todoToDelete, setTodoToDelete] = useState(null);
  const [isDeletingTodo, setIsDeletingTodo] = useState(false);

  const openDeleteModal = (todo) => {
    setTodoToDelete(todo);
  };

  const handleConfirmDelete = async () => {
    if (!todoToDelete) return;
    try {
      setIsDeletingTodo(true);
      const res = await fetch(`${API_URL}/to-dos/${todoToDelete._id || todoToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Task deleted successfully");
        setTodos((prev) => prev.filter((t) => t._id !== (todoToDelete._id || todoToDelete)));
        setTodoToDelete(null);
      } else {
        toast.error(data.message || "Failed to delete task.");
      }
    } catch {
      toast.error("Unable to delete task.");
    } finally {
      setIsDeletingTodo(false);
    }
  };

  const handleEditOpen = (todo) => {
    setEditTodo(todo._id);
    setEditData({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority || "medium",
      dueDate: todo.dueDate ? todo.dueDate.slice(0, 16) : "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/to-dos/${editTodo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Task updated successfully");
        setEditTodo(null);
        fetchDashboardData();
      }
    } catch {
      toast.error("Unable to update task.");
    }
  };

  const priorityBadgeStyle = (priority) => {
    if (priority === "high") return "bg-rose-50 text-rose-700 border-rose-200";
    if (priority === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  const totalScore = lifeScore?.totalScore || 0;
  const healthScore = lifeScore?.healthScore || 0;
  const learningScore = lifeScore?.learningScore || 0;
  const careerScore = lifeScore?.careerScore || 0;
  const weights = lifeScore?.weights || { health: 0.35, learning: 0.40, career: 0.25 };
  const deltas = lifeScore?.deltas || [];
  const streak = lifeScore?.streak?.current || 0;

  return (
    <Layout>
      {/* Smart Onboarding / Focus Setup Modal */}
      <SmartOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialGoal={user?.focusGoal || ""}
        onComplete={(updatedUser) => {
          setUser(updatedUser);
          fetchDashboardData();
          toast.success("LifeOS configured for your goal!");
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* UNIFIED EXECUTIVE AI CHIEF OF STAFF COMMAND CENTER (Full-Width Hero) */}
        <AIAssistantDashboard
          user={user}
          lifeScore={lifeScore}
          onDataRefresh={fetchDashboardData}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        {/* VERIFIED SKILLS & ACHIEVEMENTS TROPHY SHOWCASE */}
        {verifiedSkills?.length > 0 && (
          <div className="bg-white/95 dark:bg-[#0e131f]/90 backdrop-blur-md p-6 rounded-3xl border border-indigo-100 dark:border-white/10 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center text-lg font-bold shadow-xs">
                  🏆
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Verified Competencies & Trophies ({verifiedSkills.length})
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Official LifeOS verified credentials & badges earned through skill mastery
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/learning/quiz")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition flex items-center gap-1 cursor-pointer"
              >
                <span>+ Test New Skill</span>
                <span>➔</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {verifiedSkills.map((sk, idx) => {
                const isToday =
                  sk.verifiedAt &&
                  new Date(sk.verifiedAt).toISOString().split("T")[0] === getLocalDate();

                return (
                  <div
                    key={idx}
                    onClick={() =>
                      setSelectedBadgeModal({
                        isOpen: true,
                        badge: {
                          skill: sk.skill,
                          subCompetency: "Verified Competency",
                          score: sk.score || 90,
                          date: sk.verifiedAt,
                          badgeId: sk._id || `LOS-${idx}`,
                        },
                      })
                    }
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group hover:scale-[1.02] ${
                      isToday
                        ? "bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-sky-500/10 border-amber-300 dark:border-amber-500/50 ring-2 ring-amber-400/30 shadow-md"
                        : "bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-xs"
                    }`}
                  >
                    {isToday && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider animate-pulse">
                        Unlocked Today ⭐
                      </div>
                    )}

                    <div className="space-y-1 pt-1">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center text-base font-bold shadow-xs">
                        🛡️
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                        {sk.skill}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {sk.score ? `${sk.score}% Mastery` : "Verified Specialist"}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-400">
                      <span>Click to view credential</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">Inspect ➔</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* 🗺️ LIFEOS MASTER GROWTH JOURNEY & PLAYBOOK (Connected 3-Pillar Lifecycles) */}
        <LifeJourneyFlow
          user={user}
          lifeScore={lifeScore}
          todos={todos}
          verifiedSkills={verifiedSkills}
        />
      </div>

      {/* Skill Verification Inspection / Celebration Modal */}
      <SkillCelebrationModal
        isOpen={selectedBadgeModal.isOpen}
        onClose={() => setSelectedBadgeModal({ isOpen: false, badge: null })}
        badge={selectedBadgeModal.badge}
        onBuildActionPlan={(skill) => {
          setSelectedBadgeModal({ isOpen: false, badge: null });
          navigate("/learning/action-plan", {
            state: { goal: `Build a production-grade portfolio project using ${skill}` },
          });
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(todoToDelete)}
        onClose={() => setTodoToDelete(null)}
        onDelete={handleConfirmDelete}
        isDeleting={isDeletingTodo}
        title={`Delete "${todoToDelete?.title || "Task"}"?`}
        description="Are you sure you want to delete this task? This action cannot be undone and will remove it from your agenda."
        confirmText="Delete Task"
      />
    </Layout>
  );
}