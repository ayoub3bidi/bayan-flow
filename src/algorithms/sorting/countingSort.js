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
 * Counting Sort Algorithm
 * Time Complexity: O(n + k) where k is the range of input
 * Space Complexity: O(n + k)
 *
 * Counting Sort is a non-comparison sorting algorithm that works by counting
 * the occurrences of each unique element, then using arithmetic to determine
 * the positions of each element in the output sequence.
 *
 * Note: This implementation only works with non-negative integers.
 *
 * @param {number[]} array - The array to sort (non-negative integers only)
 * @returns {Object[]} - Array of animation steps
 */
export function countingSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  // Record initial state
  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.countingSort',
  });

  if (n === 0) {
    steps.push({
      array: [...arr],
      states: Array(n).fill(ELEMENT_STATES.SORTED),
      description: getAlgorithmDescription(ALGORITHM_STEPS.COMPLETED),
    });
    return steps;
  }

  // Find the maximum value to determine counting array size
  let max = arr[0];
  for (let i = 1; i < n; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: getAlgorithmDescription(ALGORITHM_STEPS.COUNTING_FIND_MAX, {
      max,
    }),
  });

  // Initialize counting array
  const count = Array(max + 1).fill(0);

  // Count occurrences of each element
  for (let i = 0; i < n; i++) {
    const value = arr[i];
    count[value]++;

    const countStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    countStates[i] = ELEMENT_STATES.COMPARING;

    steps.push({
      array: [...arr],
      states: countStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.COUNTING_COUNT, {
        value,
        count: count[value],
      }),
    });
  }

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.AUXILIARY),
    description: getAlgorithmDescription(
      ALGORITHM_STEPS.COUNTING_COUNT_COMPLETE
    ),
  });

  // Modify count array to contain actual positions
  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];
  }

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.AUXILIARY),
    description: getAlgorithmDescription(
      ALGORITHM_STEPS.COUNTING_CUMULATIVE_COMPLETE
    ),
  });

  // Build the output array
  const output = Array(n);
  for (let i = n - 1; i >= 0; i--) {
    const value = arr[i];
    const position = count[value] - 1;
    output[position] = value;
    count[value]--;

    // Show the placement
    const outputStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    for (let j = 0; j < n; j++) {
      if (output[j] !== undefined) {
        outputStates[j] = ELEMENT_STATES.SORTED;
      }
    }
    outputStates[position] = ELEMENT_STATES.SWAPPING;

    steps.push({
      array: [...output].map((v, idx) => (v !== undefined ? v : arr[idx])),
      states: outputStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.COUNTING_PLACE, {
        value,
        position,
      }),
    });
  }

  // Copy output array to arr
  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
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
 * Note: This implementation only works with non-negative integers.
 * @param {number[]} array - Array to sort (non-negative integers only)
 * @returns {number[]} - Sorted array
 */
export function countingSortPure(array) {
  const arr = [...array];
  const n = arr.length;
  if (n === 0) return arr;

  let min = arr[0];
  let max = arr[0];

  for (let i = 1; i < n; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > max) max = arr[i];
  }

  const range = max - min + 1;
  const count = Array(range).fill(0);

  for (let i = 0; i < n; i++) {
    count[arr[i] - min]++;
  }

  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }

  const output = Array(n);
  for (let i = n - 1; i >= 0; i--) {
    const value = arr[i];
    const idx = value - min;
    output[count[idx] - 1] = value;
    count[idx]--;
  }

  return output;
}
