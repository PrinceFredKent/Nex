'use client';

import React, { useState, useEffect } from 'react';
import { MediaItem, Episode, Season, StreamSource } from '@/types';
import { generateStreamSources } from '@/lib/streams';
import { 
  Server, 
  RotateCw, 
  Tv, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Sparkles, 
  ShieldAlert,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useWatchlist } from './WatchlistProvider';

interface StreamPlayerProps {
  media: MediaItem;
}

export default function StreamPlayer({ media }: StreamPlayerProps) {
  const { saveProgress } = useWatchlist();

  // TV series state
  const isTv = media.type === 'tv';
  const seasons = media.seasons || [];
  const [selectedSeasonNum, setSelectedSeasonNum] = useState<number>(
    seasons.length > 0 ? seasons[0].seasonNumber : 1
  );
  const [selectedEpisodeNum, setSelectedEpisodeNum] = useState<number>(1);

  // Active season & episode
  const activeSeason = seasons.find((s) => s.seasonNumber === selectedSeasonNum) || seasons[0];
  const activeEpisode = activeSeason?.episodes.find((e) => e.episodeNumber === selectedEpisodeNum) || activeSeason?.episodes[0];

  // Streams list
  const currentStreams: StreamSource[] = isTv
    ? (activeEpisode?.streams?.length ? activeEpisode.streams : generateStreamSources('tv', media.tmdbId, media.imdbId, selectedSeasonNum, selectedEpisodeNum))
    : (media.streams?.length ? media.streams : generateStreamSources('movie', media.tmdbId, media.imdbId));

  const [selectedServerId, setSelectedServerId] = useState<string>(
    currentStreams[0]?.id || 'vidlink'
  );
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [keyReload, setKeyReload] = useState<number>(0);

  // Active stream source
  const activeStream = currentStreams.find((s) => s.id === selectedServerId) || currentStreams[0];

  // Save viewing progress
  useEffect(() => {
    saveProgress({
      mediaId: media.id,
      mediaTitle: media.title,
      posterUrl: media.posterUrl,
      type: media.type,
      season: isTv ? selectedSeasonNum : undefined,
      episode: isTv ? selectedEpisodeNum : undefined,
      timestamp: Date.now(),
      lastWatchedAt: new Date().toISOString(),
    });

    // Record view in API
    fetch(`/api/views/${media.id}`, { method: 'POST' }).catch(() => {});
  }, [media.id, isTv, selectedSeasonNum, selectedEpisodeNum]);

  // Navigate TV episodes
  const hasNextEpisode = () => {
    if (!activeSeason) return false;
    const currentIndex = activeSeason.episodes.findIndex((e) => e.episodeNumber === selectedEpisodeNum);
    if (currentIndex < activeSeason.episodes.length - 1) return true;
    const seasonIndex = seasons.findIndex((s) => s.seasonNumber === selectedSeasonNum);
    return seasonIndex < seasons.length - 1;
  };

  const handleNextEpisode = () => {
    if (!activeSeason) return;
    const currentIndex = activeSeason.episodes.findIndex((e) => e.episodeNumber === selectedEpisodeNum);
    if (currentIndex < activeSeason.episodes.length - 1) {
      setSelectedEpisodeNum(activeSeason.episodes[currentIndex + 1].episodeNumber);
    } else {
      const seasonIndex = seasons.findIndex((s) => s.seasonNumber === selectedSeasonNum);
      if (seasonIndex < seasons.length - 1) {
        const nextSeason = seasons[seasonIndex + 1];
        setSelectedSeasonNum(nextSeason.seasonNumber);
        setSelectedEpisodeNum(nextSeason.episodes[0]?.episodeNumber || 1);
      }
    }
  };

  const handlePrevEpisode = () => {
    if (!activeSeason) return;
    const currentIndex = activeSeason.episodes.findIndex((e) => e.episodeNumber === selectedEpisodeNum);
    if (currentIndex > 0) {
      setSelectedEpisodeNum(activeSeason.episodes[currentIndex - 1].episodeNumber);
    }
  };

  return (
    <div className={`transition-all duration-300 ${isCinemaMode ? 'fixed inset-0 z-50 bg-black p-4 sm:p-8 overflow-y-auto' : 'space-y-4'}`}>
      {/* Video Screen Container */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
        {activeStream?.type === 'mp4' ? (
          <video
            key={`${activeStream.url}-${keyReload}`}
            src={activeStream.url}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        ) : (
          <iframe
            key={`${activeStream?.url}-${keyReload}`}
            src={activeStream?.url || ''}
            title={media.title}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            className="w-full h-full border-0"
            referrerPolicy="origin"
          />
        )}

        {/* Top Floating Controls on Hover */}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setKeyReload((k) => k + 1)}
            title="Reload Video Stream"
            className="p-1.5 rounded-lg hover:bg-white/20 text-gray-300 hover:text-white transition"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCinemaMode(!isCinemaMode)}
            title={isCinemaMode ? 'Exit Cinema Mode' : 'Cinema Mode'}
            className={`p-1.5 rounded-lg text-xs font-semibold px-2.5 transition flex items-center gap-1 ${
              isCinemaMode ? 'bg-brand-500 text-white' : 'hover:bg-white/20 text-gray-300 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isCinemaMode ? 'Exit Cinema' : 'Cinema Mode'}</span>
          </button>
        </div>
      </div>

      {/* Stream Control Bar */}
      <div className="bg-dark-900 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Stream Servers Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Streaming Servers:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentStreams.map((source, idx) => (
              <button
                key={source.id || idx}
                onClick={() => setSelectedServerId(source.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedServerId === source.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : 'bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white border border-white/10'
                }`}
              >
                <span>{source.serverName}</span>
                <span className="text-[10px] opacity-75 px-1 py-0.2 bg-black/40 rounded">
                  {source.quality || 'HD'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* TV Series Episode Navigator */}
        {isTv && seasons.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Season Selection Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-gray-400 uppercase">Season:</span>
                {seasons.map((s) => (
                  <button
                    key={s.seasonNumber}
                    onClick={() => {
                      setSelectedSeasonNum(s.seasonNumber);
                      setSelectedEpisodeNum(s.episodes[0]?.episodeNumber || 1);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      selectedSeasonNum === s.seasonNumber
                        ? 'bg-brand-500 text-white'
                        : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                    }`}
                  >
                    Season {s.seasonNumber}
                  </button>
                ))}
              </div>

              {/* Next / Prev Quick Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevEpisode}
                  disabled={selectedEpisodeNum <= 1}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-dark-800 hover:bg-dark-700 disabled:opacity-30 disabled:pointer-events-none text-gray-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev Ep</span>
                </button>
                <button
                  onClick={handleNextEpisode}
                  disabled={!hasNextEpisode()}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-brand-500/90 hover:bg-brand-500 disabled:opacity-30 disabled:pointer-events-none text-white shadow"
                >
                  <span>Next Ep</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Episode Grid / Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-64 overflow-y-auto p-1">
              {activeSeason?.episodes.map((ep) => {
                const isSelected = ep.episodeNumber === selectedEpisodeNum;
                return (
                  <button
                    key={ep.id || ep.episodeNumber}
                    onClick={() => setSelectedEpisodeNum(ep.episodeNumber)}
                    className={`flex flex-col text-left p-2 rounded-xl transition border ${
                      isSelected
                        ? 'bg-brand-500/15 border-brand-500 text-white'
                        : 'bg-dark-850 hover:bg-dark-800 border-white/5 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-bold ${isSelected ? 'text-brand-400' : 'text-gray-400'}`}>
                        EP {ep.episodeNumber}
                      </span>
                      {ep.runtime && <span className="text-[10px] text-gray-500">{ep.runtime}m</span>}
                    </div>
                    <span className="text-xs font-medium line-clamp-1">
                      {ep.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Helpful Tip */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-dark-850 p-2.5 rounded-xl border border-white/5">
          <ShieldAlert className="w-4 h-4 text-brand-400 shrink-0" />
          <span>
            If the current server is slow or buffering, simply switch to another streaming server above.
          </span>
        </div>
      </div>
    </div>
  );
}
