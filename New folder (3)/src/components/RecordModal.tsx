import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  X,
  Camera,
  Monitor,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecordedVideo: (file: File, duration: number) => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  onSaveRecordedVideo,
}) => {
  const [sourceType, setSourceType] = useState<'camera' | 'screen'>('camera');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      startCameraStream();
    } else {
      stopAllStreams();
    }
    return () => {
      stopAllStreams();
    };
  }, [isOpen, sourceType]);

  const startCameraStream = async () => {
    stopAllStreams();
    try {
      let stream: MediaStream;
      if (sourceType === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      }
      setPreviewStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Could not access media device:', err);
    }
  };

  const stopAllStreams = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
      setPreviewStream(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startRecording = () => {
    if (!previewStream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(previewStream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };
    recorder.start(100);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordingSeconds(0);

    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleImportToStudio = () => {
    if (!recordedBlob) return;
    const file = new File([recordedBlob], `raw_recording_${Date.now()}.webm`, {
      type: 'video/webm',
    });
    onSaveRecordedVideo(file, Math.max(recordingSeconds, 10));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Record Raw Video Footage</h2>
              <p className="text-[11px] text-neutral-400">Record live from camera or screen for instant AI clipping</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport & Controls */}
        <div className="p-4 space-y-4">
          {/* Source Toggle */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setSourceType('camera')}
              disabled={isRecording}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sourceType === 'camera'
                  ? 'bg-violet-600 text-white'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Webcam / Mic</span>
            </button>

            <button
              onClick={() => setSourceType('screen')}
              disabled={isRecording}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sourceType === 'screen'
                  ? 'bg-violet-600 text-white'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Screen Share</span>
            </button>
          </div>

          {/* Live Video Preview Box */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-neutral-800 flex items-center justify-center">
            <video
              ref={videoPreviewRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Recording badge */}
            {isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-600 text-white font-mono text-xs font-bold shadow-lg animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>REC {recordingSeconds}s</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {!isRecording && !recordedBlob ? (
              <button
                onClick={startRecording}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 flex items-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            ) : isRecording ? (
              <button
                onClick={stopRecording}
                className="px-6 py-2.5 rounded-xl bg-neutral-200 hover:bg-white text-black font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-black" />
                <span>Stop Recording ({recordingSeconds}s)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setRecordedBlob(null);
                    startCameraStream();
                  }}
                  className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-record</span>
                </button>

                <button
                  onClick={handleImportToStudio}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Import & Run AI Highlight Detection</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
