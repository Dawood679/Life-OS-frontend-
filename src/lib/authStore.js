import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  checkAuth: async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        set({
          user: data.user,
          isAuthenticated: true,
          loading: false
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          loading: false
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false
      });
    }
  },

  setUser: (userData) => {
    set({
      user: userData,
      isAuthenticated: true
    });
  },

  logout: async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false
      });
    }
  }
}));

export default useAuthStore;