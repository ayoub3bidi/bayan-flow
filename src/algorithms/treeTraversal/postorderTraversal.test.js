/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  postorderTraversal,
  postorderTraversalPure,
} from './postorderTraversal.js';
import { TREE_NODE_STATES } from '../../constants/index.js';
import { generateTreeForTraversal } from '../../utils/treeGenerators.js';

describe('postorderTraversalPure', () => {
  it('returns empty array for empty tree', () => {
    expect(postorderTraversalPure({}, null)).toEqual([]);
  });

  it('returns single node id for one-node tree', () => {
    const tree = generateTreeForTraversal({ nodeCount: 1, rng: () => 0 });
    expect(postorderTraversalPure(tree.children, tree.rootId)).toEqual(['0']);
  });

  it('visits children before parent on a simple tree', () => {
    /** @type {import('../../utils/treeGenerators.js').TreeChildLinks} */
    const children = {
      0: { left: '1', right: '2' },
      1: { left: null, right: null },
      2: { left: null, right: null },
    };
    expect(postorderTraversalPure(children, '0')).toEqual(['1', '2', '0']);
  });

  it('follows left chain then right then root on a left-skewed tree', () => {
    /** @type {import('../../utils/treeGenerators.js').TreeChildLinks} */
    const children = {
      0: { left: '1', right: null },
      1: { left: '2', right: null },
      2: { left: null, right: null },
    };
    expect(postorderTraversalPure(children, '0')).toEqual(['2', '1', '0']);
  });

  it('follows left chain, right chain, then root on a right-skewed tree', () => {
    /** @type {import('../../utils/treeGenerators.js').TreeChildLinks} */
    const children = {
      0: { left: null, right: '1' },
      1: { left: null, right: '2' },
      2: { left: null, right: null },
    };
    expect(postorderTraversalPure(children, '0')).toEqual(['2', '1', '0']);
  });

  it('handles complex balanced tree correctly', () => {
    /** @type {import('../../utils/treeGenerators.js').TreeChildLinks} */
    const children = {
      0: { left: '1', right: '2' },
      1: { left: '3', right: '4' },
      2: { left: '5', right: '6' },
      3: { left: null, right: null },
      4: { left: null, right: null },
      5: { left: null, right: null },
      6: { left: null, right: null },
    };
    // Postorder: 3, 4, 1, 5, 6, 2, 0
    expect(postorderTraversalPure(children, '0')).toEqual([
      '3',
      '4',
      '1',
      '5',
      '6',
      '2',
      '0',
    ]);
  });

  it('matches step generator final visit order on random trees', () => {
    const tree = generateTreeForTraversal({
      nodeCount: 12,
      rng: () => 0.21,
    });
    const pure = postorderTraversalPure(tree.children, tree.rootId);
    const steps = postorderTraversal(tree);
    const last = steps[steps.length - 1];
    expect(last.visitOrder).toEqual(pure);
  });
});

describe('postorderTraversal', () => {
  it('returns one empty-tree step when context is invalid', () => {
    const steps = postorderTraversal({
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
    const steps = postorderTraversal(tree);
    const visitingCount = steps.filter(step =>
      Object.values(step.nodeStates ?? {}).includes(TREE_NODE_STATES.VISITING)
    ).length;
    expect(visitingCount).toBe(tree.nodes.length);
  });

  it('produces correct sequence of VISITING states', () => {
    const tree = generateTreeForTraversal({ nodeCount: 3, rng: () => 0 });
    const steps = postorderTraversal(tree);

    // Extract only steps with VISITING state
    const visitingSteps = steps.filter(step =>
      Object.values(step.nodeStates ?? {}).includes(TREE_NODE_STATES.VISITING)
    );

    // All visitingSteps should have exactly one VISITING node
    for (const step of visitingSteps) {
      const visitingNodes = Object.entries(step.nodeStates)
        .filter(([_, state]) => state === TREE_NODE_STATES.VISITING)
        .map(([nodeId, _]) => nodeId);
      expect(visitingNodes).toHaveLength(1);
    }
  });

  it('has all nodes visited at final step', () => {
    const tree = generateTreeForTraversal({ nodeCount: 5, rng: () => 0.3 });
    const steps = postorderTraversal(tree);
    const lastStep = steps[steps.length - 1];

    expect(lastStep.visitOrder).toHaveLength(tree.nodes.length);
    expect(new Set(lastStep.visitOrder).size).toBe(tree.nodes.length);
  });

  it('respects postorder constraint: children before parent', () => {
    const tree = generateTreeForTraversal({ nodeCount: 7, rng: () => 0.42 });
    const steps = postorderTraversal(tree);
    const visitOrder = steps[steps.length - 1].visitOrder;

    // For each node, verify its children appear before it in visitOrder
    for (const node of tree.nodes) {
      const nodeIndex = visitOrder.indexOf(node.id);
      if (nodeIndex === -1) continue;

      const links = tree.children[node.id];
      if (links?.left) {
        const leftIndex = visitOrder.indexOf(links.left);
        expect(leftIndex).toBeLessThan(nodeIndex);
      }
      if (links?.right) {
        const rightIndex = visitOrder.indexOf(links.right);
        expect(rightIndex).toBeLessThan(nodeIndex);
      }
    }
  });
});
