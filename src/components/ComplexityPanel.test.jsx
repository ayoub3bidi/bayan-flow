/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComplexityPanel from './ComplexityPanel';
import '../test/setup';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock constants
vi.mock('../constants', () => ({
  ALGORITHM_COMPLEXITY: {
    bubbleSort: {
      name: 'Bubble Sort',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
      },
      spaceComplexity: 'O(1)',
    },
  },
  PATHFINDING_COMPLEXITY: {
    bfs: {
      name: 'Breadth-First Search',
      timeComplexity: {
        best: 'O(V + E)',
        average: 'O(V + E)',
        worst: 'O(V + E)',
      },
      spaceComplexity: 'O(V)',
    },
  },
  COMPLEXITY_FUNCTIONS: {
    'O(n²)': n => n * n,
    'O(V + E)': n => n + n * 4,
  },
}));

describe('ComplexityPanel', () => {
  const mockAlgorithm = 'bubbleSort';

  describe('Rendering', () => {
    it('should render complexity analysis title', () => {
      render(<ComplexityPanel algorithm={mockAlgorithm} />);
      expect(screen.getByText('Complexity Analysis')).toBeInTheDocument();
    });

    it('should render time complexity section', () => {
      render(<ComplexityPanel algorithm={mockAlgorithm} />);
      expect(screen.getByText('Time Complexity')).toBeInTheDocument();
      expect(screen.getByText('Best:')).toBeInTheDocument();
      expect(screen.getByText('Average:')).toBeInTheDocument();
      expect(screen.getByText('Worst:')).toBeInTheDocument();
    });

    it('should render space complexity section', () => {
      render(<ComplexityPanel algorithm={mockAlgorithm} />);
      expect(screen.getByText('Space Complexity')).toBeInTheDocument();
    });

    it('should render performance graph section', () => {
      render(<ComplexityPanel algorithm={mockAlgorithm} />);
      expect(screen.getByText('Performance Graph')).toBeInTheDocument();
    });

    it('should render scale toggle controls', () => {
      render(<ComplexityPanel algorithm={mockAlgorithm} />);
      expect(screen.getByText('Linear')).toBeInTheDocument();
      expect(screen.getByText('Log')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });
  });

  describe('Scale Toggle', () => {
    it('should toggle between linear and log scale', () => {
      render(<ComplexityPanel algorithm={mockAlgorithm} />);
      const toggleButton = screen.getByRole('switch');

      expect(toggleButton).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Pathfinding Mode', () => {
    it('should render correctly for pathfinding algorithms', () => {
      render(<ComplexityPanel algorithm="bfs" isPathfinding={true} />);
      expect(screen.getByText('Complexity Analysis')).toBeInTheDocument();
      expect(screen.getByText('BFS')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should have dir="auto" attribute for RTL support', () => {
      const { container } = render(
        <ComplexityPanel algorithm={mockAlgorithm} />
      );
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveAttribute('dir', 'auto');
    });

    it('should have RTL-aware positioning classes', () => {
      render(<ComplexityPanel algorithm={mockAlgorithm} />);
      // Check if RTL classes are present in the DOM
      const elements = screen.getAllByText(/Best:|Average:|Worst:/);
      elements.forEach(element => {
        expect(element.className).toContain('rtl:text-right');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ComplexityPanel algorithm={mockAlgorithm} />);
      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveAttribute(
        'aria-label',
        'Toggle logarithmic scale'
      );
    });

    it('should have proper semantic structure', () => {
      render(<ComplexityPanel algorithm={mockAlgorithm} />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });
  });
});
