import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Zap,
  Sparkles,
  Send,
  X,
  Clock,
  Smile,
  Type,
  PenTool,
  Check,
  Undo2,
  Trash2,
  Video,
} from 'lucide-react';
import { CAMERA_FILTERS, CUTE_STICKERS } from '../utils/filters';
import { CameraFilter, SnapPayload } from '../types';
import { playHaptic, playSoftMeowSound, playBubblePopSound } from '../utils/audio';

interface CameraViewProps {
  onSendSnap: (snap: SnapPayload) => void;
  onClose: () => void;
  partnerName: string;
  isDark?: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onSendSnap,
  onClose,
  partnerName,
  isDark,
}) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [selectedFilter, setSelectedFilter] = useState<CameraFilter>(CAMERA_FILTERS[1]); // Cat ears by default
  const [flashOn, setFlashOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Capture States
  const [capturedMedia, setCapturedMedia] = useState<{
    url: string;
    type: 'photo' | 'video';
  } | null>(null);

  // Post capture editing tools
  const [caption, setCaption] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#F472B6');
  const [placedStickers, setPlacedStickers] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  // Video recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<any>(null);

  // Initialize Camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      stopCamera();
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setHasPermission(true);
    } catch (err) {
      console.warn('Camera access error or unsupported in environment:', err);
      setCameraActive(false);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCameraFacing = () => {
    playHaptic('light');
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Take Snapshot Photo
  const takePhoto = () => {
    playHaptic('medium');
    playBubblePopSound();

    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedMedia({ url: dataUrl, type: 'photo' });
        return;
      }
    }

    // High-quality cozy fallback snapshot if hardware camera unavailable
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 640;
    fallbackCanvas.height = 960;
    const ctx = fallbackCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 640, 960);
      grad.addColorStop(0, '#A8D5E5');
      grad.addColorStop(0.5, '#FFD1DC');
      grad.addColorStop(1, '#C7D2FE');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 960);

      // Draw cute kitty emblem in center
      ctx.font = '80px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🐱', 320, 440);
      ctx.font = '28px sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('Cozy Meow Snap ✨', 320, 520);

      setCapturedMedia({ url: fallbackCanvas.toDataURL('image/jpeg', 0.9), type: 'photo' });
    }
  };

  // Video Recording Logic
  const startRecording = () => {
    if (!streamRef.current) return;
    playHaptic('heavy');
    setIsRecording(true);
    setRecordProgress(0);
    recordedChunksRef.current = [];

    try {
      const recorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(blob);
        setCapturedMedia({ url: videoUrl, type: 'video' });
      };

      recorder.start();

      const startTime = Date.now();
      const maxTime = 10000; // 10 seconds

      recordIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / maxTime) * 100);
        setRecordProgress(progress);

        if (elapsed >= maxTime) {
          stopRecording();
        }
      }, 50);
    } catch {
      // Fallback
    }
  };

  const stopRecording = () => {
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Drawing Canvas logic
  const isDrawingRef = useRef(false);
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    isDrawingRef.current = true;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDraw = () => {
    isDrawingRef.current = false;
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleAddSticker = (emoji: string) => {
    playHaptic('light');
    setPlacedStickers(prev => [
      ...prev,
      {
        id: `stk_${Date.now()}`,
        emoji,
        x: Math.floor(Math.random() * 50) + 25,
        y: Math.floor(Math.random() * 40) + 30,
      },
    ]);
    setShowStickerPicker(false);
  };

  // Send Snap to 1-on-1 partner
  const handleSend = () => {
    if (!capturedMedia) return;
    playSoftMeowSound();
    playHaptic('heavy');

    const snap: SnapPayload = {
      id: `snap_${Date.now()}`,
      mediaUrl: capturedMedia.url,
      mediaType: capturedMedia.type,
      caption: caption.trim() || undefined,
      filterId: selectedFilter.id,
      timerSeconds: timerSeconds,
      opened: false,
    };

    onSendSnap(snap);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col justify-between select-none overflow-hidden animate-in fade-in duration-300">
      {/* Hidden offscreen canvas for snapshot extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Screen Flash Overlay */}
      {flashOn && (
        <div className="absolute inset-0 bg-white/70 z-50 pointer-events-none transition-opacity duration-300" />
      )}

      {/* Main Viewport */}
      <div className="relative flex-1 w-full max-w-md mx-auto h-full flex flex-col justify-between overflow-hidden bg-slate-950">
        {/* Live Video Feed or Captured Preview */}
        {!capturedMedia ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center text-4xl mb-4 border border-slate-700 shadow-inner">
                  🐾
                </div>
                <h3 className="text-white font-semibold text-base mb-1">Cozy Camera Mode</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-4">
                  Tap the shutter to take an instant aesthetic snap for {partnerName}!
                </p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-full bg-sky-400/20 text-sky-300 text-xs font-medium border border-sky-400/30 hover:bg-sky-400/30 transition-all"
                >
                  Enable Webcam Feed
                </button>
              </div>
            )}

            {/* Real-time AR Filters on live feed */}
            {selectedFilter.id === 'cat_ears' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-start pt-16 animate-float-subtle">
                <div className="flex items-center gap-12 text-6xl drop-shadow-lg">
                  <span className="transform -rotate-12">🐱</span>
                </div>
                <div className="mt-8 flex items-center gap-6 text-xl text-pink-300 font-bold drop-shadow">
                  <span>///</span>
                  <span className="w-3 h-2 rounded-full bg-pink-400" />
                  <span>///</span>
                </div>
              </div>
            )}
            {selectedFilter.id === 'dream_glow' && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-pink-400/15 via-sky-300/15 to-purple-400/15 backdrop-blur-[0.5px]" />
            )}
            {selectedFilter.id === 'sparkles' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-around text-3xl opacity-75 animate-pulse">
                <span className="absolute top-24 left-8">✨</span>
                <span className="absolute top-40 right-10">💖</span>
                <span className="absolute bottom-40 left-12">🐾</span>
                <span className="absolute bottom-28 right-8">⭐</span>
              </div>
            )}
            {selectedFilter.id === 'vintage' && (
              <div className="absolute inset-0 pointer-events-none bg-amber-500/10 mix-blend-overlay">
                <span className="absolute bottom-24 right-6 font-mono text-amber-300 text-xs font-bold tracking-widest drop-shadow">
                  '26 09 01
                </span>
              </div>
            )}
            {selectedFilter.id === 'cyber' && (
              <div className="absolute inset-0 pointer-events-none border-2 border-cyan-400/30 shadow-[inset_0_0_24px_rgba(6,182,212,0.3)]" />
            )}
            {selectedFilter.id === 'noir' && (
              <div className="absolute inset-0 pointer-events-none backdrop-grayscale backdrop-contrast-125" />
            )}
          </div>
        ) : (
          /* Captured Preview Mode */
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            {capturedMedia.type === 'video' ? (
              <video
                src={capturedMedia.url}
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={capturedMedia.url}
                alt="Captured Snap"
                className="w-full h-full object-cover"
              />
            )}

            {/* Drawing Canvas Overlay */}
            <canvas
              ref={drawCanvasRef}
              width={400}
              height={700}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
              className={`absolute inset-0 w-full h-full ${isDrawing ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
            />

            {/* Placed Stickers */}
            {placedStickers.map(stk => (
              <div
                key={stk.id}
                className="absolute text-5xl cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                style={{ top: `${stk.y}%`, left: `${stk.x}%` }}
              >
                {stk.emoji}
              </div>
            ))}

            {/* User Caption Bar */}
            <div className="absolute bottom-24 inset-x-4 z-30">
              <div className="flex items-center px-4 py-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 shadow-xl">
                <input
                  type="text"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Add a sweet caption..."
                  maxLength={120}
                  className="w-full bg-transparent text-white placeholder-white/60 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Top Controls Overlay */}
        <div className="relative z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 via-black/20 to-transparent">
          <button
            onClick={() => {
              playHaptic('light');
              onClose();
            }}
            className="p-2 rounded-full bg-black/40 text-white/90 hover:text-white hover:bg-black/60 backdrop-blur-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Tools for Captured Snap or Live Camera */}
          {capturedMedia ? (
            <div className="flex items-center gap-2">
              {/* Timer button */}
              <div className="relative">
                <button
                  onClick={() => {
                    playHaptic('light');
                    setTimerSeconds(prev => (prev === 1 ? 3 : prev === 3 ? 5 : prev === 5 ? 10 : 1));
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/40 text-white text-xs font-semibold backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all"
                >
                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                  <span>{timerSeconds}s</span>
                </button>
              </div>

              {/* Drawing Tool */}
              <button
                onClick={() => {
                  playHaptic('light');
                  setIsDrawing(!isDrawing);
                }}
                className={`p-2 rounded-full backdrop-blur-md transition-all ${
                  isDrawing ? 'bg-pink-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                }`}
              >
                <PenTool className="w-4 h-4" />
              </button>

              {/* Sticker Tool */}
              <button
                onClick={() => {
                  playHaptic('light');
                  setShowStickerPicker(!showStickerPicker);
                }}
                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-all"
              >
                <Smile className="w-4 h-4 text-yellow-300" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Flash Screen toggle */}
              <button
                onClick={() => {
                  playHaptic('light');
                  setFlashOn(!flashOn);
                }}
                className={`p-2 rounded-full backdrop-blur-md transition-all ${
                  flashOn ? 'bg-yellow-400 text-slate-900 shadow-lg' : 'bg-black/40 text-white hover:bg-black/60'
                }`}
              >
                <Zap className="w-4 h-4" />
              </button>

              {/* Flip camera */}
              <button
                onClick={toggleCameraFacing}
                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Sticker Picker Drawer */}
        {showStickerPicker && (
          <div className="absolute top-16 inset-x-4 z-40 p-4 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/80">Select Cute Sticker</span>
              <button onClick={() => setShowStickerPicker(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {CUTE_STICKERS.map((stk, i) => (
                <button
                  key={i}
                  onClick={() => handleAddSticker(stk)}
                  className="text-2xl p-2 rounded-xl hover:bg-white/10 active:scale-90 transition-transform"
                >
                  {stk}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Shutter & Controls Section */}
        <div className="relative z-30 pb-8 pt-4 px-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center">
          {!capturedMedia ? (
            <>
              {/* Filter Selection Carousel */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar max-w-full px-2 py-1">
                {CAMERA_FILTERS.map(flt => (
                  <button
                    key={flt.id}
                    onClick={() => {
                      playHaptic('light');
                      setSelectedFilter(flt);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap backdrop-blur-md transition-all ${
                      selectedFilter.id === flt.id
                        ? 'bg-gradient-to-r from-sky-400 to-pink-400 text-white shadow-md scale-105'
                        : 'bg-black/40 text-white/80 hover:bg-black/60'
                    }`}
                  >
                    <span>{flt.icon}</span>
                    <span>{flt.name}</span>
                  </button>
                ))}
              </div>

              {/* Shutter Button (Tap for Photo / Hold for Video) */}
              <div className="relative flex items-center justify-center">
                {/* Outer Ring */}
                <div
                  className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                    isRecording ? 'border-rose-500 scale-110' : 'border-white/80 hover:border-white'
                  }`}
                >
                  {/* Circular Progress SVG for Video Recording */}
                  {isRecording && (
                    <svg className="absolute inset-0 w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="#F43F5E"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 36}
                        strokeDashoffset={2 * Math.PI * 36 * (1 - recordProgress / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                  )}

                  {/* Inner Shutter Core */}
                  <button
                    onClick={takePhoto}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={`w-14 h-14 rounded-full transition-all duration-200 shadow-lg ${
                      isRecording
                        ? 'bg-rose-500 scale-75 rounded-lg'
                        : 'bg-white hover:scale-95 active:scale-90'
                    }`}
                  />
                </div>
              </div>

              <p className="text-[11px] text-white/60 mt-3 font-medium tracking-wide">
                Tap for photo • Hold for video
              </p>
            </>
          ) : (
            /* Post Capture Action Bar */
            <div className="flex items-center justify-between w-full mt-2">
              <button
                onClick={() => {
                  playHaptic('light');
                  setCapturedMedia(null);
                  setPlacedStickers([]);
                  setCaption('');
                  clearDrawing();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md hover:bg-white/30 transition-all"
              >
                <Trash2 className="w-4 h-4" /> Retake
              </button>

              <button
                onClick={handleSend}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-sky-400 via-pink-400 to-rose-400 text-white font-semibold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <span>Send to {partnerName}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
