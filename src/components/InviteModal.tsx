import React, { useState } from 'react';
import { QrCode, Copy, Check, Lock, ShieldCheck, Heart, Sparkles, ExternalLink, X } from 'lucide-react';
import { playHaptic, playBubblePopSound, playSoftMeowSound } from '../utils/audio';

interface InviteModalProps {
  roomId: string;
  isPaired: boolean;
  onJoinRoom: (customRoomId: string) => void;
  onClose: () => void;
  isDark?: boolean;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  roomId,
  isPaired,
  onJoinRoom,
  onClose,
  isDark,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?room=${roomId}`
    : `https://meow.app/invite?room=${roomId}`;

  const handleCopyLink = () => {
    playHaptic('medium');
    playSoftMeowSound();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleManualJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      playHaptic('medium');
      onJoinRoom(inputCode.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-900 border border-slate-700/60 text-white' : 'bg-white/95 border border-sky-200/80 text-slate-800'
      }`}>
        {/* Close Button */}
        <button
          onClick={() => {
            playHaptic('light');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-pink-300 to-indigo-400 p-0.5 shadow-md mb-2.5">
            <div className={`w-full h-full rounded-[14px] flex items-center justify-center text-2xl ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}>
              🐱
            </div>
          </div>
          <h3 className="text-lg font-bold tracking-tight">
            Secret 1-on-1 Space
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs mx-auto">
            Exclusive connection between only two people. No public search or groups.
          </p>
        </div>

        {/* QR Code Graphic (SVG) */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-sky-50 to-pink-50 dark:from-slate-800 dark:to-slate-800/60 border border-sky-100 dark:border-slate-700 mb-4 shadow-inner">
          <div className="p-3 bg-white rounded-xl shadow-md">
            {/* Adorable custom SVG QR Code with central Cat Emblem */}
            <svg viewBox="0 0 100 100" className="w-36 h-36">
              {/* Outer Alignment Marks */}
              <rect x="5" y="5" width="25" height="25" fill="#334155" rx="4" />
              <rect x="8" y="8" width="19" height="19" fill="#FFFFFF" rx="2" />
              <rect x="12" y="12" width="11" height="11" fill="#7EC8E3" rx="2" />

              <rect x="70" y="5" width="25" height="25" fill="#334155" rx="4" />
              <rect x="73" y="8" width="19" height="19" fill="#FFFFFF" rx="2" />
              <rect x="77" y="12" width="11" height="11" fill="#7EC8E3" rx="2" />

              <rect x="5" y="70" width="25" height="25" fill="#334155" rx="4" />
              <rect x="8" y="73" width="19" height="19" fill="#FFFFFF" rx="2" />
              <rect x="12" y="77" width="11" height="11" fill="#7EC8E3" rx="2" />

              {/* Data Blocks Pattern */}
              <rect x="35" y="8" width="6" height="6" fill="#F472B6" rx="1" />
              <rect x="45" y="12" width="6" height="6" fill="#334155" rx="1" />
              <rect x="55" y="8" width="6" height="6" fill="#7EC8E3" rx="1" />
              <rect x="35" y="22" width="6" height="6" fill="#334155" rx="1" />
              <rect x="55" y="22" width="6" height="6" fill="#F472B6" rx="1" />

              <rect x="10" y="35" width="6" height="6" fill="#334155" rx="1" />
              <rect x="20" y="45" width="6" height="6" fill="#7EC8E3" rx="1" />
              <rect x="75" y="35" width="6" height="6" fill="#F472B6" rx="1" />
              <rect x="85" y="45" width="6" height="6" fill="#334155" rx="1" />

              <rect x="35" y="75" width="6" height="6" fill="#7EC8E3" rx="1" />
              <rect x="45" y="85" width="6" height="6" fill="#F472B6" rx="1" />
              <rect x="55" y="75" width="6" height="6" fill="#334155" rx="1" />
              <rect x="75" y="75" width="6" height="6" fill="#334155" rx="1" />
              <rect x="85" y="85" width="6" height="6" fill="#7EC8E3" rx="1" />

              {/* Center Cat Badge */}
              <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
              <circle cx="50" cy="50" r="12" fill="#A8D5E5" />
              <text x="50" y="55" fontSize="12" textAnchor="middle">🐾</text>
            </svg>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 text-sky-600 dark:text-sky-300">
              ROOM: {roomId.slice(0, 8).toUpperCase()}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isPaired ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isPaired ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              {isPaired ? 'Paired 💖' : 'Waiting...'}
            </span>
          </div>
        </div>

        {/* Copy Invite Link Button */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-400 via-pink-400 to-indigo-400 text-white font-semibold text-xs shadow-lg hover:opacity-95 active:scale-98 transition-all mb-2.5"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Private Invite Link Copied! ✨' : 'Copy Private Invite Link'}</span>
        </button>

        {/* Switch / Join Existing Room Drawer */}
        {!showJoinInput ? (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <button
              onClick={() => setShowJoinInput(true)}
              className="hover:text-sky-500 dark:hover:text-sky-400 underline font-medium"
            >
              Have a secret code? Join room
            </button>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-End Private
            </span>
          </div>
        ) : (
          <form onSubmit={handleManualJoin} className="mt-2 space-y-2 animate-in fade-in">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                placeholder="Enter secret room ID..."
                className={`flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors"
              >
                Join
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
