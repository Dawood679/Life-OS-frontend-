import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FeatureLayout from "../../src/components/FeatureLayout";

const getLocalDateString = (dateObj = new Date()) => {
  const tzOffset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - tzOffset).toISOString().split("T")[0];
};

const TAB_KEYS = {
  DASHBOARD: "dashboard",
  INSIGHTS: "insights",
  SETTINGS: "settings",
};

export default function WellnessTracker() {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // --- States ---
  const [activeTab, setActiveTab] = useState(TAB_KEYS.DASHBOARD);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [log, setLog] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Input states for daily tracking
  const [sleepInput, setSleepInput] = useState({ hours: "", quality: "" });
  const [activityInput, setActivityInput] = useState({ type: "none", minutes: "" });
  const [screenTimeInput, setScreenTimeInput] = useState({ usedMinutes: "" });

  // Settings state
  const [settings, setSettings] = useState({
    targetMl: 2000,
    isActive: false,
    isEmailAlertEnabled: false,
    wakeTime: "08:00",
    sleepTime: "22:00",
    intervalHours: 2,
  });

  const [isAutoInterval, setIsAutoInterval] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    fetchDailyLog(selectedDate);
    fetchRecentLogs();
  }, [selectedDate]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/wellness/water-settings`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.data?.waterSettings) {
        setSettings(data.data.waterSettings);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  const fetchDailyLog = async (dateStr) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${BACKEND_URL}/wellness/logs/${dateStr}`, { credentials: "include" });
      const data = await res.json();

      if (res.ok) {
        if (data.data) {
          setLog(data.data);
          setSleepInput({ hours: data.data.sleep?.hours || "", quality: data.data.sleep?.quality || "" });
          setActivityInput({ type: data.data.activity?.type || "none", minutes: data.data.activity?.minutes || "" });
          setScreenTimeInput({ usedMinutes: data.data.screenTime?.usedMinutes || "" });
        } else {
          setLog(null);
          setSleepInput({ hours: "", quality: "" });
          setActivityInput({ type: "none", minutes: "" });
          setScreenTimeInput({ usedMinutes: "" });
        }
      } else {
        setError(data.message || "Failed to load wellness data.");
      }
    } catch (err) {
      console.error("Fetch log error:", err);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const today = new Date();
      const pastWeek = new Date(today);
      pastWeek.setDate(pastWeek.getDate() - 6);
      
      const to = getLocalDateString(today);
      const from = getLocalDateString(pastWeek);

      const res = await fetch(`${BACKEND_URL}/wellness/logs?from=${from}&to=${to}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setRecentLogs(data.data || []);
    } catch (err) {
      console.error("Fetch recent logs error:", err);
    }
  };

  // --- Handlers ---
  const updateMetric = async (endpoint, payload, widgetName) => {
    try {
      setActionLoading(widgetName);
      setError("");
      
      const res = await fetch(`${BACKEND_URL}/wellness/${endpoint}`, {
        method: endpoint === "water" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: selectedDate, ...payload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to update ${widgetName}`);
      
      setLog(data.data);
      fetchRecentLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const calculateAutoInterval = () => {
    const wakeH = parseInt(settings.wakeTime.split(":")[0]) || 8;
    const sleepH = parseInt(settings.sleepTime.split(":")[0]) || 22;
    const awakeHours = sleepH > wakeH ? sleepH - wakeH : (24 - wakeH + sleepH);
    const totalGlassesNeeded = Math.ceil(settings.targetMl / 250);
    const calcInterval = Math.floor(awakeHours / totalGlassesNeeded);
    return calcInterval < 1 ? 1 : calcInterval;
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setActionLoading("settings");
      setError("");
      setSuccessMsg("");

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const finalInterval = isAutoInterval ? calculateAutoInterval() : settings.intervalHours;

      const payload = { ...settings, intervalHours: finalInterval, timezone };

      const res = await fetch(`${BACKEND_URL}/wellness/water-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save settings");
      
      setSuccessMsg(`Settings saved! Reminders set for every ${finalInterval} hour(s).`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Derived Data for Insights & Burnout Warning ---
  const insightsData = useMemo(() => {
    const chartDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = getLocalDateString(d);
      const foundLog = recentLogs.find((l) => l.date === dateStr);
      return {
        dateStr,
        label: d.toLocaleDateString("en-US", { weekday: 'short' }),
        score: foundLog?.energyScore || 0
      };
    });

    // Feature #7: Rule-based Burnout Threshold (3 consecutive days with score < 50)
    const sortedLogs = [...recentLogs].sort((a, b) => (a.date > b.date ? -1 : 1));
    const last3Logs = sortedLogs.slice(0, 3);
    
    let consecutiveLowCount = 0;
    for (let log of last3Logs) {
      if (log.energyScore !== undefined && log.energyScore < 50) {
        consecutiveLowCount++;
      } else {
        break;
      }
    }

    const isBurnoutWarning = consecutiveLowCount >= 3;
    const avgRecentScore = last3Logs.length > 0 
      ? last3Logs.reduce((acc, curr) => acc + (curr.energyScore || 0), 0) / last3Logs.length 
      : 100;

    return { chartDays, isBurnoutWarning, avgRecentScore };
  }, [recentLogs]);


  // --- Render Sections ---
  const renderHero = () => {
    const isToday = selectedDate === getLocalDateString();
    const energyScore = log?.energyScore;

    return (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
            {isToday ? "Today's Overview" : new Date(selectedDate).toDateString()}
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold">
            {isToday ? "How are you feeling today?" : "Historical Log"}
          </h2>
          <p className="text-sky-100 text-xs md:text-sm">Track your daily habits to power your AI Energy Engine.</p>
        </div>
        {energyScore !== null && energyScore !== undefined && (
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">Energy Score</p>
            <div className="flex items-baseline justify-center gap-1 mt-1">
              <span className="text-4xl font-black">{Math.round(energyScore)}</span>
              <span className="text-sm text-sky-200">/100</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSidebar = () => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getLocalDateString(d);
    });

    return (
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Past 7 Days</h3>
        <div className="space-y-2">
          {days.map((dateStr) => {
            const isSelected = selectedDate === dateStr && activeTab === TAB_KEYS.DASHBOARD;
            const isToday = dateStr === getLocalDateString();
            const foundLog = recentLogs.find(l => l.date === dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setActiveTab(TAB_KEYS.DASHBOARD);
                }}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-300" : "bg-white/60 border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {new Date(dateStr).getDate()}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isSelected ? "text-indigo-900" : "text-slate-700"}`}>
                      {isToday ? "Today" : new Date(dateStr).toLocaleDateString("en-US", { weekday: 'short' })}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {new Date(dateStr).toLocaleDateString("en-US", { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {foundLog?.energyScore > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${foundLog.energyScore >= 70 ? 'bg-emerald-100 text-emerald-700' : foundLog.energyScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                    {Math.round(foundLog.energyScore)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDashboardWidgets = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* WATER TRACKER */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.34A5.84 5.84 0 0 1 2 12.28 5.9 5.9 0 0 1 8 6.55a5.9 5.9 0 0 1 6 5.73 5.84 5.84 0 0 1 0 2.38A5.9 5.9 0 0 1 20 14.66z" /></svg>
            <h3 className="font-bold text-sm">Water Intake</h3>
          </div>
          {actionLoading === "water" && <span className="w-4 h-4 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin"></span>}
        </div>
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>{log?.water?.consumedMl || 0} ml</span>
            <span>Target: {settings.targetMl || 2000} ml</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-400 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(((log?.water?.consumedMl || 0) / (settings.targetMl || 2000)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => updateMetric("water", { amountMl: 250 }, "water")} disabled={actionLoading === "water"} className="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-700 py-2 rounded-xl text-xs font-bold transition cursor-pointer">+ 250ml 🥛</button>
          <button onClick={() => updateMetric("water", { amountMl: 500 }, "water")} disabled={actionLoading === "water"} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-xl text-xs font-bold transition cursor-pointer">+ 500ml 💧</button>
        </div>
      </div>

      {/* MOOD TRACKER */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="font-bold text-sm">How are you feeling?</h3>
          </div>
          {actionLoading === "mood" && <span className="w-4 h-4 border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin"></span>}
        </div>
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
          {[{ v: 1, e: "😡", l: "Awful" }, { v: 2, e: "🙁", l: "Bad" }, { v: 3, e: "😐", l: "Okay" }, { v: 4, e: "🙂", l: "Good" }, { v: 5, e: "🤩", l: "Great" }].map((m) => (
            <button key={m.v} onClick={() => updateMetric("mood", { value: m.v }, "mood")} disabled={actionLoading === "mood"} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition cursor-pointer hover:scale-110 ${log?.mood?.value === m.v ? "bg-rose-100 ring-1 ring-rose-300" : "hover:bg-slate-200"}`}>
              <span className="text-2xl">{m.e}</span><span className={`text-[9px] font-bold ${log?.mood?.value === m.v ? "text-rose-700" : "text-slate-400"}`}>{m.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SLEEP TRACKER */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          <h3 className="font-bold text-sm">Sleep Log</h3>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <input type="number" placeholder="0" value={sleepInput.hours} onChange={(e) => setSleepInput({...sleepInput, hours: e.target.value})} className="w-16 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 text-center focus:outline-none focus:border-indigo-500" />
            <span className="text-xs font-bold text-slate-500">Hours Slept</span>
          </div>
          <div className="flex gap-2 text-xs font-medium">
            {['poor', 'average', 'good', 'excellent'].map((q) => (
              <button key={q} onClick={() => setSleepInput({...sleepInput, quality: q})} className={`flex-1 py-1.5 rounded-lg capitalize border transition cursor-pointer ${sleepInput.quality === q ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-bold" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{q}</button>
            ))}
          </div>
          <button onClick={() => updateMetric("sleep", { hours: Number(sleepInput.hours), quality: sleepInput.quality }, "sleep")} disabled={!sleepInput.hours || !sleepInput.quality || actionLoading === "sleep"} className="w-full mt-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer">
            {actionLoading === "sleep" ? "Saving..." : "Save Sleep Log"}
          </button>
        </div>
      </div>

      {/* ACTIVITY & SCREEN TIME */}
      <div className="flex flex-col gap-4">
        {/* Activity */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex-1">
          <h3 className="font-bold text-sm text-emerald-500 mb-2 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Activity</h3>
          <div className="flex gap-2 mb-2">
            <select value={activityInput.type} onChange={(e) => setActivityInput({...activityInput, type: e.target.value})} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none">
              <option value="none">None</option><option value="walk">Walk</option><option value="run">Run</option><option value="gym">Gym</option>
            </select>
            <input type="number" placeholder="Mins" value={activityInput.minutes} onChange={(e) => setActivityInput({...activityInput, minutes: e.target.value})} className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-700 text-center focus:outline-none" />
          </div>
          <button onClick={() => updateMetric("activity", { type: activityInput.type, minutes: Number(activityInput.minutes) }, "activity")} disabled={actionLoading === "activity" || !activityInput.minutes} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer">Save</button>
        </div>
        {/* Screen Time */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex-1">
          <h3 className="font-bold text-sm text-purple-500 mb-2 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> Screen Time</h3>
          <div className="flex gap-2 mb-2">
            <input type="number" placeholder="0" value={screenTimeInput.usedMinutes} onChange={(e) => setScreenTimeInput({usedMinutes: e.target.value})} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none" />
            <span className="text-xs font-bold text-slate-500 self-center">Mins</span>
          </div>
          <button onClick={() => updateMetric("screen-time", { usedMinutes: Number(screenTimeInput.usedMinutes) }, "screenTime")} disabled={actionLoading === "screenTime" || !screenTimeInput.usedMinutes} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer">Save</button>
        </div>
      </div>
    </div>
  );

  // --- INSIGHTS & ANALYTICS TAB ---
  const renderInsights = () => (
    <div className="space-y-6">
      {/* 1. Burnout Early Warning (Feature #7) */}
      {insightsData.isBurnoutWarning && (
        <div className="bg-gradient-to-r from-rose-500 to-red-500 rounded-3xl p-6 text-white shadow-lg flex items-start gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0">⚠️</div>
          <div>
            <h3 className="font-bold text-lg">Burnout Early Warning</h3>
            <p className="text-xs text-rose-100 mt-1 leading-relaxed">
              Your average energy score over the last 3 days has dropped to <b>{Math.round(insightsData.avgRecentScore)}</b>. 
              This pattern often leads to burnout. Consider getting more sleep, stepping away from screens, and taking a lighter workload tomorrow. LifeOS AI has flagged this to adjust your task scheduling.
            </p>
          </div>
        </div>
      )}

      {/* 2. 7-Day Energy Trend Chart (Pure CSS) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
        <h3 className="font-bold text-base text-slate-800 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
          Energy Score Trend (Last 7 Days)
        </h3>
        
        <div className="h-48 flex items-end justify-between gap-2 md:gap-4 mt-8 pt-4 border-b border-slate-100 relative">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-slate-300 font-bold pr-2">
            <span className="w-full border-t border-dashed border-slate-100 relative"><span className="absolute -top-2 -left-6">100</span></span>
            <span className="w-full border-t border-dashed border-slate-100 relative"><span className="absolute -top-2 -left-6">50</span></span>
            <span className="w-full relative"><span className="absolute -top-2 -left-6">0</span></span>
          </div>

          {insightsData.chartDays.map((day, idx) => {
            const height = day.score > 0 ? `${day.score}%` : '4px';
            const color = day.score >= 70 ? 'from-emerald-400 to-emerald-500' 
                        : day.score >= 50 ? 'from-amber-400 to-amber-500' 
                        : day.score > 0 ? 'from-rose-400 to-rose-500' 
                        : 'from-slate-200 to-slate-200';

            return (
              <div key={idx} className="flex flex-col items-center justify-end h-full w-full relative group z-10">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded-lg transition-opacity whitespace-nowrap pointer-events-none">
                  Score: {Math.round(day.score)}
                </div>
                <div 
                  className={`w-full max-w-[40px] rounded-t-lg bg-gradient-to-t ${color} transition-all duration-700 ease-out`}
                  style={{ height }}
                ></div>
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Universal LifeOS Weekly Executive Report Bridge */}
      <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 text-white rounded-3xl p-6 md:p-8 border border-purple-500/30 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-bl-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-400/20 text-purple-200 border border-purple-400/30">
                ✦ Universal 3-Pillar Audit
              </span>
              <span className="text-[10px] text-purple-300 font-medium">Health • Learning • Career</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Master Weekly Life Intelligence Report</h3>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Your weekly health metrics are unified with your <span className="font-bold text-white">Study Plans, AI Quizzes, Job Applications, Medicine Adherence</span>, and <span className="font-bold text-white">Life Score (0–100)</span> into a master executive retrospective on your main dashboard.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-purple-500/25 transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer group"
          >
            <span>Open Dashboard Report</span>
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-900 text-lg cursor-pointer">×</button>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <h3 className="font-bold text-base text-slate-800">Daily Goals</h3>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Daily Water Target (ml)</label>
            <input type="number" value={settings.targetMl} onChange={(e) => setSettings({...settings, targetMl: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition" />
            <p className="text-[10px] text-slate-400 mt-1.5">Recommended: 2000ml to 3000ml per day.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
           <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <h3 className="font-bold text-base text-slate-800">Smart Reminders</h3>
          </div>

          <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-800">Enable Water Reminders</p>
              <p className="text-xs text-slate-500">Receive alerts to stay hydrated</p>
            </div>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={settings.isActive} onChange={() => setSettings({...settings, isActive: !settings.isActive})} />
              <div className={`block w-12 h-7 rounded-full transition-colors ${settings.isActive ? "bg-indigo-500" : "bg-slate-300"}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${settings.isActive ? "translate-x-5" : ""}`}></div>
            </div>
          </label>

          <label className={`flex items-center justify-between cursor-pointer p-4 rounded-2xl border transition ${settings.isActive ? "bg-slate-50 border-slate-100" : "bg-slate-50/50 border-slate-100/50 opacity-60"}`}>
            <div>
              <p className="text-sm font-bold text-slate-800">Email Alerts</p>
              <p className="text-xs text-slate-500">Send reminders to your registered email</p>
            </div>
            <div className="relative">
              <input type="checkbox" className="sr-only" disabled={!settings.isActive} checked={settings.isEmailAlertEnabled} onChange={() => setSettings({...settings, isEmailAlertEnabled: !settings.isEmailAlertEnabled})} />
              <div className={`block w-12 h-7 rounded-full transition-colors ${settings.isEmailAlertEnabled ? "bg-sky-500" : "bg-slate-300"}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${settings.isEmailAlertEnabled ? "translate-x-5" : ""}`}></div>
            </div>
          </label>

          {settings.isActive && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Wake Time</label>
                  <input type="time" value={settings.wakeTime} onChange={(e) => setSettings({...settings, wakeTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sleep Time</label>
                  <input type="time" value={settings.sleepTime} onChange={(e) => setSettings({...settings, sleepTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none" />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Reminder Frequency</label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                  <button type="button" onClick={() => setIsAutoInterval(true)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${isAutoInterval ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Auto (Smart AI)</button>
                  <button type="button" onClick={() => setIsAutoInterval(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${!isAutoInterval ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Manual Setup</button>
                </div>
                
                <div className="mt-3">
                  {isAutoInterval ? (
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                      <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                        ✨ LifeOS will automatically calculate the best time to remind you based on your daily target ({settings.targetMl}ml) and waking hours.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <select value={settings.intervalHours} onChange={(e) => setSettings({...settings, intervalHours: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none">
                        <option value={1}>Every 1 Hour</option><option value={2}>Every 2 Hours</option><option value={3}>Every 3 Hours</option><option value={4}>Every 4 Hours</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={actionLoading === "settings"} className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:opacity-95 text-white py-3.5 rounded-2xl text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
          {actionLoading === "settings" ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> Saving Settings...</> : "Save Preferences"}
        </button>
      </form>
    </div>
  );

  const tabs = [
    { key: TAB_KEYS.DASHBOARD, label: "Daily Tracker" },
    { key: TAB_KEYS.INSIGHTS, label: "Insights & AI" },
    { key: TAB_KEYS.SETTINGS, label: "Settings & Reminders" },
  ];

  return (
    <FeatureLayout
      badgeText="Health OS"
      title="Wellness Tracker"
      subtitle="Log your daily metrics to power your AI Energy Score"
      onBack={() => navigate(-1)}
      backTooltip="Go Back"
      loading={loading && !log && activeTab === TAB_KEYS.DASHBOARD}
      error={error}
      setError={setError}
      hasItems={true} 
      isCreatingNew={false}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      renderHero={renderHero}
      renderSidebar={renderSidebar}
      renderTabContent={
        activeTab === TAB_KEYS.DASHBOARD ? renderDashboardWidgets : 
        activeTab === TAB_KEYS.INSIGHTS ? renderInsights : 
        renderSettings
      }
    />
  );
}