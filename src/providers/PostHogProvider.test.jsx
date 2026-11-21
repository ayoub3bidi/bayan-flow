/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PostHogProvider } from './PostHogProvider.jsx';

const analyticsMock = vi.hoisted(() => ({
  initPostHog: vi.fn(),
  setAnalyticsConsent: vi.fn(),
}));

vi.mock('../services/analytics', () => analyticsMock);
vi.mock('@posthog/react', () => ({
  PostHogProvider: ({ children }) => children,
}));

describe('PostHogProvider', () => {
  beforeEach(() => {
    Object.values(analyticsMock).forEach(fn => fn.mockClear());
  });

  it('initializes on mount and leaves consent pending before a choice', () => {
    render(
      <PostHogProvider consent={null}>
        <span>app</span>
      </PostHogProvider>
    );

    expect(analyticsMock.initPostHog).toHaveBeenCalled();
    expect(analyticsMock.setAnalyticsConsent).not.toHaveBeenCalled();
  });

  it('applies the visitor choice when it changes', () => {
    const { rerender } = render(
      <PostHogProvider consent={null}>
        <span>app</span>
      </PostHogProvider>
    );

    rerender(
      <PostHogProvider consent={true}>
        <span>app</span>
      </PostHogProvider>
    );
    expect(analyticsMock.setAnalyticsConsent).toHaveBeenLastCalledWith(true);

    rerender(
      <PostHogProvider consent={false}>
        <span>app</span>
      </PostHogProvider>
    );
    expect(analyticsMock.setAnalyticsConsent).toHaveBeenLastCalledWith(false);
  });
});
