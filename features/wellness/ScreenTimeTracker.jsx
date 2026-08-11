import {
  AlertCircle,
  Bell,
  BellOff,
  Briefcase,
  Clock,
  Eye,
  Gamepad2,
  Monitor,
  Plus,
  Share2,
  Trash2,
  Tv,
} from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../src/components/ui/Button";

const CATEGORIES = [
  { id: "work", label: "Work", icon: Briefcase },
  { id: "entertainment", label: "Media", icon: Tv },
  { id: "social", label: "Social", icon: Share2 },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
];

const REMINDER_OPTIONS = [30, 45, 60, 90];

export default function ScreenTimeTracker() {
  const [checkIn, setCheckIn] = useState(null);
  const [minutesInput, setMinutesInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("work");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reminder State (Managed via WellnessSettings)
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(45);
  const [savingReminder, setSavingReminder] = useState(false);

  // 20-20-20 Eye Rest Modal State
  const [eyeRestActive, setEyeRestActive] = useState(false);
  const [timer, setTimer] = useState(20);

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Request browser notification permissions
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch initial data: today's check-in & user wellness settings
  const fetchInitialData = async () => {
    try {
      const [checkInRes, settingsRes] = await Promise.all([
        fetch(`${backendUrl}/wellness/today`, { credentials: "include" }),
        fetch(`${backendUrl}/wellness/settings`, { credentials: "include" }),
      ]);

      const checkInData = await checkInRes.json();
      const settingsData = await settingsRes.json();

      if (checkInData.success && checkInData.checkIn) {
        setCheckIn(checkInData.checkIn);
      }

      if (settingsData.success && settingsData.settings?.reminder) {
        setReminderEnabled(settingsData.settings.reminder.enabled ?? false);
        setReminderInterval(
          settingsData.settings.reminder.intervalMinutes ?? 45,
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load screen time data.");
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const screenData = checkIn?.screenTime || {
    totalMinutes: 0,
    goalMinutes: 120,
    entries: [],
    overGoal: false,
    percent: 0,
  };
  const { totalMinutes, goalMinutes, entries, overGoal, percent } = screenData;

  // Browser notification trigger
  const triggerReminderNotification = (minutesLogged) => {
    if (!reminderEnabled) return;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Screen Time Break Reminder 👁️", {
        body: `You logged ${minutesLogged} minutes of screen time. Take a short eye break!`,
        icon: "/favicon.ico",
      });
    }
  };

  // Log Screen Time Handler -> POST /wellness/screen-time
  const handleLogScreenTime = async (minutes, category) => {
    if (!minutes || minutes <= 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${backendUrl}/wellness/screen-time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ minutes: Number(minutes), category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to log screen time");

      setCheckIn(data.checkIn);
      setMinutesInput("");

      if (Number(minutes) >= reminderInterval) {
        triggerReminderNotification(minutes);
        startEyeRest();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save Reminder Settings Handler -> PUT /wellness/settings
  const handleSaveReminder = async (enabled, interval) => {
    setSavingReminder(true);
    setError("");

    try {
      const res = await fetch(`${backendUrl}/wellness/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          enabled,
          intervalMinutes: interval,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update reminder settings");

      setReminderEnabled(enabled);
      setReminderInterval(interval);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingReminder(false);
    }
  };

  // Delete Entry Handler -> DELETE /wellness/screen-time/:entryId
  const handleDeleteEntry = async (entryId) => {
    try {
      const res = await fetch(`${backendUrl}/wellness/screen-time/${entryId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete entry");

      setCheckIn(data.checkIn);
    } catch (err) {
      setError(err.message);
    }
  };

  // Start 20-20-20 Eye Break Timer
  const startEyeRest = () => {
    setEyeRestActive(true);
    setTimer(20);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="bg-brand-gradient p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Screen Time Tracker</h2>
              <p className="text-xs text-white/80">
                Monitor usage & take eye breaks
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={startEyeRest}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
          >
            20-20-20 Rest
          </Button>
        </div>

        {/* Progress Display */}
        <div className="mt-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-3xl font-extrabold">{totalMinutes}</span>
              <span className="text-sm text-white/80 font-medium">
                {" "}
                / {goalMinutes} mins
              </span>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                overGoal
                  ? "bg-red-500/20 text-red-100 border border-red-400/30"
                  : "bg-white/15 text-white"
              }`}
            >
              {overGoal
                ? "Over Limit!"
                : `${goalMinutes - totalMinutes}m remaining`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overGoal
                  ? "bg-red-500"
                  : percent > 85
                    ? "bg-amber-400"
                    : "bg-white"
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="p-6 space-y-6">
        {error && (
          <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-900">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* --- SCREEN TIME REMINDER SECTION --- */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 ${
            reminderEnabled
              ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50"
              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg transition-colors ${
                  reminderEnabled
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                }`}
              >
                {reminderEnabled ? (
                  <Bell className="w-4 h-4 animate-bounce" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Screen Break Reminder
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      reminderEnabled
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {savingReminder
                      ? "Updating..."
                      : reminderEnabled
                        ? "ON"
                        : "OFF"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {reminderEnabled
                    ? `Notifies you every ${reminderInterval} minutes of activity.`
                    : "Turn on to get automatic eye break notifications."}
                </p>
              </div>
            </div>

            {/* --- Interactive Toggle Switch Component --- */}
            <button
              type="button"
              role="switch"
              aria-checked={reminderEnabled}
              disabled={savingReminder}
              onClick={() =>
                handleSaveReminder(!reminderEnabled, reminderInterval)
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                reminderEnabled
                  ? "bg-indigo-600"
                  : "bg-slate-300 dark:bg-slate-600"
              } ${savingReminder ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="sr-only">Toggle Screen Break Reminder</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  reminderEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Duration Options (Interactive only when enabled) */}
          <div
            className={`mt-4 pt-3 border-t transition-all duration-300 ${
              reminderEnabled
                ? "border-indigo-100 dark:border-indigo-900/40 opacity-100"
                : "border-slate-200/60 dark:border-slate-700/50 opacity-40 pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Remind interval:
              </span>
              <div className="flex gap-1.5">
                {REMINDER_OPTIONS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    disabled={!reminderEnabled || savingReminder}
                    onClick={() => handleSaveReminder(true, mins)}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-semibold transition-all ${
                      reminderInterval === mins
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 1. Category Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            1. Select Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Quick Presets & Custom Logging */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            2. Add Duration
          </label>

          <div className="flex gap-2 mb-3">
            {[15, 30, 45, 60].map((mins) => (
              <Button
                key={mins}
                variant="ghost"
                size="sm"
                disabled={loading}
                onClick={() => handleLogScreenTime(mins, selectedCategory)}
                leftIcon={<Plus className="w-3 h-3" />}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {mins}m
              </Button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogScreenTime(minutesInput, selectedCategory);
            }}
            className="flex gap-2"
          >
            <div className="relative">
              <input
                type="number"
                placeholder="Custom mins"
                value={minutesInput}
                onChange={(e) => setMinutesInput(e.target.value)}
                min="1"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                min
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              loadingText="Logging"
              disabled={!minutesInput}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Log
            </Button>
          </form>
        </div>

        {/* 3. Session History */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Sessions
            </h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {entries.length} logged
            </span>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">
                No screen sessions logged yet today.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {entries.map((entry) => {
                const catObj =
                  CATEGORIES.find((c) => c.id === entry.category) ||
                  CATEGORIES[0];
                const Icon = catObj.icon;
                return (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs capitalize text-slate-700 dark:text-slate-200">
                          {entry.category || "General"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(
                            entry.timestamp || Date.now(),
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-xs text-slate-700 dark:text-slate-200">
                        {entry.minutes} mins
                      </span>
                      <button
                        onClick={() => handleDeleteEntry(entry._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 20-20-20 Eye Break Modal */}
      {eyeRestActive && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-xs w-full p-6 rounded-2xl text-center space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto">
              <Eye className="w-7 h-7 animate-pulse" />
            </div>

            <div>
              <h3 className="text-base font-bold">20-20-20 Eye Break</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Look at an object at least <strong>20 feet away</strong> for 20
                seconds.
              </p>
            </div>

            <div className="py-2">
              <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {timer}s
              </span>
            </div>

            {timer === 0 ? (
              <Button
                variant="primary"
                fullWidth
                onClick={() => setEyeRestActive(false)}
              >
                Done! Eyes Refreshed 🎉
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => setEyeRestActive(false)}
              >
                Skip Exercise
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
