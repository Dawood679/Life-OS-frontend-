import axios from 'axios';
import { useUpgradeModalStore } from '../store/upgradeModalStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token from localStorage if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch Quota Exceeded and Feature Locked events
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    if (error.response?.status === 403 && (errorData?.code === 'QUOTA_EXCEEDED' || errorData?.code === 'FEATURE_LOCKED')) {
      // Auto-trigger the high-converting Upgrade Modal with custom feature context
      useUpgradeModalStore.getState().openUpgradeModal(
        errorData.feature || 'general',
        errorData.upgradeTitle || '',
        errorData.upgradeDescription || errorData.message || ''
      );
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
