import { useEffect, useState, useRef } from "react";
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
  AlertCircle,
  Flame,
  Clock
} from "lucide-react";

export default function DailyBriefingCard() {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Audio Speech Synthesis State
  const [speechState, setSpeechState] = useState("idle"); // 'idle' | 'playing' | 'paused'
  const speechUtteranceRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka";

  // Fetch or retrieve cached briefing on mount
  useEffect(() => {
    fetchBriefing();

    // Cleanup audio on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/daily-briefing/today`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-timezone": userTimezone,
        },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setBriefing(data.data);
      }
    } catch (err) {
      console.warn("Failed to load daily briefing:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRefreshing(true);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeechState("idle");
      }

      const res = await fetch(`${BACKEND_URL}/daily-briefing/regenerate`, {
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
        toast.success("Executive briefing refreshed!");
      } else {
        toast.error("Could not refresh briefing right now.");
      }
    } catch {
      toast.error("Network error during briefing refresh.");
    } finally {
      setRefreshing(false);
    }
  };

  // Web Speech Synthesis Controller
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

    const quote = briefing.motivationalQuote || "Small daily improvements over time lead to stunning results. Keep building momentum!";
    let voiceScript = briefing.spokenAudioScript || "";
    if (voiceScript) {
      voiceScript = voiceScript.replace(
        /^(Good morning|Good afternoon|Good evening|Welcome back|Welcome to your LifeOS agenda|Welcome)/i,
        currentGreeting
      );
      if (!voiceScript.includes("Remember:")) {
        voiceScript += ` Remember: ${quote}`;
      }
    } else {
      voiceScript = `${briefing.greeting || currentGreeting}. Your Life Score is ${
        briefing.statsSnapshot?.compositeScore || 0
      } out of 100. ${briefing.executiveSummary}. ${
        briefing.healthWellnessAdvice ? briefing.healthWellnessAdvice : ""
      } Remember: ${quote}`;
    }

    const utterance = new SpeechSynthesisUtterance(voiceScript);
    utterance.rate = 0.98;
    utterance.pitch = 1.05;

    // Pick natural Executive Female voice if available
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
      <div className="w-full bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 bg-slate-200 rounded-full" />
          <div className="h-4 w-20 bg-slate-200 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
        <div className="h-4 w-full bg-slate-100 rounded-lg" />
        <div className="h-4 w-5/6 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  if (!briefing) return null;

  const isMorning = briefing.period === "morning";
  const stats = briefing.statsSnapshot || {};

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 md:p-7 border transition-all shadow-xs backdrop-blur-md text-left ${
        isMorning
          ? "bg-gradient-to-br from-amber-500/10 via-sky-500/5 to-indigo-500/10 border-amber-200/80"
          : "bg-gradient-to-br from-indigo-950/10 via-slate-900/5 to-purple-950/10 border-indigo-200/80"
      }`}
    >
      {/* Decorative Glow Ambient */}
      <div
        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${
          isMorning ? "bg-amber-400" : "bg-indigo-500"
        }`}
      />

      {/* TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isMorning
                ? "bg-amber-100/90 text-amber-800 border border-amber-300/80"
                : "bg-indigo-100/90 text-indigo-800 border border-indigo-300/80"
            }`}
          >
            {isMorning ? <Sun className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{isMorning ? "Morning Executive Briefing" : "Evening Performance Recap"}</span>
          </span>

          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {briefing.date}
          </span>
        </div>

        {/* Audio Speech Controls & AI Refresh */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {speechState === "idle" && (
            <button
              onClick={handlePlayVoice}
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-xl text-xs font-bold border border-slate-200/80 shadow-2xs transition cursor-pointer flex items-center gap-1.5 hover:text-indigo-600"
              title="Listen to Executive Briefing"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Listen</span>
            </button>
          )}

          {speechState === "playing" && (
            <div className="flex items-center gap-1 bg-white/90 p-0.5 rounded-xl border border-indigo-200">
              <button
                onClick={handlePauseVoice}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                title="Pause audio"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStopVoice}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Stop audio"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-indigo-600 pr-2 animate-pulse">Playing...</span>
            </div>
          )}

          {speechState === "paused" && (
            <div className="flex items-center gap-1 bg-white/90 p-0.5 rounded-xl border border-amber-200">
              <button
                onClick={handlePlayVoice}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                title="Resume audio"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStopVoice}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Stop audio"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-amber-600 pr-2">Paused</span>
            </div>
          )}

          <button
            onClick={handleRegenerate}
            disabled={refreshing}
            className="p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200/80 shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Refresh AI Story with latest facts"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* GREETING & EXECUTIVE SUMMARY */}
      <div className="mt-4 space-y-2 relative z-10">
        <h2 className="text-lg md:text-xl font-serif font-black text-slate-900 tracking-tight">
          {briefing.greeting}
        </h2>
        <p className="text-xs md:text-sm text-slate-700 leading-relaxed max-w-4xl font-normal">
          {briefing.executiveSummary}
        </p>
      </div>

      {/* LIVE DETERMINISTIC SNAPSHOT STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 mt-5 relative z-10">
        {/* Composite Life Score */}
        <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Life Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-serif font-black text-slate-900">{stats.compositeScore || 0}</span>
            <span className="text-[10px] text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Streak</p>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-lg font-serif font-black text-slate-900">{stats.streakCount || 0}d</span>
            {stats.streakSecured ? (
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">Secured</span>
            ) : (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">Pending</span>
            )}
          </div>
        </div>

        {/* Active Todos */}
        <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Agenda Tasks</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-serif font-black text-slate-900">{stats.todosActive || 0}</span>
            <span className="text-[10px] text-slate-400">active ({stats.todosCompleted || 0} done)</span>
          </div>
        </div>

        {/* Hydration / Water */}
        <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hydration</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-serif font-black text-sky-700">{stats.waterConsumedMl || 0}</span>
            <span className="text-[10px] text-slate-400">/ {stats.waterTargetMl || 2000} ml</span>
          </div>
        </div>

        {/* Job Pipeline Alert */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Interviews & Alerts</p>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">
              {stats.interviewsScheduled > 0
                ? `${stats.interviewsScheduled} Interview Today!`
                : stats.followUpsDue > 0
                ? `${stats.followUpsDue} Follow-up Due`
                : "Pipeline Optimal"}
            </span>
          </div>
        </div>
      </div>

      {/* SMART ACTION SHORTCUT CHIPS */}
      {briefing.priorities && briefing.priorities.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200/60 relative z-10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Direct Actions:</span>
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
              <ArrowRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* MOTIVATIONAL FOOTER */}
      {briefing.motivationalQuote && (
        <div className="mt-3 text-[11px] text-slate-500 italic flex items-center gap-1.5">
          <span>“{briefing.motivationalQuote}”</span>
        </div>
      )}
    </div>
  );
}
