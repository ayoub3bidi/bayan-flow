/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import { GRAPH_REPRESENTATIONS } from '../../registry/graphAlgorithmRegistry.js';
import {
  buildEdgeIdByEndpoints,
  buildFallbackNodes,
  cloneEdges,
  cloneNodes,
  ensureVisibleNodes,
  formatBadgeText,
  labelById,
  makeEdgeId,
  makeNodeLinkStep,
  makeUndirectedEdgeId,
  normalizeAdjacency,
  sortNodeIds,
} from './shared.js';

describe('graph algorithm shared helpers', () => {
  it('sorts and normalizes node ids and adjacency deterministically', () => {
    expect(sortNodeIds(['10', '2', '1'])).toEqual(['1', '2', '10']);
    expect(
      normalizeAdjacency({
        2: ['10', '1', '1'],
        1: ['2'],
      })
    ).toEqual({
      1: ['2'],
      2: ['1', '10'],
      10: [],
    });
  });

  it('builds directed and undirected edge ids and lookup maps', () => {
    expect(makeEdgeId('a', 'b')).toBe('a->b');
    expect(makeUndirectedEdgeId('b', 'a')).toBe('a|b');

    expect(
      buildEdgeIdByEndpoints([{ id: 'edge-1', from: 'a', to: 'b' }], true).get(
        'a->b'
      )
    ).toBe('edge-1');
    expect(
      buildEdgeIdByEndpoints([{ from: 'b', to: 'a' }], false).get('a|b')
    ).toBe('a|b');
  });

  it('clones node and edge arrays without preserving object identity', () => {
    const nodes = [{ id: '0', label: 'A', x: 0.2, y: 0.4 }];
    const edges = [{ id: '0->1', from: '0', to: '1', weight: 3 }];

    expect(cloneNodes(nodes)).toEqual(nodes);
    expect(cloneNodes(nodes)[0]).not.toBe(nodes[0]);
    expect(cloneEdges(edges)).toEqual(edges);
    expect(cloneEdges(edges)[0]).not.toBe(edges[0]);
    expect(labelById(nodes)).toEqual({ 0: 'A' });
  });

  it('falls back to generated visible nodes when none are provided', () => {
    const fallbackNodes = buildFallbackNodes({
      0: ['1'],
      1: [],
      2: ['1'],
    });

    expect(fallbackNodes).toEqual([
      { id: '0', label: '0', x: 0, y: 0.5 },
      { id: '1', label: '1', x: 0.5, y: 0.5 },
      { id: '2', label: '2', x: 1, y: 0.5 },
    ]);
    expect(ensureVisibleNodes([], { 0: ['1'], 1: [] })).toEqual([
      { id: '0', label: '0', x: 0, y: 0.5 },
      { id: '1', label: '1', x: 1, y: 0.5 },
    ]);
  });

  it('formats badge text and builds node-link steps with cloned payloads', () => {
    const nodes = [{ id: '0', label: 'A', x: 0.5, y: 0.5 }];
    const edges = [{ id: '0->1', from: '0', to: '1' }];
    const step = makeNodeLinkStep({
      nodes,
      edges,
      nodeStates: { 0: 'current' },
      edgeStates: { '0->1': 'active' },
      stackOrder: ['0'],
      outputOrder: ['1'],
      description: 'algorithmSteps.topologicalSort.enterNode',
      graphArtifacts: { badges: [{ id: 'frontier', text: 'Stack: A' }] },
      directed: false,
      weighted: true,
      hasCycle: true,
    });

    expect(
      formatBadgeText('visualization.topologicalOrderBadge', ['A', 'B'])
    ).toBe('Topological order: A → B');
    expect(formatBadgeText('visualization.topologicalOrderBadge', [])).toBe(
      'Topological order: ∅'
    );
    expect(step.representation).toBe(GRAPH_REPRESENTATIONS.NODE_LINK);
    expect(step.directed).toBe(false);
    expect(step.weighted).toBe(true);
    expect(step.hasCycle).toBe(true);
    expect(step.nodes[0]).not.toBe(nodes[0]);
    expect(step.edges[0]).not.toBe(edges[0]);
  });
});
