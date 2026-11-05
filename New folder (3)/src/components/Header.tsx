import React from 'react';
import {
  Sparkles,
  Film,
  Download,
  Share2,
  Maximize2,
  Smartphone,
  Tv,
  Square,
  Scissors,
  Layers,
  Wand2,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { AspectRatio, HighlightReel } from '../types/video';

interface HeaderProps {
  currentReel: HighlightReel;
  onUpdateAspectRatio: (ratio: AspectRatio) => void;
  onOpenReelWizard: () => void;
  onOpenExportModal: () => void;
  onExportEDL: () => void;
  onExportCapCut: () => void;
  previewMode: 'reel' | 'raw';
  onTogglePreviewMode: (mode: 'reel' | 'raw') => void;
  isAiAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentReel,
  onUpdateAspectRatio,
  onOpenReelWizard,
  onOpenExportModal,
  onExportEDL,
  onExportCapCut,
  previewMode,
  onTogglePreviewMode,
  isAiAnalyzing,
}) => {
  const aspectRatios: { ratio: AspectRatio; label: string; icon: React.ReactNode }[] = [
    { ratio: '9:16', label: '9:16 Shorts', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { ratio: '16:9', label: '16:9 Cinema', icon: <Tv className="w-3.5 h-3.5" /> },
    { ratio: '1:1', label: '1:1 Square', icon: <Square className="w-3.5 h-3.5" /> },
    { ratio: '4:5', label: '4:5 Feed', icon: <Maximize2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & App Info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
          <Film className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              AutoReel <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 font-extrabold">Studio</span>
            </span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-violet-400 animate-pulse" />
              AI Clips
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate max-w-[240px] md:max-w-[340px]">
            Automated Highlight Reel Creator & Smart Video Editor
          </p>
        </div>
      </div>

      {/* Center Controls: Aspect Ratio & Mode Switcher */}
      <div className="flex items-center gap-2">
        {/* Preview Mode Toggle */}
        <div className="hidden md:flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
          <button
            onClick={() => onTogglePreviewMode('reel')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              previewMode === 'reel'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Highlight Reel ({currentReel.items.length})
          </button>
          <button
            onClick={() => onTogglePreviewMode('raw')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              previewMode === 'raw'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Raw Footage
          </button>
        </div>

        {/* Aspect Ratio Switcher */}
        <div className="flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
          {aspectRatios.map((item) => (
            <button
              key={item.ratio}
              onClick={() => onUpdateAspectRatio(item.ratio)}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                currentReel.aspectRatio === item.ratio
                  ? 'bg-neutral-800 text-cyan-300 shadow-sm border border-neutral-700/50'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title={`Switch to ${item.label}`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.ratio}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Auto Reel Wizard CTA */}
        <button
          onClick={onOpenReelWizard}
          disabled={isAiAnalyzing}
          className="relative group px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 active:scale-95 transition-all shadow-md shadow-violet-900/30 border border-violet-400/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          <Wand2 className="w-3.5 h-3.5 text-violet-200 animate-spin-slow group-hover:rotate-12 transition-transform" />
          <span>Auto-Reel AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping absolute -top-0.5 -right-0.5" />
        </button>

        {/* Export Dropdown / Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenExportModal}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> Video
          </button>

          {/* CMX / EDL Pro Export */}
          <div className="relative group">
            <button
              title="Export EDL / Final Cut / Premiere Pro Project"
              onClick={onExportEDL}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-48 p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl text-[11px] text-neutral-300 z-50">
              <p className="font-semibold text-white mb-1">Export Project Files:</p>
              <button
                onClick={(e) => { e.stopPropagation(); onExportEDL(); }}
                className="w-full text-left py-1 px-1.5 hover:bg-neutral-800 rounded text-violet-300 font-mono"
              >
                • CMX 3600 EDL (Premiere/DaVinci)
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onExportCapCut(); }}
                className="w-full text-left py-1 px-1.5 hover:bg-neutral-800 rounded text-cyan-300 font-mono"
              >
                • CapCut JSON Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
