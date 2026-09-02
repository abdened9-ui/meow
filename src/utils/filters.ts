import { CameraFilter } from '../types';

export const CAMERA_FILTERS: CameraFilter[] = [
  {
    id: 'none',
    name: 'Normal',
    icon: '✨',
    description: 'Clean, crystal clear camera',
    overlayType: 'none',
  },
  {
    id: 'cat_ears',
    name: 'Cat Ears',
    icon: '🐱',
    description: 'Fluffy animated kitty ears, pink nose & whiskers',
    overlayType: 'cat_ears',
  },
  {
    id: 'dream_glow',
    name: 'Soft Glow',
    icon: '🌸',
    description: 'Dreamy pastel bokeh & warm rosy skin tone',
    overlayType: 'dream_glow',
  },
  {
    id: 'sparkles',
    name: 'Sparkles',
    icon: '💖',
    description: 'Floating heart sparkles and tiny kitty paws',
    overlayType: 'sparkles',
  },
  {
    id: 'vintage',
    name: 'Film 90s',
    icon: '🎞️',
    description: 'Warm analog nostalgia with retro timestamp',
    overlayType: 'vintage',
  },
  {
    id: 'cyber',
    name: 'Cyber Neko',
    icon: '⚡',
    description: 'Futuristic cyan glow and cyber cat visor',
    overlayType: 'cyber',
  },
  {
    id: 'noir',
    name: 'Noir Velvet',
    icon: '🖤',
    description: 'High contrast black & white moody cinema',
    overlayType: 'noir',
  },
];

export const CUTE_STICKERS = [
  '🐾', '🐱', '😻', '😽', '💖', '✨', '🌸', '🎀',
  '☕', '🌙', '☁️', '💤', '🍓', '🍰', '🧸', '💌',
  '🥺', '🥰', '🔥', '🎉', '🍦', '🎈', '🍭', '⭐'
];

export const APP_ICONS = [
  {
    id: 'sky_kitty',
    name: 'Sky Neko',
    color: '#7EC8E3',
    badge: 'Default',
    svgColor: '#7EC8E3',
  },
  {
    id: 'velvet_midnight',
    name: 'Midnight Velvet',
    color: '#312E81',
    badge: 'Night',
    svgColor: '#4338CA',
  },
  {
    id: 'matcha_paw',
    name: 'Matcha Boba',
    color: '#10B981',
    badge: 'Cozy',
    svgColor: '#059669',
  },
  {
    id: 'peach_blossom',
    name: 'Peach Sweet',
    color: '#F472B6',
    badge: 'Sweet',
    svgColor: '#EC4899',
  },
  {
    id: 'cyber_cyan',
    name: 'Cyber Cloud',
    color: '#06B6D4',
    badge: 'Glow',
    svgColor: '#0891B2',
  },
];

export const NOTIFICATION_SOUNDS = [
  { id: 'meow_soft', name: 'Soft Kitten Meow', desc: 'Gentle affectionate me-oow (Default)' },
  { id: 'meow_purr', name: 'Purr Chirp', desc: 'Cozy deep purr and happy chirp' },
  { id: 'meow_playful', name: 'Playful Mew!', desc: 'High-pitched cheerful kitten bounce' },
  { id: 'bubble_pop', name: 'Water Bubble Pop', desc: 'Soft satisfying liquid bubble' },
  { id: 'crystal_chime', name: 'Celestial Chime', desc: 'Peaceful twin fairy bell chime' },
];

export const CHAT_BACKGROUNDS = [
  { id: 'mood_adaptive', name: 'Mood Liquid Flow', type: 'gradient', value: 'dynamic' },
  { id: 'starry_sky', name: 'Twilight Starfield', type: 'stars', value: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)' },
  { id: 'sakura_haze', name: 'Sakura Petal Dawn', type: 'aura', value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { id: 'lofi_midnight', name: 'Lo-Fi Velvet', type: 'gradient', value: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)' },
  { id: 'mint_ice', name: 'Mint Frost Breeze', type: 'gradient', value: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)' },
];
