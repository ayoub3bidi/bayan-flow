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
 * Shell Sort Algorithm
 * Time Complexity: O(n log n) to O(n²) depending on gap sequence
 * Space Complexity: O(1)
 *
 * Shell Sort is an optimization of Insertion Sort that allows the exchange of items
 * that are far apart. The algorithm sorts elements at specific intervals (gaps),
 * gradually reducing the gap until it becomes 1 (at which point it's like insertion sort).
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

  // Start with a large gap, then reduce the gap
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    // Show gap size
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

      // Show current element being positioned
      const keyStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
      keyStates[i] = ELEMENT_STATES.PIVOT;

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
        // Show comparison
        const compareStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
        compareStates[j] = ELEMENT_STATES.COMPARING;
        compareStates[j - gap] = ELEMENT_STATES.COMPARING;

        steps.push({
          array: [...arr],
          states: compareStates,
          description: getAlgorithmDescription(ALGORITHM_STEPS.COMPARING, {
            a: arr[j - gap],
            b: temp,
          }),
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
export function shellSortPure(array) {
  const arr = [...array];
  const n = arr.length;

  // Start with a large gap, then reduce the gap
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    // Do a gapped insertion sort for this gap size
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j;

      for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
        arr[j] = arr[j - gap];
      }

      arr[j] = temp;
    }
  }

  return arr;
}
