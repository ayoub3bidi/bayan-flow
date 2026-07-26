/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ComplexityPanel from './ComplexityPanel';
import '../test/setup';

// Mock useMediaQuery — default to desktop (no match)
const mockUseMediaQuery = vi.fn(() => false);
vi.mock('../hooks/useMediaQuery', () => ({
  useMediaQuery: (...args) => mockUseMediaQuery(...args),
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
      name: 'BFS',
      timeComplexity: {
        best: 'O(V + E)',
        average: 'O(V + E)',
        worst: 'O(V + E)',
      },
      spaceComplexity: 'O(V)',
    },
  },
  SEARCHING_COMPLEXITY: {
    binarySearch: {
      name: 'Binary Search',
      timeComplexity: {
        best: 'O(1)',
        average: 'O(log n)',
        worst: 'O(log n)',
      },
      spaceComplexity: 'O(1)',
    },
  },
  TREE_TRAVERSAL_COMPLEXITY: {
    inorderTraversal: {
      name: 'Inorder Traversal',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(h)',
    },
    preorderTraversal: {
      name: 'Preorder Traversal',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n)',
      },
      spaceComplexity: 'O(h)',
    },
  },
  GRAPH_ALGORITHM_COMPLEXITY: {
    topologicalSort: {
      name: 'Topological Sort (DFS)',
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
    'O(n)': n => n,
    'O(log n)': n => Math.log2(n),
  },
}));

describe('ComplexityPanel', () => {
  const mockAlgorithm = 'bubbleSort';

  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false);
  });

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

    it('should render SVG with viewBox for responsive scaling', () => {
      const { container } = render(
        <ComplexityPanel algorithm={mockAlgorithm} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 650 350');
      expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
    });
  });

  describe('Mobile Rendering', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockImplementation(query => {
        if (query === '(max-width: 639px)') return true;
        if (query === '(max-width: 1023px)') return true;
        return false;
      });
    });

    it('should render title on mobile (not hidden)', () => {
      render(<ComplexityPanel algorithm={mockAlgorithm} />);
      const title = screen.getByText('Complexity Analysis');
      expect(title).toBeInTheDocument();
      expect(title.closest('div')).not.toHaveClass('hidden');
    });

    it('should render compact badge layout on small screens', () => {
      const { container } = render(
        <ComplexityPanel algorithm={mockAlgorithm} />
      );
      const badgeContainer = container.querySelector(
        '.flex.flex-row.flex-wrap'
      );
      expect(badgeContainer).toBeInTheDocument();
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

  describe('Touch Tooltip', () => {
    it('should toggle tooltip on point click', () => {
      const { container } = render(
        <ComplexityPanel algorithm={mockAlgorithm} />
      );
      // Animation starts at progress 0 — only the first data point circle is rendered
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThanOrEqual(1);

      // Click the first data point — tooltip should appear
      fireEvent.click(circles[0]);
      const tooltip = screen.getByRole('status');
      expect(tooltip).toBeInTheDocument();

      // Click the same point again — tooltip should dismiss
      fireEvent.click(circles[0]);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should dismiss tooltip when clicking the chart area', () => {
      const { container } = render(
        <ComplexityPanel algorithm={mockAlgorithm} />
      );
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThanOrEqual(1);

      // Show tooltip
      fireEvent.click(circles[0]);
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Click outside (chart wrapper div)
      const chartWrapper = container.querySelector('.relative.w-full');
      fireEvent.click(chartWrapper);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Pathfinding Mode', () => {
    it('should render correctly for pathfinding algorithms', () => {
      render(
        <ComplexityPanel algorithm="bfs" complexityDataset="pathfinding" />
      );
      expect(screen.getByText('Complexity Analysis')).toBeInTheDocument();
      expect(screen.getByText(/BFS|Breadth-First Search/i)).toBeInTheDocument();
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
