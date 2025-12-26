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

  // Insertion Sort
  INSERTION_KEY: 'insertionKey',
  INSERTION_SHIFT: 'insertionShift',
  INSERTION_PLACED: 'insertionPlaced',
  INSERTION_PASS_COMPLETE: 'insertionPassComplete',

  // Heap Sort
  HEAP_HEAPIFY: 'heapHeapify',
  HEAP_EXTRACT_MAX: 'heapExtractMax',
  HEAP_PLACED: 'heapPlaced',

  // Shell Sort
  SHELL_GAP: 'shellGap',
  SHELL_SELECTING: 'shellSelecting',
  SHELL_COMPARING: 'shellComparing',
  SHELL_SHIFTING: 'shellShifting',
  SHELL_PLACED: 'shellPlaced',
  SHELL_GAP_COMPLETE: 'shellGapComplete',

  // Pathfinding
  EXPLORING: 'exploring',
  ADDED_TO_QUEUE: 'addedToQueue',
  PATH_FOUND: 'pathFound',
  NO_PATH: 'noPath',
};
