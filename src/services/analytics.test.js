/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const posthogMock = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  reset: vi.fn(),
  get_explicit_consent_status: vi.fn(() => 'pending'),
}));

vi.mock('posthog-js', () => ({ default: posthogMock }));

/** Fresh module per test: analytics.js keeps init state at module scope. */
async function loadAnalytics() {
  vi.resetModules();
  return import('./analytics');
}

function setNavigatorSignals({ dnt = null, gpc = undefined } = {}) {
  Object.defineProperty(navigator, 'doNotTrack', {
    value: dnt,
    configurable: true,
  });
  Object.defineProperty(navigator, 'globalPrivacyControl', {
    value: gpc,
    configurable: true,
  });
}

describe('analytics', () => {
  beforeEach(() => {
    Object.values(posthogMock).forEach(fn => fn.mockClear());
    posthogMock.get_explicit_consent_status.mockReturnValue('pending');
    vi.stubEnv('VITE_POSTHOG_API_KEY', 'phc_test');
    vi.stubEnv('VITE_POSTHOG_API_HOST', 'https://e.example.com');
    vi.stubEnv('DEV', false);
    setNavigatorSignals();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    setNavigatorSignals();
  });

  it('inits in cookieless-until-consent mode', async () => {
    const { initPostHog } = await loadAnalytics();
    initPostHog();

    expect(posthogMock.init).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        cookieless_mode: 'on_reject',
        opt_out_capturing_by_default: true,
        capture_pageview: 'history_change',
        disable_surveys: true,
      })
    );
  });

  it.each([
    ['Do Not Track', { dnt: '1' }],
    ['Global Privacy Control', { gpc: true }],
  ])('loads nothing when %s is on', async (_label, signals) => {
    setNavigatorSignals(signals);
    const { initPostHog, captureEvent, setAnalyticsConsent } =
      await loadAnalytics();

    initPostHog();
    captureEvent('visualization_started');
    setAnalyticsConsent(true);

    expect(posthogMock.init).not.toHaveBeenCalled();
    expect(posthogMock.capture).not.toHaveBeenCalled();
    expect(posthogMock.opt_in_capturing).not.toHaveBeenCalled();
  });

  it.each([
    [true, 'opt_in_capturing'],
    [false, 'opt_out_capturing'],
  ])(
    'restores consent=%s after reset so sign-out keeps the visitor choice',
    async (granted, restoreFn) => {
      const { initPostHog, setAnalyticsConsent, resetUser } =
        await loadAnalytics();
      initPostHog();
      posthogMock.get_explicit_consent_status.mockReturnValue(
        granted ? 'granted' : 'denied'
      );
      setAnalyticsConsent(granted);

      resetUser();

      expect(posthogMock.reset).toHaveBeenCalledTimes(1);
      expect(posthogMock[restoreFn]).toHaveBeenCalledTimes(1);
      if (granted) {
        expect(posthogMock.opt_in_capturing).toHaveBeenCalledWith({
          captureEventName: false,
        });
      }
    }
  );

  it('leaves consent pending after reset when the visitor never chose', async () => {
    const { initPostHog, resetUser } = await loadAnalytics();
    initPostHog();

    resetUser();

    expect(posthogMock.reset).toHaveBeenCalledTimes(1);
    expect(posthogMock.opt_in_capturing).not.toHaveBeenCalled();
    expect(posthogMock.opt_out_capturing).not.toHaveBeenCalled();
  });

  it('opts in or out only when the stored choice differs', async () => {
    const { initPostHog, setAnalyticsConsent } = await loadAnalytics();
    initPostHog();

    posthogMock.get_explicit_consent_status.mockReturnValue('granted');
    setAnalyticsConsent(true);
    expect(posthogMock.opt_in_capturing).not.toHaveBeenCalled();

    setAnalyticsConsent(false);
    expect(posthogMock.opt_out_capturing).toHaveBeenCalledTimes(1);

    posthogMock.get_explicit_consent_status.mockReturnValue('pending');
    setAnalyticsConsent(true);
    expect(posthogMock.opt_in_capturing).toHaveBeenCalledTimes(1);
  });
});
