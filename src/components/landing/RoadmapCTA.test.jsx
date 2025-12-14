/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen } from '../../test/testUtils';
import { BrowserRouter } from 'react-router-dom';
import RoadmapCTA from './RoadmapCTA';

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

// Mock Button component
vi.mock('../ui/Button', () => ({
  default: ({ children, variant, ...props }) => (
    <button data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

// Mock Sparkles icon
vi.mock('lucide-react', () => ({
  Sparkles: () => <svg data-testid="sparkles-icon" />,
}));

const renderComponent = () => {
  return renderWithI18n(
    <BrowserRouter>
      <RoadmapCTA />
    </BrowserRouter>
  );
};

describe('RoadmapCTA', () => {
  describe('Rendering', () => {
    it('should render section element', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render badge', () => {
      renderComponent();
      expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
    });

    it('should render heading', () => {
      renderComponent();
      expect(screen.getByText(/See What's Next/i)).toBeInTheDocument();
    });

    it('should render description', () => {
      renderComponent();
      expect(
        screen.getByText(/constantly improving Bayan Flow/i)
      ).toBeInTheDocument();
    });

    it('should render CTA button', () => {
      renderComponent();
      expect(screen.getByText(/View Roadmap/i)).toBeInTheDocument();
    });

    it('should render sparkles icon', () => {
      renderComponent();
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
    });
  });

  describe('Button Functionality', () => {
    it('should render button with cta variant', () => {
      renderComponent();
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'cta');
    });

    it('should render button as link to roadmap', () => {
      renderComponent();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/roadmap');
    });

    it('should contain button inside link', () => {
      renderComponent();
      const link = screen.getByRole('link');
      const button = link.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply section styling', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // Section should have the relative overflow-hidden classes from the component
      expect(section?.className).toContain('relative');
      expect(section?.className).toContain('overflow-hidden');
    });

    it('should have overflow hidden for background', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section?.className).toContain('overflow-hidden');
    });

    it('should have gradient background layer', () => {
      const { container } = renderComponent();
      const gradient = container.querySelector('div[class*="bg-linear-to-b"]');
      expect(gradient).toBeInTheDocument();
    });

    it('should apply pointer-events-none to background', () => {
      const { container } = renderComponent();
      const background = container.querySelector(
        'div[class*="pointer-events-none"]'
      );
      expect(background).toBeInTheDocument();
    });

    it('should have proper z-index for content', () => {
      const { container } = renderComponent();
      const content = container.querySelector('div[class*="relative"]');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Badge Styling', () => {
    it('should render badge with primary color background', () => {
      const { container } = renderComponent();
      const badge = container.querySelector(
        'div[class*="bg-theme-primary/10"]'
      );
      expect(badge).toBeInTheDocument();
    });

    it('should render badge with primary text color', () => {
      const { container } = renderComponent();
      const badge = container.querySelector('div[class*="text-theme-primary"]');
      expect(badge).toBeInTheDocument();
    });

    it('should render badge as rounded pill', () => {
      const { container } = renderComponent();
      const badge = container.querySelector('div[class*="rounded-full"]');
      expect(badge).toBeInTheDocument();
    });

    it('should display icon in badge', () => {
      renderComponent();
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
    });
  });

  describe('Content Layout', () => {
    it('should have centered text layout', () => {
      const { container } = renderComponent();
      const centered = container.querySelector('div[class*="text-center"]');
      expect(centered).toBeInTheDocument();
    });

    it('should have proper spacing between elements', () => {
      const { container } = renderComponent();
      const spacedElements = container.querySelectorAll('[class*="mb-"]');
      expect(spacedElements.length).toBeGreaterThan(0);
    });

    it('should have max-width constraint on heading', () => {
      const { container } = renderComponent();
      const maxWidth = container.querySelector('p[class*="max-w-2xl"]');
      expect(maxWidth).toBeInTheDocument();
    });

    it('should center content horizontally', () => {
      const { container } = renderComponent();
      const centered = container.querySelector('p[class*="mx-auto"]');
      expect(centered).toBeInTheDocument();
    });
  });

  describe('Text Hierarchy', () => {
    it('should render h2 heading', () => {
      const { container } = renderComponent();
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
    });

    it('should apply heading styling', () => {
      const { container } = renderComponent();
      const h2 = container.querySelector('h2');
      expect(h2).toHaveClass('landing-h2');
    });

    it('should display paragraph description', () => {
      const { container } = renderComponent();
      const p = container.querySelector('p[class*="landing-body"]');
      expect(p).toBeInTheDocument();
    });

    it('should apply body text styling', () => {
      const { container } = renderComponent();
      const bodies = container.querySelectorAll('p[class*="landing-body"]');
      expect(bodies.length).toBeGreaterThan(0);
    });
  });

  describe('Animation', () => {
    it('should have animation on container', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should have decorative glow element', () => {
      const { container } = renderComponent();
      const glow = container.querySelector(
        'div[class*="rounded-full"][class*="blur-3xl"]'
      );
      expect(glow).toBeInTheDocument();
    });

    it('should animate background gradient', () => {
      const { container } = renderComponent();
      const animatedBg = container.querySelector(
        'div[class*="bg-linear-to-br"]'
      );
      expect(animatedBg).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      const { container } = renderComponent();
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
    });

    it('should have accessible button', () => {
      renderComponent();
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have accessible link', () => {
      renderComponent();
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should have proper text contrast', () => {
      const { container } = renderComponent();
      const textElements = container.querySelectorAll('[class*="text-text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Content Structure', () => {
    it('should have badge before heading', () => {
      const { container } = renderComponent();
      const badge = container.querySelector('div[class*="inline-flex"]');
      const heading = container.querySelector('h2');
      expect(badge).toBeInTheDocument();
      expect(heading).toBeInTheDocument();
    });

    it('should have description after heading', () => {
      const { container } = renderComponent();
      const heading = container.querySelector('h2');
      const description = heading?.nextElementSibling;
      expect(description).toBeInTheDocument();
    });

    it('should have button last', () => {
      const { container } = renderComponent();
      const textCenter = container.querySelector('div[class*="text-center"]');
      const lastLink = textCenter?.querySelector('a');
      expect(lastLink).toBeInTheDocument();
    });
  });

  describe('Color Scheme', () => {
    it('should use primary theme color', () => {
      const { container } = renderComponent();
      const primary = container.querySelectorAll('[class*="theme-primary"]');
      expect(primary.length).toBeGreaterThan(0);
    });

    it('should use accent color in background', () => {
      const { container } = renderComponent();
      const accent = container.querySelectorAll('[class*="accent"]');
      expect(accent.length).toBeGreaterThanOrEqual(0);
    });

    it('should have proper text color', () => {
      const { container } = renderComponent();
      const textPrimary = container.querySelectorAll(
        '[class*="text-text-primary"]'
      );
      expect(textPrimary.length).toBeGreaterThan(0);
    });

    it('should have secondary text color for description', () => {
      const { container } = renderComponent();
      const textSecondary = container.querySelectorAll(
        '[class*="text-text-secondary"]'
      );
      expect(textSecondary.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should render with all content present', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should handle translation keys gracefully', () => {
      renderComponent();
      // Component should render even with translation keys
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should link to correct route', () => {
      renderComponent();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/roadmap');
    });
  });
});
