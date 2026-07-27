import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState('');
  const [editTodo, setEditTodo] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchTodos = () => {
    fetch('http://localhost:5000/api/to-dos', {
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
      const res = await fetch(`http://localhost:5000/api/to-dos/${id}`, {
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
      const res = await fetch(`http://localhost:5000/api/to-dos/${editTodo}`, {
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

  const priorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-700';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <Layout>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {todos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No todos yet. Create one!
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div key={todo._id} className="bg-white rounded-xl shadow-sm p-5">
                {editTodo === todo._id ? (
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={2}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={editData.priority}
                      onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input
                      type="datetime-local"
                      value={editData.dueDate}
                      onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <Button type="submit">Save</Button>
                      <Button variant="secondary" onClick={() => setEditTodo(null)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{todo.title}</h3>
                      {todo.description && (
                        <p className="text-gray-500 text-sm mt-1">{todo.description}</p>
                      )}
                      {todo.dueDate && (
                        <p className="text-gray-400 text-xs mt-2">
                          Due: {new Date(todo.dueDate).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                      <Button variant="outline" onClick={() => handleEditOpen(todo)}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(todo._id)}>Delete</Button>
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