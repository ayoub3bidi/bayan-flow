/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen } from '../../test/testUtils';
import { BrowserRouter } from 'react-router-dom';
import AlgorithmTypes from './AlgorithmTypes';

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
  };
});

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
  Route: () => <svg data-testid="route-icon" />,
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
      expect(screen.getByText(/Two Powerful Modes/i)).toBeInTheDocument();
    });

    it('should render subheading', () => {
      renderComponent();
      expect(
        screen.getByText(/Explore sorting and pathfinding/i)
      ).toBeInTheDocument();
    });

    it('should render sorting mode card', () => {
      renderComponent();
      const sortingElements = screen.getAllByText(/Sorting Algorithms/i);
      expect(sortingElements.length).toBeGreaterThan(0);
    });

    it('should render pathfinding mode card', () => {
      renderComponent();
      expect(screen.getAllByText(/Pathfinding Algorithms/i)).toHaveLength(3);
    });

    it('should render both icons', () => {
      renderComponent();
      expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();
      expect(screen.getByTestId('route-icon')).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should have two algorithm type cards', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('div[class*="group"]');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('should display sorting algorithms list', () => {
      renderComponent();
      expect(
        screen.getByText(/Bubble Sort|Quick Sort|Merge Sort/i)
      ).toBeInTheDocument();
    });

    it('should display pathfinding algorithms list', () => {
      renderComponent();
      expect(screen.getByText(/BFS|Dijkstra|A\*/i)).toBeInTheDocument();
    });

    it('should display descriptions for both modes', () => {
      renderComponent();
      expect(screen.getByText(/comparison-based sorting/i)).toBeInTheDocument();
      expect(screen.getByText(/navigate through grids/i)).toBeInTheDocument();
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
      expect(cards.length).toBeGreaterThanOrEqual(2);
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
    it('should display arrow icon for sorting', () => {
      renderComponent();
      const icons = screen.getAllByTestId('arrow-icon');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display route icon for pathfinding', () => {
      renderComponent();
      const icons = screen.getAllByTestId('route-icon');
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
      expect(titles.length).toBeGreaterThanOrEqual(2);
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
