import React from 'react';
import { Phone, Video, QrCode, Settings, Sparkles, Flame, Moon, Sun } from 'lucide-react';
import { UserProfile, MoodType } from '../types';
import { MOOD_THEMES } from '../utils/mood';
import { playHaptic, playBubblePopSound, playSoftMeowSound } from '../utils/audio';

interface NavigationHeaderProps {
  partner: UserProfile;
  currentMood: MoodType;
  meowStreak: number;
  isPaired: boolean;
  onStartCall: (type: 'audio' | 'video') => void;
  onOpenMoodModal: () => void;
  onOpenInvite: () => void;
  onOpenSettings: () => void;
  onToggleDark?: () => void;
  isDark?: boolean;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  partner,
  currentMood,
  meowStreak,
  isPaired,
  onStartCall,
  onOpenMoodModal,
  onOpenInvite,
  onOpenSettings,
  onToggleDark,
  isDark,
}) => {
  const activeMood = MOOD_THEMES[currentMood];

  return (
    <header className="relative z-20 w-full px-4 pt-3 pb-3 border-b border-white/20 dark:border-white/5 backdrop-blur-xl bg-white/40 dark:bg-slate-900/60 shadow-sm transition-colors duration-700 select-none">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Partner Profile & Status */}
        <div className="flex items-center gap-3">
          {/* Avatar with Online Glow Ring */}
          <div className="relative cursor-pointer group" onClick={onOpenSettings}>
            <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-sky-400 via-pink-400 to-indigo-400 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner">
                {partner.avatar || '🐾'}
              </div>
            </div>

            {/* Online Indicator */}
            {partner.isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-sm" />
            )}
          </div>

          {/* Nickname, Streak & Status */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white truncate max-w-[130px]">
                {partner.nickname || partner.name}
              </h1>

              {/* Meow Streak Badge */}
              <div
                onClick={onOpenSettings}
                className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300 text-[10px] font-bold border border-amber-300/40 cursor-pointer hover:scale-105 transition-transform"
                title="Meow Snap Streak"
              >
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{meowStreak}</span>
              </div>
            </div>

            {/* Subtitle / Typing or Mood pill */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {partner.isTyping ? (
                <span className="text-[11px] font-semibold text-pink-500 animate-pulse flex items-center gap-1">
                  <span>typing</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-pink-500 rounded-full animate-bounce delay-100" />
                    <span className="w-1 h-1 bg-pink-500 rounded-full animate-bounce delay-200" />
                  </span>
                </span>
              ) : (
                <button
                  onClick={() => {
                    playHaptic('light');
                    onOpenMoodModal();
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <span>{activeMood.emoji}</span>
                  <span className="truncate max-w-[120px]">{activeMood.title}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls: Call & Camera & Settings */}
        <div className="flex items-center gap-1.5">
          {/* Audio Call */}
          <button
            onClick={() => {
              playHaptic('medium');
              onStartCall('audio');
            }}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800/80 transition-all active:scale-90"
            title="Start Audio Call"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => {
              playHaptic('medium');
              onStartCall('video');
            }}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-slate-800/80 transition-all active:scale-90"
            title="Start Video Call"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Secret QR Invite */}
          <button
            onClick={() => {
              playHaptic('light');
              onOpenInvite();
            }}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800/80 transition-all active:scale-90"
            title="1-on-1 Invite Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Quick Dark Mode Toggle */}
          {onToggleDark && (
            <button
              onClick={() => {
                playHaptic('medium');
                playBubblePopSound();
                onToggleDark();
              }}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-indigo-300 hover:bg-amber-50 dark:hover:bg-slate-800/80 transition-all active:scale-90"
              title={isDark ? 'Switch to Pastel Cloud (Light Mode)' : 'Switch to Velvet Night (Dark Mode)'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 animate-in spin-in-90 duration-300" />
              )}
            </button>
          )}

          {/* Settings */}
          <button
            onClick={() => {
              playHaptic('light');
              onOpenSettings();
            }}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            title="Settings & Customization"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
