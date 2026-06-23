/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { act } from '@testing-library/react';
import { renderWithI18n, screen } from '../test/testUtils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GraphVisualizer from './GraphVisualizer.jsx';

let isDarkTheme = true;
const swipeHandlers = [];

vi.mock('../hooks/useSwipe', () => ({
  default: args => {
    swipeHandlers.push(args);
    return { 'data-swipe-bound': 'true' };
  },
}));

vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: isDarkTheme,
  }),
}));

vi.mock('./ComplexityPanel', () => ({
  default: () => <div>Complexity Analysis</div>,
}));

vi.mock('./SwipeTutorial', () => ({
  default: ({ show, onDismiss }) =>
    show ? (
      <button
        type="button"
        data-testid="dismiss-tutorial"
        onClick={() => onDismiss?.()}
      >
        dismiss tutorial
      </button>
    ) : null,
}));

vi.mock('./AutoHidingLegend', () => ({
  default: ({ legendItems }) => (
    <div data-testid="legend">
      {legendItems.map(item => (
        <span key={item.label}>{item.label}</span>
      ))}
    </div>
  ),
}));

const baseNodes = [
  { id: '0', label: 'A', x: 0.2, y: 0.5 },
  { id: '1', label: 'B', x: 0.8, y: 0.5 },
];

function renderGraph(props = {}) {
  return renderWithI18n(
    <GraphVisualizer
      nodes={baseNodes}
      edges={[{ id: '0<->1', from: '0', to: '1', weight: 11 }]}
      nodeStates={{}}
      edgeStates={{}}
      description=""
      mode="manual"
      {...props}
    />
  );
}

describe('GraphVisualizer', () => {
  beforeEach(() => {
    isDarkTheme = true;
    swipeHandlers.length = 0;
    localStorage.clear();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders weighted edge labels with dark-mode contrast styling', () => {
    const { container } = renderGraph({
      weighted: true,
      graphVariant: 'graphAlgorithm',
      algorithm: 'kruskalAlgorithm',
      graphArtifacts: {
        badges: [{ id: 'frontier', text: 'Frontier edge: A-B(11)' }],
      },
    });

    const weightLabel = screen.getByText('11');
    const badge = container.querySelector('rect');

    expect(weightLabel).toHaveAttribute('fill', '#f9fafb');
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('Frontier edge: A-B(11)')).toBeInTheDocument();
    expect(screen.getByText('Unvisited')).toBeInTheDocument();
  });

  it('renders weighted edge labels with light-mode contrast styling for directed graphs', () => {
    isDarkTheme = false;

    const { container } = renderGraph({
      edges: [{ id: '0->1', from: '0', to: '1', weight: 7 }],
      weighted: true,
      directed: true,
      activeEdge: { from: '0', to: '1' },
      nodeStates: { 0: 'current', 1: 'path' },
      description: 'algorithmSteps.kahnAlgorithm.enqueueNode',
    });

    const weightLabel = screen.getByText('7');
    const edgeLine = container.querySelector('line');

    expect(weightLabel).toHaveAttribute('fill', '#111827');
    expect(edgeLine).toHaveAttribute('marker-end', 'url(#graph-arrowhead)');
    expect(edgeLine).toHaveAttribute('stroke-width', '0.9');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Root')).toBeInTheDocument();
  });

  it('builds fallback graph badges from stack and output order for graph algorithms', () => {
    renderGraph({
      graphVariant: 'graphAlgorithm',
      algorithm: 'topologicalSort',
      stackOrder: ['0', '1'],
      outputOrder: ['1', '0'],
      graphArtifacts: {},
    });

    expect(screen.getByText('Recursion stack: A → B')).toBeInTheDocument();
    expect(screen.getByText('Topological order: B → A')).toBeInTheDocument();
  });

  it('shows the BFS queue badge for searching graphs', () => {
    renderGraph({
      algorithm: 'breadthFirstSearchGraph',
      graphVariant: 'searching',
      stackOrder: ['A', 'B'],
      weighted: false,
    });

    expect(screen.getByText('Queue front: A')).toBeInTheDocument();
    expect(screen.getByText('Goal')).toBeInTheDocument();
  });

  it('keeps the final graph visible briefly before switching to complexity', () => {
    vi.useFakeTimers();

    try {
      renderGraph({
        weighted: false,
        isComplete: true,
      });

      expect(screen.getByLabelText('Graph with 2 nodes')).toBeInTheDocument();
      expect(screen.queryByText('Complexity Analysis')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('Complexity Analysis')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows the swipe tutorial after scrolling on mobile manual mode', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 375,
    });

    renderGraph({
      weighted: false,
      onStepForward: vi.fn(),
      onStepBackward: vi.fn(),
    });

    expect(screen.queryByText('dismiss tutorial')).not.toBeInTheDocument();

    act(() => {
      window.scrollY = 150;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(screen.getByTestId('dismiss-tutorial')).toBeInTheDocument();
  });

  it('wires swipe handlers only in manual mode', () => {
    const onStepForward = vi.fn();
    const onStepBackward = vi.fn();

    renderGraph({
      mode: 'autoplay',
      onStepForward,
      onStepBackward,
      weighted: false,
    });

    expect(swipeHandlers).toHaveLength(1);
    expect(swipeHandlers[0].onLeft).toBeUndefined();
    expect(swipeHandlers[0].onRight).toBeUndefined();
  });
});
