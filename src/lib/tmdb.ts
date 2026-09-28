import { MediaItem, MediaType, Season, Episode, CastMember } from '@/types';
import { generateStreamSources } from './streams';

// Default TMDB API key with fallback
const DEFAULT_TMDB_API_KEY = '841459a58d04735c026040cd8ab00d02'; // Standard public developer key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getTMDBPosterUrl(path?: string | null, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getTMDBBackdropUrl(path?: string | null, size: 'w780' | 'w1280' | 'original' = 'original'): string {
  if (!path) return 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1600&auto=format&fit=crop';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export async function searchTMDB(query: string, type: 'movie' | 'tv' | 'multi' = 'multi', apiKey?: string) {
  const key = apiKey || process.env.TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
  try {
    const endpoint = type === 'multi' ? 'search/multi' : `search/${type}`;
    const url = `${TMDB_BASE_URL}/${endpoint}?api_key=${key}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`TMDB error: ${res.statusText}`);
    }
    const data = await res.json();
    return (data.results || []).filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv' || type !== 'multi');
  } catch (error) {
    console.error('Failed to search TMDB:', error);
    return [];
  }
}

export async function getTMDBTrending(type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week', apiKey?: string) {
  const key = apiKey || process.env.TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
  try {
    const url = `${TMDB_BASE_URL}/trending/${type}/${timeWindow}?api_key=${key}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`TMDB error: ${res.statusText}`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to get trending from TMDB:', error);
    return [];
  }
}

export async function getTMDBPopular(type: 'movie' | 'tv' = 'movie', apiKey?: string) {
  const key = apiKey || process.env.TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
  try {
    const url = `${TMDB_BASE_URL}/${type}/popular?api_key=${key}&language=en-US&page=1`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`TMDB error: ${res.statusText}`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to get popular from TMDB:', error);
    return [];
  }
}

export async function fetchFullTMDBDetails(tmdbId: number | string, type: MediaType, apiKey?: string): Promise<Partial<MediaItem>> {
  const key = apiKey || process.env.TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
  try {
    // Fetch details with append_to_response for videos and credits
    const url = `${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${key}&append_to_response=credits,videos,external_ids&language=en-US`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB details error: ${res.statusText}`);
    const data = await res.json();

    const cast: CastMember[] = (data.credits?.cast || []).slice(0, 10).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profileUrl: c.profile_path ? getTMDBPosterUrl(c.profile_path, 'w342') : undefined,
    }));

    const directorObj = (data.credits?.crew || []).find((c: any) => c.job === 'Director' || c.job === 'Creator');
    const director = directorObj ? directorObj.name : undefined;

    // Find YouTube trailer
    const trailer = (data.videos?.results || []).find(
      (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );

    const genres = (data.genres || []).map((g: any) => g.name);
    const imdbId = data.external_ids?.imdb_id || data.imdb_id;
    const title = type === 'movie' ? data.title : data.name;
    const originalTitle = type === 'movie' ? data.original_title : data.original_name;
    const releaseDate = type === 'movie' ? data.release_date : data.first_air_date;
    const runtime = type === 'movie' ? data.runtime : (data.episode_run_time?.[0] || 45);

    let seasons: Season[] = [];
    if (type === 'tv' && data.seasons) {
      // Fetch details for each season
      const seasonPromises = data.seasons
        .filter((s: any) => s.season_number > 0) // Skip season 0 (specials) unless needed
        .map(async (s: any) => {
          try {
            const seasonUrl = `${TMDB_BASE_URL}/tv/${tmdbId}/season/${s.season_number}?api_key=${key}&language=en-US`;
            const sRes = await fetch(seasonUrl);
            if (sRes.ok) {
              const sData = await sRes.json();
              const episodes: Episode[] = (sData.episodes || []).map((ep: any) => ({
                id: `ep-${tmdbId}-${s.season_number}-${ep.episode_number}`,
                episodeNumber: ep.episode_number,
                seasonNumber: s.season_number,
                title: ep.name || `Episode ${ep.episode_number}`,
                overview: ep.overview,
                stillUrl: ep.still_path ? getTMDBBackdropUrl(ep.still_path, 'w780') : undefined,
                runtime: ep.runtime,
                airDate: ep.air_date,
                streams: generateStreamSources('tv', tmdbId, imdbId, s.season_number, ep.episode_number)
              }));

              return {
                seasonNumber: s.season_number,
                name: s.name || `Season ${s.season_number}`,
                overview: s.overview,
                posterUrl: s.poster_path ? getTMDBPosterUrl(s.poster_path, 'w342') : undefined,
                episodeCount: episodes.length,
                episodes,
              };
            }
          } catch (e) {
            console.warn(`Failed to fetch season ${s.season_number}`, e);
          }

          // Fallback if season fetch fails
          return {
            seasonNumber: s.season_number,
            name: s.name || `Season ${s.season_number}`,
            overview: s.overview,
            posterUrl: s.poster_path ? getTMDBPosterUrl(s.poster_path, 'w342') : undefined,
            episodeCount: s.episode_count || 1,
            episodes: Array.from({ length: s.episode_count || 1 }, (_, i) => ({
              id: `ep-${tmdbId}-${s.season_number}-${i + 1}`,
              episodeNumber: i + 1,
              seasonNumber: s.season_number,
              title: `Episode ${i + 1}`,
              streams: generateStreamSources('tv', tmdbId, imdbId, s.season_number, i + 1)
            }))
          };
        });

      seasons = await Promise.all(seasonPromises);
    }

    // Default stream sources for movies
    const streams = type === 'movie' ? generateStreamSources('movie', tmdbId, imdbId) : [];

    return {
      tmdbId: Number(tmdbId),
      imdbId,
      title,
      originalTitle,
      type,
      overview: data.overview || 'No overview available.',
      tagline: data.tagline,
      posterUrl: getTMDBPosterUrl(data.poster_path, 'w500'),
      backdropUrl: getTMDBBackdropUrl(data.backdrop_path, 'original'),
      releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      rating: Number((data.vote_average || 7.0).toFixed(1)),
      voteCount: data.vote_count || 0,
      runtime,
      genres,
      cast,
      director,
      trailerKey: trailer?.key,
      trailerUrl: trailer?.key ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
      streams,
      seasons: seasons.length > 0 ? seasons : undefined,
      status: 'published',
      views: Math.floor(Math.random() * 500) + 50,
      featured: false,
      trending: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching TMDB full details:', error);
    throw error;
  }
}
