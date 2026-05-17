/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VISUALIZATION_MODES } from '../constants/index.js';
import { useGraphAlgorithmVisualization } from './useGraphAlgorithmVisualization.js';
import { GRAPH_REPRESENTATIONS } from '../registry/graphAlgorithmRegistry.js';

const { soundManager } = vi.hoisted(() => ({
  soundManager: {
    playNodeVisit: vi.fn(),
  },
}));

vi.mock('../utils/soundManager.js', () => ({
  soundManager,
}));

describe('useGraphAlgorithmVisualization', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads topologicalSort steps on mount', async () => {
    const { result } = renderHook(() =>
      useGraphAlgorithmVisualization(
        'topologicalSort',
        1000,
        VISUALIZATION_MODES.MANUAL,
        6
      )
    );

    await waitFor(() => expect(result.current.totalSteps).toBeGreaterThan(0));

    expect(result.current.graphNodes).toHaveLength(6);
    expect(result.current.directed).toBe(true);
    expect(result.current.weighted).toBe(false);
    expect(result.current.representation).toBe(GRAPH_REPRESENTATIONS.NODE_LINK);
    expect(result.current.scenarioOptions).toHaveLength(6);
    expect(result.current.description.length).toBeGreaterThan(0);
  });

  it('regenerates graph structure and resets playback', async () => {
    const { result } = renderHook(() =>
      useGraphAlgorithmVisualization(
        'topologicalSort',
        1000,
        VISUALIZATION_MODES.MANUAL,
        5
      )
    );

    await waitFor(() => expect(result.current.totalSteps).toBeGreaterThan(0));

    act(() => {
      result.current.regenerateGraph();
    });

    await waitFor(() => {
      expect(result.current.graphNodes).toHaveLength(5);
      expect(result.current.currentStep).toBe(0);
      expect(result.current.totalSteps).toBeGreaterThan(0);
    });
  });

  it('loads a deterministic graph scenario when selected', async () => {
    const { result } = renderHook(() =>
      useGraphAlgorithmVisualization(
        'topologicalSort',
        1000,
        VISUALIZATION_MODES.MANUAL,
        9,
        'diamond'
      )
    );

    await waitFor(() => expect(result.current.totalSteps).toBeGreaterThan(0));

    expect(result.current.graphNodes).toHaveLength(4);
    expect(result.current.graphArtifacts.badges).toBeDefined();
  });

  it('loads Kahn steps and supports the directed cycle scenario', async () => {
    const { result } = renderHook(() =>
      useGraphAlgorithmVisualization(
        'kahnAlgorithm',
        1000,
        VISUALIZATION_MODES.MANUAL,
        9,
        'directedCycle'
      )
    );

    await waitFor(() => expect(result.current.totalSteps).toBeGreaterThan(0));

    expect(result.current.graphNodes).toHaveLength(4);
    expect(result.current.directed).toBe(true);
    expect(result.current.weighted).toBe(false);
    expect(result.current.scenarioOptions).toHaveLength(7);
    expect(result.current.description.length).toBeGreaterThan(0);
  });

  it('loads Kruskal steps with weighted undirected graph metadata', async () => {
    const { result } = renderHook(() =>
      useGraphAlgorithmVisualization(
        'kruskalAlgorithm',
        1000,
        VISUALIZATION_MODES.MANUAL,
        9,
        'weightedTriangle'
      )
    );

    await waitFor(() => expect(result.current.totalSteps).toBeGreaterThan(0));

    expect(result.current.graphNodes).toHaveLength(3);
    expect(result.current.directed).toBe(false);
    expect(result.current.weighted).toBe(true);
    expect(result.current.scenarioOptions).toHaveLength(3);
    expect(result.current.description.length).toBeGreaterThan(0);
  });

  it('loads Prim steps with connected weighted graph metadata', async () => {
    const { result } = renderHook(() =>
      useGraphAlgorithmVisualization(
        'primAlgorithm',
        1000,
        VISUALIZATION_MODES.MANUAL,
        9,
        'weightedTriangle'
      )
    );

    await waitFor(() => expect(result.current.totalSteps).toBeGreaterThan(0));

    expect(result.current.graphNodes).toHaveLength(3);
    expect(result.current.directed).toBe(false);
    expect(result.current.weighted).toBe(true);
    expect(result.current.scenarioOptions).toHaveLength(2);
    expect(result.current.description.length).toBeGreaterThan(0);
  });
});
