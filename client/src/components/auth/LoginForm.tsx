'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login, LoginRequest } from '@/services/auth.service';
import { ApiError } from '@/utils/api';
import Link from 'next/link';

const SLOGANS = [
  'NO PAIN, NO GAIN',
  'YESTERDAY YOU SAID TOMORROW',
  'WAKE UP. WORK OUT. LOOK HOT.',
  'STRONGER THAN YESTERDAY',
  'YOUR BODY ACHIEVES WHAT YOUR MIND BELIEVES',
  'PAIN IS TEMPORARY, GLORY IS FOREVER',
  'LIFT HEAVY. EAT CLEAN. STAY HUMBLE.',
];

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [slogan] = useState(() => SLOGANS[Math.floor(Math.random() * SLOGANS.length)]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(formData);
      // Store tokens
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#1E1E1E]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#00E676]/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-[#00E676] text-4xl">💪</span>
          </div>
          <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-3">
            LET&apos;S GO!
          </h2>
          <p className="text-[#B3B3B3]">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1E1E]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      {/* Motivational Slogan */}
      <div className="text-center mb-8 pb-6 border-b border-white/10">
        <p className="text-[#CAFF04] text-lg font-bold uppercase tracking-wider">
          {slogan}
        </p>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider">
          LOGIN
        </h2>
        <p className="text-[#B3B3B3] mt-2">Welcome back, champion</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-lg">
          <p className="text-[#FF3B3B] text-sm text-center">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-[#B3B3B3] text-xs uppercase tracking-wider mb-2">
            Email / Phone
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="john@example.com"
            className="w-full bg-[#2A2A2A] text-white placeholder-[#666666] border border-[#3D3D3D] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#CAFF04] focus:ring-1 focus:ring-[#CAFF04] transition-all"
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-[#B3B3B3] text-xs uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full bg-[#2A2A2A] text-white placeholder-[#666666] border border-[#3D3D3D] rounded-lg px-4 py-3 text-base pr-12 focus:outline-none focus:border-[#CAFF04] focus:ring-1 focus:ring-[#CAFF04] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#B3B3B3] transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-[#CAFF04] hover:underline text-sm uppercase tracking-wider"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#CAFF04] hover:bg-[#A8D803] text-[#121212] font-bold uppercase tracking-wider py-4 rounded-lg mt-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(202,255,4,0.6),0_0_60px_rgba(202,255,4,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          ) : (
            '🚀 START WORKOUT'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-[#666666] text-xs uppercase tracking-wider">OR</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className="flex items-center justify-center gap-2 bg-[#2A2A2A] hover:bg-[#3D3D3D] border border-white/10 text-white py-3 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-sm font-medium">Google</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 bg-[#2A2A2A] hover:bg-[#3D3D3D] border border-white/10 text-white py-3 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
          </svg>
          <span className="text-sm font-medium">Apple</span>
        </button>
      </div>

      {/* Register Link */}
      <p className="text-center text-[#B3B3B3] mt-8 text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#CAFF04] hover:underline font-semibold uppercase tracking-wider">
          Join Now
        </Link>
      </p>
    </div>
  );
}
