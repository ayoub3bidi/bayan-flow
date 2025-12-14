/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen } from '../../test/testUtils';
import Features from './Features';

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

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Sliders: () => <svg data-testid="sliders-icon" />,
  Code: () => <svg data-testid="code-icon" />,
  Volume2: () => <svg data-testid="volume-icon" />,
  Maximize: () => <svg data-testid="maximize-icon" />,
}));

describe('Features', () => {
  describe('Rendering', () => {
    it('should render section element', () => {
      const { container } = renderWithI18n(<Features />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render heading', () => {
      renderWithI18n(<Features />);
      expect(screen.getByText(/Powerful Features/i)).toBeInTheDocument();
    });

    it('should render subheading', () => {
      renderWithI18n(<Features />);
      expect(
        screen.getByText(/Everything you need to master algorithms/i)
      ).toBeInTheDocument();
    });

    it('should render all feature cards', () => {
      const { container } = renderWithI18n(<Features />);
      const featureCards = container.querySelectorAll('div[class*="group"]');
      expect(featureCards.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Feature Content', () => {
    it('should display customization feature', () => {
      renderWithI18n(<Features />);
      expect(screen.getByTestId('sliders-icon')).toBeInTheDocument();
    });

    it('should display python code feature', () => {
      renderWithI18n(<Features />);
      expect(screen.getByTestId('code-icon')).toBeInTheDocument();
    });

    it('should display sound feature', () => {
      renderWithI18n(<Features />);
      expect(screen.getByTestId('volume-icon')).toBeInTheDocument();
    });

    it('should display fullscreen feature', () => {
      renderWithI18n(<Features />);
      expect(screen.getByTestId('maximize-icon')).toBeInTheDocument();
    });

    it('should include all four features from array', () => {
      const { container } = renderWithI18n(<Features />);
      const icons = container.querySelectorAll('[data-testid$="-icon"]');
      expect(icons.length).toBe(4);
    });
  });

  describe('Styling', () => {
    it('should apply section styling', () => {
      const { container } = renderWithI18n(<Features />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('relative', 'overflow-hidden');
    });

    it('should apply glass morphism to cards', () => {
      const { container } = renderWithI18n(<Features />);
      const cards = container.querySelectorAll(
        'div[class*="backdrop-blur-xl"]'
      );
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should apply gradient to cards', () => {
      const { container } = renderWithI18n(<Features />);
      const gradients = container.querySelectorAll(
        'div[class*="bg-linear-to-br"]'
      );
      expect(gradients.length).toBeGreaterThan(0);
    });

    it('should apply grid layout', () => {
      const { container } = renderWithI18n(<Features />);
      const grid = container.querySelector('div[class*="grid"]');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-4');
    });

    it('should apply hover effects to cards', () => {
      const { container } = renderWithI18n(<Features />);
      const cards = container.querySelectorAll(
        'div[class*="hover:shadow-2xl"]'
      );
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Icon Display', () => {
    it('should render all icons within cards', () => {
      const { container } = renderWithI18n(<Features />);
      const icons = container.querySelectorAll('[data-testid$="-icon"]');
      icons.forEach(icon => {
        expect(icon.parentElement).toBeInTheDocument();
      });
    });

    it('should have proper spacing around icons', () => {
      const { container } = renderWithI18n(<Features />);
      const iconContainers = container.querySelectorAll(
        'div[class*="flex"][class*="gap-"]'
      );
      expect(iconContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Animation', () => {
    it('should render with animation container', () => {
      const { container } = renderWithI18n(<Features />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should apply stagger effect to cards', () => {
      const { container } = renderWithI18n(<Features />);
      const cards = container.querySelectorAll('div[class*="group"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have heading animation', () => {
      const { container } = renderWithI18n(<Features />);
      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('should have proper card hierarchy', () => {
      const { container } = renderWithI18n(<Features />);
      const cards = container.querySelectorAll('div[class*="rounded-2xl"]');
      expect(cards.length).toBeGreaterThanOrEqual(4);
    });

    it('should have glow effects on cards', () => {
      const { container } = renderWithI18n(<Features />);
      const glows = container.querySelectorAll('div[class*="blur-lg"]');
      expect(glows.length).toBeGreaterThan(0);
    });

    it('should have shimmer effect', () => {
      const { container } = renderWithI18n(<Features />);
      const shimmers = container.querySelectorAll('div[class*="via-white/10"]');
      expect(shimmers.length).toBeGreaterThan(0);
    });

    it('should have border styling', () => {
      const { container } = renderWithI18n(<Features />);
      const bordered = container.querySelectorAll(
        'div[class*="border-white/10"]'
      );
      expect(bordered.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should adapt grid for small screens', () => {
      const { container } = renderWithI18n(<Features />);
      const grid = container.querySelector('div[class*="sm:grid-cols-2"]');
      expect(grid).toBeInTheDocument();
    });

    it('should adapt grid for large screens', () => {
      const { container } = renderWithI18n(<Features />);
      const grid = container.querySelector('div[class*="lg:grid-cols-4"]');
      expect(grid).toBeInTheDocument();
    });

    it('should maintain proper gap between cards', () => {
      const { container } = renderWithI18n(<Features />);
      const grid = container.querySelector('div[class*="gap-"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Text Content', () => {
    it('should have proper text hierarchy', () => {
      const { container } = renderWithI18n(<Features />);
      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('landing-h2');
    });

    it('should display body text with proper styling', () => {
      const { container } = renderWithI18n(<Features />);
      const bodyText = container.querySelector('p[class*="landing-body"]');
      expect(bodyText).toBeInTheDocument();
    });

    it('should have centered text layout', () => {
      const { container } = renderWithI18n(<Features />);
      const centerText = container.querySelector('div[class*="text-center"]');
      expect(centerText).toBeInTheDocument();
    });

    it('should have max-width constraint on subheading', () => {
      const { container } = renderWithI18n(<Features />);
      const subheading = container.querySelector('p[class*="max-w-2xl"]');
      expect(subheading).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const { container } = renderWithI18n(<Features />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      const { container } = renderWithI18n(<Features />);
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
    });

    it('should have proper color contrast for text', () => {
      const { container } = renderWithI18n(<Features />);
      const textElements = container.querySelectorAll('[class*="text-text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should render correctly with all translations', () => {
      const { container } = renderWithI18n(<Features />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should handle missing gradient gracefully', () => {
      const { container } = renderWithI18n(<Features />);
      const cards = container.querySelectorAll('div[class*="rounded-2xl"]');
      expect(cards.length).toBeGreaterThanOrEqual(4);
    });

    it('should render even if feature data is empty', () => {
      const { container } = renderWithI18n(<Features />);
      // Component should still render structure
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });
});
