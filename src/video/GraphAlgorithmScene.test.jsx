/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GraphAlgorithmScene from './GraphAlgorithmScene.jsx';

let currentFrame = 0;

vi.mock('remotion', () => ({
  useCurrentFrame: () => currentFrame,
  interpolate: vi.fn(() => 1),
  interpolateColors: vi.fn((_value, _range, colors) => colors[1]),
}));

const baseStep = {
  nodes: [
    { id: '0', label: 'A', x: 0.2, y: 0.5 },
    { id: '1', label: 'B', x: 0.8, y: 0.5 },
  ],
  edges: [{ id: '0<->1', from: '0', to: '1', weight: 11 }],
  weighted: true,
  directed: false,
  graphArtifacts: {
    badges: [{ id: 'frontier', text: 'Frontier edge: A-B(11)' }],
  },
};

describe('GraphAlgorithmScene', () => {
  it('renders weighted edge labels with export-theme-aware contrast styling', () => {
    const { container } = render(
      <GraphAlgorithmScene
        framesPerStep={1}
        exportTheme="dark"
        steps={[baseStep]}
      />
    );

    const weightLabel = screen.getByText('11');
    const badge = container.querySelector('rect');

    expect(weightLabel).toHaveAttribute('fill', '#f9fafb');
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('Frontier edge: A-B(11)')).toBeInTheDocument();
  });

  it('uses the light-theme weight label palette and directed arrowheads', () => {
    const { container } = render(
      <GraphAlgorithmScene
        framesPerStep={1}
        exportTheme="light"
        steps={[
          {
            ...baseStep,
            edges: [{ id: '0->1', from: '0', to: '1', weight: 7 }],
            directed: true,
            edgeStates: { '0->1': 'active' },
          },
        ]}
      />
    );

    const weightLabel = screen.getByText('7');
    const edgeLine = container.querySelector('line');

    expect(weightLabel).toHaveAttribute('fill', '#111827');
    expect(edgeLine).toHaveAttribute(
      'marker-end',
      'url(#video-graph-arrowhead)'
    );
    expect(edgeLine).toHaveAttribute('stroke-width', '0.9');
  });

  it('animates node fills from the previous step state', () => {
    currentFrame = 1;

    const { container } = render(
      <GraphAlgorithmScene
        framesPerStep={1}
        exportTheme="dark"
        steps={[
          {
            ...baseStep,
            nodeStates: { 0: 'default', 1: 'default' },
          },
          {
            ...baseStep,
            nodeStates: { 0: 'current', 1: 'path' },
          },
        ]}
      />
    );

    const circles = container.querySelectorAll('circle');

    expect(circles[0]).toHaveAttribute('fill', '#f97316');
    expect(circles[1]).toHaveAttribute('fill', '#10b981');
  });

  it('returns nothing when the active step has no nodes', () => {
    const { container } = render(
      <GraphAlgorithmScene
        framesPerStep={1}
        exportTheme="dark"
        steps={[{ nodes: [], edges: [] }]}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
