/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GraphAlgorithmVideoScene from './GraphAlgorithmVideoScene.jsx';
import { GRAPH_REPRESENTATIONS } from '../registry/graphAlgorithmRegistry.js';

vi.mock('./GraphAlgorithmScene.jsx', () => ({
  default: () => <div data-testid="graph-scene" />,
}));

vi.mock('./GraphAlgorithmMatrixScene.jsx', () => ({
  default: () => <div data-testid="graph-matrix-scene" />,
}));

describe('GraphAlgorithmVideoScene', () => {
  it('routes node-link graph steps to GraphAlgorithmScene', () => {
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

  it('routes matrix graph steps to GraphAlgorithmMatrixScene', () => {
    render(
      <GraphAlgorithmVideoScene
        steps={[{ representation: GRAPH_REPRESENTATIONS.MATRIX }]}
        framesPerStep={1}
        exportTheme="dark"
        algorithmKey="floydWarshallAlgorithm"
      />
    );

    expect(screen.getByTestId('graph-matrix-scene')).toBeInTheDocument();
  });
});
