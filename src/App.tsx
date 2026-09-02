import React, { useState, useEffect, useRef } from 'react';
import {
  Message,
  UserProfile,
  MoodType,
  SnapPayload,
  ActiveCall,
  NotificationSound,
} from './types';
import { INITIAL_USER, INITIAL_PARTNER, INITIAL_MESSAGES } from './data/initialData';
import { detectConversationMood, MOOD_THEMES } from './utils/mood';
import { NavigationHeader } from './components/NavigationHeader';
import { ChatView } from './components/ChatView';
import { CameraView } from './components/CameraView';
import { SnapViewer } from './components/SnapViewer';
import { CallModal } from './components/CallModal';
import { InviteModal } from './components/InviteModal';
import { SettingsView } from './components/SettingsView';
import { MoodIndicatorModal } from './components/MoodIndicatorModal';
import { NotificationToast } from './components/NotificationToast';
import {
  playNotificationSound,
  playSoftMeowSound,
  playBubblePopSound,
  playHaptic,
} from './utils/audio';

export default function App() {
  // Room and Peer State
  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qRoom = params.get('room');
      if (qRoom) return qRoom;
    }
    return 'meow_cozy_77';
  });

  const [isPaired, setIsPaired] = useState(true);
  const [meowStreak, setMeowStreak] = useState(14);

  // User & Partner Profiles
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [partner, setPartner] = useState<UserProfile>(INITIAL_PARTNER);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  // Dynamic Mood
  const [currentMood, setCurrentMood] = useState<MoodType>(() =>
    detectConversationMood(INITIAL_MESSAGES)
  );

  // Aesthetics & Customization
  const [selectedIcon, setSelectedIcon] = useState('sky_kitty');
  const [selectedSound, setSelectedSound] = useState<NotificationSound>('meow_soft');
  const [selectedBg, setSelectedBg] = useState('dynamic');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meow_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync dark mode class on html root and local storage
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    try {
      localStorage.setItem('meow_dark_mode', String(isDark));
    } catch {
      // ignore
    }
  }, [isDark]);

  // Modals & Sheets
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [viewingSnap, setViewingSnap] = useState<SnapPayload | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);

  // Calling State
  const [activeCall, setActiveCall] = useState<ActiveCall>({
    active: false,
    isIncoming: false,
    type: 'video',
    status: 'connecting',
    callerName: '',
    callerAvatar: '',
    isMuted: false,
    isVideoOff: false,
    isFrontCamera: true,
    duration: 0,
  });

  // Real-time Notification Toast
  const [notification, setNotification] = useState<{
    id: string;
    title: string;
    body: string;
    type: 'message' | 'snap' | 'call' | 'meow';
    avatar: string;
    snapData?: SnapPayload;
  } | null>(null);

  // WebSocket & BroadcastChannel Reference
  const wsRef = useRef<WebSocket | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Update mood whenever messages change
  useEffect(() => {
    const nextMood = detectConversationMood(messages);
    setCurrentMood(nextMood);
  }, [messages]);

  // Connect WebSocket & BroadcastChannel for 1-on-1 Real-time Sync
  useEffect(() => {
    // 1. BroadcastChannel for fast multi-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel(`meow_channel_${roomId}`);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        handleIncomingRealtimeEvent(event.data);
      };
    }

    // 2. WebSocket Server Connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'join_room',
            roomId,
            userId: user.id,
            userName: user.name,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingRealtimeEvent(data);
        } catch (e) {
          console.error('Error parsing ws msg:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('WebSocket connection note:', e);
      };
    } catch (e) {
      console.warn('WebSocket init fallback:', e);
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
    };
  }, [roomId, user.id, user.name]);

  // Broadcast helper
  const sendRealtimePayload = (type: string, payload: any) => {
    const eventData = {
      type,
      roomId,
      userId: user.id,
      userName: user.name,
      payload,
      timestamp: Date.now(),
    };

    // Send to WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(eventData));
    }

    // Send to BroadcastChannel
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage(eventData);
    }
  };

  // Handle incoming events from partner
  const handleIncomingRealtimeEvent = (data: any) => {
    if (!data || data.userId === user.id) return; // ignore own echo

    const { type, payload } = data;

    if (type === 'message') {
      setMessages((prev) => [...prev, payload]);
      playNotificationSound(selectedSound);
      setNotification({
        id: `notif_${Date.now()}`,
        title: partner.nickname || partner.name,
        body: payload.content || 'Sent a message',
        type: 'message',
        avatar: partner.avatar,
      });
    } else if (type === 'snap') {
      setMessages((prev) => [...prev, payload]);
      playNotificationSound(selectedSound);
      setNotification({
        id: `notif_${Date.now()}`,
        title: partner.nickname || partner.name,
        body: 'Sent you a disappearing snap 📸 (Tap to view)',
        type: 'snap',
        avatar: partner.avatar,
        snapData: payload.snapData,
      });
    } else if (type === 'call_signal') {
      if (payload.action === 'start_call') {
        setActiveCall({
          active: true,
          isIncoming: true,
          type: payload.callType || 'video',
          status: 'ringing',
          callerName: partner.nickname || partner.name,
          callerAvatar: partner.avatar,
          isMuted: false,
          isVideoOff: false,
          isFrontCamera: true,
          duration: 0,
        });
      } else if (payload.action === 'end_call') {
        setActiveCall((prev) => ({ ...prev, active: false }));
      } else if (payload.action === 'accept_call') {
        setActiveCall((prev) => ({ ...prev, status: 'connected' }));
      }
    } else if (type === 'quick_meow') {
      playSoftMeowSound();
      setNotification({
        id: `notif_${Date.now()}`,
        title: `${partner.nickname} meowed at you!`,
        body: '“Meow!” 🐾✨',
        type: 'meow',
        avatar: partner.avatar,
      });
    } else if (type === 'reaction') {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId
            ? { ...m, reactions: { ...(m.reactions || {}), [partner.id]: payload.emoji } }
            : m
        )
      );
    }
  };

  // Chat Actions
  const handleSendMessage = (content: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'user',
      senderName: user.name,
      type: 'text',
      content,
      timestamp: Date.now(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMsg]);
    sendRealtimePayload('message', newMsg);
  };

  const handleSendVoice = (duration: number, waveforms: number[]) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'user',
      senderName: user.name,
      type: 'voice',
      content: `Voice note (0:0${duration})`,
      voiceData: {
        duration,
        waveformData: waveforms,
      },
      timestamp: Date.now(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMsg]);
    sendRealtimePayload('message', newMsg);
  };

  const handleSendPhotoMedia = (url: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'user',
      senderName: user.name,
      type: 'photo',
      content: 'Shared photo',
      mediaUrl: url,
      timestamp: Date.now(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMsg]);
    sendRealtimePayload('message', newMsg);
  };

  const handleSendSnap = (snap: SnapPayload) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'user',
      senderName: user.name,
      type: 'snap',
      content: `Sent a Snap (Vanishes in ${snap.timerSeconds}s) 📸`,
      snapData: snap,
      timestamp: Date.now(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMsg]);
    sendRealtimePayload('snap', newMsg);
  };

  const handleOpenSnap = (snap: SnapPayload) => {
    setViewingSnap(snap);
  };

  const handleVanishSnap = (snapId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.snapData && msg.snapData.id === snapId) {
          return {
            ...msg,
            snapData: {
              ...msg.snapData,
              opened: true,
              openedAt: Date.now(),
            },
          };
        }
        return msg;
      })
    );
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, reactions: { ...(msg.reactions || {}), [user.id]: emoji } }
          : msg
      )
    );
    sendRealtimePayload('reaction', { messageId, emoji });
  };

  const handleSendQuickMeow = () => {
    playSoftMeowSound();
    sendRealtimePayload('quick_meow', {});
  };

  // Calling Handlers
  const handleStartCall = (type: 'audio' | 'video') => {
    setActiveCall({
      active: true,
      isIncoming: false,
      type,
      status: 'ringing',
      callerName: partner.nickname || partner.name,
      callerAvatar: partner.avatar,
      isMuted: false,
      isVideoOff: false,
      isFrontCamera: true,
      duration: 0,
    });

    sendRealtimePayload('call_signal', { action: 'start_call', callType: type });

    // Auto connect after 2.5s for seamless interactive trial if solo
    setTimeout(() => {
      setActiveCall((prev) => (prev.active ? { ...prev, status: 'connected' } : prev));
    }, 2500);
  };

  const handleAcceptCall = () => {
    setActiveCall((prev) => ({ ...prev, status: 'connected' }));
    sendRealtimePayload('call_signal', { action: 'accept_call' });
  };

  const handleEndCall = () => {
    setActiveCall((prev) => ({ ...prev, active: false }));
    sendRealtimePayload('call_signal', { action: 'end_call' });
  };

  // Partner Simulation for effortless solo testing
  const handleSimulatePartnerAction = (actionType: 'snap' | 'text' | 'voice' | 'call') => {
    playHaptic('medium');

    if (actionType === 'snap') {
      const snapMsg: Message = {
        id: `sim_snap_${Date.now()}`,
        senderId: 'partner',
        senderName: partner.name,
        type: 'snap',
        content: 'Sent a Snap (Vanishes in 5s) 📸',
        snapData: {
          id: `snap_${Date.now()}`,
          mediaUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
          mediaType: 'photo',
          caption: 'Sweet cat lounging in the warm sunbeam 🐱☀️',
          filterId: 'cat_ears',
          timerSeconds: 5,
          opened: false,
        },
        timestamp: Date.now(),
        status: 'delivered',
      };
      setMessages((prev) => [...prev, snapMsg]);
      playNotificationSound(selectedSound);
      setNotification({
        id: `notif_${Date.now()}`,
        title: partner.nickname || partner.name,
        body: 'Sent you a disappearing snap 📸',
        type: 'snap',
        avatar: partner.avatar,
        snapData: snapMsg.snapData,
      });
    } else if (actionType === 'text') {
      const quotes = [
        'Thinking of you and our cozy little bubble 💖',
        'Just saw the cutest cat ever on my walk! 🌸🐾',
        'Can’t wait to video call you later tonight 🌙',
        'Sending you a million soft hugs 🥰',
      ];
      const randomText = quotes[Math.floor(Math.random() * quotes.length)];
      const textMsg: Message = {
        id: `sim_msg_${Date.now()}`,
        senderId: 'partner',
        senderName: partner.name,
        type: 'text',
        content: randomText,
        timestamp: Date.now(),
        status: 'delivered',
      };
      setMessages((prev) => [...prev, textMsg]);
      playNotificationSound(selectedSound);
    } else if (actionType === 'voice') {
      const voiceMsg: Message = {
        id: `sim_voice_${Date.now()}`,
        senderId: 'partner',
        senderName: partner.name,
        type: 'voice',
        content: 'Voice note (0:06)',
        voiceData: {
          duration: 6,
          waveformData: [35, 60, 90, 75, 40, 85, 95, 70, 45, 30, 60, 80],
        },
        timestamp: Date.now(),
        status: 'delivered',
      };
      setMessages((prev) => [...prev, voiceMsg]);
      playNotificationSound(selectedSound);
    } else if (actionType === 'call') {
      setActiveCall({
        active: true,
        isIncoming: true,
        type: 'video',
        status: 'ringing',
        callerName: partner.nickname || partner.name,
        callerAvatar: partner.avatar,
        isMuted: false,
        isVideoOff: false,
        isFrontCamera: true,
        duration: 0,
      });
    }
  };

  const activeMoodTheme = MOOD_THEMES[currentMood];

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-0 sm:p-4 md:p-6 transition-colors duration-1000 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-900/90 text-slate-800'
      }`}
    >
      {/* Real-Time Notification Island */}
      <NotificationToast
        notification={notification}
        onDismiss={() => setNotification(null)}
        onClick={() => {
          if (notification?.snapData && !notification.snapData.opened) {
            setViewingSnap(notification.snapData);
          }
        }}
      />

      {/* Main Mobile App Frame */}
      <div
        className={`relative w-full max-w-[430px] h-[100dvh] sm:h-[92vh] sm:max-h-[890px] rounded-none sm:rounded-[44px] overflow-hidden flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-0 sm:border-[8px] sm:border-slate-800/80 transition-all duration-1000 ${
          isDark ? activeMoodTheme.bgDarkClass : activeMoodTheme.bgLightClass
        }`}
      >
        {/* Dynamic Top Island Notch */}
        <div className="hidden sm:flex justify-center pt-2 pb-1 z-30 pointer-events-none select-none">
          <div className="w-28 h-4 rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center gap-1.5 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
            <span className="w-2 h-2 rounded-full bg-emerald-400/80 animate-pulse" />
          </div>
        </div>

        {/* Top Header */}
        <NavigationHeader
          partner={partner}
          currentMood={currentMood}
          meowStreak={meowStreak}
          isPaired={isPaired}
          onStartCall={handleStartCall}
          onOpenMoodModal={() => setIsMoodModalOpen(true)}
          onOpenInvite={() => setIsInviteOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleDark={() => setIsDark((prev) => !prev)}
          isDark={isDark}
        />

        {/* Core Chat Stream */}
        <ChatView
          messages={messages}
          user={user}
          partner={partner}
          currentMood={currentMood}
          customBg={selectedBg}
          isDark={isDark}
          onSendMessage={handleSendMessage}
          onSendVoice={handleSendVoice}
          onSendPhotoMedia={handleSendPhotoMedia}
          onOpenSnap={handleOpenSnap}
          onReactToMessage={handleReactToMessage}
          onOpenFullCamera={() => setIsCameraOpen(true)}
          onSendQuickMeow={handleSendQuickMeow}
          onSimulatePartnerAction={handleSimulatePartnerAction}
        />

        {/* 1. Camera View Sheet */}
        {isCameraOpen && (
          <CameraView
            onSendSnap={handleSendSnap}
            onClose={() => setIsCameraOpen(false)}
            partnerName={partner.nickname || partner.name}
            isDark={isDark}
          />
        )}

        {/* 2. Disappearing Snap Viewer */}
        {viewingSnap && (
          <SnapViewer
            snap={viewingSnap}
            senderName={partner.nickname || partner.name}
            onClose={() => setViewingSnap(null)}
            onVanish={() => handleVanishSnap(viewingSnap.id)}
          />
        )}

        {/* 3. Audio & Video Call Modal */}
        {activeCall.active && (
          <CallModal
            call={activeCall}
            partner={partner}
            user={user}
            onAccept={handleAcceptCall}
            onEndCall={handleEndCall}
            onToggleMute={() =>
              setActiveCall((prev) => ({ ...prev, isMuted: !prev.isMuted }))
            }
            onToggleVideo={() =>
              setActiveCall((prev) => ({ ...prev, isVideoOff: !prev.isVideoOff }))
            }
          />
        )}

        {/* 4. Private Invite & QR Code Modal */}
        {isInviteOpen && (
          <InviteModal
            roomId={roomId}
            isPaired={isPaired}
            onJoinRoom={(newRoom) => {
              setRoomId(newRoom);
              setIsPaired(true);
            }}
            onClose={() => setIsInviteOpen(false)}
            isDark={isDark}
          />
        )}

        {/* 5. Mood Indicator & Atmosphere Modal */}
        {isMoodModalOpen && (
          <MoodIndicatorModal
            currentMood={currentMood}
            onSelectMoodOverride={(mood) => setCurrentMood(mood)}
            onClose={() => setIsMoodModalOpen(false)}
            isDark={isDark}
          />
        )}

        {/* 6. Settings & Customization Center */}
        {isSettingsOpen && (
          <SettingsView
            user={user}
            partner={partner}
            selectedIcon={selectedIcon}
            selectedSound={selectedSound}
            selectedBg={selectedBg}
            isDark={isDark}
            meowStreak={meowStreak}
            onUpdateIcon={setSelectedIcon}
            onUpdateSound={setSelectedSound}
            onUpdateBg={setSelectedBg}
            onToggleDark={() => setIsDark(!isDark)}
            onUpdateUserNickname={(nick) => setUser((prev) => ({ ...prev, nickname: nick }))}
            onUpdatePartnerNickname={(nick) => setPartner((prev) => ({ ...prev, nickname: nick }))}
            onOpenInvite={() => {
              setIsSettingsOpen(false);
              setIsInviteOpen(true);
            }}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
