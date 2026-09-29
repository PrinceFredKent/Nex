'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Film, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Tv
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const { signIn, confirmEmail, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(next);
    }
  }, [user, next, router]);

  const handleManualActivate = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setIsActivating(true);
    setError(null);
    try {
      const res = await confirmEmail(email.trim());
      if (res.success) {
        setActivationSuccess('Email verified successfully! You can now sign in.');
        setError(null);
        if (password) {
          const loginRes = await signIn(email.trim(), password);
          if (!loginRes.error) {
            router.push(next);
          }
        }
      } else {
        setError(res.error || 'Failed to activate account');
      }
    } catch (e: any) {
      setError(e?.message || 'Error confirming account');
    } finally {
      setIsActivating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(next);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 relative z-10">
      {/* Top Bar with Navigation & Theme Toggle */}
      <div className="flex items-center justify-between px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition group bg-white/80 dark:bg-[#141721]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-white/10 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Nex</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white/80 dark:bg-[#141721]/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/80 dark:border-white/10 shadow-sm">
            <span className="text-xs font-black tracking-wider text-brand-500 uppercase font-sans">NEX</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Login Card */}
      <div className="bg-white/95 dark:bg-[#141721]/95 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-200/80 dark:border-white/10 transition-all">
        {/* Header */}
        <div className="text-center space-y-2 mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 mb-1 shadow-inner border border-brand-500/20">
            <Film className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Welcome to <span className="text-brand-500">Nex</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Sign in to sync your favorites, track watch history, and stream in ultra HD.
          </p>
        </div>

        {/* Success Alert */}
        {activationSuccess && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{activationSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200/80 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{error}</span>
            </div>

            {/* Email Not Confirmed Action */}
            {error.toLowerCase().includes('email not confirmed') && (
              <div className="pt-2 border-t border-red-200/60 dark:border-red-500/20 flex flex-col gap-2">
                <p className="text-[11px] text-red-700 dark:text-red-300">
                  Your account is registered but needs email activation.
                </p>
                <button
                  type="button"
                  onClick={handleManualActivate}
                  disabled={isActivating}
                  className="w-full py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Activating account...</span>
                    </>
                  ) : (
                    <span>Confirm & Activate Account Now</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#1a1e2b] border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-[#1a1e2b] border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 active:scale-[0.98] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Nex</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer / Switch link */}
        <div className="mt-7 pt-5 border-t border-slate-100 dark:border-white/10 text-center text-xs text-gray-500 dark:text-gray-400">
          Don&apos;t have an account yet?{' '}
          <Link
            href={`/auth/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:underline transition"
          >
            Sign Up for Free
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-500" /> Secure Sync
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Tv className="w-3.5 h-3.5 text-brand-500" /> Multi-Server HD
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" /> 100% Free
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full flex items-center justify-center">
      <Suspense fallback={
        <div className="w-full max-w-md mx-auto bg-white dark:bg-[#141721] rounded-3xl p-10 text-center shadow-app border border-slate-100 dark:border-white/10 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          <span>Loading...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
