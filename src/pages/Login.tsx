import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, LogIn } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

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
      setAuth(response.user, response.tokens.accessToken, response.tokens.refreshToken);
      toast.success('Welcome back!');
      
      // Redirect based on role
      if (response.user.role === 'WAITER') {
        navigate('/waiter-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] flex items-center justify-center p-4">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#1f2937]/40 backdrop-blur-xl border border-[#374151]/50 rounded-[24px] shadow-2xl p-8 md:p-10 relative overflow-hidden">
        {/* Top brand header */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-black.png" alt="Qrunto Logo" className="h-16 w-auto object-contain mb-4 transform hover:scale-105 transition-transform duration-300" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Log In to your Account</h2>
          <p className="text-[#9ca3af] mt-2 text-center text-sm">Manage your menu, tables and orders from one dashboard.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-[#d1d5db] mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 h-5 text-[#9ca3af]" />
              </span>
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                className={`w-full bg-[#111827]/60 border ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#374151] focus:ring-[#FF6B35]'
                } rounded-[12px] py-3 pl-11 pr-4 text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[#d1d5db]" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 h-5 text-[#9ca3af]" />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`w-full bg-[#111827]/60 border ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-[#374151] focus:ring-[#FF6B35]'
                } rounded-[12px] py-3 pl-11 pr-4 text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                {...register('password')}
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6B35] hover:bg-orange-600 disabled:bg-orange-800 disabled:cursor-not-allowed text-white font-semibold rounded-[12px] py-3.5 px-4 flex items-center justify-center gap-2 mt-4 hover:shadow-lg hover:shadow-orange-600/25 transition-all transform hover:-translate-y-[2px]"
          >
            {loading ? 'Logging in...' : 'Sign In'}
            <LogIn className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 text-center text-[#9ca3af] text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#FF6B35] hover:underline font-medium">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};
