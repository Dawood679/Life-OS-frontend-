import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

export default function Dashboard() {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [todos, setTodos] = useState([]);
  const [error, setError] = useState("");
  const [editTodo, setEditTodo] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/to-dos`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setTodos(data.todos);
      }
    } catch (err) {
      setError("Unable to load tasks.");
      toast.error("Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/to-dos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Task deleted successfully");
        fetchTodos();
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
      const res = await fetch(`${BACKEND_URL}/api/to-dos/${editTodo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Task updated successfully");
        setEditTodo(null);
        fetchTodos();
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Welcome back! 👋
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-lg">
              Manage your daily tasks, track your health metrics, and stay on top of your LifeOS priorities all in one place.
            </p>
          </div>
          <button
            onClick={() => navigate('/todos')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition whitespace-nowrap cursor-pointer"
          >
            + Create New Task
          </button>
        </div>

        {/* WIDGETS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Health Vault Widget */}
          <div
            onClick={() => navigate("/health/history")}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between h-48 group relative overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-colors shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full">Health Profile</span>
            </div>
            <div className="relative">
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-rose-600 transition-colors">Medical Vault</h3>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                View timeline & conditions <span className="group-hover:translate-x-1 transition-transform">→</span>
              </p>
            </div>
          </div>

          {/* Task Manager Widget */}
          <div
            onClick={() => navigate("/todos")}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between h-48 group relative overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full">Productivity</span>
            </div>
            <div className="relative">
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Task Manager</h3>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                {todos.length} active tasks <span className="group-hover:translate-x-1 transition-transform">→</span>
              </p>
            </div>
          </div>

        </div>

        {/* RECENT TASKS SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-bold text-slate-900">Current Priorities</h3>
            <button onClick={() => navigate('/todos')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl w-full"></div>)}
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-sm">
              No active tasks found. Time to relax! ☕
            </div>
          ) : (
            <div className="space-y-3">
              {todos.slice(0, 5).map((todo) => (
                <div key={todo._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-sm font-bold text-slate-800">{todo.title}</h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${priorityBadgeStyle(todo.priority)}`}>
                        {todo.priority}
                      </span>
                    </div>
                    {todo.description && <p className="text-xs text-slate-500 line-clamp-1">{todo.description}</p>}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditOpen(todo)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(todo._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* EDIT MODAL */}
      {editTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Edit Task</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                <input required type="text" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea rows="3" value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                  <select value={editData.priority} onChange={(e) => setEditData({...editData, priority: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
                  <input type="datetime-local" value={editData.dueDate} onChange={(e) => setEditData({...editData, dueDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditTodo(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}