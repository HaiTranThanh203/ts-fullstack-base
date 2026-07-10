'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { register, RegisterRequest } from '@/services/auth.service';
import { ApiError } from '@/utils/api';

const FITNESS_GOALS = [
  { id: 'build_muscle', label: 'BUILD MUSCLE', icon: '💪', description: 'Get bigger & stronger' },
  { id: 'lose_fat', label: 'LOSE FAT', icon: '🔥', description: 'Lean out & tone up' },
  { id: 'stay_fit', label: 'STAY FIT', icon: '⚡', description: 'Maintain & improve health' },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'goals'>('form');
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setStep('goals');
  };

  const handleRegister = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await register(formData);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
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

  const handleGoalSelect = async (goalId: string) => {
    setSelectedGoal(goalId);
    await handleRegister();
  };

  if (isSuccess) {
    return (
      <div className="bg-[#1E1E1E]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#00E676]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-[#00E676] text-4xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-3">
            WELCOME TO THE FAMILY!
          </h2>
          <p className="text-[#B3B3B3]">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  if (step === 'goals') {
    return (
      <div className="bg-[#1E1E1E]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider text-center mb-2">
          WHAT'S YOUR GOAL?
        </h2>
        <p className="text-[#B3B3B3] text-center mb-8">
          Let&apos;s personalize your journey
        </p>

        {error && (
          <div className="mb-6 p-4 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-lg">
            <p className="text-[#FF3B3B] text-sm text-center">{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {FITNESS_GOALS.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => handleGoalSelect(goal.id)}
              disabled={isLoading}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                selectedGoal === goal.id
                  ? 'border-[#CAFF04] bg-[#CAFF04]/10'
                  : 'border-white/10 bg-[#2A2A2A] hover:border-[#CAFF04]/50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-3xl">{goal.icon}</span>
              <div className="text-left">
                <p className="text-white font-bold uppercase tracking-wider">{goal.label}</p>
                <p className="text-[#B3B3B3] text-sm">{goal.description}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setStep('form')}
          className="w-full text-[#B3B3B3] hover:text-white text-sm uppercase tracking-wider transition-colors"
        >
          ← Back to form
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1E1E]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      {/* Header Slogan */}
      <div className="text-center mb-8">
        <p className="text-[#CAFF04] text-sm uppercase tracking-[3px] font-semibold mb-2">
          JOIN THE FAMILY
        </p>
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider">
          CREATE ACCOUNT
        </h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-lg">
          <p className="text-[#FF3B3B] text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-[#B3B3B3] text-xs uppercase tracking-wider mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
            className="w-full bg-[#2A2A2A] text-white placeholder-[#666666] border border-[#3D3D3D] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#CAFF04] focus:ring-1 focus:ring-[#CAFF04] transition-all"
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-[#B3B3B3] text-xs uppercase tracking-wider mb-2">
            Email
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
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="Min 8 characters"
            className="w-full bg-[#2A2A2A] text-white placeholder-[#666666] border border-[#3D3D3D] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#CAFF04] focus:ring-1 focus:ring-[#CAFF04] transition-all"
          />
        </div>

        {/* Confirm Password Input */}
        <div>
          <label htmlFor="confirmPassword" className="block text-[#B3B3B3] text-xs uppercase tracking-wider mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Re-enter password"
            className="w-full bg-[#2A2A2A] text-white placeholder-[#666666] border border-[#3D3D3D] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#CAFF04] focus:ring-1 focus:ring-[#CAFF04] transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#CAFF04] hover:bg-[#A8D803] text-[#121212] font-bold uppercase tracking-wider py-4 rounded-lg mt-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(202,255,4,0.6),0_0_60px_rgba(202,255,4,0.3)] hover:-translate-y-0.5"
        >
          Continue
        </button>
      </form>

      <p className="text-[#666666] text-xs text-center mt-6">
        By signing up, you agree to our{' '}
        <a href="#" className="text-[#CAFF04] hover:underline">Terms</a> &{' '}
        <a href="#" className="text-[#CAFF04] hover:underline">Privacy Policy</a>
      </p>
    </div>
  );
}
