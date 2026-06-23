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

function computeThirdMids(left, right) {
  const third = Math.floor((right - left) / 3);
  return {
    mid1: left + third,
    mid2: right - third,
  };
}

/**
 * @param {number[]} array — must be sorted ascending
 * @param {number} target
 * @returns {number} index of target, or -1
 */
export function ternarySearchPure(array, target) {
  let left = 0;
  let right = array.length - 1;
  while (left <= right) {
    const { mid1, mid2 } = computeThirdMids(left, right);
    if (array[mid1] === target) return mid1;
    if (array[mid2] === target) return mid2;
    if (target < array[mid1]) {
      right = mid1 - 1;
    } else if (target > array[mid2]) {
      left = mid2 + 1;
    } else {
      left = mid1 + 1;
      right = mid2 - 1;
    }
  }
  return -1;
}

function buildStates(n, left, right, mid1, mid2) {
  const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
  for (let i = 0; i < n; i++) {
    if (i < left || i > right) {
      states[i] = ELEMENT_STATES.AUXILIARY;
    }
  }
  if (mid1 >= left && mid1 <= right) {
    states[mid1] = ELEMENT_STATES.PIVOT;
  }
  if (mid2 >= left && mid2 <= right && mid2 !== mid1) {
    states[mid2] = ELEMENT_STATES.COMPARING;
  }
  return states;
}

/**
 * @param {number[]} array — sorted ascending
 * @param {number} target
 * @returns {Object[]}
 */
export function ternarySearch(array, target) {
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
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_TERNARY_START, { target })
  );

  let left = 0;
  let right = n - 1;

  while (left <= right) {
    const { mid1, mid2 } = computeThirdMids(left, right);
    push(
      buildStates(n, left, right, mid1, mid2),
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_TERNARY_CHECK, {
        left,
        right,
        leftMid: mid1,
        rightMid: mid2,
        leftValue: arr[mid1],
        rightValue: arr[mid2],
        target,
      })
    );

    if (arr[mid1] === target) {
      const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
      found[mid1] = ELEMENT_STATES.SORTED;
      push(
        found,
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_TERNARY_FOUND, {
          mid: mid1,
          target,
        })
      );
      return steps;
    }
    if (arr[mid2] === target) {
      const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
      found[mid2] = ELEMENT_STATES.SORTED;
      push(
        found,
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_TERNARY_FOUND, {
          mid: mid2,
          target,
        })
      );
      return steps;
    }

    if (target < arr[mid1]) {
      right = mid1 - 1;
    } else if (target > arr[mid2]) {
      left = mid2 + 1;
    } else {
      left = mid1 + 1;
      right = mid2 - 1;
    }
  }

  push(
    Array(n).fill(ELEMENT_STATES.DEFAULT),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_TERNARY_NOT_FOUND, {
      target,
    })
  );
  return steps;
}
