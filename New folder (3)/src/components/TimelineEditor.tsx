import React, { useRef } from 'react';
import {
  Scissors,
  Trash2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Zap,
  Volume2,
  Type,
  Layers,
  ChevronLeft,
  ChevronRight,
  MoveLeft,
  MoveRight,
  Plus,
} from 'lucide-react';
import { HighlightReel, ReelTimelineItem, TransitionType } from '../types/video';
import { formatSecondsOnly } from '../utils/exportEngines';

interface TimelineEditorProps {
  currentReel: HighlightReel;
  currentTime: number;
  onSeek: (time: number) => void;
  selectedItemId: string | null;
  onSelectItem: (item: ReelTimelineItem) => void;
  onUpdateItemDuration: (itemId: string, newDuration: number) => void;
  onDeleteItem: (itemId: string) => void;
  onMoveItem: (fromIndex: number, toIndex: number) => void;
  onSplitItem: (itemId: string, splitOffset: number) => void;
  onChangeTransition: (itemId: string, transition: TransitionType) => void;
  timelineZoom: number;
  onChangeZoom: (zoom: number) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  currentReel,
  currentTime,
  onSeek,
  selectedItemId,
  onSelectItem,
  onUpdateItemDuration,
  onDeleteItem,
  onMoveItem,
  onSplitItem,
  onChangeTransition,
  timelineZoom,
  onChangeZoom,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);

  const totalDuration = currentReel.items.reduce((acc, item) => acc + item.duration, 0) || 30;

  // Pixels per second base * zoom
  const pxPerSec = 16 * timelineZoom;
  const timelineWidth = Math.max(totalDuration * pxPerSec + 200, 900);

  // Handle click on time ruler to seek
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekSec = Math.max(0, Math.min(totalDuration, clickX / pxPerSec));
    onSeek(seekSec);
  };

  const selectedItemIndex = currentReel.items.findIndex((item) => item.id === selectedItemId);
  const selectedItem = selectedItemIndex !== -1 ? currentReel.items[selectedItemIndex] : null;

  return (
    <div className="h-64 border-t border-neutral-800 bg-neutral-950 flex flex-col select-none z-20">
      {/* Top Toolbar */}
      <div className="h-10 border-b border-neutral-800 px-4 flex items-center justify-between text-xs bg-neutral-900/60">
        {/* Left Stats & Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <span className="text-neutral-400 font-normal">Reel Duration:</span>
            <span className="text-violet-400 font-mono font-bold">
              {formatSecondsOnly(totalDuration)}
            </span>
            <span className="text-[10px] text-neutral-500">
              (Target: {currentReel.targetDuration}s)
            </span>
          </div>

          <div className="h-4 w-px bg-neutral-800" />

          {/* Edit Actions */}
          <div className="flex items-center gap-1">
            <button
              disabled={!selectedItem}
              onClick={() => {
                if (selectedItem) {
                  // Split in half
                  onSplitItem(selectedItem.id, Math.floor(selectedItem.duration / 2));
                }
              }}
              className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Split selected clip at center"
            >
              <Scissors className="w-3 h-3 text-cyan-400" />
              <span>Split Clip</span>
            </button>

            <button
              disabled={!selectedItem || selectedItemIndex <= 0}
              onClick={() => {
                if (selectedItemIndex > 0) {
                  onMoveItem(selectedItemIndex, selectedItemIndex - 1);
                }
              }}
              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 transition-colors cursor-pointer"
              title="Move Clip Left"
            >
              <MoveLeft className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={!selectedItem || selectedItemIndex >= currentReel.items.length - 1}
              onClick={() => {
                if (selectedItemIndex < currentReel.items.length - 1) {
                  onMoveItem(selectedItemIndex, selectedItemIndex + 1);
                }
              }}
              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 transition-colors cursor-pointer"
              title="Move Clip Right"
            >
              <MoveRight className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={!selectedItem}
              onClick={() => {
                if (selectedItem) {
                  onDeleteItem(selectedItem.id);
                }
              }}
              className="px-2 py-1 rounded bg-neutral-800 hover:bg-rose-950 text-rose-300 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              title="Delete selected clip"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Right Zoom Controls */}
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-[11px] hidden sm:inline">Timeline Zoom:</span>
          <button
            onClick={() => onChangeZoom(Math.max(0.75, timelineZoom - 0.25))}
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[10px] text-neutral-300 w-8 text-center">
            {timelineZoom.toFixed(1)}x
          </span>
          <button
            onClick={() => onChangeZoom(Math.min(3, timelineZoom + 0.25))}
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tracks Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left sidebar) */}
        <div className="w-36 border-r border-neutral-800 bg-neutral-950 flex flex-col flex-shrink-0 text-[11px] text-neutral-400 font-medium">
          <div className="h-7 border-b border-neutral-800 px-2.5 flex items-center text-[10px] uppercase font-bold text-neutral-500">
            Track Layers
          </div>
          <div className="h-16 border-b border-neutral-800/80 px-2.5 flex items-center gap-1.5 text-violet-300">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>A-Roll Video</span>
          </div>
          <div className="h-9 border-b border-neutral-800/80 px-2.5 flex items-center gap-1.5 text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>B-Roll Cutaway</span>
          </div>
          <div className="h-9 border-b border-neutral-800/80 px-2.5 flex items-center gap-1.5 text-amber-300">
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span>Kinetic Subs</span>
          </div>
          <div className="h-9 px-2.5 flex items-center gap-1.5 text-emerald-300">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Music & SFX</span>
          </div>
        </div>

        {/* Scrollable Timeline Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative bg-neutral-900/30">
          <div style={{ width: `${timelineWidth}px` }} className="relative h-full flex flex-col">
            {/* Time Ruler */}
            <div
              ref={rulerRef}
              onClick={handleRulerClick}
              className="h-7 border-b border-neutral-800 bg-neutral-950/80 relative cursor-pointer"
            >
              {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => {
                const isMajor = sec % 5 === 0;
                return (
                  <div
                    key={sec}
                    style={{ left: `${sec * pxPerSec}px` }}
                    className="absolute top-0 bottom-0 flex flex-col justify-end"
                  >
                    <div
                      className={`w-px ${
                        isMajor ? 'h-3.5 bg-neutral-600' : 'h-1.5 bg-neutral-800'
                      }`}
                    />
                    {isMajor && (
                      <span className="text-[9px] font-mono text-neutral-500 -ml-2 -mb-0.5">
                        {sec}s
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Playhead Red Indicator Line */}
            <div
              style={{ left: `${currentTime * pxPerSec}px` }}
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none shadow-[0_0_8px_rgba(244,63,94,0.8)]"
            >
              <div className="w-3 h-3 bg-rose-500 rotate-45 -ml-1.25 -mt-1 shadow-md" />
            </div>

            {/* Track 1: A-Roll Video Highlights */}
            <div className="h-16 border-b border-neutral-800/80 p-1 flex items-center gap-1 relative">
              {currentReel.items.map((item, idx) => {
                const widthPx = Math.max(item.duration * pxPerSec, 48);
                const isSelected = selectedItemId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    style={{ width: `${widthPx}px` }}
                    className={`h-full rounded-lg border relative flex flex-col justify-between p-1.5 text-xs transition-all cursor-pointer group overflow-hidden ${
                      isSelected
                        ? 'bg-violet-900/60 border-violet-400 ring-2 ring-violet-500/40 shadow-lg'
                        : 'bg-neutral-800/80 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                    }`}
                  >
                    {/* Top Row: Clip Title & Viral Score */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[11px] truncate text-white">
                        #{idx + 1} {item.title}
                      </span>
                      <span className="text-[9px] font-extrabold px-1 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex-shrink-0">
                        {item.viralScore}%
                      </span>
                    </div>

                    {/* Bottom Row: Duration & Transition */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span>{item.duration.toFixed(1)}s</span>

                      {/* Transition selector icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const transitions: TransitionType[] = [
                            'jump_cut',
                            'whip_pan',
                            'flash_white',
                            'glitch',
                            'zoom_punch',
                          ];
                          const nextIdx = (transitions.indexOf(item.transitionIn) + 1) % transitions.length;
                          onChangeTransition(item.id, transitions[nextIdx]);
                        }}
                        className="px-1 py-0.5 rounded bg-neutral-900/90 text-[9px] text-cyan-300 border border-neutral-700 hover:border-cyan-400 flex items-center gap-0.5"
                        title="Click to cycle transition"
                      >
                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                        <span>{item.transitionIn.replace('_', ' ')}</span>
                      </button>
                    </div>

                    {/* Trim Handles */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        // Trimming handle logic
                        const startX = e.clientX;
                        const initialDuration = item.duration;
                        const onMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = moveEvent.clientX - startX;
                          const newDur = Math.max(2, Math.min(60, initialDuration + deltaX / pxPerSec));
                          onUpdateItemDuration(item.id, parseFloat(newDur.toFixed(1)));
                        };
                        const onMouseUp = () => {
                          window.removeEventListener('mousemove', onMouseMove);
                          window.removeEventListener('mouseup', onMouseUp);
                        };
                        window.addEventListener('mousemove', onMouseMove);
                        window.addEventListener('mouseup', onMouseUp);
                      }}
                      className="absolute right-0 top-0 bottom-0 w-2 hover:w-3 bg-violet-400/40 hover:bg-violet-400 cursor-ew-resize rounded-r transition-all"
                      title="Drag to trim duration"
                    />
                  </div>
                );
              })}
            </div>

            {/* Track 2: B-Roll Cutaway Track */}
            <div className="h-9 border-b border-neutral-800/80 p-1 flex items-center gap-2 relative bg-neutral-950/40">
              {currentReel.items.map((item, idx) => {
                const widthPx = Math.max(item.duration * pxPerSec, 48);
                return (
                  <div
                    key={`broll_${item.id}`}
                    style={{ width: `${widthPx}px` }}
                    className={`h-full rounded border flex items-center justify-between px-2 text-[10px] ${
                      item.brollActive
                        ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300'
                        : 'bg-neutral-900/30 border-dashed border-neutral-800 text-neutral-500'
                    }`}
                  >
                    <span className="truncate">
                      {item.brollActive ? `🖼️ ${item.brollOverlay || 'B-Roll'}` : 'No Cutaway'}
                    </span>
                    <button
                      onClick={() => {
                        onSelectItem(item);
                      }}
                      className="text-[9px] hover:text-white"
                    >
                      {item.brollActive ? 'ON' : 'OFF'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Track 3: Subtitles Track */}
            <div className="h-9 border-b border-neutral-800/80 p-1 flex items-center gap-1 relative bg-neutral-950/20">
              {currentReel.items.map((item) => {
                const widthPx = Math.max(item.duration * pxPerSec, 48);
                return (
                  <div
                    key={`sub_${item.id}`}
                    style={{ width: `${widthPx}px` }}
                    className="h-full rounded bg-amber-950/30 border border-amber-800/40 px-2 flex items-center text-[10px] text-amber-200/90 font-medium truncate"
                  >
                    <span>💬 {item.bestQuote ? item.bestQuote.slice(0, 30) + '...' : 'Kinetic Subtitles'}</span>
                  </div>
                );
              })}
            </div>

            {/* Track 4: Music & SFX Waveform Pulse Track */}
            <div className="h-9 p-1 flex items-center gap-1 relative bg-neutral-950/50">
              <div
                style={{ width: `${totalDuration * pxPerSec}px` }}
                className="h-full rounded bg-emerald-950/30 border border-emerald-800/40 px-2 flex items-center justify-between text-[10px] text-emerald-300 font-mono"
              >
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                  <span>♫ {currentReel.backgroundMusic.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1 opacity-70">
                  <div className="h-3 w-1 bg-emerald-400/60 rounded" />
                  <div className="h-4 w-1 bg-emerald-400/80 rounded" />
                  <div className="h-2 w-1 bg-emerald-400/40 rounded" />
                  <div className="h-5 w-1 bg-emerald-400 rounded" />
                  <div className="h-3 w-1 bg-emerald-400/70 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
