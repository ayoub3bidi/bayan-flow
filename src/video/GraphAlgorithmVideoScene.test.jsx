/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GraphAlgorithmVideoScene from './GraphAlgorithmVideoScene.jsx';
import { GRAPH_REPRESENTATIONS } from '../registry/graphAlgorithmRegistry.js';

const { graphSceneSpy, graphMatrixSceneSpy } = vi.hoisted(() => ({
  graphSceneSpy: vi.fn(() => <div data-testid="graph-scene" />),
  graphMatrixSceneSpy: vi.fn(() => <div data-testid="graph-matrix-scene" />),
}));

vi.mock('./GraphAlgorithmScene.jsx', () => ({
  default: props => graphSceneSpy(props),
}));

vi.mock('./GraphAlgorithmMatrixScene.jsx', () => ({
  default: props => graphMatrixSceneSpy(props),
}));

describe('GraphAlgorithmVideoScene', () => {
  it('routes node-link graph steps to GraphAlgorithmScene', () => {
    graphSceneSpy.mockClear();
    render(
      <GraphAlgorithmVideoScene
        steps={[{ representation: GRAPH_REPRESENTATIONS.NODE_LINK }]}
        framesPerStep={1}
        exportTheme="dark"
        algorithmKey="topologicalSort"
      />
    );

    expect(screen.getByTestId('graph-scene')).toBeInTheDocument();
  });

  it('routes matrix graph steps to GraphAlgorithmMatrixScene with export theming', () => {
    graphMatrixSceneSpy.mockClear();
    render(
      <GraphAlgorithmVideoScene
        steps={[{ representation: GRAPH_REPRESENTATIONS.MATRIX }]}
        framesPerStep={1}
        exportTheme="light"
        algorithmKey="floydWarshallAlgorithm"
      />
    );

    expect(screen.getByTestId('graph-matrix-scene')).toBeInTheDocument();
    expect(graphMatrixSceneSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        exportTheme: 'light',
        framesPerStep: 1,
      })
    );
  });
});
