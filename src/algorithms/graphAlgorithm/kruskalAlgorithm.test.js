/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import { GRAPH_EDGE_STATES } from '../../constants/index.js';
import { kruskalAlgorithm, kruskalAlgorithmPure } from './kruskalAlgorithm.js';

const connectedNodes = [
  { id: '0', label: 'A', x: 0.14, y: 0.26 },
  { id: '1', label: 'B', x: 0.42, y: 0.12 },
  { id: '2', label: 'C', x: 0.42, y: 0.52 },
  { id: '3', label: 'D', x: 0.72, y: 0.3 },
  { id: '4', label: 'E', x: 0.88, y: 0.72 },
];

const connectedEdges = [
  { id: '0<->1', from: '0', to: '1', weight: 2 },
  { id: '0<->2', from: '0', to: '2', weight: 3 },
  { id: '1<->2', from: '1', to: '2', weight: 1 },
  { id: '1<->3', from: '1', to: '3', weight: 4 },
  { id: '2<->3', from: '2', to: '3', weight: 5 },
  { id: '2<->4', from: '2', to: '4', weight: 6 },
  { id: '3<->4', from: '3', to: '4', weight: 2 },
];

describe('kruskalAlgorithmPure', () => {
  it('returns an MST with optimal total weight on connected graphs', () => {
    const result = kruskalAlgorithmPure({
      nodes: connectedNodes,
      edges: connectedEdges,
    });

    expect(result.totalWeight).toBe(9);
    expect(result.mstEdges.map(edge => edge.id)).toEqual([
      '1<->2',
      '0<->1',
      '3<->4',
      '1<->3',
    ]);
    expect(result.componentCount).toBe(1);
  });

  it('returns a minimum spanning forest on disconnected graphs', () => {
    const result = kruskalAlgorithmPure({
      nodes: connectedNodes,
      edges: [
        { id: '0<->1', from: '0', to: '1', weight: 1 },
        { id: '1<->2', from: '1', to: '2', weight: 3 },
        { id: '0<->2', from: '0', to: '2', weight: 4 },
        { id: '3<->4', from: '3', to: '4', weight: 2 },
      ],
    });

    expect(result.totalWeight).toBe(6);
    expect(result.mstEdges).toHaveLength(3);
    expect(result.componentCount).toBe(2);
  });
});

describe('kruskalAlgorithm visualization', () => {
  it('marks accepted edges as selected and rejected edges as cycles', () => {
    const steps = kruskalAlgorithm({
      nodes: connectedNodes,
      edges: connectedEdges,
    });
    const last = steps.at(-1);

    expect(steps.length).toBeGreaterThan(1);
    expect(last.weighted).toBe(true);
    expect(last.directed).toBe(false);
    expect(last.edgeStates['1<->2']).toBe(GRAPH_EDGE_STATES.SELECTED);
    expect(last.edgeStates['0<->2']).toBe(GRAPH_EDGE_STATES.CYCLE);
    expect(last.graphArtifacts.badges).toHaveLength(2);
  });
});
