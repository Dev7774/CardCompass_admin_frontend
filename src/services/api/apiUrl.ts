export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const LOGIN_URL = `${API_BASE_URL}/auth/login`;
export const VERIFY_2FA_URL = `${API_BASE_URL}/auth/verify-2fa`;
export const FORGOT_PASSWORD_URL = `${API_BASE_URL}/auth/forgot-password`;
export const RESET_PASSWORD_URL = `${API_BASE_URL}/auth/reset-password`;
export const PROFILE_URL = `${API_BASE_URL}/auth/profile`;
export const UPDATE_PROFILE_URL = `${API_BASE_URL}/auth/profile`;
export const CHANGE_PASSWORD_URL = `${API_BASE_URL}/auth/change-password`;
export const ACTIVITY_LOG_URL = `${API_BASE_URL}/activity`;

