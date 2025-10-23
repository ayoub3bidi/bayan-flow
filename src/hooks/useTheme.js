import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContextDefinition';

/**
 * Custom hook for accessing theme context
 * @returns {Object} Theme state and control functions
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
