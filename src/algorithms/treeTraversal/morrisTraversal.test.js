/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { morrisTraversal, morrisTraversalPure } from './morrisTraversal.js';
import { inorderTraversalPure } from './inorderTraversal.js';
import { TREE_NODE_STATES } from '../../constants/index.js';
import { generateTreeForTraversal } from '../../utils/treeGenerators.js';

describe('morrisTraversalPure', () => {
  it('returns empty array for empty tree', () => {
    expect(morrisTraversalPure({}, null)).toEqual([]);
  });

  it('returns single node id for one-node tree', () => {
    const tree = generateTreeForTraversal({ nodeCount: 1, rng: () => 0 });
    expect(morrisTraversalPure(tree.children, tree.rootId)).toEqual(['0']);
  });

  it('matches iterative inorder visit order on generated trees', () => {
    const tree = generateTreeForTraversal({
      nodeCount: 9,
      rng: () => 0.37,
    });
    expect(morrisTraversalPure(tree.children, tree.rootId)).toEqual(
      inorderTraversalPure(tree.children, tree.rootId)
    );
  });

  it('handles right-skewed tree', () => {
    const children = {
      0: { left: null, right: '1' },
      1: { left: null, right: '2' },
      2: { left: null, right: null },
    };
    expect(morrisTraversalPure(children, '0')).toEqual(['0', '1', '2']);
  });

  it('does not mutate original children map', () => {
    const children = {
      0: { left: '1', right: null },
      1: { left: null, right: null },
    };
    const snap = JSON.stringify(children);
    morrisTraversalPure(children, '0');
    expect(JSON.stringify(children)).toBe(snap);
  });
});

describe('morrisTraversal', () => {
  it('returns one empty-tree step when context is invalid', () => {
    const steps = morrisTraversal({
      nodes: [],
      edges: [],
      children: {},
      rootId: null,
    });
    expect(steps).toHaveLength(1);
    expect(steps[0].nodes).toEqual([]);
  });

  it('produces VISITING and VISITED pairs per node plus start and summary', () => {
    const tree = generateTreeForTraversal({ nodeCount: 3, rng: () => 0 });
    const steps = morrisTraversal(tree);
    const visitingCount = steps.filter(step =>
      Object.values(step.nodeStates ?? {}).includes(TREE_NODE_STATES.VISITING)
    ).length;
    expect(visitingCount).toBe(tree.nodes.length);
  });

  it('does not mutate input children', () => {
    const tree = generateTreeForTraversal({ nodeCount: 5, rng: () => 0.2 });
    const snap = JSON.stringify(tree.children);
    morrisTraversal(tree);
    expect(JSON.stringify(tree.children)).toBe(snap);
  });

  it('final visit order matches inorder', () => {
    const tree = generateTreeForTraversal({ nodeCount: 7, rng: () => 0.41 });
    const steps = morrisTraversal(tree);
    const expected = inorderTraversalPure(tree.children, tree.rootId);
    expect(steps.at(-1)?.visitOrder).toEqual(expected);
  });
});
