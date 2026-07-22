/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { createContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'bayanflow:cookie-consent';

/** @typedef {{ analytics: boolean, timestamp: number } | null} ConsentValue */

// eslint-disable-next-line react-refresh/only-export-components -- Context object, not a component
export const ConsentContext = createContext(
  /** @type {React.Context<{
 * consent: ConsentValue,
 * bannerVisible: boolean,
 * grantConsent: () => void,
 * denyConsent: () => void,
 * resetConsent: () => void,
 * isAnalyticsAllowed: boolean,
}>} */ (null)
);

/**
 * Detect Do Not Track or Global Privacy Control.
 * @returns {boolean}
 */
function hasPrivacySignal() {
  if (typeof navigator === 'undefined') return false;
  return (
    navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true
  );
}

/**
 * Read stored consent from localStorage.
 * @returns {ConsentValue}
 */
function readStoredConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.analytics !== 'boolean') return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Write consent to localStorage.
 * @param {boolean} analytics
 */
function writeConsent(analytics) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ analytics, timestamp: Date.now() })
    );
  } catch {
    // quota / private mode
  }
}

/**
 * Clear stored consent.
 */
function clearConsent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Cookie consent provider.
 * Manages consent state and banner visibility.
 * @param {{ children: import('react').ReactNode }} props
 */
export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState(readStoredConsent);
  const [bannerVisible, setBannerVisible] = useState(() => {
    const stored = readStoredConsent();
    return stored === null;
  });

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored !== null) return;

    // No stored consent — check privacy signals
    if (hasPrivacySignal()) {
      writeConsent(false);
      setConsent({ analytics: false, timestamp: Date.now() });
      setBannerVisible(false);
    }
  }, []);

  const grantConsent = useCallback(() => {
    writeConsent(true);
    setConsent({ analytics: true, timestamp: Date.now() });
    setBannerVisible(false);
  }, []);

  const denyConsent = useCallback(() => {
    writeConsent(false);
    setConsent({ analytics: false, timestamp: Date.now() });
    setBannerVisible(false);
  }, []);

  const resetConsent = useCallback(() => {
    clearConsent();
    setConsent(null);
    setBannerVisible(true);
  }, []);

  const isAnalyticsAllowed = consent?.analytics === true;

  return (
    <ConsentContext.Provider
      value={{
        consent,
        bannerVisible,
        grantConsent,
        denyConsent,
        resetConsent,
        isAnalyticsAllowed,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}
