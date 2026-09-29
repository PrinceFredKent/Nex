'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2,
  ShieldCheck,
  Tv
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const { signUp, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user && !isSuccess) {
      router.push(next);
    }
  }, [user, next, router, isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(email, password, fullName);
      if (result.error) {
        setError(result.error);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(next);
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
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

      {/* Main Register Card */}
      <div className="bg-white/95 dark:bg-[#141721]/95 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-200/80 dark:border-white/10 transition-all">
        {/* Header */}
        <div className="text-center space-y-2 mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 mb-1 shadow-inner border border-brand-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Create your <span className="text-brand-500">Nex</span> account
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Join free to unlock cloud watchlist sync, history tracking, and VIP multi-server streaming.
          </p>
        </div>

        {/* Success Notification */}
        {isSuccess && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Account created successfully! Redirecting to Nex...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200/80 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#1a1e2b] border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

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
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 6 characters)"
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

          {/* Confirm Password Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password to confirm"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#1a1e2b] border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 active:scale-[0.98] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Nex Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer / Switch link */}
        <div className="mt-7 pt-5 border-t border-slate-100 dark:border-white/10 text-center text-xs text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href={`/auth/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:underline transition"
          >
            Sign In
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

export default function RegisterPage() {
  return (
    <div className="w-full flex items-center justify-center">
      <Suspense fallback={
        <div className="w-full max-w-md mx-auto bg-white dark:bg-[#141721] rounded-3xl p-10 text-center shadow-app border border-slate-100 dark:border-white/10 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          <span>Loading...</span>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
