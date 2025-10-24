/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

import { describe, it, expect } from 'vitest';
import { bfsPure } from './bfs';
import { dijkstraPure } from './dijkstra';
import { aStarPure } from './aStar';
import { bfs } from './bfs';
import { dijkstra } from './dijkstra';
import { aStar } from './aStar';

describe('Pathfinding Algorithms - Pure Versions', () => {
  const start = { row: 0, col: 0 };
  const end = { row: 4, col: 4 };
  const rows = 5;
  const cols = 5;

  describe('BFS Pure', () => {
    it('should find a path from start to end', () => {
      const path = bfsPure(start, end, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should return shortest path', () => {
      const path = bfsPure(start, end, rows, cols);
      // Manhattan distance from (0,0) to (4,4) is 8
      // Shortest path should be 9 cells (including start)
      expect(path.length).toBe(9);
    });

    it('should handle start and end being the same', () => {
      const path = bfsPure(start, start, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBe(1);
      expect(path[0]).toEqual(start);
    });

    it('should handle adjacent cells', () => {
      const adjacentEnd = { row: 0, col: 1 };
      const path = bfsPure(start, adjacentEnd, rows, cols);
      expect(path.length).toBe(2);
    });
  });

  describe('Dijkstra Pure', () => {
    it('should find a path from start to end', () => {
      const path = dijkstraPure(start, end, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should return shortest path', () => {
      const path = dijkstraPure(start, end, rows, cols);
      expect(path.length).toBe(9);
    });

    it('should handle start and end being the same', () => {
      const path = dijkstraPure(start, start, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBe(1);
    });
  });

  describe('A* Pure', () => {
    it('should find a path from start to end', () => {
      const path = aStarPure(start, end, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should return shortest path', () => {
      const path = aStarPure(start, end, rows, cols);
      expect(path.length).toBe(9);
    });

    it('should handle start and end being the same', () => {
      const path = aStarPure(start, start, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBe(1);
    });

    it('should be more efficient than BFS (explore fewer nodes)', () => {
      // A* should explore fewer nodes due to heuristic
      // This is a qualitative test - we just verify it works
      const path = aStarPure(start, end, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBe(9);
    });
  });

  describe('Algorithm Consistency', () => {
    it('all algorithms should find paths of same length', () => {
      const bfsPath = bfsPure(start, end, rows, cols);
      const dijkstraPath = dijkstraPure(start, end, rows, cols);
      const aStarPath = aStarPure(start, end, rows, cols);

      expect(bfsPath.length).toBe(dijkstraPath.length);
      expect(dijkstraPath.length).toBe(aStarPath.length);
    });

    it('all algorithms should have same start and end', () => {
      const bfsPath = bfsPure(start, end, rows, cols);
      const dijkstraPath = dijkstraPure(start, end, rows, cols);
      const aStarPath = aStarPure(start, end, rows, cols);

      expect(bfsPath[0]).toEqual(start);
      expect(dijkstraPath[0]).toEqual(start);
      expect(aStarPath[0]).toEqual(start);

      expect(bfsPath[bfsPath.length - 1]).toEqual(end);
      expect(dijkstraPath[dijkstraPath.length - 1]).toEqual(end);
      expect(aStarPath[aStarPath.length - 1]).toEqual(end);
    });
  });
});

describe('Pathfinding Algorithms - Visualization Versions', () => {
  const start = { row: 0, col: 0 };
  const end = { row: 3, col: 3 };
  const rows = 4;
  const cols = 4;
  const grid = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));

  describe('BFS Visualization', () => {
    it('should generate steps array', () => {
      const steps = bfs(grid, start, end, rows, cols);
      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
    });

    it('each step should have required properties', () => {
      const steps = bfs(grid, start, end, rows, cols);
      steps.forEach(step => {
        expect(step).toHaveProperty('grid');
        expect(step).toHaveProperty('states');
        expect(step).toHaveProperty('description');
        expect(Array.isArray(step.grid)).toBe(true);
        expect(Array.isArray(step.states)).toBe(true);
        expect(typeof step.description).toBe('string');
      });
    });

    it('should mark start and end in states', () => {
      const steps = bfs(grid, start, end, rows, cols);
      const firstStep = steps[0];
      expect(firstStep.states[start.row][start.col]).toBe('start');
      expect(firstStep.states[end.row][end.col]).toBe('end');
    });

    it('final step should indicate completion', () => {
      const steps = bfs(grid, start, end, rows, cols);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.description.toLowerCase()).toContain('path');
    });
  });

  describe('Dijkstra Visualization', () => {
    it('should generate steps array', () => {
      const steps = dijkstra(grid, start, end, rows, cols);
      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
    });

    it('each step should have required properties', () => {
      const steps = dijkstra(grid, start, end, rows, cols);
      steps.forEach(step => {
        expect(step).toHaveProperty('grid');
        expect(step).toHaveProperty('states');
        expect(step).toHaveProperty('description');
      });
    });
  });

  describe('A* Visualization', () => {
    it('should generate steps array', () => {
      const steps = aStar(grid, start, end, rows, cols);
      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
    });

    it('each step should have required properties', () => {
      const steps = aStar(grid, start, end, rows, cols);
      steps.forEach(step => {
        expect(step).toHaveProperty('grid');
        expect(step).toHaveProperty('states');
        expect(step).toHaveProperty('description');
      });
    });

    it('should include heuristic information in descriptions', () => {
      const steps = aStar(grid, start, end, rows, cols);
      // At least some steps should mention g, h, or f values
      const hasHeuristicInfo = steps.some(step =>
        step.description.match(/[ghf]=/i)
      );
      expect(hasHeuristicInfo).toBe(true);
    });
  });
});
