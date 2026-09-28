'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MediaItem, WatchHistoryItem } from '@/types';

interface WatchlistContextType {
  watchlist: MediaItem[];
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
  history: WatchHistoryItem[];
  saveProgress: (historyItem: WatchHistoryItem) => void;
  clearHistory: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem('nex_watchlist');
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));

      const savedHistory = localStorage.getItem('nex_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error('Error loading watchlist from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('nex_watchlist', JSON.stringify(watchlist));
      } catch (e) {
        console.error('Error saving watchlist to localStorage', e);
      }
    }
  }, [watchlist, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('nex_history', JSON.stringify(history));
      } catch (e) {
        console.error('Error saving history to localStorage', e);
      }
    }
  }, [history, isLoaded]);

  const addToWatchlist = (item: MediaItem) => {
    setWatchlist((prev) => {
      if (prev.some((m) => m.id === item.id)) return prev;
      return [item, ...prev];
    });
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== id && String(m.tmdbId) !== id));
  };

  const isInWatchlist = (id: string) => {
    return watchlist.some((m) => m.id === id || String(m.tmdbId) === id);
  };

  const saveProgress = (historyItem: WatchHistoryItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.mediaId !== historyItem.mediaId);
      return [historyItem, ...filtered].slice(0, 20); // keep last 20
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        history,
        saveProgress,
        clearHistory,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
