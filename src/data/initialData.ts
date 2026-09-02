import { Message, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'user',
  name: 'Alex',
  nickname: 'Kitten',
  avatar: '🐱',
  statusEmoji: '✨',
  statusText: 'Listening to rain 🌧️',
  isOnline: true,
  isTyping: false,
};

export const INITIAL_PARTNER: UserProfile = {
  id: 'partner',
  name: 'Milo',
  nickname: 'My Moon 🌙',
  avatar: '🐾',
  statusEmoji: '🍵',
  statusText: 'Drinking chamomile tea',
  isOnline: true,
  isTyping: false,
};

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    senderId: 'partner',
    senderName: 'Milo',
    type: 'text',
    content: 'Hey you! Look what I just found outside our secret coffee spot 🌸',
    timestamp: Date.now() - 1000 * 60 * 35,
    status: 'read',
    reactions: { user: '😻' },
  },
  {
    id: 'msg_2',
    senderId: 'partner',
    senderName: 'Milo',
    type: 'snap',
    content: 'Sent a Snap (Vanishes in 5s) 📸',
    snapData: {
      id: 'snap_sample_1',
      mediaUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80',
      mediaType: 'photo',
      caption: 'Look at this tiny kitten sleeping on the flowerpot! 🐾✨',
      filterId: 'cat_ears',
      timerSeconds: 5,
      opened: false,
    },
    timestamp: Date.now() - 1000 * 60 * 32,
    status: 'delivered',
  },
  {
    id: 'msg_3',
    senderId: 'user',
    senderName: 'Alex',
    type: 'text',
    content: 'OMG so sweet!! 🥰 Sending you the warmest hug!',
    timestamp: Date.now() - 1000 * 60 * 25,
    status: 'read',
    reactions: { partner: '❤️' },
  },
  {
    id: 'msg_4',
    senderId: 'partner',
    senderName: 'Milo',
    type: 'voice',
    content: 'Voice note (0:07)',
    voiceData: {
      duration: 7,
      waveformData: [25, 45, 80, 95, 60, 40, 75, 90, 85, 50, 30, 65, 80, 40],
    },
    timestamp: Date.now() - 1000 * 60 * 18,
    status: 'read',
    reactions: { user: '💖' },
  },
  {
    id: 'msg_5',
    senderId: 'partner',
    senderName: 'Milo',
    type: 'text',
    content: 'Are you free for a quick cozy video call tonight? Miss your face 🌙',
    timestamp: Date.now() - 1000 * 60 * 5,
    status: 'read',
  },
];
