'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Shield, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Database, 
  Settings, 
  ExternalLink,
  Flame,
  Film,
  Tv,
  Image as ImageIcon,
  Play
} from 'lucide-react';
import { MediaItem, MediaType, StreamSource, SystemSettings } from '@/types';
import Link from 'next/link';
import ConfirmationModal, { ModalVariant } from '@/components/ConfirmationModal';
import { useToast } from '@/components/ToastProvider';

function AdminContent() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'search';

  const [activeTab, setActiveTab] = useState<'search' | 'manual' | 'library' | 'trending' | 'settings'>(
    initialTab === 'manual' || initialTab === 'library' || initialTab === 'trending' || initialTab === 'settings'
      ? initialTab
      : 'search'
  );

  // Custom Confirmation Alert Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: ModalVariant;
    isLoading?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Search Ingestion State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'multi' | 'movie' | 'tv'>('multi');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [ingestingId, setIngestingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Library State
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'movie' | 'tv'>('all');

  // Trending Ingest State
  const [trendingResults, setTrendingResults] = useState<any[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingType, setTrendingType] = useState<'movie' | 'tv'>('movie');

  // Manual Add State
  const [manualForm, setManualForm] = useState({
    title: '',
    type: 'movie' as MediaType,
    overview: '',
    posterUrl: '',
    backdropUrl: '',
    releaseDate: new Date().toISOString().split('T')[0],
    rating: 8.0,
    genres: 'Action, Sci-Fi',
    streamUrl: '',
    serverName: 'Direct HD Stream',
    backupStreamUrl: '',
    backupServerName: 'Backup Server',
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Settings & Stats
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Nex',
    siteDescription: '',
    tmdbApiKey: '78def161c2fe525795ba67ecb09f8556',
    primaryStreamProvider: 'vidlink',
    enableAutoStreams: true,
    disclaimer: '',
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    loadLibrary();
    loadStats();
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'trending') {
      loadTrending(trendingType);
    }
  }, [activeTab, trendingType]);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const loadLibrary = async () => {
    setLibraryLoading(true);
    try {
      const res = await fetch('/api/movies');
      const json = await res.json();
      if (json.success) {
        setLibraryItems(json.data || []);
      }
    } catch (e) {
      console.error('Failed to load library', e);
    } finally {
      setLibraryLoading(false);
    }
  };

  const loadTrending = async (type: 'movie' | 'tv') => {
    setTrendingLoading(true);
    try {
      const res = await fetch(`/api/tmdb/trending?type=${type}&category=trending`);
      const json = await res.json();
      if (json.success) {
        setTrendingResults(json.results || []);
      }
    } catch (e) {
      console.error('Failed to load trending', e);
    } finally {
      setTrendingLoading(false);
    }
  };

  // Perform TMDB Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
      const json = await res.json();
      if (json.success) {
        setSearchResults(json.results || []);
      } else {
        showNotification('error', json.error || 'Failed to search');
      }
    } catch (e) {
      showNotification('error', 'Error connecting to search service');
    } finally {
      setIsSearching(false);
    }
  };

  // 1-Click Ingest Movie/TV details and auto-generate free streaming links
  const handleIngest = async (tmdbId: number, mediaType: 'movie' | 'tv', itemTitle: string) => {
    setIngestingId(String(tmdbId));
    try {
      const res = await fetch(`/api/tmdb/details?tmdbId=${tmdbId}&type=${mediaType}&autoSave=true`);
      const json = await res.json();
      if (json.success) {
        showNotification('success', `Successfully imported "${itemTitle}" with auto-generated streaming servers!`);
        loadLibrary();
        loadStats();
      } else {
        showNotification('error', json.error || 'Failed to import details');
      }
    } catch (e) {
      showNotification('error', 'Error importing movie details');
    } finally {
      setIngestingId(null);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (item: MediaItem) => {
    try {
      const res = await fetch(`/api/movies/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !item.featured }),
      });
      if (res.ok) {
        setLibraryItems((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, featured: !m.featured } : m))
        );
        showNotification('success', `Updated featured status for "${item.title}"`);
      }
    } catch (e) {
      showNotification('error', 'Failed to update item');
    }
  };

  // Delete media with custom confirmation modal
  const handleDelete = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Title',
      variant: 'danger',
      confirmText: 'Delete Title',
      cancelText: 'Cancel',
      message: (
        <span>
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white font-bold">&quot;{title}&quot;</strong> from the catalog? This will remove all streaming streams and metadata.
        </span>
      ),
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`/api/movies/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setLibraryItems((prev) => prev.filter((m) => m.id !== id));
            loadStats();
            toast.success(`"${title}" has been deleted.`);
            setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          } else {
            toast.error('Failed to delete item.');
            setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          }
        } catch (e) {
          toast.error('Failed to delete item.');
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Clear Entire Catalog with custom confirmation modal
  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Entire Catalog',
      variant: 'danger',
      confirmText: 'Yes, Clear Catalog',
      cancelText: 'Keep Catalog',
      message: (
        <span>
          Are you sure you want to delete <strong className="text-red-500 font-bold">ALL titles</strong> from the catalog? This will permanently remove all movies and TV series.
        </span>
      ),
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch('/api/movies?all=true', { method: 'DELETE' });
          const json = await res.json();
          if (json.success) {
            setLibraryItems([]);
            loadStats();
            toast.success('All media has been removed from your catalog.');
            setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          } else {
            toast.error(json.error || 'Failed to clear catalog');
            setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          }
        } catch (e) {
          toast.error('Error clearing catalog');
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Handle Manual Add
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.title.trim()) {
      showNotification('error', 'Title is required');
      return;
    }

    setIsSubmittingManual(true);
    try {
      const genresList = manualForm.genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);

      const streams: StreamSource[] = [];
      if (manualForm.streamUrl.trim()) {
        streams.push({
          id: `custom-main-${Date.now()}`,
          serverName: manualForm.serverName || 'Direct Stream',
          url: manualForm.streamUrl.trim(),
          type: manualForm.streamUrl.includes('.mp4') ? 'mp4' : 'embed',
          quality: '1080p HD',
          isWorking: true,
        });
      }

      if (manualForm.backupStreamUrl.trim()) {
        streams.push({
          id: `custom-backup-${Date.now()}`,
          serverName: manualForm.backupServerName || 'Backup Stream',
          url: manualForm.backupStreamUrl.trim(),
          type: manualForm.backupStreamUrl.includes('.mp4') ? 'mp4' : 'embed',
          quality: '1080p HD',
          isWorking: true,
        });
      }

      const defaultPoster = manualForm.type === 'tv'
        ? 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=800&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';

      const body = {
        title: manualForm.title.trim(),
        type: manualForm.type,
        overview: manualForm.overview.trim() || 'Custom streaming title added from Admin.',
        posterUrl: manualForm.posterUrl.trim() || defaultPoster,
        backdropUrl: manualForm.backdropUrl.trim() || manualForm.posterUrl.trim() || defaultPoster,
        releaseDate: manualForm.releaseDate,
        rating: Number(manualForm.rating) || 8.0,
        featured: (Number(manualForm.rating) || 8.0) >= 7.0,
        genres: genresList.length > 0 ? genresList : ['Action'],
        cast: [],
        status: 'published' as const,
        streams,
      };

      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        showNotification('success', `Added "${manualForm.title}" to catalog!`);
        setManualForm({
          title: '',
          type: 'movie',
          overview: '',
          posterUrl: '',
          backdropUrl: '',
          releaseDate: new Date().toISOString().split('T')[0],
          rating: 8.0,
          genres: 'Action, Sci-Fi',
          streamUrl: '',
          serverName: 'Direct HD Stream',
          backupStreamUrl: '',
          backupServerName: 'Backup Server',
        });
        loadLibrary();
        loadStats();
        setActiveTab('library');
      } else {
        showNotification('error', json.error || 'Failed to add title');
      }
    } catch (e) {
      showNotification('error', 'Failed to create item');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showNotification('success', 'Settings saved successfully!');
      }
    } catch (e) {
      showNotification('error', 'Failed to save settings');
    }
  };

  const isAlreadyInLibrary = (tmdbId: number) => {
    return libraryItems.some((m) => m.tmdbId === tmdbId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-[#141721] rounded-3xl p-5 sm:p-7 shadow-app border border-slate-100/80 dark:border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                Nex Admin Center
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500 text-white font-bold">
                  LIVE
                </span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Add your own movies, search TMDB titles, and manage streaming servers
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-brand-500 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 px-4 py-2 rounded-full transition w-full sm:w-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-50 dark:bg-darkCard border border-slate-100 dark:border-white/10 p-3 sm:p-4 rounded-2xl">
              <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">Catalog Titles</span>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5">{stats.totalItems}</p>
            </div>
            <div className="bg-slate-50 dark:bg-darkCard border border-slate-100 dark:border-white/10 p-3 sm:p-4 rounded-2xl">
              <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">Movies</span>
              <p className="text-xl sm:text-2xl font-black text-brand-500 mt-0.5">{stats.totalMovies}</p>
            </div>
            <div className="bg-slate-50 dark:bg-darkCard border border-slate-100 dark:border-white/10 p-3 sm:p-4 rounded-2xl">
              <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">TV Shows</span>
              <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{stats.totalTv}</p>
            </div>
            <div className="bg-slate-50 dark:bg-darkCard border border-slate-100 dark:border-white/10 p-3 sm:p-4 rounded-2xl">
              <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">Total Views</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Global Alert Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 animate-fadeIn shadow-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Responsive Tabs Bar (Sticky) */}
      <div className="sticky top-[74px] sm:top-[82px] z-20 bg-surface-app/90 dark:bg-[#0b0d12]/90 backdrop-blur-md py-2 -my-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'search', label: '🔍 Search & Import' },
          { id: 'manual', label: '➕ Add Your Movie' },
          { id: 'library', label: `🎬 Catalog (${libraryItems.length})` },
          { id: 'trending', label: '🔥 Trending Releases' },
          { id: 'settings', label: '⚙️ Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap shadow-sm shrink-0 ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white shadow-brand-500/25 ring-2 ring-brand-400/30'
                : 'bg-white dark:bg-[#141721] text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-brand-500/30'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Search & Auto-Ingest */}
      {activeTab === 'search' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-[#141721] rounded-3xl p-5 sm:p-7 space-y-4 shadow-app border border-slate-100/80 dark:border-white/10">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>Search Any Movie or TV Series</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Type any movie or show title. The system pulls HD posters, cast, synopsis, and attaches multi-server streaming links automatically.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Deadpool, Inception, Gladiator, The Batman..."
                  className="w-full bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-full px-4 py-2.5 pl-10 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 transition"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>

              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-full px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-brand-500"
              >
                <option value="multi">All Types</option>
                <option value="movie">Movies Only</option>
                <option value="tv">TV Shows Only</option>
              </select>

              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 shrink-0 transition"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Results Grid */}
          {isSearching ? (
            <div className="py-20 text-center text-gray-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" />
              <p className="text-xs font-semibold">Searching titles...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Results ({searchResults.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((item) => {
                  const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
                  const title = item.title || item.name;
                  const poster = item.poster_path
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&auto=format&fit=crop';
                  const inLib = isAlreadyInLibrary(item.id);
                  const isIngesting = ingestingId === String(item.id);

                  return (
                    <div
                      key={`${item.id}-${mediaType}`}
                      className="bg-white dark:bg-[#141721] rounded-2xl p-3 border border-slate-100 dark:border-white/10 flex gap-3 shadow-sm hover:shadow-md transition"
                    >
                      <img
                        src={poster}
                        alt={title}
                        className="w-16 h-24 object-cover rounded-xl shrink-0 bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 font-bold uppercase text-gray-600 dark:text-gray-300">
                              {mediaType}
                            </span>
                            <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-yellow-500" />
                              {item.vote_average ? item.vote_average.toFixed(1) : '7.0'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{title}</h4>
                          <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">
                            {item.overview || 'No overview available.'}
                          </p>
                        </div>

                        <div className="pt-2">
                          {inLib ? (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              <span>In Catalog</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleIngest(item.id, mediaType, title)}
                              disabled={isIngesting}
                              className="px-3 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                            >
                              {isIngesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                              <span>{isIngesting ? 'Importing...' : '1-Click Add'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: Add Your Own Movie (Manual) */}
      {activeTab === 'manual' && (
        <div className="bg-white dark:bg-[#141721] rounded-3xl p-5 sm:p-7 shadow-app border border-slate-100/80 dark:border-white/10 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 dark:border-white/10 pb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-500" />
              <span>Add Your Own Custom Movie or Show</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Publish any title directly with your custom direct video links (MP4, HLS, embed, YouTube, Google Drive, or streaming servers).
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="font-bold text-gray-800 dark:text-gray-200">Movie / Show Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Exclusive Action Movie"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 dark:text-gray-200">Media Type</label>
                <select
                  value={manualForm.type}
                  onChange={(e) => setManualForm({ ...manualForm, type: e.target.value as any })}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-brand-500 font-semibold"
                >
                  <option value="movie">Movie</option>
                  <option value="tv">TV Series</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-gray-800 dark:text-gray-200">Release Date</label>
                <input
                  type="date"
                  value={manualForm.releaseDate}
                  onChange={(e) => setManualForm({ ...manualForm, releaseDate: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 dark:text-gray-200">Rating (1 to 10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={manualForm.rating}
                  onChange={(e) => setManualForm({ ...manualForm, rating: parseFloat(e.target.value) || 8.0 })}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 dark:text-gray-200">Genres (comma separated)</label>
                <input
                  type="text"
                  placeholder="Action, Sci-Fi, Drama"
                  value={manualForm.genres}
                  onChange={(e) => setManualForm({ ...manualForm, genres: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-800 dark:text-gray-200">Overview / Synopsis</label>
              <textarea
                rows={3}
                placeholder="Enter storyline or description..."
                value={manualForm.overview}
                onChange={(e) => setManualForm({ ...manualForm, overview: e.target.value })}
                className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>Poster Image URL (optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/poster.jpg"
                  value={manualForm.posterUrl}
                  onChange={(e) => setManualForm({ ...manualForm, posterUrl: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>Backdrop / Banner URL (optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/backdrop.jpg"
                  value={manualForm.backdropUrl}
                  onChange={(e) => setManualForm({ ...manualForm, backdropUrl: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Streaming Links Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Play className="w-4 h-4 text-brand-500" />
                <span>Streaming Server 1 (Primary)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300">Server Name</label>
                  <input
                    type="text"
                    value={manualForm.serverName}
                    onChange={(e) => setManualForm({ ...manualForm, serverName: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Video / Embed URL</label>
                  <input
                    type="text"
                    placeholder="https://... direct .mp4 or iframe embed player"
                    value={manualForm.streamUrl}
                    onChange={(e) => setManualForm({ ...manualForm, streamUrl: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Play className="w-4 h-4 text-gray-400" />
                <span>Streaming Server 2 (Backup Mirror, Optional)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300">Server Name</label>
                  <input
                    type="text"
                    value={manualForm.backupServerName}
                    onChange={(e) => setManualForm({ ...manualForm, backupServerName: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Backup Video / Embed URL</label>
                  <input
                    type="text"
                    placeholder="https://... secondary mirror or embed link"
                    value={manualForm.backupStreamUrl}
                    onChange={(e) => setManualForm({ ...manualForm, backupStreamUrl: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingManual}
                className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition"
              >
                {isSubmittingManual ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{isSubmittingManual ? 'Publishing...' : 'Publish Movie to Catalog'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Library Manager */}
      {activeTab === 'library' && (
        <div className="bg-white dark:bg-[#141721] rounded-3xl p-5 sm:p-7 shadow-app border border-slate-100/80 dark:border-white/10 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Your Catalog ({libraryItems.length} Titles)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage all movies and series in your catalog</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 p-1 rounded-full">
                {['all', 'movie', 'tv'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setLibraryFilter(t as any)}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition ${
                      libraryFilter === t ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {libraryItems.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/30 transition flex items-center gap-1 shrink-0"
                  title="Clear all titles"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
            </div>
          </div>

          {libraryLoading ? (
            <div className="py-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" />
              <p className="text-xs">Loading catalog items...</p>
            </div>
          ) : libraryItems.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-3">
              <Film className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Your catalog is currently empty.</p>
              <button
                onClick={() => setActiveTab('manual')}
                className="px-4 py-2 rounded-full bg-brand-500 text-white font-bold text-xs shadow-sm hover:bg-brand-600 transition"
              >
                ➕ Add Your First Movie
              </button>
            </div>
          ) : (
            <>
              {/* Mobile View: Clean Responsive Cards */}
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {libraryItems
                  .filter((m) => (libraryFilter === 'all' ? true : m.type === libraryFilter))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#10131b] border border-slate-100 dark:border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=200&auto=format&fit=crop'}
                          alt={item.title}
                          className="w-12 h-16 object-cover rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.title}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/20 px-1.5 py-0.5 rounded">
                              {item.type}
                            </span>
                            <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-yellow-500" />
                              {item.rating ? item.rating.toFixed(1) : '7.0'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {item.views || 0} views • {item.streams?.length || 0} servers
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/watch/${item.id}`}
                          className="p-2 rounded-full bg-white dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 shadow-sm border border-slate-200 dark:border-white/10"
                          title="Watch"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-2 rounded-full bg-white dark:bg-white/10 hover:bg-red-50 dark:hover:bg-red-500/20 text-red-500 shadow-sm border border-slate-200 dark:border-white/10"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Desktop View: Full Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#0c0e14] border-b border-slate-200 dark:border-white/10 text-gray-500 dark:text-gray-400 uppercase font-bold">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Streams</th>
                      <th className="p-3">Views</th>
                      <th className="p-3">Featured</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                    {libraryItems
                      .filter((m) => (libraryFilter === 'all' ? true : m.type === libraryFilter))
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                          <td className="p-3 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <img
                              src={item.posterUrl}
                              alt={item.title}
                              className="w-7 h-10 object-cover rounded bg-slate-200 dark:bg-slate-800 shrink-0"
                            />
                            <span className="truncate max-w-[200px]">{item.title}</span>
                          </td>
                          <td className="p-3 uppercase font-semibold">{item.type}</td>
                          <td className="p-3 font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500" />
                            {item.rating ? item.rating.toFixed(1) : '7.0'}
                          </td>
                          <td className="p-3">{item.streams?.length || 0}</td>
                          <td className="p-3">{(item.views || 0).toLocaleString()}</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleFeatured(item)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.featured ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {item.featured ? '★ Featured' : 'Normal'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/watch/${item.id}`}
                                className="p-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition"
                                title="Watch"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id, item.title)}
                                className="p-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-red-50 dark:hover:bg-red-500/20 text-red-500 transition"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 4: Trending Releases Ingest */}
      {activeTab === 'trending' && (
        <div className="bg-white dark:bg-[#141721] rounded-3xl p-5 sm:p-7 shadow-app border border-slate-100/80 dark:border-white/10 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Current Trending Releases</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">1-Click import trending global movies and series into your catalog</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 p-1 rounded-full w-fit">
              <button
                onClick={() => setTrendingType('movie')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  trendingType === 'movie' ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setTrendingType('tv')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  trendingType === 'tv' ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                TV Series
              </button>
            </div>
          </div>

          {trendingLoading ? (
            <div className="py-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" />
              <p className="text-xs">Loading trending releases...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingResults.map((item) => {
                const title = item.title || item.name;
                const poster = item.poster_path
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&auto=format&fit=crop';
                const inLib = isAlreadyInLibrary(item.id);
                const isIngesting = ingestingId === String(item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-slate-50 dark:bg-[#10131b] rounded-2xl p-3 border border-slate-100 dark:border-white/10 flex gap-3 shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={poster}
                      alt={title}
                      className="w-16 h-24 object-cover rounded-xl shrink-0 bg-slate-200 dark:bg-slate-800"
                    />
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-500" />
                            {item.vote_average ? item.vote_average.toFixed(1) : '7.0'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{title}</h4>
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">
                          {item.overview || 'No description available.'}
                        </p>
                      </div>

                      <div className="pt-2">
                        {inLib ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            <span>In Catalog</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleIngest(item.id, trendingType, title)}
                            disabled={isIngesting}
                            className="px-3 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                          >
                            {isIngesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            <span>{isIngesting ? 'Importing...' : '1-Click Add'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white dark:bg-[#141721] rounded-3xl p-5 sm:p-7 shadow-app border border-slate-100/80 dark:border-white/10 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">System & TMDB Configuration</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage streaming platform configuration</p>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full border border-brand-200/60 dark:border-brand-500/30 text-xs font-mono font-bold">
              <span>Nex Streaming</span>
            </div>
          </div>
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300">TMDB API Key</label>
              <input
                type="text"
                value={settings.tmdbApiKey}
                onChange={(e) => setSettings({ ...settings, tmdbApiKey: e.target.value })}
                className="w-full mt-1 bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-900 dark:text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition"
            >
              Save Settings
            </button>
          </form>
        </div>
      )}

      {/* Custom Confirmation Alert Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-400">Loading Admin...</div>}>
      <AdminContent />
    </Suspense>
  );
}
