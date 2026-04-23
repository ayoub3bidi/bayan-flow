/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  preorderTraversal,
  preorderTraversalPure,
} from './preorderTraversal.js';
import { TREE_NODE_STATES } from '../../constants/index.js';
import { generateTreeForTraversal } from '../../utils/treeGenerators.js';

describe('preorderTraversalPure', () => {
  it('returns empty array for empty tree', () => {
    expect(preorderTraversalPure({}, null)).toEqual([]);
  });

  it('returns single node id for one-node tree', () => {
    const tree = generateTreeForTraversal({ nodeCount: 1, rng: () => 0 });
    expect(preorderTraversalPure(tree.children, tree.rootId)).toEqual(['0']);
  });

  it('visits root then left then right on a small binary tree', () => {
    /** @type {import('../../utils/treeGenerators.js').TreeChildLinks} */
    const children = {
      0: { left: '1', right: '2' },
      1: { left: null, right: null },
      2: { left: null, right: null },
    };
    expect(preorderTraversalPure(children, '0')).toEqual(['0', '1', '2']);
  });

  it('follows left chain first on a left-skewed tree', () => {
    /** @type {import('../../utils/treeGenerators.js').TreeChildLinks} */
    const children = {
      0: { left: '1', right: null },
      1: { left: '2', right: null },
      2: { left: null, right: null },
    };
    expect(preorderTraversalPure(children, '0')).toEqual(['0', '1', '2']);
  });

  it('matches step generator final visit order on random trees', () => {
    const tree = generateTreeForTraversal({
      nodeCount: 12,
      rng: () => 0.21,
    });
    const pure = preorderTraversalPure(tree.children, tree.rootId);
    const steps = preorderTraversal(tree);
    const last = steps[steps.length - 1];
    expect(last.visitOrder).toEqual(pure);
  });
});

describe('preorderTraversal', () => {
  it('returns one empty-tree step when context is invalid', () => {
    const steps = preorderTraversal({
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
    const steps = preorderTraversal(tree);
    const visitingCount = steps.filter(step =>
      Object.values(step.nodeStates ?? {}).includes(TREE_NODE_STATES.VISITING)
    ).length;
    expect(visitingCount).toBe(tree.nodes.length);
  });
});
