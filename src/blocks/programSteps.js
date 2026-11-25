/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Converts tracer events from a block program into sorting, searching or
 * pathfinding visualizer steps.
 * No Blockly import: this runs on the main thread after the worker replies.
 */

import { ELEMENT_STATES, GRID_ELEMENT_STATES } from '../constants/index.js';
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

/**
 * True when `path` goes from start to end through free, in-bounds cells, each
 * one step (up/down/left/right) from the previous.
 * @param {number[][]} path - `[row, col]` cells
 */
export function isValidGridPath(path, grid, start, end) {
  if (!Array.isArray(path) || path.length === 0) return false;
  const free = cell => Array.isArray(cell) && grid[cell[0]]?.[cell[1]] === 0;
  const same = (cell, { row, col }) => cell[0] === row && cell[1] === col;
  return (
    path.every(free) &&
    same(path[0], start) &&
    same(path[path.length - 1], end) &&
    path.every(
      (cell, i) =>
        i === 0 ||
        Math.abs(cell[0] - path[i - 1][0]) +
          Math.abs(cell[1] - path[i - 1][1]) ===
          1
    )
  );
}

/**
 * Cells on a shortest start → end path (4 moves, around walls), or 0 when the
 * end can't be reached. Used to tell a valid path from a shortest one.
 */
export function shortestPathLength(grid, start, end) {
  const key = (row, col) => `${row},${col}`;
  const seen = new Set([key(start.row, start.col)]);
  let frontier = [[start.row, start.col]];
  for (let length = 1; frontier.length > 0; length++) {
    const next = [];
    for (const [row, col] of frontier) {
      if (row === end.row && col === end.col) return length;
      for (const [r, c] of [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ]) {
        if (grid[r]?.[c] !== 0 || seen.has(key(r, c))) continue;
        seen.add(key(r, c));
        next.push([r, c]);
      }
    }
    frontier = next;
  }
  return 0;
}

/** Cell state and description per tracer event (`leave` mirrors IDA*'s backtrack). */
const PATH_EVENTS = {
  open: [GRID_ELEMENT_STATES.OPEN, ALGORITHM_STEPS.BLOCKS_OPEN],
  visit: [GRID_ELEMENT_STATES.CLOSED, ALGORITHM_STEPS.EXPLORING],
  leave: [GRID_ELEMENT_STATES.CLOSED, ALGORITHM_STEPS.IDA_BACKTRACKING],
};

/**
 * @param {Array<{ kind: 'open'|'visit'|'leave', cell: number[], blockId: string }>} events
 * @param {number[][]} grid - 0 = free, 1 = wall
 * @param {{ row: number, col: number }} start
 * @param {{ row: number, col: number }} end
 * @param {number[][]|null} path - What the program returned.
 * @param {string} [functionName] - Named in the starting step.
 * @returns {{ steps: object[], solved: boolean, shortest: number }}
 *   `solved` for any valid path; `shortest` is the length to compare it with.
 */
export function buildPathProgramSteps(
  events,
  grid,
  start,
  end,
  path,
  functionName = 'find_path'
) {
  const states = grid.map(row => row.map(() => GRID_ELEMENT_STATES.DEFAULT));
  states[start.row][start.col] = GRID_ELEMENT_STATES.START;
  states[end.row][end.col] = GRID_ELEMENT_STATES.END;
  const isEndpoint = (row, col) =>
    (row === start.row && col === start.col) ||
    (row === end.row && col === end.col);
  const step = (description, blockId = null) => ({
    grid: grid.map(row => [...row]),
    states: states.map(row => [...row]),
    description,
    blockId,
  });

  const steps = [
    step(
      getAlgorithmDescription(ALGORITHM_STEPS.STARTING, {
        algorithm: `${functionName}(grid, start, end)`,
      })
    ),
  ];
  for (const { kind, cell, blockId } of events) {
    const [state, key] = PATH_EVENTS[kind] ?? PATH_EVENTS.visit;
    const [row, col] = cell;
    if (states[row]?.[col] === undefined) continue;
    if (!isEndpoint(row, col)) states[row][col] = state;
    steps.push(
      step(
        // IDA*'s backtrack string names the cell as (x, y) = (col, row).
        getAlgorithmDescription(key, { row, col, x: col, y: row }),
        blockId
      )
    );
  }

  const solved = isValidGridPath(path, grid, start, end);
  const shortest = shortestPathLength(grid, start, end);
  let description;
  if (solved) {
    for (const [row, col] of path) {
      if (!isEndpoint(row, col)) states[row][col] = GRID_ELEMENT_STATES.PATH;
    }
    // Still solved: greedy search, for one, isn't meant to be shortest.
    description = getAlgorithmDescription(
      path.length > shortest
        ? ALGORITHM_STEPS.BLOCKS_PATH_LONGER
        : ALGORITHM_STEPS.PATH_FOUND,
      { length: path.length, shortest }
    );
  } else {
    description = getAlgorithmDescription(
      Array.isArray(path) && path.length === 0
        ? ALGORITHM_STEPS.BLOCKS_NO_PATH
        : ALGORITHM_STEPS.BLOCKS_INVALID_PATH
    );
  }
  steps.push(step(description));

  return { steps, solved, shortest };
}
