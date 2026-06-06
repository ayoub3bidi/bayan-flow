/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { quantizeToScale } from './scaleQuantizer.js';

/**
 * Maps bar value (typical range ~5–100) to a pentatonic compare-tone frequency.
 * @param {number} value
 * @returns {number}
 */
export function getCompareFrequency(value) {
  return quantizeToScale(value, { baseMidi: 60, octaveSpan: 2 });
}

/**
 * Pivot tone — same pentatonic mapping, lower register (C3–C5 range).
 * @param {number} value
 * @returns {number}
 */
export function getPivotFrequency(value) {
  return quantizeToScale(value, { baseMidi: 48, octaveSpan: 2 });
}
