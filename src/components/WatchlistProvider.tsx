'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          // Clean up any stale or corrupted history items where a movie was tagged with tv or episode
          const sanitized: WatchHistoryItem[] = parsed.map((item: WatchHistoryItem) => {
            const isMovie = 
              item.type === 'movie' || 
              item.mediaId?.startsWith('movie-') || 
              (!item.mediaId?.startsWith('tv-') && item.type !== 'tv');
            if (isMovie) {
              return {
                ...item,
                type: 'movie',
                episode: undefined,
                season: undefined,
              };
            }
            return {
              ...item,
              type: 'tv',
              episode: item.episode || 1,
              season: item.season || 1,
            };
          });
          setHistory(sanitized);
        }
      }
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

  const addToWatchlist = useCallback((item: MediaItem) => {
    setWatchlist((prev) => {
      if (prev.some((m) => m.id === item.id)) return prev;
      return [item, ...prev];
    });
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== id && String(m.tmdbId) !== id));
  }, []);

  const isInWatchlist = useCallback((id: string) => {
    return watchlist.some((m) => m.id === id || String(m.tmdbId) === id);
  }, [watchlist]);

  const saveProgress = useCallback((historyItem: WatchHistoryItem) => {
    setHistory((prev) => {
      const existing = prev.find((h) => h.mediaId === historyItem.mediaId);
      if (
        existing &&
        existing.season === historyItem.season &&
        existing.episode === historyItem.episode &&
        Math.abs(Date.now() - (existing.timestamp || 0)) < 30000
      ) {
        return prev; // Exact match recently saved: no state change, no re-render
      }
      const filtered = prev.filter((h) => h.mediaId !== historyItem.mediaId);
      return [historyItem, ...filtered].slice(0, 20); // keep last 20
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const contextValue = useMemo(() => ({
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    history,
    saveProgress,
    clearHistory,
  }), [watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, history, saveProgress, clearHistory]);

  return (
    <WatchlistContext.Provider value={contextValue}>
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
