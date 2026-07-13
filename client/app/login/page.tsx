import { LoginForm } from '@/components/auth';
import { GymBackground } from '@/components/gym';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <GymBackground id="gym-1" overlay={0.7}>
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

      {/* Register Link */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8">
        <Link
          href="/register"
          className="text-[#B3B3B3] hover:text-[#CAFF04] text-sm font-semibold uppercase tracking-wider transition-colors"
        >
          Register
        </Link>
      </div>

      {/* Form Container — căn giữa */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-md mx-4">
          <LoginForm />
        </div>
      </div>
    </GymBackground>
  );
}