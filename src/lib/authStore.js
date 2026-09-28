import { create } from 'zustand';

const getBackendUrl = () => {
  const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
  return url.endsWith('/api') ? url : url.endsWith('/') ? `${url}api` : `${url}/api`;
};

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${getBackendUrl()}/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.user) {
        set({
          user: data.user,
          isAuthenticated: true,
          loading: false
        });
        return true;
      } else {
        if (!data.user) {
          localStorage.removeItem('token');
        }
        set({
          user: null,
          isAuthenticated: false,
          loading: false
        });
        return false;
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false
      });
      return false;
    }
  },

  setUser: (userData, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    set({
      user: userData,
      isAuthenticated: true,
      loading: false
    });
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch(`${getBackendUrl()}/auth/logout`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      set({
        user: null,
        isAuthenticated: false,
        loading: false
      });
    }
  }
}));

export default useAuthStore;