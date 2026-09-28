-- ==========================================
-- PRIME VISION CINESTREAM SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create Media Items Table
CREATE TABLE IF NOT EXISTS public.movies (
  id TEXT PRIMARY KEY,
  tmdb_id BIGINT,
  imdb_id TEXT,
  title TEXT NOT NULL,
  original_title TEXT,
  type TEXT NOT NULL DEFAULT 'movie', -- 'movie' or 'tv'
  overview TEXT,
  tagline TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  release_date TEXT,
  rating NUMERIC(3,1) DEFAULT 7.5,
  vote_count BIGINT DEFAULT 0,
  runtime INTEGER,
  genres JSONB DEFAULT '[]'::jsonb,
  cast_members JSONB DEFAULT '[]'::jsonb,
  director TEXT,
  trailer_key TEXT,
  trailer_url TEXT,
  featured BOOLEAN DEFAULT false,
  trending BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  views BIGINT DEFAULT 0,
  streams JSONB DEFAULT '[]'::jsonb,
  seasons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create System Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  site_name TEXT DEFAULT 'Nex',
  site_description TEXT DEFAULT 'Watch unlimited movies, TV shows, and series in HD.',
  tmdb_api_key TEXT DEFAULT '841459a58d04735c026040cd8ab00d02',
  primary_stream_provider TEXT DEFAULT 'vidlink',
  enable_auto_streams BOOLEAN DEFAULT true,
  disclaimer TEXT DEFAULT 'This site does not store files on its servers.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insert default system settings if not present
INSERT INTO public.settings (id, site_name, site_description, tmdb_api_key, primary_stream_provider)
VALUES ('default_settings', 'Nex', 'Stream movies & TV shows in HD', '841459a58d04735c026040cd8ab00d02', 'vidlink')
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Row Level Security (RLS) with Public Read & Service Role Write
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to movies & settings
CREATE POLICY "Allow public read on movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Allow public insert on movies" ON public.movies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on movies" ON public.movies FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on movies" ON public.movies FOR DELETE USING (true);

CREATE POLICY "Allow public read on settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public write on settings" ON public.settings FOR ALL USING (true);

-- Indexes for ultra fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_movies_type ON public.movies(type);
CREATE INDEX IF NOT EXISTS idx_movies_featured ON public.movies(featured);
CREATE INDEX IF NOT EXISTS idx_movies_views ON public.movies(views DESC);
