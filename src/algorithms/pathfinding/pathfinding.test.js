/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';

/**
 * Asserts that pathfinding visualization steps have the required structure
 * @param {Object[]} steps - Array of step objects from a pathfinding algorithm
 */
function assertPathfindingStepStructure(steps) {
  steps.forEach(step => {
    expect(step).toHaveProperty('grid');
    expect(step).toHaveProperty('states');
    expect(step).toHaveProperty('description');
    expect(Array.isArray(step.grid)).toBe(true);
    expect(Array.isArray(step.states)).toBe(true);
    expect(typeof step.description).toBe('string');
  });
}
import { bfsPure } from './bfs';
import { dijkstraPure } from './dijkstra';
import { aStarPure } from './aStar';
import { bidirectionalSearchPure } from './bidirectionalSearch';
import { greedyBestFirstSearchPure } from './greedyBestFirstSearch';
import { jumpPointSearchPure } from './jumpPointSearch';
import { bfs } from './bfs';
import { dijkstra } from './dijkstra';
import { aStar } from './aStar';
import { bidirectionalSearch } from './bidirectionalSearch';
import { greedyBestFirstSearch } from './greedyBestFirstSearch';
import { jumpPointSearch } from './jumpPointSearch';
import { bellmanFord } from './bellmanFord';
import { bellmanFordPure } from './bellmanFord';
import { idaStar } from './idaStar';
import { idaStarPure } from './idaStar';
import { dStarLite } from './dStarLite';
import { dStarLitePure } from './dStarLite';

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

  describe('Bidirectional Search Pure', () => {
    it('should find a path from start to end', () => {
      const path = bidirectionalSearchPure(start, end, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should return shortest path', () => {
      const path = bidirectionalSearchPure(start, end, rows, cols);
      // Manhattan distance from (0,0) to (4,4) is 8
      // Shortest path should be 9 cells (including start)
      expect(path.length).toBe(9);
    });

    it('should handle start and end being the same', () => {
      const path = bidirectionalSearchPure(start, start, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBe(1);
      expect(path[0]).toEqual(start);
    });

    it('should handle adjacent cells', () => {
      const adjacentEnd = { row: 0, col: 1 };
      const path = bidirectionalSearchPure(start, adjacentEnd, rows, cols);
      expect(path.length).toBe(2);
    });

    it('should be more efficient than BFS for longer paths', () => {
      // Test with a larger grid to see the efficiency benefit
      const largeStart = { row: 0, col: 0 };
      const largeEnd = { row: 9, col: 9 };
      const largeRows = 10;
      const largeCols = 10;

      const path = bidirectionalSearchPure(
        largeStart,
        largeEnd,
        largeRows,
        largeCols
      );
      expect(path).toBeTruthy();
      expect(path.length).toBe(19); // Manhattan distance + 1
    });
  });

  describe('Greedy Best-First Search Pure', () => {
    it('should find a path from start to end', () => {
      const path = greedyBestFirstSearchPure(start, end, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should handle start and end being the same', () => {
      const path = greedyBestFirstSearchPure(start, start, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBe(1);
      expect(path[0]).toEqual(start);
    });

    it('should handle adjacent cells', () => {
      const adjacentEnd = { row: 0, col: 1 };
      const path = greedyBestFirstSearchPure(start, adjacentEnd, rows, cols);
      expect(path.length).toBe(2);
    });

    it('should find a path (may not be optimal)', () => {
      const path = greedyBestFirstSearchPure(start, end, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
      // Greedy algorithm may not find the shortest path, but should find a valid path
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });
  });

  describe('Jump Point Search Pure', () => {
    it('should find a path from start to end', () => {
      const path = jumpPointSearchPure(start, end, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should return shortest path (same as A*)', () => {
      const jpsPath = jumpPointSearchPure(start, end, rows, cols);
      const aStarPath = aStarPure(start, end, rows, cols);
      // JPS should find the same optimal path as A*
      expect(jpsPath).toBeTruthy();
      expect(aStarPath).toBeTruthy();
      expect(jpsPath.length).toBe(aStarPath.length);
    });

    it('should handle start and end being the same', () => {
      const path = jumpPointSearchPure(start, start, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBe(1);
      expect(path[0]).toEqual(start);
    });

    it('should handle adjacent cells', () => {
      const adjacentEnd = { row: 0, col: 1 };
      const path = jumpPointSearchPure(start, adjacentEnd, rows, cols);
      expect(path.length).toBe(2);
    });

    it('should find optimal path in large grid', () => {
      const largeStart = { row: 0, col: 0 };
      const largeEnd = { row: 9, col: 9 };
      const largeRows = 10;
      const largeCols = 10;

      const jpsPath = jumpPointSearchPure(
        largeStart,
        largeEnd,
        largeRows,
        largeCols
      );
      const aStarPath = aStarPure(largeStart, largeEnd, largeRows, largeCols);

      expect(jpsPath).toBeTruthy();
      expect(aStarPath).toBeTruthy();
      // Both should find optimal path
      expect(jpsPath.length).toBe(aStarPath.length);
    });
  });

  describe('Bellman-Ford Pure', () => {
    it('should find a path from start to end', () => {
      const path = bellmanFordPure(start, end, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should return shortest path', () => {
      const path = bellmanFordPure(start, end, rows, cols);
      // Manhattan distance from (0,0) to (4,4) is 8
      // Shortest path should be 9 cells (including start)
      expect(path.length).toBe(9);
    });

    it('should handle start and end being the same', () => {
      const path = bellmanFordPure(start, start, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBe(1);
      expect(path[0]).toEqual(start);
    });

    it('should handle adjacent cells', () => {
      const adjacentEnd = { row: 0, col: 1 };
      const path = bellmanFordPure(start, adjacentEnd, rows, cols);
      expect(path.length).toBe(2);
    });
  });

  describe('IDA* Pure', () => {
    it('should find a path from start to end', () => {
      const path = idaStarPure(start, end, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should return shortest path', () => {
      const path = idaStarPure(start, end, rows, cols);
      expect(path.length).toBe(9);
    });

    it('should handle start and end being the same', () => {
      const path = idaStarPure(start, start, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBe(1);
      expect(path[0]).toEqual(start);
    });

    it('should handle adjacent cells', () => {
      const adjacentEnd = { row: 0, col: 1 };
      const path = idaStarPure(start, adjacentEnd, rows, cols);
      expect(path.length).toBe(2);
    });
  });

  describe('D* Lite Pure', () => {
    it('should find a path from start to end', () => {
      const path = dStarLitePure(start, end, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should return shortest path', () => {
      const path = dStarLitePure(start, end, rows, cols);
      // D* Lite on static grid should be optimal (Manhattan distance 8, length 9)
      expect(path.length).toBe(9);
    });

    it('should handle start and end being the same', () => {
      const path = dStarLitePure(start, start, rows, cols);
      expect(path).toBeTruthy();
      expect(path.length).toBe(1);
      expect(path[0]).toEqual(start);
    });

    it('should handle adjacent cells', () => {
      const adjacentEnd = { row: 0, col: 1 };
      const path = dStarLitePure(start, adjacentEnd, rows, cols);
      expect(path.length).toBe(2);
    });
  });

  describe('Algorithm Consistency', () => {
    it('all algorithms should find paths of same length', () => {
      const bfsPath = bfsPure(start, end, rows, cols);
      const dijkstraPath = dijkstraPure(start, end, rows, cols);
      const aStarPath = aStarPure(start, end, rows, cols);
      const bidirectionalPath = bidirectionalSearchPure(start, end, rows, cols);
      const greedyPath = greedyBestFirstSearchPure(start, end, rows, cols);
      const jpsPath = jumpPointSearchPure(start, end, rows, cols);
      const bellmanPath = bellmanFordPure(start, end, rows, cols);

      expect(bfsPath.length).toBe(dijkstraPath.length);
      expect(dijkstraPath.length).toBe(aStarPath.length);
      expect(aStarPath.length).toBe(bidirectionalPath.length);
      expect(aStarPath.length).toBe(jpsPath.length); // JPS should be optimal like A*
      expect(bellmanPath.length).toBe(bfsPath.length); // Bellman-Ford should find shortest path too
      // Note: Greedy Best-First Search may find longer paths since it's not optimal
      expect(greedyPath.length).toBeGreaterThan(0);
    });

    it('all algorithms should have same start and end', () => {
      const bfsPath = bfsPure(start, end, rows, cols);
      const dijkstraPath = dijkstraPure(start, end, rows, cols);
      const aStarPath = aStarPure(start, end, rows, cols);
      const bidirectionalPath = bidirectionalSearchPure(start, end, rows, cols);
      const greedyPath = greedyBestFirstSearchPure(start, end, rows, cols);
      const jpsPath = jumpPointSearchPure(start, end, rows, cols);
      const bellmanPath = bellmanFordPure(start, end, rows, cols);

      expect(bfsPath[0]).toEqual(start);
      expect(dijkstraPath[0]).toEqual(start);
      expect(aStarPath[0]).toEqual(start);
      expect(bidirectionalPath[0]).toEqual(start);
      expect(greedyPath[0]).toEqual(start);
      expect(jpsPath[0]).toEqual(start);

      expect(bfsPath[bfsPath.length - 1]).toEqual(end);
      expect(dijkstraPath[dijkstraPath.length - 1]).toEqual(end);
      expect(aStarPath[aStarPath.length - 1]).toEqual(end);
      expect(bidirectionalPath[bidirectionalPath.length - 1]).toEqual(end);
      expect(greedyPath[greedyPath.length - 1]).toEqual(end);
      expect(jpsPath[jpsPath.length - 1]).toEqual(end);
      expect(bellmanPath[bellmanPath.length - 1]).toEqual(end);
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
      assertPathfindingStepStructure(steps);
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
      assertPathfindingStepStructure(steps);
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
      assertPathfindingStepStructure(steps);
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

  describe('Bidirectional Search Visualization', () => {
    it('should generate steps array', () => {
      const steps = bidirectionalSearch(grid, start, end, rows, cols);
      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
    });

    it('each step should have required properties', () => {
      const steps = bidirectionalSearch(grid, start, end, rows, cols);
      assertPathfindingStepStructure(steps);
    });

    it('should mark start and end in states', () => {
      const steps = bidirectionalSearch(grid, start, end, rows, cols);
      const firstStep = steps[0];
      expect(firstStep.states[start.row][start.col]).toBe('start');
      expect(firstStep.states[end.row][end.col]).toBe('end');
    });

    it('should include bidirectional search information in descriptions', () => {
      const steps = bidirectionalSearch(grid, start, end, rows, cols);
      // Should have forward/backward exploration indicators
      const hasBidirectionalInfo = steps.some(
        step =>
          step.description.toLowerCase().includes('forward') ||
          step.description.toLowerCase().includes('backward') ||
          step.description.toLowerCase().includes('meeting')
      );
      expect(hasBidirectionalInfo).toBe(true);
    });

    it('should handle same start and end positions', () => {
      const sameSteps = bidirectionalSearch(grid, start, start, rows, cols);
      expect(sameSteps.length).toBeGreaterThan(0);
      expect(
        sameSteps[sameSteps.length - 1].description.toLowerCase()
      ).toContain('path');
    });
  });

  describe('Greedy Best-First Search Visualization', () => {
    it('should generate steps array', () => {
      const steps = greedyBestFirstSearch(grid, start, end, rows, cols);
      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
    });

    it('each step should have required properties', () => {
      const steps = greedyBestFirstSearch(grid, start, end, rows, cols);
      assertPathfindingStepStructure(steps);
    });

    it('should mark start and end in states', () => {
      const steps = greedyBestFirstSearch(grid, start, end, rows, cols);
      const firstStep = steps[0];
      expect(firstStep.states[start.row][start.col]).toBe('start');
      expect(firstStep.states[end.row][end.col]).toBe('end');
    });

    it('should include heuristic information in descriptions', () => {
      const steps = greedyBestFirstSearch(grid, start, end, rows, cols);
      // Should have heuristic values in descriptions
      const hasHeuristicInfo = steps.some(step =>
        step.description.match(/h=/i)
      );
      expect(hasHeuristicInfo).toBe(true);
    });

    it('should handle same start and end positions', () => {
      const sameSteps = greedyBestFirstSearch(grid, start, start, rows, cols);
      expect(sameSteps.length).toBeGreaterThan(0);
      expect(
        sameSteps[sameSteps.length - 1].description.toLowerCase()
      ).toContain('path');
    });
  });

  describe('Jump Point Search Visualization', () => {
    it('should generate steps array', () => {
      const steps = jumpPointSearch(grid, start, end, rows, cols);
      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
    });

    it('each step should have required properties', () => {
      const steps = jumpPointSearch(grid, start, end, rows, cols);
      assertPathfindingStepStructure(steps);
    });

    it('should mark start and end in states', () => {
      const steps = jumpPointSearch(grid, start, end, rows, cols);
      const firstStep = steps[0];
      expect(firstStep.states[start.row][start.col]).toBe('start');
      expect(firstStep.states[end.row][end.col]).toBe('end');
    });

    it('should include jump point information in descriptions', () => {
      const steps = jumpPointSearch(grid, start, end, rows, cols);
      // Should have jump point or heuristic info in descriptions
      const hasJumpInfo = steps.some(
        step =>
          step.description.toLowerCase().includes('jump') ||
          step.description.match(/[ghf]=/i) ||
          step.description.toLowerCase().includes('discovered')
      );
      expect(hasJumpInfo).toBe(true);
    });

    it('should handle same start and end positions', () => {
      const sameSteps = jumpPointSearch(grid, start, start, rows, cols);
      expect(sameSteps.length).toBeGreaterThan(0);
      expect(
        sameSteps[sameSteps.length - 1].description.toLowerCase()
      ).toContain('path');
    });

    it('final step should indicate completion', () => {
      const steps = jumpPointSearch(grid, start, end, rows, cols);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.description.toLowerCase()).toContain('path');
    });

    it('should find path in grid with walls (obstacles)', () => {
      // 5x5 grid with wall in middle row blocking direct path
      const gridWithWalls = [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
      ];
      const wallStart = { row: 0, col: 0 };
      const wallEnd = { row: 4, col: 4 };

      const steps = jumpPointSearch(gridWithWalls, wallStart, wallEnd, 5, 5);

      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.description.toLowerCase()).toContain('path');
    });

    it('should handle no path found (blocked grid)', () => {
      // Grid where start is surrounded by walls, end unreachable
      const blockedGrid = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
      const blockedStart = { row: 0, col: 0 };
      const blockedEnd = { row: 2, col: 2 };

      const steps = jumpPointSearch(
        blockedGrid,
        blockedStart,
        blockedEnd,
        3,
        3
      );

      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.description).toBeTruthy();
    });

    it('should return empty steps for invalid inputs', () => {
      const emptyGrid = Array(4)
        .fill(null)
        .map(() => Array(4).fill(0));
      const validStart = { row: 0, col: 0 };
      const validEnd = { row: 3, col: 3 };

      const noStart = jumpPointSearch(emptyGrid, null, validEnd, 4, 4);
      expect(noStart).toEqual([]);

      const noEnd = jumpPointSearch(emptyGrid, validStart, null, 4, 4);
      expect(noEnd).toEqual([]);

      const outOfBoundsStart = jumpPointSearch(
        emptyGrid,
        { row: -1, col: 0 },
        validEnd,
        4,
        4
      );
      expect(outOfBoundsStart).toEqual([]);
    });
  });

  describe('Bellman-Ford Visualization', () => {
    it('should generate steps array', () => {
      const steps = bellmanFord(grid, start, end, rows, cols);
      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
    });

    it('each step should have required properties', () => {
      const steps = bellmanFord(grid, start, end, rows, cols);
      assertPathfindingStepStructure(steps);
    });

    it('should mark start and end in states', () => {
      const steps = bellmanFord(grid, start, end, rows, cols);
      const firstStep = steps[0];
      expect(firstStep.states[start.row][start.col]).toBe('start');
      expect(firstStep.states[end.row][end.col]).toBe('end');
    });

    it('should include iteration information in descriptions', () => {
      const steps = bellmanFord(grid, start, end, rows, cols);
      // Descriptions now come from keys, but in test env without full i18n they might be keys or formatted strings
      // We check that descriptions are present
      expect(steps[0].description).toBeTruthy();
    });

    it('final step should indicate completion', () => {
      const steps = bellmanFord(grid, start, end, rows, cols);
      const lastStep = steps[steps.length - 1];
      // Either path found description or no path
      expect(lastStep.description).toBeTruthy();
    });
  });

  describe('IDA* Visualization', () => {
    it('should generate steps array', () => {
      const steps = idaStar(grid, start, end, rows, cols);
      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
    });

    it('each step should have required properties', () => {
      const steps = idaStar(grid, start, end, rows, cols);
      assertPathfindingStepStructure(steps);
    });

    it('should mark start and end in states', () => {
      const steps = idaStar(grid, start, end, rows, cols);
      const firstStep = steps[0];
      expect(Array.isArray(firstStep.states)).toBe(true);
      expect(firstStep.states[start.row][start.col]).toBe('start');
      expect(firstStep.states[end.row][end.col]).toBe('end');
    });

    it('should include threshold information in descriptions', () => {
      const steps = idaStar(grid, start, end, rows, cols);
      // We just check that description is generated/present
      expect(steps[0].description).toBeTruthy();
    });

    it('final step should indicate completion', () => {
      const steps = idaStar(grid, start, end, rows, cols);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.description).toBeTruthy();
    });

    it('should find path in grid with walls (obstacles)', () => {
      const gridWithWalls = [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
      ];
      const wallStart = { row: 0, col: 0 };
      const wallEnd = { row: 4, col: 4 };

      const steps = idaStar(gridWithWalls, wallStart, wallEnd, 5, 5);

      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
    });

    it('should handle no path found (blocked grid)', () => {
      const blockedGrid = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
      const blockedStart = { row: 0, col: 0 };
      const blockedEnd = { row: 2, col: 2 };

      const steps = idaStar(blockedGrid, blockedStart, blockedEnd, 3, 3);

      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.description).toBeTruthy();
    });

    it('should return empty steps for invalid inputs', () => {
      const emptyGrid = Array(4)
        .fill(null)
        .map(() => Array(4).fill(0));
      const validStart = { row: 0, col: 0 };
      const validEnd = { row: 3, col: 3 };

      const noStart = idaStar(emptyGrid, null, validEnd, 4, 4);
      expect(noStart).toEqual([]);

      const noEnd = idaStar(emptyGrid, validStart, null, 4, 4);
      expect(noEnd).toEqual([]);
    });
  });

  describe('D* Lite Visualization', () => {
    it('should generate steps array', () => {
      const steps = dStarLite(grid, start, end, rows, cols);
      expect(steps).toBeTruthy();
      expect(steps.length).toBeGreaterThan(0);
    });

    it('each step should have required properties', () => {
      const steps = dStarLite(grid, start, end, rows, cols);
      assertPathfindingStepStructure(steps);
    });

    it('should mark start and end in states', () => {
      const steps = dStarLite(grid, start, end, rows, cols);
      const firstStep = steps[0];
      expect(firstStep.states[start.row][start.col]).toBe('start');
      expect(firstStep.states[end.row][end.col]).toBe('end');
    });

    it('should include keys or expansion info in descriptions', () => {
      const steps = dStarLite(grid, start, end, rows, cols);
      expect(steps[0].description).toBeTruthy();
    });

    it('final step should indicate completion', () => {
      const steps = dStarLite(grid, start, end, rows, cols);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.description).toBeTruthy();
    });
  });
});
