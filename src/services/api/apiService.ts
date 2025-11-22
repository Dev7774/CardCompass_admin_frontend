import { API_BASE_URL } from './apiUrl';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = Cookies.get('accessToken');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't redirect for these endpoints - they return 401 for validation errors
      const skipRedirectEndpoints = [
        '/auth/change-password',
        '/auth/login',
      ];
      
      const shouldSkipRedirect = skipRedirectEndpoints.some(endpoint =>
        originalRequest.url?.includes(endpoint)
      );

      // Don't redirect on login page 401 errors or change password errors
      if (!shouldSkipRedirect && window.location.pathname !== '/login') {
        handleLogout();
        window.location.href = '/login';
      }
    }

    // Keep the original error structure so authApi can extract the message
    // The error.response.data.message will be extracted in authApi.ts
    return Promise.reject(error);
  }
);

export const handleLogout = () => {
  Cookies.remove('accessToken');
  Cookies.remove('user');
};

export { api };

