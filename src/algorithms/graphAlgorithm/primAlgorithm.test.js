/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import { GRAPH_EDGE_STATES } from '../../constants/index.js';
import { primAlgorithm, primAlgorithmPure } from './primAlgorithm.js';

const nodes = [
  { id: '0', label: 'A', x: 0.14, y: 0.26 },
  { id: '1', label: 'B', x: 0.42, y: 0.12 },
  { id: '2', label: 'C', x: 0.42, y: 0.52 },
  { id: '3', label: 'D', x: 0.72, y: 0.3 },
  { id: '4', label: 'E', x: 0.88, y: 0.72 },
];

const edges = [
  { id: '0<->1', from: '0', to: '1', weight: 2 },
  { id: '0<->2', from: '0', to: '2', weight: 3 },
  { id: '1<->2', from: '1', to: '2', weight: 1 },
  { id: '1<->3', from: '1', to: '3', weight: 4 },
  { id: '2<->3', from: '2', to: '3', weight: 5 },
  { id: '2<->4', from: '2', to: '4', weight: 6 },
  { id: '3<->4', from: '3', to: '4', weight: 2 },
];

describe('primAlgorithmPure', () => {
  it('returns an MST with optimal total weight from the smallest start node', () => {
    const result = primAlgorithmPure({ nodes, edges });

    expect(result.startNode).toBe('0');
    expect(result.totalWeight).toBe(9);
    expect(result.mstEdges.map(edge => edge.id)).toEqual([
      '0<->1',
      '1<->2',
      '1<->3',
      '3<->4',
    ]);
  });

  it('handles a single vertex', () => {
    expect(
      primAlgorithmPure({
        nodes: [{ id: '0' }],
        edges: [],
      })
    ).toEqual({
      mstEdges: [],
      totalWeight: 0,
      startNode: '0',
    });
  });
});

describe('primAlgorithm visualization', () => {
  it('marks the chosen tree edges as selected', () => {
    const steps = primAlgorithm({ nodes, edges });
    const last = steps.at(-1);

    expect(steps.length).toBeGreaterThan(1);
    expect(last.weighted).toBe(true);
    expect(last.directed).toBe(false);
    expect(last.edgeStates['0<->1']).toBe(GRAPH_EDGE_STATES.SELECTED);
    expect(last.edgeStates['1<->2']).toBe(GRAPH_EDGE_STATES.SELECTED);
    expect(last.graphArtifacts.badges).toHaveLength(2);
  });
});
