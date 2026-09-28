'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useWatchlist } from '@/components/WatchlistProvider';
import { 
  User, 
  Mail, 
  Shield, 
  Heart, 
  Clock, 
  LogOut, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Settings, 
  Film,
  Tv,
  ArrowRight,
  Trash2
} from 'lucide-react';
import CardYouMightLike from '@/components/CardYouMightLike';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading, signOut, updateProfile, isAdmin } = useAuth();
  const { watchlist, history, clearHistory } = useWatchlist();

  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [nameInput, setNameInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user && !profile) {
      router.push('/auth/login?next=/profile');
    }
    if (profile) {
      setNameInput(profile.fullName || '');
      setAvatarUrlInput(profile.avatarUrl || '');
    }
  }, [user, profile, authLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setNotification(null);

    const result = await updateProfile({
      fullName: nameInput,
      avatarUrl: avatarUrlInput,
    });

    if (result.error) {
      setNotification({ type: 'error', message: result.error });
    } else {
      setNotification({ type: 'success', message: 'Profile updated successfully!' });
    }
    setIsUpdating(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 font-medium text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          <span>Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-app border border-slate-100/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative">
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profile.email)}`}
              alt={profile.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-100 shadow-md"
            />
            {isAdmin && (
              <span className="absolute -bottom-1 -right-1 bg-brand-500 text-white p-1.5 rounded-xl shadow-sm" title="Admin Account">
                <Shield className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* User Details */}
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {profile.fullName}
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isAdmin 
                  ? 'bg-brand-500 text-white' 
                  : 'bg-slate-100 text-gray-700'
              }`}>
                {isAdmin ? 'ADMINISTRATOR' : 'VIP MEMBER'}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>{profile.email}</span>
            </p>

            <p className="text-[11px] text-gray-400 mt-1">
              Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Watchlist Count */}
        <div className="bg-white rounded-3xl p-5 shadow-app border border-slate-100/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{watchlist.length}</div>
            <div className="text-xs font-medium text-gray-500">Bookmarked Titles</div>
          </div>
        </div>

        {/* History Count */}
        <div className="bg-white rounded-3xl p-5 shadow-app border border-slate-100/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{history.length}</div>
            <div className="text-xs font-medium text-gray-500">History Sessions</div>
          </div>
        </div>

        {/* Account Status */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-3xl p-5 shadow-app border border-slate-100/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">HD Multi-Server</div>
            <div className="text-xs font-medium text-gray-500">Unlimited VIP Access</div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition ${
            activeTab === 'overview'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:text-gray-900'
          }`}
        >
          Watch Activity
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition ${
            activeTab === 'settings'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:text-gray-900'
          }`}
        >
          Account Settings
        </button>
      </div>

      {/* Tab: Overview / Watch Activity */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Watchlist Section */}
          <div className="bg-white rounded-3xl p-6 shadow-app border border-slate-100/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-brand-500" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  My Favorite Watchlist ({watchlist.length})
                </h2>
              </div>
              <Link
                href="/watchlist"
                className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {watchlist.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                You haven&apos;t added any movies or TV series to your favorite list yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {watchlist.slice(0, 3).map((item) => (
                  <CardYouMightLike key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Continue Watching Section */}
          <div className="bg-white rounded-3xl p-6 shadow-app border border-slate-100/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Recent Watch History ({history.length})
                </h2>
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                No recent watch history recorded. Start streaming to track your progress!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.slice(0, 5).map((item) => (
                  <div key={item.mediaId} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.posterUrl}
                        alt={item.mediaTitle}
                        className="w-12 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900">{item.mediaTitle}</div>
                        <div className="text-[11px] text-gray-500">
                          {item.type === 'tv' ? `Season ${item.season || 1} • Episode ${item.episode || 1}` : 'Movie'}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(item.lastWatchedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/watch/${item.mediaId}`}
                      className="px-3.5 py-1.5 bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white rounded-xl text-xs font-bold transition"
                    >
                      Resume
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-app border border-slate-100/80 max-w-xl">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-500" />
            <span>Update Account Profile</span>
          </h2>

          {notification && (
            <div className={`mb-6 p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Full Display Name
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="py-3 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </form>

          {/* App Version Info Card */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-gray-800">System Platform</p>
              <p className="text-[11px] text-gray-400">Nex High-Performance Streaming Platform</p>
            </div>
            <span className="font-mono font-bold bg-slate-100 text-gray-700 px-3 py-1 rounded-full border border-slate-200">
              Nex 1.2
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
