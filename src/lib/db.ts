import fs from 'fs';
import path from 'path';
import { MediaItem, SystemSettings } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

interface DatabaseSchema {
  movies: MediaItem[];
  settings: SystemSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'Nex',
  siteDescription: 'Stream unlimited movies, TV shows, and series in HD with multiple fast servers.',
  tmdbApiKey: '841459a58d04735c026040cd8ab00d02',
  primaryStreamProvider: 'vidlink',
  enableAutoStreams: true,
  disclaimer: 'This site does not store any files on its server. All contents are provided by non-affiliated third parties.',
};

function ensureDbExists(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      movies: [],
      settings: DEFAULT_SETTINGS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
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
    return parsed;
  } catch (err) {
    console.error('Error reading db.json, recreating clean state...', err);
    const initialData: DatabaseSchema = {
      movies: [],
      settings: DEFAULT_SETTINGS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDb(data: DatabaseSchema): void {
  ensureDbExists();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function syncSupabaseUpsert(data: any) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('movies').upsert(data);
  } catch (e) {
    console.error('Supabase upsert error:', e);
  }
}

async function syncSupabaseInsert(data: any) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('movies').insert(data);
  } catch (e) {
    console.error('Supabase insert error:', e);
  }
}

async function syncSupabaseUpdate(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('movies').update(data).eq('id', id);
  } catch (e) {
    console.error('Supabase update error:', e);
  }
}

async function syncSupabaseDelete(id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('movies').delete().eq('id', id);
  } catch (e) {
    console.error('Supabase delete error:', e);
  }
}

// Database operations
export const db = {
  getAll: (query?: { type?: string; genre?: string; search?: string; status?: string; sort?: string }): MediaItem[] => {
    const { movies } = ensureDbExists();
    let results = [...movies];

    if (query?.status) {
      results = results.filter(m => m.status === query.status);
    }

    if (query?.type && query.type !== 'all') {
      results = results.filter(m => m.type === query.type);
    }

    if (query?.genre && query.genre !== 'all') {
      const g = query.genre.toLowerCase();
      results = results.filter(m => m.genres.some(genre => genre.toLowerCase().includes(g)));
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.toLowerCase().trim();
      results = results.filter(m => 
        m.title.toLowerCase().includes(q) ||
        (m.originalTitle && m.originalTitle.toLowerCase().includes(q)) ||
        m.overview.toLowerCase().includes(q) ||
        m.genres.some(g => g.toLowerCase().includes(q)) ||
        m.cast.some(c => c.name.toLowerCase().includes(q))
      );
    }

    if (query?.sort) {
      switch (query.sort) {
        case 'rating':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'views':
          results.sort((a, b) => b.views - a.views);
          break;
        case 'newest':
          results.sort((a, b) => new Date(b.releaseDate || b.createdAt).getTime() - new Date(a.releaseDate || a.createdAt).getTime());
          break;
        case 'title':
          results.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return results;
  },

  getById: (id: string): MediaItem | undefined => {
    const { movies } = ensureDbExists();
    return movies.find(m => m.id === id || String(m.tmdbId) === id || m.imdbId === id);
  },

  create: (item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt' | 'views'> & { id?: string }): MediaItem => {
    const current = ensureDbExists();
    const id = item.id || (item.tmdbId ? `${item.type}-${item.tmdbId}` : `custom-${Date.now()}`);
    
    // Check if already exists
    const existingIndex = current.movies.findIndex(m => m.id === id || (item.tmdbId && m.tmdbId === item.tmdbId && m.type === item.type));
    
    const now = new Date().toISOString();
    const newItem: MediaItem = {
      ...item,
      id,
      views: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      current.movies[existingIndex] = {
        ...current.movies[existingIndex],
        ...newItem,
        id: current.movies[existingIndex].id,
        views: current.movies[existingIndex].views,
        createdAt: current.movies[existingIndex].createdAt,
        updatedAt: now,
      };
      saveDb(current);

      syncSupabaseUpsert({
        id: current.movies[existingIndex].id,
        tmdb_id: current.movies[existingIndex].tmdbId,
        imdb_id: current.movies[existingIndex].imdbId,
        title: current.movies[existingIndex].title,
        type: current.movies[existingIndex].type,
        overview: current.movies[existingIndex].overview,
        tagline: current.movies[existingIndex].tagline,
        poster_url: current.movies[existingIndex].posterUrl,
        backdrop_url: current.movies[existingIndex].backdropUrl,
        release_date: current.movies[existingIndex].releaseDate,
        rating: current.movies[existingIndex].rating,
        runtime: current.movies[existingIndex].runtime,
        genres: current.movies[existingIndex].genres,
        cast_members: current.movies[existingIndex].cast,
        director: current.movies[existingIndex].director,
        trailer_key: current.movies[existingIndex].trailerKey,
        featured: current.movies[existingIndex].featured,
        trending: current.movies[existingIndex].trending,
        streams: current.movies[existingIndex].streams,
        seasons: current.movies[existingIndex].seasons,
        views: current.movies[existingIndex].views,
      });

      return current.movies[existingIndex];
    }

    current.movies.unshift(newItem);
    saveDb(current);

    syncSupabaseInsert({
      id: newItem.id,
      tmdb_id: newItem.tmdbId,
      imdb_id: newItem.imdbId,
      title: newItem.title,
      type: newItem.type,
      overview: newItem.overview,
      tagline: newItem.tagline,
      poster_url: newItem.posterUrl,
      backdrop_url: newItem.backdropUrl,
      release_date: newItem.releaseDate,
      rating: newItem.rating,
      runtime: newItem.runtime,
      genres: newItem.genres,
      cast_members: newItem.cast,
      director: newItem.director,
      trailer_key: newItem.trailerKey,
      featured: newItem.featured,
      trending: newItem.trending,
      streams: newItem.streams,
      seasons: newItem.seasons,
      views: 0,
    });

    return newItem;
  },

  update: (id: string, updates: Partial<MediaItem>): MediaItem | null => {
    const current = ensureDbExists();
    const index = current.movies.findIndex(m => m.id === id);
    if (index === -1) return null;

    current.movies[index] = {
      ...current.movies[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveDb(current);

    syncSupabaseUpdate(id, {
      featured: updates.featured,
      trending: updates.trending,
      rating: updates.rating,
      overview: updates.overview,
      streams: updates.streams,
      seasons: updates.seasons,
      updated_at: new Date().toISOString(),
    });

    return current.movies[index];
  },

  delete: (id: string): boolean => {
    const current = ensureDbExists();
    const initialLen = current.movies.length;
    current.movies = current.movies.filter(m => m.id !== id);
    if (current.movies.length !== initialLen) {
      saveDb(current);
      syncSupabaseDelete(id);
      return true;
    }
    return false;
  },

  incrementViews: (id: string): void => {
    const current = ensureDbExists();
    const item = current.movies.find(m => m.id === id || String(m.tmdbId) === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      saveDb(current);
    }
  },

  getStats: () => {
    const { movies } = ensureDbExists();
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
