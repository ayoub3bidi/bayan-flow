/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders, screen } from '../../test/testUtils';
import { BrowserRouter } from 'react-router-dom';
import i18n from '../../i18n';
import Hero from './Hero';

const reduceMotionRef = { current: false };

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } =
    await import('../../test/framerMotionMock.jsx');
  return createFramerMotionMock({
    useReducedMotion: () => reduceMotionRef.current,
  });
});

vi.mock('../ui/Container', () => ({
  default: ({ children, className = '' }) => (
    <div className={className} data-testid="container">
      {children}
    </div>
  ),
}));

vi.mock('../ui/Button', () => ({
  default: ({ children, to, variant, ...props }) => (
    <a href={to} data-variant={variant} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('./HeroVisualizerDemo', async () => {
  const { useReducedMotion } = await import('framer-motion');
  return {
    default: function MockHeroVisualizerDemo() {
      const reduceMotion = useReducedMotion();
      return (
        <div
          data-testid="hero-visualizer-demo"
          data-reduced-motion={reduceMotion ? 'true' : 'false'}
        />
      );
    },
  };
});

const renderComponent = () => {
  return renderWithProviders(
    <BrowserRouter>
      <Hero />
    </BrowserRouter>
  );
};

describe('Hero', () => {
  beforeEach(async () => {
    reduceMotionRef.current = false;
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  describe('Rendering', () => {
    it('should render hero section', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('min-h-screen');
    });

    it('should render Container component', () => {
      renderComponent();
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('should render title', () => {
      renderComponent();
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(i18n.t('landing.hero.title'));
    });

    it('should render subtitle', () => {
      renderComponent();
      expect(
        screen.getByText(i18n.t('landing.hero.subtitle'))
      ).toBeInTheDocument();
    });

    it('should render CTA button', () => {
      renderComponent();
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/app');
      expect(link).toHaveAttribute('data-variant', 'cta');
      expect(link).toHaveTextContent(i18n.t('landing.hero.cta'));
    });

    it('should render student outcome under the CTA', () => {
      renderComponent();
      expect(
        screen.getByText(i18n.t('landing.hero.outcome'))
      ).toBeInTheDocument();
    });

    it('should render HeroVisualizerDemo', () => {
      renderComponent();
      expect(screen.getByTestId('hero-visualizer-demo')).toBeInTheDocument();
    });
  });

  describe('Locales', () => {
    it('renders French hero copy', async () => {
      await i18n.changeLanguage('fr');
      renderComponent();
      expect(
        screen.getByText(i18n.t('landing.hero.subtitle'))
      ).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveTextContent(
        i18n.t('landing.hero.cta')
      );
      expect(
        screen.getByText(i18n.t('landing.hero.outcome'))
      ).toBeInTheDocument();
    });

    it('renders Arabic hero copy', async () => {
      await i18n.changeLanguage('ar');
      renderComponent();
      expect(
        screen.getByText(i18n.t('landing.hero.subtitle'))
      ).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveTextContent(
        i18n.t('landing.hero.cta')
      );
      expect(
        screen.getByText(i18n.t('landing.hero.outcome'))
      ).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have proper section classes', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('relative');
      expect(section).toHaveClass('min-h-screen');
      expect(section).toHaveClass('flex');
      expect(section).toHaveClass('items-center');
      expect(section).toHaveClass('justify-center');
      expect(section).toHaveClass('overflow-hidden');
    });

    it('uses a two-column layout with a dominant visualizer column', () => {
      const { container } = renderComponent();
      const layout = container.querySelector('div[class*="lg:flex-row"]');
      expect(layout).toBeInTheDocument();
      expect(
        container.querySelector('div[class*="lg:w-[40%]"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('div[class*="lg:w-[60%]"]')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderComponent();
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible link', () => {
      renderComponent();
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Reduced motion', () => {
    it('passes reduced motion into the demo as a static fallback', () => {
      reduceMotionRef.current = true;
      renderComponent();
      const demo = screen.getByTestId('hero-visualizer-demo');
      expect(demo.getAttribute('data-reduced-motion')).toBe('true');
    });
  });
});
