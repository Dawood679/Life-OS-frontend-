import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState('');
  const [editTodo, setEditTodo] = useState(null);
  const [editData, setEditData] = useState({});

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const fetchTodos = () => {
    fetch(`${BACKEND_URL}/api/to-dos`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTodos(data.todos);
      })
      .catch(() => setError('Unable to load todos'));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/to-dos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) fetchTodos();
    } catch {
      setError('Unable to delete todo');
    }
  };

  const handleEditOpen = (todo) => {
    setEditTodo(todo._id);
    setEditData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      dueDate: todo.dueDate ? todo.dueDate.slice(0, 16) : '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/to-dos/${editTodo}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        setEditTodo(null);
        fetchTodos();
      }
    } catch {
      setError('Unable to update todo');
    }
  };

  const priorityBadgeStyle = (priority) => {
    if (priority === 'high') return 'bg-danger-bg text-danger-text border border-danger-border';
    if (priority === 'medium') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Header Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-ink-900 tracking-tight">
              Dashboard
            </h2>
            <p className="text-xs text-ink-500 mt-1">
              Manage and track your active LifeOS tasks and priorities.
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <p className="text-danger-text text-xs mb-6 text-center bg-danger-bg p-3 rounded-xl border border-danger-border font-medium">
            {error}
          </p>
        )}

        {/* Empty State vs Todo List */}
        {todos.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-ink-200 p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-surface-blue text-brand-indigo flex items-center justify-center mx-auto mb-3 border border-surface-blue-border">
              ✦
            </div>
            <p className="text-sm font-semibold text-ink-700">No todos yet</p>
            <p className="text-xs text-ink-400 mt-1">Create your first task to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todos.map((todo) => (
              <div 
                key={todo._id} 
                className="bg-white/90 backdrop-blur-md rounded-2xl border border-ink-200/80 shadow-sm p-5 transition-all hover:shadow-md"
              >
                {editTodo === todo._id ? (
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="Task Title"
                    />

                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={2}
                      placeholder="Task Description (Optional)"
                      className="w-full bg-white border border-ink-200 rounded-xl p-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-indigo/40 focus:border-brand-indigo transition-all resize-none"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={editData.priority}
                        onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                        className="w-full bg-white border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo/40 focus:border-brand-indigo transition-all"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>

                      <Input
                        type="datetime-local"
                        value={editData.dueDate}
                        onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button type="submit" variant="primary" className="py-2 text-xs">
                        Save Changes
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => setEditTodo(null)} 
                        className="py-2 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-ink-900 text-base leading-snug">
                          {todo.title}
                        </h3>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${priorityBadgeStyle(todo.priority)}`}>
                          {todo.priority}
                        </span>
                      </div>

                      {todo.description && (
                        <p className="text-ink-500 text-xs leading-relaxed">
                          {todo.description}
                        </p>
                      )}

                      {todo.dueDate && (
                        <p className="text-ink-400 text-[11px] flex items-center gap-1 pt-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Due: {new Date(todo.dueDate).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button 
                        variant="outline" 
                        onClick={() => handleEditOpen(todo)} 
                        className="py-1.5 px-3 text-xs"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="danger" 
                        onClick={() => handleDelete(todo._id)} 
                        className="py-1.5 px-3 text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}