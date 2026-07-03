/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { act, renderWithProviders, screen } from '../test/testUtils';
import { describe, expect, it, vi } from 'vitest';
import GraphAlgorithmMatrixVisualizer from './GraphAlgorithmMatrixVisualizer.jsx';

describe('GraphAlgorithmMatrixVisualizer', () => {
  it('renders matrix badges when graphArtifacts are provided', () => {
    renderWithProviders(
      <GraphAlgorithmMatrixVisualizer
        matrix={{
          rowLabels: ['A'],
          columnLabels: ['A'],
          cells: [['0']],
          cellStates: [['current']],
        }}
        graphArtifacts={{
          badges: [{ id: 'k', text: 'Intermediate: A' }],
        }}
        description=""
        isComplete={false}
        algorithm="floydWarshallAlgorithm"
      />
    );

    expect(screen.getByText('Intermediate: A')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('keeps the completed matrix visible briefly before showing complexity', () => {
    vi.useFakeTimers();

    try {
      renderWithProviders(
        <GraphAlgorithmMatrixVisualizer
          matrix={{
            rowLabels: ['A'],
            columnLabels: ['A'],
            cells: [['0']],
            cellStates: [['default']],
          }}
          graphArtifacts={{ badges: [] }}
          description=""
          isComplete
          algorithm="floydWarshallAlgorithm"
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.queryByText('Complexity Analysis')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('Complexity Analysis')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders larger matrices in a fit-first frame without scroll containers', () => {
    const { getByTestId } = renderWithProviders(
      <GraphAlgorithmMatrixVisualizer
        matrix={{
          rowLabels: ['A', 'B', 'C', 'D', 'E', 'F'],
          columnLabels: ['A', 'B', 'C', 'D', 'E', 'F'],
          cells: [
            ['0', '1', '2', '3', '4', '5'],
            ['1', '0', '2', '3', '4', '5'],
            ['2', '2', '0', '3', '4', '5'],
            ['3', '3', '3', '0', '4', '5'],
            ['4', '4', '4', '4', '0', '5'],
            ['5', '5', '5', '5', '5', '0'],
          ],
          cellStates: Array.from({ length: 6 }, () =>
            Array.from({ length: 6 }, () => 'default')
          ),
        }}
        graphArtifacts={{ badges: [] }}
        description=""
        isComplete={false}
        algorithm="floydWarshallAlgorithm"
      />
    );

    const frame = getByTestId('graph-matrix-frame');

    expect(frame).toHaveAttribute('data-density', 'compact');
    expect(frame.className).toContain('overflow-hidden');
    expect(frame.className).not.toContain('overflow-auto');
  });

  it('shows blurred overlay when anonymous user exceeds complexity view limit', () => {
    vi.useFakeTimers();

    try {
      localStorage.setItem('anon_complexity_views', '2');

      renderWithProviders(
        <GraphAlgorithmMatrixVisualizer
          matrix={{
            rowLabels: ['A'],
            columnLabels: ['A'],
            cells: [['0']],
            cellStates: [['default']],
          }}
          graphArtifacts={{ badges: [] }}
          description=""
          isComplete
          algorithm="floydWarshallAlgorithm"
        />
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const blurOverlay = document.querySelector('.backdrop-blur-md');
      expect(blurOverlay).toBeInTheDocument();
      expect(screen.getByText('Complexity Analysis')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders state-specific matrix cell colors and the description pill', () => {
    const { container } = renderWithProviders(
      <GraphAlgorithmMatrixVisualizer
        matrix={{
          rowLabels: ['A', 'B'],
          columnLabels: ['A', 'B'],
          cells: [
            ['0', '1'],
            ['2', '3'],
          ],
          cellStates: [
            ['current', 'updated'],
            ['considering', 'default'],
          ],
        }}
        graphArtifacts={{ badges: [] }}
        description="algorithmSteps.floydWarshallIntermediate"
        isComplete={false}
        algorithm="floydWarshallAlgorithm"
      />
    );

    const rects = container.querySelectorAll('rect');
    const valueTexts = screen
      .getAllByText(/^[0-3]$/)
      .filter(node => node.tagName.toLowerCase() === 'text');

    expect(rects[0]).toHaveAttribute('fill', '#fed7aa');
    expect(rects[1]).toHaveAttribute('fill', '#bbf7d0');
    expect(rects[2]).toHaveAttribute('fill', '#bfdbfe');
    expect(rects[3]).toHaveAttribute('fill', 'var(--color-bg)');
    expect(valueTexts[0]).toHaveAttribute('fill', '#9a3412');
    expect(valueTexts[1]).toHaveAttribute('fill', '#166534');
    expect(valueTexts[2]).toHaveAttribute('fill', '#1d4ed8');
    expect(
      screen.getByText(/Allow .* intermediate vertex/i)
    ).toBeInTheDocument();
  });
});
