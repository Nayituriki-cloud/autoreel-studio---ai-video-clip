import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Play,
  Plus,
  Check,
  Clock,
  Tag,
  Filter,
  ArrowUpDown,
  Quote,
  ChevronRight,
  TrendingUp,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { AIClip, ClipCategory } from '../types/video';
import { formatSecondsOnly } from '../utils/exportEngines';

interface AIClipsBinProps {
  clips: AIClip[];
  selectedClipIds: string[];
  onToggleClipSelection: (clip: AIClip) => void;
  onPreviewClip: (clip: AIClip) => void;
  onAddAllToReel: () => void;
  isAnalyzing: boolean;
}

export const AIClipsBin: React.FC<AIClipsBinProps> = ({
  clips,
  selectedClipIds,
  onToggleClipSelection,
  onPreviewClip,
  onAddAllToReel,
  isAnalyzing,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'duration'>('score');
  const [expandedClipId, setExpandedClipId] = useState<string | null>(null);

  const categories: string[] = ['all', 'Hot Take', 'Aha Moment', 'Story Arc', 'Game Changer', 'Action Climax'];

  const filteredClips = clips
    .filter((clip) => filterCategory === 'all' || clip.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'score') return b.viralScore - a.viralScore;
      if (sortBy === 'time') return a.startTime - b.startTime;
      if (sortBy === 'duration') return (b.endTime - b.startTime) - (a.endTime - a.startTime);
      return 0;
    });

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    if (score >= 90) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30';
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 border-r border-neutral-800 w-full select-none">
      {/* Header Bar */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/15 text-violet-400 border border-violet-500/20">
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>AI Clips Bin</span>
              <span className="text-[10px] font-normal text-neutral-400 bg-neutral-900 px-1.5 py-0.2 rounded border border-neutral-800">
                {clips.length} found
              </span>
            </h2>
            <p className="text-[10px] text-neutral-400">Viral score ranked highlights</p>
          </div>
        </div>

        {clips.length > 0 && (
          <button
            onClick={onAddAllToReel}
            className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Top to Reel
          </button>
        )}
      </div>

      {/* Filter & Sort Controls */}
      <div className="px-3 py-2 border-b border-neutral-800/80 bg-neutral-900/40 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors cursor-pointer capitalize font-medium ${
                filterCategory === cat
                  ? 'bg-violet-600 text-white'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {cat === 'all' ? 'All Clips' : cat}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1 text-neutral-400 text-[10px]">
          <ArrowUpDown className="w-3 h-3 text-neutral-500" />
          <button
            onClick={() => setSortBy('score')}
            className={`cursor-pointer ${sortBy === 'score' ? 'text-amber-400 font-bold' : 'hover:text-neutral-300'}`}
          >
            Viral %
          </button>
          <span>|</span>
          <button
            onClick={() => setSortBy('time')}
            className={`cursor-pointer ${sortBy === 'time' ? 'text-violet-400 font-bold' : 'hover:text-neutral-300'}`}
          >
            Time
          </button>
        </div>
      </div>

      {/* Clips List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {isAnalyzing ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin mb-3" />
            <p className="text-xs font-semibold text-neutral-200">Gemini 3.8 Flash is Analyzing Footage</p>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-[220px]">
              Extracting viral hooks, speech energy peaks, and high-retention segments...
            </p>
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-neutral-500 text-xs">
            <Sparkles className="w-8 h-8 text-neutral-600 mb-2" />
            <p>No clips match this filter.</p>
          </div>
        ) : (
          filteredClips.map((clip) => {
            const isSelected = selectedClipIds.includes(clip.id);
            const isExpanded = expandedClipId === clip.id;
            const duration = Math.round(clip.endTime - clip.startTime);

            return (
              <div
                key={clip.id}
                className={`group rounded-xl border transition-all overflow-hidden ${
                  isSelected
                    ? 'bg-neutral-900/90 border-violet-500/60 shadow-lg shadow-violet-950/20'
                    : 'bg-neutral-900/50 hover:bg-neutral-900 border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                {/* Top Header: Viral Score & Category */}
                <div className="p-3 pb-2 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {/* Viral Score Badge */}
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded border flex items-center gap-1 ${getScoreColor(
                          clip.viralScore
                        )}`}
                      >
                        <TrendingUp className="w-2.5 h-2.5" />
                        {clip.viralScore}% VIRAL
                      </span>

                      {/* Category Tag */}
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/50">
                        {clip.category}
                      </span>

                      {/* Time Duration */}
                      <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-0.5 ml-auto">
                        <Clock className="w-2.5 h-2.5 text-neutral-500" />
                        {formatSecondsOnly(clip.startTime)} - {formatSecondsOnly(clip.endTime)} ({duration}s)
                      </span>
                    </div>

                    {/* Hook Title */}
                    <h3 className="text-xs font-bold text-neutral-100 group-hover:text-white leading-snug">
                      {clip.hookTitle}
                    </h3>

                    {/* Bold Burn-in Hook Headline */}
                    {clip.hookHeadline && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-300 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/40">
                        <span>Hook:</span>
                        <span>"{clip.hookHeadline}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Spoken Quote snippet */}
                {clip.bestQuote && (
                  <div className="px-3 py-1.5 bg-neutral-950/60 border-y border-neutral-800/60 text-[11px] text-neutral-300 flex items-start gap-1.5 italic">
                    <Quote className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">"{clip.bestQuote}"</span>
                  </div>
                )}

                {/* AI Rationale Expander */}
                {isExpanded && (
                  <div className="p-3 bg-neutral-950/90 border-b border-neutral-800/80 text-[11px] space-y-2">
                    <div>
                      <span className="font-semibold text-neutral-400">AI Retention Analysis:</span>
                      <p className="text-neutral-300 mt-0.5">{clip.summary}</p>
                    </div>

                    {clip.suggestedBroll && clip.suggestedBroll.length > 0 && (
                      <div>
                        <span className="font-semibold text-neutral-400">Suggested B-Roll Overlays:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {clip.suggestedBroll.map((b, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-neutral-900 px-1.5 py-0.5 rounded text-cyan-300 border border-neutral-800"
                            >
                              + {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="p-2 px-3 bg-neutral-950/40 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => setExpandedClipId(isExpanded ? null : clip.id)}
                    className="text-[10px] text-neutral-400 hover:text-neutral-200 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'AI Analysis'}</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Preview Button */}
                    <button
                      onClick={() => onPreviewClip(clip)}
                      className="px-2 py-1 rounded-md text-[11px] font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Preview this clip in video player"
                    >
                      <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                      <span>Preview</span>
                    </button>

                    {/* Add to Reel Button */}
                    <button
                      onClick={() => onToggleClipSelection(clip)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-neutral-800 hover:bg-violet-600/30 text-violet-300 border border-violet-800/40'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span>In Reel</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 text-violet-400" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
