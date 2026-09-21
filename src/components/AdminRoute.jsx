import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminRoute({ children }) {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    user: null,
  });

  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

    fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          const isAdmin = data.user.role === 'admin';
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            isAdmin,
            user: data.user,
          });
          if (!isAdmin) {
            toast.error('Access denied. Administrator privileges required.');
          }
        } else {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
            user: null,
          });
        }
      })
      .catch(() => {
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
          user: null,
        });
      });
  }, []);

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#07090e]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!authState.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
