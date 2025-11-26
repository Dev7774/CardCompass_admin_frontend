import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin, useVerify2FA } from '@/hooks/apiHooks/Auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import Logo from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const verify2FASchema = z.object({
  twoFactorCode: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type Verify2FAFormData = z.infer<typeof verify2FASchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [show2FA, setShow2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: verify2FA, isPending: isVerifyPending } = useVerify2FA();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const verify2FAForm = useForm<Verify2FAFormData>({
    resolver: zodResolver(verify2FASchema),
    mode: 'onChange',
  });

  const onLoginSubmit = (data: LoginFormData) => {
    login(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (response) => {
          if (response?.requiresTwoFactor) {
            setUserEmail(data.email);
            setShow2FA(true);
            toast({
              title: 'Verification Code Sent',
              description: response.message || 'Please check your email for the verification code',
              variant: 'default',
            });
          } else {
            navigate('/');
          }
        },
      }
    );
  };

  const onVerify2FASubmit = (data: Verify2FAFormData) => {
    verify2FA(
      {
        email: userEmail,
        code: data.twoFactorCode,
      },
      {
        onSuccess: () => {
          navigate('/');
        },
      }
    );
  };

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-md px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <Logo size="xl" showText={false} className="mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              CardCompass Admin
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Welcome back! Please login to your account
            </p>
          </div>

          {!show2FA ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`pl-10 border-2 ${
                      loginForm.formState.errors.email && loginForm.formState.touchedFields.email ? 'border-red-600' : 'border-gray-300'
                    }`}
                    {...loginForm.register('email')}
                  />
                </div>
                {loginForm.formState.errors.email && loginForm.formState.touchedFields.email && (
                  <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`pl-10 pr-10 border-2 ${
                      loginForm.formState.errors.password && loginForm.formState.touchedFields.password ? 'border-red-600' : 'border-gray-300'
                    }`}
                    {...loginForm.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && loginForm.formState.touchedFields.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoginPending}
              >
                {isLoginPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={verify2FAForm.handleSubmit(onVerify2FASubmit)} className="space-y-4">
              <div className="text-center mb-4">
                <Shield className="mx-auto w-12 h-12 text-primary-600 mb-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  We've sent a 6-digit verification code to your email
                </p>
              </div>

              <div>
                <Label htmlFor="twoFactorCode">Verification Code</Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className={`mt-1 border-2 text-center text-2xl tracking-widest ${
                    verify2FAForm.formState.errors.twoFactorCode && verify2FAForm.formState.touchedFields.twoFactorCode ? 'border-red-600' : 'border-gray-300'
                  }`}
                  {...verify2FAForm.register('twoFactorCode')}
                />
                {verify2FAForm.formState.errors.twoFactorCode && verify2FAForm.formState.touchedFields.twoFactorCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {verify2FAForm.formState.errors.twoFactorCode.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShow2FA(false);
                    verify2FAForm.reset();
                  }}
                  disabled={isVerifyPending}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isVerifyPending}
                >
                  {isVerifyPending ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Login;

