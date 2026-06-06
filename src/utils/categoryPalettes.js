/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ALGORITHM_TYPES } from '../constants/index.js';

/** @typedef {'softSynth' | 'pluckSynth' | 'kalimbaSynth' | 'bellSynth' | 'polySynth'} InstrumentKey */

/**
 * @typedef {Object} CategoryChordSet
 * @property {string[]} [complete]
 * @property {string[]} [pathFound]
 * @property {string[]} [targetFound]
 * @property {string[]} [componentComplete]
 * @property {string[]} [passComplete]
 * @property {string[]} [noResult]
 * @property {string[]} [cycle]
 */

/**
 * @typedef {Object} CategorySoundPalette
 * @property {InstrumentKey} compareInstrument
 * @property {InstrumentKey} swapInstrument
 * @property {InstrumentKey} pivotInstrument
 * @property {InstrumentKey} visitInstrument
 * @property {InstrumentKey} frontierInstrument
 * @property {InstrumentKey} edgeConsiderInstrument
 * @property {InstrumentKey} edgeSelectInstrument
 * @property {InstrumentKey} matrixConsiderInstrument
 * @property {InstrumentKey} matrixUpdateInstrument
 * @property {InstrumentKey} milestoneInstrument
 * @property {string} compareDuration
 * @property {string} microDuration
 * @property {string} accentDuration
 * @property {number} compareVolumeDb
 * @property {number} microVolumeDb
 * @property {number} accentVolumeDb
 * @property {number} milestoneVolumeDb
 * @property {number} melodicBaseMidi
 * @property {CategoryChordSet} chords
 */

/** Short ascending cue when a sorting pass finishes (partial progress). */
export const PASS_COMPLETE_CHORD = ['G4', 'C5'];

/** Default pentatonic milestone voicings (ascending arpeggios). */
export const MILESTONE_CHORDS = {
  complete: ['C4', 'E4', 'A4'],
  pathFound: ['D4', 'G4', 'A4', 'C5'],
  targetFound: ['E4', 'G4', 'A4', 'C5'],
  componentComplete: ['A3', 'C4', 'E4', 'G4'],
};

/** Default minor-pentatonic resolution voicings (descending arpeggios). */
export const NEGATIVE_CHORDS = {
  noResult: ['E4', 'D4', 'C4', 'A3'],
  cycle: ['E4', 'C4', 'A3'],
};

const DEFAULT_CHORDS = {
  ...MILESTONE_CHORDS,
  ...NEGATIVE_CHORDS,
  passComplete: PASS_COMPLETE_CHORD,
};

const DEFAULT_PALETTE = {
  compareInstrument: 'pluckSynth',
  swapInstrument: 'kalimbaSynth',
  pivotInstrument: 'softSynth',
  visitInstrument: 'softSynth',
  frontierInstrument: 'pluckSynth',
  edgeConsiderInstrument: 'pluckSynth',
  edgeSelectInstrument: 'kalimbaSynth',
  matrixConsiderInstrument: 'softSynth',
  matrixUpdateInstrument: 'softSynth',
  milestoneInstrument: 'polySynth',
  compareDuration: '16n',
  microDuration: '8n',
  accentDuration: '16n',
  compareVolumeDb: 0,
  microVolumeDb: 0,
  accentVolumeDb: 2,
  milestoneVolumeDb: 1,
  melodicBaseMidi: 60,
  chords: DEFAULT_CHORDS,
};

/** @type {Record<string, CategorySoundPalette>} */
export const CATEGORY_SOUND_PALETTES = {
  [ALGORITHM_TYPES.SORTING]: {
    ...DEFAULT_PALETTE,
    compareInstrument: 'kalimbaSynth',
    swapInstrument: 'kalimbaSynth',
    compareDuration: '8n',
    compareVolumeDb: 2,
    accentVolumeDb: 3,
    milestoneVolumeDb: 1,
    chords: {
      ...DEFAULT_CHORDS,
      passComplete: PASS_COMPLETE_CHORD,
    },
  },
  [ALGORITHM_TYPES.PATHFINDING]: {
    ...DEFAULT_PALETTE,
    visitInstrument: 'softSynth',
    frontierInstrument: 'kalimbaSynth',
    microVolumeDb: 1,
    accentVolumeDb: 2,
    milestoneVolumeDb: 2,
    melodicBaseMidi: 57,
    chords: {
      ...DEFAULT_CHORDS,
      pathFound: ['D4', 'F#4', 'A4', 'D5'],
      noResult: ['B3', 'A3', 'G3', 'E3'],
    },
  },
  [ALGORITHM_TYPES.SEARCHING]: {
    ...DEFAULT_PALETTE,
    compareInstrument: 'kalimbaSynth',
    visitInstrument: 'kalimbaSynth',
    frontierInstrument: 'softSynth',
    compareDuration: '8n',
    compareVolumeDb: 2,
    microVolumeDb: 0,
    accentVolumeDb: 2,
    milestoneVolumeDb: 2,
    chords: {
      ...DEFAULT_CHORDS,
      targetFound: ['E4', 'A4', 'B4', 'E5'],
      pathFound: ['G3', 'C4', 'E4', 'G4'],
      noResult: ['D4', 'C4', 'A3'],
    },
  },
  [ALGORITHM_TYPES.TREE_TRAVERSAL]: {
    ...DEFAULT_PALETTE,
    visitInstrument: 'bellSynth',
    frontierInstrument: 'bellSynth',
    microVolumeDb: 2,
    accentVolumeDb: 2,
    milestoneVolumeDb: 2,
    melodicBaseMidi: 62,
    chords: {
      ...DEFAULT_CHORDS,
      complete: ['C4', 'E4', 'G4', 'C5'],
    },
  },
  [ALGORITHM_TYPES.GRAPH_ALGORITHM]: {
    ...DEFAULT_PALETTE,
    visitInstrument: 'softSynth',
    frontierInstrument: 'kalimbaSynth',
    edgeConsiderInstrument: 'kalimbaSynth',
    edgeSelectInstrument: 'kalimbaSynth',
    matrixConsiderInstrument: 'softSynth',
    matrixUpdateInstrument: 'kalimbaSynth',
    microVolumeDb: 0,
    accentVolumeDb: 3,
    milestoneVolumeDb: 2,
    melodicBaseMidi: 55,
    chords: {
      ...DEFAULT_CHORDS,
      pathFound: ['C4', 'E4', 'G4', 'C5'],
      complete: ['C4', 'E4', 'A4', 'C5'],
      componentComplete: ['G3', 'B3', 'D4', 'G4'],
      cycle: ['D4', 'B3', 'G3'],
    },
  },
};

/**
 * @param {string} [algorithmType]
 * @returns {CategorySoundPalette}
 */
export function getPaletteForCategory(algorithmType) {
  if (!algorithmType) return DEFAULT_PALETTE;
  return CATEGORY_SOUND_PALETTES[algorithmType] ?? DEFAULT_PALETTE;
}

/**
 * Resolve a chord voicing for the active category, with global fallbacks.
 *
 * @param {string} [algorithmType]
 * @param {keyof typeof MILESTONE_CHORDS | keyof typeof NEGATIVE_CHORDS | 'passComplete'} chordKey
 * @returns {string[]}
 */
export function getChordForCategory(algorithmType, chordKey) {
  const palette = getPaletteForCategory(algorithmType);
  const fromPalette = palette.chords?.[chordKey];
  if (fromPalette?.length) return fromPalette;

  if (chordKey === 'passComplete') return PASS_COMPLETE_CHORD;
  return (
    MILESTONE_CHORDS[chordKey] ??
    NEGATIVE_CHORDS[chordKey] ??
    PASS_COMPLETE_CHORD
  );
}
