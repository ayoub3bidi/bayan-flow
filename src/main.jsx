/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@fontsource-variable/inter';
import './index.css';
import i18n from './i18n';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { AuthProvider } from './contexts/AuthProvider.jsx';
import { AUTH_CALLBACK_PATH } from './services/authService.js';
import { initRTL } from './utils/rtlManager';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import VisualizerApp from './pages/VisualizerApp.jsx';
import Roadmap from './pages/Roadmap.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfUse from './pages/TermsOfUse.jsx';
import GoogleAuthCallback from './pages/GoogleAuthCallback.jsx';

// Components
import DocumentTitle from './components/DocumentTitle.jsx';
import GoogleOneTap from './components/GoogleOneTap.jsx';

initRTL(i18n);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <DocumentTitle />
          <GoogleOneTap />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<VisualizerApp />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path={AUTH_CALLBACK_PATH} element={<GoogleAuthCallback />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
