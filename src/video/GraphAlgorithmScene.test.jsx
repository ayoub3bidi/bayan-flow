/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GraphAlgorithmScene from './GraphAlgorithmScene.jsx';

vi.mock('remotion', () => ({
  useCurrentFrame: () => 0,
  interpolate: vi.fn(() => 1),
  interpolateColors: vi.fn((_value, _range, colors) => colors[1]),
}));

describe('GraphAlgorithmScene', () => {
  it('renders weighted edge labels with export-theme-aware contrast styling', () => {
    const { container } = render(
      <GraphAlgorithmScene
        framesPerStep={1}
        exportTheme="dark"
        steps={[
          {
            nodes: [
              { id: '0', label: 'A', x: 0.2, y: 0.5 },
              { id: '1', label: 'B', x: 0.8, y: 0.5 },
            ],
            edges: [{ id: '0<->1', from: '0', to: '1', weight: 11 }],
            weighted: true,
            directed: false,
          },
        ]}
      />
    );

    const weightLabel = screen.getByText('11');
    const badge = container.querySelector('rect');

    expect(weightLabel).toHaveAttribute('fill', '#f9fafb');
    expect(badge).toBeInTheDocument();
  });
});
