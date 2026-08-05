/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/testUtils';
import HeroVisualizerDemo from './HeroVisualizerDemo';
import { HERO_DEMO_SIZE, HERO_STEP_MS } from './heroVisualizerDemoConfig';
import { ELEMENT_STATES, STATE_COLORS } from '../../constants';
import i18n from '../../i18n';

/** Deterministic stand-in for generateRandomArray in tests. */
const MOCK_HERO_ARRAY = [42, 17, 88, 5, 63];

const reduceMotionRef = { current: false };

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } =
    await import('../../test/framerMotionMock.jsx');
  return createFramerMotionMock({
    useReducedMotion: () => reduceMotionRef.current,
  });
});

vi.mock('../../utils/arrayHelpers', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    generateRandomArray: vi.fn(() => [...MOCK_HERO_ARRAY]),
  };
});

function renderDemo() {
  return renderWithProviders(<HeroVisualizerDemo />);
}

describe('HeroVisualizerDemo', () => {
  beforeEach(async () => {
    reduceMotionRef.current = false;
    await i18n.changeLanguage('en');
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('mounts with a random-sized demo array matching HERO_DEMO_SIZE', async () => {
    renderDemo();

    const demo = screen.getByTestId('hero-visualizer-demo');
    expect(demo).toBeInTheDocument();
    expect(demo.getAttribute('data-array-size')).toBe(String(HERO_DEMO_SIZE));
    expect(HERO_DEMO_SIZE).toBe(5);

    for (const value of MOCK_HERO_ARRAY) {
      expect(screen.getByText(String(value))).toBeInTheDocument();
    }
  });

  it('autoplays and advances steps on a timer', async () => {
    renderDemo();
    const demo = screen.getByTestId('hero-visualizer-demo');

    await waitFor(() => {
      expect(demo.getAttribute('data-current-step')).toBe('0');
    });

    await act(async () => {
      vi.advanceTimersByTime(HERO_STEP_MS * 2);
    });

    await waitFor(() => {
      expect(Number(demo.getAttribute('data-current-step'))).toBeGreaterThan(0);
    });
  });

  it('does not render legend chrome but does show step captions', async () => {
    const { container } = renderDemo();

    expect(
      screen.queryByLabelText(i18n.t('legend.show'))
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });
  });

  it('ignores pointer interaction on the demo shell', async () => {
    renderDemo();
    const demo = screen.getByTestId('hero-visualizer-demo');

    await waitFor(() => {
      expect(demo.getAttribute('data-current-step')).toBe('0');
    });

    const stepBefore = demo.getAttribute('data-current-step');
    fireEvent.click(demo);
    fireEvent.pointerDown(demo);
    fireEvent.mouseDown(demo);

    expect(demo.getAttribute('data-current-step')).toBe(stepBefore);
    expect(demo).toHaveClass('pointer-events-none');
  });

  it('stops after the first sort completes without replaying', async () => {
    renderDemo();
    const demo = screen.getByTestId('hero-visualizer-demo');

    await waitFor(() => {
      expect(demo.getAttribute('data-current-step')).toBe('0');
    });

    // Enough time for a 6-element bubble sort at FAST speed, plus buffer
    await act(async () => {
      vi.advanceTimersByTime(60 * HERO_STEP_MS);
    });

    await waitFor(() => {
      expect(demo.getAttribute('data-complete')).toBe('true');
    });

    const stepAtComplete = Number(demo.getAttribute('data-current-step'));

    await act(async () => {
      vi.advanceTimersByTime(HERO_STEP_MS * 3);
    });

    expect(demo.getAttribute('data-complete')).toBe('true');
    expect(Number(demo.getAttribute('data-current-step'))).toBe(stepAtComplete);
  });

  it('does not emit sound events during autoplay', async () => {
    const { soundManager } = await import('../../utils/soundManager');
    renderDemo();

    await waitFor(() => {
      expect(
        screen
          .getByTestId('hero-visualizer-demo')
          .getAttribute('data-current-step')
      ).toBe('0');
    });

    await act(async () => {
      vi.advanceTimersByTime(HERO_STEP_MS * 5);
    });

    expect(soundManager.playEvents).not.toHaveBeenCalled();
  });

  it('renders a static settled sorted state when reduced motion is preferred', () => {
    reduceMotionRef.current = true;
    renderDemo();

    const demo = screen.getByTestId('hero-visualizer-demo');
    expect(demo.getAttribute('data-reduced-motion')).toBe('true');
    expect(demo.getAttribute('data-current-step')).toBe('0');
    expect(demo.getAttribute('data-complete')).toBe('false');

    const sorted = [...MOCK_HERO_ARRAY].sort((a, b) => a - b);
    for (const value of sorted) {
      expect(screen.getByText(String(value))).toBeInTheDocument();
    }

    const sortedColor = STATE_COLORS[ELEMENT_STATES.SORTED];
    const barsWithColor = Array.from(
      document.querySelectorAll('[style*="background"]')
    ).filter(el => {
      const bg = el.style.backgroundColor;
      return (
        bg === sortedColor ||
        bg === 'rgb(16, 185, 129)' ||
        (typeof bg === 'string' && bg.includes('16, 185, 129'))
      );
    });
    expect(barsWithColor.length).toBe(HERO_DEMO_SIZE);
  });
});
