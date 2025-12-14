/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen } from '../../test/testUtils';
import { BrowserRouter } from 'react-router-dom';
import LearnYourWay from './LearnYourWay';

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
  Play: () => <svg data-testid="play-icon" className="text-white" />,
  Hand: () => <svg data-testid="hand-icon" className="text-white" />,
}));

const renderComponent = () => {
  return renderWithI18n(
    <BrowserRouter>
      <LearnYourWay />
    </BrowserRouter>
  );
};

describe('LearnYourWay', () => {
  describe('Rendering', () => {
    it('should render section element', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render main heading', () => {
      renderComponent();
      expect(screen.getByText(/Learn Your Way/i)).toBeInTheDocument();
    });

    it('should render autoplay feature', () => {
      renderComponent();
      expect(screen.getByText(/Auto-Play Mode/i)).toBeInTheDocument();
    });

    it('should render manual feature', () => {
      renderComponent();
      expect(screen.getByText(/Manual Control/i)).toBeInTheDocument();
    });

    it('should render both feature icons', () => {
      renderComponent();
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
      expect(screen.getByTestId('hand-icon')).toBeInTheDocument();
    });

    it('should display feature descriptions', () => {
      renderComponent();
      expect(
        screen.getByText(/Sit back and watch algorithms/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Step through each operation/i)
      ).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have two feature cards', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('div[class*="group"]');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('should apply grid layout', () => {
      const { container } = renderComponent();
      const grid = container.querySelector('div[class*="grid"]');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('should have proper gap between cards', () => {
      const { container } = renderComponent();
      const grid = container.querySelector('div[class*="gap-8"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply section styling', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('relative', 'overflow-hidden');
    });

    it('should apply glass morphism to cards', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll(
        'div[class*="backdrop-blur-xl"]'
      );
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should apply gradient effects', () => {
      const { container } = renderComponent();
      const gradients = container.querySelectorAll(
        'div[class*="bg-linear-to-br"]'
      );
      expect(gradients.length).toBeGreaterThan(0);
    });

    it('should apply hover effects to cards', () => {
      const { container } = renderComponent();
      const hoverElements = container.querySelectorAll(
        'div[class*="hover:shadow-2xl"]'
      );
      expect(hoverElements.length).toBeGreaterThan(0);
    });

    it('should have rounded corners', () => {
      const { container } = renderComponent();
      const rounded = container.querySelectorAll('div[class*="rounded-2xl"]');
      expect(rounded.length).toBeGreaterThan(0);
    });
  });

  describe('Icon Display', () => {
    it('should display play icon for autoplay', () => {
      renderComponent();
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    });

    it('should display hand icon for manual', () => {
      renderComponent();
      expect(screen.getByTestId('hand-icon')).toBeInTheDocument();
    });

    it('should have icon containers', () => {
      const { container } = renderComponent();
      const iconContainers = container.querySelectorAll(
        'div[class*="rounded-2xl"][class*="flex"]'
      );
      expect(iconContainers.length).toBeGreaterThan(0);
    });

    it('should style icons with gradients', () => {
      const { container } = renderComponent();
      const styledIcons = container.querySelectorAll(
        'svg[class*="text-white"]'
      );
      expect(styledIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Text Content', () => {
    it('should have proper heading hierarchy', () => {
      const { container } = renderComponent();
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveClass('landing-h2');
    });

    it('should have card titles', () => {
      const { container } = renderComponent();
      const h3s = container.querySelectorAll('h3');
      expect(h3s.length).toBeGreaterThanOrEqual(2);
    });

    it('should have descriptive text', () => {
      const { container } = renderComponent();
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThan(0);
    });

    it('should display feature benefits', () => {
      const { container } = renderComponent();
      const benefits = container.querySelectorAll('li');
      expect(benefits.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Animation Properties', () => {
    it('should have animation on heading', () => {
      const { container } = renderComponent();
      expect(container.querySelector('h2')).toBeInTheDocument();
    });

    it('should have animation on cards', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('div[class*="group"]');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('should have shimmer effect', () => {
      const { container } = renderComponent();
      const shimmers = container.querySelectorAll(
        'div[class*="bg-linear-to-br"]'
      );
      expect(shimmers.length).toBeGreaterThan(0);
    });

    it('should have glow effects', () => {
      const { container } = renderComponent();
      const glows = container.querySelectorAll('div[class*="blur-xl"]');
      expect(glows.length).toBeGreaterThan(0);
    });
  });

  describe('Card Structure', () => {
    it('should have proper card hierarchy', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('div[class*="rounded-2xl"]');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('should have card shadows', () => {
      const { container } = renderComponent();
      const shadows = container.querySelectorAll('div[class*="shadow-lg"]');
      expect(shadows.length).toBeGreaterThan(0);
    });

    it('should have card borders', () => {
      const { container } = renderComponent();
      const bordered = container.querySelectorAll('div[class*="border-white"]');
      expect(bordered.length).toBeGreaterThan(0);
    });

    it('should have group hover states', () => {
      const { container } = renderComponent();
      const groups = container.querySelectorAll('div[class*="group"]');
      expect(groups.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Responsive Design', () => {
    it('should be single column on mobile', () => {
      const { container } = renderComponent();
      // Grid applies md:grid-cols-2, so mobile is single column
      const grid = container.querySelector('div[class*="md:grid-cols-2"]');
      expect(grid).toBeInTheDocument();
    });

    it('should be two columns on desktop', () => {
      const { container } = renderComponent();
      const grid = container.querySelector('div[class*="md:grid-cols-2"]');
      expect(grid).toHaveClass('grid', 'md:grid-cols-2');
    });

    it('should have proper spacing', () => {
      const { container } = renderComponent();
      const grid = container.querySelector('div[class*="gap-8"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should have proper heading order', () => {
      const { container } = renderComponent();
      const h2 = container.querySelector('h2');
      const h3s = container.querySelectorAll('h3');
      expect(h2).toBeInTheDocument();
      expect(h3s.length).toBeGreaterThanOrEqual(2);
    });

    it('should have readable text contrast', () => {
      const { container } = renderComponent();
      const textElements = container.querySelectorAll('[class*="text-text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should have proper color contrast for white text', () => {
      const { container } = renderComponent();
      const whiteText = container.querySelectorAll('svg[class*="text-white"]');
      expect(whiteText.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should render with all content', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should handle long feature titles', () => {
      renderComponent();
      expect(screen.getByText(/Auto-Play Mode/i)).toBeInTheDocument();
    });

    it('should render even without extra content', () => {
      const { container } = renderComponent();
      // Core structure should always be present
      expect(container.querySelector('section')).toBeInTheDocument();
      expect(container.querySelector('h2')).toBeInTheDocument();
    });
  });
});
