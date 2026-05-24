/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GraphAlgorithmCategoryVisualizer from './GraphAlgorithmCategoryVisualizer.jsx';
import { GRAPH_REPRESENTATIONS } from '../registry/graphAlgorithmRegistry.js';

vi.mock('./GraphVisualizer', () => ({
  default: ({ algorithm }) => (
    <div data-testid="node-link-visualizer">{algorithm}</div>
  ),
}));

vi.mock('./GraphAlgorithmMatrixVisualizer', () => ({
  default: ({ algorithm }) => (
    <div data-testid="matrix-visualizer">{algorithm}</div>
  ),
}));

describe('GraphAlgorithmCategoryVisualizer', () => {
  const baseProps = {
    algorithm: 'topologicalSort',
    description: '',
    isComplete: false,
    mode: 'manual',
  };

  it('routes node-link graph algorithms to GraphVisualizer', () => {
    render(
      <GraphAlgorithmCategoryVisualizer
        {...baseProps}
        representation={GRAPH_REPRESENTATIONS.NODE_LINK}
      />
    );

    expect(screen.getByTestId('node-link-visualizer')).toBeInTheDocument();
  });

  it('routes matrix graph algorithms to GraphAlgorithmMatrixVisualizer', () => {
    render(
      <GraphAlgorithmCategoryVisualizer
        {...baseProps}
        representation={GRAPH_REPRESENTATIONS.MATRIX}
      />
    );

    expect(screen.getByTestId('matrix-visualizer')).toBeInTheDocument();
  });
});
