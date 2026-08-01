/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SpinnerGap } from '@phosphor-icons/react';
import { useAuth } from './hooks/useAuth.js';
import { AUTH_CALLBACK_PATH } from './services/authService.js';
import BannedScreen from './components/BannedScreen.jsx';
import LandingPage from './pages/LandingPage.jsx';
import RequireAuth from './components/RequireAuth.jsx';

const VisualizerApp = lazy(() => import('./pages/VisualizerApp.jsx'));
const Roadmap = lazy(() => import('./pages/Roadmap.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse.jsx'));
const GoogleAuthCallback = lazy(() => import('./pages/GoogleAuthCallback.jsx'));
const ProfileSettingsPage = lazy(
  () => import('./pages/ProfileSettingsPage.jsx')
);
const ProComingSoonPage = lazy(() => import('./pages/ProComingSoonPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function RouteFallback() {
  return (
    <div
      className="flex min-h-40 items-center justify-center"
      role="status"
      aria-label="Loading page"
    >
      <SpinnerGap className="size-6 animate-spin text-text-secondary" />
    </div>
  );
}

function AppRoutes() {
  const { accessBlock, isLoading } = useAuth();

  if (accessBlock === 'account_banned' && !isLoading) {
    return <BannedScreen />;
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<VisualizerApp />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/pro" element={<ProComingSoonPage />} />
        <Route path={AUTH_CALLBACK_PATH} element={<GoogleAuthCallback />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route
          path="/settings/profile"
          element={
            <RequireAuth>
              <ProfileSettingsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
