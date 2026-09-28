'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Shield, 
  Search, 
  Plus, 
  Download, 
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
  Flame
} from 'lucide-react';
import { MediaItem, MediaType, StreamSource, SystemSettings } from '@/types';
import { STREAM_PROVIDERS } from '@/lib/streams';
import Link from 'next/link';

function AdminContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'search';

  const [activeTab, setActiveTab] = useState<'search' | 'library' | 'trending' | 'manual' | 'settings'>(initialTab);

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
    genres: 'Action, Adventure',
    streamUrl: '',
    serverName: 'Direct HD Stream',
  });

  // Settings & Stats
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Nex',
    siteDescription: '',
    tmdbApiKey: '841459a58d04735c026040cd8ab00d02',
    primaryStreamProvider: 'vidlink',
    enableAutoStreams: true,
    disclaimer: '',
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
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
        setLibraryItems(json.data);
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

  // Delete media
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/movies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLibraryItems((prev) => prev.filter((m) => m.id !== id));
        loadStats();
        showNotification('success', `Deleted "${title}"`);
      }
    } catch (e) {
      showNotification('error', 'Failed to delete item');
    }
  };

  // Handle Manual Add
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.title.trim()) {
      showNotification('error', 'Title is required');
      return;
    }

    try {
      const genresList = manualForm.genres.split(',').map((g) => g.trim()).filter(Boolean);
      const streams: StreamSource[] = manualForm.streamUrl
        ? [
            {
              id: `custom-${Date.now()}`,
              serverName: manualForm.serverName || 'Direct HD',
              url: manualForm.streamUrl,
              type: manualForm.streamUrl.endsWith('.mp4') ? 'mp4' : 'embed',
              quality: '1080p HD',
              isWorking: true,
            },
          ]
        : [];

      const body = {
        title: manualForm.title,
        type: manualForm.type,
        overview: manualForm.overview || 'Custom streaming title.',
        posterUrl: manualForm.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
        backdropUrl: manualForm.backdropUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
        releaseDate: manualForm.releaseDate,
        rating: Number(manualForm.rating) || 8.0,
        genres: genresList,
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
        showNotification('success', `Added "${manualForm.title}"!`);
        loadLibrary();
        loadStats();
        setActiveTab('library');
      }
    } catch (e) {
      showNotification('error', 'Failed to create manual item');
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
        showNotification('success', 'Settings saved!');
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-app border border-slate-100/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Nex Admin Center
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500 text-white font-bold">
                  LIVE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 font-mono">
                  Nex 1.2
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Search movie titles, auto-pull details, and attach free multi-server streaming links
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-brand-500 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Catalog Titles</span>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.totalItems}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Movies</span>
              <p className="text-2xl font-black text-brand-500 mt-0.5">{stats.totalMovies}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <span className="text-[11px] text-gray-500 uppercase font-bold">TV Shows</span>
              <p className="text-2xl font-black text-blue-600 mt-0.5">{stats.totalTv}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Total Views</span>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{stats.totalViews.toLocaleString()}</p>
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

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'search', label: '🔍 Search & Auto-Import', icon: Search },
          { id: 'trending', label: '🔥 Trending Ingest', icon: Flame },
          { id: 'library', label: `🎬 Catalog (${libraryItems.length})`, icon: Database },
          { id: 'manual', label: '➕ Direct Stream Link', icon: Plus },
          { id: 'settings', label: '⚙️ Settings & TMDB', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition shadow-sm ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white shadow-brand-500/25'
                : 'bg-white text-gray-600 hover:text-gray-950 border border-slate-100'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Search & Auto-Ingest */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 space-y-4 shadow-app border border-slate-100/80">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>Search Movie or Series Title</span>
              </h3>
              <p className="text-xs text-gray-500">
                Type any movie or show title. The system pulls details and generates free streaming server links instantly.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Avatar, Inception, Breaking Bad, Gladiator..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 pl-10 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>

              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-brand-500"
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
              <p className="text-xs font-semibold">Searching TMDB catalog...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Results ({searchResults.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((item) => {
                  const mType = item.media_type || (item.title ? 'movie' : 'tv');
                  const title = item.title || item.name;
                  const date = item.release_date || item.first_air_date || '';
                  const year = date ? date.split('-')[0] : 'N/A';
                  const poster = item.poster_path
                    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
                  const alreadyImported = isAlreadyInLibrary(item.id);
                  const isIngesting = ingestingId === String(item.id);

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3.5 p-3 rounded-2xl bg-white border border-slate-100/80 shadow-sm hover:shadow-md transition group"
                    >
                      <img
                        src={poster}
                        alt={title}
                        className="w-16 h-24 object-cover rounded-xl shadow-sm shrink-0 bg-slate-100"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-gray-700">
                              {mType}
                            </span>
                            <span className="text-xs text-yellow-600 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              {item.vote_average ? item.vote_average.toFixed(1) : '7.0'}
                            </span>
                            <span className="text-xs text-gray-400">{year}</span>
                          </div>
                          <h4 className="text-gray-900 font-bold text-sm truncate mt-1 group-hover:text-brand-500 transition">
                            {title}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                            {item.overview || 'No synopsis.'}
                          </p>
                        </div>

                        <div className="pt-2">
                          {alreadyImported ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <CheckCircle className="w-3.5 h-3.5" />
                              In Library
                            </span>
                          ) : (
                            <button
                              onClick={() => handleIngest(item.id, mType, title)}
                              disabled={isIngesting}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition"
                            >
                              {isIngesting ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Importing...</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3" />
                                  <span>1-Click Auto Import</span>
                                </>
                              )}
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

      {/* TAB 2: Trending Ingest */}
      {activeTab === 'trending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-3xl p-4 border border-slate-100/80 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900">Trending Discovery</h3>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full">
              <button
                onClick={() => setTrendingType('movie')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  trendingType === 'movie' ? 'bg-brand-500 text-white' : 'text-gray-600'
                }`}
              >
                Trending Movies
              </button>
              <button
                onClick={() => setTrendingType('tv')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  trendingType === 'tv' ? 'bg-brand-500 text-white' : 'text-gray-600'
                }`}
              >
                Trending TV Shows
              </button>
            </div>
          </div>

          {trendingLoading ? (
            <div className="py-20 text-center text-gray-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" />
              <p className="text-xs font-semibold">Loading trending titles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingResults.map((item) => {
                const title = item.title || item.name;
                const poster = item.poster_path
                  ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                  : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
                const alreadyImported = isAlreadyInLibrary(item.id);
                const isIngesting = ingestingId === String(item.id);

                return (
                  <div
                    key={item.id}
                    className="flex gap-3.5 p-3 rounded-2xl bg-white border border-slate-100/80 shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={poster}
                      alt={title}
                      className="w-16 h-24 object-cover rounded-xl shadow-sm shrink-0 bg-slate-100"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-gray-900 font-bold text-sm truncate">{title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.overview}</p>
                      </div>

                      <div className="pt-2">
                        {alreadyImported ? (
                          <span className="text-xs font-semibold text-emerald-600">✓ In Library</span>
                        ) : (
                          <button
                            onClick={() => handleIngest(item.id, trendingType, title)}
                            disabled={isIngesting}
                            className="px-3 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-sm"
                          >
                            {isIngesting ? 'Importing...' : '1-Click Import'}
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

      {/* TAB 3: Library Manager */}
      {activeTab === 'library' && (
        <div className="bg-white rounded-3xl p-6 shadow-app border border-slate-100/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Manage Catalog ({libraryItems.length})</h3>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
              {['all', 'movie', 'tv'].map((t) => (
                <button
                  key={t}
                  onClick={() => setLibraryFilter(t as any)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition ${
                    libraryFilter === t ? 'bg-brand-500 text-white' : 'text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-gray-500 uppercase font-bold">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Views</th>
                  <th className="p-3">Featured</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-gray-700">
                {libraryItems
                  .filter((m) => (libraryFilter === 'all' ? true : m.type === libraryFilter))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-gray-900">{item.title}</td>
                      <td className="p-3 uppercase">{item.type}</td>
                      <td className="p-3 font-semibold text-yellow-600">{item.rating}</td>
                      <td className="p-3">{(item.views || 0).toLocaleString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleFeatured(item)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.featured ? 'bg-brand-500 text-white' : 'bg-slate-100 text-gray-500'
                          }`}
                        >
                          {item.featured ? '★ Featured' : 'Normal'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/watch/${item.id}`}
                            className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-1 rounded-full bg-slate-100 hover:bg-red-50 text-red-500"
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
        </div>
      )}

      {/* TAB 4: Manual Add */}
      {activeTab === 'manual' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-app border border-slate-100/80 space-y-4">
          <h3 className="text-base font-bold text-gray-900">Add Custom Direct Video Link</h3>
          <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-700">Title</label>
              <input
                type="text"
                required
                value={manualForm.title}
                onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700">Direct Video / Embed URL</label>
              <input
                type="text"
                value={manualForm.streamUrl}
                onChange={(e) => setManualForm({ ...manualForm, streamUrl: e.target.value })}
                placeholder="https://example.com/stream.mp4 or embed url"
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25"
            >
              Publish Title
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-app border border-slate-100/80 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">System & TMDB Configuration</h3>
              <p className="text-xs text-gray-500">Manage streaming platform configuration</p>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-50 text-brand-600 px-3 py-1 rounded-full border border-brand-200/60 text-xs font-mono font-bold">
              <span>Nex 1.2</span>
            </div>
          </div>
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700">TMDB API Key</label>
              <input
                type="text"
                value={settings.tmdbApiKey}
                onChange={(e) => setSettings({ ...settings, tmdbApiKey: e.target.value })}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-gray-900 font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25"
            >
              Save Settings
            </button>
          </form>
        </div>
      )}
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
