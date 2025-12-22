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
 * Selection Sort Algorithm
 * Time Complexity: O(n²)
 * Space Complexity: O(1)
 *
 * Selection Sort divides the array into sorted and unsorted regions.
 * It repeatedly finds the minimum element from the unsorted region
 * and moves it to the end of the sorted region.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function selectionSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  // Record initial state
  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.selectionSort',
  });

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    // Show current position as pivot (where we'll place minimum)
    const pivotStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    pivotStates[i] = ELEMENT_STATES.PIVOT;

    // Mark already sorted elements
    for (let k = 0; k < i; k++) {
      pivotStates[k] = ELEMENT_STATES.SORTED;
    }

    steps.push({
      array: [...arr],
      states: pivotStates,
      description: getAlgorithmDescription(
        ALGORITHM_STEPS.SELECTION_FINDING_MIN,
        {
          position: i,
        }
      ),
    });

    // Find minimum element in unsorted region
    for (let j = i + 1; j < n; j++) {
      const compareStates = Array(n).fill(ELEMENT_STATES.DEFAULT);

      // Mark sorted region
      for (let k = 0; k < i; k++) {
        compareStates[k] = ELEMENT_STATES.SORTED;
      }

      compareStates[i] = ELEMENT_STATES.PIVOT;
      compareStates[minIndex] = ELEMENT_STATES.AUXILIARY;
      compareStates[j] = ELEMENT_STATES.COMPARING;

      steps.push({
        array: [...arr],
        states: compareStates,
        description: getAlgorithmDescription(ALGORITHM_STEPS.COMPARING, {
          a: arr[j],
          b: arr[minIndex],
        }),
      });

      // Update minimum if smaller element found
      if (arr[j] < arr[minIndex]) {
        minIndex = j;

        const newMinStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
        for (let k = 0; k < i; k++) {
          newMinStates[k] = ELEMENT_STATES.SORTED;
        }
        newMinStates[i] = ELEMENT_STATES.PIVOT;
        newMinStates[minIndex] = ELEMENT_STATES.AUXILIARY;

        steps.push({
          array: [...arr],
          states: newMinStates,
          description: getAlgorithmDescription(
            ALGORITHM_STEPS.SELECTION_NEW_MIN,
            {
              value: arr[minIndex],
              position: minIndex,
            }
          ),
        });
      }
    }

    // Swap minimum element with current position
    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];

      const swapStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
      for (let k = 0; k < i; k++) {
        swapStates[k] = ELEMENT_STATES.SORTED;
      }
      swapStates[i] = ELEMENT_STATES.SWAPPING;
      swapStates[minIndex] = ELEMENT_STATES.SWAPPING;

      steps.push({
        array: [...arr],
        states: swapStates,
        description: getAlgorithmDescription(ALGORITHM_STEPS.SWAPPING, {
          a: arr[minIndex],
          b: arr[i],
        }),
      });
    }

    // Mark current position as sorted
    const sortedStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    for (let k = 0; k <= i; k++) {
      sortedStates[k] = ELEMENT_STATES.SORTED;
    }

    steps.push({
      array: [...arr],
      states: sortedStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.SELECTION_PLACED, {
        value: arr[i],
        position: i,
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
export function selectionSortPure(array) {
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }

  return arr;
}
