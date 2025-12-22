/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import i18n from '../i18n';

/**
 * Get translated algorithm description
 * @param {string} key - Translation key
 * @param {Object} options - Interpolation options
 * @returns {string} Translated description
 */
export function getAlgorithmDescription(key, options = {}) {
  return i18n.t(`algorithmSteps.${key}`, options);
}

/**
 * Common algorithm step descriptions with interpolation support
 */
export const ALGORITHM_STEPS = {
  // Common
  STARTING: 'starting',
  COMPLETED: 'completed',
  COMPARING: 'comparing',
  SWAPPING: 'swapping',

  // Bubble Sort
  BUBBLE_PASS_COMPLETE: 'bubblePassComplete',

  // Quick Sort
  PIVOT_SELECTED: 'pivotSelected',
  PIVOT_PLACED: 'pivotPlaced',

  // Merge Sort
  DIVIDING: 'dividing',
  MERGING: 'merging',
  PLACED: 'placed',
  PLACED_REMAINING: 'placedRemaining',
  MERGED_SECTION: 'mergedSection',

  // Selection Sort
  SELECTION_FINDING_MIN: 'selectionFindingMin',
  SELECTION_NEW_MIN: 'selectionNewMin',
  SELECTION_PLACED: 'selectionPlaced',

  // Pathfinding
  EXPLORING: 'exploring',
  ADDED_TO_QUEUE: 'addedToQueue',
  PATH_FOUND: 'pathFound',
  NO_PATH: 'noPath',
};
