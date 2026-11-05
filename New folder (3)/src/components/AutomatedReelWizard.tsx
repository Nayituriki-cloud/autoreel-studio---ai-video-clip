import React, { useState } from 'react';
import {
  Wand2,
  X,
  Sparkles,
  Zap,
  Clock,
  Flame,
  CheckCircle,
  Scissors,
  Layers,
  TrendingUp,
} from 'lucide-react';

interface AutomatedReelWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateReel: (config: {
    targetDuration: number;
    vibe: 'viral_short' | 'story_insight' | 'punchy_teaser' | 'cinematic';
    autoSilenceCut: boolean;
    autoPunchZoom: boolean;
    autoHookBanner: boolean;
    subtitleStyle: 'hormozi' | 'cyber' | 'minimal';
  }) => Promise<void>;
  isGenerating: boolean;
  videoTitle: string;
}

export const AutomatedReelWizard: React.FC<AutomatedReelWizardProps> = ({
  isOpen,
  onClose,
  onGenerateReel,
  isGenerating,
  videoTitle,
}) => {
  const [targetDuration, setTargetDuration] = useState<number>(30);
  const [vibe, setVibe] = useState<'viral_short' | 'story_insight' | 'punchy_teaser' | 'cinematic'>('viral_short');
  const [autoSilenceCut, setAutoSilenceCut] = useState<boolean>(true);
  const [autoPunchZoom, setAutoPunchZoom] = useState<boolean>(true);
  const [autoHookBanner, setAutoHookBanner] = useState<boolean>(true);
  const [subtitleStyle, setSubtitleStyle] = useState<'hormozi' | 'cyber' | 'minimal'>('hormozi');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateReel({
      targetDuration,
      vibe,
      autoSilenceCut,
      autoPunchZoom,
      autoHookBanner,
      subtitleStyle,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-800 bg-gradient-to-r from-violet-950/40 via-neutral-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>AI Automated Reel Generator</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                  Gemini 3.8 Flash
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Transform raw footage into a viral highlight reel in seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Target Duration Selector */}
          <div>
            <label className="font-bold text-neutral-200 block mb-2 flex items-center justify-between">
              <span>1. Target Reel Duration</span>
              <span className="text-violet-400 font-mono font-bold text-sm">{targetDuration}s</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { sec: 15, label: '15s Hook', sub: 'TikTok Blitz' },
                { sec: 30, label: '30s Viral', sub: 'Optimal Retention' },
                { sec: 60, label: '60s Story', sub: 'Full Narrative' },
                { sec: 90, label: '90s Master', sub: 'In-Depth Cut' },
              ].map((opt) => (
                <button
                  key={opt.sec}
                  type="button"
                  onClick={() => setTargetDuration(opt.sec)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    targetDuration === opt.sec
                      ? 'bg-gradient-to-b from-violet-600 to-indigo-700 text-white border-violet-400 shadow-md scale-[1.02]'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <p className="font-extrabold text-sm">{opt.label}</p>
                  <p className="text-[10px] opacity-80 mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Vibe / Style Preset */}
          <div>
            <label className="font-bold text-neutral-200 block mb-2">
              2. Pacing & Editorial Vibe
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  id: 'viral_short',
                  title: '⚡ Viral Short (Hormozi Style)',
                  desc: 'High velocity cuts, bold on-screen hooks, fast punch zooms.',
                },
                {
                  id: 'story_insight',
                  title: '📖 Storytelling & Revelation',
                  desc: 'Problem -> Near Disaster -> Breakthrough -> Golden Takeaway.',
                },
                {
                  id: 'punchy_teaser',
                  title: '🎯 Punchy Soundbites',
                  desc: 'Chains the highest viral score one-liners back-to-back.',
                },
                {
                  id: 'cinematic',
                  title: '🎬 Cinematic Highlight Arc',
                  desc: 'Polished audio transitions, dramatic risers, immersive pacing.',
                },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setVibe(preset.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    vibe === preset.id
                      ? 'bg-neutral-900 border-violet-500 ring-2 ring-violet-500/30 text-white'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <p className="font-bold text-xs">{preset.title}</p>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Automation AI Features */}
          <div>
            <label className="font-bold text-neutral-200 block mb-2">
              3. Automated Editor Enhancements
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 cursor-pointer hover:bg-neutral-900">
                <div className="flex items-center gap-2.5">
                  <Scissors className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="font-semibold text-white">Cut Dead Air & Silences</p>
                    <p className="text-[10px] text-neutral-400">Auto-trims dead pauses under 0.3s for rapid pacing</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSilenceCut}
                  onChange={(e) => setAutoSilenceCut(e.target.checked)}
                  className="w-4 h-4 rounded accent-violet-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 cursor-pointer hover:bg-neutral-900">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-semibold text-white">Dynamic Punch-Zoom on Revelations</p>
                    <p className="text-[10px] text-neutral-400">Pushes in 1.15x on high energy quotes to reset eye fatigue</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoPunchZoom}
                  onChange={(e) => setAutoPunchZoom(e.target.checked)}
                  className="w-4 h-4 rounded accent-violet-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 cursor-pointer hover:bg-neutral-900">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <div>
                    <p className="font-semibold text-white">Burn-in 3-Second Hook Headline</p>
                    <p className="text-[10px] text-neutral-400">Generates high-CTR curiosity banner in the first 3 seconds</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoHookBanner}
                  onChange={(e) => setAutoHookBanner(e.target.checked)}
                  className="w-4 h-4 rounded accent-violet-600 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Subtitle Style */}
          <div>
            <label className="font-bold text-neutral-200 block mb-2">
              4. Kinetic Subtitle Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hormozi', name: 'Hormozi Punch', desc: 'Yellow bold word highlight' },
                { id: 'cyber', name: 'Cyber Glow', desc: 'Neon cyan tech' },
                { id: 'minimal', name: 'Minimal White', desc: 'Clean modern' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSubtitleStyle(style.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    subtitleStyle === style.id
                      ? 'bg-neutral-900 border-amber-400 text-white font-bold'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <p className="text-xs">{style.name}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-300 hover:bg-neutral-800 transition-colors font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold shadow-lg shadow-violet-900/40 flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating Reel...' : 'Assemble Highlight Reel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
