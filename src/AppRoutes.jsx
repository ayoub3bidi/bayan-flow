/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { AUTH_CALLBACK_PATH } from './services/authService.js';
import BannedScreen from './components/BannedScreen.jsx';
import LandingPage from './pages/LandingPage.jsx';
import VisualizerApp from './pages/VisualizerApp.jsx';
import Roadmap from './pages/Roadmap.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfUse from './pages/TermsOfUse.jsx';
import GoogleAuthCallback from './pages/GoogleAuthCallback.jsx';
import ProfileSettingsPage from './pages/ProfileSettingsPage.jsx';
import RequireAuth from './components/RequireAuth.jsx';

function AppRoutes() {
  const { accessBlock, isLoading } = useAuth();

  if (accessBlock === 'account_banned' && !isLoading) {
    return <BannedScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<VisualizerApp />} />
      <Route path="/roadmap" element={<Roadmap />} />
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
    </Routes>
  );
}

export default AppRoutes;
