/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import './index.css';
import i18n from './i18n';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { AuthProvider } from './contexts/AuthProvider.jsx';
import { ConsentProvider } from './contexts/ConsentContext.jsx';
import { initRTL } from './utils/rtlManager';
import AppShell from './AppShell.jsx';

initRTL(i18n);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ConsentProvider>
          <AppShell />
        </ConsentProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
