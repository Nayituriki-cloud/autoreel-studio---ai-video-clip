import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Smartphone,
  Sparkles,
  Zap,
  Repeat,
  FastForward,
  Rewind,
  Eye,
  Sliders,
  Radio,
  Layers,
} from 'lucide-react';
import { HighlightReel, ReelTimelineItem, RawFootage, AspectRatio, SubtitleStyle } from '../types/video';
import { formatTimecode, formatSecondsOnly } from '../utils/exportEngines';
import { playSoundEffect } from '../utils/audioEffects';

interface VideoPlayerProps {
  currentReel: HighlightReel;
  activeFootage: RawFootage;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  previewMode: 'reel' | 'raw';
  selectedClipItem?: ReelTimelineItem | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentReel,
  activeFootage,
  currentTime,
  onTimeUpdate,
  isPlaying,
  onTogglePlay,
  onSeek,
  previewMode,
  selectedClipItem,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showSafeZones, setShowSafeZones] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [transitionEffect, setTransitionEffect] = useState<string | null>(null);

  // Total duration based on mode
  const totalDuration = useMemo(() => {
    if (previewMode === 'raw') {
      return activeFootage.duration || 120;
    }
    return currentReel.items.reduce((acc, item) => acc + item.duration, 0) || 30;
  }, [previewMode, activeFootage, currentReel.items]);

  // Determine current active reel item
  const activeReelItem = useMemo(() => {
    if (previewMode === 'raw') return null;
    let accumulatedTime = 0;
    for (const item of currentReel.items) {
      if (currentTime >= accumulatedTime && currentTime < accumulatedTime + item.duration) {
        return {
          item,
          itemLocalTime: currentTime - accumulatedTime,
          sourceTime: item.startTime + (currentTime - accumulatedTime),
          itemIndex: currentReel.items.indexOf(item),
        };
      }
      accumulatedTime += item.duration;
    }
    // End of reel
    const last = currentReel.items[currentReel.items.length - 1];
    return last
      ? {
          item: last,
          itemLocalTime: last.duration,
          sourceTime: last.endTime,
          itemIndex: currentReel.items.length - 1,
        }
      : null;
  }, [previewMode, currentReel.items, currentTime]);

  // Determine active kinetic caption chunk
  const activeCaption = useMemo(() => {
    const rawTime = previewMode === 'raw' ? currentTime : (activeReelItem?.sourceTime ?? currentTime);
    // Find closest transcript line
    const match = activeFootage.transcript.find((t) => rawTime >= t.start && rawTime <= t.end);
    if (!match) return null;

    // Split match text into 3-4 word groups for dynamic punch
    const words = match.text.split(' ');
    const duration = match.end - match.start;
    const progress = Math.min(Math.max((rawTime - match.start) / Math.max(duration, 0.5), 0), 0.99);
    const wordIndex = Math.floor(progress * words.length);

    return {
      fullText: match.text,
      highlightWord: words[wordIndex] || words[0],
      speaker: match.speaker,
      isHot: match.highlight,
    };
  }, [currentTime, previewMode, activeReelItem, activeFootage.transcript]);

  // Sync HTML5 video element source & time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (previewMode === 'raw') {
      if (Math.abs(video.currentTime - currentTime) > 0.4) {
        video.currentTime = currentTime;
      }
    } else if (activeReelItem) {
      const targetSourceTime = activeReelItem.sourceTime;
      if (Math.abs(video.currentTime - targetSourceTime) > 0.4) {
        video.currentTime = targetSourceTime;
      }
    }
  }, [currentTime, previewMode, activeReelItem]);

  // Play/pause and playbackRate sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackRate;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, playbackRate]);

  // Trigger sound effect and visual flash on transitions
  const lastItemIndexRef = useRef<number | null>(null);
  useEffect(() => {
    if (previewMode === 'reel' && activeReelItem) {
      if (lastItemIndexRef.current !== null && lastItemIndexRef.current !== activeReelItem.itemIndex) {
        // We crossed to a new clip!
        const transition = activeReelItem.item.transitionIn;
        setTransitionEffect(transition);

        if (activeReelItem.item.soundEffect && activeReelItem.item.soundEffect !== 'none') {
          playSoundEffect(activeReelItem.item.soundEffect);
        } else {
          playSoundEffect('whoosh_fast');
        }

        const timer = setTimeout(() => setTransitionEffect(null), 300);
        return () => clearTimeout(timer);
      }
      lastItemIndexRef.current = activeReelItem.itemIndex;
    }
  }, [activeReelItem, previewMode]);

  // Video timeupdate handler
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    if (previewMode === 'raw') {
      onTimeUpdate(video.currentTime);
      if (video.currentTime >= totalDuration) {
        video.currentTime = 0;
        onTimeUpdate(0);
      }
    } else {
      // Reel mode
      const nextTime = currentTime + 0.05;
      if (nextTime >= totalDuration) {
        onSeek(0);
      } else {
        onTimeUpdate(nextTime);
      }
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Aspect ratio dimensions container styling
  const aspectClass = useMemo(() => {
    switch (currentReel.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[580px] w-auto';
      case '16:9':
        return 'aspect-[16/9] max-w-[850px] w-full';
      case '1:1':
        return 'aspect-square max-h-[540px] w-auto';
      case '4:5':
        return 'aspect-[4/5] max-h-[560px] w-auto';
      default:
        return 'aspect-[9/16] max-h-[580px] w-auto';
    }
  }, [currentReel.aspectRatio]);

  // Current Zoom Scale from item or defaults
  const currentZoom = activeReelItem?.item.zoomScale || 1.0;

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-neutral-950 relative overflow-hidden select-none"
    >
      {/* Video Viewport Stage */}
      <div className="flex-1 flex items-center justify-center p-3 relative bg-gradient-to-b from-neutral-950 via-neutral-900/60 to-neutral-950">
        {/* Aspect Ratio Box with Phone or Clean Frame */}
        <div
          className={`relative rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-neutral-800 bg-black flex items-center justify-center transition-all duration-300 ${aspectClass}`}
        >
          {/* HTML5 Video element */}
          <video
            ref={videoRef}
            src={activeFootage.videoUrl}
            crossOrigin="anonymous"
            playsInline
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover transition-transform duration-200"
            style={{
              transform: `scale(${currentZoom})`,
            }}
          />

          {/* Transition Flash / Glitch Overlay */}
          {transitionEffect === 'flash_white' && (
            <div className="absolute inset-0 bg-white/90 z-20 pointer-events-none animate-ping" />
          )}
          {transitionEffect === 'glitch' && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-rose-500/40 to-yellow-500/30 mix-blend-screen z-20 pointer-events-none animate-pulse" />
          )}
          {transitionEffect === 'whip_pan' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-20 pointer-events-none transition-all duration-200" />
          )}

          {/* Hook Headline Banner (0-3s of clip) */}
          {previewMode === 'reel' && activeReelItem?.item.hookText && activeReelItem.itemLocalTime < 3.2 && (
            <div className="absolute top-6 inset-x-4 z-20 flex justify-center animate-bounce">
              <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-2xl border-2 border-white/80 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-center">
                🔥 {activeReelItem.item.hookText}
              </div>
            </div>
          )}

          {/* Dynamic B-Roll Overlay simulation */}
          {previewMode === 'reel' && activeReelItem?.item.brollActive && (
            <div className="absolute top-4 right-4 w-28 h-20 rounded-lg overflow-hidden border-2 border-cyan-400 shadow-xl z-15 bg-black/80">
              <div className="absolute top-1 left-1 px-1 bg-cyan-500 text-[8px] font-black uppercase text-black rounded">
                B-Roll
              </div>
              <img
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=80"
                alt="B-roll"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Kinetic Captions Burn-in Overlay */}
          {activeCaption && (
            <div
              className={`absolute inset-x-4 bottom-14 z-20 flex flex-col items-center justify-center text-center pointer-events-none transition-all duration-150 ${
                currentReel.subtitleStyle === 'hormozi'
                  ? 'scale-105'
                  : ''
              }`}
            >
              {currentReel.subtitleStyle === 'hormozi' ? (
                <div className="px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-xs border border-white/10 shadow-2xl max-w-[90%]">
                  <span className="text-sm sm:text-base md:text-lg font-black tracking-tight uppercase leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,1)] text-white">
                    {activeCaption.fullText.split(' ').map((word, idx) => {
                      const isTarget = word.toLowerCase().includes(activeCaption.highlightWord.toLowerCase());
                      return (
                        <span
                          key={idx}
                          className={`inline-block mx-0.5 transition-transform duration-100 ${
                            isTarget
                              ? 'text-amber-300 scale-110 font-extrabold underline decoration-amber-400 decoration-2'
                              : 'text-white'
                          }`}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </span>
                </div>
              ) : currentReel.subtitleStyle === 'cyber' ? (
                <div className="px-3 py-1 rounded bg-neutral-950/90 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                  <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300 uppercase tracking-widest">
                    {activeCaption.fullText}
                  </span>
                </div>
              ) : currentReel.subtitleStyle === 'minimal' ? (
                <div className="max-w-[85%]">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/40 px-2.5 py-0.5 rounded">
                    {activeCaption.fullText}
                  </span>
                </div>
              ) : (
                <div className="bg-neutral-900/90 px-3 py-1 rounded-full border border-neutral-700 max-w-[85%]">
                  <span className="text-xs font-medium text-white">{activeCaption.fullText}</span>
                </div>
              )}
            </div>
          )}

          {/* Social Platform Safe Zone Guidelines (TikTok / Reels UI overlay) */}
          {showSafeZones && currentReel.aspectRatio === '9:16' && (
            <div className="absolute inset-0 pointer-events-none z-30 border border-cyan-500/30 flex flex-col justify-between p-3">
              {/* Top Bar Safe Margin */}
              <div className="h-14 border-b border-dashed border-red-500/50 flex items-center justify-between px-2 text-[9px] text-red-400 font-mono">
                <span>▲ TikTok Header / Search Zone</span>
                <span>KEEP CLEAR</span>
              </div>

              {/* Right Side Buttons Column */}
              <div className="absolute right-2 bottom-20 flex flex-col items-center gap-3 text-white/50 text-[9px]">
                <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center">
                  ❤️
                </div>
                <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center">
                  💬
                </div>
                <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center">
                  ↗️
                </div>
                <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center">
                  🎵
                </div>
              </div>

              {/* Bottom Nav / Caption Safe Margin */}
              <div className="h-20 border-t border-dashed border-amber-500/60 flex items-end justify-between px-2 pb-1 text-[9px] text-amber-400 font-mono">
                <span>▼ Account Name & Bio Zone</span>
                <span>SAFE FOR SUBS</span>
              </div>
            </div>
          )}

          {/* Play/Pause Center Tap Area */}
          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors cursor-pointer group"
          >
            {!isPlaying && (
              <div className="w-14 h-14 rounded-full bg-violet-600/90 group-hover:bg-violet-500 text-white flex items-center justify-center shadow-2xl shadow-violet-900/50 backdrop-blur-xs ring-4 ring-white/20 transition-transform group-hover:scale-105">
                <Play className="w-6 h-6 fill-white ml-1" />
              </div>
            )}
          </button>
        </div>

        {/* Floating Badge for Active Mode & Score */}
        <div className="absolute top-4 left-6 flex items-center gap-2 z-20">
          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-neutral-900/90 text-neutral-300 border border-neutral-700/80 shadow-md backdrop-blur-md flex items-center gap-1.5">
            <Radio className={`w-3 h-3 ${isPlaying ? 'text-red-500 animate-pulse' : 'text-neutral-500'}`} />
            {previewMode === 'reel' ? 'AI REEL PREVIEW' : 'RAW FOOTAGE'}
          </span>

          {previewMode === 'reel' && activeReelItem && (
            <span className="text-[10px] font-black px-2 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md backdrop-blur-md flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Clip #{activeReelItem.itemIndex + 1} ({activeReelItem.item.viralScore}% Viral)
            </span>
          )}
        </div>

        {/* Quick Safe Zone Toggle Button */}
        {currentReel.aspectRatio === '9:16' && (
          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`absolute top-4 right-6 text-[10px] font-semibold px-2 py-1 rounded-md border backdrop-blur-md flex items-center gap-1 transition-colors cursor-pointer z-20 ${
              showSafeZones
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-neutral-900/80 border-neutral-700 text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>{showSafeZones ? 'Hide TikTok UI Safe Zone' : 'Show TikTok Safe Zone'}</span>
          </button>
        )}
      </div>

      {/* Modern Player Control Bar */}
      <div className="h-14 bg-neutral-950/95 border-t border-neutral-800 px-4 flex items-center justify-between gap-3 text-xs z-20">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 5))}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Rewind 5s (Left Arrow)"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-200 text-black flex items-center justify-center font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={() => onSeek(Math.min(totalDuration, currentTime + 5))}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Forward 5s (Right Arrow)"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSeek(0)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Restart playback"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Timecode */}
          <div className="font-mono text-[11px] text-neutral-300 ml-2">
            <span className="text-white font-bold">{formatSecondsOnly(currentTime)}</span>
            <span className="text-neutral-500"> / </span>
            <span className="text-neutral-400">{formatSecondsOnly(totalDuration)}</span>
          </div>
        </div>

        {/* Center Progress Slider */}
        <div className="flex-1 max-w-xl mx-2 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={Math.max(totalDuration, 1)}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>

        {/* Right Controls: Speed, Volume, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-md text-[10px]">
            {[1, 1.5, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  playbackRate === rate ? 'bg-violet-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume Button & Slider */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                setIsMuted(val === 0);
              }}
              className="w-16 h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-violet-500"
            />
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
