/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { GRID_ELEMENT_STATES } from '../../constants';
import {
  getAlgorithmDescription,
  ALGORITHM_STEPS,
} from '../../utils/algorithmTranslations';
import { PriorityQueue } from '../../utils/PriorityQueue';
import { calculateKey, compareKeys } from '../../utils/dStarLiteHelpers';

/**
 * D* Lite Pathfinding Algorithm
 * @param {number[][]} grid - 2D grid
 * @param {Object} start - Start position
 * @param {Object} end - End position
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object[]} - Animation steps
 */
export function dStarLite(grid, start, end, rows, cols) {
  const steps = [];

  if (!start || !end || !rows || !cols) {
    console.error('D* Lite: Invalid inputs', { start, end, rows, cols });
    return steps;
  }

  if (
    start.row < 0 ||
    start.row >= rows ||
    start.col < 0 ||
    start.col >= cols
  ) {
    console.error('D* Lite: Start position out of bounds', {
      start,
      rows,
      cols,
    });
    return steps;
  }

  if (end.row < 0 || end.row >= rows || end.col < 0 || end.col >= cols) {
    console.error('D* Lite: End position out of bounds', { end, rows, cols });
    return steps;
  }

  // Initialize grids
  const g = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const rhs = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const states = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(GRID_ELEMENT_STATES.DEFAULT));

  states[start.row][start.col] = GRID_ELEMENT_STATES.START;
  states[end.row][end.col] = GRID_ELEMENT_STATES.END;

  // D* Lite allows start/end to be same
  if (start.row === end.row && start.col === end.col) {
    steps.push({
      grid: grid.map(r => [...r]),
      states: states.map(r => [...r]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.PATH_FOUND, {
        length: 0,
      }),
    });
    return steps;
  }

  // D* Lite Initialization
  rhs[end.row][end.col] = 0;
  const pq = new PriorityQueue();
  pq.enqueue(end, calculateKey(end, start, g, rhs, 0));

  // Initial step showing start and end clearly marked
  steps.push({
    grid: grid.map(r => [...r]),
    states: states.map(r => [...r]),
    description: 'algorithms.descriptions.dStarLite',
  });

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  // ComputeShortestPath loop
  let stepCounter = 0;
  const VISUALIZATION_SAMPLE_RATE = 5;

  while (!pq.isEmpty()) {
    const topItem = pq.dequeue();
    const u = topItem.val;

    // Check termination
    const startKey = calculateKey(start, start, g, rhs, 0);
    const curKey = calculateKey(u, start, g, rhs, 0);

    if (
      compareKeys(curKey, startKey) === false &&
      rhs[start.row][start.col] === g[start.row][start.col]
    ) {
      break;
    }

    // Mark as closed ONLY if it's not start or end
    if (
      !(u.row === start.row && u.col === start.col) &&
      !(u.row === end.row && u.col === end.col)
    ) {
      states[u.row][u.col] = GRID_ELEMENT_STATES.CLOSED;
    }

    // Sample visualization steps for performance
    if (++stepCounter % VISUALIZATION_SAMPLE_RATE === 0) {
      steps.push({
        grid: grid.map(r => [...r]),
        states: states.map(r => [...r]),
        description: getAlgorithmDescription(
          ALGORITHM_STEPS.D_STAR_LITE_EXPANSION,
          {
            row: u.row,
            col: u.col,
          }
        ),
      });
    }

    const gVal = g[u.row][u.col];
    const rhsVal = rhs[u.row][u.col];

    if (gVal > rhsVal) {
      g[u.row][u.col] = rhsVal;

      // Update predecessors (neighbors)
      for (const dir of directions) {
        const s = { row: u.row + dir.row, col: u.col + dir.col };
        if (s.row >= 0 && s.row < rows && s.col >= 0 && s.col < cols) {
          if (s.row !== end.row || s.col !== end.col) {
            rhs[s.row][s.col] = Math.min(
              rhs[s.row][s.col],
              g[u.row][u.col] + 1
            );
          }
          updateVertex(s, start, g, rhs, pq, states);
        }
      }
    } else {
      g[u.row][u.col] = Infinity;
      updateVertex(u, start, g, rhs, pq, states);

      // Update neighbors
      for (const dir of directions) {
        const s = { row: u.row + dir.row, col: u.col + dir.col };
        if (s.row >= 0 && s.row < rows && s.col >= 0 && s.col < cols) {
          if (s.row !== end.row || s.col !== end.col) {
            let minRhs = Infinity;
            for (const d2 of directions) {
              const s2 = { row: s.row + d2.row, col: s.col + d2.col };
              if (
                s2.row >= 0 &&
                s2.row < rows &&
                s2.col >= 0 &&
                s2.col < cols
              ) {
                minRhs = Math.min(minRhs, g[s2.row][s2.col] + 1);
              }
            }
            rhs[s.row][s.col] = minRhs;
          }
          updateVertex(s, start, g, rhs, pq, states);
        }
      }
    }
  }

  // Path reconstruction
  if (g[start.row][start.col] !== Infinity) {
    let curr = start;
    const path = [curr];

    while (curr.row !== end.row || curr.col !== end.col) {
      // Mark path cells (but not start or end)
      if (
        !(curr.row === start.row && curr.col === start.col) &&
        !(curr.row === end.row && curr.col === end.col)
      ) {
        states[curr.row][curr.col] = GRID_ELEMENT_STATES.PATH;
      }

      // Find min neighbor
      let minVal = Infinity;
      let next = null;
      for (const dir of directions) {
        const s = { row: curr.row + dir.row, col: curr.col + dir.col };
        if (s.row >= 0 && s.row < rows && s.col >= 0 && s.col < cols) {
          const val = g[s.row][s.col];
          if (val < minVal) {
            minVal = val;
            next = s;
          }
        }
      }

      if (!next || minVal === Infinity) break;
      curr = next;
      path.push(curr);
    }

    steps.push({
      grid: grid.map(r => [...r]),
      states: states.map(r => [...r]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.PATH_FOUND, {
        length: path.length,
      }),
    });
  } else {
    steps.push({
      grid: grid.map(r => [...r]),
      states: states.map(r => [...r]),
      description: getAlgorithmDescription(ALGORITHM_STEPS.NO_PATH),
    });
  }

  return steps;
}

/**
 * Update vertex helper function
 * @param {Object} u - Node to update
 * @param {Object} start - Start position
 * @param {number[][]} g - G-values
 * @param {number[][]} rhs - RHS-values
 * @param {PriorityQueue} pq - Priority queue
 * @param {string[][]} states - Grid states (for visualization)
 */
function updateVertex(u, start, g, rhs, pq, states) {
  if (g[u.row][u.col] !== rhs[u.row][u.col]) {
    pq.enqueue(u, calculateKey(u, start, g, rhs, 0));

    // Mark as OPEN only if it's not start or end
    if (
      states &&
      states[u.row][u.col] !== GRID_ELEMENT_STATES.START &&
      states[u.row][u.col] !== GRID_ELEMENT_STATES.END
    ) {
      states[u.row][u.col] = GRID_ELEMENT_STATES.OPEN;
    }
  }
}

/**
 * Pure D* Lite implementation
 * @param {Object} start
 * @param {Object} end
 * @param {number} rows
 * @param {number} cols
 * @returns {Object[]|null}
 */
export function dStarLitePure(start, end, rows, cols) {
  const g = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const rhs = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));

  if (start.row === end.row && start.col === end.col) return [start];

  rhs[end.row][end.col] = 0;
  const pq = new PriorityQueue();
  pq.enqueue(end, calculateKey(end, start, g, rhs, 0));

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  while (!pq.isEmpty()) {
    const topItem = pq.dequeue();
    const u = topItem.val;

    const startKey = calculateKey(start, start, g, rhs, 0);
    const curKey = calculateKey(u, start, g, rhs, 0);

    if (compareKeys(topItem.priority, curKey)) continue;

    if (
      compareKeys(curKey, startKey) === false &&
      rhs[start.row][start.col] === g[start.row][start.col]
    ) {
      break;
    }

    const gVal = g[u.row][u.col];
    const rhsVal = rhs[u.row][u.col];

    if (gVal > rhsVal) {
      g[u.row][u.col] = rhsVal;
      for (const dir of directions) {
        const s = { row: u.row + dir.row, col: u.col + dir.col };
        if (s.row >= 0 && s.row < rows && s.col >= 0 && s.col < cols) {
          if (s.row !== end.row || s.col !== end.col) {
            rhs[s.row][s.col] = Math.min(
              rhs[s.row][s.col],
              g[u.row][u.col] + 1
            );
          }
          if (g[s.row][s.col] !== rhs[s.row][s.col]) {
            pq.enqueue(s, calculateKey(s, start, g, rhs, 0));
          }
        }
      }
    } else {
      g[u.row][u.col] = Infinity;
      for (const dir of directions) {
        const s = { row: u.row + dir.row, col: u.col + dir.col };
        if (s.row >= 0 && s.row < rows && s.col >= 0 && s.col < cols) {
          if (s.row !== end.row || s.col !== end.col) {
            let minRhs = Infinity;
            for (const d2 of directions) {
              const s2 = { row: s.row + d2.row, col: s.col + d2.col };
              if (
                s2.row >= 0 &&
                s2.row < rows &&
                s2.col >= 0 &&
                s2.col < cols
              ) {
                minRhs = Math.min(minRhs, g[s2.row][s2.col] + 1);
              }
            }
            rhs[s.row][s.col] = minRhs;
          }
          if (g[s.row][s.col] !== rhs[s.row][s.col]) {
            pq.enqueue(s, calculateKey(s, start, g, rhs, 0));
          }
        }
      }
    }
  }

  if (g[start.row][start.col] === Infinity) return null;

  const path = [start];
  let curr = start;
  while (curr.row !== end.row || curr.col !== end.col) {
    let minVal = Infinity;
    let next = null;
    for (const dir of directions) {
      const s = { row: curr.row + dir.row, col: curr.col + dir.col };
      if (s.row >= 0 && s.row < rows && s.col >= 0 && s.col < cols) {
        const val = g[s.row][s.col];
        if (val < minVal) {
          minVal = val;
          next = s;
        }
      }
    }
    if (!next) return null;
    curr = next;
    path.push(curr);
  }
  return path;
}
