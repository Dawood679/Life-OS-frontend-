import { useEffect, useState } from "react";
import FeatureLayout from "../../src/components/FeatureLayout";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  
  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  
  // App UI States
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "details"
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Fetch all user To-Dos on initial mount
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
          priority,
          dueDate,
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
    } catch {
      setError("Unable to connect to backend server. Please try again.");
    } finally {
      setLoading(false);
    }
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
      } else {
        setError(data.message || "Failed to update task status.");
      }
    } catch {
      setError("Error updating task status.");
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/to-dos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const updated = todos.filter((item) => item._id !== id);
        setTodos(updated);
        if (selectedTodo?._id === id) {
          if (updated.length > 0) {
            fetchTodoDetail(updated[0]._id);
          } else {
            setSelectedTodo(null);
          }
        }
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete task.");
      }
    } catch {
      setError("Error attempting to delete task.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
  };

  // Helper badge color functions
  const getPriorityBadgeColor = (p = "Medium") => {
    const val = p.toLowerCase();
    if (val === "high" || val === "urgent") return "bg-rose-500 text-white";
    if (val === "medium") return "bg-amber-500 text-white";
    return "bg-emerald-500 text-white";
  };

  const getPriorityTextClass = (p = "Medium") => {
    const val = p.toLowerCase();
    if (val === "high" || val === "urgent") return "text-rose-600 bg-rose-50 border-rose-200";
    if (val === "medium") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  // Tabs for FeatureLayout
  const tabs = [
    { key: "overview", label: "Task Summary" },
    { key: "details", label: "Full Details & Action Items" },
  ];

  // Section 1: Creation Form
  const renderForm = () => (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
      <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl mx-auto text-center space-y-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
          📌
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
          Create New Task
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Organize your milestones and priority action items cleanly with deadline tracking.
        </p>

        <form onSubmit={handleCreateTodo} className="mt-6 space-y-4 text-left">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete UI Prototype for SunCart project"
              disabled={loading}
              className="w-full p-3.5 text-xs bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800"
            />
          </div>

          {/* Priority & Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
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
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                Due Date & Time <span className="text-rose-500">*</span>
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

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Description / Action Notes
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add supplementary details, requirements, or links..."
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
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Saving Task...
                </>
              ) : (
                <>
                  <span>Save Task</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Section 2: Hero Header Display
  const renderHero = () => {
    if (!selectedTodo) return null;
    const isOverdue = new Date(selectedTodo.dueDate) < new Date() && !selectedTodo.isCompleted;

    return (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
                Priority: {selectedTodo.priority || "Medium"}
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
            </div>

            <h2 className={`text-2xl md:text-3xl font-serif font-bold line-clamp-2 ${selectedTodo.isCompleted ? "line-through opacity-80" : ""}`}>
              {selectedTodo.title}
            </h2>

            <p className="text-xs text-indigo-100 flex items-center gap-1.5 pt-1">
              <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due Date: {new Date(selectedTodo.dueDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl flex items-center gap-5 self-start md:self-auto shrink-0">
            <button
              onClick={(e) => handleToggleComplete(selectedTodo, e)}
              className="px-4 py-2 rounded-xl bg-white text-indigo-700 hover:bg-slate-100 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
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
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">
        Your Tasks ({todos.length})
      </h3>

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
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                isSelected
                  ? "bg-orange-50/70 border-orange-200/80 shadow-xs ring-2 ring-orange-200/50"
                  : "bg-white/60 border-slate-200/80 hover:bg-orange-50/30 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3 pr-2 min-w-0">
                {/* Checkbox toggle inside item */}
                <button
                  type="button"
                  onClick={(e) => handleToggleComplete(item, e)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition ${
                    item.isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 hover:border-orange-400 bg-white"
                  }`}
                >
                  {item.isCompleted && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="truncate">
                  <p className={`text-sm font-bold text-slate-800 truncate ${item.isCompleted ? "line-through text-slate-400" : ""}`}>
                    {item.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {new Date(item.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${getPriorityTextClass(item.priority)}`}>
                  {item.priority || "Medium"}
                </span>

                <button
                  onClick={(e) => handleDelete(item._id, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 transition cursor-pointer"
                  title="Delete Task"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
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

    if (activeTab === "overview") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Description & Summary
            </h4>
            <div className="p-5 rounded-2xl bg-orange-50/30 border border-slate-200/70">
              <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedTodo.description || "No specific description provided for this task."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "details") {
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Metadata Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Task Created On</p>
              <p className="text-sm font-semibold text-slate-700">
                {new Date(selectedTodo.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Deadline</p>
              <p className="text-sm font-semibold text-slate-700">
                {new Date(selectedTodo.dueDate).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <FeatureLayout
      badgeText="TaskOS Hub"
      title="To-Do & Workflow Manager"
      subtitle="Organize, prioritize, and track target deadlines seamlessly"
      loading={loading}
      initialFetching={initialFetching}
      error={error}
      setError={setError}
      isCreatingNew={isCreatingNew}
      setIsCreatingNew={setIsCreatingNew}
      hasItems={todos.length > 0}
      renderForm={renderForm}
      renderHero={renderHero}
      renderSidebar={renderSidebar}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      renderTabContent={renderTabContent}
    />
  );
}