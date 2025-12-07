/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import i18n from './i18n';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { initRTL } from './utils/rtlManager';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import VisualizerApp from './pages/VisualizerApp.jsx';
import Roadmap from './pages/Roadmap.jsx';

initRTL(i18n);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<VisualizerApp />} />
          <Route path="/roadmap" element={<Roadmap />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
