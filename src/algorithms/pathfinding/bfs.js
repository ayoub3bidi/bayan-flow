/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { GRID_ELEMENT_STATES } from '../../constants';

/**
 * Breadth-First Search (BFS) Pathfinding Algorithm
 * Time Complexity: O(V + E) where V is vertices and E is edges
 * Space Complexity: O(V)
 *
 * BFS explores all neighbor nodes at the present depth before moving to nodes at the next depth level.
 * Guarantees shortest path in unweighted graphs.
 *
 * @param {number[][]} grid - 2D grid (not used for pathfinding, but kept for consistency)
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows in grid
 * @param {number} cols - Number of columns in grid
 * @returns {Object[]} - Array of animation steps
 */
export function bfs(grid, start, end, rows, cols) {
  const steps = [];

  if (!start || !end || !rows || !cols) {
    console.error('BFS: Invalid inputs', { start, end, rows, cols });
    return steps;
  }

  if (
    start.row < 0 ||
    start.row >= rows ||
    start.col < 0 ||
    start.col >= cols
  ) {
    console.error('BFS: Start position out of bounds', { start, rows, cols });
    return steps;
  }

  if (end.row < 0 || end.row >= rows || end.col < 0 || end.col >= cols) {
    console.error('BFS: End position out of bounds', { end, rows, cols });
    return steps;
  }

  const visited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const parent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  const states = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(GRID_ELEMENT_STATES.DEFAULT));
  states[start.row][start.col] = GRID_ELEMENT_STATES.START;
  states[end.row][end.col] = GRID_ELEMENT_STATES.END;

  steps.push({
    grid: grid.map(row => [...row]),
    states: states.map(row => [...row]),
    description: 'Starting BFS pathfinding',
  });

  const queue = [start];
  visited[start.row][start.col] = true;

  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 }, // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 }, // right
  ];

  let found = false;

  while (queue.length > 0 && !found) {
    const current = queue.shift();

    if (
      !(current.row === start.row && current.col === start.col) &&
      !(current.row === end.row && current.col === end.col)
    ) {
      states[current.row][current.col] = GRID_ELEMENT_STATES.CLOSED;
    }

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: `Exploring cell (${current.row}, ${current.col})`,
    });

    if (current.row === end.row && current.col === end.col) {
      found = true;
      break;
    }

    for (const dir of directions) {
      const newRow = current.row + dir.row;
      const newCol = current.col + dir.col;

      if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
        continue;
      }

      if (visited[newRow][newCol]) {
        continue;
      }

      visited[newRow][newCol] = true;
      parent[newRow][newCol] = current;
      queue.push({ row: newRow, col: newCol });

      if (!(newRow === end.row && newCol === end.col)) {
        states[newRow][newCol] = GRID_ELEMENT_STATES.OPEN;
      }
    }

    if (queue.length > 0) {
      steps.push({
        grid: grid.map(row => [...row]),
        states: states.map(row => [...row]),
        description: `Added ${queue.length} cells to queue`,
      });
    }
  }

  if (found) {
    const path = [];
    let current = end;

    while (
      current &&
      !(current.row === start.row && current.col === start.col)
    ) {
      path.unshift(current);
      current = parent[current.row][current.col];
    }

    for (const cell of path) {
      if (!(cell.row === end.row && cell.col === end.col)) {
        states[cell.row][cell.col] = GRID_ELEMENT_STATES.PATH;
      }
    }

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: `Path found! Length: ${path.length} cells`,
    });
  } else {
    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: 'No path found',
    });
  }

  return steps;
}

/**
 * Pure BFS implementation for testing (returns path coordinates)
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object[]|null} - Array of path coordinates or null if no path
 */
export function bfsPure(start, end, rows, cols) {
  const visited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const parent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  const queue = [start];
  visited[start.row][start.col] = true;

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.row === end.row && current.col === end.col) {
      const path = [];
      let curr = end;
      while (curr) {
        path.unshift(curr);
        curr = parent[curr.row][curr.col];
      }
      return path;
    }

    for (const dir of directions) {
      const newRow = current.row + dir.row;
      const newCol = current.col + dir.col;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        !visited[newRow][newCol]
      ) {
        visited[newRow][newCol] = true;
        parent[newRow][newCol] = current;
        queue.push({ row: newRow, col: newCol });
      }
    }
  }

  return null; // No path found
}
