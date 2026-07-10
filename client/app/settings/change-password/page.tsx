'use client';

import { ChangePasswordForm } from '@/components/auth';
import Link from 'next/link';

export default function ChangePasswordPage() {
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

      {/* Back Link */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8">
        <Link
          href="/dashboard"
          className="text-[#B3B3B3] hover:text-[#CAFF04] text-sm font-semibold uppercase tracking-wider transition-colors"
        >
          Cancel
        </Link>
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <ChangePasswordForm />
      </div>
    </main>
  );
}
