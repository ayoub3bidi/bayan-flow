/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useEffect, useCallback } from 'react';

export function useFullScreen() {
  const [isFullScreen, setIsFullScreen] = useState(() => {
    return localStorage.getItem('flowModeEnabled') === 'true';
  });

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => {
      const newValue = !prev;
      localStorage.setItem('flowModeEnabled', newValue.toString());
      return newValue;
    });
  }, []);

  const exitFullScreen = useCallback(() => {
    setIsFullScreen(false);
    localStorage.setItem('flowModeEnabled', 'false');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        toggleFullScreen();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        exitFullScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullScreen, exitFullScreen]);

  return {
    isFullScreen,
    toggleFullScreen,
    exitFullScreen,
  };
}
