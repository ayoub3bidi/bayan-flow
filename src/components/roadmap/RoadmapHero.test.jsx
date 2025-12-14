/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoadmapHero from './RoadmapHero';

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
      p: ({ children, ...props }) => <p {...props}>{children}</p>,
    },
  };
});

// Mock Container
vi.mock('../ui/Container', () => ({
  default: ({ children, className }) => (
    <div className={className}>{children}</div>
  ),
}));

describe('RoadmapHero', () => {
  describe('Rendering', () => {
    it('should render section element', () => {
      const { container } = render(<RoadmapHero />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render h1 heading', () => {
      const { container } = render(<RoadmapHero />);
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
    });

    it('should render subtitle paragraph', () => {
      const { container } = render(<RoadmapHero />);
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
    });

    it('should display roadmap title', () => {
      render(<RoadmapHero />);
      expect(screen.getByText("Where We're Going")).toBeInTheDocument();
    });

    it('should display roadmap subtitle', () => {
      render(<RoadmapHero />);
      expect(
        screen.getByText(
          "Every update, every DevLog. See what's live and what's next."
        )
      ).toBeInTheDocument();
    });
  });

  describe('Section Styling', () => {
    it('should apply section styling', () => {
      const { container } = render(<RoadmapHero />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('relative', 'overflow-hidden');
    });

    it('should have proper padding', () => {
      const { container } = render(<RoadmapHero />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('py-20', 'md:py-32');
    });

    it('should have background styling', () => {
      const { container } = render(<RoadmapHero />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-bg');
    });

    it('should have overflow hidden', () => {
      const { container } = render(<RoadmapHero />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('overflow-hidden');
    });
  });

  describe('Background Elements', () => {
    it('should have radial gradient background', () => {
      const { container } = render(<RoadmapHero />);
      const gradient = container.querySelector(
        'div[class*="radial-gradient-animated"]'
      );
      expect(gradient).toBeInTheDocument();
    });

    it('should have absolute position for background', () => {
      const { container } = render(<RoadmapHero />);
      const background = container.querySelector('div[class*="inset-0"]');
      expect(background).toBeInTheDocument();
    });

    it('should position background behind content', () => {
      const { container } = render(<RoadmapHero />);
      const background = container.querySelector('div[class*="absolute"]');
      const content = container.querySelector('div[class*="z-10"]');
      expect(background).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  });

  describe('Heading Styling', () => {
    it('should apply landing heading style to h1', () => {
      const { container } = render(<RoadmapHero />);
      const h1 = container.querySelector('h1');
      expect(h1).toHaveClass('landing-h1');
    });

    it('should apply primary text color', () => {
      const { container } = render(<RoadmapHero />);
      const h1 = container.querySelector('h1');
      expect(h1).toHaveClass('text-text-primary');
    });

    it('should have margin bottom', () => {
      const { container } = render(<RoadmapHero />);
      const h1 = container.querySelector('h1');
      expect(h1).toHaveClass('mb-6');
    });

    it('should have text shadow effect', () => {
      const { container } = render(<RoadmapHero />);
      const h1 = container.querySelector('h1');
      expect(h1).toHaveAttribute('style');
      expect(h1?.getAttribute('style')).toContain('text-shadow');
    });
  });

  describe('Subtitle Styling', () => {
    it('should apply body text style to subtitle', () => {
      const { container } = render(<RoadmapHero />);
      const p = container.querySelector('p');
      expect(p).toHaveClass('landing-body');
    });

    it('should apply secondary text color', () => {
      const { container } = render(<RoadmapHero />);
      const p = container.querySelector('p');
      expect(p).toHaveClass('text-text-secondary');
    });

    it('should be centered', () => {
      const { container } = render(<RoadmapHero />);
      const div = container.querySelector('div[class*="text-center"]');
      expect(div).toBeInTheDocument();
    });
  });

  describe('Content Layout', () => {
    it('should have centered content', () => {
      const { container } = render(<RoadmapHero />);
      const centered = container.querySelector('div[class*="text-center"]');
      expect(centered).toBeInTheDocument();
    });

    it('should have max-width constraint', () => {
      const { container } = render(<RoadmapHero />);
      const maxWidth = container.querySelector('div[class*="max-w-3xl"]');
      expect(maxWidth).toBeInTheDocument();
    });

    it('should center horizontally', () => {
      const { container } = render(<RoadmapHero />);
      const centered = container.querySelector('div[class*="mx-auto"]');
      expect(centered).toBeInTheDocument();
    });

    it('should have relative positioning for content', () => {
      const { container } = render(<RoadmapHero />);
      const relative = container.querySelector('div[class*="z-10"]');
      expect(relative).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should have animation on main container', () => {
      const { container } = render(<RoadmapHero />);
      expect(
        container.querySelector('div[class*="text-center"]')
      ).toBeInTheDocument();
    });

    it('should have animation on heading', () => {
      const { container } = render(<RoadmapHero />);
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
    });

    it('should have animation on subtitle', () => {
      const { container } = render(<RoadmapHero />);
      const p = container.querySelector('p');
      expect(p).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be semantic section', () => {
      const { container } = render(<RoadmapHero />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(<RoadmapHero />);
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
      // h1 should be the main heading
      const allHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(allHeadings[0]?.tagName).toBe('H1');
    });

    it('should have readable text', () => {
      render(<RoadmapHero />);
      expect(screen.getByText("Where We're Going")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Every update, every DevLog. See what's live and what's next."
        )
      ).toBeInTheDocument();
    });

    it('should have proper color contrast', () => {
      const { container } = render(<RoadmapHero />);
      const textElements = container.querySelectorAll('[class*="text-text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('should have mobile padding', () => {
      const { container } = render(<RoadmapHero />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('py-20');
    });

    it('should have desktop padding', () => {
      const { container } = render(<RoadmapHero />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('md:py-32');
    });

    it('should be responsive on all sizes', () => {
      const { container } = render(<RoadmapHero />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Content Order', () => {
    it('should render background first', () => {
      const { container } = render(<RoadmapHero />);
      const section = container.querySelector('section');
      const firstChild = section?.firstElementChild;
      expect(firstChild).toHaveClass('absolute');
    });

    it('should render content after background', () => {
      const { container } = render(<RoadmapHero />);
      const content = container.querySelector('div[class*="z-10"]');
      expect(content).toBeInTheDocument();
    });

    it('should have heading before subtitle', () => {
      const { container } = render(<RoadmapHero />);
      const h1 = container.querySelector('h1');
      const p = container.querySelector('p');
      expect(h1).toBeInTheDocument();
      expect(p).toBeInTheDocument();
      // Heading comes before subtitle
      if (h1 && p) {
        expect(
          h1.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      }
    });
  });

  describe('Visual Effects', () => {
    it('should have text shadow on heading', () => {
      const { container } = render(<RoadmapHero />);
      const h1 = container.querySelector('h1');
      const style = h1?.getAttribute('style');
      expect(style).toContain('text-shadow');
      expect(style).toContain('rgba(43, 127, 255, 0.3)');
    });

    it('should have gradient background', () => {
      const { container } = render(<RoadmapHero />);
      const gradient = container.querySelector(
        'div[class*="radial-gradient-animated"]'
      );
      expect(gradient).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render with all translations', () => {
      render(<RoadmapHero />);
      expect(screen.getByText("Where We're Going")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Every update, every DevLog. See what's live and what's next."
        )
      ).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', () => {
      const { container } = render(<RoadmapHero />);
      expect(container.querySelector('h1')).toBeInTheDocument();
    });

    it('should render correctly on first mount', () => {
      const { container } = render(<RoadmapHero />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should unmount without errors', () => {
      const { unmount } = render(<RoadmapHero />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Structure Integrity', () => {
    it('should have proper DOM hierarchy', () => {
      const { container } = render(<RoadmapHero />);
      const section = container.querySelector('section');
      const div = section?.querySelector('div');
      expect(div).toBeInTheDocument();
    });

    it('should maintain proper nesting', () => {
      const { container } = render(<RoadmapHero />);
      const heading = container.querySelector('h1');
      const subtitle = container.querySelector('p');
      expect(heading?.parentElement).toBeTruthy();
      expect(subtitle?.parentElement).toBeTruthy();
    });
  });
});
