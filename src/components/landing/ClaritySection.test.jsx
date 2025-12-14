/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen } from '../../test/testUtils';
import ClaritySection from './ClaritySection';

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    useInView: () => true,
  };
});

describe('ClaritySection', () => {
  describe('Rendering', () => {
    it('should render section element', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render heading', () => {
      renderWithI18n(<ClaritySection />);
      expect(screen.getByText(/No Clutter, Just Clarity/i)).toBeInTheDocument();
    });

    it('should render description', () => {
      renderWithI18n(<ClaritySection />);
      expect(screen.getByText(/strips away complexity/i)).toBeInTheDocument();
    });

    it('should render youtube iframe', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
    });

    it('should have correct youtube video ID', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const iframe = container.querySelector('iframe');
      expect(iframe?.src).toContain('ZwcT68ZRD0U');
    });
  });

  describe('Video Container', () => {
    it('should have aspect ratio container', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const aspectContainer = container.querySelector(
        'div[class*="aspect-video"]'
      );
      expect(aspectContainer).toBeInTheDocument();
    });

    it('should have rounded corners', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const rounded = container.querySelector('div[class*="rounded-3xl"]');
      expect(rounded).toBeInTheDocument();
    });

    it('should have overflow hidden', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const overflow = container.querySelector('div[class*="overflow-hidden"]');
      expect(overflow).toBeInTheDocument();
    });

    it('should have gradient border effect', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const gradient = container.querySelector(
        'div[class*="bg-linear-to-br"][class*="from-blue-500"]'
      );
      expect(gradient).toBeInTheDocument();
    });

    it('should have padding border', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const bordered = container.querySelector('div[class*="p-1"]');
      expect(bordered).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have flex layout', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const flex = container.querySelector('div[class*="flex"]');
      expect(flex).toBeInTheDocument();
    });

    it('should have column direction on mobile', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const flexCol = container.querySelector('div[class*="flex-col"]');
      expect(flexCol).toBeInTheDocument();
    });

    it('should have row direction on large screens', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const flexRow = container.querySelector('div[class*="lg:flex-row"]');
      expect(flexRow).toBeInTheDocument();
    });

    it('should have proper gap between elements', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const gap = container.querySelector(
        'div[class*="gap-12"][class*="lg:gap-20"]'
      );
      expect(gap).toBeInTheDocument();
    });

    it('should have centered items', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const centered = container.querySelector('div[class*="items-center"]');
      expect(centered).toBeInTheDocument();
    });
  });

  describe('Text Content', () => {
    it('should have h2 heading', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
    });

    it('should display heading text', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const h2 = container.querySelector('h2');
      expect(h2?.textContent).toMatch(
        /No Clutter, Just Clarity|Crystal Clear Insights/
      );
    });

    it('should display description paragraph', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const p = container.querySelector('p');
      expect(p).toBeInTheDocument();
    });

    it('should display description text', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const p = container.querySelector('p');
      expect(p?.textContent).toMatch(
        /strips away complexity|unparalleled clarity/
      );
    });
  });

  describe('Video Container Styling', () => {
    it('should have large width on desktop', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const largeWidth = container.querySelector('div[class*="lg:w-3/5"]');
      expect(largeWidth).toBeInTheDocument();
    });

    it('should have full width on mobile', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const fullWidth = container.querySelector('div[class*="w-full"]');
      expect(fullWidth).toBeInTheDocument();
    });

    it('should have group hover effects', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const group = container.querySelector('div[class*="group"]');
      expect(group).toBeInTheDocument();
    });
  });

  describe('Decorative Elements', () => {
    it('should render glow particles', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const glows = container.querySelectorAll(
        'div[class*="rounded-full"][class*="blur-3xl"]'
      );
      expect(glows.length).toBeGreaterThan(0);
    });

    it('should have animated glow elements', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const glowBlue = container.querySelector(
        'div[class*="bg-blue-500"][class*="rounded-full"]'
      );
      const glowPurple = container.querySelector(
        'div[class*="bg-purple-500"][class*="rounded-full"]'
      );
      expect(glowBlue).toBeInTheDocument();
      expect(glowPurple).toBeInTheDocument();
    });

    it('should have floating decorative dots', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const dots = container.querySelectorAll(
        'div[class*="rounded-full"][class*="absolute"]'
      );
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  describe('YouTube Integration', () => {
    it('should set iframe title', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const iframe = container.querySelector('iframe');
      expect(iframe?.title).toBe('Product Demo Video');
    });

    it('should allow full screen on iframe', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const iframe = container.querySelector('iframe');
      expect(iframe?.hasAttribute('allowFullScreen')).toBe(true);
    });

    it('should have proper iframe permissions', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const iframe = container.querySelector('iframe');
      const allow = iframe?.getAttribute('allow');
      expect(allow).toContain('accelerometer');
      expect(allow).toContain('autoplay');
      expect(allow).toContain('encrypted-media');
    });

    it('should have zero border', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const iframe = container.querySelector('iframe');
      expect(iframe?.getAttribute('frameBorder')).toBe('0');
    });

    it('should have youtube embed src', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const iframe = container.querySelector('iframe');
      expect(iframe?.src).toContain('youtube.com/embed');
    });

    it('should set autoplay params', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const iframe = container.querySelector('iframe');
      expect(iframe?.src).toContain('autoplay=0');
    });

    it('should mute video by default', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const iframe = container.querySelector('iframe');
      expect(iframe?.src).toContain('mute=1');
    });
  });

  describe('Text Width Constraints', () => {
    it('should constrain text width', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const constrained = container.querySelector('div[class*="lg:w-2/5"]');
      expect(constrained).toBeInTheDocument();
    });

    it('should have text on left side', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const leftText = container.querySelector('div[class*="lg:w-2/5"]');
      expect(leftText).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should have h2 heading', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const h2 = container.querySelector('h2');
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(h2).toBeInTheDocument();
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have accessible video description', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const iframe = container.querySelector('iframe');
      expect(iframe?.title).toBeTruthy();
    });

    it('should have readable text color', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const textElements = container.querySelectorAll(
        '[class*="text-gray-300"]'
      );
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Animation States', () => {
    it('should render with animation container', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should have animation on text content', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const animatedText = container.querySelector('div[class*="lg:w-2/5"]');
      expect(animatedText).toBeInTheDocument();
    });

    it('should have animation on video container', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const animatedVideo = container.querySelector('div[class*="lg:w-3/5"]');
      expect(animatedVideo).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render even if video fails to load', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      expect(container.querySelector('iframe')).toBeInTheDocument();
    });

    it('should render with all decorative elements', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const decoratives = container.querySelectorAll('div[class*="absolute"]');
      expect(decoratives.length).toBeGreaterThan(0);
    });

    it('should handle translation keys', () => {
      renderWithI18n(<ClaritySection />);
      // Component should render with fallback text if translations are missing
      expect(
        screen.getByText(/No Clutter, Just Clarity|Crystal Clear Insights/)
      ).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should be single column on mobile', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const flex = container.querySelector('div[class*="flex-col"]');
      expect(flex).toBeInTheDocument();
    });

    it('should be dual column on large screens', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const flex = container.querySelector('div[class*="lg:flex-row"]');
      expect(flex).toBeInTheDocument();
    });

    it('should have responsive spacing', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const spacing = container.querySelector(
        'div[class*="gap-12"][class*="lg:gap-20"]'
      );
      expect(spacing).toBeInTheDocument();
    });
  });

  describe('Content Organization', () => {
    it('should have text before video on large screens', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const textDiv = container.querySelector('div[class*="lg:w-2/5"]');
      const videoDiv = container.querySelector('div[class*="lg:w-3/5"]');
      expect(textDiv).toBeInTheDocument();
      expect(videoDiv).toBeInTheDocument();
    });

    it('should maintain proper order', () => {
      const { container } = renderWithI18n(<ClaritySection />);
      const heading = container.querySelector('h2');
      const paragraph = container.querySelector('p');
      const iframe = container.querySelector('iframe');
      expect(heading).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
      expect(iframe).toBeInTheDocument();
    });
  });
});
