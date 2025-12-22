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
 * Quick Sort Algorithm
 * Time Complexity: O(n log n) average, O(n²) worst case
 * Space Complexity: O(log n)
 *
 * Quick Sort is a divide-and-conquer algorithm. It picks an element as pivot
 * and partitions the array around the pivot. There are many different versions
 * of quickSort that pick pivot in different ways.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function quickSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.quickSort',
  });

  quickSortHelper(arr, 0, n - 1, steps);

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.SORTED),
    description: getAlgorithmDescription(ALGORITHM_STEPS.COMPLETED),
  });

  return steps;
}

function quickSortHelper(arr, low, high, steps) {
  if (low < high) {
    // Partition the array and get the pivot index
    const pivotIndex = partition(arr, low, high, steps);

    // Recursively sort elements before and after partition
    quickSortHelper(arr, low, pivotIndex - 1, steps);
    quickSortHelper(arr, pivotIndex + 1, high, steps);
  }
}

function partition(arr, low, high, steps) {
  const pivot = arr[high];
  const n = arr.length;

  // Show pivot selection
  const pivotStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
  pivotStates[high] = ELEMENT_STATES.PIVOT;
  steps.push({
    array: [...arr],
    states: pivotStates,
    description: getAlgorithmDescription(ALGORITHM_STEPS.PIVOT_SELECTED, {
      pivot,
      index: high,
    }),
  });

  let i = low - 1;

  for (let j = low; j < high; j++) {
    // Show comparison
    const compareStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    compareStates[high] = ELEMENT_STATES.PIVOT;
    compareStates[j] = ELEMENT_STATES.COMPARING;
    if (i >= 0) compareStates[i] = ELEMENT_STATES.AUXILIARY;

    steps.push({
      array: [...arr],
      states: compareStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.COMPARING, {
        a: arr[j],
        b: pivot,
      }),
    });

    if (arr[j] < pivot) {
      i++;

      // Swap elements
      [arr[i], arr[j]] = [arr[j], arr[i]];

      // Show swap
      const swapStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
      swapStates[high] = ELEMENT_STATES.PIVOT;
      swapStates[i] = ELEMENT_STATES.SWAPPING;
      swapStates[j] = ELEMENT_STATES.SWAPPING;

      steps.push({
        array: [...arr],
        states: swapStates,
        description: getAlgorithmDescription(ALGORITHM_STEPS.SWAPPING, {
          a: arr[i],
          b: arr[j],
        }),
      });
    }
  }

  // Place pivot in correct position
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

  const finalStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
  finalStates[i + 1] = ELEMENT_STATES.SORTED;

  steps.push({
    array: [...arr],
    states: finalStates,
    description: getAlgorithmDescription(ALGORITHM_STEPS.PIVOT_PLACED, {
      pivot,
      position: i + 1,
    }),
  });

  return i + 1;
}

/**
 * Pure sorting function without animation steps (for testing)
 * @param {number[]} array - Array to sort
 * @returns {number[]} - Sorted array
 */
export function quickSortPure(array) {
  const arr = [...array];

  function quickSortHelperPure(arr, low, high) {
    if (low < high) {
      const pivotIndex = partitionPure(arr, low, high);
      quickSortHelperPure(arr, low, pivotIndex - 1);
      quickSortHelperPure(arr, pivotIndex + 1, high);
    }
  }

  function partitionPure(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }

  quickSortHelperPure(arr, 0, arr.length - 1);
  return arr;
}
