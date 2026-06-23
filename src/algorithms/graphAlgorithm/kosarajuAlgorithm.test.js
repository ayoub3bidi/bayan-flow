/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import { GRAPH_NODE_STATES } from '../../constants/index.js';
import {
  kosarajuAlgorithm,
  kosarajuAlgorithmPure,
} from './kosarajuAlgorithm.js';

const nodes = [
  { id: '0', label: 'A', x: 0.12, y: 0.25 },
  { id: '1', label: 'B', x: 0.28, y: 0.62 },
  { id: '2', label: 'C', x: 0.45, y: 0.25 },
  { id: '3', label: 'D', x: 0.68, y: 0.25 },
  { id: '4', label: 'E', x: 0.84, y: 0.62 },
];

const edges = [
  { id: '0->1', from: '0', to: '1' },
  { id: '1->2', from: '1', to: '2' },
  { id: '2->0', from: '2', to: '0' },
  { id: '1->3', from: '1', to: '3' },
  { id: '3->4', from: '3', to: '4' },
  { id: '4->3', from: '4', to: '3' },
];

describe('kosarajuAlgorithmPure', () => {
  it('returns deterministic SCCs and finish order', () => {
    const result = kosarajuAlgorithmPure({
      0: ['1'],
      1: ['2', '3'],
      2: ['0'],
      3: ['4'],
      4: ['3'],
    });

    expect(result.finishOrder).toEqual(['2', '4', '3', '1', '0']);
    expect(result.sccs).toEqual([
      ['0', '1', '2'],
      ['3', '4'],
    ]);
    expect(result.transpose).toEqual({
      0: ['2'],
      1: ['0'],
      2: ['1'],
      3: ['1', '4'],
      4: ['3'],
    });
  });

  it('handles self-loops as singleton SCCs', () => {
    const result = kosarajuAlgorithmPure({
      0: ['0', '1'],
      1: ['2'],
      2: [],
    });

    expect(result.sccs).toEqual([['0'], ['1'], ['2']]);
  });
});

describe('kosarajuAlgorithm visualization', () => {
  it('emits transpose-phase steps and completed SCC node states', () => {
    const steps = kosarajuAlgorithm({
      nodes,
      edges,
      adjacency: {
        0: ['1'],
        1: ['2', '3'],
        2: ['0'],
        3: ['4'],
        4: ['3'],
      },
    });
    const last = steps.at(-1);

    expect(steps.length).toBeGreaterThan(5);
    expect(last.graphArtifacts.badges).toHaveLength(4);
    expect(last.description.length).toBeGreaterThan(0);
    expect(Object.values(last.nodeStates)).toContain(GRAPH_NODE_STATES.PATH);
  });
});
