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
 * @param {number[]} array — must be sorted ascending
 * @param {number} target
 * @returns {number} index of target, or -1
 */
export function interpolationSearchPure(array, target) {
  const n = array.length;
  if (n === 0) return -1;

  let lo = 0;
  let hi = n - 1;

  while (lo <= hi && target >= array[lo] && target <= array[hi]) {
    if (lo === hi) {
      return array[lo] === target ? lo : -1;
    }
    if (array[hi] === array[lo]) {
      return array[lo] === target ? lo : -1;
    }

    let pos =
      lo +
      Math.floor(((target - array[lo]) * (hi - lo)) / (array[hi] - array[lo]));
    if (pos < lo) pos = lo;
    else if (pos > hi) pos = hi;

    if (array[pos] === target) return pos;
    if (array[pos] < target) lo = pos + 1;
    else hi = pos - 1;
  }
  return -1;
}

function buildStates(n, left, right, probe) {
  const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
  for (let i = 0; i < n; i += 1) {
    if (i < left || i > right) {
      states[i] = ELEMENT_STATES.AUXILIARY;
    }
  }
  if (probe >= left && probe <= right) {
    states[probe] = ELEMENT_STATES.COMPARING;
  }
  return states;
}

/**
 * @param {number[]} array — sorted ascending
 * @param {number} target
 * @returns {Object[]}
 */
export function interpolationSearch(array, target) {
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
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_INTERPOLATION_START, {
      target,
    })
  );

  if (n === 0) {
    push(
      [],
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_INTERPOLATION_NOT_FOUND, {
        target,
      })
    );
    return steps;
  }

  let lo = 0;
  let hi = n - 1;

  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    if (lo === hi) {
      push(
        buildStates(n, lo, hi, lo),
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_INTERPOLATION_PROBE, {
          lo,
          hi,
          pos: lo,
          value: arr[lo],
          target,
          loVal: arr[lo],
          hiVal: arr[hi],
        })
      );
      const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
      found[lo] = ELEMENT_STATES.SORTED;
      push(
        found,
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_INTERPOLATION_FOUND, {
          pos: lo,
          target,
        })
      );
      return steps;
    }

    if (arr[hi] === arr[lo]) {
      if (arr[lo] === target) {
        push(
          buildStates(n, lo, hi, lo),
          getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_INTERPOLATION_PROBE, {
            lo,
            hi,
            pos: lo,
            value: arr[lo],
            target,
            loVal: arr[lo],
            hiVal: arr[hi],
          })
        );
        const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
        found[lo] = ELEMENT_STATES.SORTED;
        push(
          found,
          getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_INTERPOLATION_FOUND, {
            pos: lo,
            target,
          })
        );
        return steps;
      }
      push(
        Array(n).fill(ELEMENT_STATES.DEFAULT),
        getAlgorithmDescription(
          ALGORITHM_STEPS.SEARCH_INTERPOLATION_NOT_FOUND,
          {
            target,
          }
        )
      );
      return steps;
    }

    const pos =
      lo + Math.floor(((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo]));
    const clamped = pos < lo ? lo : pos > hi ? hi : pos;

    push(
      buildStates(n, lo, hi, clamped),
      getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_INTERPOLATION_PROBE, {
        lo,
        hi,
        pos: clamped,
        value: arr[clamped],
        target,
        loVal: arr[lo],
        hiVal: arr[hi],
      })
    );

    if (arr[clamped] === target) {
      const found = Array(n).fill(ELEMENT_STATES.DEFAULT);
      found[clamped] = ELEMENT_STATES.SORTED;
      push(
        found,
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_INTERPOLATION_FOUND, {
          pos: clamped,
          target,
        })
      );
      return steps;
    }

    if (arr[clamped] < target) {
      lo = clamped + 1;
    } else {
      hi = clamped - 1;
    }
  }

  push(
    Array(n).fill(ELEMENT_STATES.DEFAULT),
    getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_INTERPOLATION_NOT_FOUND, {
      target,
    })
  );
  return steps;
}
