/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Plain option objects for Tone instruments — shared by soundManager and
 * scripts that render export WAVs via Tone.Offline (browser-only).
 */
export const TONE_INSTRUMENT_PRESETS = {
  softSynth: {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 },
  },
  pluckSynth: {
    attackNoise: 0.18,
    dampening: 4800,
    resonance: 0.88,
  },
  kalimbaSynth: {
    harmonicity: 8,
    modulationIndex: 2,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.6 },
    modulation: { type: 'square' },
    modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.4 },
  },
  bellSynth: {
    harmonicity: 3.5,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.003, decay: 0.6, sustain: 0, release: 0.8 },
    modulation: { type: 'triangle' },
    modulationEnvelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.5 },
  },
  polySynthVoice: {
    harmonicity: 3,
    modulationIndex: 1.5,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.6 },
    modulation: { type: 'triangle' },
    modulationEnvelope: { attack: 0.02, decay: 0.2, sustain: 0, release: 0.4 },
  },
};
