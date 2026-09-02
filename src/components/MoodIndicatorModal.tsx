import React from 'react';
import { Sparkles, Heart, Moon, Zap, CloudRain, X } from 'lucide-react';
import { MoodType, MoodTheme } from '../types';
import { MOOD_THEMES } from '../utils/mood';
import { playHaptic, playBubblePopSound } from '../utils/audio';

interface MoodIndicatorModalProps {
  currentMood: MoodType;
  onSelectMoodOverride: (mood: MoodType) => void;
  onClose: () => void;
  isDark?: boolean;
}

export const MoodIndicatorModal: React.FC<MoodIndicatorModalProps> = ({
  currentMood,
  onSelectMoodOverride,
  onClose,
  isDark,
}) => {
  const activeTheme = MOOD_THEMES[currentMood];

  const moodList: { id: MoodType; icon: any; title: string; desc: string; colors: string }[] = [
    {
      id: 'happy_love',
      icon: Heart,
      title: 'Happy / Love / Cute',
      desc: 'Soft pinks & warm blush blues. Detected from ❤️, 🥰, 🌸, kisses & sweet words.',
      colors: 'from-pink-300 to-sky-300',
    },
    {
      id: 'calm_chill',
      icon: Moon,
      title: 'Calm / Serene / Chill',
      desc: 'Deep soft blues & cozy lavenders. Detected from 🌙, 🍵, ☁️, relax & peace.',
      colors: 'from-indigo-300 to-sky-300',
    },
    {
      id: 'excited_funny',
      icon: Zap,
      title: 'Excited / Funny / Playful',
      desc: 'Bright cyan & sunny mint. Detected from 😂, ⚡, 🎉, laughs & high energy.',
      colors: 'from-teal-300 to-cyan-300',
    },
    {
      id: 'sad_soft',
      icon: CloudRain,
      title: 'Sad / Soft / Comforting',
      desc: 'Muted pastel blues & comforting grays. Detected from 😿, 🌧️, 🫂 & gentle hugs.',
      colors: 'from-slate-300 to-slate-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-900 border border-slate-700/60 text-white' : 'bg-white/95 border border-sky-200/80 text-slate-800'
      }`}>
        <button
          onClick={() => {
            playHaptic('light');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{activeTheme.emoji}</span>
          <div>
            <h3 className="text-base font-bold tracking-tight">
              Conversation Mood Flow
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live emotion & sentiment adaptive palette
            </p>
          </div>
        </div>

        {/* Current Active Mood Card */}
        <div className={`mt-4 p-4 rounded-2xl bg-gradient-to-r ${activeTheme.gradientLight} dark:${activeTheme.gradientDark} shadow-md border border-white/40 dark:border-white/10 mb-4`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-white/90">
              Active Atmosphere
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/40 font-semibold">
              Live Tuned
            </span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
            {activeTheme.title}
          </p>
          <p className="text-xs text-slate-700/90 dark:text-white/80 mt-0.5">
            {activeTheme.description}
          </p>
        </div>

        {/* Available Mood Presets & Overrides */}
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Mood Presets (Auto-Detected from Chat)
        </p>

        <div className="space-y-2">
          {moodList.map(item => {
            const isSelected = currentMood === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  playHaptic('light');
                  playBubblePopSound();
                  onSelectMoodOverride(item.id);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-pink-400/80 bg-pink-50/70 dark:bg-pink-950/30 shadow-sm ring-1 ring-pink-400/40'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.colors} flex items-center justify-center text-white shadow-sm shrink-0`}>
                  <Icon className="w-4 h-4 text-slate-800" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.title}
                    </h4>
                    {isSelected && (
                      <span className="text-[10px] text-pink-500 font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
