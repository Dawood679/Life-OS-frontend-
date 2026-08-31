import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import SmartOnboardingModal from "../components/SmartOnboardingModal";
import SkillCelebrationModal from "../components/SkillCelebrationModal";
import AIAssistantDashboard from "../components/AIAssistantDashboard";

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

  // Todo Edit State
  const [editTodo, setEditTodo] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchDashboardData();
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`${API_URL}/to-dos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Task deleted successfully");
        setTodos((prev) => prev.filter((t) => t._id !== id));
      }
    } catch {
      toast.error("Unable to delete task.");
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

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* UNIFIED EXECUTIVE AI CHIEF OF STAFF COMMAND CENTER */}
        <AIAssistantDashboard
          user={user}
          lifeScore={lifeScore}
          onDataRefresh={fetchDashboardData}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        {/* LIFE SCORE COMMAND CENTER (Interactive Habit Hook) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="font-serif font-bold text-slate-900 text-lg sm:text-xl">
                  Daily Life Score
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Your live 0–100 composite habit metric combining Health, Learning, and Career momentum.
              </p>
            </div>

            {/* Streak Counter & Formula Info Button */}
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold flex items-center gap-1.5">
                <span>🔥</span>
                <span>{streak} Day Streak</span>
              </div>

              <button
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                {showFormulaDetails ? "Hide Formula" : "ℹ️ Formula"}
              </button>
            </div>
          </div>

          {/* Life Score Gauge & Pillar Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Circular Gauge Card */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50/60 via-sky-50/30 to-white rounded-2xl border border-indigo-100 text-center space-y-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-200"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-indigo-600 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * totalScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-serif font-extrabold text-slate-900">
                    {totalScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    out of 100
                  </span>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-700">
                {totalScore >= 80 ? "🌟 Peak Momentum!" : totalScore >= 50 ? "⚡ Good Progress" : "🌱 Build Momentum Today"}
              </p>
            </div>

            {/* Pillar Breakdown Cards */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. Health Pillar */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1">
                    💚 Health & Wellness
                  </span>
                  <span className="text-xs font-extrabold text-rose-700 font-mono">
                    {healthScore}/100
                  </span>
                </div>
                <div className="w-full bg-rose-200/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${healthScore}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>⚡ Energy: {lifeScore?.breakdown?.energyScore || healthScore}/100</span>
                  <span>💧 {lifeScore?.breakdown?.waterConsumedMl || 0}ml</span>
                  <span>😴 {lifeScore?.breakdown?.sleepHours || 0}h</span>
                </div>
              </div>

              {/* 2. Learning Pillar */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    🧠 Learning
                  </span>
                  <span className="text-xs font-extrabold text-indigo-700 font-mono">
                    {learningScore}/100
                  </span>
                </div>
                <div className="w-full bg-indigo-200/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${learningScore}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Quizzes ({lifeScore?.breakdown?.quizzesCompleted || 0}) • Study Tasks ({lifeScore?.breakdown?.studyTasksCompleted || 0}) • {lifeScore?.breakdown?.studyTasksEarnedPoints || (lifeScore?.breakdown?.studyTasksCompleted || 0) * 25} pts
                </p>
              </div>

              {/* 3. Career / Action Pillar */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                    💼 Career & Action
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 font-mono">
                    {careerScore}/100
                  </span>
                </div>
                <div className="w-full bg-emerald-200/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${careerScore}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Tasks ({lifeScore?.breakdown?.todosCompleted || 0})</span>
                  <span>•</span>
                  <span>Milestones ({lifeScore?.breakdown?.actionMilestonesCompleted || 0})</span>
                  <span>•</span>
                  <span className="font-semibold text-emerald-700">Interviews ({lifeScore?.breakdown?.interviewsCompleted || 0})</span>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULA TRANSPARENCY ACCORDION */}
          {showFormulaDetails && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>📐 Life Score Calculation Formula</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  LifeScore = ({weights.health} × Health) + ({weights.learning} × Learning) + ({weights.career} × Career)
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                LifeOS never uses black-box numbers. Your score dynamically updates with your daily logs. Focus Mode weights can be adjusted anytime in Profile Settings. Historical snapshots remain permanently immutable.
              </p>
            </div>
          )}

          {/* REAL-TIME WHAT-IF DELTA RECOMMENDATIONS */}
          {deltas?.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-amber-50/70 via-sky-50/50 to-indigo-50/60 rounded-2xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Recommended Boosts for Today</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Complete any action below to raise your score
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {deltas.map((d) => (
                  <div
                    key={d.id}
                    className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                      d.isCompleted
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 opacity-60"
                        : "bg-white border-slate-200 hover:border-brand-indigo shadow-xs"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate text-slate-800">
                        {d.action}
                      </p>
                      <span className="text-[10px] font-bold text-indigo-600">
                        {d.isCompleted ? "✓ Goal Met" : `+${d.points} Score Pts`}
                      </span>
                    </div>

                    {!d.isCompleted && d.id === "water" && (
                      <button
                        onClick={() => handleQuickWater(250)}
                        disabled={loggingWater}
                        className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] font-bold rounded-lg transition shrink-0"
                      >
                        +250ml
                      </button>
                    )}

                    {!d.isCompleted && d.id === "quiz" && (
                      <button
                        onClick={() => navigate("/learning/quiz")}
                        className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[10px] font-bold rounded-lg transition shrink-0 cursor-pointer"
                      >
                        Quiz ➔
                      </button>
                    )}

                    {!d.isCompleted && d.id === "todos" && (
                      <button
                        onClick={() => navigate("/career/mock-interview")}
                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg transition shrink-0 cursor-pointer"
                      >
                        Interview ➔
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* VERIFIED SKILLS & ACHIEVEMENTS TROPHY SHOWCASE */}
        {verifiedSkills?.length > 0 && (
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-indigo-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center text-lg font-bold shadow-xs">
                  🏆
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Verified Competencies & Trophies ({verifiedSkills.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official LifeOS verified credentials & badges earned through skill mastery
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/learning/quiz")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer"
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
                        ? "bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-sky-500/10 border-amber-300 ring-2 ring-amber-400/30 shadow-md"
                        : "bg-slate-50/70 hover:bg-white border-slate-200 hover:border-indigo-300 shadow-xs"
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
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition truncate">
                        {sk.skill}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {sk.score ? `${sk.score}% Mastery` : "Verified Specialist"}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Click to view credential</span>
                      <span className="text-indigo-600 font-bold">Inspect ➔</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODULAR QUICK-ACTION WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Water Logging Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  💧 Water Intake
                </span>
                <span className="text-xs font-bold text-sky-600 font-mono">
                  {lifeScore?.breakdown?.waterConsumedMl || 0} / 2000 ml
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Log drinking water & daily mood to boost Energy & Life Score.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickWater(250)}
                  disabled={loggingWater}
                  className="flex-1 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  +250 ml
                </button>
                <button
                  onClick={() => handleQuickWater(500)}
                  disabled={loggingWater}
                  className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  +500 ml
                </button>
              </div>

              {/* Quick Mood Check */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400">Mood:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleQuickMood(5, "Great")}
                    className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 rounded-lg text-xs transition cursor-pointer"
                    title="Energized & Great"
                  >
                    😊 Great
                  </button>
                  <button
                    onClick={() => handleQuickMood(3, "Neutral")}
                    className="px-2 py-1 bg-slate-100 hover:bg-amber-100 rounded-lg text-xs transition cursor-pointer"
                    title="Okay"
                  >
                    😐 Okay
                  </button>
                  <button
                    onClick={() => handleQuickMood(1, "Tired")}
                    className="px-2 py-1 bg-slate-100 hover:bg-rose-100 rounded-lg text-xs transition cursor-pointer"
                    title="Tired / Low"
                  >
                    🥱 Low
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Work & Asset Review Card */}
          <div
            onClick={() => navigate("/learning/work-review")}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-brand-indigo transition cursor-pointer space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                ✦ Work & Asset Analyzer
              </span>
              <p className="text-xs text-slate-500">
                Analyze code, essays, business proposals, or marketing plans with dual technical & strategic lenses.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-indigo group-hover:underline">
              Open Work Analyzer ➔
            </span>
          </div>

          {/* Action Plan Blueprint Card */}
          <div
            onClick={() => navigate("/learning/action-plan")}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-400 transition cursor-pointer space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                🚀 Action Plan Generator
              </span>
              <p className="text-xs text-slate-500">
                Turn your tech ideas, exam preparations, or business goals into milestone-driven roadmaps.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 group-hover:underline">
              Generate Action Blueprint ➔
            </span>
          </div>
        </div>

        {/* DAILY TASKS & TODOS SECTION */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Today's Action Priorities
              </h3>
              <p className="text-xs text-slate-500">
                Check off items to directly boost your Career & Action Life Score.
              </p>
            </div>

            <button
              onClick={() => navigate("/todos")}
              className="text-xs font-bold text-brand-indigo hover:underline"
            >
              View Full Planner ➔
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-6 text-center">Loading priorities...</p>
          ) : todos.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-700">No active priorities for today.</p>
              <button
                onClick={() => navigate("/todos")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                + Add Priority Task
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todos.slice(0, 5).map((todo) => (
                <div
                  key={todo._id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    todo.isCompleted
                      ? "bg-slate-50 border-slate-200 opacity-60"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      onChange={() => handleToggleTodo(todo)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                    <span
                      className={`text-xs font-bold truncate ${
                        todo.isCompleted ? "line-through text-slate-400" : "text-slate-900"
                      }`}
                    >
                      {todo.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityBadgeStyle(
                        todo.priority
                      )}`}
                    >
                      {todo.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditOpen(todo)}
                      className="text-slate-400 hover:text-slate-700 text-xs p-1"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(todo._id)}
                      className="text-slate-400 hover:text-rose-500 text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
    </Layout>
  );
}