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
 * Indices before `prev` are ruled out (jump phase) or scanned past (linear phase).
 * Active comparison at `jumpIdx` (block end) or `prev` (linear scan).
 */
function buildJumpBlockStates(n, prev, jumpIdx) {
  const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
  for (let i = 0; i < prev; i += 1) {
    states[i] = ELEMENT_STATES.AUXILIARY;
  }
  states[jumpIdx] = ELEMENT_STATES.COMPARING;
  return states;
}

function buildLinearScanStates(n, prev) {
  const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
  for (let i = 0; i < prev; i += 1) {
    states[i] = ELEMENT_STATES.AUXILIARY;
  }
  states[prev] = ELEMENT_STATES.COMPARING;
  return states;
}

/**
 * @param {number[]} array — must be sorted ascending
 * @param {number} target
 * @returns {number} index of target, or -1
 */
export function jumpSearchPure(array, target) {
  const n = array.length;
  if (n === 0) return -1;

  const m = Math.max(1, Math.floor(Math.sqrt(n)));
  let prev = 0;

  while (true) {
    const jumpIdx = Math.min(prev + m - 1, n - 1);
    if (array[jumpIdx] >= target) break;
    prev += m;
    if (prev >= n) return -1;
  }

  while (array[prev] < target) {
    prev += 1;
    if (prev >= n) return -1;
  }

  if (array[prev] === target) return prev;
  return -1;
}

/**
 * @param {number[]} array — sorted ascending
 * @param {number} target
 * @returns {Object[]}
 */
export function jumpSearch(array, target) {
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
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_JUMP_START, {
        target,
        m: 0,
      })
    );
    push(
      [],
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_JUMP_NOT_FOUND, { target })
    );
    return steps;
  }

  const m = Math.max(1, Math.floor(Math.sqrt(n)));

  push(
    Array(n).fill(ELEMENT_STATES.DEFAULT),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_JUMP_START, { target, m })
  );

  let prev = 0;

  while (true) {
    const jumpIdx = Math.min(prev + m - 1, n - 1);
    push(
      buildJumpBlockStates(n, prev, jumpIdx),
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_JUMP_BLOCK_CHECK, {
        prev,
        jumpIdx,
        value: arr[jumpIdx],
        target,
        m,
      })
    );

    if (arr[jumpIdx] >= target) break;

    prev += m;
    if (prev >= n) {
      push(
        Array(n).fill(ELEMENT_STATES.DEFAULT),
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_JUMP_NOT_FOUND, {
          target,
        })
      );
      return steps;
    }
  }

  while (arr[prev] < target) {
    push(
      buildLinearScanStates(n, prev),
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_JUMP_LINEAR_CHECK, {
        prev,
        value: arr[prev],
        target,
      })
    );
    prev += 1;
    if (prev >= n) {
      push(
        Array(n).fill(ELEMENT_STATES.DEFAULT),
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_JUMP_NOT_FOUND, {
          target,
        })
      );
      return steps;
    }
  }

  if (arr[prev] === target) {
    const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
    found[prev] = ELEMENT_STATES.SORTED;
    push(
      found,
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_JUMP_FOUND, {
        prev,
        target,
      })
    );
    return steps;
  }

  push(
    buildLinearScanStates(n, prev),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_JUMP_LINEAR_CHECK, {
      prev,
      value: arr[prev],
      target,
    })
  );
  push(
    Array(n).fill(ELEMENT_STATES.DEFAULT),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_JUMP_NOT_FOUND, { target })
  );
  return steps;
}
