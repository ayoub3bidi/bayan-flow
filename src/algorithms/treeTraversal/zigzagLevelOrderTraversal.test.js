/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  zigzagLevelOrderTraversal,
  zigzagLevelOrderTraversalPure,
} from './zigzagLevelOrderTraversal.js';
import { TREE_NODE_STATES } from '../../constants/index.js';
import { generateTreeForTraversal } from '../../utils/treeGenerators.js';

describe('zigzagLevelOrderTraversalPure', () => {
  it('returns empty array for empty tree', () => {
    expect(zigzagLevelOrderTraversalPure({}, null)).toEqual([]);
  });

  it('returns single node id for one-node tree', () => {
    const tree = generateTreeForTraversal({ nodeCount: 1, rng: () => 0 });
    expect(zigzagLevelOrderTraversalPure(tree.children, tree.rootId)).toEqual([
      '0',
    ]);
  });

  it('zigzags on a perfect three-level binary tree', () => {
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
    expect(zigzagLevelOrderTraversalPure(children, '0')).toEqual([
      '0',
      '2',
      '1',
      '3',
      '4',
      '5',
      '6',
    ]);
  });

  it('follows BFS layers on a right-skewed chain (single-node levels)', () => {
    /** @type {Record<string, import('../../utils/treeGenerators.js').TreeChildLinks>} */
    const children = {
      0: { left: null, right: '1' },
      1: { left: null, right: '2' },
      2: { left: null, right: null },
    };
    expect(zigzagLevelOrderTraversalPure(children, '0')).toEqual([
      '0',
      '1',
      '2',
    ]);
  });

  it('matches step generator final visit order on random trees', () => {
    const tree = generateTreeForTraversal({
      nodeCount: 12,
      rng: () => 0.31,
    });
    const pure = zigzagLevelOrderTraversalPure(tree.children, tree.rootId);
    const steps = zigzagLevelOrderTraversal(tree);
    const last = steps[steps.length - 1];
    expect(last.visitOrder).toEqual(pure);
  });

  it('does not mutate original children map', () => {
    const children = {
      0: { left: '1', right: '2' },
      1: { left: null, right: null },
      2: { left: null, right: null },
    };
    const snap = JSON.stringify(children);
    zigzagLevelOrderTraversalPure(children, '0');
    expect(JSON.stringify(children)).toBe(snap);
  });
});

describe('zigzagLevelOrderTraversal', () => {
  it('returns one empty-tree step when context is invalid', () => {
    const steps = zigzagLevelOrderTraversal({
      nodes: [],
      edges: [],
      children: {},
      rootId: null,
    });
    expect(steps).toHaveLength(1);
    expect(steps[0].nodes).toEqual([]);
    expect(steps[0].levelScanDirection).toBeUndefined();
  });

  it('produces VISITING and VISITED pairs per node plus start and summary', () => {
    const tree = generateTreeForTraversal({ nodeCount: 3, rng: () => 0 });
    const steps = zigzagLevelOrderTraversal(tree);
    const visitingCount = steps.filter(step =>
      Object.values(step.nodeStates ?? {}).includes(TREE_NODE_STATES.VISITING)
    ).length;
    expect(visitingCount).toBe(tree.nodes.length);
  });

  it('sets levelScanDirection on start and per visiting/visited frame', () => {
    const tree = generateTreeForTraversal({ nodeCount: 3, rng: () => 0 });
    const steps = zigzagLevelOrderTraversal(tree);
    expect(steps[0].levelScanDirection).toBe('ltr');

    const visiting = steps.filter(step =>
      Object.values(step.nodeStates ?? {}).includes(TREE_NODE_STATES.VISITING)
    );
    expect(visiting.length).toBeGreaterThan(0);
    expect(
      visiting.every(
        s => s.levelScanDirection === 'ltr' || s.levelScanDirection === 'rtl'
      )
    ).toBe(true);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.queueOrder).toEqual([]);
    expect(finalStep.levelScanDirection).toBeUndefined();
  });

  it('captures queue snapshots consistent with visitation remainder', () => {
    /** @type {Record<string, import('../../utils/treeGenerators.js').TreeChildLinks>} */
    const children = {
      0: { left: '1', right: '2' },
      1: { left: null, right: null },
      2: { left: null, right: null },
    };
    const nodes = [
      { id: '0', x: 0.5, y: 0, label: '0' },
      { id: '1', x: 0.25, y: 0.5, label: '1' },
      { id: '2', x: 0.75, y: 0.5, label: '2' },
    ];
    const steps = zigzagLevelOrderTraversal({
      nodes,
      edges: [],
      children,
      rootId: '0',
    });

    const visitingSteps = steps.filter(step =>
      Object.values(step.nodeStates ?? {}).includes(TREE_NODE_STATES.VISITING)
    );
    const level1Visiting = visitingSteps.filter(
      s => s.nodeStates['2'] === TREE_NODE_STATES.VISITING
    );
    expect(level1Visiting.length).toBe(1);
    expect(level1Visiting[0].levelScanDirection).toBe('rtl');
    expect(level1Visiting[0].queueOrder).toEqual(['2', '1']);
  });
});
