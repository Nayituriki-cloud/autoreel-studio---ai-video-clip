import React, { useRef } from 'react';
import {
  Film,
  Upload,
  Video,
  Sparkles,
  Clock,
  Layers,
  ChevronDown,
  PlayCircle,
  Radio,
  FileVideo,
} from 'lucide-react';
import { RawFootage } from '../types/video';
import { formatSecondsOnly } from '../utils/exportEngines';

interface FootageSelectorProps {
  footageList: RawFootage[];
  activeFootage: RawFootage;
  onSelectFootage: (footage: RawFootage) => void;
  onUploadCustomFootage: (file: File) => void;
  onOpenRecorder: () => void;
  onAnalyzeFootage: () => void;
  isAnalyzing: boolean;
}

export const FootageSelector: React.FC<FootageSelectorProps> = ({
  footageList,
  activeFootage,
  onSelectFootage,
  onUploadCustomFootage,
  onOpenRecorder,
  onAnalyzeFootage,
  isAnalyzing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCustomFootage(file);
    }
  };

  return (
    <div className="bg-neutral-900/90 border-b border-neutral-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Current Footage Info & Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 font-medium">Source Footage:</span>
          <div className="relative group">
            <button className="flex items-center gap-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700/60 rounded-lg px-2.5 py-1.5 text-neutral-200 font-semibold transition-colors cursor-pointer">
              <Film className="w-3.5 h-3.5 text-violet-400" />
              <span className="max-w-[200px] truncate">{activeFootage.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full mt-1.5 hidden group-hover:block w-72 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50">
              <p className="text-[10px] uppercase font-bold text-neutral-400 px-2 py-1">
                Library Raw Footage
              </p>
              {footageList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectFootage(item)}
                  className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeFootage.id === item.id
                      ? 'bg-violet-950/40 border border-violet-800/40 text-violet-200'
                      : 'hover:bg-neutral-900 text-neutral-300'
                  }`}
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-12 h-8 rounded object-cover flex-shrink-0 border border-neutral-800"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-xs truncate">{item.title}</p>
                    <p className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>{formatSecondsOnly(item.duration)}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                    </p>
                  </div>
                </button>
              ))}

              <div className="border-t border-neutral-800 my-1 pt-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left p-2 rounded-lg hover:bg-neutral-900 text-neutral-300 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Upload Local Raw Video (.mp4, .webm)</span>
                </button>
                <button
                  onClick={onOpenRecorder}
                  className="w-full text-left p-2 rounded-lg hover:bg-neutral-900 text-neutral-300 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Radio className="w-4 h-4 text-red-400" />
                  <span>Record from Camera / Screen</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Specs Badges */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
            <Clock className="w-3 h-3 text-neutral-500" />
            {formatSecondsOnly(activeFootage.duration)} Raw
          </span>
          <span className="bg-neutral-950 px-2 py-1 rounded border border-neutral-800 font-mono">
            {activeFootage.resolution}
          </span>
          <span className="bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
            {activeFootage.speakers.length} Speakers
          </span>
        </div>
      </div>

      {/* Right Controls: AI Analyze & Upload */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Upload File</span>
        </button>

        <button
          onClick={onOpenRecorder}
          className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Record</span>
        </button>

        <button
          onClick={onAnalyzeFootage}
          disabled={isAnalyzing}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : 'text-violet-200'}`} />
          <span>{isAnalyzing ? 'Analyzing AI Clips...' : 'Run AI Clip Detection'}</span>
        </button>
      </div>
    </div>
  );
};
