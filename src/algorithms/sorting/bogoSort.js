/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ELEMENT_STATES } from '../../constants';
import {
  getAlgorithmDescription,
  ALGORITHM_STEPS,
} from '../../utils/algorithmTranslations';

const MAX_SHUFFLES = 1000;

/**
 * Bogo Sort Algorithm (Permutation Sort)
 * Time Complexity: O(n × n!) average, Unbounded worst case
 * Space Complexity: O(1)
 *
 * Bogo Sort repeatedly randomly shuffles the array until it happens to be sorted.
 * It is intentionally inefficient and mainly used for educational purposes.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function bogoSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.bogoSort',
  });

  let shuffleCount = 0;

  while (!isSorted(arr) && shuffleCount < MAX_SHUFFLES) {
    shuffleCount++;

    // Check if sorted
    const checkStates = Array(n).fill(ELEMENT_STATES.COMPARING);
    steps.push({
      array: [...arr],
      states: checkStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.BOGO_CHECKING, {
        attempt: shuffleCount,
      }),
    });

    if (isSorted(arr)) break;

    // Shuffle the array
    shuffle(arr);

    const shuffleStates = Array(n).fill(ELEMENT_STATES.SWAPPING);
    steps.push({
      array: [...arr],
      states: shuffleStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.BOGO_SHUFFLING, {
        attempt: shuffleCount,
      }),
    });
  }

  if (isSorted(arr)) {
    steps.push({
      array: [...arr],
      states: Array(n).fill(ELEMENT_STATES.SORTED),
      description: getAlgorithmDescription(ALGORITHM_STEPS.BOGO_SUCCESS, {
        attempts: shuffleCount,
      }),
    });
  } else {
    steps.push({
      array: [...arr],
      states: Array(n).fill(ELEMENT_STATES.DEFAULT),
      description: getAlgorithmDescription(ALGORITHM_STEPS.BOGO_FAILED, {
        maxAttempts: MAX_SHUFFLES,
      }),
    });
  }

  return steps;
}

/**
 * Check if array is sorted
 * @param {number[]} arr - Array to check
 * @returns {boolean} - True if sorted
 */
function isSorted(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}

/**
 * Fisher-Yates shuffle algorithm
 * @param {number[]} arr - Array to shuffle (modified in place)
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Pure sorting function without animation steps (for testing)
 * @param {number[]} array - Array to sort
 * @returns {number[]} - Sorted array
 */
export function bogoSortPure(array) {
  const arr = [...array];
  let attempts = 0;

  while (!isSorted(arr) && attempts < MAX_SHUFFLES) {
    shuffle(arr);
    attempts++;
  }

  return arr;
}
