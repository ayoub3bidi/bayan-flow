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
 * Heap Sort Algorithm
 * Time Complexity: O(n log n)
 * Space Complexity: O(1)
 *
 * Heap Sort is a comparison-based sorting algorithm that uses a binary heap data structure.
 * It divides its input into a sorted and an unsorted region, and iteratively shrinks the
 * unsorted region by extracting the largest element and moving it to the sorted region.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function heapSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.heapSort',
  });

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i, steps);
  }

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end (largest element to sorted position)
    [arr[0], arr[i]] = [arr[i], arr[0]];

    const swapStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    swapStates[0] = ELEMENT_STATES.SWAPPING;
    swapStates[i] = ELEMENT_STATES.SWAPPING;

    // Mark elements after i as sorted
    for (let k = i + 1; k < n; k++) {
      swapStates[k] = ELEMENT_STATES.SORTED;
    }

    steps.push({
      array: [...arr],
      states: swapStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.HEAP_EXTRACT_MAX, {
        value: arr[i],
        position: i,
      }),
    });

    // Mark the newly placed element as sorted
    const sortedStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    for (let k = i; k < n; k++) {
      sortedStates[k] = ELEMENT_STATES.SORTED;
    }

    steps.push({
      array: [...arr],
      states: sortedStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.HEAP_PLACED, {
        value: arr[i],
        position: i,
      }),
    });

    // Heapify the reduced heap
    heapify(arr, i, 0, steps);
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
 * Heapify a subtree rooted at index i
 * @param {number[]} arr - The array
 * @param {number} heapSize - Size of heap
 * @param {number} i - Root index of subtree
 * @param {Object[]} steps - Animation steps array
 */
function heapify(arr, heapSize, i, steps) {
  const n = arr.length;
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  // Show which nodes we're comparing (parent and children)
  const compareStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
  compareStates[i] = ELEMENT_STATES.COMPARING;

  if (left < heapSize) {
    compareStates[left] = ELEMENT_STATES.COMPARING;
  }
  if (right < heapSize) {
    compareStates[right] = ELEMENT_STATES.COMPARING;
  }

  // Mark sorted region
  for (let k = heapSize; k < n; k++) {
    compareStates[k] = ELEMENT_STATES.SORTED;
  }

  steps.push({
    array: [...arr],
    states: compareStates,
    description: getAlgorithmDescription(ALGORITHM_STEPS.HEAP_HEAPIFY, {
      index: i,
      value: arr[i],
    }),
  });

  // Find largest among root and children
  if (left < heapSize && arr[left] > arr[largest]) {
    largest = left;
  }

  if (right < heapSize && arr[right] > arr[largest]) {
    largest = right;
  }

  // If largest is not root, swap and continue heapifying
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];

    const swapStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    swapStates[i] = ELEMENT_STATES.SWAPPING;
    swapStates[largest] = ELEMENT_STATES.SWAPPING;

    // Mark sorted region
    for (let k = heapSize; k < n; k++) {
      swapStates[k] = ELEMENT_STATES.SORTED;
    }

    steps.push({
      array: [...arr],
      states: swapStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.SWAPPING, {
        a: arr[largest],
        b: arr[i],
      }),
    });

    // Recursively heapify the affected subtree
    heapify(arr, heapSize, largest, steps);
  }
}

/**
 * Pure sorting function without animation steps (for testing)
 * @param {number[]} array - Array to sort
 * @returns {number[]} - Sorted array
 */
export function heapSortPure(array) {
  const arr = [...array];
  const n = arr.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapifyPure(arr, n, i);
  }

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapifyPure(arr, i, 0);
  }

  return arr;
}

/**
 * Pure heapify function without animation steps
 * @param {number[]} arr - The array
 * @param {number} heapSize - Size of heap
 * @param {number} i - Root index of subtree
 */
function heapifyPure(arr, heapSize, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < heapSize && arr[left] > arr[largest]) {
    largest = left;
  }

  if (right < heapSize && arr[right] > arr[largest]) {
    largest = right;
  }

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapifyPure(arr, heapSize, largest);
  }
}
