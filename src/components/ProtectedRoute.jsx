import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../lib/authStore';

export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const verify = async () => {
      // If we already have user in Zustand store
      if (user && isAuthenticated) {
        if (isMounted) setChecking(false);
        return;
      }
      
      // Otherwise check with server
      await checkAuth();
      if (isMounted) setChecking(false);
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthenticated, checkAuth]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}