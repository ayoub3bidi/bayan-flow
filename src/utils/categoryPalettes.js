/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ALGORITHM_TYPES } from '../constants/index.js';

/** @typedef {'softSynth' | 'pluckSynth' | 'kalimbaSynth' | 'bellSynth' | 'polySynth'} InstrumentKey */

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
 * @property {number} compareVolumeDb
 * @property {number} microVolumeDb
 * @property {number} accentVolumeDb
 * @property {number} milestoneVolumeDb
 */

/** Short ascending cue when a sorting pass finishes (partial progress). */
export const PASS_COMPLETE_CHORD = ['G4', 'C5'];

/** Pentatonic milestone voicings (ascending arpeggios). */
export const MILESTONE_CHORDS = {
  complete: ['C4', 'E4', 'A4'],
  pathFound: ['C3', 'E3', 'A3', 'C4'],
  targetFound: ['E4', 'G4', 'A4'],
  componentComplete: ['A3', 'C4', 'E4'],
};

/** Minor-pentatonic resolution voicings (descending arpeggios). */
export const NEGATIVE_CHORDS = {
  noResult: ['E4', 'D4', 'C4', 'A3'],
  cycle: ['E4', 'C4', 'A3'],
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
  compareVolumeDb: 0,
  microVolumeDb: -2,
  accentVolumeDb: 0,
  milestoneVolumeDb: -1,
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
  },
  [ALGORITHM_TYPES.PATHFINDING]: {
    ...DEFAULT_PALETTE,
    compareInstrument: 'softSynth',
    visitInstrument: 'softSynth',
    frontierInstrument: 'pluckSynth',
  },
  [ALGORITHM_TYPES.SEARCHING]: {
    ...DEFAULT_PALETTE,
    compareInstrument: 'pluckSynth',
    visitInstrument: 'pluckSynth',
  },
  [ALGORITHM_TYPES.TREE_TRAVERSAL]: {
    ...DEFAULT_PALETTE,
    visitInstrument: 'bellSynth',
    frontierInstrument: 'bellSynth',
  },
  [ALGORITHM_TYPES.GRAPH_ALGORITHM]: {
    ...DEFAULT_PALETTE,
    visitInstrument: 'softSynth',
    edgeConsiderInstrument: 'pluckSynth',
    edgeSelectInstrument: 'kalimbaSynth',
    matrixConsiderInstrument: 'softSynth',
    matrixUpdateInstrument: 'softSynth',
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
