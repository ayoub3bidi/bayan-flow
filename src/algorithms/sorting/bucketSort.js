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
 * Bucket Sort Algorithm
 * Time Complexity: O(n + k) average, O(n²) worst case
 * Space Complexity: O(n + k)
 *
 * Bucket Sort distributes elements into buckets, sorts each bucket,
 * then concatenates them back together.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function bucketSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.bucketSort',
  });

  if (n <= 1) {
    steps.push({
      array: [...arr],
      states: Array(n).fill(ELEMENT_STATES.SORTED),
      description: getAlgorithmDescription(ALGORITHM_STEPS.COMPLETED),
    });
    return steps;
  }

  // Find min and max for normalization
  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const range = maxVal - minVal;

  // Handle edge case: all elements are the same
  if (range === 0) {
    steps.push({
      array: [...arr],
      states: Array(n).fill(ELEMENT_STATES.SORTED),
      description: getAlgorithmDescription(ALGORITHM_STEPS.COMPLETED),
    });
    return steps;
  }

  // Create buckets (use sqrt(n) buckets for optimal distribution)
  const bucketCount = Math.max(1, Math.floor(Math.sqrt(n)));
  const buckets = Array.from({ length: bucketCount }, () => []);

  // Distribution Phase - place elements into buckets
  for (let i = 0; i < n; i++) {
    const bucketIndex = Math.min(
      bucketCount - 1,
      Math.floor(((arr[i] - minVal) / range) * bucketCount)
    );

    const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
    states[i] = ELEMENT_STATES.COMPARING;

    steps.push({
      array: [...arr],
      states: [...states],
      description: getAlgorithmDescription(
        ALGORITHM_STEPS.BUCKET_DISTRIBUTING,
        {
          value: arr[i],
          bucket: bucketIndex,
          bucketCount,
        }
      ),
    });

    buckets[bucketIndex].push(arr[i]);

    const placedStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    placedStates[i] = ELEMENT_STATES.AUXILIARY;

    steps.push({
      array: [...arr],
      states: placedStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.BUCKET_PLACED, {
        value: arr[i],
        bucket: bucketIndex,
      }),
    });
  }

  // Show distribution complete
  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.AUXILIARY),
    description: getAlgorithmDescription(
      ALGORITHM_STEPS.BUCKET_DISTRIBUTION_COMPLETE,
      {
        bucketCount,
        totalElements: n,
      }
    ),
  });

  // Sort each bucket using insertion sort
  for (let b = 0; b < bucketCount; b++) {
    const bucket = buckets[b];
    if (bucket.length <= 1) continue;

    // Insertion sort within bucket
    for (let i = 1; i < bucket.length; i++) {
      const key = bucket[i];
      let j = i - 1;

      while (j >= 0 && bucket[j] > key) {
        bucket[j + 1] = bucket[j];
        j--;
      }
      bucket[j + 1] = key;
    }

    steps.push({
      array: [...arr],
      states: Array(n).fill(ELEMENT_STATES.DEFAULT),
      description: getAlgorithmDescription(ALGORITHM_STEPS.BUCKET_SORTED, {
        bucket: b,
        size: bucket.length,
      }),
    });
  }

  // Merge Phase - concatenate buckets back into array
  let index = 0;
  for (let b = 0; b < bucketCount; b++) {
    for (let item of buckets[b]) {
      arr[index] = item;

      const mergeStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
      // Mark already merged elements as sorted
      for (let k = 0; k < index; k++) {
        mergeStates[k] = ELEMENT_STATES.SORTED;
      }
      mergeStates[index] = ELEMENT_STATES.SWAPPING;

      steps.push({
        array: [...arr],
        states: mergeStates,
        description: getAlgorithmDescription(ALGORITHM_STEPS.BUCKET_MERGING, {
          value: item,
          position: index,
          bucket: b,
        }),
      });

      index++;
    }
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
export function bucketSortPure(array) {
  const arr = [...array];
  const n = arr.length;

  if (n <= 1) return arr;

  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const range = maxVal - minVal;

  if (range === 0) return arr;

  const bucketCount = Math.max(1, Math.floor(Math.sqrt(n)));
  const buckets = Array.from({ length: bucketCount }, () => []);

  // Distribute elements into buckets
  for (let i = 0; i < n; i++) {
    const bucketIndex = Math.min(
      bucketCount - 1,
      Math.floor(((arr[i] - minVal) / range) * bucketCount)
    );
    buckets[bucketIndex].push(arr[i]);
  }

  // Sort each bucket using insertion sort
  for (let bucket of buckets) {
    if (bucket.length <= 1) continue;

    for (let i = 1; i < bucket.length; i++) {
      const key = bucket[i];
      let j = i - 1;

      while (j >= 0 && bucket[j] > key) {
        bucket[j + 1] = bucket[j];
        j--;
      }
      bucket[j + 1] = key;
    }
  }

  // Concatenate sorted buckets
  return buckets.flat();
}
