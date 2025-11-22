export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin';
  twoFactorEnabled?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
  requires2FA?: boolean;
}

