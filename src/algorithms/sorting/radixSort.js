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
 * Radix Sort Algorithm
 * Time Complexity: O(nk)
 * Space Complexity: O(n + k)
 *
 * Radix Sort distributes numbers into buckets based on their radix (base)
 * and then collects them, repeating for each digit position.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function radixSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.radixSort',
  });

  const maxNum = Math.max(...arr); // Assume non-negative for visualizer
  let maxDigits = 0;
  if (maxNum === 0) maxDigits = 1;
  else maxDigits = Math.floor(Math.log10(Math.abs(maxNum))) + 1;

  for (let k = 0; k < maxDigits; k++) {
    // 1. Bucket Distribution Phase
    const buckets = Array.from({ length: 10 }, () => []);

    for (let i = 0; i < n; i++) {
      const digit = getDigit(arr[i], k);
      buckets[digit].push(arr[i]);

      // Highlight the element being bucketed
      const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
      states[i] = ELEMENT_STATES.COMPARING;

      // Optionally highlight previous sorted state if needed, but simple is better

      steps.push({
        array: [...arr],
        states,
        description: getAlgorithmDescription(
          ALGORITHM_STEPS.RADIX_BUCKET_PUSH,
          {
            val: arr[i],
            digit,
            bucket: digit,
          }
        ),
      });
    }

    // 2. Collection Phase
    let idx = 0;
    for (let b = 0; b < 10; b++) {
      const bucket = buckets[b];
      for (let val of bucket) {
        arr[idx] = val;

        const collectStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
        collectStates[idx] = ELEMENT_STATES.AUXILIARY; // Show it being placed from "bucket"

        steps.push({
          array: [...arr],
          states: collectStates,
          description: getAlgorithmDescription(ALGORITHM_STEPS.RADIX_COLLECT, {
            val,
            position: idx,
            bucket: b,
          }),
        });

        idx++;
      }
    }

    steps.push({
      array: [...arr],
      states: Array(n).fill(ELEMENT_STATES.DEFAULT),
      description: getAlgorithmDescription(
        ALGORITHM_STEPS.RADIX_PASS_COMPLETE,
        {
          pass: k + 1,
        }
      ),
    });
  }

  // Final sorted state
  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.SORTED),
    description: getAlgorithmDescription(ALGORITHM_STEPS.COMPLETED),
  });

  return steps;
}

/**
 * Helper to get digit at position k (0 = ones, 1 = tens, etc.)
 */
function getDigit(num, place) {
  return Math.floor(Math.abs(num) / Math.pow(10, place)) % 10;
}

/**
 * Pure sorting function without animation steps (for testing)
 * Handles negative numbers by shifting.
 * @param {number[]} array - Array to sort
 * @returns {number[]} - Sorted array
 */
export function radixSortPure(array) {
  let arr = [...array];
  if (arr.length === 0) return arr;

  const minVal = Math.min(...arr);
  // Shift to non-negative if needed
  if (minVal < 0) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] -= minVal;
    }
  }

  const maxNum = Math.max(...arr);
  let maxDigits = 0;
  if (maxNum === 0) maxDigits = 1;
  else maxDigits = Math.floor(Math.log10(maxNum)) + 1;

  for (let k = 0; k < maxDigits; k++) {
    const buckets = Array.from({ length: 10 }, () => []);

    for (let i = 0; i < arr.length; i++) {
      const digit = getDigit(arr[i], k);
      buckets[digit].push(arr[i]);
    }

    arr = [].concat(...buckets);
  }

  // Shift back
  if (minVal < 0) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] += minVal;
    }
  }

  return arr;
}
