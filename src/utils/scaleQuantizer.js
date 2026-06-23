/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/** Semitone offsets for C major pentatonic (C, D, E, G, A). */
export const C_MAJOR_PENTATONIC = [0, 2, 4, 7, 9];

/** Semitone offsets for A minor pentatonic (A, C, D, E, G) relative to A. */
export const A_MINOR_PENTATONIC = [0, 3, 5, 7, 10];

const PITCH_CLASS_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

/**
 * Convert MIDI note number to frequency (Hz) at A4 = 440 Hz.
 * @param {number} midi
 * @returns {number}
 */
export function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * Map a numeric data value to a frequency on a musical scale.
 *
 * @param {number} value
 * @param {Object} [options]
 * @param {number} [options.min=5]
 * @param {number} [options.max=100]
 * @param {number[]} [options.scale=C_MAJOR_PENTATONIC]
 * @param {number} [options.baseMidi=60] — C4
 * @param {number} [options.octaveSpan=2]
 * @returns {number}
 */
export function quantizeToScale(
  value,
  {
    min = 5,
    max = 100,
    scale = C_MAJOR_PENTATONIC,
    baseMidi = 60,
    octaveSpan = 2,
  } = {}
) {
  const numeric = Number(value);
  const safeValue = Number.isFinite(numeric) ? numeric : (min + max) / 2;
  const clamped = Math.max(min, Math.min(max, safeValue));
  const normalized = (clamped - min) / (max - min);
  const totalNotes = scale.length * octaveSpan;
  const noteIndex = Math.round(normalized * (totalNotes - 1));
  const octave = Math.floor(noteIndex / scale.length);
  const degree = noteIndex % scale.length;
  const midi = baseMidi + octave * 12 + scale[degree];
  return midiToFrequency(midi);
}

/**
 * Map a step index to a note name on a pentatonic scale (for melodic micro-events).
 *
 * @param {number} index
 * @param {Object} [options]
 * @param {number[]} [options.scale=C_MAJOR_PENTATONIC]
 * @param {number} [options.baseMidi=60]
 * @param {number} [options.octaveSpan=2]
 * @returns {string}
 */
export function getPentatonicNoteName(
  index,
  { scale = C_MAJOR_PENTATONIC, baseMidi = 60, octaveSpan = 2 } = {}
) {
  const totalNotes = scale.length * octaveSpan;
  const wrapped = ((Math.floor(index) % totalNotes) + totalNotes) % totalNotes;
  const octaveOffset = Math.floor(wrapped / scale.length);
  const degree = wrapped % scale.length;
  const midi = baseMidi + octaveOffset * 12 + scale[degree];
  const name = PITCH_CLASS_NAMES[midi % 12];
  const octaveNum = Math.floor(midi / 12) - 1;
  return `${name}${octaveNum}`;
}
