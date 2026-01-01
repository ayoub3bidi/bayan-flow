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
 * Insertion Sort Algorithm
 * Time Complexity: O(n²)
 * Space Complexity: O(1)
 *
 * Insertion Sort builds the final sorted array one item at a time.
 * It iterates through the array, removing one element per iteration,
 * finding the location it belongs within the sorted list, and inserting it there.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function insertionSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  // Record initial state
  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.insertionSort',
  });

  // Start from second element (index 1)
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    // Show current element being inserted as auxiliary (key element)
    const keyStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    keyStates[i] = ELEMENT_STATES.AUXILIARY;

    // Mark already sorted elements
    for (let k = 0; k < i; k++) {
      keyStates[k] = ELEMENT_STATES.SORTED;
    }

    steps.push({
      array: [...arr],
      states: keyStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.INSERTION_KEY, {
        value: key,
        position: i,
      }),
    });

    // Move elements of arr[0..i-1], that are greater than key,
    // to one position ahead of their current position
    while (j >= 0 && arr[j] > key) {
      // Show comparison
      const compareStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
      for (let k = 0; k < i; k++) {
        if (k !== j) {
          compareStates[k] = ELEMENT_STATES.SORTED;
        }
      }
      compareStates[j] = ELEMENT_STATES.COMPARING;
      // Mark the position where key will be inserted with AUXILIARY
      if (j + 1 <= i) {
        compareStates[j + 1] = ELEMENT_STATES.AUXILIARY;
      }

      steps.push({
        array: [...arr],
        states: compareStates,
        description: getAlgorithmDescription(ALGORITHM_STEPS.COMPARING, {
          a: arr[j],
          b: key,
        }),
      });

      // Shift element to the right
      const oldValue = arr[j];
      arr[j + 1] = arr[j];

      const shiftStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
      for (let k = 0; k < i; k++) {
        if (k !== j && k !== j + 1) {
          shiftStates[k] = ELEMENT_STATES.SORTED;
        }
      }
      shiftStates[j] = ELEMENT_STATES.AUXILIARY;
      shiftStates[j + 1] = ELEMENT_STATES.SWAPPING;

      steps.push({
        array: [...arr],
        states: shiftStates,
        description: getAlgorithmDescription(ALGORITHM_STEPS.INSERTION_SHIFT, {
          value: oldValue,
          from: j,
          to: j + 1,
        }),
      });

      j--;
    }

    // Insert key at its correct position
    arr[j + 1] = key;

    const insertStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    for (let k = 0; k <= i; k++) {
      insertStates[k] = ELEMENT_STATES.SORTED;
    }
    insertStates[j + 1] = ELEMENT_STATES.SWAPPING;

    steps.push({
      array: [...arr],
      states: insertStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.INSERTION_PLACED, {
        value: key,
        position: j + 1,
      }),
    });

    // Show final state of this pass with all elements up to i sorted
    const passCompleteStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    for (let k = 0; k <= i; k++) {
      passCompleteStates[k] = ELEMENT_STATES.SORTED;
    }

    steps.push({
      array: [...arr],
      states: passCompleteStates,
      description: getAlgorithmDescription(
        ALGORITHM_STEPS.INSERTION_PASS_COMPLETE,
        {
          pass: i,
          elements: i + 1,
        }
      ),
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
export function insertionSortPure(array) {
  const arr = [...array];
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }

    arr[j + 1] = key;
  }

  return arr;
}
