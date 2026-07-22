/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ConsentProvider } from './ConsentContext';
import { useConsent } from '../hooks/useConsent.js';

const STORAGE_KEY = 'bayanflow:cookie-consent';

function wrapper({ children }) {
  return <ConsentProvider>{children}</ConsentProvider>;
}

describe('ConsentContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('shows banner when no stored consent exists', () => {
    const { result } = renderHook(() => useConsent(), { wrapper });
    expect(result.current.bannerVisible).toBe(true);
    expect(result.current.consent).toBeNull();
  });

  it('hides banner when stored consent exists', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ analytics: true, timestamp: Date.now() })
    );
    const { result } = renderHook(() => useConsent(), { wrapper });
    expect(result.current.bannerVisible).toBe(false);
    expect(result.current.isAnalyticsAllowed).toBe(true);
  });

  it('grantConsent stores analytics: true and hides banner', () => {
    const { result } = renderHook(() => useConsent(), { wrapper });
    expect(result.current.bannerVisible).toBe(true);

    act(() => result.current.grantConsent());

    expect(result.current.bannerVisible).toBe(false);
    expect(result.current.isAnalyticsAllowed).toBe(true);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.analytics).toBe(true);
  });

  it('denyConsent stores analytics: false and hides banner', () => {
    const { result } = renderHook(() => useConsent(), { wrapper });

    act(() => result.current.denyConsent());

    expect(result.current.bannerVisible).toBe(false);
    expect(result.current.isAnalyticsAllowed).toBe(false);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.analytics).toBe(false);
  });

  it('resetConsent clears storage and re-shows banner', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ analytics: true, timestamp: Date.now() })
    );
    const { result } = renderHook(() => useConsent(), { wrapper });
    expect(result.current.bannerVisible).toBe(false);

    act(() => result.current.resetConsent());

    expect(result.current.bannerVisible).toBe(true);
    expect(result.current.consent).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('auto-denies when Do Not Track is set', () => {
    Object.defineProperty(navigator, 'doNotTrack', {
      value: '1',
      configurable: true,
    });
    const { result } = renderHook(() => useConsent(), { wrapper });
    expect(result.current.bannerVisible).toBe(false);
    expect(result.current.isAnalyticsAllowed).toBe(false);
  });

  it('auto-denies when Global Privacy Control is set', () => {
    Object.defineProperty(navigator, 'globalPrivacyControl', {
      value: true,
      configurable: true,
    });
    const { result } = renderHook(() => useConsent(), { wrapper });
    expect(result.current.bannerVisible).toBe(false);
    expect(result.current.isAnalyticsAllowed).toBe(false);
  });

  it('does not auto-deny when no privacy signals are present', () => {
    Object.defineProperty(navigator, 'doNotTrack', {
      value: '0',
      configurable: true,
    });
    Object.defineProperty(navigator, 'globalPrivacyControl', {
      value: false,
      configurable: true,
    });
    const { result } = renderHook(() => useConsent(), { wrapper });
    expect(result.current.bannerVisible).toBe(true);
  });
});
