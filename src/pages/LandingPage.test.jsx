/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen } from '../test/testUtils';
import LandingPage from './LandingPage';

// Mock components that don't need data-testid testing
vi.mock('../components/landing/Hero', () => ({
  default: () => <div data-testid="hero">Hero</div>,
}));

vi.mock('../components/landing/LearnYourWay', () => ({
  default: () => <div data-testid="learn-your-way">LearnYourWay</div>,
}));

vi.mock('../components/landing/AlgorithmTypes', () => ({
  default: () => <div data-testid="algorithm-types">AlgorithmTypes</div>,
}));

vi.mock('../components/landing/Features', () => ({
  default: () => <div data-testid="features">Features</div>,
}));

vi.mock('../components/landing/ClaritySection', () => ({
  default: () => <div data-testid="clarity-section">ClaritySection</div>,
}));

vi.mock('../components/landing/RoadmapCTA', () => ({
  default: () => <div data-testid="roadmap-cta">RoadmapCTA</div>,
}));

vi.mock('../components/landing/TechPattern', () => ({
  default: () => <div data-testid="tech-pattern">TechPattern</div>,
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
  return renderWithI18n(<LandingPage />);
};

describe('LandingPage', () => {
  describe('Rendering', () => {
    it('should render all main sections', () => {
      renderComponent();

      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByTestId('learn-your-way')).toBeInTheDocument();
      expect(screen.getByTestId('algorithm-types')).toBeInTheDocument();
      expect(screen.getByTestId('features')).toBeInTheDocument();
      expect(screen.getByTestId('clarity-section')).toBeInTheDocument();
      expect(screen.getByTestId('roadmap-cta')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render TechPattern component', () => {
      renderComponent();
      expect(screen.getByTestId('tech-pattern')).toBeInTheDocument();
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
  });

  describe('Layout', () => {
    it('should have proper container structure', () => {
      const { container } = renderComponent();
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('min-h-screen');
      expect(mainContainer).toHaveClass('relative');
      expect(mainContainer).toHaveClass('overflow-x-hidden');
    });

    it('should have fixed controls in top right', () => {
      const { container } = renderComponent();
      const controlsContainer = container.querySelector('.fixed.top-4.right-4');
      expect(controlsContainer).toBeInTheDocument();
    });

    it('should have gradient background', () => {
      const { container } = renderComponent();
      const bgGradient = container.querySelector(
        '.fixed.inset-0.bg-linear-to-b'
      );
      expect(bgGradient).toBeInTheDocument();
    });
  });

  describe('Component Order', () => {
    it('should render components in correct order', () => {
      const { container } = renderComponent();
      const sections = container.querySelectorAll('[data-testid]');
      const testIds = Array.from(sections).map(el =>
        el.getAttribute('data-testid')
      );

      // Check that Hero comes before other sections
      const heroIndex = testIds.indexOf('hero');
      const learnIndex = testIds.indexOf('learn-your-way');
      expect(heroIndex).toBeLessThan(learnIndex);

      // Check that Footer is last
      const footerIndex = testIds.indexOf('footer');
      expect(footerIndex).toBeGreaterThan(heroIndex);
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
