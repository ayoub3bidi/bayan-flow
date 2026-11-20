/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { SpinnerGap } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './hooks/useAuth.js';
import {
  AUTH_CALLBACK_PATH,
  hasStoredSession,
} from './services/authService.js';
import BannedScreen from './components/BannedScreen.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
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
  const { t } = useTranslation();

  return (
    <div
      className="flex min-h-40 items-center justify-center"
      role="status"
      aria-label={t('a11y.loadingPage')}
    >
      <SpinnerGap className="size-6 animate-spin text-text-secondary" />
    </div>
  );
}

/** Shown when a page crashes or its code fails to load (e.g. a stale tab after a deploy). */
function RouteErrorFallback() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <main role="alert" className="max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-text-primary mb-2">
          {t('errors.pageCrashTitle')}
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-8">
          {t('errors.pageCrashBody')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-xl bg-theme-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-theme-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
          >
            {t('errors.reload')}
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
          >
            {t('common.backToHome')}
          </Link>
        </div>
      </main>
    </div>
  );
}

// Decided once per page load, so returning to `/` later (logo, Back) never redirects.
let landingEntryDecided = false;

/** `/`: a returning signed-in visitor goes straight to the app on a fresh visit. */
function LandingRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isReturningVisit] = useState(() => {
    const returning =
      !landingEntryDecided &&
      location.key === 'default' &&
      !location.hash &&
      hasStoredSession();
    landingEntryDecided = true;
    return returning;
  });

  if (isReturningVisit) {
    if (isLoading) return <RouteFallback />;
    if (isAuthenticated) return <Navigate to="/app" replace />;
  }
  return <LandingPage />;
}

function AppRoutes() {
  const { accessBlock, isLoading } = useAuth();
  const location = useLocation();

  if (accessBlock === 'account_banned' && !isLoading) {
    return <BannedScreen />;
  }

  return (
    <ErrorBoundary
      resetKey={location.pathname}
      fallback={<RouteErrorFallback />}
    >
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
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
    </ErrorBoundary>
  );
}

export default AppRoutes;
