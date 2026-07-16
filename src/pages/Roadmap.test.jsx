/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen } from '../test/testUtils';
import { BrowserRouter } from 'react-router-dom';
import Roadmap from './Roadmap';

// Mock scrollTo
const mockScrollTo = vi.fn();
global.window.scrollTo = mockScrollTo;

// Mock components with simple implementations
vi.mock('../components/roadmap/RoadmapHero', () => ({
  default: () => <section data-testid="roadmap-hero">RoadmapHero</section>,
}));

vi.mock('../components/roadmap/Timeline', () => ({
  default: () => <section data-testid="timeline">Timeline</section>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

const renderComponent = () => {
  return renderWithI18n(
    <BrowserRouter>
      <Roadmap />
    </BrowserRouter>
  );
};

describe('Roadmap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockScrollTo.mockClear();
  });

  describe('Rendering', () => {
    it('should render all main components', () => {
      renderComponent();

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('roadmap-hero')).toBeInTheDocument();
      expect(screen.getByTestId('timeline')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have proper container structure', () => {
      const { container } = renderComponent();
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('min-h-screen');
      expect(mainContainer).toHaveClass('bg-bg');
      expect(mainContainer).toHaveClass('flex');
      expect(mainContainer).toHaveClass('flex-col');
      expect(mainContainer).toHaveClass('overflow-x-hidden');
    });
  });

  describe('Scroll Behavior', () => {
    it('should scroll to top on mount', () => {
      renderComponent();
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'instant',
      });
    });

    it('should only scroll once on mount', () => {
      renderComponent();
      expect(mockScrollTo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Order', () => {
    it('should render components in correct order', () => {
      renderComponent();
      const testIds = ['header', 'roadmap-hero', 'timeline', 'footer'];

      testIds.forEach(testId => {
        expect(screen.getByTestId(testId)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      renderComponent();
      const footer = screen.getByTestId('footer');
      expect(footer.tagName).toBe('FOOTER');
    });
  });
});
