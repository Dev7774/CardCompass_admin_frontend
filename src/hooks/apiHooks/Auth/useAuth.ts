import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import {
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  LoginRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@/services/api/Auth/authApi';
import Cookies from 'js-cookie';
import { useToast } from '@/hooks/use-toast';

export const useLogin = () => {
  const navigate = useNavigate();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginUser(data),
    onSuccess: (data) => {
      if (data.token) {
        try {
          const decoded: { exp: number } = jwtDecode(data.token);
          const expirationTime = decoded.exp * 1000;

          Cookies.set('accessToken', data.token, {
            secure: true,
            sameSite: 'strict',
            expires: new Date(expirationTime),
          });

          if (data.admin) {
            // Store admin data (backend returns 'admin' not 'user')
            Cookies.set('user', JSON.stringify(data.admin), {
              secure: true,
              sameSite: 'strict',
              expires: new Date(expirationTime),
            });
          }

          toast.toast({
            title: 'Success',
            description: 'Logged in successfully!',
            variant: 'success',
          });

          navigate('/');
        } catch (error) {
          console.error('Failed to decode token:', error);
          toast.toast({
            title: 'Error',
            description: 'Failed to process login',
            variant: 'destructive',
          });
        }
      }
    },
    onError: (error: Error) => {
      toast.toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    },
  });
};

export const useGetProfile = () => {
  return useMutation({
    mutationFn: () => getProfile(),
    onError: (error: Error) => {
      console.error('Failed to get profile:', error);
    },
  });
};

export const useForgotPassword = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: () => {
      toast.toast({
        title: 'Email Sent',
        description: 'Please check your email for reset instructions',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast.toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email',
        variant: 'destructive',
      });
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
    onSuccess: () => {
      toast.toast({
        title: 'Success',
        description: 'Password reset successfully! Please login.',
        variant: 'success',
      });
      navigate('/login');
    },
    onError: (error: Error) => {
      toast.toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateProfile = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (updatedAdmin) => {
      // Update user cookie with new data
      const userCookie = Cookies.get('user');
      if (userCookie) {
        const user = JSON.parse(userCookie);
        const updatedUser = { ...user, ...updatedAdmin };
        Cookies.set('user', JSON.stringify(updatedUser), {
          secure: true,
          sameSite: 'strict',
        });
      }

      toast.toast({
        title: 'Success',
        description: 'Profile updated successfully!',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast.toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });
};

export const useChangePassword = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    onSuccess: () => {
      toast.toast({
        title: 'Success',
        description: 'Password changed successfully!',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast.toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    },
  });
};

