import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Send, Check } from 'lucide-react';
import { playHaptic, playBubblePopSound } from '../utils/audio';

interface VoiceRecorderProps {
  onSendVoice: (duration: number, waveformData: number[]) => void;
  onCancel: () => void;
  isDark?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendVoice, onCancel, isDark }) => {
  const [seconds, setSeconds] = useState(0);
  const [waveforms, setWaveforms] = useState<number[]>([30, 45, 60, 40, 75, 50, 85, 60, 40]);
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<any>(null);
  const waveIntervalRef = useRef<any>(null);

  useEffect(() => {
    playHaptic('medium');
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    waveIntervalRef.current = setInterval(() => {
      setWaveforms(prev => {
        const nextVal = Math.floor(Math.random() * 70) + 20;
        return [...prev.slice(1), nextVal];
      });
    }, 120);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSend = () => {
    playBubblePopSound();
    onSendVoice(Math.max(seconds, 1), waveforms);
  };

  return (
    <div className={`flex items-center justify-between w-full px-4 py-2.5 rounded-full ${
      isDark ? 'bg-slate-800/90 border border-slate-700/60' : 'bg-white/90 border border-sky-200/60'
    } shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in zoom-in-95`}>
      {/* Recording Indicator & Timer */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute opacity-75" />
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
        </div>
        <span className="text-xs font-semibold text-rose-500 tracking-wider">
          {formatTime(seconds)}
        </span>
      </div>

      {/* Dynamic Animated Soundwave */}
      <div className="flex items-center gap-1 h-7 px-2">
        {waveforms.map((height, i) => (
          <div
            key={i}
            className="w-1 bg-gradient-to-t from-sky-400 to-pink-400 rounded-full transition-all duration-100"
            style={{ height: `${Math.max(6, (height / 100) * 24)}px` }}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            playHaptic('light');
            onCancel();
          }}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full transition-colors"
          title="Cancel"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleSend}
          className="p-2.5 bg-gradient-to-r from-sky-400 to-pink-400 text-white rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
          title="Send Voice Note"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
