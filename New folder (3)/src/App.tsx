import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { FootageSelector } from './components/FootageSelector';
import { AIClipsBin } from './components/AIClipsBin';
import { VideoPlayer } from './components/VideoPlayer';
import { TimelineEditor } from './components/TimelineEditor';
import { InspectorSidebar } from './components/InspectorSidebar';
import { AutomatedReelWizard } from './components/AutomatedReelWizard';
import { ExportModal } from './components/ExportModal';
import { RecordModal } from './components/RecordModal';
import { SAMPLE_FOOTAGE } from './data/sampleFootage';
import {
  RawFootage,
  AIClip,
  HighlightReel,
  ReelTimelineItem,
  AspectRatio,
  SubtitleStyle,
  TransitionType,
} from './types/video';
import {
  generateCMX3600EDL,
  generateCapCutJsonProject,
  downloadTextFile,
} from './utils/exportEngines';

export default function App() {
  // State
  const [footageList, setFootageList] = useState<RawFootage[]>(SAMPLE_FOOTAGE);
  const [activeFootage, setActiveFootage] = useState<RawFootage>(SAMPLE_FOOTAGE[0]);
  const [clips, setClips] = useState<AIClip[]>(SAMPLE_FOOTAGE[0].precalculatedClips || []);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'reel' | 'raw'>('reel');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [timelineZoom, setTimelineZoom] = useState<number>(1.2);

  // Modals & Processors
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isRecordOpen, setIsRecordOpen] = useState<boolean>(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [isGeneratingReel, setIsGeneratingReel] = useState<boolean>(false);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Initialize Default Reel from top clips
  const initialReel = useMemo<HighlightReel>(() => {
    const defaultClips = SAMPLE_FOOTAGE[0].precalculatedClips || [];
    const items: ReelTimelineItem[] = defaultClips.slice(0, 3).map((c, i) => ({
      id: `reel_item_${c.id}`,
      clipId: c.id,
      originalFootageId: SAMPLE_FOOTAGE[0].id,
      title: c.hookTitle,
      startTime: c.startTime,
      endTime: c.endTime,
      duration: Math.min(12, Math.round(c.endTime - c.startTime)),
      transitionIn: i === 0 ? 'jump_cut' : (i === 1 ? 'whip_pan' : 'flash_white'),
      zoomScale: i === 0 ? 1.15 : 1.0,
      hookText: c.hookHeadline,
      soundEffect: i === 0 ? 'riser_pop' : 'whoosh_fast',
      viralScore: c.viralScore,
      bestQuote: c.bestQuote,
      brollActive: i === 1,
      brollOverlay: c.suggestedBroll?.[0] || 'Chart Growth Surge',
    }));

    return {
      id: 'reel_master_1',
      title: 'Viral Highlights Reel',
      aspectRatio: '9:16',
      targetDuration: 30,
      vibe: 'viral_short',
      items,
      subtitleStyle: 'hormozi',
      showSafeZones: true,
      backgroundMusic: 'lofi_punch',
      musicVolume: 0.35,
      autoSilenceCut: true,
      punchZoomEnabled: true,
    };
  }, []);

  const [currentReel, setCurrentReel] = useState<HighlightReel>(initialReel);

  // Selected clip IDs in current reel
  const selectedClipIds = useMemo(() => {
    return currentReel.items.map((i) => i.clipId);
  }, [currentReel.items]);

  // Selected item object for Inspector
  const selectedItem = useMemo(() => {
    return currentReel.items.find((i) => i.id === selectedItemId) || null;
  }, [currentReel.items, selectedItemId]);

  // Select Footage Handler
  const handleSelectFootage = (footage: RawFootage) => {
    setActiveFootage(footage);
    setClips(footage.precalculatedClips || []);
    setCurrentTime(0);
    setIsPlaying(false);

    // Rebuild initial reel from this footage
    const topClips = footage.precalculatedClips || [];
    const newItems: ReelTimelineItem[] = topClips.slice(0, 3).map((c, i) => ({
      id: `reel_item_${c.id}_${Date.now()}`,
      clipId: c.id,
      originalFootageId: footage.id,
      title: c.hookTitle,
      startTime: c.startTime,
      endTime: c.endTime,
      duration: Math.min(12, Math.round(c.endTime - c.startTime)),
      transitionIn: i === 0 ? 'jump_cut' : (i === 1 ? 'whip_pan' : 'flash_white'),
      zoomScale: i === 0 ? 1.15 : 1.0,
      hookText: c.hookHeadline,
      soundEffect: i === 0 ? 'riser_pop' : 'whoosh_fast',
      viralScore: c.viralScore,
      bestQuote: c.bestQuote,
      brollActive: i === 1,
      brollOverlay: c.suggestedBroll?.[0] || 'Chart Growth Surge',
    }));

    setCurrentReel((prev) => ({
      ...prev,
      title: `${footage.title} - Highlight Reel`,
      items: newItems,
    }));
  };

  // Run AI Footage Analysis via server-side Gemini API
  const handleAnalyzeFootage = async () => {
    setIsAiAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-footage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeFootage.title,
          duration: activeFootage.duration,
          transcriptSnippets: activeFootage.transcript,
          videoContext: activeFootage.description,
          targetPlatform: currentReel.aspectRatio === '9:16' ? 'TikTok / Reels' : 'YouTube',
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data?.clips) {
        const generatedClips: AIClip[] = resData.data.clips.map((c: any, idx: number) => ({
          id: c.id || `gen_clip_${idx}_${Date.now()}`,
          footageId: activeFootage.id,
          startTime: c.startTime || 0,
          endTime: c.endTime || 20,
          viralScore: c.viralScore || 90,
          hookTitle: c.hookTitle || `Highlight #${idx + 1}`,
          hookHeadline: c.hookHeadline || 'WATCH THIS',
          category: c.category || 'Aha Moment',
          pacing: c.pacing || 'Fast-Paced',
          summary: c.summary || 'AI detected highlight moment.',
          bestQuote: c.bestQuote || '',
          captionSnippet: c.captionSnippet || [],
          suggestedBroll: c.suggestedBroll || [],
        }));

        setClips(generatedClips);
      }
    } catch (err) {
      console.warn('AI analysis failed or server unavailable:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Upload Custom Local Video File
  const handleUploadCustomFootage = (file: File) => {
    const videoUrl = URL.createObjectURL(file);
    // Create temporary video element to get real duration
    const tempVideo = document.createElement('video');
    tempVideo.src = videoUrl;
    tempVideo.onloadedmetadata = () => {
      const duration = Math.round(tempVideo.duration) || 120;
      const customFootage: RawFootage = {
        id: `upload_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: `Uploaded raw video footage: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
        duration: duration,
        videoUrl: videoUrl,
        thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
        resolution: `${tempVideo.videoWidth || 1920}x${tempVideo.videoHeight || 1080}`,
        fps: 30,
        category: 'User Upload',
        speakers: ['Speaker 1'],
        transcript: [
          { id: 'u1', start: 0, end: Math.min(15, duration), text: 'High energy opening moment in the raw footage.', highlight: true },
          { id: 'u2', start: Math.min(16, duration * 0.3), end: Math.min(35, duration * 0.5), text: 'Key insight and major takeaway explanation.', highlight: true },
          { id: 'u3', start: Math.min(36, duration * 0.6), end: Math.min(60, duration * 0.9), text: 'Powerful conclusion and final thoughts.', highlight: true },
        ],
      };

      setFootageList((prev) => [customFootage, ...prev]);
      setActiveFootage(customFootage);
      // Run AI clip detection on the new uploaded video!
      setTimeout(() => {
        handleAnalyzeFootage();
      }, 300);
    };
  };

  // Save Recorded Webcam/Screen Video
  const handleSaveRecordedVideo = (file: File, duration: number) => {
    const videoUrl = URL.createObjectURL(file);
    const recordedFootage: RawFootage = {
      id: `record_${Date.now()}`,
      title: `Live Recording (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      description: 'Recorded live directly in AutoReel Studio via browser capture.',
      duration: duration,
      videoUrl: videoUrl,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      resolution: '1280x720 30fps',
      fps: 30,
      category: 'Live Recording',
      speakers: ['Creator'],
      transcript: [
        { id: 'r1', start: 0, end: Math.min(8, duration), text: 'Live recorded video clip introduction.', highlight: true },
        { id: 'r2', start: Math.min(9, duration * 0.4), end: Math.min(22, duration * 0.8), text: 'Spoken demonstration and insights.', highlight: true },
      ],
    };

    setFootageList((prev) => [recordedFootage, ...prev]);
    setActiveFootage(recordedFootage);
    setTimeout(() => {
      handleAnalyzeFootage();
    }, 300);
  };

  // Toggle Clip Selection (Add / Remove from Reel)
  const handleToggleClipSelection = (clip: AIClip) => {
    const exists = currentReel.items.some((i) => i.clipId === clip.id);
    if (exists) {
      setCurrentReel((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.clipId !== clip.id),
      }));
    } else {
      const newItem: ReelTimelineItem = {
        id: `reel_item_${clip.id}_${Date.now()}`,
        clipId: clip.id,
        originalFootageId: activeFootage.id,
        title: clip.hookTitle,
        startTime: clip.startTime,
        endTime: clip.endTime,
        duration: Math.min(12, Math.round(clip.endTime - clip.startTime)),
        transitionIn: currentReel.items.length === 0 ? 'jump_cut' : 'whip_pan',
        zoomScale: 1.12,
        hookText: clip.hookHeadline,
        soundEffect: 'whoosh_fast',
        viralScore: clip.viralScore,
        bestQuote: clip.bestQuote,
        brollActive: false,
      };

      setCurrentReel((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
  };

  // Preview Clip
  const handlePreviewClip = (clip: AIClip) => {
    setPreviewMode('raw');
    setCurrentTime(clip.startTime);
    setIsPlaying(true);
  };

  // Add All Top Clips to Reel
  const handleAddAllToReel = () => {
    const topClips = [...clips].sort((a, b) => b.viralScore - a.viralScore).slice(0, 4);
    const newItems: ReelTimelineItem[] = topClips.map((c, i) => ({
      id: `reel_item_${c.id}_${Date.now()}_${i}`,
      clipId: c.id,
      originalFootageId: activeFootage.id,
      title: c.hookTitle,
      startTime: c.startTime,
      endTime: c.endTime,
      duration: Math.min(10, Math.round(c.endTime - c.startTime)),
      transitionIn: i === 0 ? 'jump_cut' : (i % 2 === 1 ? 'whip_pan' : 'flash_white'),
      zoomScale: i === 0 ? 1.15 : 1.0,
      hookText: c.hookHeadline,
      soundEffect: i === 0 ? 'riser_pop' : 'whoosh_fast',
      viralScore: c.viralScore,
      bestQuote: c.bestQuote,
      brollActive: i === 1,
      brollOverlay: c.suggestedBroll?.[0] || 'Chart Surge',
    }));

    setCurrentReel((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  // Generate Reel via AI Wizard
  const handleGenerateReel = async (config: {
    targetDuration: number;
    vibe: 'viral_short' | 'story_insight' | 'punchy_teaser' | 'cinematic';
    autoSilenceCut: boolean;
    autoPunchZoom: boolean;
    autoHookBanner: boolean;
    subtitleStyle: 'hormozi' | 'cyber' | 'minimal';
  }) => {
    setIsGeneratingReel(true);
    try {
      const response = await fetch('/api/ai/generate-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: activeFootage.title,
          availableClips: clips,
          targetDuration: config.targetDuration,
          vibe: config.vibe,
          autoSilenceCut: config.autoSilenceCut,
          autoPunchZoom: config.autoPunchZoom,
          subtitleStyle: config.subtitleStyle,
        }),
      });

      const res = await response.json();
      if (res.success && res.data?.timeline) {
        const generatedTimeline: ReelTimelineItem[] = res.data.timeline.map((item: any, idx: number) => ({
          id: `item_${idx}_${Date.now()}`,
          clipId: item.clipId || `clip_${idx}`,
          originalFootageId: activeFootage.id,
          title: item.clipTitle || `Highlight #${idx + 1}`,
          startTime: item.startTime || 0,
          endTime: item.endTime || 12,
          duration: item.trimDuration || 10,
          transitionIn: item.transitionIn || (idx === 0 ? 'jump_cut' : 'whip_pan'),
          zoomScale: config.autoPunchZoom ? (item.zoomScale || 1.15) : 1.0,
          hookText: config.autoHookBanner ? item.hookText : '',
          soundEffect: item.soundEffect || 'whoosh_fast',
          viralScore: item.viralScore || 94,
          bestQuote: item.bestQuote || '',
          brollActive: idx === 1,
          brollOverlay: item.brollOverlay,
        }));

        setCurrentReel((prev) => ({
          ...prev,
          title: res.data.reelTitle || `${activeFootage.title} (${config.targetDuration}s Viral Reel)`,
          targetDuration: config.targetDuration,
          vibe: config.vibe,
          subtitleStyle: config.subtitleStyle,
          punchZoomEnabled: config.autoPunchZoom,
          autoSilenceCut: config.autoSilenceCut,
          items: generatedTimeline,
        }));

        setPreviewMode('reel');
        setCurrentTime(0);
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('Reel generation error:', err);
    } finally {
      setIsGeneratingReel(false);
      setIsWizardOpen(false);
    }
  };

  // Timeline Item Operations
  const handleUpdateItemDuration = (itemId: string, newDuration: number) => {
    setCurrentReel((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              duration: newDuration,
              endTime: i.startTime + newDuration,
            }
          : i
      ),
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    setCurrentReel((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  };

  const handleMoveItem = (fromIndex: number, toIndex: number) => {
    setCurrentReel((prev) => {
      const items = [...prev.items];
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      return { ...prev, items };
    });
  };

  const handleSplitItem = (itemId: string, splitOffset: number) => {
    const itemIndex = currentReel.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;
    const target = currentReel.items[itemIndex];
    if (splitOffset <= 1 || splitOffset >= target.duration - 1) return;

    const firstHalf: ReelTimelineItem = {
      ...target,
      id: `${target.id}_part1_${Date.now()}`,
      duration: splitOffset,
      endTime: target.startTime + splitOffset,
    };

    const secondHalf: ReelTimelineItem = {
      ...target,
      id: `${target.id}_part2_${Date.now()}`,
      startTime: target.startTime + splitOffset,
      duration: target.duration - splitOffset,
      transitionIn: 'jump_cut',
      zoomScale: 1.15,
      hookText: undefined,
    };

    setCurrentReel((prev) => {
      const copy = [...prev.items];
      copy.splice(itemIndex, 1, firstHalf, secondHalf);
      return { ...prev, items: copy };
    });
  };

  const handleChangeTransition = (itemId: string, transition: TransitionType) => {
    setCurrentReel((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === itemId ? { ...i, transitionIn: transition } : i
      ),
    }));
  };

  // AI Prompt refinement in Inspector Sidebar
  const handleAiPromptInstruction = async (instruction: string) => {
    setIsAiProcessing(true);
    try {
      if (instruction.includes('20') || instruction.includes('shorten') || instruction.includes('punchy')) {
        // AI automatically trims duration down
        setCurrentReel((prev) => ({
          ...prev,
          targetDuration: 20,
          items: prev.items.slice(0, 2).map((item) => ({
            ...item,
            duration: Math.min(item.duration, 9),
            zoomScale: 1.15,
            transitionIn: 'jump_cut',
          })),
        }));
      } else if (instruction.includes('hook') || instruction.includes('CTR')) {
        setCurrentReel((prev) => ({
          ...prev,
          items: prev.items.map((item, idx) =>
            idx === 0
              ? { ...item, hookText: 'WAIT FOR THE END 🚨', zoomScale: 1.2 }
              : item
          ),
        }));
      } else {
        // Add zoom punch and refine pacing
        setCurrentReel((prev) => ({
          ...prev,
          punchZoomEnabled: true,
          items: prev.items.map((item) => ({
            ...item,
            transitionIn: 'flash_white',
          })),
        }));
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Export Project Helpers
  const handleExportEDL = () => {
    const edl = generateCMX3600EDL(currentReel, activeFootage);
    downloadTextFile(
      `${currentReel.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.edl`,
      edl
    );
  };

  const handleExportCapCut = () => {
    const json = generateCapCutJsonProject(currentReel, activeFootage);
    downloadTextFile(
      `${currentReel.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_capcut.json`,
      json,
      'application/json'
    );
  };

  // Keyboard Shortcuts (Space for play/pause, Left/Right for scrub)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - 5));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((t) => t + 5);
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedItemId) {
          handleDeleteItem(selectedItemId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans select-none">
      {/* Top Main Navigation Header */}
      <Header
        currentReel={currentReel}
        onUpdateAspectRatio={(ratio: AspectRatio) =>
          setCurrentReel((prev) => ({ ...prev, aspectRatio: ratio }))
        }
        onOpenReelWizard={() => setIsWizardOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onExportEDL={handleExportEDL}
        onExportCapCut={handleExportCapCut}
        previewMode={previewMode}
        onTogglePreviewMode={setPreviewMode}
        isAiAnalyzing={isAiAnalyzing}
      />

      {/* Raw Footage Bar */}
      <FootageSelector
        footageList={footageList}
        activeFootage={activeFootage}
        onSelectFootage={handleSelectFootage}
        onUploadCustomFootage={handleUploadCustomFootage}
        onOpenRecorder={() => setIsRecordOpen(true)}
        onAnalyzeFootage={handleAnalyzeFootage}
        isAnalyzing={isAiAnalyzing}
      />

      {/* Middle Stage: AI Clips Bin | Video Preview Player | Inspector Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: AI Clips Bin */}
        <div className="w-80 h-full flex-shrink-0">
          <AIClipsBin
            clips={clips}
            selectedClipIds={selectedClipIds}
            onToggleClipSelection={handleToggleClipSelection}
            onPreviewClip={handlePreviewClip}
            onAddAllToReel={handleAddAllToReel}
            isAnalyzing={isAiAnalyzing}
          />
        </div>

        {/* Center: Video Player */}
        <VideoPlayer
          currentReel={currentReel}
          activeFootage={activeFootage}
          currentTime={currentTime}
          onTimeUpdate={setCurrentTime}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSeek={setCurrentTime}
          previewMode={previewMode}
          selectedClipItem={selectedItem}
        />

        {/* Right: Inspector Sidebar */}
        <InspectorSidebar
          currentReel={currentReel}
          selectedItem={selectedItem}
          onUpdateSelectedItem={(updated) => {
            if (!selectedItemId) return;
            setCurrentReel((prev) => ({
              ...prev,
              items: prev.items.map((i) =>
                i.id === selectedItemId ? { ...i, ...updated } : i
              ),
            }));
          }}
          onUpdateReelSettings={(updated) => {
            setCurrentReel((prev) => ({ ...prev, ...updated }));
          }}
          onAiPromptInstruction={handleAiPromptInstruction}
          isAiProcessing={isAiProcessing}
        />
      </div>

      {/* Bottom Multi-Track Timeline */}
      <TimelineEditor
        currentReel={currentReel}
        currentTime={currentTime}
        onSeek={setCurrentTime}
        selectedItemId={selectedItemId}
        onSelectItem={(item) => setSelectedItemId(item.id)}
        onUpdateItemDuration={handleUpdateItemDuration}
        onDeleteItem={handleDeleteItem}
        onMoveItem={handleMoveItem}
        onSplitItem={handleSplitItem}
        onChangeTransition={handleChangeTransition}
        timelineZoom={timelineZoom}
        onChangeZoom={setTimelineZoom}
      />

      {/* Automated Reel Generator Wizard Modal */}
      <AutomatedReelWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onGenerateReel={handleGenerateReel}
        isGenerating={isGeneratingReel}
        videoTitle={activeFootage.title}
      />

      {/* Video Rendering & Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        currentReel={currentReel}
        activeFootage={activeFootage}
      />

      {/* Webcam & Screen Recorder Modal */}
      <RecordModal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        onSaveRecordedVideo={handleSaveRecordedVideo}
      />
    </div>
  );
}
