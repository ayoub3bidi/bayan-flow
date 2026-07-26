/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { BrowserRouter } from 'react-router-dom';
import { useConsent } from './hooks/useConsent.js';
import { PostHogProvider } from './providers/PostHogProvider.jsx';
import AppRoutes from './AppRoutes.jsx';
import DocumentTitle from './components/DocumentTitle.jsx';
import CookieConsentBanner from './components/CookieConsentBanner.jsx';

export default function AppShell() {
  const { isAnalyticsAllowed } = useConsent();

  return (
    <PostHogProvider analytics={isAnalyticsAllowed}>
      <BrowserRouter>
        <DocumentTitle />
        <AppRoutes />
        <CookieConsentBanner />
      </BrowserRouter>
    </PostHogProvider>
  );
}
