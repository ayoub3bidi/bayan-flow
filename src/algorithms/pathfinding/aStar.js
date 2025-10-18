import { GRID_ELEMENT_STATES } from '../../constants';

/**
 * Manhattan distance heuristic for A*
 * @param {Object} a - Position {row, col}
 * @param {Object} b - Position {row, col}
 * @returns {number} - Manhattan distance
 */
function manhattanDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * A* Pathfinding Algorithm
 * Time Complexity: O(b^d) where b is branching factor and d is depth
 * Space Complexity: O(b^d)
 *
 * A* uses heuristics to guide its search, combining benefits of Dijkstra and greedy best-first search.
 * Uses f(n) = g(n) + h(n) where g(n) is cost from start and h(n) is heuristic to goal.
 *
 * @param {number[][]} grid - 2D grid with cell weights
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows in grid
 * @param {number} cols - Number of columns in grid
 * @returns {Object[]} - Array of animation steps
 */
export function aStar(grid, start, end, rows, cols) {
  const steps = [];

  if (!start || !end || !rows || !cols) {
    console.error('A*: Invalid inputs', { start, end, rows, cols });
    return steps;
  }

  if (
    start.row < 0 ||
    start.row >= rows ||
    start.col < 0 ||
    start.col >= cols
  ) {
    console.error('A*: Start position out of bounds', { start, rows, cols });
    return steps;
  }

  if (end.row < 0 || end.row >= rows || end.col < 0 || end.col >= cols) {
    console.error('A*: End position out of bounds', { end, rows, cols });
    return steps;
  }

  const gScore = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const fScore = Array(rows)
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
    description: 'Starting A* pathfinding',
  });

  gScore[start.row][start.col] = 0;
  fScore[start.row][start.col] = manhattanDistance(start, end);

  const openSet = [
    {
      row: start.row,
      col: start.col,
      f: fScore[start.row][start.col],
    },
  ];

  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 }, // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 }, // right
  ];

  let found = false;

  while (openSet.length > 0 && !found) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

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

    const g = gScore[current.row][current.col];
    const h = manhattanDistance(current, end);

    steps.push({
      grid: grid.map(row => [...row]),
      states: states.map(row => [...row]),
      description: `Exploring (${current.row}, ${current.col}) | g=${g.toFixed(1)}, h=${h.toFixed(1)}, f=${current.f.toFixed(1)}`,
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

      const tentativeG = gScore[current.row][current.col] + 1;

      if (tentativeG < gScore[newRow][newCol]) {
        parent[newRow][newCol] = current;
        gScore[newRow][newCol] = tentativeG;
        fScore[newRow][newCol] =
          tentativeG + manhattanDistance({ row: newRow, col: newCol }, end);

        openSet.push({
          row: newRow,
          col: newCol,
          f: fScore[newRow][newCol],
        });

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
      description: `Path found! Length: ${path.length} cells, Cost: ${gScore[end.row][end.col]}`,
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
 * Pure A* implementation for testing (returns path coordinates)
 * @param {Object} start - Start position {row, col}
 * @param {Object} end - End position {row, col}
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object[]|null} - Array of path coordinates or null if no path
 */
export function aStarPure(start, end, rows, cols) {
  const gScore = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const fScore = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Infinity));
  const visited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const parent = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  gScore[start.row][start.col] = 0;
  fScore[start.row][start.col] = manhattanDistance(start, end);

  const openSet = [
    {
      row: start.row,
      col: start.col,
      f: fScore[start.row][start.col],
    },
  ];

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

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
        const tentativeG = gScore[current.row][current.col] + 1;

        if (tentativeG < gScore[newRow][newCol]) {
          parent[newRow][newCol] = { row: current.row, col: current.col };
          gScore[newRow][newCol] = tentativeG;
          fScore[newRow][newCol] =
            tentativeG + manhattanDistance({ row: newRow, col: newCol }, end);

          openSet.push({
            row: newRow,
            col: newCol,
            f: fScore[newRow][newCol],
          });
        }
      }
    }
  }

  return null;
}
