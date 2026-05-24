/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GraphAlgorithmMatrixVisualizer from './GraphAlgorithmMatrixVisualizer.jsx';

describe('GraphAlgorithmMatrixVisualizer', () => {
  it('renders matrix badges when graphArtifacts are provided', () => {
    render(
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
      render(
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
    const { getByTestId } = render(
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
});
