import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AuthLayout, AuthField } from '../components/auth/AuthLayout';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  restaurantName: z.string().min(2, 'Restaurant name must be at least 2 characters'),
});

type RegisterInputs = z.infer<typeof RegisterSchema>;

export const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterInputs) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      setAuth(response.user, response.tokens.accessToken, response.tokens.refreshToken);
      toast.success('Registration successful! Setup your subscription to get started.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="register" title="Create your account" subtitle="Get your restaurant started with Ordio.">
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <AuthField label="Full name" id="name" type="text" placeholder="Your full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <AuthField label="Restaurant name" id="restaurantName" type="text" placeholder="Your restaurant name" autoComplete="organization" error={errors.restaurantName?.message} {...register('restaurantName')} />
        <AuthField label="Email address" id="email" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <AuthField label="Password" id="password" type="password" placeholder="Create a password" autoComplete="new-password" hint="Use at least 6 characters." error={errors.password?.message} {...register('password')} />
        <button type="submit" disabled={loading} className="auth-submit">{loading ? 'Creating account...' : 'Create account'}</button>
      </form>
    </AuthLayout>
  );
};
