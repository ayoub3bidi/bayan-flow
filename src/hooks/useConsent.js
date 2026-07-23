/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useContext } from 'react';
import { ConsentContext } from '../contexts/ConsentContext.jsx';

const DEFAULT_CONSENT = {
  consent: null,
  bannerVisible: false,
  grantConsent: () => {},
  denyConsent: () => {},
  resetConsent: () => {},
  isAnalyticsAllowed: false,
};

export function useConsent() {
  const ctx = useContext(ConsentContext);
  return ctx ?? DEFAULT_CONSENT;
}
