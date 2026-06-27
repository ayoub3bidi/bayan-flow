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
import { initRTL } from './utils/rtlManager';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import VisualizerApp from './pages/VisualizerApp.jsx';
import Roadmap from './pages/Roadmap.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfUse from './pages/TermsOfUse.jsx';
import AuthCallback from './pages/AuthCallback.jsx';

// Components
import DocumentTitle from './components/DocumentTitle.jsx';

initRTL(i18n);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <DocumentTitle />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<VisualizerApp />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
