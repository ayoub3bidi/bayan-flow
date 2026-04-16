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
 * @param {number} n
 * @param {number} index — current probe index
 */
function buildLinearScanStates(n, index) {
  const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
  for (let i = 0; i < index; i += 1) {
    states[i] = ELEMENT_STATES.AUXILIARY;
  }
  states[index] = ELEMENT_STATES.COMPARING;
  return states;
}

/**
 * @param {number[]} array — any order (Bayan Flow uses sorted arrays in searching mode for parity)
 * @param {number} target
 * @returns {number} index of target, or -1
 */
export function linearSearchPure(array, target) {
  for (let i = 0; i < array.length; i += 1) {
    if (array[i] === target) return i;
  }
  return -1;
}

/**
 * @param {number[]} array
 * @param {number} target
 * @returns {Object[]}
 */
export function linearSearch(array, target) {
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
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_LINEAR_START, { target })
    );
    push(
      [],
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_LINEAR_NOT_FOUND, {
        target,
      })
    );
    return steps;
  }

  push(
    Array(n).fill(ELEMENT_STATES.DEFAULT),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_LINEAR_START, { target })
  );

  for (let i = 0; i < n; i += 1) {
    push(
      buildLinearScanStates(n, i),
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_LINEAR_CHECK, {
        index: i,
        value: arr[i],
        target,
      })
    );

    if (arr[i] === target) {
      const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
      found[i] = ELEMENT_STATES.SORTED;
      push(
        found,
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_LINEAR_FOUND, {
          index: i,
          target,
        })
      );
      return steps;
    }
  }

  push(
    Array(n).fill(ELEMENT_STATES.DEFAULT),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_LINEAR_NOT_FOUND, {
      target,
    })
  );
  return steps;
}
