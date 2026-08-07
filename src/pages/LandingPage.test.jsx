/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithI18n, screen } from '../test/testUtils';
import LandingPage from './LandingPage';
import { SHOW_LANDING_SOCIAL_PROOF } from '../components/landing/landingSocialProof';

// Mock components that don't need data-testid testing
vi.mock('../components/landing/Hero', () => ({
  default: () => <div data-testid="hero">Hero</div>,
}));

vi.mock('../components/landing/AlgorithmTypes', () => ({
  default: () => <div data-testid="algorithm-types">AlgorithmTypes</div>,
}));

vi.mock('../components/landing/Features', () => ({
  default: () => <div data-testid="features">Features</div>,
}));

vi.mock('../components/landing/SocialProofStrip', () => ({
  default: () => <div data-testid="social-proof-strip">SocialProofStrip</div>,
}));

vi.mock('../components/landing/ProPreview', () => ({
  default: () => <div data-testid="pro-preview">ProPreview</div>,
}));

vi.mock('../components/landing/FAQ', () => ({
  default: () => <div data-testid="faq">FAQ</div>,
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

vi.mock('../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

const renderComponent = () => {
  return renderWithI18n(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
};

describe('LandingPage', () => {
  describe('Rendering', () => {
    it('should render all main sections', () => {
      renderComponent();

      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByTestId('algorithm-types')).toBeInTheDocument();
      expect(screen.getByTestId('features')).toBeInTheDocument();
      expect(screen.getByTestId('pro-preview')).toBeInTheDocument();
      expect(screen.getByTestId('clarity-section')).toBeInTheDocument();
      expect(screen.getByTestId('faq')).toBeInTheDocument();
      expect(screen.getByTestId('roadmap-cta')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('keeps the social proof strip gated off until proof is ready', () => {
      expect(SHOW_LANDING_SOCIAL_PROOF).toBe(false);
      renderComponent();
      expect(
        screen.queryByTestId('social-proof-strip')
      ).not.toBeInTheDocument();
    });

    it('should render TechPattern component', () => {
      renderComponent();
      expect(screen.getByTestId('tech-pattern')).toBeInTheDocument();
    });

    it('should render Header component', () => {
      renderComponent();
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have proper container structure', () => {
      const { container } = renderComponent();
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('min-h-screen');
      expect(mainContainer).toHaveClass('relative');
      expect(mainContainer).toHaveClass('overflow-x-clip');
    });

    it('should have header below the banner', () => {
      const { container } = renderComponent();
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Component Order', () => {
    it('should render components in correct order', () => {
      const { container } = renderComponent();
      const sections = container.querySelectorAll('[data-testid]');
      const testIds = Array.from(sections).map(el =>
        el.getAttribute('data-testid')
      );

      // Check that Header comes before content sections
      const headerIndex = testIds.indexOf('header');
      const heroIndex = testIds.indexOf('hero');
      expect(headerIndex).toBeLessThan(heroIndex);

      // Check that Footer is last
      const footerIndex = testIds.indexOf('footer');
      expect(footerIndex).toBeGreaterThan(heroIndex);

      // Content sections follow curated order (social proof gated)
      const expectedOrder = [
        'hero',
        'algorithm-types',
        'features',
        'pro-preview',
        'clarity-section',
        'faq',
        'roadmap-cta',
      ];
      const sectionIndexes = expectedOrder.map(id => testIds.indexOf(id));
      expect(sectionIndexes).toEqual([...sectionIndexes].sort((a, b) => a - b));
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
