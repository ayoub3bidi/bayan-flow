/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  levelOrderTraversal,
  levelOrderTraversalPure,
} from './levelOrderTraversal.js';
import { TREE_NODE_STATES } from '../../constants/index.js';
import { generateTreeForTraversal } from '../../utils/treeGenerators.js';

describe('levelOrderTraversalPure', () => {
  it('returns empty array for empty tree', () => {
    expect(levelOrderTraversalPure({}, null)).toEqual([]);
  });

  it('returns single node id for one-node tree', () => {
    const tree = generateTreeForTraversal({ nodeCount: 1, rng: () => 0 });
    expect(levelOrderTraversalPure(tree.children, tree.rootId)).toEqual(['0']);
  });

  it('visits nodes level by level on a balanced tree', () => {
    /** @type {Record<string, import('../../utils/treeGenerators.js').TreeChildLinks>} */
    const children = {
      0: { left: '1', right: '2' },
      1: { left: '3', right: '4' },
      2: { left: '5', right: '6' },
      3: { left: null, right: null },
      4: { left: null, right: null },
      5: { left: null, right: null },
      6: { left: null, right: null },
    };
    expect(levelOrderTraversalPure(children, '0')).toEqual([
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
    ]);
  });

  it('follows queue order on a skewed tree', () => {
    /** @type {Record<string, import('../../utils/treeGenerators.js').TreeChildLinks>} */
    const children = {
      0: { left: null, right: '1' },
      1: { left: null, right: '2' },
      2: { left: null, right: null },
    };
    expect(levelOrderTraversalPure(children, '0')).toEqual(['0', '1', '2']);
  });

  it('matches step generator final visit order on random trees', () => {
    const tree = generateTreeForTraversal({
      nodeCount: 12,
      rng: () => 0.21,
    });
    const pure = levelOrderTraversalPure(tree.children, tree.rootId);
    const steps = levelOrderTraversal(tree);
    const last = steps[steps.length - 1];
    expect(last.visitOrder).toEqual(pure);
  });
});

describe('levelOrderTraversal', () => {
  it('returns one empty-tree step when context is invalid', () => {
    const steps = levelOrderTraversal({
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
    const steps = levelOrderTraversal(tree);
    const visitingCount = steps.filter(step =>
      Object.values(step.nodeStates ?? {}).includes(TREE_NODE_STATES.VISITING)
    ).length;
    expect(visitingCount).toBe(tree.nodes.length);
  });

  it('captures queue state before and after each visit', () => {
    const tree = generateTreeForTraversal({ nodeCount: 3, rng: () => 0 });
    const steps = levelOrderTraversal(tree);

    expect(steps[0].queueOrder).toEqual([tree.rootId]);

    const visitingSteps = steps.filter(step =>
      Object.values(step.nodeStates ?? {}).includes(TREE_NODE_STATES.VISITING)
    );
    expect(visitingSteps[0].queueOrder?.[0]).toBe(tree.rootId);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.queueOrder).toEqual([]);
  });

  it('visits a parent before either child in the final order', () => {
    const tree = generateTreeForTraversal({ nodeCount: 9, rng: () => 0.42 });
    const steps = levelOrderTraversal(tree);
    const visitOrder = steps[steps.length - 1].visitOrder;

    for (const node of tree.nodes) {
      const nodeIndex = visitOrder.indexOf(node.id);
      const links = tree.children[node.id];
      if (links?.left) {
        expect(nodeIndex).toBeLessThan(visitOrder.indexOf(links.left));
      }
      if (links?.right) {
        expect(nodeIndex).toBeLessThan(visitOrder.indexOf(links.right));
      }
    }
  });
});
