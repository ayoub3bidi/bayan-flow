/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { renderWithI18n, screen } from '../test/testUtils';
import { describe, expect, it, vi } from 'vitest';
import GraphVisualizer from './GraphVisualizer.jsx';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    circle: ({
      initial: _initial,
      animate: _animate,
      transition: _transition,
      ...props
    }) => <circle {...props} />,
  },
}));

vi.mock('../hooks/useSwipe', () => ({
  default: () => ({}),
}));

vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
  }),
}));

vi.mock('./ComplexityPanel', () => ({
  default: () => <div>Complexity Analysis</div>,
}));

vi.mock('./SwipeTutorial', () => ({
  default: () => null,
}));

vi.mock('./AutoHidingLegend', () => ({
  default: () => null,
}));

describe('GraphVisualizer', () => {
  it('renders weighted edge labels with dark-mode contrast styling', () => {
    const { container } = renderWithI18n(
      <GraphVisualizer
        nodes={[
          { id: '0', label: 'A', x: 0.2, y: 0.5 },
          { id: '1', label: 'B', x: 0.8, y: 0.5 },
        ]}
        edges={[{ id: '0<->1', from: '0', to: '1', weight: 11 }]}
        weighted
        graphVariant="graphAlgorithm"
        algorithm="kruskalAlgorithm"
        description=""
        mode="manual"
      />
    );

    const weightLabel = screen.getByText('11');
    const badge = container.querySelector('rect');

    expect(weightLabel).toHaveAttribute('fill', '#f9fafb');
    expect(badge).toBeInTheDocument();
  });
});
