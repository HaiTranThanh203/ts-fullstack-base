'use client';

import { useParams } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params?.token as string | undefined;

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#121212]">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 10px,
                rgba(202, 255, 4, 0.03) 10px,
                rgba(202, 255, 4, 0.03) 20px
              )`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212] opacity-80" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-[#1E1E1E]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-[#FF3B3B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-[#FF3B3B] text-4xl">✕</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-4">
              Invalid Reset Link
            </h2>
            <p className="text-[#B3B3B3] mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block bg-[#CAFF04] hover:bg-[#A8D803] text-[#121212] font-bold uppercase tracking-wider py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(202,255,4,0.4)]"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[#121212]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              rgba(202, 255, 4, 0.03) 10px,
              rgba(202, 255, 4, 0.03) 20px
            )`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212] opacity-80" />
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#CAFF04] rounded-lg flex items-center justify-center">
            <span className="text-[#121212] font-bold text-xl">G</span>
          </div>
          <span className="text-white font-bold text-xl tracking-wider uppercase">
            GymPro
          </span>
        </Link>
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <ResetPasswordForm token={token} />
      </div>
    </main>
  );
}
