/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  inorderTraversal,
  inorderTraversalPure,
} from './inorderTraversal.js';
import { TREE_NODE_STATES } from '../../constants/index.js';
import { generateTreeForTraversal } from '../../utils/treeGenerators.js';

describe('inorderTraversalPure', () => {
  it('returns empty array for empty tree', () => {
    expect(inorderTraversalPure({}, null)).toEqual([]);
  });

  it('returns single node id for one-node tree', () => {
    const tree = generateTreeForTraversal({ nodeCount: 1, rng: () => 0 });
    expect(inorderTraversalPure(tree.children, tree.rootId)).toEqual(['0']);
  });

  it('visits nodes in ascending label order (BST inorder)', () => {
    const tree = generateTreeForTraversal({
      nodeCount: 9,
      rng: () => 0.37,
    });
    const order = inorderTraversalPure(tree.children, tree.rootId);
    const sortedIds = [...tree.nodes]
      .sort((a, b) => Number(a.label) - Number(b.label))
      .map(n => n.id);
    expect(order).toEqual(sortedIds);
  });
});

describe('inorderTraversal', () => {
  it('returns one empty-tree step when context is invalid', () => {
    const steps = inorderTraversal({
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
    const steps = inorderTraversal(tree);
    const visitingCount = steps.filter(step =>
      Object.values(step.nodeStates ?? {}).includes(TREE_NODE_STATES.VISITING)
    ).length;
    expect(visitingCount).toBe(tree.nodes.length);
  });
});
