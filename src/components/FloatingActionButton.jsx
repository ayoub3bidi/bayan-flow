/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

import { motion } from 'framer-motion';
import { Code } from 'lucide-react';

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
        fixed right-6 top-1/2 -translate-y-1/2 z-50
        w-14 h-14 bg-blue-600 hover:bg-blue-700 
        disabled:bg-disabled-bg disabled:cursor-not-allowed
        text-white rounded-full shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      aria-label="View Python code"
      title="View Python code"
    >
      <Code size={24} />
    </motion.button>
  );
}

export default FloatingActionButton;
