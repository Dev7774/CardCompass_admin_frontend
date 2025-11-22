import {
  LOGIN_URL,
  FORGOT_PASSWORD_URL,
  RESET_PASSWORD_URL,
  PROFILE_URL,
  UPDATE_PROFILE_URL,
  CHANGE_PASSWORD_URL,
} from '../apiUrl';
import { AxiosError, AxiosResponse } from 'axios';
import { api } from '../apiService';

// Backend response format
interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface Admin {
  id: string;
  email: string;
  name?: string;
  twoFactorEnabled?: boolean;
  isActive?: boolean;
  lastLogin?: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const loginUser = async (
  loginData: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response: AxiosResponse<BackendResponse<{ token: string; admin: Admin }>> = await api.post(
      LOGIN_URL,
      {
        email: loginData.email,
        password: loginData.password,
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed');
    }

    // Backend returns { token, admin } in data
    return {
      token: response.data.data.token,
      admin: response.data.data.admin,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      // Extract message from backend response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        throw new Error('Network Error: Please check if the server is running');
      }
      // Fallback to axios error message
      throw new Error(error.message || 'Login failed');
    }
    // If error is already an Error instance (from interceptor or other)
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

export const forgotPassword = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  try {
    const response: AxiosResponse<BackendResponse<null>> = await api.post(
      FORGOT_PASSWORD_URL,
      { email }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send reset email');
    }

    return {
      message: response.data.message || 'Password reset email sent',
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      // Extract message from backend response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        throw new Error('Network Error: Please check if the server is running');
      }
      // Fallback to axios error message
      throw new Error(error.message || 'Login failed');
    }
    // If error is already an Error instance (from interceptor or other)
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

export const resetPassword = async (
  resetData: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  try {
    const response: AxiosResponse<BackendResponse<null>> = await api.post(
      RESET_PASSWORD_URL,
      {
        token: resetData.token,
        newPassword: resetData.newPassword,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reset password');
    }

    return {
      message: response.data.message || 'Password reset successfully',
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      // Extract message from backend response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        throw new Error('Network Error: Please check if the server is running');
      }
      // Fallback to axios error message
      throw new Error(error.message || 'Login failed');
    }
    // If error is already an Error instance (from interceptor or other)
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

export const getProfile = async (): Promise<Admin> => {
  try {
    const response: AxiosResponse<BackendResponse<Admin>> = await api.get(
      PROFILE_URL
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get profile');
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      // Extract message from backend response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        throw new Error('Network Error: Please check if the server is running');
      }
      // Fallback to axios error message
      throw new Error(error.message || 'Login failed');
    }
    // If error is already an Error instance (from interceptor or other)
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<Admin> => {
  try {
    const response: AxiosResponse<BackendResponse<Admin>> = await api.put(
      UPDATE_PROFILE_URL,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update profile');
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        throw new Error('Network Error: Please check if the server is running');
      }
      throw new Error(error.message || 'Failed to update profile');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<void> => {
  try {
    const response: AxiosResponse<BackendResponse<null>> = await api.put(
      CHANGE_PASSWORD_URL,
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to change password');
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        throw new Error('Network Error: Please check if the server is running');
      }
      throw new Error(error.message || 'Failed to change password');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

