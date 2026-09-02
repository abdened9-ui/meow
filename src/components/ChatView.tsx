import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Mic,
  Send,
  Image as ImageIcon,
  Smile,
  Play,
  Pause,
  Clock,
  Heart,
  Sparkles,
  Flame,
  Check,
  CheckCheck,
  Eye,
  EyeOff,
  Volume2,
  Paperclip,
  X,
  RefreshCw,
} from 'lucide-react';
import { Message, UserProfile, MoodType, SnapPayload } from '../types';
import { MOOD_THEMES } from '../utils/mood';
import { CUTE_STICKERS } from '../utils/filters';
import { VoiceRecorder } from './VoiceRecorder';
import { playHaptic, playNotificationSound, playBubblePopSound, playSoftMeowSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ChatViewProps {
  messages: Message[];
  user: UserProfile;
  partner: UserProfile;
  currentMood: MoodType;
  customBg: string;
  isDark: boolean;
  onSendMessage: (text: string) => void;
  onSendVoice: (duration: number, waveforms: number[]) => void;
  onSendPhotoMedia: (url: string) => void;
  onOpenSnap: (snap: SnapPayload) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onOpenFullCamera: () => void;
  onSendQuickMeow: () => void;
  onSimulatePartnerAction?: (actionType: 'snap' | 'text' | 'voice' | 'call') => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  user,
  partner,
  currentMood,
  customBg,
  isDark,
  onSendMessage,
  onSendVoice,
  onSendPhotoMedia,
  onOpenSnap,
  onReactToMessage,
  onOpenFullCamera,
  onSendQuickMeow,
  onSimulatePartnerAction,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showStickerDrawer, setShowStickerDrawer] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState<Record<string, number>>({});
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const voiceIntervalRef = useRef<any>(null);

  const moodTheme = MOOD_THEMES[currentMood];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partner.isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    playHaptic('light');
    playBubblePopSound();
    onSendMessage(inputText.trim());
    setInputText('');
    setShowStickerDrawer(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onSendPhotoMedia(result);
        playBubblePopSound();
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleVoicePlayback = (msgId: string, totalSecs: number) => {
    playHaptic('light');

    if (playingVoiceId === msgId) {
      // Pause
      setPlayingVoiceId(null);
      if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);
    } else {
      // Play
      if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);
      setPlayingVoiceId(msgId);
      setVoiceProgress(prev => ({ ...prev, [msgId]: 0 }));

      const intervalStep = 100;
      let currentMs = 0;
      const totalMs = totalSecs * 1000;

      voiceIntervalRef.current = setInterval(() => {
        currentMs += intervalStep;
        const progress = Math.min(100, (currentMs / totalMs) * 100);
        setVoiceProgress(prev => ({ ...prev, [msgId]: progress }));

        if (currentMs >= totalMs) {
          clearInterval(voiceIntervalRef.current);
          setPlayingVoiceId(null);
        }
      }, intervalStep);
    }
  };

  const handleReaction = (msgId: string, emoji: string) => {
    playHaptic('medium');
    playBubblePopSound();
    onReactToMessage(msgId, emoji);

    try {
      confetti({
        particleCount: 15,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#F472B6', '#7EC8E3', '#FDE047'],
      });
    } catch {
      // fallback
    }
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
      {/* Dynamic Background Atmosphere */}
      <div
        className="absolute inset-0 transition-all duration-1000 pointer-events-none"
        style={{
          background: customBg.startsWith('url') || customBg.startsWith('linear') || customBg.startsWith('radial')
            ? customBg
            : undefined,
        }}
      />

      {/* Hidden File Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Messages Scroll Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        {/* Intimate Intro Banner */}
        <div className="text-center py-3 my-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/20 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-sm">
            <span>🔒</span>
            <span>Private 1-on-1 space for you & {partner.nickname}</span>
          </div>
        </div>

        {/* Message Item Loop */}
        {messages.map((msg, index) => {
          const isMe = msg.senderId === 'user';
          const isSnap = msg.type === 'snap' && msg.snapData;
          const isVoice = msg.type === 'voice' && msg.voiceData;
          const isPhoto = msg.type === 'photo';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-in fade-in duration-200`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div className={`relative max-w-[82%] sm:max-w-[70%]`}>
                
                {/* 1. Disappearing Snap Box */}
                {isSnap && msg.snapData && (
                  <div
                    onClick={() => {
                      if (!msg.snapData?.opened) {
                        onOpenSnap(msg.snapData);
                      }
                    }}
                    className={`cursor-pointer p-3.5 rounded-3xl backdrop-blur-xl border transition-all shadow-md active:scale-98 ${
                      msg.snapData.opened
                        ? 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/40 text-slate-400 dark:text-slate-500'
                        : isMe
                        ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white border-pink-300 shadow-pink-500/20'
                        : 'bg-gradient-to-r from-sky-400 via-pink-400 to-indigo-400 text-white border-sky-300 shadow-sky-500/20 animate-pulse'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Snap Icon Box */}
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                        msg.snapData.opened
                          ? 'border-2 border-slate-300 dark:border-slate-600'
                          : 'bg-white text-slate-800 shadow-md'
                      }`}>
                        {msg.snapData.opened ? '💨' : '📸'}
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold truncate">
                            {msg.snapData.opened ? 'Disappeared Snap' : 'Private Snap (Vanishes)'}
                          </p>
                          {!msg.snapData.opened && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-bold">
                              {msg.snapData.timerSeconds}s
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          {msg.snapData.opened ? 'Opened • Vanished forever' : 'Tap to open and view'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Voice Note Bubble */}
                {isVoice && msg.voiceData && (
                  <div
                    className={`p-3.5 rounded-3xl backdrop-blur-xl border shadow-md ${
                      isMe ? moodTheme.bubbleSelf : moodTheme.bubblePartner
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => toggleVoicePlayback(msg.id, msg.voiceData?.duration || 5)}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md active:scale-90 transition-transform ${
                          isMe ? 'bg-white/30 text-white' : 'bg-gradient-to-tr from-sky-400 to-pink-400 text-white'
                        }`}
                      >
                        {playingVoiceId === msg.id ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Waveform Visualization */}
                      <div className="flex-1 min-w-[120px]">
                        <div className="flex items-center gap-1 h-6">
                          {(msg.voiceData.waveformData || [30, 50, 80, 40, 60, 90, 45, 30]).map((h, wi) => {
                            const prog = voiceProgress[msg.id] || 0;
                            const barProgress = (wi / msg.voiceData!.waveformData.length) * 100;
                            const isFilled = prog >= barProgress;

                            return (
                              <div
                                key={wi}
                                className={`w-1 rounded-full transition-all duration-150 ${
                                  isFilled ? 'bg-pink-400 scale-y-110' : isMe ? 'bg-white/50' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                                style={{ height: `${Math.max(6, (h / 100) * 22)}px` }}
                              />
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between text-[10px] opacity-75 mt-1 font-semibold">
                          <span>0:0{msg.voiceData.duration}</span>
                          <span>Voice Note</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Photo Media Bubble */}
                {isPhoto && msg.mediaUrl && (
                  <div className="rounded-3xl overflow-hidden border border-white/30 shadow-lg max-h-72">
                    <img
                      src={msg.mediaUrl}
                      alt="Shared media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 4. Text Message Bubble */}
                {msg.type === 'text' && (
                  <div
                    className={`px-4 py-2.5 rounded-3xl text-sm leading-relaxed backdrop-blur-xl border shadow-sm break-words ${
                      isMe
                        ? `${moodTheme.bubbleSelf} rounded-br-sm`
                        : `${moodTheme.bubblePartner} rounded-bl-sm`
                    }`}
                  >
                    {msg.content}
                  </div>
                )}

                {/* Quick Emoji Reaction Pill on Bubble */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className={`absolute -bottom-2.5 ${isMe ? 'right-2' : 'left-2'} flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 text-xs animate-in zoom-in-75`}>
                    {Object.values(msg.reactions).map((emoji, ri) => (
                      <span key={ri}>{emoji}</span>
                    ))}
                  </div>
                )}

                {/* Hover Reaction Bar */}
                {hoveredMessageId === msg.id && (
                  <div className={`absolute -top-7 ${isMe ? 'right-0' : 'left-0'} flex items-center gap-1 p-1 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-lg border border-slate-200/60 dark:border-slate-700 backdrop-blur-md z-20 animate-in fade-in slide-in-from-bottom-2`}>
                    {['❤️', '😻', '🥺', '✨', '🐾'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(msg.id, emoji)}
                        className="p-1 hover:scale-125 transition-transform text-xs"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp & Status Receipt */}
              <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1 font-medium`}>
                <span>{formatTimestamp(msg.timestamp)}</span>
                {isMe && (
                  <span>
                    {msg.status === 'read' ? (
                      <CheckCheck className="w-3 h-3 text-sky-500 inline" />
                    ) : (
                      <Check className="w-3 h-3 text-slate-400 inline" />
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Partner Typing Paw Dots */}
        {partner.isTyping && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-pink-400 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xs">
                🐾
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-200" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticker Drawer */}
      {showStickerDrawer && (
        <div className="relative z-20 mx-4 mb-2 p-3 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-sky-200/60 dark:border-slate-700 shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Cute Cat & Cozy Stickers
            </span>
            <button
              onClick={() => setShowStickerDrawer(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {CUTE_STICKERS.map((stk, i) => (
              <button
                key={i}
                onClick={() => {
                  playHaptic('light');
                  playBubblePopSound();
                  onSendMessage(stk);
                  setShowStickerDrawer(false);
                }}
                className="text-2xl p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 active:scale-95 transition-transform"
              >
                {stk}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Solo Tester / Simulate Partner Action Bar (Optional Quick Toggle) */}
      {onSimulatePartnerAction && (
        <div className="relative z-20 flex items-center justify-center gap-2 py-1 px-4 bg-slate-900/5 dark:bg-white/5 backdrop-blur-sm border-t border-white/10 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Quick Test Partner:</span>
          <button
            onClick={() => onSimulatePartnerAction('snap')}
            className="px-2 py-0.5 rounded-full bg-pink-500/15 hover:bg-pink-500/25 text-pink-600 dark:text-pink-300 font-medium transition-colors"
          >
            + Receive Snap
          </button>
          <button
            onClick={() => onSimulatePartnerAction('voice')}
            className="px-2 py-0.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-300 font-medium transition-colors"
          >
            + Voice Note
          </button>
          <button
            onClick={() => onSimulatePartnerAction('call')}
            className="px-2 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 font-medium transition-colors"
          >
            + Incoming Call
          </button>
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="relative z-20 p-3 bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border-t border-white/20 dark:border-white/5">
        {isRecordingVoice ? (
          <VoiceRecorder
            onSendVoice={(duration, waveforms) => {
              setIsRecordingVoice(false);
              onSendVoice(duration, waveforms);
            }}
            onCancel={() => setIsRecordingVoice(false)}
            isDark={isDark}
          />
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-md mx-auto">
            {/* Camera Trigger */}
            <button
              type="button"
              onClick={() => {
                playHaptic('light');
                onOpenFullCamera();
              }}
              className="p-2.5 rounded-full bg-gradient-to-tr from-sky-400 to-pink-400 text-white shadow-md hover:scale-105 active:scale-95 transition-transform shrink-0"
              title="Camera Snap"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Input Capsule */}
            <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-sky-200/60 dark:border-slate-700/60 shadow-inner">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Message ${partner.nickname}...`}
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
              />

              {/* Media File button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-400 hover:text-sky-500 transition-colors"
                title="Send Photo"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Sticker button */}
              <button
                type="button"
                onClick={() => {
                  playHaptic('light');
                  setShowStickerDrawer(!showStickerDrawer);
                }}
                className="text-slate-400 hover:text-yellow-500 transition-colors"
                title="Stickers & Emojis"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            {/* Send or Voice Record / Quick Meow */}
            {inputText.trim() ? (
              <button
                type="submit"
                className="p-2.5 rounded-full bg-gradient-to-r from-sky-400 to-pink-400 text-white shadow-md hover:scale-105 active:scale-95 transition-transform shrink-0"
                title="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center gap-1 shrink-0">
                {/* Voice Note Button */}
                <button
                  type="button"
                  onClick={() => {
                    playHaptic('medium');
                    setIsRecordingVoice(true);
                  }}
                  className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all active:scale-90"
                  title="Record Voice Note"
                >
                  <Mic className="w-5 h-5" />
                </button>

                {/* Cute Quick Meow Chime Alert */}
                <button
                  type="button"
                  onClick={() => {
                    playHaptic('heavy');
                    onSendQuickMeow();
                  }}
                  className="p-2.5 rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-all active:scale-90 shadow-sm"
                  title="Send Soft Meow! 🐱"
                >
                  <span className="text-base leading-none">🐾</span>
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
