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
 * @param {number} offset
 * @param {number} fibM — length of the active Fibonacci window
 * @param {number} probe
 * @returns {string[]}
 */
function buildStates(n, offset, fibM, probe) {
  const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
  const winLen = Math.max(fibM, 1);
  const windowEnd = Math.min(offset + winLen - 1, n - 1);
  for (let i = 0; i < n; i += 1) {
    if (i < offset || i > windowEnd) {
      states[i] = ELEMENT_STATES.AUXILIARY;
    }
  }
  if (probe >= 0 && probe < n) {
    states[probe] = ELEMENT_STATES.COMPARING;
  }
  return states;
}

/**
 * @param {number[]} array — must be sorted ascending
 * @param {number} target
 * @returns {number} index of target, or -1
 */
export function fibonacciSearchPure(array, target) {
  const n = array.length;
  if (n === 0) return -1;

  let fibM2 = 0;
  let fibM1 = 1;
  let fibM = fibM1 + fibM2;
  while (fibM < n + 1) {
    fibM2 = fibM1;
    fibM1 = fibM;
    fibM = fibM2 + fibM1;
  }

  let offset = 0;

  while (fibM > 1) {
    if (offset >= n) return -1;
    const i = Math.min(offset + fibM2, n - 1);
    const val = array[i];

    if (val < target) {
      offset = i + 1;
      fibM = fibM1;
      fibM1 = fibM2;
      fibM2 = fibM - fibM1;
    } else if (val > target) {
      fibM = fibM2;
      fibM1 = fibM1 - fibM2;
      fibM2 = fibM - fibM1;
    } else {
      return i;
    }
  }

  if (offset < n && array[offset] === target) {
    return offset;
  }
  return -1;
}

/**
 * @param {number[]} array — sorted ascending
 * @param {number} target
 * @returns {Object[]}
 */
export function fibonacciSearch(array, target) {
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

  if (n === 0) {
    push(
      [],
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_FIBONACCI_START, {
        target,
      })
    );
    push(
      [],
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_FIBONACCI_NOT_FOUND, {
        target,
      })
    );
    return steps;
  }

  let fibM2 = 0;
  let fibM1 = 1;
  let fibM = fibM1 + fibM2;
  while (fibM < n + 1) {
    fibM2 = fibM1;
    fibM1 = fibM;
    fibM = fibM2 + fibM1;
  }

  push(
    Array(n).fill(ELEMENT_STATES.DEFAULT),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_FIBONACCI_START, { target })
  );

  let offset = 0;

  while (fibM > 1) {
    if (offset >= n) {
      push(
        Array(n).fill(ELEMENT_STATES.DEFAULT),
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_FIBONACCI_NOT_FOUND, {
          target,
        })
      );
      return steps;
    }

    const probe = Math.min(offset + fibM2, n - 1);
    const windowEnd = Math.min(offset + Math.max(fibM, 1) - 1, n - 1);

    push(
      buildStates(n, offset, fibM, probe),
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_FIBONACCI_PROBE, {
        offset,
        probe,
        value: arr[probe],
        target,
        windowEnd,
      })
    );

    const val = arr[probe];

    if (val < target) {
      offset = probe + 1;
      fibM = fibM1;
      fibM1 = fibM2;
      fibM2 = fibM - fibM1;
    } else if (val > target) {
      fibM = fibM2;
      fibM1 = fibM1 - fibM2;
      fibM2 = fibM - fibM1;
    } else {
      const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
      found[probe] = ELEMENT_STATES.SORTED;
      push(
        found,
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_FIBONACCI_FOUND, {
          probe,
          target,
        })
      );
      return steps;
    }
  }

  if (offset < n && arr[offset] === target) {
    const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
    found[offset] = ELEMENT_STATES.SORTED;
    push(
      buildStates(n, offset, fibM, offset),
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_FIBONACCI_PROBE, {
        offset,
        probe: offset,
        value: arr[offset],
        target,
        windowEnd: Math.min(offset + Math.max(fibM, 1) - 1, n - 1),
      })
    );
    push(
      found,
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_FIBONACCI_FOUND, {
        probe: offset,
        target,
      })
    );
    return steps;
  }

  push(
    Array(n).fill(ELEMENT_STATES.DEFAULT),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_FIBONACCI_NOT_FOUND, {
      target,
    })
  );
  return steps;
}
