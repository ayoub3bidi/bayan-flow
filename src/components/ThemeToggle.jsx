import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeToggle Component
 * Accessible toggle button for switching between light and dark themes
 *
 * @param {Object} props
 * @param {string} props.theme - Current theme ('light' or 'dark')
 * @param {Function} props.onToggle - Callback function to toggle theme
 * @param {string} [props.className] - Additional CSS classes
 */
function ThemeToggle({ theme, onToggle, className = '' }) {
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={onToggle}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-surface border-2 border-gray-200 hover:border-gray-200-hover transition-colors focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 focus:ring-offset-bg ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      role="switch"
      aria-checked={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          rotate: isDark ? 90 : 0,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="absolute"
      >
        <Sun size={20} className="text-text-primary" aria-hidden="true" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          rotate: isDark ? 0 : -90,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="absolute"
      >
        <Moon size={20} className="text-text-primary" aria-hidden="true" />
      </motion.div>

      {/* Screen reader only text */}
      <span className="sr-only">
        {isDark ? 'Dark mode active' : 'Light mode active'}
      </span>
    </motion.button>
  );
}

export default ThemeToggle;
