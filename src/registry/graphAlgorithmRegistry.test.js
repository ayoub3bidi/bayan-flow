/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it, vi } from 'vitest';
import {
  clampGraphAlgorithmNodeCount,
  createGraphInputForAlgorithm,
  getGraphAlgorithmNodeCountRange,
  getGraphAlgorithmProfile,
  getGraphAlgorithmRepresentation,
  getGraphAlgorithmScenarioOptions,
  GRAPH_ALGORITHM_GROUPS,
  GRAPH_ALGORITHM_KEYS,
  GRAPH_REPRESENTATIONS,
  isGraphScenarioSupported,
} from './graphAlgorithmRegistry.js';

describe('graphAlgorithmRegistry', () => {
  it('exports the graph algorithm keys used by the category', () => {
    expect(GRAPH_ALGORITHM_KEYS).toEqual([
      'topologicalSort',
      'kahnAlgorithm',
      'kruskalAlgorithm',
      'primAlgorithm',
      'tarjanAlgorithm',
      'kosarajuAlgorithm',
      'floydWarshallAlgorithm',
    ]);
    expect(GRAPH_ALGORITHM_GROUPS).toEqual([
      {
        labelKey: 'algorithmGroups.topologicalOrdering',
        algorithms: ['topologicalSort', 'kahnAlgorithm'],
      },
      {
        labelKey: 'algorithmGroups.minimumSpanningTree',
        algorithms: ['kruskalAlgorithm', 'primAlgorithm'],
      },
      {
        labelKey: 'algorithmGroups.stronglyConnectedComponents',
        algorithms: ['tarjanAlgorithm', 'kosarajuAlgorithm'],
      },
      {
        labelKey: 'algorithmGroups.allPairsShortestPath',
        algorithms: ['floydWarshallAlgorithm'],
      },
    ]);
  });

  it('returns the profile and representation for topologicalSort', () => {
    expect(getGraphAlgorithmProfile('topologicalSort')).toMatchObject({
      key: 'topologicalSort',
      representation: GRAPH_REPRESENTATIONS.NODE_LINK,
      directed: true,
      weighted: false,
    });
    expect(getGraphAlgorithmRepresentation('topologicalSort')).toBe(
      GRAPH_REPRESENTATIONS.NODE_LINK
    );
  });

  it('returns the profile and representation for kahnAlgorithm', () => {
    expect(getGraphAlgorithmProfile('kahnAlgorithm')).toMatchObject({
      key: 'kahnAlgorithm',
      representation: GRAPH_REPRESENTATIONS.NODE_LINK,
      directed: true,
      weighted: false,
    });
    expect(getGraphAlgorithmRepresentation('kahnAlgorithm')).toBe(
      GRAPH_REPRESENTATIONS.NODE_LINK
    );
  });

  it('returns the profile and representation for kruskalAlgorithm', () => {
    expect(getGraphAlgorithmProfile('kruskalAlgorithm')).toMatchObject({
      key: 'kruskalAlgorithm',
      representation: GRAPH_REPRESENTATIONS.NODE_LINK,
      directed: false,
      weighted: true,
    });
    expect(getGraphAlgorithmRepresentation('kruskalAlgorithm')).toBe(
      GRAPH_REPRESENTATIONS.NODE_LINK
    );
  });

  it('returns the profile and representation for primAlgorithm', () => {
    expect(getGraphAlgorithmProfile('primAlgorithm')).toMatchObject({
      key: 'primAlgorithm',
      representation: GRAPH_REPRESENTATIONS.NODE_LINK,
      directed: false,
      weighted: true,
    });
    expect(getGraphAlgorithmRepresentation('primAlgorithm')).toBe(
      GRAPH_REPRESENTATIONS.NODE_LINK
    );
  });

  it('returns the profile and representation for tarjanAlgorithm', () => {
    expect(getGraphAlgorithmProfile('tarjanAlgorithm')).toMatchObject({
      key: 'tarjanAlgorithm',
      representation: GRAPH_REPRESENTATIONS.NODE_LINK,
      directed: true,
      weighted: false,
    });
    expect(getGraphAlgorithmRepresentation('tarjanAlgorithm')).toBe(
      GRAPH_REPRESENTATIONS.NODE_LINK
    );
  });

  it('returns the profile and representation for kosarajuAlgorithm', () => {
    expect(getGraphAlgorithmProfile('kosarajuAlgorithm')).toMatchObject({
      key: 'kosarajuAlgorithm',
      representation: GRAPH_REPRESENTATIONS.NODE_LINK,
      directed: true,
      weighted: false,
    });
    expect(getGraphAlgorithmRepresentation('kosarajuAlgorithm')).toBe(
      GRAPH_REPRESENTATIONS.NODE_LINK
    );
  });

  it('returns the profile and representation for floydWarshallAlgorithm', () => {
    expect(getGraphAlgorithmProfile('floydWarshallAlgorithm')).toMatchObject({
      key: 'floydWarshallAlgorithm',
      representation: GRAPH_REPRESENTATIONS.MATRIX,
      directed: true,
      weighted: true,
      nodeCountRange: {
        min: 3,
        max: 6,
        step: 1,
      },
    });
    expect(getGraphAlgorithmRepresentation('floydWarshallAlgorithm')).toBe(
      GRAPH_REPRESENTATIONS.MATRIX
    );
  });

  it('returns algorithm-specific node count ranges', () => {
    expect(getGraphAlgorithmNodeCountRange('topologicalSort')).toEqual({
      min: 3,
      max: 18,
      step: 1,
    });
    expect(getGraphAlgorithmNodeCountRange('floydWarshallAlgorithm')).toEqual({
      min: 3,
      max: 6,
      step: 1,
    });
  });

  it('clamps node counts to the algorithm-supported range', () => {
    expect(clampGraphAlgorithmNodeCount('topologicalSort', 22)).toBe(18);
    expect(clampGraphAlgorithmNodeCount('floydWarshallAlgorithm', 9)).toBe(6);
    expect(clampGraphAlgorithmNodeCount('floydWarshallAlgorithm', 1)).toBe(3);
  });

  it('returns scenario options for topologicalSort', () => {
    expect(getGraphAlgorithmScenarioOptions('topologicalSort')).toEqual([
      { id: 'linearChain', i18nKey: 'graphScenarios.linearChain' },
      { id: 'diamond', i18nKey: 'graphScenarios.diamond' },
      { id: 'wide', i18nKey: 'graphScenarios.wide' },
      { id: 'disconnected', i18nKey: 'graphScenarios.disconnected' },
      { id: 'complex', i18nKey: 'graphScenarios.complex' },
      { id: 'singleNode', i18nKey: 'graphScenarios.singleNode' },
    ]);
    expect(isGraphScenarioSupported('topologicalSort', 'diamond')).toBe(true);
    expect(isGraphScenarioSupported('topologicalSort', 'unknown')).toBe(false);
  });

  it('returns scenario options for kahnAlgorithm including the cycle case', () => {
    expect(getGraphAlgorithmScenarioOptions('kahnAlgorithm')).toEqual([
      { id: 'linearChain', i18nKey: 'graphScenarios.linearChain' },
      { id: 'diamond', i18nKey: 'graphScenarios.diamond' },
      { id: 'wide', i18nKey: 'graphScenarios.wide' },
      { id: 'disconnected', i18nKey: 'graphScenarios.disconnected' },
      { id: 'complex', i18nKey: 'graphScenarios.complex' },
      { id: 'singleNode', i18nKey: 'graphScenarios.singleNode' },
      { id: 'directedCycle', i18nKey: 'graphScenarios.directedCycle' },
    ]);
    expect(isGraphScenarioSupported('kahnAlgorithm', 'directedCycle')).toBe(
      true
    );
  });

  it('returns weighted undirected scenarios for kruskalAlgorithm', () => {
    expect(getGraphAlgorithmScenarioOptions('kruskalAlgorithm')).toEqual([
      { id: 'weightedTriangle', i18nKey: 'graphScenarios.weightedTriangle' },
      { id: 'weightedBridge', i18nKey: 'graphScenarios.weightedBridge' },
      {
        id: 'weightedDisconnected',
        i18nKey: 'graphScenarios.weightedDisconnected',
      },
    ]);
  });

  it('returns connected weighted scenarios for primAlgorithm', () => {
    expect(getGraphAlgorithmScenarioOptions('primAlgorithm')).toEqual([
      { id: 'weightedTriangle', i18nKey: 'graphScenarios.weightedTriangle' },
      { id: 'weightedBridge', i18nKey: 'graphScenarios.weightedBridge' },
    ]);
  });

  it('returns SCC scenarios for tarjanAlgorithm', () => {
    expect(getGraphAlgorithmScenarioOptions('tarjanAlgorithm')).toEqual([
      { id: 'sccCycle', i18nKey: 'graphScenarios.sccCycle' },
      { id: 'multiScc', i18nKey: 'graphScenarios.multiScc' },
      { id: 'selfLoop', i18nKey: 'graphScenarios.selfLoop' },
      { id: 'disconnected', i18nKey: 'graphScenarios.disconnected' },
      { id: 'singleNode', i18nKey: 'graphScenarios.singleNode' },
    ]);
  });

  it('returns SCC scenarios for kosarajuAlgorithm', () => {
    expect(getGraphAlgorithmScenarioOptions('kosarajuAlgorithm')).toEqual([
      { id: 'sccCycle', i18nKey: 'graphScenarios.sccCycle' },
      { id: 'multiScc', i18nKey: 'graphScenarios.multiScc' },
      { id: 'selfLoop', i18nKey: 'graphScenarios.selfLoop' },
      { id: 'disconnected', i18nKey: 'graphScenarios.disconnected' },
      { id: 'singleNode', i18nKey: 'graphScenarios.singleNode' },
    ]);
  });

  it('returns Floyd-Warshall scenarios', () => {
    expect(getGraphAlgorithmScenarioOptions('floydWarshallAlgorithm')).toEqual([
      {
        id: 'weightedDirectedPositive',
        i18nKey: 'graphScenarios.weightedDirectedPositive',
      },
      {
        id: 'weightedDirectedNegative',
        i18nKey: 'graphScenarios.weightedDirectedNegative',
      },
      {
        id: 'weightedDirectedNegativeCycle',
        i18nKey: 'graphScenarios.weightedDirectedNegativeCycle',
      },
      {
        id: 'weightedDirectedSingle',
        i18nKey: 'graphScenarios.weightedDirectedSingle',
      },
    ]);
  });

  it('creates deterministic scenario input when a supported scenario is selected', () => {
    const graph = createGraphInputForAlgorithm('topologicalSort', {
      nodeCount: 99,
      scenarioId: 'diamond',
    });

    expect(graph.nodes).toHaveLength(4);
    expect(graph.edges).toHaveLength(4);
    expect(graph.directed).toBe(true);
    expect(graph.weighted).toBe(false);
  });

  it('falls back to random generation when the scenario is invalid', () => {
    const graph = createGraphInputForAlgorithm('topologicalSort', {
      nodeCount: 5,
      scenarioId: 'unknown',
      rng: vi.fn(() => 0),
    });

    expect(graph.nodes).toHaveLength(5);
    expect(graph.directed).toBe(true);
    expect(graph.weighted).toBe(false);
  });

  it('creates the directed cycle scenario for kahnAlgorithm', () => {
    const graph = createGraphInputForAlgorithm('kahnAlgorithm', {
      nodeCount: 99,
      scenarioId: 'directedCycle',
    });

    expect(graph.nodes).toHaveLength(4);
    expect(graph.edges).toHaveLength(4);
    expect(graph.directed).toBe(true);
    expect(graph.weighted).toBe(false);
  });

  it('creates weighted disconnected input for kruskalAlgorithm', () => {
    const graph = createGraphInputForAlgorithm('kruskalAlgorithm', {
      nodeCount: 99,
      scenarioId: 'weightedDisconnected',
    });

    expect(graph.nodes).toHaveLength(5);
    expect(graph.edges).toHaveLength(4);
    expect(graph.directed).toBe(false);
    expect(graph.weighted).toBe(true);
  });

  it('creates connected weighted input for primAlgorithm', () => {
    const graph = createGraphInputForAlgorithm('primAlgorithm', {
      nodeCount: 99,
      scenarioId: 'weightedTriangle',
    });

    expect(graph.nodes).toHaveLength(3);
    expect(graph.edges).toHaveLength(3);
    expect(graph.directed).toBe(false);
    expect(graph.weighted).toBe(true);
  });

  it('creates multi-SCC input for tarjanAlgorithm', () => {
    const graph = createGraphInputForAlgorithm('tarjanAlgorithm', {
      nodeCount: 99,
      scenarioId: 'multiScc',
    });

    expect(graph.nodes).toHaveLength(5);
    expect(graph.edges).toHaveLength(6);
    expect(graph.directed).toBe(true);
    expect(graph.weighted).toBe(false);
  });

  it('creates self-loop input for kosarajuAlgorithm', () => {
    const graph = createGraphInputForAlgorithm('kosarajuAlgorithm', {
      nodeCount: 99,
      scenarioId: 'selfLoop',
    });

    expect(graph.nodes).toHaveLength(3);
    expect(graph.edges).toHaveLength(3);
    expect(graph.directed).toBe(true);
    expect(graph.weighted).toBe(false);
  });

  it('creates weighted directed input for floydWarshallAlgorithm', () => {
    const graph = createGraphInputForAlgorithm('floydWarshallAlgorithm', {
      nodeCount: 99,
      scenarioId: 'weightedDirectedPositive',
    });

    expect(graph.nodes).toHaveLength(4);
    expect(graph.edges).toHaveLength(5);
    expect(graph.directed).toBe(true);
    expect(graph.weighted).toBe(true);
  });

  it('caps Floyd-Warshall random input to the readable matrix range', () => {
    const graph = createGraphInputForAlgorithm('floydWarshallAlgorithm', {
      nodeCount: 12,
      rng: vi.fn(() => 0),
    });

    expect(graph.nodes).toHaveLength(6);
    expect(graph.directed).toBe(true);
    expect(graph.weighted).toBe(true);
  });
});
