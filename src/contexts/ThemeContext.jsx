/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

import { useState, useEffect, useCallback } from 'react';
import { ThemeContext } from './ThemeContextDefinition';

/**
 * Theme Provider Component
 * Manages theme state globally and provides it to all child components
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // Initialize from localStorage or system preference
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      // Check system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      return prefersDark ? 'dark' : 'light';
    } catch (e) {
      console.error('Failed to read theme from localStorage:', e);
      return 'light';
    }
  });

  const [isSystemDark, setIsSystemDark] = useState(() => {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply theme to document
  const applyTheme = useCallback(newTheme => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Set theme and persist to localStorage
  const setTheme = useCallback(
    newTheme => {
      if (newTheme !== 'light' && newTheme !== 'dark') {
        console.error('Invalid theme value:', newTheme);
        return;
      }

      setThemeState(newTheme);
      applyTheme(newTheme);

      try {
        localStorage.setItem('theme', newTheme);
      } catch (e) {
        console.error('Failed to save theme to localStorage:', e);
      }
    },
    [applyTheme]
  );

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = e => {
        setIsSystemDark(e.matches);
        // Only auto-switch if user hasn't set a preference
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
          const newTheme = e.matches ? 'dark' : 'light';
          setThemeState(newTheme);
          applyTheme(newTheme);
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
      // Legacy browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    } catch (e) {
      console.error('Failed to setup system theme listener:', e);
    }
  }, [applyTheme]);

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isSystemDark,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
