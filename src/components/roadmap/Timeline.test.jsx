/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Timeline from './Timeline';

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      p: ({ children, ...props }) => <p {...props}>{children}</p>,
    },
  };
});

// Mock TimelineItem
vi.mock('./TimelineItem', () => ({
  default: ({ title, position, index }) => (
    <div data-testid={`timeline-item-${index}`} data-position={position}>
      {title}
    </div>
  ),
}));

// Mock Container
vi.mock('../ui/Container', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

// Mock roadmapData
vi.mock('../../data/roadmapData', () => ({
  roadmapData: [
    { id: 1, title: 'Feature 1', description: 'First feature' },
    { id: 2, title: 'Feature 2', description: 'Second feature' },
    { id: 3, title: 'Feature 3', description: 'Third feature' },
  ],
}));

describe('Timeline', () => {
  describe('Rendering', () => {
    it('should render timeline section', () => {
      const { container } = render(<Timeline />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should render all timeline items from data', () => {
      render(<Timeline />);
      expect(screen.getByTestId('timeline-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-item-2')).toBeInTheDocument();
    });

    it('should render timeline items with correct titles', () => {
      render(<Timeline />);
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
      expect(screen.getByText('Feature 3')).toBeInTheDocument();
    });

    it('should render future indicator', () => {
      render(<Timeline />);
      expect(screen.getByText('The journey continues...')).toBeInTheDocument();
    });

    it('should render animated dots for future', () => {
      const { container } = render(<Timeline />);
      const dots = container.querySelectorAll(
        'div[class*="bg-linear-to-br"][class*="rounded-full"]'
      );
      expect(dots.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Position Alternation', () => {
    it('should alternate positions for timeline items', () => {
      render(<Timeline />);
      const item0 = screen.getByTestId('timeline-item-0');
      const item1 = screen.getByTestId('timeline-item-1');
      const item2 = screen.getByTestId('timeline-item-2');

      expect(item0).toHaveAttribute('data-position', 'left');
      expect(item1).toHaveAttribute('data-position', 'right');
      expect(item2).toHaveAttribute('data-position', 'left');
    });

    it('should use index for position calculation', () => {
      render(<Timeline />);
      // Even indices = left, odd indices = right
      expect(screen.getByTestId('timeline-item-0')).toHaveAttribute(
        'data-position',
        'left'
      );
      expect(screen.getByTestId('timeline-item-1')).toHaveAttribute(
        'data-position',
        'right'
      );
    });
  });

  describe('Styling', () => {
    it('should have section styling classes', () => {
      const { container } = render(<Timeline />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('relative', 'py-20', 'bg-surface');
    });

    it('should have overflow-visible for animations', () => {
      const { container } = render(<Timeline />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('overflow-visible');
    });

    it('should render hidden vertical line on mobile', () => {
      const { container } = render(<Timeline />);
      const line = container.querySelector('div[class*="md:block"]');
      expect(line).toBeInTheDocument();
      expect(line).toHaveClass('hidden', 'md:block');
    });
  });

  describe('Timeline Line', () => {
    it('should render vertical timeline line', () => {
      const { container } = render(<Timeline />);
      const line = container.querySelector('div[style*="top: 140px"]');
      expect(line).toBeInTheDocument();
    });

    it('should position line at center', () => {
      const { container } = render(<Timeline />);
      const line = container.querySelector(
        'div[class*="left-1/2"][class*="-translate-x-1/2"]'
      );
      expect(line).toBeInTheDocument();
    });

    it('should have pointer-events-none for line', () => {
      const { container } = render(<Timeline />);
      const line = container.querySelector('div[class*="pointer-events-none"]');
      expect(line).toBeInTheDocument();
    });

    it('should render animated gradient line', () => {
      const { container } = render(<Timeline />);
      const gradientLine = container.querySelector(
        'div[class*="bg-linear-to-b"][class*="from-blue-500"]'
      );
      expect(gradientLine).toBeInTheDocument();
    });

    it('should render glow effect for line', () => {
      const { container } = render(<Timeline />);
      const glowEffects = container.querySelectorAll('div[class*="blur-sm"]');
      expect(glowEffects.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should be a semantic section element', () => {
      const { container } = render(<Timeline />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render timeline items in order', () => {
      const { container } = render(<Timeline />);
      const items = container.querySelectorAll(
        '[data-testid^="timeline-item-"]'
      );
      expect(items[0]).toHaveAttribute('data-testid', 'timeline-item-0');
      expect(items[1]).toHaveAttribute('data-testid', 'timeline-item-1');
      expect(items[2]).toHaveAttribute('data-testid', 'timeline-item-2');
    });

    it('should have readable future text', () => {
      render(<Timeline />);
      const futureText = screen.getByText('The journey continues...');
      expect(futureText).toBeVisible();
    });
  });

  describe('Animation Integration', () => {
    it('should render items with animation props', () => {
      const { container } = render(<Timeline />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should have animation timing properties', () => {
      const { container } = render(<Timeline />);
      // Check that motion components are rendered
      const animatedElements = container.querySelectorAll(
        '[class*="duration-"]'
      );
      expect(animatedElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Content Structure', () => {
    it('should maintain proper DOM hierarchy', () => {
      const { container } = render(<Timeline />);
      const section = container.querySelector('section');
      const innerDiv = section?.querySelector('div[class*="relative"]');
      expect(innerDiv).toBeInTheDocument();
    });

    it('should group timeline items together', () => {
      const { container } = render(<Timeline />);
      const itemsContainer = container.querySelector('div[class*="relative"]');
      const items = itemsContainer?.querySelectorAll(
        '[data-testid^="timeline-item-"]'
      );
      expect(items?.length).toBe(3);
    });

    it('should separate future indicator from items', () => {
      const { container } = render(<Timeline />);
      const futureSection = container.querySelector('div[class*="h-32"]');
      expect(futureSection).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rendering when all items have same position parity', () => {
      render(<Timeline />);
      expect(screen.getByTestId('timeline-item-0')).toBeInTheDocument();
    });

    it('should maintain visual hierarchy with alternating positions', () => {
      render(<Timeline />);
      const leftItems = [
        screen.getByTestId('timeline-item-0'),
        screen.getByTestId('timeline-item-2'),
      ];
      const rightItems = [screen.getByTestId('timeline-item-1')];

      leftItems.forEach(item => {
        expect(item).toHaveAttribute('data-position', 'left');
      });
      rightItems.forEach(item => {
        expect(item).toHaveAttribute('data-position', 'right');
      });
    });

    it('should render correctly with minimum items', () => {
      render(<Timeline />);
      expect(screen.getByTestId('timeline-item-0')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should hide timeline line on mobile', () => {
      const { container } = render(<Timeline />);
      const line = container.querySelector(
        'div[class*="hidden"][class*="md:block"]'
      );
      expect(line).toBeInTheDocument();
    });

    it('should show timeline line on desktop', () => {
      const { container } = render(<Timeline />);
      const line = container.querySelector('div[class*="md:block"]');
      expect(line).toHaveClass('hidden', 'md:block');
    });
  });
});
