import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/me', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setRole(data.user.role);
      })
      .catch(() => navigate('/login'));
  }, []);

  const userLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/create-todo', label: 'Create To-Do' },
    { path: '/profile', label: 'Profile' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Admin Dashboard' },
    { path: '/admin/users', label: 'Manage Users' },
    { path: '/profile', label: 'Profile' },
  ];

  const links = role === 'admin' ? adminLinks : userLinks;

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    navigate('/login');
  };

  return (
    <div className="w-64 min-h-screen bg-white shadow-md flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">Life OS</h1>
        {role && (
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
            role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {role}
          </span>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              location.pathname === link.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}