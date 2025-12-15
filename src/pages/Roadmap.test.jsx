/**
 * Copyright (c) 2025 Ayoub Abidi
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

vi.mock('../components/ThemeToggle', () => ({
  default: () => <button data-testid="theme-toggle">ThemeToggle</button>,
}));

vi.mock('../components/LanguageSwitcher', () => ({
  default: ({ excludeLanguages }) => (
    <div
      data-testid="language-switcher"
      data-exclude={JSON.stringify(excludeLanguages)}
    >
      LanguageSwitcher
    </div>
  ),
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

      expect(screen.getByTestId('roadmap-hero')).toBeInTheDocument();
      expect(screen.getByTestId('timeline')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render ThemeToggle', () => {
      renderComponent();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should render LanguageSwitcher with correct props', () => {
      renderComponent();
      const languageSwitcher = screen.getByTestId('language-switcher');
      expect(languageSwitcher).toBeInTheDocument();
      expect(languageSwitcher).toHaveAttribute(
        'data-exclude',
        JSON.stringify(['ar'])
      );
    });

    it('should render back to home link', () => {
      renderComponent();
      const backLink = screen.getByRole('link');
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
      expect(backLink).toHaveTextContent(/back/i);
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

    it('should have fixed controls in top right', () => {
      const { container } = renderComponent();
      const controlsContainer = container.querySelector('.fixed.top-4.right-4');
      expect(controlsContainer).toBeInTheDocument();
    });

    it('should have back link in top left', () => {
      const { container } = renderComponent();
      const backLinkContainer = container.querySelector('.fixed.top-4.left-4');
      expect(backLinkContainer).toBeInTheDocument();
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

  describe('Back Link', () => {
    it('should have correct href to home', () => {
      renderComponent();
      const backLink = screen.getByRole('link');
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('should display "Back to Home" text on desktop', () => {
      renderComponent();
      const backLink = screen.getByRole('link');
      expect(backLink).toHaveTextContent(/back to home/i);
    });

    it('should have ArrowLeft icon', () => {
      const { container } = renderComponent();
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Component Order', () => {
    it('should render components in correct order', () => {
      renderComponent();
      const testIds = ['roadmap-hero', 'timeline', 'footer'];

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

    it('should have accessible navigation link', () => {
      renderComponent();
      const backLink = screen.getByRole('link');
      expect(backLink).toBeInTheDocument();
    });
  });
});
