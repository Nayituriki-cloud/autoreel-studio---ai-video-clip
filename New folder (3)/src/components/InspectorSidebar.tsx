import React, { useState } from 'react';
import {
  Sliders,
  Type,
  Music,
  Sparkles,
  Zap,
  TrendingUp,
  Image,
  Volume2,
  Check,
  Send,
  Wand2,
} from 'lucide-react';
import {
  HighlightReel,
  ReelTimelineItem,
  SubtitleStyle,
  TransitionType,
} from '../types/video';
import { BROLL_LIBRARY } from '../data/sampleFootage';

interface InspectorSidebarProps {
  currentReel: HighlightReel;
  selectedItem: ReelTimelineItem | null;
  onUpdateSelectedItem: (updated: Partial<ReelTimelineItem>) => void;
  onUpdateReelSettings: (updated: Partial<HighlightReel>) => void;
  onAiPromptInstruction: (instruction: string) => Promise<void>;
  isAiProcessing: boolean;
}

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({
  currentReel,
  selectedItem,
  onUpdateSelectedItem,
  onUpdateReelSettings,
  onAiPromptInstruction,
  isAiProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'clip' | 'captions' | 'audio' | 'ai'>('clip');
  const [aiInstruction, setAiInstruction] = useState<string>('');

  const subtitleStyles: { style: SubtitleStyle; name: string; desc: string }[] = [
    { style: 'hormozi', name: 'Hormozi Punch', desc: 'Bold yellow active word, high retention' },
    { style: 'cyber', name: 'Cyber Neon', desc: 'Glowing cyan tech aesthetic' },
    { style: 'minimal', name: 'Minimal Modern', desc: 'Clean semi-bold white' },
    { style: 'boxed', name: 'Boxed Pill', desc: 'Dark rounded pill backdrop' },
  ];

  const transitions: { type: TransitionType; label: string }[] = [
    { type: 'jump_cut', label: 'Jump Cut (Fast)' },
    { type: 'whip_pan', label: 'Whip Pan' },
    { type: 'flash_white', label: 'Flash White' },
    { type: 'zoom_punch', label: 'Zoom Punch' },
    { type: 'glitch', label: 'Glitch FX' },
    { type: 'crossfade', label: 'Crossfade' },
  ];

  const soundEffects = [
    { id: 'whoosh_fast', label: 'Fast Whoosh' },
    { id: 'riser_pop', label: 'Riser & Pop' },
    { id: 'punch_hit', label: '808 Sub Punch' },
    { id: 'bell_ding', label: 'Chime Ding' },
    { id: 'camera_shutter', label: 'Camera Click' },
    { id: 'none', label: 'No SFX' },
  ];

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInstruction.trim() || isAiProcessing) return;
    const prompt = aiInstruction;
    setAiInstruction('');
    await onAiPromptInstruction(prompt);
  };

  return (
    <div className="w-80 h-full border-l border-neutral-800 bg-neutral-950 flex flex-col select-none text-xs">
      {/* Tab Navigation */}
      <div className="h-11 border-b border-neutral-800 px-2 flex items-center justify-around bg-neutral-900/50">
        <button
          onClick={() => setActiveTab('clip')}
          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'clip'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-violet-400" />
          <span>Clip FX</span>
        </button>

        <button
          onClick={() => setActiveTab('captions')}
          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'captions'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-amber-400" />
          <span>Captions</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'audio'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Music className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audio</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Refine</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Clip FX */}
        {activeTab === 'clip' && (
          selectedItem ? (
            <div className="space-y-4">
              {/* Selected Clip Header */}
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{selectedItem.title}</span>
                  <span className="text-[10px] font-black text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-400/30">
                    {selectedItem.viralScore}% VIRAL
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono mt-1">
                  Duration: {selectedItem.duration.toFixed(1)}s
                </p>
              </div>

              {/* Hook Text Banner */}
              <div>
                <label className="font-semibold text-neutral-300 block mb-1">
                  Hook Headline (First 3s on screen)
                </label>
                <input
                  type="text"
                  value={selectedItem.hookText || ''}
                  onChange={(e) => onUpdateSelectedItem({ hookText: e.target.value })}
                  placeholder="e.g. NEVER DO THIS ❌"
                  className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-violet-500 focus:outline-none"
                />
              </div>

              {/* Transition Style */}
              <div>
                <label className="font-semibold text-neutral-300 block mb-1.5">
                  Transition In
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {transitions.map((t) => (
                    <button
                      key={t.type}
                      onClick={() => onUpdateSelectedItem({ transitionIn: t.type })}
                      className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        selectedItem.transitionIn === t.type
                          ? 'bg-violet-900/40 border-violet-500 text-white font-bold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Punch Zoom Scale */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-neutral-300">Punch Zoom Scale</span>
                  <span className="font-mono text-cyan-300">{selectedItem.zoomScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={1.3}
                  step={0.05}
                  value={selectedItem.zoomScale}
                  onChange={(e) => onUpdateSelectedItem({ zoomScale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              {/* Sound Effect on Cut */}
              <div>
                <label className="font-semibold text-neutral-300 block mb-1.5">
                  Transition SFX Hit
                </label>
                <select
                  value={selectedItem.soundEffect || 'whoosh_fast'}
                  onChange={(e) => onUpdateSelectedItem({ soundEffect: e.target.value as any })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:border-violet-500 focus:outline-none"
                >
                  {soundEffects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* B-Roll Cutaway Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-neutral-300">B-Roll Visual Cutaway</span>
                  <button
                    onClick={() => onUpdateSelectedItem({ brollActive: !selectedItem.brollActive })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      selectedItem.brollActive
                        ? 'bg-cyan-500 text-black'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {selectedItem.brollActive ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {selectedItem.brollActive && (
                  <div className="space-y-1.5">
                    {BROLL_LIBRARY.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => onUpdateSelectedItem({ brollOverlay: b.title })}
                        className={`w-full p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                          selectedItem.brollOverlay === b.title
                            ? 'bg-cyan-950/40 border-cyan-500 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <img
                          src={b.imageUrl}
                          alt={b.title}
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{b.title}</p>
                          <p className="text-[10px] text-neutral-500">{b.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-500 p-4">
              <Sliders className="w-8 h-8 text-neutral-600 mb-2" />
              <p className="font-medium">No clip selected</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Click any clip in the timeline or AI Clips bin to inspect and tweak its visual parameters.
              </p>
            </div>
          )
        )}

        {/* Tab 2: Captions */}
        {activeTab === 'captions' && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-neutral-300 block mb-2">
                Kinetic Subtitle Style
              </label>
              <div className="space-y-2">
                {subtitleStyles.map((s) => (
                  <button
                    key={s.style}
                    onClick={() => onUpdateReelSettings({ subtitleStyle: s.style })}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      currentReel.subtitleStyle === s.style
                        ? 'bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border-violet-500 text-white shadow-md'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{s.name}</span>
                      {currentReel.subtitleStyle === s.style && (
                        <Check className="w-4 h-4 text-violet-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Auto punch zoom on emphasis */}
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Auto Punch-Zoom</p>
                <p className="text-[10px] text-neutral-400">Pushes in 1.15x during emphatic words</p>
              </div>
              <button
                onClick={() => onUpdateReelSettings({ punchZoomEnabled: !currentReel.punchZoomEnabled })}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  currentReel.punchZoomEnabled ? 'bg-violet-600' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    currentReel.punchZoomEnabled ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Audio */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-neutral-300 block mb-2">
                Background Music Track
              </label>
              <div className="space-y-2">
                {[
                  { id: 'lofi_punch', name: 'Lo-Fi Chill Hop Beat', tag: 'High Retention / Clean' },
                  { id: 'synthwave_pulse', name: 'Synthwave Neon Pulse', tag: 'Tech & Modern' },
                  { id: 'dramatic_cinematic', name: 'Dramatic Riser & String', tag: 'Storytelling' },
                  { id: 'hiphop_trap', name: 'Hip-Hop Trap 808', tag: 'High Energy' },
                  { id: 'none', name: 'None (Raw Audio Only)', tag: 'Natural Spoken' },
                ].map((track) => (
                  <button
                    key={track.id}
                    onClick={() => onUpdateReelSettings({ backgroundMusic: track.id as any })}
                    className={`w-full p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      currentReel.backgroundMusic === track.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-white font-bold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{track.name}</span>
                      {currentReel.backgroundMusic === track.id && (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-500 font-normal">{track.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-neutral-300">Music Ducking Volume</span>
                <span className="font-mono text-emerald-400">
                  {Math.round(currentReel.musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={currentReel.musicVolume}
                onChange={(e) => onUpdateReelSettings({ musicVolume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Tab 4: AI Refine */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-950/50 to-indigo-950/50 border border-violet-800/40">
              <div className="flex items-center gap-1.5 text-violet-300 font-bold mb-1">
                <Wand2 className="w-4 h-4 text-violet-400" />
                <span>AI Video Assistant</span>
              </div>
              <p className="text-[11px] text-neutral-300">
                Instruct Gemini to adjust pacing, trim dead air, insert punchy jump cuts, or rewrite the hook headline.
              </p>
            </div>

            {/* Quick AI Presets */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-400 block text-[11px]">Quick Directives:</label>
              {[
                '⚡ Make this reel ultra punchy under 20 seconds',
                '🔥 Boost hook CTR with an aggressive opening banner',
                '✂️ Cut all filler phrases and tighten transitions',
                '🎬 Add dramatic zoom punches on key revelations',
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => onAiPromptInstruction(cmd)}
                  disabled={isAiProcessing}
                  className="w-full text-left p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer text-[11px]"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Custom Prompt Box */}
            <form onSubmit={handleAiSubmit} className="space-y-2 pt-2">
              <label className="font-semibold text-neutral-300 block">Custom Editing Instruction:</label>
              <textarea
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                placeholder="e.g. Keep Sarah's explanation of why simplicity requires courage, and end with the grandmother test."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none text-xs"
              />
              <button
                type="submit"
                disabled={!aiInstruction.trim() || isAiProcessing}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiProcessing ? 'Thinking...' : 'Apply AI Edit'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
