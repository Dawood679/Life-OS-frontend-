import { useEffect, useState } from "react";
import FeatureLayout from "../../src/components/FeatureLayout";
import DeleteModal from "../../src/components/DeleteModal";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Mail,
  BellRing,
  Clock,
  Repeat,
  Calendar,
  Check,
  AlertCircle,
  Trash2,
  Edit3,
  Sparkles,
  CheckCircle2,
  Flame,
  Zap,
  Sliders,
  BellOff
} from "lucide-react";
import toast from "react-hot-toast";

const DAYS_OF_WEEK = [
  { day: 0, label: "Sunday", short: "Sun", initial: "Su" },
  { day: 1, label: "Monday", short: "Mon", initial: "Mo" },
  { day: 2, label: "Tuesday", short: "Tue", initial: "Tu" },
  { day: 3, label: "Wednesday", short: "Wed", initial: "We" },
  { day: 4, label: "Thursday", short: "Thu", initial: "Th" },
  { day: 5, label: "Friday", short: "Fri", initial: "Fr" },
  { day: 6, label: "Saturday", short: "Sat", initial: "Sa" },
];

export default function Todos() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);

  // Form Creation States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [repeat, setRepeat] = useState("none");
  const [customDays, setCustomDays] = useState([0, 1]); // Default Sunday & Monday
  const [notificationChannel, setNotificationChannel] = useState("in_app");
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(10);

  // App UI States
  const [loading, setLoading] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "notifications" | "details"
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    todoId: null,
    todoTitle: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/to-dos`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.todos) {
        setTodos(data.todos);
        if (data.todos.length > 0) {
          fetchTodoDetail(data.todos[0]._id);
        }
      } else {
        setError(data.message || "Failed to load to-dos.");
      }
    } catch {
      setError("Unable to connect to server to load tasks.");
    } finally {
      setInitialFetching(false);
    }
  };

  const fetchTodoDetail = async (id) => {
    try {
      setFetchingDetail(true);
      const res = await fetch(`${BACKEND_URL}/to-dos/${id}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.todo) {
        setSelectedTodo(data.todo);
      } else {
        setError(data.message || "Failed to load task details.");
      }
    } catch {
      setError("Error loading selected task details.");
    } finally {
      setFetchingDetail(false);
    }
  };

  const toggleCustomDay = (dayNum) => {
    setCustomDays((prev) => {
      if (prev.includes(dayNum)) {
        if (prev.length === 1) {
          toast.error("Please select at least one day for custom recurrence.");
          return prev;
        }
        return prev.filter((d) => d !== dayNum);
      } else {
        return [...prev, dayNum].sort((a, b) => a - b);
      }
    });
  };

  const handleCreateTodo = async (e) => {
    e?.preventDefault();
    if (!title.trim() || !dueDate) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/to-dos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          priority: priority.toLowerCase(),
          dueDate,
          repeat,
          customDays: repeat === "custom" ? customDays : [],
          notificationChannel,
          reminderMinutesBefore: Number(reminderMinutesBefore),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create to-do item.");
        return;
      }

      const newTodo = data.todo;
      setTodos((prev) => [newTodo, ...prev]);
      setSelectedTodo(newTodo);
      setIsCreatingNew(false);
      resetForm();
      setActiveTab("overview");
      toast.success("Task created with custom recurrence schedule!");
      window.dispatchEvent(new Event("lifeos-data-refresh"));
    } catch {
      setError("Unable to connect to backend server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTodoNotification = async (updatedFields) => {
    if (!selectedTodo) return;
    setUpdatingSettings(true);

    try {
      const res = await fetch(`${BACKEND_URL}/to-dos/${selectedTodo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedFields),
      });

      const data = await res.json();

      if (res.ok && data.todo) {
        setSelectedTodo(data.todo);
        setTodos((prev) =>
          prev.map((t) => (t._id === selectedTodo._id ? data.todo : t))
        );
        toast.success("Reminder settings updated!");
        window.dispatchEvent(new Event("lifeos-data-refresh"));
      } else {
        toast.error(data.message || "Failed to update reminder settings.");
      }
    } catch {
      toast.error("Network error updating reminder.");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleToggleSelectedCustomDay = (dayNum) => {
    if (!selectedTodo) return;
    const currentDays = selectedTodo.customDays || [];
    let updatedDays = [];
    if (currentDays.includes(dayNum)) {
      if (currentDays.length === 1) {
        toast.error("Please keep at least one day selected.");
        return;
      }
      updatedDays = currentDays.filter((d) => d !== dayNum);
    } else {
      updatedDays = [...currentDays, dayNum].sort((a, b) => a - b);
    }
    handleUpdateTodoNotification({ repeat: "custom", customDays: updatedDays });
  };

  const handleToggleComplete = async (todoItem, e) => {
    e?.stopPropagation();
    const updatedStatus = !todoItem.isCompleted;

    try {
      const res = await fetch(`${BACKEND_URL}/to-dos/${todoItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isCompleted: updatedStatus }),
      });

      const data = await res.json();

      if (res.ok && data.todo) {
        setTodos((prev) =>
          prev.map((t) => (t._id === todoItem._id ? data.todo : t))
        );
        if (selectedTodo?._id === todoItem._id) {
          setSelectedTodo(data.todo);
        }
        toast.success(updatedStatus ? "Task completed! (+Life Score)" : "Task marked incomplete");
        window.dispatchEvent(new Event("lifeos-data-refresh"));
      } else {
        setError(data.message || "Failed to update task status.");
      }
    } catch {
      setError("Error updating task status.");
    }
  };

  const openDeleteModal = (id, title, e) => {
    e?.stopPropagation();
    setDeleteModal({
      isOpen: true,
      todoId: id,
      todoTitle: title || "Selected Task",
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.todoId) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`${BACKEND_URL}/to-dos/${deleteModal.todoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const deletedId = deleteModal.todoId;
        const updated = todos.filter((item) => item._id !== deletedId);
        setTodos(updated);
        if (selectedTodo?._id === deletedId) {
          if (updated.length > 0) {
            fetchTodoDetail(updated[0]._id);
          } else {
            setSelectedTodo(null);
          }
        }
        toast.success("Task deleted successfully");
        setDeleteModal({ isOpen: false, todoId: null, todoTitle: "" });
        window.dispatchEvent(new Event("lifeos-data-refresh"));
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete task.");
      }
    } catch {
      toast.error("Error attempting to delete task.");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setRepeat("none");
    setCustomDays([0, 1]);
    setNotificationChannel("in_app");
    setReminderMinutesBefore(10);
  };

  const getPriorityTextClass = (p = "Medium") => {
    const val = p.toLowerCase();
    if (val === "high" || val === "urgent") return "text-rose-600 bg-rose-50 border-rose-200";
    if (val === "medium") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  const formatRecurrenceText = (rep, cDays = []) => {
    if (!rep || rep === "none") return "Once";
    if (rep === "daily") return "Daily";
    if (rep === "weekdays") return "Weekdays (Mon-Fri)";
    if (rep === "weekly") return "Weekly";
    if (rep === "custom" && cDays.length > 0) {
      const dayNames = cDays.map((d) => DAYS_OF_WEEK.find((item) => item.day === d)?.short).filter(Boolean);
      return `Custom (${dayNames.join(", ")})`;
    }
    return rep;
  };

  // Tabs for FeatureLayout
  const tabs = [
    { key: "overview", label: "Task Summary" },
    { key: "notifications", label: "🔔 Reminders & Specific Days" },
    { key: "details", label: "Full Details & Metadata" },
  ];

  // Section 1: Creation Form with Rich Multi-Day Selection Dock
  const renderForm = () => (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
      <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl mx-auto text-center space-y-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
          📌
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
          Create New Task & Custom Schedule
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Select specific recurring days (e.g. Sunday & Monday) with multi-channel alerts.
        </p>

        <form onSubmit={handleCreateTodo} className="mt-6 space-y-5 text-left">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Team Sync & Google Architecture Review"
              disabled={loading}
              className="w-full p-3.5 text-xs bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800"
            />
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
                className="w-full p-3.5 text-xs bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800 cursor-pointer"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Priority</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
                Target Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
                className="w-full p-3.5 text-xs bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800 cursor-pointer"
              />
            </div>
          </div>

          {/* RECURRENCE FREQUENCY & CUSTOM DAY SELECTOR */}
          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recurrence Schedule</span>
              </label>
              <span className="text-[10px] text-indigo-600 font-bold">
                {repeat === "custom" ? "Specific Days Selected" : formatRecurrenceText(repeat, customDays)}
              </span>
            </div>

            {/* Recurrence Mode Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
              {[
                { id: "none", label: "Once" },
                { id: "daily", label: "🔁 Daily" },
                { id: "weekdays", label: "🗓️ Mon-Fri" },
                { id: "weekly", label: "📅 Weekly" },
                { id: "custom", label: "🎯 Specific Days" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRepeat(opt.id)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                    repeat === opt.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* CUSTOM DAYS PICKER (Sunday to Saturday) */}
            {repeat === "custom" && (
              <div className="pt-2.5 border-t border-indigo-100/80 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700">Select Specific Days of the Week:</span>
                  <span className="text-indigo-700 font-bold">
                    {customDays.length === 0
                      ? "No days selected"
                      : customDays.map((d) => DAYS_OF_WEEK.find((item) => item.day === d)?.label).join(", ")}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((item) => {
                    const isSelected = customDays.includes(item.day);
                    return (
                      <button
                        key={item.day}
                        type="button"
                        onClick={() => toggleCustomDay(item.day)}
                        className={`py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? "bg-gradient-to-tr from-indigo-600 to-sky-600 text-white border-indigo-600 shadow-xs scale-[1.02]"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200"
                        }`}
                        title={item.label}
                      >
                        <span className="text-[11px] uppercase tracking-wider">{item.short}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* NOTIFICATION CHANNEL & TIMING DOCK */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-brand-indigo" />
                <span>Notification Alert Channel</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium">Where to deliver</span>
            </div>

            {/* Channel Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: "in_app", label: "In-App Bell", icon: Bell },
                { id: "email", label: "Email Only", icon: Mail },
                { id: "both", label: "Bell + Email", icon: BellRing },
                { id: "none", label: "Mute Alerts", icon: BellOff }
              ].map((ch) => {
                const IconComp = ch.icon;
                const isSelected = notificationChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setNotificationChannel(ch.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5 shrink-0" />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Reminder Offset Timing */}
            {notificationChannel !== "none" && (
              <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Send Reminder Prior to Event:</span>
                  </span>
                  <span className="text-brand-indigo font-bold">{reminderMinutesBefore} minutes before</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 text-xs">
                  {[5, 10, 15, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setReminderMinutesBefore(mins)}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                        reminderMinutesBefore === mins
                          ? "bg-indigo-100 border-indigo-300 text-indigo-900"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {mins === 60 ? "1 hr" : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
              Description / Action Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add supplementary links, requirements, or agenda notes..."
              disabled={loading}
              className="w-full p-3.5 text-xs bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition resize-y text-slate-800"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            {todos.length > 0 && isCreatingNew && (
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  resetForm();
                }}
                className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !title.trim() || !dueDate}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Saving Task...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Task & Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Section 2: Hero Header Display with Reminder & Recurrence Badges
  const renderHero = () => {
    if (!selectedTodo) return null;
    const isOverdue = new Date(selectedTodo.dueDate) < new Date() && !selectedTodo.isCompleted;
    const channel = selectedTodo.notificationChannel || "in_app";

    return (
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
                Priority: {selectedTodo.priority?.toUpperCase() || "MEDIUM"}
              </span>

              {selectedTodo.isCompleted ? (
                <span className="px-3 py-1 rounded-full bg-emerald-400/30 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block text-emerald-100 border border-emerald-300/40">
                  ✓ Completed
                </span>
              ) : isOverdue ? (
                <span className="px-3 py-1 rounded-full bg-rose-400/30 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block text-rose-100 border border-rose-300/40">
                  ⚠️ Overdue
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-400/30 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block text-amber-100 border border-amber-300/40">
                  ⏳ Pending
                </span>
              )}

              {/* Recurrence Pill */}
              {selectedTodo.repeat && selectedTodo.repeat !== "none" && (
                <span className="px-3 py-1 rounded-full bg-indigo-500/40 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1 border border-indigo-400/30">
                  <Repeat className="w-3 h-3" />
                  <span>{formatRecurrenceText(selectedTodo.repeat, selectedTodo.customDays)}</span>
                </span>
              )}

              {/* Notification Channel Pill */}
              <span className="px-3 py-1 rounded-full bg-sky-500/30 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1 border border-sky-400/30 text-sky-200">
                {channel === "both" ? <BellRing className="w-3 h-3" /> : channel === "email" ? <Mail className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                <span>{channel === "both" ? "Bell + Email" : channel === "email" ? "Email" : channel === "in_app" ? "In-App Bell" : "Muted"}</span>
              </span>
            </div>

            <h2 className={`text-2xl md:text-3xl font-serif font-bold line-clamp-2 ${selectedTodo.isCompleted ? "line-through opacity-80" : ""}`}>
              {selectedTodo.title}
            </h2>

            <div className="flex items-center gap-4 flex-wrap text-xs text-indigo-200 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 opacity-80" />
                <span>Scheduled: {new Date(selectedTodo.dueDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
              </span>

              {selectedTodo.reminderTime && (
                <span className="flex items-center gap-1.5 text-sky-300 font-bold bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/15">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Alert: {new Date(selectedTodo.reminderTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({selectedTodo.reminderMinutesBefore || 10}m prior)</span>
                </span>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={(e) => handleToggleComplete(selectedTodo, e)}
              className="px-4 py-2 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-indigo-700" />
              <span>{selectedTodo.isCompleted ? "Mark Incomplete" : "Mark Complete"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Section 3: Sidebar Item List
  const renderSidebar = () => (
    <>
      <div className="flex items-center justify-between px-2 pb-1">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Your Tasks ({todos.length})
        </h3>
        <span className="text-[11px] font-bold text-brand-indigo">
          {todos.filter((t) => t.isCompleted).length}/{todos.length} Done
        </span>
      </div>

      <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
        {todos.map((item) => {
          const isSelected = selectedTodo?._id === item._id;

          return (
            <div
              key={item._id}
              onClick={() => {
                fetchTodoDetail(item._id);
                setIsCreatingNew(false);
              }}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                isSelected
                  ? "bg-indigo-50/80 border-indigo-300/80 shadow-xs ring-2 ring-indigo-200/50"
                  : "bg-white/70 border-slate-200/80 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3 pr-2 min-w-0">
                <button
                  type="button"
                  onClick={(e) => handleToggleComplete(item, e)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition ${
                    item.isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 hover:border-indigo-500 bg-white"
                  }`}
                >
                  {item.isCompleted && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="truncate">
                  <p className={`text-xs font-bold text-slate-800 truncate ${item.isCompleted ? "line-through text-slate-400" : ""}`}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 truncate">
                    <span>{new Date(item.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    {item.reminderTime && (
                      <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{new Date(item.reminderTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </span>
                    )}
                    {item.repeat && item.repeat !== "none" && (
                      <span className="text-amber-600 font-bold" title={formatRecurrenceText(item.repeat, item.customDays)}>
                        🔁 {item.repeat === "custom" ? "Custom" : item.repeat}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${getPriorityTextClass(item.priority)}`}>
                  {item.priority || "Medium"}
                </span>

                <button
                  onClick={(e) => openDeleteModal(item._id, item.title, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1.5 transition cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  // Section 4: Tab Content Render
  const renderTabContent = () => {
    if (fetchingDetail) {
      return (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400 animate-pulse">Loading task detail...</p>
        </div>
      );
    }

    if (!selectedTodo) return null;

    // TAB 1: OVERVIEW
    if (activeTab === "overview") {
      return (
        <div className="space-y-6 text-left">
          {/* Action Notes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Description & Action Notes
            </h4>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedTodo.description || "No specific description provided for this task."}
              </p>
            </div>
          </div>

          {/* Quick Notification Summary Card */}
          <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                <BellRing className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900">
                  Notification Alert & Recurrence
                </h4>
                <p className="text-[11px] text-slate-600">
                  Delivering via <strong>{selectedTodo.notificationChannel || "in_app"}</strong> at{" "}
                  <strong>
                    {selectedTodo.reminderTime
                      ? new Date(selectedTodo.reminderTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : new Date(selectedTodo.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </strong>{" "}
                  • Schedule: <strong>{formatRecurrenceText(selectedTodo.repeat, selectedTodo.customDays)}</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("notifications")}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 shadow-2xs transition cursor-pointer self-start sm:self-auto shrink-0 flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Modify Alert & Days</span>
            </button>
          </div>
        </div>
      );
    }

    // TAB 2: NOTIFICATIONS & SPECIFIC RECURRING DAYS
    if (activeTab === "notifications") {
      const isCustomRepeat = (selectedTodo.repeat || "none") === "custom";
      const currentCustomDays = selectedTodo.customDays || [];

      return (
        <div className="space-y-5 text-left">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-indigo">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Update Notification & Custom Recurring Days
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Choose specific days of the week (e.g. Sunday & Monday) and delivery channels.
                  </p>
                </div>
              </div>
            </div>

            {/* Recurrence Rule Picker */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Recurrence Schedule
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
                {[
                  { id: "none", label: "Once (None)" },
                  { id: "daily", label: "🔁 Daily" },
                  { id: "weekdays", label: "🗓️ Weekdays" },
                  { id: "weekly", label: "📅 Weekly" },
                  { id: "custom", label: "🎯 Specific Days" }
                ].map((opt) => {
                  const isSelected = (selectedTodo.repeat || "none") === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={updatingSettings}
                      onClick={() => handleUpdateTodoNotification({ repeat: opt.id, customDays: opt.id === "custom" && currentCustomDays.length === 0 ? [0, 1] : currentCustomDays })}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* SPECIFIC DAY SELECTOR (Interactive Multi-Select Dock) */}
              {isCustomRepeat && (
                <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">Toggle Active Days for this Task:</span>
                    <span className="text-indigo-700 font-bold">
                      {currentCustomDays.map((d) => DAYS_OF_WEEK.find((item) => item.day === d)?.label).join(", ") || "None"}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS_OF_WEEK.map((item) => {
                      const isDayActive = currentCustomDays.includes(item.day);
                      return (
                        <button
                          key={item.day}
                          type="button"
                          disabled={updatingSettings}
                          onClick={() => handleToggleSelectedCustomDay(item.day)}
                          className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            isDayActive
                              ? "bg-gradient-to-tr from-indigo-600 to-sky-600 text-white border-indigo-600 shadow-xs scale-[1.02]"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-indigo-50"
                          }`}
                          title={`Toggle ${item.label}`}
                        >
                          <span className="text-[10px] uppercase font-bold">{item.short}</span>
                          {isDayActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Channel Picker */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Notification Channel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: "in_app", label: "In-App Bell", icon: Bell },
                  { id: "email", label: "Email Only", icon: Mail },
                  { id: "both", label: "Bell + Email", icon: BellRing },
                  { id: "none", label: "Mute Alerts", icon: BellOff }
                ].map((ch) => {
                  const IconComp = ch.icon;
                  const isSelected = (selectedTodo.notificationChannel || "in_app") === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      disabled={updatingSettings}
                      onClick={() => handleUpdateTodoNotification({ notificationChannel: ch.id })}
                      className={`py-3 px-3 rounded-2xl border text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span>{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reminder Offset Picker */}
            {selectedTodo.notificationChannel !== "none" && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Reminder Offset (Before Due Date)
                  </label>
                  <span className="font-bold text-brand-indigo">
                    Current: {selectedTodo.reminderMinutesBefore || 10} minutes prior
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 text-xs">
                  {[5, 10, 15, 30, 60].map((mins) => {
                    const isSelected = (selectedTodo.reminderMinutesBefore || 10) === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        disabled={updatingSettings}
                        onClick={() => handleUpdateTodoNotification({ reminderMinutesBefore: mins })}
                        className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {mins === 60 ? "1 hr prior" : `${mins}m prior`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // TAB 3: DETAILS
    if (activeTab === "details") {
      return (
        <div className="space-y-4 text-left">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Metadata Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Task Created On</p>
              <p className="text-xs font-semibold text-slate-700">
                {new Date(selectedTodo.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Deadline</p>
              <p className="text-xs font-semibold text-slate-700">
                {new Date(selectedTodo.dueDate).toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scheduled Alert Time</p>
              <p className="text-xs font-semibold text-indigo-700">
                {selectedTodo.reminderTime ? new Date(selectedTodo.reminderTime).toLocaleString() : "Same as deadline"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recurrence Rule</p>
              <p className="text-xs font-semibold text-slate-700">
                {formatRecurrenceText(selectedTodo.repeat, selectedTodo.customDays)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <FeatureLayout
        badgeText="TaskOS Hub"
        title="To-Do & Workflow Manager"
        subtitle="Organize, schedule, and track target deadlines with custom recurring days"
        onBack={() => navigate(-1)}
        backTooltip="Go Back"
        loading={loading}
        initialFetching={initialFetching}
        error={error}
        setError={setError}
        isCreatingNew={isCreatingNew}
        setIsCreatingNew={setIsCreatingNew}
        hasItems={todos.length > 0}
        onDelete={selectedTodo ? () => openDeleteModal(selectedTodo._id, selectedTodo.title) : undefined}
        renderForm={renderForm}
        renderHero={renderHero}
        renderSidebar={renderSidebar}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderTabContent={renderTabContent}
      />

      {/* Reusable Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, todoId: null, todoTitle: "" })}
        onDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        title={`Delete "${deleteModal.todoTitle || "Task"}"?`}
        description="Are you sure you want to delete this task? This action cannot be undone and will remove it from your agenda and active schedule."
        confirmText="Delete Task"
      />
    </>
  );
}