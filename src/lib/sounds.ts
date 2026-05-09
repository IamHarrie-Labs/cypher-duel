/* ── Cypher sound system ──────────────────────────────
   Web Audio API synth tones — no asset files needed.
   All calls are try/caught so audio errors never crash the app.
──────────────────────────────────────────────────── */

let _ctx: AudioContext | null = null;

function ctx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  vol = 0.12,
  delay = 0,
) {
  try {
    const ac = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
    osc.type = type;
    gain.gain.setValueAtTime(0, ac.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, ac.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration + 0.05);
  } catch {
    // silently ignore — audio is optional
  }
}

export const sounds = {
  /** Soft tick each second during the battle countdown */
  tick: () => tone(900, 0.04, 'sine', 0.07),

  /** Last-10-seconds urgent tick */
  urgentTick: () => tone(1100, 0.04, 'square', 0.1),

  /** Card picked from the hand */
  cardPick: () => {
    tone(440, 0.06, 'triangle', 0.1);
    tone(660, 0.08, 'triangle', 0.08, 0.06);
  },

  /** Plays sealed / committed */
  commit: () => {
    tone(520, 0.09, 'sine', 0.12);
    tone(780, 0.12, 'sine', 0.1, 0.09);
  },

  /** Card triggered live during battle */
  cardHit: () => {
    tone(880, 0.07, 'square', 0.1);
    tone(1100, 0.1, 'sine', 0.08, 0.07);
  },

  /** Victory fanfare */
  win: () => {
    tone(523, 0.12, 'sine', 0.14);
    tone(659, 0.12, 'sine', 0.12, 0.13);
    tone(784, 0.12, 'sine', 0.12, 0.26);
    tone(1047, 0.25, 'sine', 0.14, 0.39);
  },

  /** Defeat sting */
  lose: () => {
    tone(400, 0.12, 'sawtooth', 0.1);
    tone(280, 0.22, 'sawtooth', 0.08, 0.14);
  },

  /** Error / invalid action */
  error: () => tone(180, 0.18, 'square', 0.1),

  /** Notification / copy */
  notify: () => {
    tone(760, 0.06, 'sine', 0.1);
    tone(960, 0.09, 'sine', 0.08, 0.07);
  },
};
