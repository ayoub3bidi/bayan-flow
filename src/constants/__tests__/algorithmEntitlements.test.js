/**
 * @file Unit tests for algorithmEntitlements.js
 */

import { describe, it, expect } from 'vitest';
import {
  PLAN_TIERS,
  ANONYMOUS_TIER_ALGORITHMS,
  isAlgorithmFreeForAnonymous,
} from '@/constants/algorithmEntitlements';

describe('algorithmEntitlements', () => {
  describe('PLAN_TIERS', () => {
    it('should define all tier constants', () => {
      expect(PLAN_TIERS.ANONYMOUS).toBe('anonymous');
      expect(PLAN_TIERS.FREE).toBe('free');
      expect(PLAN_TIERS.PRO).toBe('pro');
    });
  });

  describe('ANONYMOUS_TIER_ALGORITHMS', () => {
    it('should have exactly 18 algorithms across 5 categories', () => {
      const totalCount = Object.values(ANONYMOUS_TIER_ALGORITHMS).reduce(
        (sum, set) => sum + set.size,
        0
      );
      expect(totalCount).toBe(18);
      expect(Object.keys(ANONYMOUS_TIER_ALGORITHMS)).toHaveLength(5);
    });

    it('should have 4 sorting algorithms', () => {
      const sorting = ANONYMOUS_TIER_ALGORITHMS.sorting;
      expect(sorting.size).toBe(4);
      expect(sorting.has('bubbleSort')).toBe(true);
      expect(sorting.has('selectionSort')).toBe(true);
      expect(sorting.has('insertionSort')).toBe(true);
      expect(sorting.has('mergeSort')).toBe(true);
    });

    it('should have 3 pathfinding algorithms', () => {
      const pathfinding = ANONYMOUS_TIER_ALGORITHMS.pathfinding;
      expect(pathfinding.size).toBe(3);
      expect(pathfinding.has('bfs')).toBe(true);
      expect(pathfinding.has('dijkstra')).toBe(true);
      expect(pathfinding.has('aStar')).toBe(true);
    });

    it('should have 4 searching algorithms', () => {
      const searching = ANONYMOUS_TIER_ALGORITHMS.searching;
      expect(searching.size).toBe(4);
      expect(searching.has('linearSearch')).toBe(true);
      expect(searching.has('binarySearch')).toBe(true);
      expect(searching.has('jumpSearch')).toBe(true);
      expect(searching.has('depthFirstSearch')).toBe(true);
    });

    it('should have 4 tree traversal algorithms', () => {
      const treeTraversal = ANONYMOUS_TIER_ALGORITHMS.treeTraversal;
      expect(treeTraversal.size).toBe(4);
      expect(treeTraversal.has('inorderTraversal')).toBe(true);
      expect(treeTraversal.has('preorderTraversal')).toBe(true);
      expect(treeTraversal.has('postorderTraversal')).toBe(true);
      expect(treeTraversal.has('levelOrderTraversal')).toBe(true);
    });

    it('should have 3 graph algorithms', () => {
      const graphAlgorithm = ANONYMOUS_TIER_ALGORITHMS.graphAlgorithm;
      expect(graphAlgorithm.size).toBe(3);
      expect(graphAlgorithm.has('topologicalSort')).toBe(true);
      expect(graphAlgorithm.has('kahnAlgorithm')).toBe(true);
      expect(graphAlgorithm.has('kruskalAlgorithm')).toBe(true);
    });
  });

  describe('isAlgorithmFreeForAnonymous', () => {
    it('should return true for algorithms in the anonymous tier', () => {
      expect(isAlgorithmFreeForAnonymous('bubbleSort', 'sorting')).toBe(true);
      expect(isAlgorithmFreeForAnonymous('bfs', 'pathfinding')).toBe(true);
      expect(isAlgorithmFreeForAnonymous('linearSearch', 'searching')).toBe(
        true
      );
      expect(
        isAlgorithmFreeForAnonymous('inorderTraversal', 'treeTraversal')
      ).toBe(true);
      expect(
        isAlgorithmFreeForAnonymous('topologicalSort', 'graphAlgorithm')
      ).toBe(true);
    });

    it('should return false for algorithms not in the anonymous tier', () => {
      expect(isAlgorithmFreeForAnonymous('quickSort', 'sorting')).toBe(false);
      expect(isAlgorithmFreeForAnonymous('bellmanFord', 'pathfinding')).toBe(
        false
      );
      expect(
        isAlgorithmFreeForAnonymous('interpolationSearch', 'searching')
      ).toBe(false);
      expect(
        isAlgorithmFreeForAnonymous('morrisTraversal', 'treeTraversal')
      ).toBe(false);
      expect(
        isAlgorithmFreeForAnonymous('primAlgorithm', 'graphAlgorithm')
      ).toBe(false);
    });

    it('should return false for invalid category', () => {
      expect(isAlgorithmFreeForAnonymous('bubbleSort', 'invalidCategory')).toBe(
        false
      );
    });

    it('should return false for empty inputs', () => {
      expect(isAlgorithmFreeForAnonymous('', 'sorting')).toBe(false);
      expect(isAlgorithmFreeForAnonymous('bubbleSort', '')).toBe(false);
    });
  });
});
