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

const MIN_MERGE = 32;

/**
 * Tim Sort Algorithm
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 *
 * Tim Sort is a hybrid stable sorting algorithm derived from merge sort and insertion sort.
 * It is the default sorting algorithm in Python, Java, Swift, and Android.
 * This is a simplified educational version for visualization.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function timSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.timSort',
  });

  const minRun = Math.min(MIN_MERGE, n);

  // Sort individual runs using insertion sort
  for (let start = 0; start < n; start += minRun) {
    const end = Math.min(start + minRun - 1, n - 1);
    insertionSortRun(arr, start, end, steps);
  }

  // Merge runs
  let size = minRun;
  while (size < n) {
    for (let start = 0; start < n; start += size * 2) {
      const mid = start + size - 1;
      const end = Math.min(start + size * 2 - 1, n - 1);

      if (mid < end) {
        merge(arr, start, mid, end, steps);
      }
    }
    size *= 2;
  }

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.SORTED),
    description: getAlgorithmDescription(ALGORITHM_STEPS.COMPLETED),
  });

  return steps;
}

function insertionSortRun(arr, left, right, steps) {
  const runStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
  for (let i = left; i <= right; i++) {
    runStates[i] = ELEMENT_STATES.AUXILIARY;
  }

  steps.push({
    array: [...arr],
    states: runStates,
    description: getAlgorithmDescription(ALGORITHM_STEPS.TIM_RUN_DETECTED, {
      start: left,
      end: right,
      size: right - left + 1,
    }),
  });

  for (let i = left + 1; i <= right; i++) {
    const key = arr[i];
    let j = i - 1;

    const keyStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
    keyStates[i] = ELEMENT_STATES.COMPARING;
    for (let k = left; k < i; k++) {
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

    while (j >= left && arr[j] > key) {
      arr[j + 1] = arr[j];

      const shiftStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
      for (let k = left; k < i; k++) {
        if (k !== j && k !== j + 1) {
          shiftStates[k] = ELEMENT_STATES.SORTED;
        }
      }
      shiftStates[j + 1] = ELEMENT_STATES.SWAPPING;

      steps.push({
        array: [...arr],
        states: shiftStates,
        description: getAlgorithmDescription(ALGORITHM_STEPS.INSERTION_SHIFT, {
          value: arr[j + 1],
          from: j,
          to: j + 1,
        }),
      });

      j--;
    }

    arr[j + 1] = key;

    const insertStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
    for (let k = left; k <= i; k++) {
      insertStates[k] = ELEMENT_STATES.SORTED;
    }

    steps.push({
      array: [...arr],
      states: insertStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.INSERTION_PLACED, {
        value: key,
        position: j + 1,
      }),
    });
  }

  const runCompleteStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
  for (let i = left; i <= right; i++) {
    runCompleteStates[i] = ELEMENT_STATES.SORTED;
  }

  steps.push({
    array: [...arr],
    states: runCompleteStates,
    description: getAlgorithmDescription(ALGORITHM_STEPS.TIM_RUN_SORTED, {
      start: left,
      end: right,
    }),
  });
}

function merge(arr, left, mid, right, steps) {
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

  const mergeStartStates = Array(arr.length).fill(ELEMENT_STATES.DEFAULT);
  for (let i = left; i <= mid; i++) {
    mergeStartStates[i] = ELEMENT_STATES.COMPARING;
  }
  for (let i = mid + 1; i <= right; i++) {
    mergeStartStates[i] = ELEMENT_STATES.AUXILIARY;
  }

  steps.push({
    array: [...arr],
    states: mergeStartStates,
    description: getAlgorithmDescription(ALGORITHM_STEPS.TIM_MERGING_RUNS, {
      start: left,
      mid: mid,
      end: right,
    }),
  });

  let i = 0;
  let j = 0;
  let k = left;

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
export function timSortPure(array) {
  const arr = [...array];
  const n = arr.length;
  const minRun = Math.min(MIN_MERGE, n);

  function insertionSortRunPure(arr, left, right) {
    for (let i = left + 1; i <= right; i++) {
      const key = arr[i];
      let j = i - 1;

      while (j >= left && arr[j] > key) {
        arr[j + 1] = arr[j];
        j--;
      }

      arr[j + 1] = key;
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

  for (let start = 0; start < n; start += minRun) {
    const end = Math.min(start + minRun - 1, n - 1);
    insertionSortRunPure(arr, start, end);
  }

  let size = minRun;
  while (size < n) {
    for (let start = 0; start < n; start += size * 2) {
      const mid = start + size - 1;
      const end = Math.min(start + size * 2 - 1, n - 1);

      if (mid < end) {
        mergePure(arr, start, mid, end);
      }
    }
    size *= 2;
  }

  return arr;
}
