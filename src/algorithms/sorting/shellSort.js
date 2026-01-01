/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ELEMENT_STATES } from '../../constants';
import {
  getAlgorithmDescription,
  ALGORITHM_STEPS,
} from '../../utils/algorithmTranslations';

/**
 * Shell Sort Algorithm (Using Knuth's Gap Sequence)
 * Time Complexity: O(n^(3/2)) with Knuth's sequence
 * Space Complexity: O(1)
 *
 * Shell Sort is an optimization of Insertion Sort that allows the exchange of items
 * that are far apart. The algorithm sorts elements at specific intervals (gaps),
 * gradually reducing the gap until it becomes 1 (at which point it's like insertion sort).
 *
 * This implementation uses Knuth's gap sequence: 1, 4, 13, 40, 121, 364...
 * Formula: gap = (3^k - 1) / 2, which provides O(n^(3/2)) worst-case performance.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function shellSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  // Record initial state
  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.shellSort',
  });

  // Calculate initial gap using Knuth's sequence: (3^k - 1) / 2
  // Start with the largest gap less than n/3
  let gap = 1;
  while (gap < Math.floor(n / 3)) {
    gap = gap * 3 + 1; // 1, 4, 13, 40, 121, 364...
  }

  // Start with the calculated gap, then reduce using reverse formula
  while (gap > 0) {
    // Show gap size with explanation
    steps.push({
      array: [...arr],
      states: Array(n).fill(ELEMENT_STATES.DEFAULT),
      description: getAlgorithmDescription(ALGORITHM_STEPS.SHELL_GAP, {
        gap,
      }),
    });

    // Do a gapped insertion sort for this gap size
    for (let i = gap; i < n; i++) {
      const temp = arr[i];

      // Show current element being positioned (use AUXILIARY for key element)
      const keyStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
      keyStates[i] = ELEMENT_STATES.AUXILIARY;

      steps.push({
        array: [...arr],
        states: keyStates,
        description: getAlgorithmDescription(ALGORITHM_STEPS.SHELL_SELECTING, {
          value: temp,
          position: i,
          gap,
        }),
      });

      let j;
      // Shift earlier gap-sorted elements up until the correct location for arr[i] is found
      for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
        // Show comparison - highlight both elements across the gap
        const compareStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
        compareStates[j] = ELEMENT_STATES.COMPARING;
        compareStates[j - gap] = ELEMENT_STATES.COMPARING;
        // Keep the key element visible
        if (j !== i) {
          compareStates[i] = ELEMENT_STATES.AUXILIARY;
        }

        steps.push({
          array: [...arr],
          states: compareStates,
          description: getAlgorithmDescription(
            ALGORITHM_STEPS.SHELL_COMPARING,
            {
              a: arr[j - gap],
              b: temp,
              gap,
              posA: j - gap,
              posB: j,
            }
          ),
        });

        // Shift element
        arr[j] = arr[j - gap];

        const shiftStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
        shiftStates[j] = ELEMENT_STATES.SWAPPING;
        shiftStates[j - gap] = ELEMENT_STATES.AUXILIARY;

        steps.push({
          array: [...arr],
          states: shiftStates,
          description: getAlgorithmDescription(ALGORITHM_STEPS.SHELL_SHIFTING, {
            value: arr[j],
            from: j - gap,
            to: j,
          }),
        });
      }

      // Put temp (the original arr[i]) in its correct location
      arr[j] = temp;

      const placedStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
      placedStates[j] = ELEMENT_STATES.SWAPPING;

      steps.push({
        array: [...arr],
        states: placedStates,
        description: getAlgorithmDescription(ALGORITHM_STEPS.SHELL_PLACED, {
          value: temp,
          position: j,
        }),
      });
    }

    // Show completion of this gap sequence
    steps.push({
      array: [...arr],
      states: Array(n).fill(ELEMENT_STATES.DEFAULT),
      description: getAlgorithmDescription(ALGORITHM_STEPS.SHELL_GAP_COMPLETE, {
        gap,
      }),
    });

    // Reduce gap using Knuth's sequence: gap = (gap - 1) / 3
    gap = Math.floor((gap - 1) / 3);
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
 * Uses Knuth's gap sequence for O(n^(3/2)) performance
 * @param {number[]} array - Array to sort
 * @returns {number[]} - Sorted array
 */
export function shellSortPure(array) {
  const arr = [...array];
  const n = arr.length;

  // Calculate initial gap using Knuth's sequence: (3^k - 1) / 2
  let gap = 1;
  while (gap < Math.floor(n / 3)) {
    gap = gap * 3 + 1;
  }

  // Start with the calculated gap, then reduce using reverse formula
  while (gap > 0) {
    // Do a gapped insertion sort for this gap size
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j;

      for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
        arr[j] = arr[j - gap];
      }

      arr[j] = temp;
    }

    // Reduce gap using Knuth's sequence
    gap = Math.floor((gap - 1) / 3);
  }

  return arr;
}
