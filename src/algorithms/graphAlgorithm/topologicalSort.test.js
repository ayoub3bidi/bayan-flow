/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import { GRAPH_NODE_STATES } from '../../constants/index.js';
import {
  isValidTopologicalOrder,
  topologicalSort,
  topologicalSortPure,
} from './topologicalSort.js';

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

describe('topologicalSortPure', () => {
  it('returns a valid order for a DAG', () => {
    const adjacency = { 0: ['1', '2'], 1: ['3'], 2: ['3'], 3: [] };
    const result = topologicalSortPure(adjacency);

    expect(result.hasCycle).toBe(false);
    expect(isValidTopologicalOrder(result.order, adjacency)).toBe(true);
  });

  it('handles a single vertex', () => {
    expect(topologicalSortPure({ 0: [] })).toEqual({
      order: ['0'],
      hasCycle: false,
    });
  });

  it('handles disconnected DAGs', () => {
    const adjacency = { 0: ['1'], 1: [], 2: ['3'], 3: [] };
    const result = topologicalSortPure(adjacency);

    expect(result.hasCycle).toBe(false);
    expect(isValidTopologicalOrder(result.order, adjacency)).toBe(true);
  });

  it('handles graphs with no edges', () => {
    const adjacency = { 0: [], 1: [], 2: [] };
    const result = topologicalSortPure(adjacency);

    expect(result.hasCycle).toBe(false);
    expect(result.order).toHaveLength(3);
    expect(isValidTopologicalOrder(result.order, adjacency)).toBe(true);
  });

  it('detects cycles', () => {
    expect(topologicalSortPure({ 0: ['1'], 1: ['0'] })).toEqual({
      order: [],
      hasCycle: true,
    });
  });
});

describe('isValidTopologicalOrder', () => {
  it('accepts multiple valid orders', () => {
    const adjacency = { 0: ['2'], 1: ['2'], 2: [] };

    expect(isValidTopologicalOrder(['0', '1', '2'], adjacency)).toBe(true);
    expect(isValidTopologicalOrder(['1', '0', '2'], adjacency)).toBe(true);
  });

  it('rejects invalid orders', () => {
    expect(isValidTopologicalOrder(['2', '0', '1'], { 0: ['2'], 1: [] })).toBe(
      false
    );
  });
});

describe('topologicalSort visualization', () => {
  it('emits steps ending with a valid output order', () => {
    const adjacency = { 0: ['1', '2'], 1: ['3'], 2: ['3'], 3: [] };
    const steps = topologicalSort({ nodes, edges, adjacency });
    const last = steps.at(-1);

    expect(steps.length).toBeGreaterThan(1);
    expect(last.hasCycle).toBe(false);
    expect(isValidTopologicalOrder(last.outputOrder, adjacency)).toBe(true);
    expect(Object.values(last.nodeStates)).toContain(GRAPH_NODE_STATES.PATH);
  });

  it('emits a cycle step and no final order for cyclic graphs', () => {
    const cyclicEdges = [
      { id: '0->1', from: '0', to: '1' },
      { id: '1->0', from: '1', to: '0' },
    ];
    const steps = topologicalSort({
      nodes: nodes.slice(0, 2),
      edges: cyclicEdges,
      adjacency: { 0: ['1'], 1: ['0'] },
    });
    const last = steps.at(-1);

    expect(last.hasCycle).toBe(true);
    expect(last.outputOrder).toEqual([]);
    expect(Object.values(last.nodeStates)).toContain(GRAPH_NODE_STATES.CYCLE);
  });
});
