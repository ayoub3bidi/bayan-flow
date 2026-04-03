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
 * @param {number} n
 * @param {number} left
 * @param {number} right
 * @param {number} mid
 */
function buildBinaryWindowStates(n, left, right, mid) {
  const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
  for (let i = 0; i < n; i += 1) {
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
 * Doubling phase: compare at `bound`; indices strictly before floor(bound/2) are ruled out.
 * @param {number} n
 * @param {number} bound
 */
function buildDoublingStates(n, bound) {
  const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
  const cutoff = Math.floor(bound / 2);
  for (let i = 0; i < cutoff; i += 1) {
    states[i] = ELEMENT_STATES.AUXILIARY;
  }
  states[bound] = ELEMENT_STATES.COMPARING;
  return states;
}

/**
 * @param {number[]} array — must be sorted ascending
 * @param {number} target
 * @returns {number} index of target, or -1
 */
export function exponentialSearchPure(array, target) {
  const n = array.length;
  if (n === 0) return -1;
  if (array[0] === target) return 0;
  if (array[0] > target) return -1;

  let bound = 1;
  while (bound < n) {
    if (array[bound] === target) return bound;
    if (array[bound] > target) break;
    bound *= 2;
  }

  let left = Math.floor(bound / 2);
  let right = Math.min(bound, n - 1);

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (array[mid] === target) return mid;
    if (array[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

/**
 * @param {number[]} array — sorted ascending
 * @param {number} target
 * @returns {Object[]}
 */
export function exponentialSearch(array, target) {
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
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_EXPONENTIAL_START, {
      target,
    })
  );

  if (n === 0) {
    push(
      [],
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_EXPONENTIAL_NOT_FOUND, {
        target,
      })
    );
    return steps;
  }

  push(
    buildBinaryWindowStates(n, 0, n - 1, 0),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_EXPONENTIAL_CHECK_FIRST, {
      value: arr[0],
      target,
    })
  );

  if (arr[0] === target) {
    const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
    found[0] = ELEMENT_STATES.SORTED;
    push(
      found,
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_EXPONENTIAL_FOUND, {
        mid: 0,
        target,
      })
    );
    return steps;
  }

  if (arr[0] > target) {
    push(
      Array(n).fill(ELEMENT_STATES.DEFAULT),
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_EXPONENTIAL_NOT_FOUND, {
        target,
      })
    );
    return steps;
  }

  let bound = 1;
  while (bound < n) {
    push(
      buildDoublingStates(n, bound),
      getAlgorithmDescription(
        ALGORITHM_STEPS.SEARCH_EXPONENTIAL_DOUBLED_PROBE,
        {
          bound,
          value: arr[bound],
          target,
          nextBound: bound * 2,
        }
      )
    );

    if (arr[bound] === target) {
      const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
      found[bound] = ELEMENT_STATES.SORTED;
      push(
        found,
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_EXPONENTIAL_FOUND, {
          mid: bound,
          target,
        })
      );
      return steps;
    }

    if (arr[bound] > target) break;
    bound *= 2;
  }

  const left = Math.floor(bound / 2);
  const right = Math.min(bound, n - 1);

  push(
    buildBinaryWindowStates(n, left, right, left),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_EXPONENTIAL_RANGE_LOCKED, {
      left,
      right,
      target,
    })
  );

  let lo = left;
  let hi = right;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    push(
      buildBinaryWindowStates(n, lo, hi, mid),
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_EXPONENTIAL_BINARY_CHECK, {
        left: lo,
        right: hi,
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
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_EXPONENTIAL_FOUND, {
          mid,
          target,
        })
      );
      return steps;
    }

    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }

  push(
    Array(n).fill(ELEMENT_STATES.DEFAULT),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_EXPONENTIAL_NOT_FOUND, {
      target,
    })
  );
  return steps;
}
