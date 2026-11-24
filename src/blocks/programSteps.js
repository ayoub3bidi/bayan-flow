/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Converts tracer events from a block program into sorting or searching
 * visualizer steps.
 * No Blockly import: this runs on the main thread after the worker replies.
 */

import { ELEMENT_STATES } from '../constants/index.js';
import {
  getAlgorithmDescription,
  ALGORITHM_STEPS,
} from '../utils/algorithmTranslations.js';
import { withElementIds } from '../utils/elementIds.js';

/** @param {number[]} array */
export function isSortedAscending(array) {
  return array.every((value, i) => i === 0 || array[i - 1] <= value);
}

/**
 * States and description for one tracer event on `arr`.
 * @param {{ kind: string, i: number|null, j: number|null, array: number[] }} event
 * @param {number} n
 */
function describeEvent({ kind, i, j, array }, n) {
  const states = Array(n).fill(ELEMENT_STATES.DEFAULT);
  const mark = (state, ...indexes) => {
    for (const index of indexes) {
      if (index >= 0 && index < n) states[index] = state;
    }
  };
  switch (kind) {
    case 'swap':
      mark(ELEMENT_STATES.SWAPPING, i, j);
      // After a swap the values already moved: name them in their old order.
      return {
        states,
        description: getAlgorithmDescription(ALGORITHM_STEPS.SWAPPING, {
          a: array[j],
          b: array[i],
        }),
      };
    case 'read':
      mark(ELEMENT_STATES.COMPARING, i);
      return {
        states,
        description: getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_READ, {
          index: i,
          value: array[i],
        }),
      };
    case 'write':
      mark(ELEMENT_STATES.SWAPPING, i);
      return {
        states,
        description: getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_WRITE, {
          index: i,
          value: array[i],
        }),
      };
    case 'shuffle':
      return {
        states: Array(n).fill(ELEMENT_STATES.SWAPPING),
        description: getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_SHUFFLE),
      };
    case 'check':
      return {
        states: Array(n).fill(ELEMENT_STATES.COMPARING),
        description: getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_CHECK),
      };
    default:
      mark(ELEMENT_STATES.COMPARING, i, j);
      return {
        states,
        description: getAlgorithmDescription(ALGORITHM_STEPS.COMPARING, {
          a: array[i],
          b: array[j],
        }),
      };
  }
}

/**
 * @param {Array<{ kind: 'compare'|'swap'|'read'|'write'|'shuffle'|'check',
 *   i: number|null, j: number|null, array: number[], blockId: string }>} events
 * @param {number[]} inputArray
 * @param {number[]|null} finalArray - What the program returned.
 * @param {string} [functionName] - Named in the starting step.
 * @returns {{ steps: object[], sorted: boolean }}
 */
export function buildProgramSteps(
  events,
  inputArray,
  finalArray,
  functionName = 'sort'
) {
  const n = inputArray.length;
  const defaults = () => Array(n).fill(ELEMENT_STATES.DEFAULT);

  const steps = [
    {
      array: [...inputArray],
      states: defaults(),
      description: getAlgorithmDescription(ALGORITHM_STEPS.STARTING, {
        algorithm: `${functionName}(arr)`,
      }),
      blockId: null,
    },
  ];

  for (const event of events) {
    steps.push({
      array: event.array,
      ...describeEvent(event, n),
      blockId: event.blockId,
    });
  }

  const lastArray = steps[steps.length - 1].array;
  const sorted =
    Array.isArray(finalArray) &&
    finalArray.length === n &&
    isSortedAscending(finalArray);
  steps.push({
    array: [...lastArray],
    states: sorted ? Array(n).fill(ELEMENT_STATES.SORTED) : defaults(),
    description: getAlgorithmDescription(
      sorted ? ALGORITHM_STEPS.COMPLETED : ALGORITHM_STEPS.BLOCKS_NOT_SORTED
    ),
    blockId: null,
  });

  return { steps: withElementIds(steps), sorted };
}

/** Start/found description keys per search; `check` stays generic. */
const searchKeys = name => ({
  start: ALGORITHM_STEPS[`SEARCH_${name}_START`],
  found: ALGORITHM_STEPS[`SEARCH_${name}_FOUND`],
});
const SEARCH_KEYS = {
  linearSearch: searchKeys('LINEAR'),
  binarySearch: searchKeys('BINARY'),
  ternarySearch: searchKeys('TERNARY'),
  jumpSearch: searchKeys('JUMP'),
  interpolationSearch: searchKeys('INTERPOLATION'),
  exponentialSearch: searchKeys('EXPONENTIAL'),
  fibonacciSearch: searchKeys('FIBONACCI'),
};

/**
 * shortcut: binary search steps don't gray out the discarded halves (the
 * tracer can't see left/right); add bound tracing if learners find it unclear.
 *
 * @param {Array<{ kind: string, i: number, array: number[], blockId: string }>} events
 *   Only target compares become steps; reads (e.g. in a formula) are skipped.
 * @param {number[]} inputArray
 * @param {number} target - Always picked from the array.
 * @param {number|null} result - The index the program returned.
 * @param {string} algorithmKey
 * @returns {{ steps: object[], solved: boolean }}
 */
export function buildSearchProgramSteps(
  events,
  inputArray,
  target,
  result,
  algorithmKey
) {
  const keys = SEARCH_KEYS[algorithmKey] ?? SEARCH_KEYS.linearSearch;
  const n = inputArray.length;
  const defaults = () => Array(n).fill(ELEMENT_STATES.DEFAULT);
  const step = (states, description, blockId = null) => ({
    array: [...inputArray],
    states,
    description,
    targetValue: target,
    blockId,
  });

  const steps = [
    step(
      defaults(),
      // `m` is jump search's block size.
      getAlgorithmDescription(keys.start, {
        target,
        m: Math.floor(Math.sqrt(n)),
      })
    ),
  ];
  for (const event of events) {
    if (event.kind !== 'compare') continue;
    const states = defaults();
    states[event.i] = ELEMENT_STATES.COMPARING;
    steps.push(
      step(
        states,
        getAlgorithmDescription(ALGORITHM_STEPS.SEARCH_LINEAR_CHECK, {
          index: event.i,
          value: inputArray[event.i],
          target,
        }),
        event.blockId
      )
    );
  }

  const solved =
    Number.isInteger(result) &&
    result >= 0 &&
    result < n &&
    inputArray[result] === target;
  const finalStates = defaults();
  let description;
  if (solved) {
    finalStates[result] = ELEMENT_STATES.SORTED;
    description = getAlgorithmDescription(keys.found, {
      target,
      // Each search's "found" string names the index differently.
      ...Object.fromEntries(
        ['index', 'mid', 'prev', 'pos', 'probe'].map(key => [key, result])
      ),
    });
  } else if (result === -1) {
    description = getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_NOT_FOUND, {
      target,
    });
  } else {
    description = getAlgorithmDescription(ALGORITHM_STEPS.BLOCKS_WRONG_INDEX, {
      target,
      index: result,
    });
  }
  steps.push(step(finalStates, description));

  return { steps: withElementIds(steps), solved };
}
