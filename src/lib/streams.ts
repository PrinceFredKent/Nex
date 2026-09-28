import { MediaType, StreamSource } from '@/types';

export interface StreamProvider {
  id: string;
  name: string;
  quality: string;
  getMovieUrl: (tmdbId?: number | string, imdbId?: string) => string;
  getTvUrl: (tmdbId?: number | string, season?: number, episode?: number, imdbId?: string) => string;
}

export const STREAM_PROVIDERS: StreamProvider[] = [
  {
    id: 'vidsrc-cc',
    name: 'VidSrc VIP (Fast HD)',
    quality: '1080p HD',
    getMovieUrl: (tmdbId) => `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, season = 1, episode = 1) => `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'superembed',
    name: 'MultiStream / SuperEmbed',
    quality: 'Auto / 4K',
    getMovieUrl: (tmdbId, imdbId) => tmdbId ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1` : `https://multiembed.mov/?video_id=${imdbId}`,
    getTvUrl: (tmdbId, season = 1, episode = 1, imdbId) => tmdbId
      ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
      : `https://multiembed.mov/?video_id=${imdbId}&s=${season}&e=${episode}`,
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed Global',
    quality: '1080p HD',
    getMovieUrl: (tmdbId) => `https://player.autoembed.cc/embed/movie/${tmdbId}`,
    getTvUrl: (tmdbId, season = 1, episode = 1) => `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'videasy',
    name: 'Videasy Fast',
    quality: '1080p',
    getMovieUrl: (tmdbId) => `https://player.videasy.net/movie/${tmdbId}`,
    getTvUrl: (tmdbId, season = 1, episode = 1) => `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'vidlink',
    name: 'VidLink Ultra',
    quality: '1080p HD',
    getMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}?primaryColor=e50914&autoplay=false`,
    getTvUrl: (tmdbId, season = 1, episode = 1) => `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=e50914&autoplay=false`,
  },
  {
    id: 'vidsrc-xyz',
    name: 'VidSrc Alpha',
    quality: '1080p',
    getMovieUrl: (tmdbId, imdbId) => tmdbId ? `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}` : `https://vidsrc.xyz/embed/movie?imdb=${imdbId}`,
    getTvUrl: (tmdbId, season = 1, episode = 1, imdbId) => tmdbId 
      ? `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}` 
      : `https://vidsrc.xyz/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`,
  },
  {
    id: 'smashystream',
    name: 'SmashyStream',
    quality: '1080p',
    getMovieUrl: (tmdbId) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    getTvUrl: (tmdbId, season = 1, episode = 1) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
  },
  {
    id: '2embed',
    name: '2Embed Server',
    quality: '720p/1080p',
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTvUrl: (tmdbId, season = 1, episode = 1) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
  }
];

/**
 * Generate standard default stream sources for a movie or TV episode
 */
export function generateStreamSources(
  type: MediaType,
  tmdbId?: number | string,
  imdbId?: string,
  season?: number,
  episode?: number
): StreamSource[] {
  if (!tmdbId && !imdbId) return [];

  return STREAM_PROVIDERS.map((provider) => ({
    id: `${provider.id}-${tmdbId || imdbId}-${season || 0}-${episode || 0}`,
    serverName: provider.name,
    quality: provider.quality,
    type: 'embed',
    url: type === 'movie' 
      ? provider.getMovieUrl(tmdbId, imdbId)
      : provider.getTvUrl(tmdbId, season, episode, imdbId),
    isWorking: true,
  }));
}
