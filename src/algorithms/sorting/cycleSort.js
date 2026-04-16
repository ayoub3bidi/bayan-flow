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
 * Cycle Sort Algorithm
 * Time Complexity: O(n²)
 * Space Complexity: O(1)
 *
 * Cycle Sort minimizes the number of memory writes by placing each element
 * directly into its final sorted position. It's optimal for situations where
 * write operations are expensive.
 *
 * @param {number[]} array - The array to sort
 * @returns {Object[]} - Array of animation steps
 */
export function cycleSort(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  steps.push({
    array: [...arr],
    states: Array(n).fill(ELEMENT_STATES.DEFAULT),
    description: 'algorithms.descriptions.cycleSort',
  });

  for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
    let item = arr[cycleStart];

    const cycleStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
    cycleStates[cycleStart] = ELEMENT_STATES.PIVOT;
    steps.push({
      array: [...arr],
      states: cycleStates,
      description: getAlgorithmDescription(ALGORITHM_STEPS.CYCLE_START, {
        item,
        position: cycleStart,
      }),
    });

    let pos = cycleStart;
    for (let i = cycleStart + 1; i < n; i++) {
      const compareStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
      compareStates[cycleStart] = ELEMENT_STATES.PIVOT;
      compareStates[i] = ELEMENT_STATES.COMPARING;
      steps.push({
        array: [...arr],
        states: compareStates,
        description: getAlgorithmDescription(ALGORITHM_STEPS.COMPARING, {
          a: arr[i],
          b: item,
        }),
      });

      if (arr[i] < item) {
        pos++;
      }
    }

    if (pos === cycleStart) {
      steps.push({
        array: [...arr],
        states: Array(n).fill(ELEMENT_STATES.DEFAULT),
        description: getAlgorithmDescription(ALGORITHM_STEPS.CYCLE_SKIP, {
          item,
        }),
      });
      continue;
    }

    while (item === arr[pos]) {
      pos++;
    }

    if (pos !== cycleStart) {
      [item, arr[pos]] = [arr[pos], item];

      const swapStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
      swapStates[cycleStart] = ELEMENT_STATES.AUXILIARY;
      swapStates[pos] = ELEMENT_STATES.SWAPPING;
      steps.push({
        array: [...arr],
        states: swapStates,
        description: getAlgorithmDescription(ALGORITHM_STEPS.CYCLE_PLACE, {
          item: arr[pos],
          position: pos,
        }),
      });
    }

    while (pos !== cycleStart) {
      pos = cycleStart;

      for (let i = cycleStart + 1; i < n; i++) {
        const compareStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
        compareStates[i] = ELEMENT_STATES.COMPARING;
        steps.push({
          array: [...arr],
          states: compareStates,
          description: getAlgorithmDescription(ALGORITHM_STEPS.COMPARING, {
            a: arr[i],
            b: item,
          }),
        });

        if (arr[i] < item) {
          pos++;
        }
      }

      while (item === arr[pos]) {
        pos++;
      }

      if (item !== arr[pos]) {
        [item, arr[pos]] = [arr[pos], item];

        const swapStates = Array(n).fill(ELEMENT_STATES.DEFAULT);
        swapStates[pos] = ELEMENT_STATES.SWAPPING;
        steps.push({
          array: [...arr],
          states: swapStates,
          description: getAlgorithmDescription(ALGORITHM_STEPS.CYCLE_PLACE, {
            item: arr[pos],
            position: pos,
          }),
        });
      }
    }
  }

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
export function cycleSortPure(array) {
  const arr = [...array];
  const n = arr.length;

  for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
    let item = arr[cycleStart];
    let pos = cycleStart;

    for (let i = cycleStart + 1; i < n; i++) {
      if (arr[i] < item) {
        pos++;
      }
    }

    if (pos === cycleStart) {
      continue;
    }

    while (item === arr[pos]) {
      pos++;
    }

    if (pos !== cycleStart) {
      [item, arr[pos]] = [arr[pos], item];
    }

    while (pos !== cycleStart) {
      pos = cycleStart;

      for (let i = cycleStart + 1; i < n; i++) {
        if (arr[i] < item) {
          pos++;
        }
      }

      while (item === arr[pos]) {
        pos++;
      }

      if (item !== arr[pos]) {
        [item, arr[pos]] = [arr[pos], item];
      }
    }
  }

  return arr;
}
