import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Sun,
  Moon,
  Sparkles,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCw,
  ArrowRight,
  Briefcase,
  BookOpen,
  Droplets,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Flame,
  Calendar,
  Lock,
  Unlock,
  ChevronRight,
  Award,
  Zap,
  Target,
  ListTodo,
  CalendarDays,
  Settings,
  Edit3,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import WeeklyReportModal from "./WeeklyReportModal";
import ThemeToggle from "./ui/ThemeToggle";

export default function AIAssistantDashboard({ user, lifeScore, onDataRefresh, onOpenOnboarding }) {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const totalScore = lifeScore?.totalScore || briefing?.statsSnapshot?.compositeScore || 0;
  const healthScore = lifeScore?.healthScore || (briefing?.statsSnapshot?.compositeScore ? Math.round(briefing.statsSnapshot.compositeScore * 0.9) : 0);
  const learningScore = lifeScore?.learningScore || 0;
  const careerScore = lifeScore?.careerScore || 0;
  const weights = lifeScore?.weights || { health: 0.35, learning: 0.40, career: 0.25 };
  const streak = lifeScore?.streak?.current || briefing?.statsSnapshot?.streakCount || 0;

  // View Mode: 'today' (Interactive Checklist) | 'horizon' (7-Day Day-by-Day Schedule)
  const [activeView, setActiveView] = useState("today");
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);

  // Audio Speech Synthesis State (Uses already-cached narrative, 0 new AI calls)
  const [speechState, setSpeechState] = useState("idle"); // 'idle' | 'playing' | 'paused'
  const speechUtteranceRef = useRef(null);

  // Raw Database Data for 7-Day Horizon
  const [allTodos, setAllTodos] = useState([]);
  const [allJobApps, setAllJobApps] = useState([]);
  const [allStudyPlans, setAllStudyPlans] = useState([]);

  // Smart Rescheduler & Burnout Guard State (Sprint 3.2)
  const [reschedulerProposal, setReschedulerProposal] = useState(null);
  const [isReschedulerDismissed, setIsReschedulerDismissed] = useState(false);
  const [isApplyingRecovery, setIsApplyingRecovery] = useState(false);
  const [isUndoingRecovery, setIsUndoingRecovery] = useState(false);

  // Inline Quick Add Task State
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskPriority, setQuickTaskPriority] = useState("medium");
  const [quickTaskDate, setQuickTaskDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [showTaskInput, setShowTaskInput] = useState(false);

  // Local Optimistic Agenda Tasks
  const [agendaTasks, setAgendaTasks] = useState([]);
  const [floatingPoints, setFloatingPoints] = useState(null); // e.g. { id, pts: '+2' }

  const rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  const API_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka";

  useEffect(() => {
    fetchBriefingAndAgenda();

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Helper: Get local YYYY-MM-DD string regardless of UTC offset
  const getLocalDateString = (d) => {
    if (!d) return "";
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Dynamic Natural Time-Aware Greeting
  const getTimeAwareGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name || "Explorer";
    if (hour >= 4 && hour < 12) return `Good morning, ${name}! Here is your executive agenda ☀️`;
    if (hour >= 12 && hour < 17) return `Good afternoon, ${name}! Here is your midday agenda 🌤️`;
    if (hour >= 17 && hour < 22) return `Good evening, ${name}! Here is your executive recap 🌆`;
    return `Welcome back, ${name}! Here is your nightly overview 🌙`;
  };

  // Dynamic Time Badge with Icon & Styling
  const getTimeBadge = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      return {
        icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
        text: "Morning Briefing",
        style: "bg-amber-50 text-amber-900 border-amber-200",
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        icon: <Sun className="w-3.5 h-3.5 text-sky-500" />,
        text: "Midday Briefing",
        style: "bg-sky-50 text-sky-900 border-sky-200",
      };
    }
    if (hour >= 17 && hour < 22) {
      return {
        icon: <Moon className="w-3.5 h-3.5 text-indigo-500" />,
        text: "Evening Recap",
        style: "bg-indigo-50 text-indigo-900 border-indigo-200",
      };
    }
    return {
      icon: <Moon className="w-3.5 h-3.5 text-purple-500" />,
      text: "Nightly Recap",
      style: "bg-purple-50 text-purple-900 border-purple-200",
    };
  };

  const fetchBriefingAndAgenda = async () => {
    try {
      setLoading(true);
      const [briefingRes, todosRes, jobAppsRes, studyPlansRes, reschedulerRes] = await Promise.all([
        fetch(`${API_URL}/daily-briefing/today`, {
          headers: { "x-user-timezone": userTimezone },
          credentials: "include",
        }),
        fetch(`${API_URL}/to-dos`, { credentials: "include" }),
        fetch(`${API_URL}/job-applications`, { credentials: "include" }),
        fetch(`${API_URL}/study-plan`, { credentials: "include" }),
        fetch(`${API_URL}/rescheduler/proposal`, {
          headers: { "x-user-timezone": userTimezone },
          credentials: "include",
        }),
      ]);

      const briefingData = await briefingRes.json();
      const todosData = await todosRes.json();
      const jobAppsData = await jobAppsRes.json();
      const studyPlansData = await studyPlansRes.json();
      const reschedulerData = await reschedulerRes.json();

      if (briefingData.success && briefingData.data) {
        setBriefing(briefingData.data);
      }

      if (Array.isArray(todosData.todos)) {
        setAllTodos(todosData.todos);
        const todayStr = getLocalDateString(new Date());
        const activeTodos = todosData.todos.filter((t) => {
          if (t.isCompleted === true || String(t.isCompleted) === "true") return false;
          if (!t.dueDate) return true;
          const taskDateStr = getLocalDateString(t.dueDate);
          return taskDateStr <= todayStr;
        });
        setAgendaTasks(activeTodos);
      }

      if (Array.isArray(jobAppsData.applications)) {
        setAllJobApps(jobAppsData.applications);
      }

      if (Array.isArray(studyPlansData.studyPlans)) {
        setAllStudyPlans(studyPlansData.studyPlans);
      }

      if (reschedulerData.success && reschedulerData.data) {
        setReschedulerProposal(reschedulerData.data);
      }
    } catch (err) {
      console.warn("Failed to load assistant data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-evaluate briefing when user explicitly clicks Refresh
  const handleRegenerate = async () => {
    try {
      setRefreshing(true);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeechState("idle");
      }

      const res = await fetch(`${API_URL}/daily-briefing/regenerate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-timezone": userTimezone,
        },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setBriefing(data.data);
        toast.success("Executive agenda refreshed!");
      }
    } catch {
      toast.error("Network error during refresh.");
    } finally {
      setRefreshing(false);
    }
  };

  // 1. Optimistic Task Completion with Guaranteed Rollback
  const handleToggleTask = async (task) => {
    const taskId = task._id;
    const previousTasks = [...agendaTasks];

    // Optimistic Update
    setAgendaTasks((prev) => prev.filter((t) => t._id !== taskId));
    setFloatingPoints({ id: taskId, pts: "+2 pts" });
    setTimeout(() => setFloatingPoints(null), 1600);

    try {
      const res = await fetch(`${API_URL}/to-dos/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isCompleted: true }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      toast.success("Task completed! +Life Score points earned 🚀");
      if (onDataRefresh) onDataRefresh();
    } catch {
      // Strict Rollback Guarantee
      setAgendaTasks(previousTasks);
      toast.error("Could not update task. Changes reverted ⚠️");
    }
  };

  // 2. Snooze Task to Tomorrow
  const handleSnoozeTask = async (taskId) => {
    const previousTasks = [...agendaTasks];
    setAgendaTasks((prev) => prev.filter((t) => t._id !== taskId));

    try {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const res = await fetch(`${API_URL}/to-dos/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dueDate: tomorrow }),
      });

      if (!res.ok) throw new Error("Failed to snooze");

      toast.success("Task snoozed for tomorrow ⏰ (Complete 1 action today to maintain streak)");
      fetchBriefingAndAgenda();
      if (onDataRefresh) onDataRefresh();
    } catch {
      setAgendaTasks(previousTasks);
      toast.error("Could not snooze task. Changes reverted.");
    }
  };

  // 3. In-Place Quick Add Task (Thin wrapper to POST /api/to-dos)
  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    try {
      setIsSubmittingTask(true);
      const res = await fetch(`${API_URL}/to-dos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: quickTaskTitle.trim(),
          priority: quickTaskPriority,
          dueDate: quickTaskDate || new Date().toISOString().split("T")[0],
        }),
      });

      const data = await res.json();
      if (res.ok && data.todo) {
        setAllTodos((prev) => [data.todo, ...prev]);
        const todayStr = getLocalDateString(new Date());
        const taskDateStr = getLocalDateString(quickTaskDate || new Date());
        if (taskDateStr <= todayStr) {
          setAgendaTasks((prev) => [data.todo, ...prev]);
        }
        setQuickTaskTitle("");
        setShowTaskInput(false);
        toast.success(taskDateStr === todayStr ? "Added to today's agenda!" : `Scheduled for ${taskDateStr} (view in 7-Day Schedule)!`);
        if (onDataRefresh) onDataRefresh();
      } else {
        toast.error(data.message || "Failed to add task.");
      }
    } catch {
      toast.error("Network error adding task.");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // 4. Burnout Guard: 1-Click Recovery Application
  const handleApplyRecovery = async () => {
    try {
      setIsApplyingRecovery(true);
      const res = await fetch(`${API_URL}/rescheduler/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-timezone": userTimezone,
        },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Recovery mode activated! Non-urgent tasks moved to tomorrow.");
        fetchBriefingAndAgenda();
        if (onDataRefresh) onDataRefresh();
      } else {
        toast.error(data.message || "Failed to activate recovery mode.");
      }
    } catch {
      toast.error("Network error applying recovery rescheduling.");
    } finally {
      setIsApplyingRecovery(false);
    }
  };

  // 5. Burnout Guard: 1-Click Undo Recovery Rollback
  const handleUndoRecovery = async () => {
    try {
      setIsUndoingRecovery(true);
      const res = await fetch(`${API_URL}/rescheduler/undo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-timezone": userTimezone,
        },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Schedule restored back to today!");
        fetchBriefingAndAgenda();
        if (onDataRefresh) onDataRefresh();
      } else {
        toast.error(data.message || "Failed to undo recovery rescheduling.");
      }
    } catch {
      toast.error("Network error undoing recovery rescheduling.");
    } finally {
      setIsUndoingRecovery(false);
    }
  };

  // 6. Compute Day-by-Day 7-Day Horizon Schedule
  const sevenDayHorizon = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + i);

      const dateStr = getLocalDateString(targetDate);
      const dayName = targetDate.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      let label = `${dayName}, ${monthDay}`;
      if (i === 0) label = `Today (${dayName})`;
      if (i === 1) label = `Tomorrow (${dayName})`;

      // Gather Todos for this date
      const dayTodos = allTodos.filter((t) => {
        if (t.isCompleted === true || String(t.isCompleted) === "true") return false;
        if (!t.dueDate) return i === 0;
        const dStr = getLocalDateString(t.dueDate);
        return dStr === dateStr;
      });

      // Gather Interviews for this date
      const dayInterviews = allJobApps.filter((app) => {
        if (!app.interviewDate) return false;
        const dStr = getLocalDateString(app.interviewDate);
        return dStr === dateStr;
      });

      // Gather Follow-ups for this date
      const dayFollowUps = allJobApps.filter((app) => {
        if (app.status !== "applied" || !app.followUpDate) return false;
        const dStr = getLocalDateString(app.followUpDate);
        return dStr === dateStr;
      });

      days.push({
        dateStr,
        dayName,
        monthDay,
        label,
        isToday: i === 0,
        isTomorrow: i === 1,
        todos: dayTodos,
        interviews: dayInterviews,
        followUps: dayFollowUps,
        totalItems: dayTodos.length + dayInterviews.length + dayFollowUps.length,
      });
    }

    return days;
  }, [allTodos, allJobApps]);

  // Comprehensive Audio Voice Narration Engine
  const handlePlayVoice = () => {
    if (!window.speechSynthesis || !briefing) {
      toast.error("Speech synthesis is not supported on this browser.");
      return;
    }

    if (speechState === "paused") {
      window.speechSynthesis.resume();
      setSpeechState("playing");
      return;
    }

    window.speechSynthesis.cancel();

    const hour = new Date().getHours();
    let currentGreeting = "Good morning";
    if (hour >= 12 && hour < 17) currentGreeting = "Good afternoon";
    else if (hour >= 17 && hour < 22) currentGreeting = "Good evening";
    else if (hour >= 22 || hour < 4) currentGreeting = "Welcome back";

    const userName = user?.name || "Explorer";
    const currentScore = lifeScore?.totalScore || briefing?.statsSnapshot?.compositeScore || 0;
    const quote = briefing?.motivationalQuote || "Small daily improvements over time lead to stunning results. Keep building momentum!";

    // Build real-time synchronized narration based on live visible dashboard tasks
    let taskText = "";
    if (agendaTasks && agendaTasks.length > 0) {
      if (agendaTasks.length === 1) {
        taskText = `You have 1 active task on your agenda today: "${agendaTasks[0].title}".`;
      } else {
        taskText = `You have ${agendaTasks.length} active tasks on your agenda today. Your top priority is "${agendaTasks[0].title}"${agendaTasks[1] ? `, followed by "${agendaTasks[1].title}"` : ""}.`;
      }
    } else {
      taskText = "Your agenda is clear with no pending tasks today.";
    }

    let wellnessText = "";
    const waterConsumed = lifeScore?.breakdown?.waterConsumedMl ?? briefing?.statsSnapshot?.waterConsumedMl ?? 0;
    const waterTarget = lifeScore?.breakdown?.waterTargetMl ?? briefing?.statsSnapshot?.waterTargetMl ?? 2000;
    if (waterConsumed < waterTarget) {
      wellnessText = `Make sure to drink ${waterTarget - waterConsumed}ml more water to reach your daily hydration target.`;
    } else {
      wellnessText = "Your hydration goal is fully secured.";
    }

    const voiceScript = `${currentGreeting}, ${userName}. Your Life Score today is currently sitting at ${currentScore} out of 100. ${taskText} ${wellnessText} Remember: ${quote}`;

    const utterance = new SpeechSynthesisUtterance(voiceScript);
    utterance.rate = 0.98; // natural cadence
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Zira") ||
            v.name.includes("Jenny") ||
            v.name.includes("Aria") ||
            v.name.includes("Sonia") ||
            v.name.includes("Samantha") ||
            v.name.includes("Google US English") ||
            v.name.includes("Victoria") ||
            v.name.includes("Karen") ||
            v.name.toLowerCase().includes("female") ||
            v.name.includes("Natural"))
      ) || voices.find((v) => v.lang.startsWith("en"));

    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onend = () => setSpeechState("idle");
    utterance.onerror = () => setSpeechState("idle");

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeechState("playing");
  };

  const handlePauseVoice = () => {
    if (window.speechSynthesis && speechState === "playing") {
      window.speechSynthesis.pause();
      setSpeechState("paused");
    }
  };

  const handleStopVoice = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeechState("idle");
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white/80 dark:bg-[#0e131f]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 animate-pulse space-y-4 shadow-xs text-left">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="h-7 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-16 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!briefing) return null;

  const timeBadge = getTimeBadge();
  const stats = briefing.statsSnapshot || {};
  const isStarterUser = (stats.totalJobApps || 0) === 0 && (stats.todosActive || 0) === 0 && agendaTasks.length === 0;
  const isActionCompletedToday = (stats.todosCompleted || 0) > 0 || (stats.waterConsumedMl || 0) > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all shadow-xs backdrop-blur-md text-left bg-gradient-to-br from-white/95 via-sky-50/40 to-indigo-50/30 dark:from-[#0b0f19]/95 dark:via-[#111827]/90 dark:to-[#07090e]/95 text-slate-800 dark:text-slate-100 border-slate-200/90 dark:border-white/10">
      {/* Decorative Ambient Subtle Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30 dark:opacity-15 bg-sky-200/60 dark:bg-sky-500/20 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-25 dark:opacity-15 bg-indigo-200/50 dark:bg-indigo-500/20 pointer-events-none" />

      {/* TOP HEADER: TIME BADGE, MODE PILL, VIEW SWITCHER & AUDIO CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/70 dark:border-white/10 relative z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${timeBadge.style}`}>
            {timeBadge.icon}
            <span>AI Chief of Staff • {timeBadge.text}</span>
          </span>

          <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide">
            Mode: <strong className="text-indigo-900 dark:text-indigo-200 capitalize">{lifeScore?.focusMode?.replace("_", " ") || "Career Sprint"}</strong>
          </span>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            {briefing.date}
          </span>
        </div>

        {/* Action Controls: Audio Voice Player & Refresh */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          {/* Voice Controls */}
          {speechState === "idle" && (
            <button
              onClick={handlePlayVoice}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200/90 dark:border-white/10 shadow-2xs transition cursor-pointer flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95"
              title="Listen to Executive Briefing"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Listen</span>
            </button>
          )}

          {speechState === "playing" && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-2xs">
              <button
                onClick={handlePauseVoice}
                className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition cursor-pointer"
                title="Pause voice"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStopVoice}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                title="Stop voice"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 pr-2 animate-pulse">Playing...</span>
            </div>
          )}

          {speechState === "paused" && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-amber-200 dark:border-amber-800 shadow-2xs">
              <button
                onClick={handlePlayVoice}
                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition cursor-pointer"
                title="Resume voice"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStopVoice}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                title="Stop voice"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 pr-2">Paused</span>
            </div>
          )}

          <button
            onClick={handleRegenerate}
            disabled={refreshing}
            className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Refresh narrative with latest actions"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""}`} />
          </button>

          {/* Theme Mode Toggle (Light/Dark) */}
          <ThemeToggle variant="pill" />
        </div>
      </div>

      {/* HERO HEADLINE & MONTHLY FOCUS */}
      <div className="mt-5 space-y-2 relative z-10">
        <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
          {getTimeAwareGreeting()}
        </h2>

        {/* Monthly Focus Pill */}
        {user?.focusGoal ? (
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">🎯 Monthly Focus:</span>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200/90 dark:border-indigo-800 shadow-2xs">
              {user.focusGoal}
            </span>
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline cursor-pointer flex items-center gap-0.5"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Goal</span>
              </button>
            )}
          </div>
        ) : null}

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl font-normal pt-1">
          {briefing.executiveSummary}
        </p>
      </div>

      {/* 🌟 INTEGRATED 4-PILLAR LIFE SCORE COMMAND HUB (Full Rich Aesthetics & Zero-Scroll) */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10 items-stretch">
        {/* Pillar 1: Total Life Score Orbit Gauge (Enlarged Hero Ring) */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-sky-50/40 to-white dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#0e131f] border border-indigo-100/90 dark:border-white/10 shadow-2xs flex flex-col items-center justify-between text-center space-y-2 transition-colors">
          <div className="w-full flex items-center justify-between pb-1.5 border-b border-indigo-100/60 dark:border-white/10">
            <span className="text-[11px] font-extrabold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
              Total Score
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 shadow-2xs">
                🔥 {streak}d
              </span>
            </div>
          </div>

          {/* Enlarged Prominent SVG Circular Progress Ring */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-200/80 dark:stroke-slate-700/60"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-1000 ease-out"
                strokeWidth="7"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * totalScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-3xl sm:text-3.5xl font-serif font-black text-slate-900 dark:text-white leading-none">
                {totalScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                out of 100
              </span>
            </div>
          </div>

          <div className="w-full pt-1.5 border-t border-indigo-100/60 dark:border-white/10">
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 bg-indigo-50/80 dark:bg-indigo-950/50 py-1.5 px-3 rounded-xl border border-indigo-100/80 dark:border-indigo-800 shadow-2xs">
              {totalScore >= 80 ? "🌟 Peak Momentum!" : totalScore >= 50 ? "⚡ Good Progress" : "🌱 Build Momentum"}
            </p>
          </div>
        </div>

        {/* Pillar 2: Health & Wellness */}
        <div className="p-4.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/90 dark:border-rose-900/40 shadow-2xs flex flex-col justify-between space-y-3 transition-colors">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-rose-100/60 dark:border-rose-900/30">
              <span className="text-xs font-extrabold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                <span>💚 Health</span>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 font-mono">({Math.round((lifeScore?.weights?.health || 0.35) * 100)}%)</span>
              </span>
              <span className="text-xs font-black text-rose-700 dark:text-rose-300 font-mono bg-white dark:bg-rose-900/50 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800 shadow-2xs">
                {healthScore}/100
              </span>
            </div>

            <div className="w-full bg-rose-200/50 dark:bg-rose-900/40 rounded-full h-2 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">⚡ Energy Score:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{lifeScore?.breakdown?.energyScore || healthScore}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">💧 Water Target:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {Math.min(lifeScore?.breakdown?.waterConsumedMl || 0, 2000)} / 2000ml
                  {(lifeScore?.breakdown?.waterConsumedMl || 0) >= 2000 && (
                    <span className="ml-1 text-[9px] text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded">✓ Met</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">😴 Sleep Duration:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{lifeScore?.breakdown?.sleepHours || 0}h</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-1.5 text-[11px] border-t border-rose-100/60 dark:border-rose-900/30">
            <button
              type="button"
              disabled={(lifeScore?.breakdown?.waterConsumedMl || 0) >= 2000}
              onClick={async () => {
                const todayDate = new Date().toISOString().split("T")[0];
                const res = await fetch(`${API_URL}/wellness/water`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ date: todayDate, amountMl: 250 })
                });
                if (res.ok) {
                  toast.success("💧 Logged 250ml water!");
                  if (onDataRefresh) onDataRefresh();
                }
              }}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-slate-700 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-white/10 font-bold transition shadow-2xs cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(lifeScore?.breakdown?.waterConsumedMl || 0) >= 2000 ? "Goal Met 🎉" : "+250ml Water"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/health/wellness")}
              className="py-1.5 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-2xs cursor-pointer"
            >
              Logs ➔
            </button>
          </div>
        </div>

        {/* Pillar 3: Learning & Skills */}
        <div className="p-4.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/90 dark:border-indigo-900/40 shadow-2xs flex flex-col justify-between space-y-3 transition-colors">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-indigo-100/60 dark:border-indigo-900/30">
              <span className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <span>🧠 Learning</span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">({Math.round((lifeScore?.weights?.learning || 0.40) * 100)}%)</span>
              </span>
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 font-mono bg-white dark:bg-indigo-900/50 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                {learningScore}/100
              </span>
            </div>

            <div className="w-full bg-indigo-200/50 dark:bg-indigo-900/40 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${learningScore}%` }}
              ></div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">🧠 Quizzes Done:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{lifeScore?.breakdown?.quizzesCompleted || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">📚 Study Tasks:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{lifeScore?.breakdown?.studyTasksCompleted || 0} / {lifeScore?.breakdown?.studyTasksTotal || 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">🏆 Points Earned:</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300">+{lifeScore?.breakdown?.studyTasksEarnedPoints || (lifeScore?.breakdown?.studyTasksCompleted || 0) * 25} pts</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-1.5 text-[11px] border-t border-indigo-100/60 dark:border-indigo-900/30">
            <button
              type="button"
              onClick={() => navigate("/learning/study-plan")}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-white/10 font-bold transition shadow-2xs cursor-pointer text-center"
            >
              Study Plan
            </button>
            <button
              type="button"
              onClick={() => navigate("/learning/quiz")}
              className="py-1.5 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-2xs cursor-pointer"
            >
              Quiz ➔
            </button>
          </div>
        </div>

        {/* Pillar 4: Career & Action */}
        <div className="p-4.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/90 dark:border-emerald-900/40 shadow-2xs flex flex-col justify-between space-y-3 transition-colors">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-emerald-100/60 dark:border-emerald-900/30">
              <span className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <span>💼 Career</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">({Math.round((lifeScore?.weights?.career || 0.25) * 100)}%)</span>
              </span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 font-mono bg-white dark:bg-emerald-900/50 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                {careerScore}/100
              </span>
            </div>

            <div className="w-full bg-emerald-200/50 dark:bg-emerald-900/40 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${careerScore}%` }}
              ></div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">✓ Todos Done:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{lifeScore?.breakdown?.todosCompleted || 0} / {lifeScore?.breakdown?.todosTotal || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">🚀 Milestones:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{lifeScore?.breakdown?.actionMilestonesCompleted || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">💼 Interviews:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{lifeScore?.breakdown?.interviewsCompleted || 0}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-1.5 text-[11px] border-t border-emerald-100/60 dark:border-emerald-900/30">
            <button
              type="button"
              onClick={() => navigate("/create-todo")}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-white/10 font-bold transition shadow-2xs cursor-pointer text-center"
            >
              + Add Task
            </button>
            <button
              type="button"
              onClick={() => navigate("/career/applications")}
              className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-2xs cursor-pointer"
            >
              Jobs ➔
            </button>
          </div>
        </div>
      </div>

      {/* 🛡️ SPRINT 3.2: PROACTIVE HUMAN EA BURNOUT GUARD PROPOSAL CARD */}
      {reschedulerProposal?.triggered && !reschedulerProposal?.isRecoveryActive && !isReschedulerDismissed && (
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50/95 via-sky-50/90 to-indigo-50/80 border border-amber-200/90 shadow-2xs space-y-3 relative z-10 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100/90 text-amber-700 shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Chief of Staff • Recovery Proposal
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 border border-amber-300/80">
                    Health Deficit Detected
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {user?.name || "Explorer"}, I noticed you logged {reschedulerProposal?.evaluation?.reason || "low energy"}. Would you like me to lighten today's load by deferring {reschedulerProposal?.deferrableTasks?.length || 0} non-urgent tasks to tomorrow so you can recharge?
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1 flex-wrap">
            <button
              onClick={handleApplyRecovery}
              disabled={isApplyingRecovery}
              className="px-4 py-2 bg-gradient-to-r from-brand-indigo via-indigo-600 to-sky-600 hover:opacity-95 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isApplyingRecovery ? "Lightening Schedule..." : "Yes, lighten today"}</span>
            </button>

            <button
              onClick={() => setIsReschedulerDismissed(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
            >
              Keep schedule as is
            </button>
          </div>
        </div>
      )}

      {/* 🛡️ SPRINT 3.2: ACTIVE RECOVERY MODE STATUS BAR WITH UNDO */}
      {reschedulerProposal?.isRecoveryActive && (
        <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs relative z-10 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-emerald-950">🛡️ Recovery Mode Active:</span>
              <span className="text-emerald-800 ml-1.5 font-medium">Non-urgent tasks deferred to tomorrow • Streak is protected</span>
            </div>
          </div>

          {reschedulerProposal?.canUndo && (
            <button
              onClick={handleUndoRecovery}
              disabled={isUndoingRecovery}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 self-start sm:self-auto shrink-0 shadow-2xs"
              title="Restore deferred tasks back to today"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isUndoingRecovery ? "Restoring..." : "Undo Deferral"}</span>
            </button>
          )}
        </div>
      )}

      {/* 🌟 NEW USER STARTER QUEST (Instant Day-1 Hook) */}
      {isStarterUser && (
        <div className="mt-5 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-sky-200 dark:border-sky-800/60 shadow-xs space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Day-1 Starter Quest: Unlock Level 1 Pioneer
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              3 Quick Steps
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">1. Set Focus Goal</span>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">Done ✅</span>
            </div>

            <button
              onClick={() => navigate("/wellness/tracker")}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-700 flex items-center justify-between transition cursor-pointer text-left shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">2. Track Hydration</span>
              </div>
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">Open 💧</span>
            </button>

            <button
              onClick={() => setShowTaskInput(true)}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-700 flex items-center justify-between transition cursor-pointer text-left shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">3. Add 1st Task/Job</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">+15 pts 🔥</span>
            </button>
          </div>
        </div>
      )}

      {/* 🚀 WORK & PLANNING HUB: TODAY'S AGENDA | 7-DAY SCHEDULE | WEEKLY LIFE REPORT */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/80 dark:border-white/10 relative z-10">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs text-xs font-bold w-fit">
          <button
            onClick={() => setActiveView("today")}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeView === "today"
                ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/60 dark:border-white/10 font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ListTodo className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Today's Agenda</span>
            {agendaTasks.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeView === "today" ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}>
                {agendaTasks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView("horizon")}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeView === "horizon"
                ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/60 dark:border-white/10 font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>7-Day Schedule</span>
          </button>

          <button
            onClick={() => setIsWeeklyReportOpen(true)}
            className="px-3.5 py-2 rounded-xl text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer flex items-center gap-2 border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
            title="Open Universal 7-Day Weekly Life Audit"
          >
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Weekly Report</span>
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Audit
            </span>
          </button>
        </div>

        {/* Right Action Button */}
        <div className="flex items-center gap-2">
          {activeView === "today" ? (
            <button
              onClick={() => setShowTaskInput(!showTaskInput)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-indigo to-sky-500 hover:opacity-95 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showTaskInput ? "Cancel" : "Quick Add Task"}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setShowTaskInput(true);
                setActiveView("today");
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Schedule Event / Task</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: TODAY'S LIVE INTERACTIVE AGENDA */}
      {activeView === "today" && (
        <div className="mt-4 space-y-3 relative z-10 animate-fadeIn">

          {/* INLINE QUICK TASK ADD FORM */}
          {showTaskInput && (
            <form onSubmit={handleQuickAddTask} className="p-3.5 bg-white rounded-2xl border border-indigo-200 shadow-sm space-y-2.5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  placeholder="What would you like to schedule? (e.g. Brain Station Interview Prep, System Design Review)"
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800 placeholder-slate-400"
                  autoFocus
                />

                <input
                  type="date"
                  value={quickTaskDate}
                  onChange={(e) => setQuickTaskDate(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none cursor-pointer"
                  title="Target Date"
                />

                <select
                  value={quickTaskPriority}
                  onChange={(e) => setQuickTaskPriority(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority 🔴</option>
                  <option value="urgent">Urgent ⚡</option>
                  <option value="low">Low Priority</option>
                </select>

                <button
                  type="submit"
                  disabled={isSubmittingTask || !quickTaskTitle.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-brand-indigo to-sky-500 hover:opacity-95 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isSubmittingTask ? "Scheduling..." : "Schedule Task"}
                </button>
              </div>
            </form>
          )}

          {/* AGENDA ITEMS LIST WITH OPTIMISTIC CHECK */}
          {agendaTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {agendaTasks.map((task) => (
                <div
                  key={task._id}
                  className="group relative p-3.5 rounded-2xl bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-2xs hover:border-indigo-300 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="text-slate-300 hover:text-emerald-600 transition cursor-pointer shrink-0"
                      title="Mark complete"
                    >
                      <Circle className="w-4 h-4 hover:scale-110 transition" />
                    </button>
                    <span className="text-xs font-semibold text-slate-800 truncate">{task.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        task.priority === "high" || task.priority === "urgent"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.priority || "medium"}
                    </span>

                    <button
                      onClick={() => handleSnoozeTask(task._id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer text-[10px] font-bold"
                      title="Snooze to tomorrow"
                    >
                      ⏰
                    </button>
                  </div>

                  {/* Floating Optimistic Points Animation */}
                  {floatingPoints && floatingPoints.id === task._id && (
                    <span className="absolute right-4 -top-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-bounce">
                      {floatingPoints.pts}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/90 border border-emerald-200/80 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All scheduled tasks for today are clear! Excellent velocity.</span>
              </div>
              <button
                onClick={() => setShowTaskInput(true)}
                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                + Add Next Task
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: 7-DAY DAY-BY-DAY HORIZON SCHEDULE */}
      {activeView === "horizon" && (
        <div className="mt-5 space-y-3 relative z-10 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>7-Day Horizon Schedule (Day-by-Day Milestones)</span>
            </h3>

            <button
              onClick={() => {
                setShowTaskInput(true);
                setActiveView("today");
              }}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Event / Task</span>
            </button>
          </div>

          {/* 7-DAY HORIZON GRID CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
            {sevenDayHorizon.map((day, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition flex flex-col justify-between space-y-2.5 ${
                  day.isToday
                    ? "bg-indigo-50/90 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20"
                    : day.isTomorrow
                    ? "bg-sky-50/70 border-sky-200"
                    : "bg-white/80 border-slate-200/80 hover:bg-white"
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <div>
                    <p className={`text-xs font-black ${day.isToday ? "text-indigo-900" : "text-slate-800"}`}>
                      {day.dayName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{day.monthDay}</p>
                  </div>

                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      day.totalItems > 0
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {day.totalItems}
                  </span>
                </div>

                {/* Day Scheduled Items */}
                <div className="space-y-1.5 flex-1 min-h-[60px]">
                  {/* Interviews */}
                  {day.interviews.map((app, i) => (
                    <div
                      key={`int-${i}`}
                      onClick={() => navigate("/career/applications")}
                      className="p-1.5 rounded-lg bg-indigo-100/90 border border-indigo-200 text-indigo-900 text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-200 transition"
                      title={`${app.company} - ${app.roleTitle}`}
                    >
                      <Briefcase className="w-3 h-3 text-indigo-700 shrink-0" />
                      <span className="truncate">{app.company} (Interview)</span>
                    </div>
                  ))}

                  {/* Follow-ups */}
                  {day.followUps.map((app, i) => (
                    <div
                      key={`fol-${i}`}
                      onClick={() => navigate("/career/applications")}
                      className="p-1.5 rounded-lg bg-amber-100/90 border border-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-amber-200 transition"
                      title={`Follow up with ${app.company}`}
                    >
                      <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                      <span className="truncate">{app.company} (Follow-up)</span>
                    </div>
                  ))}

                  {/* Todos */}
                  {day.todos.map((todo, i) => (
                    <div
                      key={`todo-${i}`}
                      className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[10px] font-medium flex items-center justify-between gap-1"
                      title={todo.title}
                    >
                      <span className="truncate">{todo.title}</span>
                      {todo.priority === "urgent" && <span className="text-[8px] text-rose-600 font-bold">⚡</span>}
                    </div>
                  ))}

                  {day.totalItems === 0 && (
                    <p className="text-[10px] text-slate-400 italic pt-2 text-center">Open Focus</p>
                  )}
                </div>

                {/* Quick Schedule Button for this specific day */}
                <button
                  onClick={() => {
                    setQuickTaskDate(day.dateStr);
                    setShowTaskInput(true);
                    setActiveView("today");
                  }}
                  className="w-full py-1 text-[10px] font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-md transition text-center cursor-pointer border border-dashed border-slate-200 hover:border-indigo-300"
                >
                  + Add Event
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HORIZON & DIRECT ACTION BRIDGES */}
      {briefing.priorities && briefing.priorities.length > 0 && (
        <div className="mt-5 pt-3.5 border-t border-slate-200/70 relative z-10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Assistant Shortcuts:</span>
          </span>

          {briefing.priorities.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.actionUrl || "/dashboard")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-[0.98] ${
                item.urgency === "high"
                  ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                  : item.category === "career"
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  : item.category === "learning"
                  ? "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.category === "career" && <Briefcase className="w-3 h-3" />}
              {item.category === "learning" && <BookOpen className="w-3 h-3" />}
              {item.category === "health" && <Droplets className="w-3 h-3 text-sky-600" />}
              {item.category === "task" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              <span>{item.title}</span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* MYSTERY DAILY TIP & STREAK BADGE */}
      <div className="mt-4 p-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/80 flex items-center justify-between text-xs relative z-10 shadow-2xs">
        <div className="flex items-center gap-2 text-slate-700">
          {isActionCompletedToday ? (
            <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className="font-medium">
            {isActionCompletedToday
              ? `💡 Focus Intelligence: “${briefing.learningFocus || briefing.motivationalQuote || "Consistency breeds excellence."}”`
              : "🔒 Complete 1 action or concrete sleep record today to reveal your custom Chief of Staff intelligence"}
          </span>
        </div>

        {/* Streak Flame Badge */}
        <div className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 shrink-0">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{streak || 0}d Streak Active</span>
        </div>
      </div>

      {/* 7-Day Universal Weekly Life Report Modal */}
      <WeeklyReportModal
        isOpen={isWeeklyReportOpen}
        onClose={() => setIsWeeklyReportOpen(false)}
      />
    </div>
  );
}
