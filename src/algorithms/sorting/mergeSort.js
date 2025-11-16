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
 * Merge Sort Algorithm
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 *
 * Merge Sort is a divide-and-conquer algorithm that divides the input array
 * into two halves, recursively sorts them, and then merges the two sorted halves.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function mergeSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: getAlgorithmDescription(ALGORITHM_STEPS.STARTING, {
      algorithm: 'Merge Sort',
    }),
  });

  mergeSortHelper(arr, 0, n - 1, steps);

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.SORTED),
    description: getAlgorithmDescription(ALGORITHM_STEPS.COMPLETED),
  });

  return steps;
}

function mergeSortHelper(arr, left, right, steps) {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);

    // Show division
    const divideStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
    for (let i = left; i <= mid; i++) {
      divideStates[i] = ELEMENT_STATES.COMPARING;
    }
    for (let i = mid + 1; i <= right; i++) {
      divideStates[i] = ELEMENT_STATES.AUXILIARY;
    }

    steps.push({
      array: [...arr],
      states: divideStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.DIVIDING, {
        start: left,
        mid: mid,
        midNext: mid + 1,
        end: right,
      }),
    });

    mergeSortHelper(arr, left, mid, steps);
    mergeSortHelper(arr, mid + 1, right, steps);
    merge(arr, left, mid, right, steps);
  }
}

function merge(arr, left, mid, right, steps) {
  const n1 = mid - left + 1;
  const n2 = right - mid;

  // Create temp arrays
  const leftArr = new Array(n1);
  const rightArr = new Array(n2);

  for (let i = 0; i < n1; i++) {
    leftArr[i] = arr[left + i];
  }
  for (let j = 0; j < n2; j++) {
    rightArr[j] = arr[mid + 1 + j];
  }

  let i = 0;
  let j = 0;
  let k = left;

  // Merge the temp arrays back
  while (i < n1 && j < n2) {
    const mergeStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
    mergeStates[k] = ELEMENT_STATES.COMPARING;

    steps.push({
      array: [...arr],
      states: mergeStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.MERGING, {
        a: leftArr[i],
        b: rightArr[j],
      }),
    });

    if (leftArr[i] <= rightArr[j]) {
      arr[k] = leftArr[i];
      i++;
    } else {
      arr[k] = rightArr[j];
      j++;
    }

    const swapStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
    swapStates[k] = ELEMENT_STATES.SWAPPING;

    steps.push({
      array: [...arr],
      states: swapStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.PLACED, {
        value: arr[k],
        position: k,
      }),
    });

    k++;
  }

  // Copy remaining elements of leftArr
  while (i < n1) {
    arr[k] = leftArr[i];

    const swapStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
    swapStates[k] = ELEMENT_STATES.SWAPPING;

    steps.push({
      array: [...arr],
      states: swapStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.PLACED_REMAINING, {
        value: arr[k],
        position: k,
      }),
    });

    i++;
    k++;
  }

  // Copy remaining elements of rightArr
  while (j < n2) {
    arr[k] = rightArr[j];

    const swapStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
    swapStates[k] = ELEMENT_STATES.SWAPPING;

    steps.push({
      array: [...arr],
      states: swapStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.PLACED_REMAINING, {
        value: arr[k],
        position: k,
      }),
    });

    j++;
    k++;
  }

  // Show merged section
  const mergedStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
  for (let idx = left; idx <= right; idx++) {
    mergedStates[idx] = ELEMENT_STATES.SORTED;
  }

  steps.push({
    array: [...arr],
    states: mergedStates,
    description: getAlgorithmDescription(ALGORITHM_STEPS.MERGED_SECTION, {
      start: left,
      end: right,
    }),
  });
}

/**
 * Pure sorting function without animation steps (for testing)
 * @param {number[]} array - Array to sort
 * @returns {number[]} - Sorted array
 */
export function mergeSortPure(array) {
  const arr = [...array];

  function mergeSortHelperPure(arr, left, right) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSortHelperPure(arr, left, mid);
      mergeSortHelperPure(arr, mid + 1, right);
      mergePure(arr, left, mid, right);
    }
  }

  function mergePure(arr, left, mid, right) {
    const n1 = mid - left + 1;
    const n2 = right - mid;

    const leftArr = new Array(n1);
    const rightArr = new Array(n2);

    for (let i = 0; i < n1; i++) {
      leftArr[i] = arr[left + i];
    }
    for (let j = 0; j < n2; j++) {
      rightArr[j] = arr[mid + 1 + j];
    }

    let i = 0;
    let j = 0;
    let k = left;

    while (i < n1 && j < n2) {
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      k++;
    }

    while (i < n1) {
      arr[k] = leftArr[i];
      i++;
      k++;
    }

    while (j < n2) {
      arr[k] = rightArr[j];
      j++;
      k++;
    }
  }

  mergeSortHelperPure(arr, 0, arr.length - 1);
  return arr;
}
