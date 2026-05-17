/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import { GRAPH_NODE_STATES } from '../../constants/index.js';
import { isValidTopologicalOrder } from './topologicalSort.js';
import { kahnAlgorithm, kahnAlgorithmPure } from './kahnAlgorithm.js';

const nodes = [
  { id: '0', label: 'A', x: 0, y: 0 },
  { id: '1', label: 'B', x: 0.5, y: 0.4 },
  { id: '2', label: 'C', x: 1, y: 0.4 },
  { id: '3', label: 'D', x: 0.5, y: 1 },
];

const edges = [
  { id: '0->1', from: '0', to: '1' },
  { id: '0->2', from: '0', to: '2' },
  { id: '1->3', from: '1', to: '3' },
  { id: '2->3', from: '2', to: '3' },
];

describe('kahnAlgorithmPure', () => {
  it('returns a valid order for a DAG', () => {
    const adjacency = { 0: ['1', '2'], 1: ['3'], 2: ['3'], 3: [] };
    const result = kahnAlgorithmPure(adjacency);

    expect(result.hasCycle).toBe(false);
    expect(result.order).toEqual(['0', '1', '2', '3']);
    expect(isValidTopologicalOrder(result.order, adjacency)).toBe(true);
  });

  it('handles a single vertex', () => {
    expect(kahnAlgorithmPure({ 0: [] })).toEqual({
      order: ['0'],
      hasCycle: false,
    });
  });

  it('handles disconnected DAGs deterministically', () => {
    const adjacency = { 0: ['1'], 1: [], 2: ['3'], 3: [] };
    const result = kahnAlgorithmPure(adjacency);

    expect(result.hasCycle).toBe(false);
    expect(result.order).toEqual(['0', '1', '2', '3']);
    expect(isValidTopologicalOrder(result.order, adjacency)).toBe(true);
  });

  it('detects cycles', () => {
    expect(kahnAlgorithmPure({ 0: ['1'], 1: ['0'] })).toEqual({
      order: [],
      hasCycle: true,
    });
  });
});

describe('kahnAlgorithm visualization', () => {
  it('emits steps ending with a valid topological output order', () => {
    const adjacency = { 0: ['1', '2'], 1: ['3'], 2: ['3'], 3: [] };
    const steps = kahnAlgorithm({ nodes, edges, adjacency });
    const last = steps.at(-1);

    expect(steps.length).toBeGreaterThan(1);
    expect(last.hasCycle).toBe(false);
    expect(last.outputOrder).toEqual(['0', '1', '2', '3']);
    expect(isValidTopologicalOrder(last.outputOrder, adjacency)).toBe(true);
    expect(Object.values(last.nodeStates)).toContain(GRAPH_NODE_STATES.PATH);
  });

  it('emits a cycle step with remaining cyclic vertices highlighted', () => {
    const cycleNodes = nodes.slice(0, 4);
    const cycleEdges = [
      { id: '0->1', from: '0', to: '1' },
      { id: '1->2', from: '1', to: '2' },
      { id: '2->3', from: '2', to: '3' },
      { id: '3->0', from: '3', to: '0' },
    ];

    const steps = kahnAlgorithm({
      nodes: cycleNodes,
      edges: cycleEdges,
      adjacency: { 0: ['1'], 1: ['2'], 2: ['3'], 3: ['0'] },
    });
    const last = steps.at(-1);

    expect(last.hasCycle).toBe(true);
    expect(last.outputOrder).toEqual([]);
    expect(Object.values(last.nodeStates)).toContain(GRAPH_NODE_STATES.CYCLE);
  });
});
