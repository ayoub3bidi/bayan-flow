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
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.3 },
  },
  pluckSynth: {
    attackNoise: 0.5,
    dampening: 4000,
    resonance: 0.9,
  },
  metallicSynth: {
    frequency: 200,
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  },
};
