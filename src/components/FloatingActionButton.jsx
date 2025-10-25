/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

import { motion } from 'framer-motion';

/**
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.className - Additional CSS classes
 */
function FloatingActionButton({ onClick, disabled = false, className = '' }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        fixed right-0 top-1/2 -translate-y-1/2 z-50
        h-32 w-12 bg-blue-600 hover:bg-blue-700 
        disabled:bg-disabled-bg disabled:cursor-not-allowed
        text-white rounded-l-xl shadow-lg hover:shadow-xl
        flex flex-col items-center justify-center gap-2
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 48, opacity: 0 }}
      whileHover={{ x: disabled ? 0 : -4 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      aria-label="View Python code"
      title="View Python code"
    >
      <span className="font-medium writing-mode-vertical transform rotate-360">
        Code
      </span>
    </motion.button>
  );
}

export default FloatingActionButton;
