import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WellnessPage() {
  const navigate = useNavigate();

  // Core Data States
  const [checkIn, setCheckIn] = useState(null);
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("tracker"); // 'tracker' | 'settings'

  // Loading & Global States
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Custom Quick Log Input State
  const [customMl, setCustomMl] = useState("250");

  // Settings States (Mapped directly to backend WellnessSettings Schema)
  const [waterGoalMl, setWaterGoalMl] = useState(2000);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMode, setReminderMode] = useState("auto");
  const [intervalMinutes, setIntervalMinutes] = useState(120);
  const [activeStart, setActiveStart] = useState("08:00");
  const [activeEnd, setActiveEnd] = useState("22:00");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  // UI Interactivity States
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Quick Preset Options with Custom Icons & UX Labels
  const WATER_PRESETS = [
    { label: "Glass of Water", amount: 250, icon: "🥛", subtitle: "Standard Glass" },
    { label: "Water Bottle", amount: 500, icon: "🍼", subtitle: "Handy Bottle" },
    { label: "Sport Canteen", amount: 750, icon: "🏋️", subtitle: "Workout Session" },
    { label: "Large Jug", amount: 1000, icon: "🫙", subtitle: "1 Full Liter" },
  ];

  // Fetch All Wellness Data
  useEffect(() => {
    fetchWellnessData();
    fetchNotifications();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const fetchWellnessData = async () => {
    try {
      setInitialFetching(true);
      setError("");

      const [todayRes, historyRes, settingsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/wellness/today`, { credentials: "include" }),
        fetch(`${BACKEND_URL}/wellness/history?days=7`, { credentials: "include" }),
        fetch(`${BACKEND_URL}/wellness/settings`, { credentials: "include" }),
      ]);

      if (todayRes.ok) {
        const todayData = await todayRes.json();
        if (todayData.checkIn) setCheckIn(todayData.checkIn);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        if (historyData.history) setHistory(historyData.history);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        const s = settingsData.settings || settingsData;
        if (s) {
          setWaterGoalMl(s.waterGoalMl || 2000);
          if (s.reminder) {
            setReminderEnabled(!!s.reminder.enabled);
            setReminderMode(s.reminder.mode || "auto");
            setIntervalMinutes(s.reminder.intervalMinutes || 120);
            setActiveStart(s.reminder.activeStart || "08:00");
            setActiveEnd(s.reminder.activeEnd || "22:00");
            setEmailEnabled(s.reminder.emailEnabled ?? true);
            setInAppEnabled(s.reminder.inAppEnabled ?? true);
          }
        }
      }
    } catch {
      setError("Unable to connect to server. Please verify backend connection.");
    } finally {
      setInitialFetching(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/notifications`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  // 1-Tap Water Logging Handler
  const handleLogWater = async (amount) => {
    const logAmount = Number(amount);
    if (!logAmount || logAmount <= 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/wellness/water`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amountMl: logAmount }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to log water.");

      setCheckIn(data.checkIn);
      triggerToast(`+${logAmount}ml added! Great job staying hydrated 💧`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save Settings & Cron Configuration
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        waterGoalMl: Number(waterGoalMl),
        reminder: {
          enabled: reminderEnabled,
          mode: reminderMode,
          intervalMinutes: Number(intervalMinutes),
          activeStart,
          activeEnd,
          emailEnabled,
          inAppEnabled,
        },
      };

      const res = await fetch(`${BACKEND_URL}/wellness/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update settings.");

      triggerToast("Hydration preferences and scheduler updated!");
      await fetchWellnessData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Logged Entry
  const handleDeleteEntry = async (entryId) => {
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/wellness/water/${entryId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete log.");

      setCheckIn(data.checkIn);
      setEntryToDelete(null);
      triggerToast("Entry removed successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Derived Calculations
  const totalMl = checkIn?.water?.totalMl || 0;
  const goalMl = waterGoalMl || 2000;
  const progressPercent = Math.min(Math.round((totalMl / goalMl) * 100), 100);
  const remainingMl = Math.max(goalMl - totalMl, 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  if (initialFetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Hydration Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 pb-16 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 transition cursor-pointer"
          >
            <span className="text-base">←</span> Dashboard
          </button>

          <div className="flex items-center gap-2">
            <span className="text-lg">💧</span>
            <h1 className="text-sm font-extrabold text-slate-800 tracking-tight">
              HydroPulse
            </h1>
          </div>

          {/* Real-time Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              aria-label="Notifications"
            >
              <span className="text-base">🔔</span>
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotificationDrawer && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800">Reminders Log</span>
                  <button
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-sky-600 font-semibold hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No active notifications right now.
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.map((notif, idx) => (
                      <div
                        key={notif._id || idx}
                        className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl space-y-0.5"
                      >
                        <p className="text-xs font-bold text-sky-900">
                          {notif.title || "💧 Time to Drink Water"}
                        </p>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Error / Notification Toasts */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {toastMessage && (
          <div className="p-4 bg-sky-600 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
            <span>✨ {toastMessage}</span>
          </div>
        )}

        {/* HERO HYDRATION CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-sky-500/15">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Left Column: Metrics & Visual Progress Bar */}
            <div className="md:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase">
                <span>🎯 Goal: {(goalMl / 1000).toFixed(1)} Liters</span>
                <span>•</span>
                <span>{reminderEnabled ? `⏰ Reminder Active` : `🔕 Reminder Off`}</span>
              </div>

              <div>
                <p className="text-xs text-sky-100 font-medium uppercase tracking-wider">
                  Today's Intake
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black tracking-tight">
                    {totalMl}
                  </span>
                  <span className="text-lg text-sky-200 font-bold">/ {goalMl} ml</span>
                </div>
              </div>

              {/* Progress Bar Component */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-sky-100">
                  <span>{progressPercent}% Achieved</span>
                  <span>
                    {remainingMl > 0 ? `${remainingMl} ml left` : "Daily Target Met! 🎉"}
                  </span>
                </div>
                <div className="w-full h-3.5 bg-white/20 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Circular Badge */}
            <div className="hidden md:flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl shadow-inner">
                💧
              </div>
              <div>
                <p className="text-sm font-extrabold">{remainingMl === 0 ? "Fully Hydrated!" : "Keep Going!"}</p>
                <p className="text-[11px] text-sky-100 mt-0.5">
                  {reminderEnabled ? `Next check inside: ${activeStart} - ${activeEnd}` : "Turn on reminders in settings"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl max-w-xs mx-auto">
          <button
            onClick={() => setActiveTab("tracker")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === "tracker"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🥤 Quick Log
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === "settings"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* TAB 1: QUICK LOGGING TRACKER */}
        {activeTab === "tracker" && (
          <div className="space-y-8">
            {/* 1-Tap Log Cards */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Intake Amount (1-Tap Add)
                </h2>
                <span className="text-xs text-sky-600 font-semibold">
                  Clicking adds immediately
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WATER_PRESETS.map((preset) => (
                  <button
                    key={preset.amount}
                    onClick={() => handleLogWater(preset.amount)}
                    disabled={loading}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-400 hover:shadow-md transition-all text-left group cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-3xl group-hover:scale-110 transition-transform">
                        {preset.icon}
                      </span>
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-black text-[11px] rounded-lg border border-sky-100">
                        +{preset.amount}ml
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 block">
                      {preset.label}
                    </p>
                    <p className="text-[10px] text-slate-400 block mt-0.5">
                      {preset.subtitle}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Logger */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Or Log Custom Amount
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogWater(customMl);
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="50"
                    step="25"
                    value={customMl}
                    onChange={(e) => setCustomMl(e.target.value)}
                    className="w-full p-3 pl-4 pr-12 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Enter ml (e.g. 350)"
                  />
                  <span className="absolute right-4 top-3 text-xs text-slate-400 font-bold">
                    ml
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  {loading ? "Logging..." : "Log Water"}
                </button>
              </form>
            </div>

            {/* Logs & History Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Today's Entries */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Today's Logs ({checkIn?.water?.entries?.length || 0})
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {totalMl} ml total
                  </span>
                </div>

                {checkIn?.water?.entries?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    No water intake logged today yet. Tap a glass above to start!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {checkIn?.water?.entries?.map((entry) => (
                      <div
                        key={entry._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-sky-200 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🥛</span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              +{entry.amountMl} ml
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(entry.loggedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setEntryToDelete(entry._id)}
                          className="text-slate-400 hover:text-rose-500 text-xs p-1.5 transition cursor-pointer"
                          title="Delete entry"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 7-Day History Sidebar */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  7-Day History
                </h3>

                <div className="space-y-2">
                  {history.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No history records.</p>
                  ) : (
                    history.map((day) => {
                      const dayTotal = day.water?.totalMl || 0;
                      const dayGoal = day.water?.goalMl || goalMl;
                      const isMet = dayTotal >= dayGoal;

                      return (
                        <div
                          key={day.date}
                          className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-700">{day.date}</p>
                            <p className="text-[10px] text-slate-400">{dayTotal} / {dayGoal} ml</p>
                          </div>
                          {isMet ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                              Met Target
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                              {Math.round((dayTotal / dayGoal) * 100)}%
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUTOMATION & SCHEDULER SETTINGS */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Hydration & Automated Reminders
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure daily targets and automated cron check-ins.
                </p>
              </div>

              {/* Goal Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Daily Hydration Goal (ml)
                </label>
                <input
                  type="number"
                  step="100"
                  value={waterGoalMl}
                  onChange={(e) => setWaterGoalMl(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500/40"
                />
                <p className="text-[10px] text-slate-400">Recommended: 2000 ml (2.0L) daily</p>
              </div>

              {/* Toggle Switch for Reminders */}
              <div className="flex items-center justify-between p-4 bg-sky-50/60 border border-sky-100 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-sky-950">
                    Enable Smart Reminders
                  </p>
                  <p className="text-[10px] text-sky-700">
                    Triggers automated notifications until your goal is hit.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="w-5 h-5 accent-sky-600 rounded cursor-pointer"
                />
              </div>

              {/* Advanced Settings */}
              {reminderEnabled && (
                <div className="space-y-5 pt-2 border-t border-slate-100">
                  {/* Mode */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Interval Calculation Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setReminderMode("auto")}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          reminderMode === "auto"
                            ? "border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-200"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        <p className="text-xs font-bold">Auto Dynamic</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Calculates interval automatically based on active hours
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReminderMode("manual")}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          reminderMode === "manual"
                            ? "border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-200"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        <p className="text-xs font-bold">Fixed Manual</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Sends notifications on a fixed minute interval
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Active Window */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Active Window (Hours)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Start Time</span>
                        <input
                          type="time"
                          value={activeStart}
                          onChange={(e) => setActiveStart(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">End Time</span>
                        <input
                          type="time"
                          value={activeEnd}
                          onChange={(e) => setActiveEnd(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interval for Manual */}
                  {reminderMode === "manual" && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Reminder Interval (Minutes)
                      </label>
                      <input
                        type="number"
                        min="15"
                        value={intervalMinutes}
                        onChange={(e) => setIntervalMinutes(e.target.value)}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  )}

                  {/* Notification Channels */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Delivery Channels
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inAppEnabled}
                          onChange={(e) => setInAppEnabled(e.target.checked)}
                          className="accent-sky-600 rounded"
                        />
                        🔔 In-App Bell
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailEnabled}
                          onChange={(e) => setEmailEnabled(e.target.checked)}
                          className="accent-sky-600 rounded"
                        />
                        ✉️ Email Alerts
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                {loading ? "Saving Settings..." : "Save Preferences"}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Delete Entry?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this log from today's intake?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEntryToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEntry(entryToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}