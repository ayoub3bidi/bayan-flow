/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ELEMENT_STATES } from '../../constants';

/**
 * Bubble Sort Algorithm
 * Time Complexity: O(n²)
 * Space Complexity: O(1)
 *
 * Bubble Sort repeatedly steps through the list, compares adjacent elements
 * and swaps them if they are in the wrong order. The pass through the list
 * is repeated until the list is sorted.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function bubbleSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  // Record initial state
  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'Starting Bubble Sort',
  });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      // Comparing two adjacent elements
      const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
      states[j] = ELEMENT_STATES.COMPARING;
      states[j + 1] = ELEMENT_STATES.COMPARING;

      // Mark already sorted elements
      for (let k = n - i; k < n; k++) {
        states[k] = ELEMENT_STATES.SORTED;
      }

      steps.push({
        array: [...arr],
        states: [...states],
        description: `Comparing ${arr[j]} and ${arr[j + 1]}`,
      });

      // Swap if elements are in wrong order
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;

        // Show swap animation
        const swapStates = [...states];
        swapStates[j] = ELEMENT_STATES.SWAPPING;
        swapStates[j + 1] = ELEMENT_STATES.SWAPPING;

        steps.push({
          array: [...arr],
          states: swapStates,
          description: `Swapped ${arr[j + 1]} and ${arr[j]}`,
        });
      }
    }

    // Mark the last element of this pass as sorted
    const sortedStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    for (let k = n - i - 1; k < n; k++) {
      sortedStates[k] = ELEMENT_STATES.SORTED;
    }

    steps.push({
      array: [...arr],
      states: sortedStates,
      description: `Pass ${i + 1} complete. Element at position ${n - i - 1} is in correct position.`,
    });

    // If no swaps occurred, array is sorted
    if (!swapped) {
      break;
    }
  }

  // Final state - all sorted
  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.SORTED),
    description: 'Array is fully sorted!',
  });

  return steps;
}

/**
 * Pure sorting function without animation steps (for testing)
 * @param {number[]} array - Array to sort
 * @returns {number[]} - Sorted array
 */
export function bubbleSortPure(array) {
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }

  return arr;
}
