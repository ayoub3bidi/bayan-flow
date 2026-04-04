/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { depthFirstSearch, depthFirstSearchPure } from './dfs.js';
import { GRAPH_NODE_STATES } from '../../constants/index.js';

const lineGraph = () => {
  const adjacency = {
    0: ['1'],
    1: ['0', '2'],
    2: ['1'],
  };
  const nodes = [
    { id: '0', x: 0, y: 0.5, label: '0' },
    { id: '1', x: 0.5, y: 0.5, label: '1' },
    { id: '2', x: 1, y: 0.5, label: '2' },
  ];
  const edges = [
    { from: '0', to: '1' },
    { from: '1', to: '2' },
  ];
  return { adjacency, rootId: '0', goalId: '2', nodes, edges };
};

describe('depthFirstSearchPure', () => {
  it('returns a path along a line graph', () => {
    const { adjacency, rootId, goalId } = lineGraph();
    expect(depthFirstSearchPure(adjacency, rootId, goalId)).toEqual([
      '0',
      '1',
      '2',
    ]);
  });

  it('returns null when goal is disconnected', () => {
    const adjacency = {
      0: ['1'],
      1: ['0'],
      2: [],
    };
    expect(depthFirstSearchPure(adjacency, '0', '2')).toBeNull();
  });

  it('returns single node when root equals goal', () => {
    expect(depthFirstSearchPure({ 0: [] }, '0', '0')).toEqual(['0']);
  });
});

describe('depthFirstSearch visualization', () => {
  it('produces graph-shaped steps ending with path or no-path description', () => {
    const ctx = lineGraph();
    const steps = depthFirstSearch(ctx);
    expect(steps.length).toBeGreaterThan(2);
    expect(steps[0].nodes).toHaveLength(3);
    expect(steps[0].edges).toHaveLength(2);
    expect(steps[0].nodeStates['0']).toBe(GRAPH_NODE_STATES.ROOT);
    expect(steps[0].nodeStates['2']).toBe(GRAPH_NODE_STATES.GOAL);
    const last = steps[steps.length - 1];
    expect(last.nodeStates['2']).toBe(GRAPH_NODE_STATES.GOAL);
    expect(last.stackOrder).toEqual([]);
  });
});
