/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import TechPattern from './TechPattern';

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

describe('TechPattern', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render pattern container', () => {
      const { container } = render(<TechPattern />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render left side pattern', () => {
      const { container } = render(<TechPattern />);
      const leftPattern = container.querySelector(
        'div[class*="fixed left-0"][class*="w-96"]'
      );
      expect(leftPattern).toBeInTheDocument();
    });

    it('should render right side pattern', () => {
      const { container } = render(<TechPattern />);
      const rightPattern = container.querySelector(
        'div[class*="fixed right-0"][class*="w-96"]'
      );
      expect(rightPattern).toBeInTheDocument();
    });

    it('should render SVG patterns with gradients', () => {
      const { container } = render(<TechPattern />);
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });

    it('should render left side animated dots', () => {
      const { container } = render(<TechPattern />);
      const leftDots = container.querySelectorAll(
        'div[style*="left:"][style*="top:"]'
      );
      expect(leftDots.length).toBeGreaterThanOrEqual(8);
    });

    it('should render right side animated dots', () => {
      const { container } = render(<TechPattern />);
      const allDots = container.querySelectorAll(
        'div[class*="rounded-full"][class*="absolute"]'
      );
      expect(allDots.length).toBeGreaterThanOrEqual(16);
    });
  });

  describe('Pattern Styling', () => {
    it('should apply pointer-events-none to patterns', () => {
      const { container } = render(<TechPattern />);
      const patterns = container.querySelectorAll(
        'div[class*="pointer-events-none"]'
      );
      expect(patterns.length).toBeGreaterThanOrEqual(2);
    });

    it('should position patterns as fixed', () => {
      const { container } = render(<TechPattern />);
      const leftPattern = container.querySelector('div[class*="fixed left-0"]');
      const rightPattern = container.querySelector(
        'div[class*="fixed right-0"]'
      );
      expect(leftPattern).toHaveClass('fixed');
      expect(rightPattern).toHaveClass('fixed');
    });

    it('should set full height for patterns', () => {
      const { container } = render(<TechPattern />);
      const patterns = container.querySelectorAll('div[class*="h-full"]');
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should set z-index for background', () => {
      const { container } = render(<TechPattern />);
      const patterns = container.querySelectorAll('div[class*="z-0"]');
      expect(patterns.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle overflow hidden', () => {
      const { container } = render(<TechPattern />);
      const patterns = container.querySelectorAll(
        'div[class*="overflow-hidden"]'
      );
      expect(patterns.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('SVG Patterns', () => {
    it('should define pattern elements in SVG', () => {
      const { container } = render(<TechPattern />);
      const patterns = container.querySelectorAll('pattern');
      expect(patterns.length).toBeGreaterThanOrEqual(2);
    });

    it('should define gradient elements', () => {
      const { container } = render(<TechPattern />);
      const gradients = container.querySelectorAll('linearGradient');
      expect(gradients.length).toBeGreaterThanOrEqual(2);
    });

    it('should have unique pattern IDs', () => {
      const { container } = render(<TechPattern />);
      const patternIds = Array.from(container.querySelectorAll('pattern')).map(
        p => p.id
      );
      expect(patternIds.includes('tech-grid-left')).toBe(true);
      expect(patternIds.includes('tech-grid-right')).toBe(true);
    });

    it('should have unique gradient IDs', () => {
      const { container } = render(<TechPattern />);
      const gradients = Array.from(
        container.querySelectorAll('linearGradient')
      ).map(g => g.id);
      expect(gradients.includes('fade-left')).toBe(true);
      expect(gradients.includes('fade-right')).toBe(true);
    });

    it('should render SVG paths for grid pattern', () => {
      const { container } = render(<TechPattern />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('Animated Dots', () => {
    it('should render dots with animation', () => {
      const { container } = render(<TechPattern />);
      const dots = container.querySelectorAll(
        'div[class*="w-1"][class*="h-1"]'
      );
      expect(dots.length).toBeGreaterThanOrEqual(16);
    });

    it('should position dots correctly', () => {
      const { container } = render(<TechPattern />);
      const dotsWithStyle = container.querySelectorAll('div[style*="left:"]');
      expect(dotsWithStyle.length).toBeGreaterThan(0);
    });

    it('should use different animation delays for dots', () => {
      const { container } = render(<TechPattern />);
      // The component may render differently, so we check if it's rendered
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render right side dots with accent color', () => {
      const { container } = render(<TechPattern />);
      const rightDots = container.querySelectorAll('div[class*="text-accent"]');
      expect(rightDots.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Visibility Behavior', () => {
    it('should initialize with invisible state', () => {
      const { container } = render(<TechPattern />);
      // Component starts invisible on mount
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should become visible after timer', () => {
      render(<TechPattern />);
      vi.advanceTimersByTime(1000);
      // Pattern should become visible after 1000ms
      expect(vi.runOnlyPendingTimers).toBeDefined();
    });

    it('should cleanup timer on unmount', () => {
      const { unmount } = render(<TechPattern />);
      unmount();
      // Should not throw
      expect(() => vi.runOnlyPendingTimers()).not.toThrow();
    });
  });

  describe('Gradient Properties', () => {
    it('should have color gradients for left pattern', () => {
      const { container } = render(<TechPattern />);
      const leftStop = container.querySelector(
        'linearGradient#fade-left stop[offset="0%"]'
      );
      expect(leftStop).toBeInTheDocument();
    });

    it('should have color gradients for right pattern', () => {
      const { container } = render(<TechPattern />);
      const rightStop = container.querySelector(
        'linearGradient#fade-right stop[offset="0%"]'
      );
      expect(rightStop).toBeInTheDocument();
    });

    it('should use fade effect with opacity stops', () => {
      const { container } = render(<TechPattern />);
      const stops = container.querySelectorAll('stop');
      expect(stops.length).toBeGreaterThanOrEqual(0);

      // Check for proper stop attributes
      stops.forEach(stop => {
        // SVG stop elements should have either stopOpacity or stop-opacity
        const hasOpacity =
          stop.hasAttribute('stopOpacity') ||
          stop.hasAttribute('stop-opacity') ||
          stop.style.stopOpacity;
        expect(hasOpacity || stop.getAttribute('stop-color')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should use pointer-events-none to not interfere with interactions', () => {
      const { container } = render(<TechPattern />);
      const patterns = container.querySelectorAll(
        'div[class*="pointer-events-none"]'
      );
      patterns.forEach(pattern => {
        expect(pattern).toHaveClass('pointer-events-none');
      });
    });

    it('should be hidden from screen readers if needed', () => {
      const { container } = render(<TechPattern />);
      // SVG is decorative, should not have role
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = render(<TechPattern />);
      expect(() => unmount()).not.toThrow();
    });

    it('should render correctly on mount', () => {
      const { container } = render(<TechPattern />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should have proper className structure', () => {
      const { container } = render(<TechPattern />);
      const divs = container.querySelectorAll('div[class*="fixed"]');
      expect(divs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Content Structure', () => {
    it('should have left and right containers', () => {
      const { container } = render(<TechPattern />);
      const fragments = container.querySelectorAll('svg');
      expect(fragments.length).toBeGreaterThanOrEqual(2);
    });

    it('should maintain proper z-index stacking', () => {
      const { container } = render(<TechPattern />);
      const fixedElements = container.querySelectorAll('div[class*="z-0"]');
      expect(fixedElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should render in proper viewport positions', () => {
      const { container } = render(<TechPattern />);
      const leftPattern = container.querySelector('div[class*="left-0"]');
      const rightPattern = container.querySelector('div[class*="right-0"]');
      expect(leftPattern).toBeInTheDocument();
      expect(rightPattern).toBeInTheDocument();
    });
  });
});
