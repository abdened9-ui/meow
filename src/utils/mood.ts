import { MoodType, MoodTheme, Message } from '../types';

export const MOOD_THEMES: Record<MoodType, MoodTheme> = {
  happy_love: {
    type: 'happy_love',
    title: 'Sweet & Warm',
    emoji: '🌸',
    description: 'Filled with love, sweet affection, and warm cozy vibes',
    gradientLight: 'from-[#FFE5EC] via-[#FFD1DC] to-[#A8D5E5]',
    gradientDark: 'from-[#3A1D28] via-[#241E34] to-[#132A3B]',
    bgLightClass: 'bg-gradient-to-br from-pink-100/90 via-rose-50/80 to-sky-100/90',
    bgDarkClass: 'bg-gradient-to-br from-slate-950 via-rose-950/40 to-slate-900',
    primaryLight: '#F472B6',
    primaryDark: '#FB7185',
    bubbleSelf: 'bg-gradient-to-r from-[#F472B6] to-[#FB7185] text-white',
    bubblePartner: 'bg-white/85 text-slate-800 dark:bg-slate-800/80 dark:text-rose-100 border border-pink-200/50 dark:border-pink-500/20',
    glowColor: 'rgba(244, 114, 182, 0.35)',
    accentText: 'text-pink-500 dark:text-pink-400',
  },
  calm_chill: {
    type: 'calm_chill',
    title: 'Calm & Serene',
    emoji: '🌙',
    description: 'Peaceful twilight, relaxing cozy tea & lavender skies',
    gradientLight: 'from-[#E0E7FF] via-[#C7D2FE] to-[#A8D5E5]',
    gradientDark: 'from-[#171A2E] via-[#1E1B4B]/80 to-[#0F172A]',
    bgLightClass: 'bg-gradient-to-br from-indigo-100/80 via-slate-100 to-sky-100/90',
    bgDarkClass: 'bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900',
    primaryLight: '#818CF8',
    primaryDark: '#6366F1',
    bubbleSelf: 'bg-gradient-to-r from-[#818CF8] to-[#6366F1] text-white',
    bubblePartner: 'bg-white/85 text-slate-800 dark:bg-slate-800/80 dark:text-indigo-100 border border-indigo-200/50 dark:border-indigo-500/20',
    glowColor: 'rgba(129, 140, 248, 0.35)',
    accentText: 'text-indigo-500 dark:text-indigo-400',
  },
  excited_funny: {
    type: 'excited_funny',
    title: 'Excited & Playful',
    emoji: '⚡',
    description: 'High energy, hilarious jokes, sparks, and sunny mint smiles',
    gradientLight: 'from-[#CCFBF1] via-[#BAE6FD] to-[#A8D5E5]',
    gradientDark: 'from-[#0C2A2A] via-[#0D2538] to-[#0F172A]',
    bgLightClass: 'bg-gradient-to-br from-teal-100/80 via-cyan-100/70 to-sky-100/90',
    bgDarkClass: 'bg-gradient-to-br from-slate-950 via-cyan-950/40 to-slate-900',
    primaryLight: '#2DD4BF',
    primaryDark: '#0D9488',
    bubbleSelf: 'bg-gradient-to-r from-[#2DD4BF] to-[#38BDF8] text-slate-900 font-medium',
    bubblePartner: 'bg-white/85 text-slate-800 dark:bg-slate-800/80 dark:text-cyan-100 border border-teal-200/50 dark:border-teal-500/20',
    glowColor: 'rgba(45, 212, 191, 0.35)',
    accentText: 'text-teal-500 dark:text-teal-400',
  },
  sad_soft: {
    type: 'sad_soft',
    title: 'Gentle & Comforting',
    emoji: '🌧️',
    description: 'Muted gentle blues, comforting warm hugs, and rainy quiet mood',
    gradientLight: 'from-[#E2E8F0] via-[#CBD5E1] to-[#A8D5E5]',
    gradientDark: 'from-[#18202F] via-[#1E293B] to-[#0F172A]',
    bgLightClass: 'bg-gradient-to-br from-slate-200/80 via-slate-100 to-sky-100/80',
    bgDarkClass: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
    primaryLight: '#94A3B8',
    primaryDark: '#64748B',
    bubbleSelf: 'bg-gradient-to-r from-[#94A3B8] to-[#64748B] text-white',
    bubblePartner: 'bg-white/85 text-slate-800 dark:bg-slate-800/80 dark:text-slate-200 border border-slate-300/50 dark:border-slate-700/50',
    glowColor: 'rgba(148, 163, 184, 0.35)',
    accentText: 'text-slate-500 dark:text-slate-400',
  },
};

const EMOJI_MAP: Record<string, MoodType> = {
  // Happy / Love / Cute
  '❤️': 'happy_love', '💖': 'happy_love', '💕': 'happy_love', '💗': 'happy_love',
  '😻': 'happy_love', '🥰': 'happy_love', '😘': 'happy_love', '🥺': 'happy_love',
  '🌸': 'happy_love', '✨': 'happy_love', '😽': 'happy_love', '🐱': 'happy_love',
  '💓': 'happy_love', '💞': 'happy_love', '💐': 'happy_love', '🍭': 'happy_love',

  // Calm / Chill
  '🌙': 'calm_chill', '☁️': 'calm_chill', '🍵': 'calm_chill', '💤': 'calm_chill',
  '🌿': 'calm_chill', '🎧': 'calm_chill', '🌊': 'calm_chill', '☕': 'calm_chill',
  '🕯️': 'calm_chill', '📖': 'calm_chill', '🕊️': 'calm_chill', '🌌': 'calm_chill',

  // Excited / Funny
  '😂': 'excited_funny', '🤣': 'excited_funny', '😸': 'excited_funny', '😹': 'excited_funny',
  '🎉': 'excited_funny', '⚡': 'excited_funny', '🤩': 'excited_funny', '🔥': 'excited_funny',
  '🚀': 'excited_funny', '🤪': 'excited_funny', '🥳': 'excited_funny', '💃': 'excited_funny',

  // Sad / Soft / Comfort
  '😿': 'sad_soft', '🌧️': 'sad_soft', '💔': 'sad_soft', '🥀': 'sad_soft',
  '😢': 'sad_soft', '😭': 'sad_soft', '🫂': 'sad_soft', '🩹': 'sad_soft',
  '🌧': 'sad_soft', '🍂': 'sad_soft', '☔': 'sad_soft', '🖤': 'sad_soft',
};

const KEYWORD_MAP: Record<MoodType, string[]> = {
  happy_love: ['love', 'cute', 'sweet', 'miss you', 'baby', 'honey', 'babe', 'darling', 'happy', 'yay', 'hug', 'kiss', 'pretty', 'adorable', 'mew', 'meow', 'heart'],
  calm_chill: ['chill', 'relax', 'calm', 'sleep', 'goodnight', 'bed', 'peace', 'quiet', 'cozy', 'tea', 'dream', 'rest', 'coffee', 'soft'],
  excited_funny: ['omg', 'lol', 'lmao', 'haha', 'hahaha', 'crazy', 'excited', 'party', 'look', 'wow', 'fun', 'hurry', 'omggg', 'lmfao', 'awesome', 'lets go'],
  sad_soft: ['tired', 'sad', 'rough', 'bad day', 'miss', 'heavy', 'crying', 'cry', 'alone', 'stress', 'headache', 'hurt', 'tough', 'sorry'],
};

/**
 * Detects the current mood of the conversation based on the last few messages
 */
export function detectConversationMood(messages: Message[]): MoodType {
  if (!messages || messages.length === 0) {
    return 'calm_chill'; // default serene calm
  }

  // Look at the latest 10 messages with higher weight on the newest
  const recent = messages.slice(-10);
  const scores: Record<MoodType, number> = {
    happy_love: 0,
    calm_chill: 0.5, // slight baseline
    excited_funny: 0,
    sad_soft: 0,
  };

  recent.forEach((msg, idx) => {
    const weight = 1 + (idx / recent.length); // recent messages have higher weight
    const text = (msg.content || '').toLowerCase();

    // Check emojis
    for (const [emoji, mood] of Object.entries(EMOJI_MAP)) {
      if (text.includes(emoji)) {
        scores[mood] += 3 * weight;
      }
    }

    // Check keywords
    for (const [mood, words] of Object.entries(KEYWORD_MAP)) {
      for (const word of words) {
        if (text.includes(word)) {
          scores[mood as MoodType] += 2 * weight;
        }
      }
    }

    // Check reactions
    if (msg.reactions) {
      Object.values(msg.reactions).forEach(emoji => {
        if (EMOJI_MAP[emoji]) {
          scores[EMOJI_MAP[emoji]] += 2.5;
        }
      });
    }
  });

  // Find mood with highest score
  let bestMood: MoodType = 'calm_chill';
  let maxScore = -1;

  for (const [mood, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestMood = mood as MoodType;
    }
  }

  return bestMood;
}
