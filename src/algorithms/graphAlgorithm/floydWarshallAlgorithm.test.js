/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import {
  floydWarshallAlgorithm,
  floydWarshallAlgorithmPure,
} from './floydWarshallAlgorithm.js';
import { GRAPH_REPRESENTATIONS } from '../../registry/graphAlgorithmRegistry.js';

const nodes = [
  { id: '0', label: 'A' },
  { id: '1', label: 'B' },
  { id: '2', label: 'C' },
  { id: '3', label: 'D' },
];

describe('floydWarshallAlgorithmPure', () => {
  it('computes all-pairs shortest paths on a positive weighted graph', () => {
    const result = floydWarshallAlgorithmPure({
      nodes,
      edges: [
        { from: '0', to: '1', weight: 3 },
        { from: '0', to: '3', weight: 10 },
        { from: '1', to: '2', weight: 2 },
        { from: '2', to: '3', weight: 1 },
        { from: '3', to: '1', weight: 4 },
      ],
    });

    expect(result.hasNegativeCycle).toBe(false);
    expect(result.ids).toEqual(['0', '1', '2', '3']);
    expect(result.distances).toEqual([
      [0, 3, 5, 6],
      [Infinity, 0, 2, 3],
      [Infinity, 5, 0, 1],
      [Infinity, 4, 6, 0],
    ]);
    expect(result.next[0][3]).toBe(1);
  });

  it('supports negative edges without a negative cycle', () => {
    const result = floydWarshallAlgorithmPure({
      nodes,
      edges: [
        { from: '0', to: '1', weight: 4 },
        { from: '0', to: '2', weight: 11 },
        { from: '1', to: '2', weight: -2 },
        { from: '2', to: '3', weight: 3 },
        { from: '3', to: '1', weight: 6 },
      ],
    });

    expect(result.hasNegativeCycle).toBe(false);
    expect(result.distances[0][2]).toBe(2);
    expect(result.distances[0][3]).toBe(5);
  });

  it('detects negative cycles', () => {
    const result = floydWarshallAlgorithmPure({
      nodes: nodes.slice(0, 3),
      edges: [
        { from: '0', to: '1', weight: 1 },
        { from: '1', to: '2', weight: -4 },
        { from: '2', to: '0', weight: 1 },
      ],
    });

    expect(result.hasNegativeCycle).toBe(true);
    expect(result.distances[0][0]).toBeLessThan(0);
  });
});

describe('floydWarshallAlgorithm visualization', () => {
  it('emits matrix steps with badges and final distances', () => {
    const steps = floydWarshallAlgorithm({
      nodes,
      edges: [
        { from: '0', to: '1', weight: 3 },
        { from: '0', to: '3', weight: 10 },
        { from: '1', to: '2', weight: 2 },
        { from: '2', to: '3', weight: 1 },
        { from: '3', to: '1', weight: 4 },
      ],
    });
    const last = steps.at(-1);
    const updateStep = steps.find(step => step.graphArtifacts.badges.length > 1);

    expect(steps.length).toBeGreaterThan(2);
    expect(last.representation).toBe(GRAPH_REPRESENTATIONS.MATRIX);
    expect(last.matrix.cells[0][3]).toBe('6');
    expect(updateStep.graphArtifacts.badges.length).toBeGreaterThan(1);
  });

  it('ends with a negative-cycle step when the graph is invalid', () => {
    const steps = floydWarshallAlgorithm({
      nodes: nodes.slice(0, 3),
      edges: [
        { from: '0', to: '1', weight: 1 },
        { from: '1', to: '2', weight: -4 },
        { from: '2', to: '0', weight: 1 },
      ],
    });

    expect(steps.at(-1).hasNegativeCycle).toBe(true);
  });
});
