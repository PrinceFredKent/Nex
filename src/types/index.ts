export type MediaType = 'movie' | 'tv';

export interface StreamSource {
  id: string;
  serverName: string;
  url: string;
  type?: 'embed' | 'mp4' | 'm3u8' | 'custom';
  quality?: string;
  isWorking?: boolean;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  overview?: string;
  stillUrl?: string;
  runtime?: number;
  airDate?: string;
  streams: StreamSource[];
}

export interface Season {
  id?: string;
  seasonNumber: number;
  name: string;
  overview?: string;
  posterUrl?: string;
  episodeCount?: number;
  episodes: Episode[];
}

export interface CastMember {
  id?: number;
  name: string;
  character?: string;
  profileUrl?: string;
}

export interface MediaItem {
  id: string;
  tmdbId?: number;
  imdbId?: string;
  title: string;
  originalTitle?: string;
  type: MediaType;
  overview: string;
  tagline?: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  rating: number;
  voteCount?: number;
  runtime?: number; // in minutes
  genres: string[];
  cast: CastMember[];
  director?: string;
  trailerKey?: string; // YouTube Key
  trailerUrl?: string;
  featured?: boolean;
  trending?: boolean;
  status: 'published' | 'draft';
  views: number;
  createdAt: string;
  updatedAt: string;
  streams: StreamSource[];
  seasons?: Season[];
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  tmdbApiKey: string;
  primaryStreamProvider: string;
  enableAutoStreams: boolean;
  disclaimer: string;
}

export interface WatchHistoryItem {
  mediaId: string;
  mediaTitle: string;
  posterUrl: string;
  type: MediaType;
  season?: number;
  episode?: number;
  timestamp: number;
  duration?: number;
  lastWatchedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
  createdAt?: string;
}
