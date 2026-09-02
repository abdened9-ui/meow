import React, { useEffect } from 'react';
import { Sparkles, MessageCircle, Phone, Clock, Volume2, X } from 'lucide-react';
import { Message, UserProfile, SnapPayload } from '../types';
import { playHaptic } from '../utils/audio';

interface NotificationToastProps {
  notification: {
    id: string;
    title: string;
    body: string;
    type: 'message' | 'snap' | 'call' | 'meow';
    avatar: string;
    snapData?: SnapPayload;
  } | null;
  onDismiss: () => void;
  onClick: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onClick,
}) => {
  useEffect(() => {
    if (!notification) return;
    playHaptic('medium');

    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);

    return () => clearTimeout(timer);
  }, [notification]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 inset-x-4 z-50 flex justify-center pointer-events-none select-none animate-in slide-in-from-top-4 duration-300">
      <div
        onClick={() => {
          playHaptic('light');
          onClick();
          onDismiss();
        }}
        className="pointer-events-auto flex items-center justify-between w-full max-w-sm p-3.5 rounded-3xl bg-slate-900/90 dark:bg-slate-950/95 text-white backdrop-blur-2xl border border-white/20 shadow-2xl hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar / Icon Badge */}
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-pink-400 to-indigo-400 p-0.5 shadow-md">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-xl">
                {notification.avatar || '🐾'}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[10px] flex items-center justify-center font-bold">
              🐱
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white truncate">
                {notification.title}
              </h4>
              <span className="text-[10px] text-pink-300 font-semibold">• Meow!</span>
            </div>
            <p className="text-xs text-slate-300 truncate mt-0.5 font-medium">
              {notification.body}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
