/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Maps bar value (typical range ~5–100) to compare-tone frequency — matches Tone.js pluck range in soundManager.
 * @param {number} value
 * @returns {number}
 */
export function getCompareFrequency(value) {
  return 150 + ((value - 5) / 95) * 200;
}

/**
 * Pivot tone frequency range (matches soundManager.playPivot).
 * @param {number} value
 * @returns {number}
 */
export function getPivotFrequency(value) {
  return 100 + ((value - 5) / 95) * 100;
}
