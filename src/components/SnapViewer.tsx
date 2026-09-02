import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Clock, EyeOff } from 'lucide-react';
import { SnapPayload } from '../types';
import { playVanishPoofSound, playHaptic } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SnapViewerProps {
  snap: SnapPayload;
  senderName: string;
  onClose: () => void;
  onVanish: () => void;
}

export const SnapViewer: React.FC<SnapViewerProps> = ({
  snap,
  senderName,
  onClose,
  onVanish,
}) => {
  const [timeLeft, setTimeLeft] = useState(snap.timerSeconds > 0 ? snap.timerSeconds : 10);
  const [isVanishing, setIsVanishing] = useState(false);
  const totalTime = snap.timerSeconds > 0 ? snap.timerSeconds : 10;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    playHaptic('medium');

    const startTime = Date.now();
    const interval = 50; // smooth 20fps countdown

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, totalTime - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        triggerVanish();
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalTime]);

  const triggerVanish = () => {
    if (isVanishing) return;
    setIsVanishing(true);
    playVanishPoofSound();

    // Trigger cute star/sparkle burst
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#A8D5E5', '#F472B6', '#FDE047', '#C4B5FD'],
      });
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      onVanish();
      onClose();
    }, 900);
  };

  const progressPercent = (timeLeft / totalTime) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none animate-in fade-in duration-300">
      {/* Background Media Container */}
      <div className={`relative w-full max-w-md h-full max-h-[92vh] mx-auto rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-700 ${
        isVanishing ? 'scale-90 opacity-0 filter blur-xl rotate-1' : 'scale-100 opacity-100'
      }`}>
        {/* The Media */}
        {snap.mediaType === 'video' ? (
          <video
            src={snap.mediaUrl}
            autoPlay
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={snap.mediaUrl}
            alt="Private Snap"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Filter Overlay Effects */}
        {snap.filterId === 'cat_ears' && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-start pt-16">
            <div className="text-6xl animate-bounce">🐱</div>
          </div>
        )}
        {snap.filterId === 'dream_glow' && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-pink-400/20 via-sky-300/20 to-purple-400/20 backdrop-blur-[0.5px]" />
        )}
        {snap.filterId === 'vintage' && (
          <div className="absolute inset-0 pointer-events-none bg-amber-500/10 mix-blend-overlay">
            <span className="absolute bottom-16 right-6 font-mono text-amber-300 text-xs font-bold tracking-widest drop-shadow">
              '26 09 01
            </span>
          </div>
        )}
        {snap.filterId === 'cyber' && (
          <div className="absolute inset-0 pointer-events-none border-2 border-cyan-400/40 shadow-[inset_0_0_20px_rgba(6,182,212,0.3)]" />
        )}
        {snap.filterId === 'noir' && (
          <div className="absolute inset-0 pointer-events-none backdrop-grayscale backdrop-contrast-125" />
        )}

        {/* Top Header Bar with Timer Ring & Close */}
        <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 via-black/20 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-lg border border-white/30 shadow">
              🐾
            </div>
            <div>
              <p className="text-white text-sm font-semibold tracking-wide drop-shadow">
                {senderName}
              </p>
              <span className="text-xs text-white/75 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Disappearing Snap
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Circular Progress Ring */}
            <div className="relative flex items-center justify-center w-8 h-8">
              <svg className="w-8 h-8 transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-white/20"
                  fill="transparent"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-pink-400 transition-all duration-75"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 13}
                  strokeDashoffset={2 * Math.PI * 13 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-white">
                {Math.ceil(timeLeft)}
              </span>
            </div>

            <button
              onClick={triggerVanish}
              className="p-1.5 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 backdrop-blur-md transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Caption Overlay */}
        {snap.caption && (
          <div className="relative z-20 mx-4 mb-12 p-3 rounded-2xl bg-black/55 backdrop-blur-md border border-white/20 text-center shadow-lg">
            <p className="text-white text-sm font-medium leading-relaxed drop-shadow">
              {snap.caption}
            </p>
          </div>
        )}

        {/* Vanish Overlay State */}
        {isVanishing && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md text-white animate-in zoom-in-90 duration-300">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-400 to-sky-400 flex items-center justify-center text-3xl shadow-xl animate-bounce mb-3">
              💨
            </div>
            <h3 className="text-lg font-bold tracking-tight">Poof! Vanished</h3>
            <p className="text-xs text-white/80 mt-1">This snap disappeared forever</p>
          </div>
        )}
      </div>
    </div>
  );
};
