'use client';

import React, { useState, useEffect } from 'react';
import { MediaItem, StreamSource } from '@/types';
import { generateStreamSources } from '@/lib/streams';
import { 
  Server, 
  RotateCw, 
  Play, 
  Sparkles, 
  ExternalLink,
  Layers,
  ArrowRight,
  AlertTriangle
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
    currentStreams[0]?.id || 'vidsrc-cc'
  );
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [keyReload, setKeyReload] = useState<number>(0);

  // Sync selectedServerId if stream list changes
  useEffect(() => {
    if (currentStreams.length > 0 && !currentStreams.some((s) => s.id === selectedServerId)) {
      setSelectedServerId(currentStreams[0].id);
    }
  }, [currentStreams, selectedServerId]);

  // Active stream source
  const activeStream = currentStreams.find((s) => s.id === selectedServerId) || currentStreams[0];
  const activeIndex = currentStreams.findIndex((s) => s.id === (activeStream?.id || ''));
  const nextStream = currentStreams[(activeIndex + 1) % (currentStreams.length || 1)];

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

  const handleNextServer = () => {
    if (nextStream) {
      setSelectedServerId(nextStream.id);
      setKeyReload((k) => k + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (!activeSeason) return;
    const currentIndex = activeSeason.episodes.findIndex((e) => e.episodeNumber === selectedEpisodeNum);
    if (currentIndex > 0) {
      setSelectedEpisodeNum(activeSeason.episodes[currentIndex - 1].episodeNumber);
    }
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
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            className="w-full h-full border-0"
            referrerPolicy="origin"
            loading="eager"
          />
        )}

        {/* Top Floating Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-20">
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
            <span className="hidden sm:inline">{isCinemaMode ? 'Exit' : 'Cinema'}</span>
          </button>
        </div>
      </div>

      {/* Instant Stream Switcher Quick Bar */}
      <div className="bg-gradient-to-r from-brand-950/70 via-dark-900 to-dark-900 border border-brand-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5 text-xs text-gray-200">
          <Sparkles className="w-4 h-4 text-brand-400 shrink-0 animate-pulse" />
          <div>
            <p className="font-bold text-white">Stuck on loading or buffering?</p>
            <p className="text-[11px] text-gray-400">Different servers host different sources. Tap another server below:</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {nextStream && (
            <button
              onClick={handleNextServer}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/30 transition"
            >
              <span>Switch to Next Server</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {activeStream?.url && (
            <a
              href={activeStream.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition"
              title="Open stream in a clean external tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Direct Player</span>
            </a>
          )}
        </div>
      </div>

      {/* Stream Control Bar & All Servers */}
      <div className="bg-dark-900 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Stream Servers Selector */}
        <div className="space-y-2.5 border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-500" />
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Select Streaming Server ({currentStreams.length} Available):
              </span>
            </div>
            <span className="text-[11px] text-gray-400">
              Active: <strong className="text-brand-400">{activeStream?.serverName}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {currentStreams.map((source, idx) => {
              const isSelected = selectedServerId === source.id;
              return (
                <button
                  key={source.id || idx}
                  onClick={() => {
                    setSelectedServerId(source.id);
                    setKeyReload((k) => k + 1);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isSelected
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 ring-2 ring-brand-400'
                      : 'bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Play className={`w-3 h-3 shrink-0 ${isSelected ? 'text-white fill-white' : 'text-gray-400'}`} />
                    <span className="truncate">{source.serverName}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1 ${isSelected ? 'bg-black/30 text-white' : 'bg-black/40 text-gray-400'}`}>
                    {source.quality || 'HD'}
                  </span>
                </button>
              );
            })}
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
                  disabled={selectedEpisodeNum <= 1 && selectedSeasonNum <= 1}
                  className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 disabled:opacity-40 text-gray-300 text-xs font-semibold transition"
                >
                  Prev Episode
                </button>
                <button
                  onClick={handleNextEpisode}
                  className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition"
                >
                  Next Episode
                </button>
              </div>
            </div>

            {/* Episode List */}
            {activeSeason && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                {activeSeason.episodes.map((ep) => {
                  const isSelected = selectedEpisodeNum === ep.episodeNumber;
                  return (
                    <button
                      key={ep.episodeNumber}
                      onClick={() => setSelectedEpisodeNum(ep.episodeNumber)}
                      className={`p-2 rounded-xl text-left transition border ${
                        isSelected
                          ? 'bg-brand-500/20 border-brand-500 text-white'
                          : 'bg-dark-800/60 border-white/5 text-gray-400 hover:text-white hover:bg-dark-700'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase block text-brand-400">
                        EP {ep.episodeNumber}
                      </span>
                      <span className="text-xs font-semibold block truncate">
                        {ep.title || `Episode ${ep.episodeNumber}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
