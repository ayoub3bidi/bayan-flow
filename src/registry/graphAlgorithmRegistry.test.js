/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it, vi } from 'vitest';
import {
  createGraphInputForAlgorithm,
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
    expect(GRAPH_ALGORITHM_KEYS).toEqual(['topologicalSort', 'kahnAlgorithm']);
    expect(GRAPH_ALGORITHM_GROUPS).toEqual([
      {
        labelKey: 'algorithmGroups.topologicalOrdering',
        algorithms: ['topologicalSort', 'kahnAlgorithm'],
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
});
