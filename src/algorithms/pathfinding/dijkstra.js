/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { GRID_ELEMENT_STATES } from '../../constants';

/**
 * Dijkstra's Pathfinding Algorithm
 * Time Complexity: O((V + E) log V)
 * Space Complexity: O(V)
 *
 * Finds the shortest path in a weighted graph using a priority queue.
 * For grid pathfinding with uniform weights, behaves similarly to BFS.
 *
 * @param {number[][]} grid - 2D grid with cell weights
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows in grid
 * @param {number} cols - Number of columns in grid
 * @returns {Object[]} - Array of animation steps
 */
export function dijkstra(grid, start, end, rows, cols) {
  const steps = [];

  if (!start || !end || !rows || !cols) {
    console.error('Dijkstra: Invalid inputs', { start, end, rows, cols });
    return steps;
  }

  if (
    start.row < 0 ||
    start.row >= rows ||
    start.col < 0 ||
    start.col >= cols
  ) {
    console.error('Dijkstra: Start position out of bounds', {
      start,
      rows,
      cols,
    });
    return steps;
  }

  if (end.row < 0 || end.row >= rows || end.col < 0 || end.col >= cols) {
    console.error('Dijkstra: End position out of bounds', { end, rows, cols });
    return steps;
  }

  const distances = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
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
    description: 'algorithms.descriptions.dijkstra',
  });

  distances[start.row][start.col] = 0;

  const pq = [{ row: start.row, col: start.col, dist: 0 }];

  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 }, // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 }, // right
  ];

  let found = false;

  while (pq.length > 0 && !found) {
    pq.sort((a, b) => a.dist - b.dist);
    const current = pq.shift();

    if (visited[current.row][current.col]) {
      continue;
    }

    visited[current.row][current.col] = true;

    if (
      !(current.row === start.row && current.col === start.col) &&
      !(current.row === end.row && current.col === end.col)
    ) {
      states[current.row][current.col] = GRID_ELEMENT_STATES.CLOSED;
    }

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: `Exploring cell (${current.row}, ${current.col}) with distance ${current.dist.toFixed(1)}`,
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

      const newDist = distances[current.row][current.col] + 1;

      if (newDist < distances[newRow][newCol]) {
        distances[newRow][newCol] = newDist;
        parent[newRow][newCol] = current;
        pq.push({ row: newRow, col: newCol, dist: newDist });

        if (!(newRow === end.row && newCol === end.col)) {
          states[newRow][newCol] = GRID_ELEMENT_STATES.OPEN;
        }
      }
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
      description: `Path found! Length: ${path.length} cells, Total distance: ${distances[end.row][end.col]}`,
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
 * Pure Dijkstra implementation for testing (returns path coordinates)
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object[]|null} - Array of path coordinates or null if no path
 */
export function dijkstraPure(start, end, rows, cols) {
  const distances = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const visited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const parent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  distances[start.row][start.col] = 0;
  const pq = [{ row: start.row, col: start.col, dist: 0 }];

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const current = pq.shift();

    if (visited[current.row][current.col]) {
      continue;
    }

    visited[current.row][current.col] = true;

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
        const newDist = distances[current.row][current.col] + 1;
        if (newDist < distances[newRow][newCol]) {
          distances[newRow][newCol] = newDist;
          parent[newRow][newCol] = { row: current.row, col: current.col };
          pq.push({ row: newRow, col: newCol, dist: newDist });
        }
      }
    }
  }

  return null; // No path found
}
