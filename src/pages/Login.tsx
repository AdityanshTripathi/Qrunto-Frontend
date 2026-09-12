import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AuthLayout, AuthField } from '../components/auth/AuthLayout';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { defaultRouteForRole } from '../lib/capabilities';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginInputs = z.infer<typeof LoginSchema>;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInputs) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      setAuth(response.user, response.tokens.accessToken);
      toast.success('Welcome back!');
      
      // Redirect based on role
      navigate(defaultRouteForRole(response.user.role));
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="login" title="Welcome back" subtitle="Sign in to manage your restaurant.">
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <AuthField label="Email address" id="email" type="email" placeholder="user@example.com" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <AuthField label="Password" id="password" type="password" placeholder="Enter your password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <button type="submit" disabled={loading} className="auth-submit">{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </AuthLayout>
  );
};
