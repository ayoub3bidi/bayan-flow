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

/**
 * Comb Sort Algorithm
 * Time Complexity: O(n²) worst case, O(n log n) best case
 * Space Complexity: O(1)
 *
 * Comb Sort improves on Bubble Sort by comparing elements separated by a shrinking gap.
 * The gap shrinks by a factor of 1.3 each iteration until it reaches 1.
 * This helps eliminate small values near the end of the array ("turtles") faster than Bubble Sort.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function combSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;
  const shrinkFactor = 1.3;

  // Record initial state
  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.combSort',
  });

  let gap = n;
  let swapped = true;

  while (gap > 1 || swapped) {
    // Update gap for next comb
    gap = Math.floor(gap / shrinkFactor);
    if (gap < 1) {
      gap = 1;
    }

    // Show gap size
    steps.push({
      array: [...arr],
      states: Array(n).fill(ELEMENT_STATES.DEFAULT),
      description: getAlgorithmDescription(ALGORITHM_STEPS.COMB_GAP, {
        gap,
      }),
    });

    swapped = false;

    // Compare all elements with current gap
    for (let i = 0; i + gap < n; i++) {
      // Comparing two elements separated by gap
      const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
      states[i] = ELEMENT_STATES.COMPARING;
      states[i + gap] = ELEMENT_STATES.COMPARING;

      steps.push({
        array: [...arr],
        states: [...states],
        description: getAlgorithmDescription(ALGORITHM_STEPS.COMPARING, {
          a: arr[i],
          b: arr[i + gap],
        }),
      });

      // Swap if elements are in wrong order
      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        swapped = true;

        // Show swap animation
        const swapStates = [...states];
        swapStates[i] = ELEMENT_STATES.SWAPPING;
        swapStates[i + gap] = ELEMENT_STATES.SWAPPING;

        steps.push({
          array: [...arr],
          states: swapStates,
          description: getAlgorithmDescription(ALGORITHM_STEPS.SWAPPING, {
            a: arr[i + gap],
            b: arr[i],
          }),
        });
      }
    }

    // Show completion of this gap pass
    steps.push({
      array: [...arr],
      states: Array(n).fill(ELEMENT_STATES.DEFAULT),
      description: getAlgorithmDescription(ALGORITHM_STEPS.COMB_GAP_COMPLETE, {
        gap,
      }),
    });
  }

  // Final state - all sorted
  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.SORTED),
    description: getAlgorithmDescription(ALGORITHM_STEPS.COMPLETED),
  });

  return steps;
}

/**
 * Pure sorting function without animation steps (for testing)
 * @param {number[]} array - Array to sort
 * @returns {number[]} - Sorted array
 */
export function combSortPure(array) {
  const arr = [...array];
  const n = arr.length;
  const shrinkFactor = 1.3;

  let gap = n;
  let swapped = true;

  while (gap > 1 || swapped) {
    gap = Math.floor(gap / shrinkFactor);
    if (gap < 1) {
      gap = 1;
    }

    swapped = false;

    for (let i = 0; i + gap < n; i++) {
      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        swapped = true;
      }
    }
  }

  return arr;
}
