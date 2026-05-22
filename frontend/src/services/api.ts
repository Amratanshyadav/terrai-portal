import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5000/api/v1`;
  }
  return 'http://localhost:5000/api/v1';
};

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto JWT Refresh Token Rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 Unauthorized and request has not already been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = useAuthStore.getState().refreshToken;

      if (refresh) {
        try {
          // Attempt to get a new access token
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: refresh,
          });

          const { accessToken, refreshToken: rotatedRefresh } = data.data;

          // Update Zustand store and re-run original request
          const user = useAuthStore.getState().user;
          if (user) {
            useAuthStore.getState().setSession(user, accessToken, rotatedRefresh);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          // If refresh fails, clear session to force re-login
          useAuthStore.getState().clearSession();
          return Promise.reject(refreshErr);
        }
      } else {
        useAuthStore.getState().clearSession();
      }
    }
    return Promise.reject(error);
  }
);
