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
 * @param {number[]} array — must be sorted ascending
 * @param {number} target
 * @returns {number} index of target, or -1
 */
export function binarySearchPure(array, target) {
  let left = 0;
  let right = array.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (array[mid] === target) return mid;
    if (array[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

function buildStates(n, left, right, mid) {
  const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
  for (let i = 0; i < n; i++) {
    if (i < left || i > right) {
      states[i] = ELEMENT_STATES.AUXILIARY;
    }
  }
  if (mid >= left && mid <= right) {
    states[mid] = ELEMENT_STATES.COMPARING;
  }
  return states;
}

/**
 * @param {number[]} array — sorted ascending
 * @param {number} target
 * @returns {Object[]}
 */
export function binarySearch(array, target) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  const push = (states, description) => {
    steps.push({
      array: [...arr],
      states: [...states],
      description,
      targetValue: target,
    });
  };

  push(
    Array(n).fill(ELEMENT_STATES.DEFAULT),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_BINARY_START, { target })
  );

  let left = 0;
  let right = n - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    push(
      buildStates(n, left, right, mid),
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_BINARY_CHECK, {
        left,
        right,
        mid,
        value: arr[mid],
        target,
      })
    );

    if (arr[mid] === target) {
      const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
      found[mid] = ELEMENT_STATES.SORTED;
      push(
        found,
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_BINARY_FOUND, {
          mid,
          target,
        })
      );
      return steps;
    }

    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  push(
    Array(n).fill(ELEMENT_STATES.DEFAULT),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_BINARY_NOT_FOUND, {
      target,
    })
  );
  return steps;
}
