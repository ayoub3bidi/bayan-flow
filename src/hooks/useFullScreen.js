/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useEffect, useCallback } from 'react';

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }
  return Boolean(
    target.isContentEditable || target.closest('[contenteditable="true"]')
  );
}

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

  // Keyboard shortcuts (ignored while typing in inputs / rich-text editors)
  useEffect(() => {
    const handleKeyDown = event => {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === 'f' || event.key === 'F') {
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }
        event.preventDefault();
        toggleFullScreen();
      } else if (event.key === 'Escape' && isFullScreen) {
        event.preventDefault();
        exitFullScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullScreen, exitFullScreen, isFullScreen]);

  return {
    isFullScreen,
    toggleFullScreen,
    exitFullScreen,
  };
}
