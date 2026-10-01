import fs from 'fs';
import os from 'os';
import path from 'path';
import { MediaItem, MediaType, SystemSettings } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

interface DatabaseSchema {
  movies: MediaItem[];
  settings: SystemSettings;
}

const PROJECT_DATA_DIR = path.join(process.cwd(), 'data');
const FALLBACK_DATA_DIR = path.join(os.tmpdir(), 'cool-maxwell-data');

let DATA_DIR = PROJECT_DATA_DIR;
let DB_FILE = path.join(DATA_DIR, 'db.json');

let inMemoryCache: DatabaseSchema | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 2000;

function resolveWritableDataStore() {
  const candidates = [
    { dir: PROJECT_DATA_DIR, file: path.join(PROJECT_DATA_DIR, 'db.json') },
    { dir: FALLBACK_DATA_DIR, file: path.join(FALLBACK_DATA_DIR, 'db.json') },
  ];

  for (const candidate of candidates) {
    try {
      if (!fs.existsSync(candidate.dir)) {
        fs.mkdirSync(candidate.dir, { recursive: true });
      }
      fs.accessSync(candidate.dir, fs.constants.W_OK);
      DATA_DIR = candidate.dir;
      DB_FILE = candidate.file;
      return;
    } catch {
      // Fall through to next candidate
    }
  }

  DATA_DIR = FALLBACK_DATA_DIR;
  DB_FILE = path.join(FALLBACK_DATA_DIR, 'db.json');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'Nex',
  siteDescription: 'Stream unlimited movies, TV shows, and series in HD with multiple fast servers.',
  tmdbApiKey: '78def161c2fe525795ba67ecb09f8556',
  primaryStreamProvider: 'vidlink',
  enableAutoStreams: true,
  disclaimer: 'This site does not store any files on its server. All contents are provided by non-affiliated third parties.',
};

function ensureDbExists(): DatabaseSchema {
  const now = Date.now();
  if (inMemoryCache && now - lastCacheTime < CACHE_TTL_MS) {
    return inMemoryCache;
  }

  resolveWritableDataStore();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      movies: [],
      settings: DEFAULT_SETTINGS,
    };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData), 'utf-8');
    } catch {}
    inMemoryCache = initialData;
    lastCacheTime = now;
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.movies || !Array.isArray(parsed.movies)) {
      parsed.movies = [];
    }
    if (!parsed.settings) {
      parsed.settings = DEFAULT_SETTINGS;
    }
    inMemoryCache = parsed;
    lastCacheTime = now;
    return parsed;
  } catch (err) {
    const initialData: DatabaseSchema = {
      movies: [],
      settings: DEFAULT_SETTINGS,
    };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData), 'utf-8');
    } catch {}
    inMemoryCache = initialData;
    lastCacheTime = now;
    return initialData;
  }
}

function saveDb(data: DatabaseSchema): void {
  inMemoryCache = data;
  lastCacheTime = Date.now();
  try {
    resolveWritableDataStore();
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data), 'utf-8');
  } catch (e) {
    // Ignore write errors on read-only serverless lambdas
  }
}

function mapSupabaseRowToMediaItem(row: any): MediaItem {
  return {
    id: String(row.id),
    tmdbId: row.tmdb_id ? Number(row.tmdb_id) : undefined,
    imdbId: row.imdb_id || undefined,
    title: row.title || 'Untitled',
    originalTitle: row.original_title || row.title || 'Untitled',
    type: (row.type === 'tv' ? 'tv' : 'movie') as MediaType,
    overview: row.overview || '',
    tagline: row.tagline || '',
    posterUrl: row.poster_url || '',
    backdropUrl: row.backdrop_url || row.poster_url || '',
    releaseDate: row.release_date || '',
    rating: typeof row.rating === 'number' ? row.rating : (parseFloat(row.rating) || 7.5),
    voteCount: row.vote_count ? Number(row.vote_count) : undefined,
    runtime: row.runtime ? Number(row.runtime) : undefined,
    genres: Array.isArray(row.genres) ? row.genres : [],
    cast: Array.isArray(row.cast_members) ? row.cast_members : (Array.isArray(row.cast) ? row.cast : []),
    director: row.director || '',
    trailerKey: row.trailer_key || '',
    trailerUrl: row.trailer_url || (row.trailer_key ? `https://www.youtube.com/watch?v=${row.trailer_key}` : ''),
    featured: Boolean(row.featured),
    trending: Boolean(row.trending),
    status: (row.status || 'published') as 'published' | 'draft',
    views: Number(row.views) || 0,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    streams: Array.isArray(row.streams) ? row.streams : [],
    seasons: Array.isArray(row.seasons) ? row.seasons : [],
  };
}

function mapMediaItemToSupabaseRow(item: MediaItem) {
  return {
    id: item.id,
    tmdb_id: item.tmdbId,
    imdb_id: item.imdbId,
    title: item.title,
    type: item.type,
    overview: item.overview,
    tagline: item.tagline,
    poster_url: item.posterUrl,
    backdrop_url: item.backdropUrl,
    release_date: item.releaseDate,
    rating: item.rating,
    runtime: item.runtime,
    genres: item.genres,
    cast_members: item.cast,
    director: item.director,
    trailer_key: item.trailerKey,
    featured: item.featured,
    trending: item.trending,
    status: item.status || 'published',
    streams: item.streams,
    seasons: item.seasons,
    views: item.views || 0,
    updated_at: new Date().toISOString(),
  };
}

// Circuit breaker for Supabase to protect against hanging requests when Supabase is unhealthy/slow
let supabaseIsHealthy = true;
let lastSupabaseHealthCheck = 0;
const SUPABASE_CHECK_COOLDOWN_MS = 60000; // 1 minute cooldown if Supabase fails
const SUPABASE_TIMEOUT_MS = 1500; // 1.5s max timeout before immediate local fallback

function isSupabaseAvailable(): boolean {
  if (!isSupabaseConfigured || !supabase) return false;
  if (!supabaseIsHealthy) {
    if (Date.now() - lastSupabaseHealthCheck < SUPABASE_CHECK_COOLDOWN_MS) {
      return false; // Skip hanging calls during cooldown
    }
  }
  return true;
}

async function withSupabaseTimeout<T>(promise: PromiseLike<T>, timeoutMs = SUPABASE_TIMEOUT_MS): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Supabase request timed out')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (err) {
    supabaseIsHealthy = false;
    lastSupabaseHealthCheck = Date.now();
    throw err;
  } finally {
    clearTimeout(timer!);
  }
}

// Database operations
export const db = {
  getAll: async (query?: { type?: string; genre?: string; search?: string; status?: string; sort?: string }): Promise<MediaItem[]> => {
    let items: MediaItem[] = [];

    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await withSupabaseTimeout(supabase.from('movies').select('*'));
        if (!error && data) {
          items = data.map(mapSupabaseRowToMediaItem);
          supabaseIsHealthy = true;
        }
      } catch (e) {
        // Fast local fallback without delaying user
      }
    }

    if (items.length === 0) {
      const { movies } = ensureDbExists();
      items = [...movies];
    } else {
      // Sync local db.json cache
      try {
        const current = ensureDbExists();
        current.movies = items;
        saveDb(current);
      } catch (e) {}
    }

    let results = [...items];

    if (query?.status) {
      results = results.filter(m => m.status === query.status);
    }

    if (query?.type && query.type !== 'all') {
      results = results.filter(m => m.type === query.type);
    }

    if (query?.genre && query.genre !== 'all' && query.genre !== 'All') {
      const g = query.genre.toLowerCase().trim();
      results = results.filter(m => m.genres.some(genre => {
        const itemGenre = genre.toLowerCase();
        if (itemGenre.includes(g)) return true;
        if ((g.includes('sci-fi') || g.includes('science fiction')) && (itemGenre.includes('sci-fi') || itemGenre.includes('science fiction'))) return true;
        if ((g.includes('action') || g.includes('adventure')) && (itemGenre.includes('action') || itemGenre.includes('adventure'))) return true;
        return false;
      }));
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.toLowerCase().trim();
      results = results.filter(m => 
        m.title.toLowerCase().includes(q) ||
        (m.originalTitle && m.originalTitle.toLowerCase().includes(q)) ||
        m.overview.toLowerCase().includes(q) ||
        m.genres.some(g => g.toLowerCase().includes(q)) ||
        m.cast.some(c => c.name?.toLowerCase().includes(q))
      );
    }

    if (query?.sort) {
      switch (query.sort) {
        case 'newest_added':
          results.sort((a, b) => new Date(b.createdAt || b.releaseDate || 0).getTime() - new Date(a.createdAt || a.releaseDate || 0).getTime());
          break;
        case 'rating':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'views':
          results.sort((a, b) => b.views - a.views);
          break;
        case 'newest':
        case 'release_date':
          results.sort((a, b) => new Date(b.releaseDate || b.createdAt || 0).getTime() - new Date(a.releaseDate || a.createdAt || 0).getTime());
          break;
        case 'title':
          results.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          results.sort((a, b) => new Date(b.createdAt || b.releaseDate || 0).getTime() - new Date(a.createdAt || a.releaseDate || 0).getTime());
      }
    } else {
      // Default: arranged by newest added first
      results.sort((a, b) => new Date(b.createdAt || b.releaseDate || 0).getTime() - new Date(a.createdAt || a.releaseDate || 0).getTime());
    }

    return results.map(item => ({
      ...item,
      seasons: item.seasons ? item.seasons.map(s => ({
        seasonNumber: s.seasonNumber,
        name: s.name,
        overview: s.overview,
        posterUrl: s.posterUrl,
        episodeCount: s.episodes?.length || s.episodeCount || 0,
        episodes: [],
      })) : undefined
    }));
  },

  getById: async (id: string): Promise<MediaItem | undefined> => {
    // Check local database first for instant sub-millisecond retrieval
    const { movies } = ensureDbExists();
    const localMatch = movies.find(m => m.id === id || String(m.tmdbId) === id || m.imdbId === id);
    if (localMatch) {
      return localMatch;
    }

    if (isSupabaseAvailable() && supabase) {
      try {
        const numericId = !isNaN(Number(id)) ? Number(id) : null;
        let query = supabase.from('movies').select('*');
        if (numericId) {
          query = query.or(`id.eq.${id},tmdb_id.eq.${numericId}`);
        } else {
          query = query.or(`id.eq.${id},imdb_id.eq.${id}`);
        }
        
        const { data, error } = await withSupabaseTimeout(query);
        if (!error && data && data.length > 0) {
          const item = mapSupabaseRowToMediaItem(data[0]);
          // Cache in local db
          const current = ensureDbExists();
          if (!current.movies.some(m => m.id === item.id)) {
            current.movies.unshift(item);
            saveDb(current);
          }
          return item;
        }
      } catch (e) {
        // Fallback gracefully
      }
    }

    return undefined;
  },

  create: async (item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt' | 'views'> & { id?: string }): Promise<MediaItem> => {
    const current = ensureDbExists();
    const id = item.id || (item.tmdbId ? `${item.type}-${item.tmdbId}` : `custom-${Date.now()}`);
    
    const existingIndex = current.movies.findIndex(m => m.id === id || (item.tmdbId && m.tmdbId === item.tmdbId && m.type === item.type));
    const now = new Date().toISOString();

    const numRating = typeof item.rating === 'number' ? item.rating : (parseFloat(String(item.rating)) || 0);
    const shouldAutoFeature = numRating >= 7.0 || Boolean(item.featured);

    const newItem: MediaItem = {
      ...item,
      id,
      featured: shouldAutoFeature,
      views: existingIndex >= 0 ? (current.movies[existingIndex].views || 0) : 0,
      createdAt: existingIndex >= 0 ? current.movies[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      current.movies[existingIndex] = newItem;
    } else {
      current.movies.unshift(newItem);
    }
    saveDb(current);

    if (isSupabaseAvailable() && supabase) {
      withSupabaseTimeout(
        supabase.from('movies').upsert(mapMediaItemToSupabaseRow(newItem))
      ).catch(() => {});
    }

    return newItem;
  },

  update: async (id: string, updates: Partial<MediaItem>): Promise<MediaItem | null> => {
    const current = ensureDbExists();
    const index = current.movies.findIndex(m => m.id === id);

    let updatedItem: MediaItem;
    if (index >= 0) {
      current.movies[index] = {
        ...current.movies[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      updatedItem = current.movies[index];
      saveDb(current);
    } else {
      const existing = await db.getById(id);
      if (!existing) return null;
      updatedItem = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      current.movies.unshift(updatedItem);
      saveDb(current);
    }

    if (isSupabaseAvailable() && supabase) {
      withSupabaseTimeout(
        supabase.from('movies').upsert(mapMediaItemToSupabaseRow(updatedItem))
      ).catch(() => {});
    }

    return updatedItem;
  },

  delete: async (id: string): Promise<boolean> => {
    const current = ensureDbExists();
    current.movies = current.movies.filter(m => m.id !== id);
    saveDb(current);

    if (isSupabaseAvailable() && supabase) {
      withSupabaseTimeout(
        supabase.from('movies').delete().eq('id', id)
      ).catch(() => {});
    }

    return true;
  },

  clearAll: async (): Promise<boolean> => {
    const current = ensureDbExists();
    current.movies = [];
    saveDb(current);

    if (isSupabaseAvailable() && supabase) {
      withSupabaseTimeout(
        supabase.from('movies').delete().neq('id', '____dummy_never_match____')
      ).catch(() => {});
    }

    return true;
  },

  incrementViews: async (id: string): Promise<void> => {
    const current = ensureDbExists();
    const index = current.movies.findIndex(m => m.id === id || String(m.tmdbId) === id || m.imdbId === id);
    if (index >= 0) {
      current.movies[index].views = (current.movies[index].views || 0) + 1;
      saveDb(current);

      if (isSupabaseAvailable() && supabase) {
        withSupabaseTimeout(
          supabase.from('movies').update({ views: current.movies[index].views }).eq('id', current.movies[index].id)
        ).catch(() => {});
      }
    }
  },

  getStats: async () => {
    const movies = await db.getAll();
    const totalMovies = movies.filter(m => m.type === 'movie').length;
    const totalTv = movies.filter(m => m.type === 'tv').length;
    const totalViews = movies.reduce((acc, m) => acc + (m.views || 0), 0);
    const totalStreams = movies.reduce((acc, m) => {
      if (m.type === 'movie') return acc + (m.streams?.length || 0);
      const epCount = m.seasons?.reduce((sAcc, s) => sAcc + s.episodes.length, 0) || 0;
      return acc + epCount;
    }, 0);

    return {
      totalItems: movies.length,
      totalMovies,
      totalTv,
      totalViews,
      totalStreams,
    };
  },

  getSettings: (): SystemSettings => {
    const { settings } = ensureDbExists();
    return settings || DEFAULT_SETTINGS;
  },

  updateSettings: (newSettings: Partial<SystemSettings>): SystemSettings => {
    const current = ensureDbExists();
    current.settings = {
      ...current.settings,
      ...newSettings,
    };
    saveDb(current);
    return current.settings;
  },

  resetDefaults: (): void => {
    const initialData: DatabaseSchema = {
      movies: [],
      settings: DEFAULT_SETTINGS,
    };
    saveDb(initialData);
  }
};
