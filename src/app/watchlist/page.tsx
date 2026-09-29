'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWatchlist } from '@/components/WatchlistProvider';
import CardYouMightLike from '@/components/CardYouMightLike';
import { Bookmark, Clock, Trash2, Play } from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/components/ToastProvider';

export default function WatchlistPage() {
  const { watchlist, history, clearHistory } = useWatchlist();
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const toast = useToast();

  const handleConfirmClearHistory = () => {
    clearHistory();
    setIsClearModalOpen(false);
    toast.success('Your viewing history has been cleared.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Tab Switcher (Sticky) */}
      <div className="sticky top-[74px] sm:top-[82px] z-20 bg-white/95 dark:bg-[#141721]/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-2xl border border-slate-100/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-brand-500" />
            <span>My Favorite Hub</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your saved watchlist and continue watching history
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/10 p-1 rounded-full">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'saved'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            Saved Favorites ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            History ({history.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Saved Watchlist */}
      {activeTab === 'saved' && (
        <div className="animate-fadeIn">
          {watchlist.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-[#141721] rounded-3xl p-8 border border-slate-100/80 dark:border-white/10 shadow-app space-y-3">
              <Bookmark className="w-10 h-10 mx-auto text-gray-400" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Your Watchlist is empty</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Explore movies and series, and click the bookmark button to save them here.
              </p>
              <Link
                href="/browse"
                className="inline-block mt-2 px-5 py-2 rounded-full bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition shadow-md shadow-brand-500/25"
              >
                Browse Titles →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map((item) => (
                <CardYouMightLike key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: History */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fadeIn">
          {history.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => setIsClearModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#141721] text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-slate-200 dark:border-white/10 transition shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}

          {history.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-[#141721] rounded-3xl p-8 border border-slate-100/80 dark:border-white/10 shadow-app space-y-2">
              <Clock className="w-10 h-10 mx-auto text-gray-400" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No viewing history yet</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Titles you watch will automatically show up here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item, idx) => (
                <div
                  key={`${item.mediaId}-${idx}`}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-[#141721] border border-slate-100/80 dark:border-white/10 shadow-sm hover:shadow-md transition group"
                >
                  <img
                    src={item.posterUrl}
                    alt={item.mediaTitle}
                    className="w-14 h-20 object-cover rounded-xl shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                      {item.type}
                    </span>
                    <h4 className="text-gray-900 dark:text-white font-bold text-sm truncate mt-1 group-hover:text-brand-500 transition">
                      {item.mediaTitle}
                    </h4>
                    {item.type === 'tv' && (
                      <p className="text-xs text-brand-500 font-semibold">
                        Season {item.season}, Episode {item.episode}
                      </p>
                    )}
                    <Link
                      href={`/watch/${item.mediaId}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 px-3 py-1 rounded-full mt-2 transition shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Resume</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Confirmation Alert Modal */}
      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClearHistory}
        title="Clear Viewing History"
        message="Are you sure you want to clear your entire watching history? This cannot be undone."
        confirmText="Clear History"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
