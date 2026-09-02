export type MoodType = 'happy_love' | 'calm_chill' | 'excited_funny' | 'sad_soft';

export interface MoodTheme {
  type: MoodType;
  title: string;
  emoji: string;
  description: string;
  gradientLight: string;
  gradientDark: string;
  bgLightClass: string;
  bgDarkClass: string;
  primaryLight: string;
  primaryDark: string;
  bubbleSelf: string;
  bubblePartner: string;
  glowColor: string;
  accentText: string;
}

export type MessageType = 'text' | 'snap' | 'photo' | 'video' | 'voice' | 'call_log' | 'mood_shift';

export interface SnapPayload {
  id: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  caption?: string;
  filterId?: string;
  timerSeconds: number; // 1-10 or 0 for single-view
  opened: boolean;
  openedAt?: number;
}

export interface VoicePayload {
  audioUrl?: string;
  duration: number; // in seconds
  waveformData: number[];
}

export interface CallLogPayload {
  callType: 'audio' | 'video';
  duration: number; // in seconds
  status: 'completed' | 'missed' | 'declined';
}

export interface Message {
  id: string;
  senderId: 'user' | 'partner';
  senderName: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  snapData?: SnapPayload;
  voiceData?: VoicePayload;
  callLog?: CallLogPayload;
  reactions?: Record<string, string>; // userId -> emoji
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  avatar: string;
  customAvatar?: string;
  statusEmoji: string;
  statusText: string;
  isOnline: boolean;
  isTyping: boolean;
}

export type NotificationSound = 'meow_soft' | 'meow_purr' | 'meow_playful' | 'bubble_pop' | 'crystal_chime';

export interface AppIconOption {
  id: string;
  name: string;
  color: string;
  badge: string;
  svgIcon: string;
}

export interface BackgroundOption {
  id: string;
  name: string;
  type: 'gradient' | 'aura' | 'stars' | 'clouds' | 'custom';
  value: string;
}

export interface CameraFilter {
  id: string;
  name: string;
  icon: string;
  description: string;
  overlayType: 'cat_ears' | 'dream_glow' | 'sparkles' | 'vintage' | 'cyber' | 'fisheye' | 'noir' | 'none';
}

export interface ActiveCall {
  active: boolean;
  isIncoming: boolean;
  type: 'audio' | 'video';
  status: 'connecting' | 'ringing' | 'connected' | 'ended';
  callerName: string;
  callerAvatar: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isFrontCamera: boolean;
  startTime?: number;
  duration: number;
}
