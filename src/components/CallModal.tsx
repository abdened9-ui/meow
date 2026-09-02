import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  RefreshCw,
  Heart,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { ActiveCall, UserProfile } from '../types';
import { playHaptic, startCallingRingtone, stopCallingRingtone, playBubblePopSound, playSoftMeowSound } from '../utils/audio';

interface CallModalProps {
  call: ActiveCall;
  partner: UserProfile;
  user: UserProfile;
  onAccept: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  call,
  partner,
  user,
  onAccept,
  onEndCall,
  onToggleMute,
  onToggleVideo,
}) => {
  const [duration, setDuration] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  // Sound and Timer logic
  useEffect(() => {
    if (call.status === 'ringing' || call.status === 'connecting') {
      startCallingRingtone();
    } else {
      stopCallingRingtone();
    }

    if (call.status === 'connected') {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      stopCallingRingtone();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [call.status]);

  // Video stream initialization for local feed
  useEffect(() => {
    if (call.type === 'video' && !call.isVideoOff && call.status === 'connected') {
      startLocalVideo();
    } else {
      stopLocalVideo();
    }

    return () => {
      stopLocalVideo();
    };
  }, [call.type, call.isVideoOff, call.status, isFrontCamera]);

  const startLocalVideo = async () => {
    try {
      stopLocalVideo();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isFrontCamera ? 'user' : 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn('Local call video error:', e);
    }
  };

  const stopLocalVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const sendLiveReaction = (emoji: string) => {
    playHaptic('light');
    playBubblePopSound();
    const newId = `h_${Date.now()}_${Math.random()}`;
    const xPos = Math.floor(Math.random() * 60) + 20;

    setFloatingHearts(prev => [...prev, { id: newId, emoji, x: xPos }]);

    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newId));
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center select-none animate-in fade-in duration-300">
      {/* Container simulating high-end mobile calling frame */}
      <div className="relative w-full max-w-md h-full max-h-[96vh] mx-auto rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950">
        
        {/* Floating in-call reaction hearts / paws animation */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {floatingHearts.map(heart => (
            <div
              key={heart.id}
              className="absolute text-4xl animate-bounce"
              style={{
                bottom: '120px',
                left: `${heart.x}%`,
                animation: 'floatUp 2.5s ease-out forwards',
              }}
            >
              {heart.emoji}
            </div>
          ))}
        </div>

        {/* Top Information Bar */}
        <div className="relative z-20 flex flex-col items-center pt-8 pb-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/10 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
              {call.status === 'connected' ? (
                <span>In Call • {formatDuration(duration)}</span>
              ) : (
                <span>{call.isIncoming ? 'Incoming Call...' : 'Calling Secret Space...'}</span>
              )}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight drop-shadow">
            {partner.nickname || partner.name}
          </h2>
          <p className="text-xs text-sky-200/80 mt-0.5">
            {call.type === 'video' ? 'Intimate Video Call' : 'Private Audio Call'}
          </p>
        </div>

        {/* Middle Stage: Partner Visual / Video Screen */}
        <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
          {call.type === 'video' && call.status === 'connected' ? (
            /* Partner Video Screen Mock / Live Stream */
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                alt="Partner Video Feed"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-pink-500/10 to-transparent pointer-events-none" />

              {/* Picture-in-Picture Local Camera Feed */}
              <div className="absolute top-4 right-4 w-28 h-40 rounded-2xl overflow-hidden bg-slate-950 border-2 border-white/40 shadow-2xl z-20">
                {!call.isVideoOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isFrontCamera ? 'scale-x-[-1]' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                    <VideoOff className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">Off</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Audio Call / Ringing Stage */
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center mb-6">
                {/* Pulsing Ripple Rings */}
                <span className="w-36 h-36 rounded-full bg-pink-500/20 animate-ping absolute duration-1000" />
                <span className="w-48 h-48 rounded-full bg-sky-500/10 animate-pulse absolute" />

                {/* Avatar Core */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-400 via-pink-400 to-indigo-400 p-1 shadow-2xl relative z-10">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-5xl">
                    {partner.avatar || '🐾'}
                  </div>
                </div>
              </div>

              {/* Status note */}
              <p className="text-sm font-medium text-slate-300 animate-pulse">
                {call.status === 'connected' ? 'Connected • Micro-tuned audio' : 'Waiting for sweet meow...'}
              </p>
            </div>
          )}
        </div>

        {/* Live In-call Floating Reaction Trigger Pills */}
        {call.status === 'connected' && (
          <div className="relative z-30 flex items-center justify-center gap-3 py-2">
            <button
              onClick={() => sendLiveReaction('💖')}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-md active:scale-90 transition-transform"
            >
              <span>💖</span>
              <span>Heart</span>
            </button>
            <button
              onClick={() => sendLiveReaction('🐾')}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-md active:scale-90 transition-transform"
            >
              <span>🐾</span>
              <span>Paw</span>
            </button>
            <button
              onClick={() => {
                playSoftMeowSound();
                sendLiveReaction('🐱');
              }}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-md active:scale-90 transition-transform"
            >
              <span>🐱</span>
              <span>Meow!</span>
            </button>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="relative z-30 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-around">
          {call.isIncoming && call.status !== 'connected' ? (
            /* Incoming Call Actions */
            <div className="flex items-center justify-around w-full max-w-xs">
              <button
                onClick={() => {
                  playHaptic('heavy');
                  onEndCall();
                }}
                className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xl active:scale-90 transition-transform"
                title="Decline"
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              <button
                onClick={() => {
                  playHaptic('heavy');
                  onAccept();
                }}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xl animate-bounce active:scale-90 transition-transform"
                title="Answer"
              >
                <Phone className="w-7 h-7" />
              </button>
            </div>
          ) : (
            /* Active Call Controls */
            <div className="flex items-center justify-center gap-4">
              {/* Mute Mic */}
              <button
                onClick={() => {
                  playHaptic('light');
                  onToggleMute();
                }}
                className={`p-3.5 rounded-full backdrop-blur-md transition-all shadow-lg ${
                  call.isMuted
                    ? 'bg-rose-500/90 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30 border border-white/10'
                }`}
                title="Mute"
              >
                {call.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Video Toggle */}
              {call.type === 'video' && (
                <button
                  onClick={() => {
                    playHaptic('light');
                    onToggleVideo();
                  }}
                  className={`p-3.5 rounded-full backdrop-blur-md transition-all shadow-lg ${
                    call.isVideoOff
                      ? 'bg-rose-500/90 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/10'
                  }`}
                  title="Camera"
                >
                  {call.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              {/* Flip Camera */}
              {call.type === 'video' && !call.isVideoOff && (
                <button
                  onClick={() => {
                    playHaptic('light');
                    setIsFrontCamera(!isFrontCamera);
                  }}
                  className="p-3.5 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/10 transition-all shadow-lg"
                  title="Flip Camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}

              {/* End Call */}
              <button
                onClick={() => {
                  playHaptic('heavy');
                  onEndCall();
                }}
                className="p-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xl active:scale-90 transition-transform"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
