/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen } from '../../test/testUtils';
import { BrowserRouter } from 'react-router-dom';
import AlgorithmTypes from './AlgorithmTypes';
// Mock UI components
vi.mock('../ui/Container', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../ui/Section', () => ({
  default: ({ children, className = '' }) => (
    <section className={className}>{children}</section>
  ),
}));

// Mock icons
vi.mock('lucide-react', () => ({
  ArrowUpDown: () => <svg data-testid="arrow-icon" />,
  BarChart3: () => <svg data-testid="bar-chart-icon" />,
  Grid3x3: () => <svg data-testid="grid-icon" />,
  Route: () => <svg data-testid="route-icon" />,
  Search: () => <svg data-testid="search-icon" />,
  GitBranch: () => <svg data-testid="git-branch-icon" />,
  Network: () => <svg data-testid="network-icon" />,
}));

const renderComponent = () => {
  return renderWithI18n(
    <BrowserRouter>
      <AlgorithmTypes />
    </BrowserRouter>
  );
};

describe('AlgorithmTypes', () => {
  describe('Rendering', () => {
    it('should render section element', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render heading', () => {
      renderComponent();
      expect(screen.getByText(/Explore Algorithm Types/i)).toBeInTheDocument();
    });

    it('should render subheading', () => {
      renderComponent();
      expect(
        screen.getByText(/Dive into different algorithm categories/i)
      ).toBeInTheDocument();
    });

    it('should render sorting mode card', () => {
      renderComponent();
      // Look for the specific h3 title rather than all instances
      expect(
        screen.getByRole('heading', { name: /Sorting Algorithms/i })
      ).toBeInTheDocument();
    });

    it('should render pathfinding mode card', () => {
      renderComponent();
      // Look for the specific h3 title rather than all instances
      expect(
        screen.getByRole('heading', { name: /Pathfinding Algorithms/i })
      ).toBeInTheDocument();
    });

    it('should render searching mode card', () => {
      renderComponent();
      expect(
        screen.getByRole('heading', { name: /Searching Algorithms/i })
      ).toBeInTheDocument();
    });

    it('should render tree traversal mode card', () => {
      renderComponent();
      expect(
        screen.getByRole('heading', { name: /Tree Traversals/i })
      ).toBeInTheDocument();
    });

    it('should render graph algorithms mode card', () => {
      renderComponent();
      expect(
        screen.getByRole('heading', { name: /Graph Algorithms/i })
      ).toBeInTheDocument();
    });

    it('should render category icons', () => {
      renderComponent();
      expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument();
      expect(screen.getByTestId('grid-icon')).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
      expect(screen.getByTestId('git-branch-icon')).toBeInTheDocument();
      expect(screen.getByTestId('network-icon')).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should have four algorithm type cards', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('div[class*="group"]');
      expect(cards.length).toBeGreaterThanOrEqual(4);
    });

    it('should display sorting algorithms list', () => {
      renderComponent();
      expect(
        screen.getByText(/Bubble Sort|Quick Sort|Merge Sort/i)
      ).toBeInTheDocument();
    });

    it('should display pathfinding algorithms list', () => {
      renderComponent();
      expect(
        screen.getByText(/BFS|Dijkstra|A\*|Bellman-Ford/i)
      ).toBeInTheDocument();
    });

    it('should display searching algorithms list', () => {
      renderComponent();
      expect(screen.getByText(/Binary Search/i)).toBeInTheDocument();
      expect(screen.getByText(/Interpolation Search/i)).toBeInTheDocument();
    });

    it('should display tree traversal algorithms list', () => {
      renderComponent();
      expect(screen.getByText(/Inorder Traversal/i)).toBeInTheDocument();
      expect(screen.getByText(/Level-order Traversal/i)).toBeInTheDocument();
    });

    it('should display descriptions for all modes', () => {
      renderComponent();
      expect(screen.getByText(/comparison-based sorting/i)).toBeInTheDocument();
      expect(screen.getByText(/navigate through grids/i)).toBeInTheDocument();
      expect(screen.getByText(/sorted data/i)).toBeInTheDocument();
      expect(screen.getAllByText(/tree traversal/i).length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('should apply section styling', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('relative', 'overflow-hidden');
    });

    it('should apply grid layout', () => {
      const { container } = renderComponent();
      const grid = container.querySelector('div[class*="grid"]');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('should apply glass morphism styling', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll(
        'div[class*="backdrop-blur-xl"]'
      );
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should apply gradient backgrounds', () => {
      const { container } = renderComponent();
      const gradients = container.querySelectorAll(
        'div[class*="bg-linear-to-br"]'
      );
      expect(gradients.length).toBeGreaterThan(0);
    });

    it('should apply hover effects', () => {
      const { container } = renderComponent();
      const hoverElements = container.querySelectorAll(
        'div[class*="hover:shadow-2xl"]'
      );
      expect(hoverElements.length).toBeGreaterThan(0);
    });
  });

  describe('Card Layout', () => {
    it('should have proper card spacing', () => {
      const { container } = renderComponent();
      const grid = container.querySelector('div[class*="gap-8"]');
      expect(grid).toBeInTheDocument();
    });

    it('should have rounded corners on cards', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('div[class*="rounded-2xl"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have shadows on cards', () => {
      const { container } = renderComponent();
      const shadows = container.querySelectorAll('div[class*="shadow-lg"]');
      expect(shadows.length).toBeGreaterThan(0);
    });

    it('should have border styling', () => {
      const { container } = renderComponent();
      const bordered = container.querySelectorAll('div[class*="border"]');
      expect(bordered.length).toBeGreaterThan(0);
    });
  });

  describe('Animation', () => {
    it('should have heading animation container', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should have card animation', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('div[class*="group"]');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });

    it('should have shimmer effect on cards', () => {
      const { container } = renderComponent();
      const shimmers = container.querySelectorAll(
        'div[class*="bg-linear-to-br"]'
      );
      expect(shimmers.length).toBeGreaterThan(0);
    });
  });

  describe('Icon Display', () => {
    it('should display bar chart icon for sorting', () => {
      renderComponent();
      const icons = screen.getAllByTestId('bar-chart-icon');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display grid icon for pathfinding', () => {
      renderComponent();
      const icons = screen.getAllByTestId('grid-icon');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display search icon for searching', () => {
      renderComponent();
      const icons = screen.getAllByTestId('search-icon');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have proper icon styling', () => {
      const { container } = renderComponent();
      const iconContainers = container.querySelectorAll(
        'div[class*="rounded-2xl"][class*="inline-flex"]'
      );
      expect(iconContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Text Hierarchy', () => {
    it('should have proper heading styling', () => {
      const { container } = renderComponent();
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('landing-h2');
    });

    it('should have proper subheading styling', () => {
      const { container } = renderComponent();
      const subheading = container.querySelector('p[class*="landing-body"]');
      expect(subheading).toBeInTheDocument();
    });

    it('should have proper card title styling', () => {
      const { container } = renderComponent();
      const titles = container.querySelectorAll('h3');
      expect(titles.length).toBeGreaterThanOrEqual(3);
    });

    it('should have proper description styling', () => {
      const { container } = renderComponent();
      const descriptions = container.querySelectorAll('p');
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid', () => {
      const { container } = renderComponent();
      const grid = container.querySelector('div[class*="grid"]');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('should render all category cards without four-card special spanning', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll(
        'div.group.relative.h-full.min-h-0.self-stretch'
      );
      expect(cards.length).toBe(5);
      const fourthCard = cards[3];
      expect(fourthCard).not.toHaveClass('lg:col-span-3');
    });

    it('should have centered text on mobile', () => {
      const { container } = renderComponent();
      const centered = container.querySelector('div[class*="text-center"]');
      expect(centered).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      const { container } = renderComponent();
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
    });

    it('should have proper color contrast', () => {
      const { container } = renderComponent();
      const textElements = container.querySelectorAll('[class*="text-text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should render correctly with all content', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should handle long algorithm names', () => {
      renderComponent();
      // Component should still render
      const sortingElements = screen.getAllByText(/Sorting Algorithms/i);
      expect(sortingElements.length).toBeGreaterThan(0);
    });
  });
});
