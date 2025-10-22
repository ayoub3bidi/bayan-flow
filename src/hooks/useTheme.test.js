import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme, ThemeProvider } from '../contexts/ThemeContext';

describe('useTheme', () => {
  let localStorageMock;
  let matchMediaMock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock;

    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
    global.matchMedia = vi.fn(() => matchMediaMock);

    // Mock document.documentElement
    document.documentElement.classList.add = vi.fn();
    document.documentElement.classList.remove = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with light theme when no saved preference and system prefers light', () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.matches = false;

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isLight).toBe(true);
      expect(result.current.isDark).toBe(false);
    });

    it('should initialize with dark theme when no saved preference and system prefers dark', () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.matches = true;

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(result.current.isLight).toBe(false);
    });

    it('should initialize with saved theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      matchMediaMock.matches = false;

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should apply dark class to document when theme is dark', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(document.documentElement.classList.add).toHaveBeenCalledWith(
        'dark'
      );
    });

    it('should remove dark class from document when theme is light', () => {
      localStorageMock.getItem.mockReturnValue('light');

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
        'dark'
      );
    });
  });

  describe('setTheme', () => {
    it('should update theme state and persist to localStorage', () => {
      localStorageMock.getItem.mockReturnValue('light');
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(document.documentElement.classList.add).toHaveBeenCalledWith(
        'dark'
      );
    });

    it('should handle invalid theme values gracefully', () => {
      localStorageMock.getItem.mockReturnValue('light');
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('invalid');
      });

      expect(result.current.theme).toBe('light');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue('light');
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      localStorageMock.getItem.mockReturnValue('light');
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should toggle from dark to light', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isLight).toBe(true);
    });

    it('should persist toggled theme to localStorage', () => {
      localStorageMock.getItem.mockReturnValue('light');
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('System theme detection', () => {
    it('should track system dark mode preference', () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.matches = true;

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.isSystemDark).toBe(true);
    });

    it('should listen for system theme changes', () => {
      localStorageMock.getItem.mockReturnValue(null);

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should auto-switch theme when system preference changes and no saved preference', () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe('light');

      // Simulate system theme change
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1];
      act(() => {
        changeHandler({ matches: true });
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isSystemDark).toBe(true);
    });

    it('should not auto-switch theme when user has saved preference', () => {
      localStorageMock.getItem.mockReturnValue('light');
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe('light');

      // Simulate system theme change
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1];
      act(() => {
        localStorageMock.getItem.mockReturnValue('light');
        changeHandler({ matches: true });
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isSystemDark).toBe(true);
    });

    it('should cleanup event listeners on unmount', () => {
      const { unmount } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      unmount();

      expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should handle legacy addListener API', () => {
      matchMediaMock.addEventListener = undefined;
      localStorageMock.getItem.mockReturnValue(null);

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(matchMediaMock.addListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe('Error handling', () => {
    it('should handle localStorage read errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe('light');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle matchMedia errors gracefully', () => {
      global.matchMedia = vi.fn(() => {
        throw new Error('matchMedia not supported');
      });
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.isSystemDark).toBe(false);
    });
  });
});
