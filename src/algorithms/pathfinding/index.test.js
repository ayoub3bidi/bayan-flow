/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  pathfindingAlgorithms,
  purePathfindingAlgorithms,
  bfs,
  bfsPure,
  dijkstra,
  dijkstraPure,
  aStar,
  aStarPure,
  jumpPointSearch,
  jumpPointSearchPure,
  idaStar,
  idaStarPure,
} from './index.js';

const PATHFINDING_ALGORITHM_KEYS = [
  'bfs',
  'dijkstra',
  'aStar',
  'bidirectionalSearch',
  'greedyBestFirstSearch',
  'jumpPointSearch',
  'bellmanFord',
  'idaStar',
  'dStarLite',
];

describe('pathfinding index', () => {
  describe('pathfindingAlgorithms object', () => {
    it('should export pathfindingAlgorithms object with all 9 algorithms', () => {
      expect(Object.keys(pathfindingAlgorithms)).toHaveLength(9);
      PATHFINDING_ALGORITHM_KEYS.forEach(key => {
        expect(pathfindingAlgorithms[key]).toBeDefined();
        expect(typeof pathfindingAlgorithms[key]).toBe('function');
      });
    });
  });

  describe('purePathfindingAlgorithms object', () => {
    it('should export purePathfindingAlgorithms object with all 9 pure versions', () => {
      expect(Object.keys(purePathfindingAlgorithms)).toHaveLength(9);
      PATHFINDING_ALGORITHM_KEYS.forEach(key => {
        expect(purePathfindingAlgorithms[key]).toBeDefined();
        expect(typeof purePathfindingAlgorithms[key]).toBe('function');
      });
    });
  });

  describe('named exports', () => {
    it('should export algorithm functions', () => {
      expect(typeof bfs).toBe('function');
      expect(typeof bfsPure).toBe('function');
      expect(typeof dijkstra).toBe('function');
      expect(typeof dijkstraPure).toBe('function');
      expect(typeof aStar).toBe('function');
      expect(typeof aStarPure).toBe('function');
      expect(typeof jumpPointSearch).toBe('function');
      expect(typeof jumpPointSearchPure).toBe('function');
      expect(typeof idaStar).toBe('function');
      expect(typeof idaStarPure).toBe('function');
    });

    it('objects should reference same functions as named exports', () => {
      expect(pathfindingAlgorithms.bfs).toBe(bfs);
      expect(purePathfindingAlgorithms.bfs).toBe(bfsPure);
    });
  });
});
