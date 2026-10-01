'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  X
} from 'lucide-react';
import { useWatchlist } from './WatchlistProvider';

interface StreamPlayerProps {
  media: MediaItem;
}

export default function StreamPlayer({ media }: StreamPlayerProps) {
  const { saveProgress } = useWatchlist();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // TV series state
  const isTv = media.type === 'tv' || media.id.startsWith('tv-');
  const seasons = media.seasons || [];
  const [selectedSeasonNum, setSelectedSeasonNum] = useState<number>(
    seasons.length > 0 ? seasons[0].seasonNumber : 1
  );
  const [selectedEpisodeNum, setSelectedEpisodeNum] = useState<number>(1);

  // Active season & episode
  const activeSeason = seasons.find((s) => s.seasonNumber === selectedSeasonNum) || seasons[0];
  const activeEpisode = activeSeason?.episodes.find((e) => e.episodeNumber === selectedEpisodeNum) || activeSeason?.episodes[0];

  // Stable memoized streams list
  const currentStreams: StreamSource[] = useMemo(() => {
    if (isTv) {
      return activeEpisode?.streams?.length
        ? activeEpisode.streams
        : generateStreamSources('tv', media.tmdbId, media.imdbId, selectedSeasonNum, selectedEpisodeNum);
    }
    return media.streams?.length
      ? media.streams
      : generateStreamSources('movie', media.tmdbId, media.imdbId);
  }, [isTv, activeEpisode?.streams, media.tmdbId, media.imdbId, selectedSeasonNum, selectedEpisodeNum, media.streams]);

  const [selectedServerId, setSelectedServerId] = useState<string>(
    () => currentStreams[0]?.id || 'vidsrc-cc'
  );
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [keyReload, setKeyReload] = useState<number>(0);
  const [showCinemaControls, setShowCinemaControls] = useState<boolean>(true);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync selectedServerId if stream list changes
  useEffect(() => {
    if (currentStreams.length > 0 && !currentStreams.some((s) => s.id === selectedServerId)) {
      setSelectedServerId(currentStreams[0].id);
    }
  }, [currentStreams, selectedServerId]);

  // Active stream source
  const activeStream = useMemo(() => {
    return currentStreams.find((s) => s.id === selectedServerId) || currentStreams[0];
  }, [currentStreams, selectedServerId]);

  const activeIndex = currentStreams.findIndex((s) => s.id === (activeStream?.id || ''));
  const nextStream = currentStreams[(activeIndex + 1) % (currentStreams.length || 1)];

  // Save viewing progress safely without infinite loops
  const lastSavedProgressRef = useRef<string>('');
  useEffect(() => {
    const progressKey = `${media.id}-${selectedSeasonNum}-${selectedEpisodeNum}`;
    if (lastSavedProgressRef.current === progressKey) return;
    lastSavedProgressRef.current = progressKey;

    saveProgress({
      mediaId: media.id,
      mediaTitle: media.title,
      posterUrl: media.posterUrl,
      type: isTv ? 'tv' : 'movie',
      season: isTv ? selectedSeasonNum : undefined,
      episode: isTv ? selectedEpisodeNum : undefined,
      timestamp: Date.now(),
      lastWatchedAt: new Date().toISOString(),
    });
  }, [media.id, media.title, media.posterUrl, isTv, selectedSeasonNum, selectedEpisodeNum, saveProgress]);

  // Record view count once per unique media visit
  const viewLoggedRef = useRef<string>('');
  useEffect(() => {
    if (viewLoggedRef.current === media.id) return;
    viewLoggedRef.current = media.id;
    fetch(`/api/views/${media.id}`, { method: 'POST' }).catch(() => {});
  }, [media.id]);

  // Handle Esc key to exit cinema mode
  useEffect(() => {
    if (!isCinemaMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCinemaMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCinemaMode]);

  // Lock body scroll during cinema mode
  useEffect(() => {
    if (isCinemaMode) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isCinemaMode]);

  // Auto-hide controls in cinema mode on inactivity
  const handleCinemaActivity = () => {
    setShowCinemaControls(true);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => {
      setShowCinemaControls(false);
    }, 3500);
  };

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
    <div className="space-y-4">
      {/* Video Screen Container / Placeholder when in Cinema Mode */}
      {isCinemaMode ? (
        <div className="relative w-full aspect-video bg-black/80 dark:bg-black/90 rounded-2xl overflow-hidden border border-brand-500/40 flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center animate-pulse">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white">Cinema Mode is Active</h3>
            <p className="text-xs text-gray-400 max-w-sm">Video is currently occupying the full screen edge-to-edge.</p>
          </div>
          <button
            onClick={() => setIsCinemaMode(false)}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <span>Exit Cinema Mode</span>
          </button>
        </div>
      ) : (
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
              type="button"
              onClick={() => setKeyReload((k) => k + 1)}
              title="Reload Video Stream"
              className="p-1.5 rounded-lg hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCinemaMode(true)}
              title="Enter Cinema Mode"
              className="p-1.5 rounded-lg text-xs font-semibold px-2.5 transition flex items-center gap-1 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Cinema</span>
            </button>
          </div>
        </div>
      )}

      {/* Full-Screen Edge-to-Edge Cinema Mode Portal */}
      {mounted && isCinemaMode && createPortal(
        <div 
          className="fixed inset-0 z-[99999] w-screen h-screen bg-black overflow-hidden flex flex-col justify-between select-none"
          onMouseMove={handleCinemaActivity}
          onTouchStart={handleCinemaActivity}
        >
          {/* Main Video: Occupies 100% of available screen */}
          <div className="relative w-full h-full flex-1 bg-black flex items-center justify-center overflow-hidden">
            {activeStream?.type === 'mp4' ? (
              <video
                key={`${activeStream.url}-${keyReload}-cinema`}
                src={activeStream.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe
                key={`${activeStream?.url}-${keyReload}-cinema`}
                src={activeStream?.url || ''}
                title={media.title}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                className="w-full h-full border-0"
                referrerPolicy="origin"
                loading="eager"
              />
            )}
          </div>

          {/* Floating Header Controls */}
          <div 
            className={`absolute top-0 inset-x-0 p-3 sm:p-5 bg-gradient-to-b from-black/95 via-black/70 to-transparent z-40 flex items-center justify-between transition-opacity duration-300 ${
              showCinemaControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-500 text-white shadow-sm flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Cinema Mode
              </span>
              <div className="text-white">
                <h2 className="text-sm sm:text-base font-black truncate max-w-[200px] sm:max-w-md">
                  {media.title}
                </h2>
                <p className="text-[11px] text-gray-300">
                  {isTv ? `Season ${selectedSeasonNum} • Episode ${selectedEpisodeNum}` : 'Full Movie'} • <span className="text-brand-400 font-bold">{activeStream?.serverName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setKeyReload((k) => k + 1)}
                title="Reload Stream"
                className="p-2 sm:px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reload</span>
              </button>

              {nextStream && (
                <button
                  onClick={handleNextServer}
                  title="Switch to Next Server"
                  className="p-2 sm:px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5"
                >
                  <Server className="w-3.5 h-3.5 text-brand-400" />
                  <span className="hidden sm:inline">Next Server</span>
                </button>
              )}

              <button
                onClick={() => setIsCinemaMode(false)}
                title="Exit Cinema Mode (Esc)"
                className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black shadow-lg shadow-brand-500/40 transition flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Exit Cinema</span>
                <span className="hidden sm:inline text-[10px] opacity-75 font-mono">(Esc)</span>
              </button>
            </div>
          </div>

          {/* Floating Bottom Controls (Server selection + TV Episodes) */}
          <div 
            className={`absolute bottom-0 inset-x-0 p-3 sm:p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-40 transition-opacity duration-300 ${
              showCinemaControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto">
              {/* Quick Server Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 py-1 no-scrollbar">
                <span className="text-[11px] font-bold text-gray-400 uppercase shrink-0 mr-1 flex items-center gap-1">
                  <Server className="w-3 h-3 text-brand-500" />
                  Servers:
                </span>
                {currentStreams.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedServerId(s.id);
                      setKeyReload((k) => k + 1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                      selectedServerId === s.id
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white backdrop-blur-md'
                    }`}
                  >
                    {s.serverName.replace(' (Fast HD)', '').replace(' / SuperEmbed', '')}
                  </button>
                ))}
              </div>

              {/* TV Series Episode Controls in Cinema Mode */}
              {isTv && activeSeason && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handlePrevEpisode}
                    disabled={selectedEpisodeNum <= 1 && selectedSeasonNum <= 1}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-semibold backdrop-blur-md transition"
                  >
                    Prev Ep
                  </button>
                  <span className="text-xs font-mono font-bold text-brand-400 px-2 py-0.5 rounded bg-black/60 border border-white/10">
                    S{selectedSeasonNum} • E{selectedEpisodeNum}
                  </span>
                  <button
                    onClick={handleNextEpisode}
                    className="px-2.5 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md transition"
                  >
                    Next Ep
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

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
              type="button"
              onClick={handleNextServer}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/30 transition cursor-pointer relative z-10"
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
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition cursor-pointer relative z-10"
              title="Open stream in a clean external tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Direct Player</span>
            </a>
          )}
        </div>
      </div>

      {/* Stream Control Bar & All Servers */}
      <div className="bg-dark-900 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 relative z-10">
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
                  type="button"
                  key={source.id || idx}
                  onClick={() => {
                    setSelectedServerId(source.id);
                    setKeyReload((k) => k + 1);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer relative z-10 ${
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
                    type="button"
                    key={s.seasonNumber}
                    onClick={() => {
                      setSelectedSeasonNum(s.seasonNumber);
                      setSelectedEpisodeNum(s.episodes[0]?.episodeNumber || 1);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
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
                  type="button"
                  onClick={handlePrevEpisode}
                  disabled={selectedEpisodeNum <= 1 && selectedSeasonNum <= 1}
                  className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 disabled:opacity-40 text-gray-300 text-xs font-semibold transition cursor-pointer"
                >
                  Prev Episode
                </button>
                <button
                  type="button"
                  onClick={handleNextEpisode}
                  className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition cursor-pointer"
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
                      type="button"
                      key={ep.episodeNumber}
                      onClick={() => setSelectedEpisodeNum(ep.episodeNumber)}
                      className={`p-2 rounded-xl text-left transition border cursor-pointer ${
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
