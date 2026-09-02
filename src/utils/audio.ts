// Web Audio API Synthesizer for high quality cute cat meows, chimes, and voice notes

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playHaptic(intensity: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (intensity === 'light') {
        navigator.vibrate(12);
      } else if (intensity === 'medium') {
        navigator.vibrate([15, 30, 20]);
      } else {
        navigator.vibrate([30, 50, 40]);
      }
    } catch {
      // Ignore vibration errors
    }
  }
}

/**
 * Synthesizes a realistic, adorable soft cat "Meow" sound using formants and FM frequency glides
 */
export function playSoftMeowSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.28, now + 0.08);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    masterGain.connect(ctx.destination);

    // Primary Voice Oscillator (Cat vocal cords)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';

    // Pitch contour for "me-oow" (starts high, peaks slightly, then glides downward smoothly)
    osc1.frequency.setValueAtTime(560, now);
    osc1.frequency.exponentialRampToValueAtTime(840, now + 0.12);
    osc1.frequency.exponentialRampToValueAtTime(420, now + 0.5);

    // Second harmonic oscillator for warmth
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1120, now);
    osc2.frequency.exponentialRampToValueAtTime(1680, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(840, now + 0.5);

    // Formant filter 1 (mouth vowel shape transition "m" -> "ee" -> "ow")
    const formant = ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.Q.value = 4.5;
    formant.frequency.setValueAtTime(1200, now);
    formant.frequency.linearRampToValueAtTime(2400, now + 0.14);
    formant.frequency.exponentialRampToValueAtTime(900, now + 0.5);

    // Gentle sub warmth
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(280, now);
    subOsc.frequency.exponentialRampToValueAtTime(210, now + 0.5);

    const subGain = ctx.createGain();
    subGain.gain.value = 0.15;
    subOsc.connect(subGain);
    subGain.connect(masterGain);

    osc1.connect(formant);
    osc2.connect(formant);
    formant.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    subOsc.start(now);

    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
    subOsc.stop(now + 0.55);

    playHaptic('light');
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

/**
 * Synthesizes a sweet playful "Mew!" (cheerful, quick, cute upward chirp)
 */
export function playPlayfulMewSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(1050, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.35);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 5.0;
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);

    osc.start(now);
    osc.stop(now + 0.38);

    playHaptic('light');
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

/**
 * Synthesizes a cozy purr chirp
 */
export function playPurrChirpSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Purr modulation (LFO)
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 26; // 26 Hz purr flutter

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.2;

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.25, now + 0.1);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    mainGain.connect(ctx.destination);

    lfo.connect(lfoGain);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(620, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.6);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, now);

    osc.connect(filter);
    filter.connect(mainGain);

    lfo.start(now);
    osc.start(now);

    lfo.stop(now + 0.65);
    osc.stop(now + 0.65);

    playHaptic('medium');
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

/**
 * Synthesizes a gentle water bubble pop
 */
export function playBubblePopSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(1250, now + 0.08);

    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.15);

    playHaptic('light');
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

/**
 * Synthesizes a celestial crystal chime
 */
export function playCrystalChimeSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    [1174.66, 1760.0, 2349.32].forEach((freq, i) => {
      const delay = i * 0.06;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.8);
      gain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.connect(gain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.85);
    });

    playHaptic('light');
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

/**
 * Disappearing snap vanish whoosh/poof sound
 */
export function playVanishPoofSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Pink noise burst + decaying high bell
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.28);
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    playHaptic('medium');
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

/**
 * Plays the selected notification sound
 */
export function playNotificationSound(sound: string = 'meow_soft') {
  switch (sound) {
    case 'meow_soft':
      playSoftMeowSound();
      break;
    case 'meow_purr':
      playPurrChirpSound();
      break;
    case 'meow_playful':
      playPlayfulMewSound();
      break;
    case 'bubble_pop':
      playBubblePopSound();
      break;
    case 'crystal_chime':
      playCrystalChimeSound();
      break;
    default:
      playSoftMeowSound();
  }
}

/**
 * Synthesizes a sweet incoming call ringtone loop
 */
let ringtoneInterval: any = null;

export function startCallingRingtone() {
  stopCallingRingtone();
  playSoftMeowSound();
  ringtoneInterval = setInterval(() => {
    playSoftMeowSound();
  }, 2200);
}

export function stopCallingRingtone() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}
