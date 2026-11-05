export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';

export type SubtitleStyle = 'hormozi' | 'cyber' | 'minimal' | 'boxed' | 'classic';

export type TransitionType = 'jump_cut' | 'whip_pan' | 'flash_white' | 'zoom_punch' | 'crossfade' | 'glitch';

export type ClipCategory =
  | 'Hot Take'
  | 'Story Arc'
  | 'Aha Moment'
  | 'Humor / Relatable'
  | 'Game Changer'
  | 'Action Climax';

export type PacingStyle =
  | 'Fast-Paced'
  | 'Emotional & Steady'
  | 'Punchy & Direct'
  | 'Dramatic Build';

export interface CaptionWord {
  text: string;
  timeOffset: number; // offset in seconds from clip start
  highlight?: boolean;
}

export interface TimedCaptionChunk {
  start: number;
  end: number;
  words: string;
  highlightWord?: string;
  color?: string;
  emoji?: string;
  scale?: number;
}

export interface AIClip {
  id: string;
  footageId: string;
  startTime: number;
  endTime: number;
  viralScore: number;
  hookTitle: string;
  hookHeadline: string;
  category: ClipCategory;
  pacing: PacingStyle;
  summary: string;
  bestQuote: string;
  captionSnippet: CaptionWord[];
  suggestedBroll: string[];
  thumbnailTime?: number;
}

export interface TranscriptLine {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
  highlight?: boolean;
}

export interface RawFootage {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  videoUrl: string;
  thumbnailUrl: string;
  resolution: string;
  fps: number;
  category: string;
  speakers: string[];
  transcript: TranscriptLine[];
  precalculatedClips?: AIClip[];
}

export interface ReelTimelineItem {
  id: string;
  clipId: string;
  originalFootageId: string;
  title: string;
  startTime: number; // in raw footage
  endTime: number; // in raw footage
  duration: number; // endTime - startTime
  transitionIn: TransitionType;
  zoomScale: number; // 1.0 to 1.3
  hookText?: string;
  soundEffect?: 'whoosh_fast' | 'riser_pop' | 'bell_ding' | 'punch_hit' | 'camera_shutter' | 'none';
  brollOverlay?: string;
  brollActive?: boolean;
  viralScore: number;
  bestQuote?: string;
}

export interface HighlightReel {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  targetDuration: number;
  vibe: 'viral_short' | 'story_insight' | 'punchy_teaser' | 'cinematic';
  items: ReelTimelineItem[];
  subtitleStyle: SubtitleStyle;
  showSafeZones: boolean;
  backgroundMusic: 'lofi_punch' | 'synthwave_pulse' | 'dramatic_cinematic' | 'hiphop_trap' | 'none';
  musicVolume: number; // 0 to 1
  autoSilenceCut: boolean;
  punchZoomEnabled: boolean;
}

export interface BrollAsset {
  id: string;
  title: string;
  category: string;
  color: string;
  icon: string;
  description: string;
  imageUrl: string;
}
