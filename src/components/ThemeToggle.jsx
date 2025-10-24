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
 * @param {string} props.theme - Current theme ('light' or 'dark')
 * @param {Function} props.onToggle - Callback function to toggle theme
 * @param {string} [props.className] - Additional CSS classes
 */
function ThemeToggle({ theme, onToggle, className = '' }) {
  const isDark = theme === 'dark';

  return (
    <label
      className={`inline-flex items-center relative cursor-pointer ${className}`}
    >
      <input
        type="checkbox"
        checked={isDark}
        onChange={onToggle}
        className="sr-only peer"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        role="switch"
        aria-checked={isDark}
      />
      <div className="relative w-[66px] h-[36px] bg-white peer-checked:bg-zinc-700 rounded-full shadow-sm transition-colors duration-300 after:absolute after:content-[''] after:w-[28px] after:h-[28px] after:bg-gradient-to-r after:from-orange-500 after:to-yellow-400 peer-checked:after:from-zinc-900 peer-checked:after:to-zinc-900 after:rounded-full after:top-[4px] after:left-[4px] after:shadow-md after:transition-all after:duration-300 peer-checked:after:translate-x-[30px]"></div>
      <motion.svg
        initial={false}
        animate={{
          opacity: isDark ? 0.6 : 1,
          scale: isDark ? 0.9 : 1,
        }}
        transition={{ duration: 0.3 }}
        viewBox="0 0 24 24"
        className="fill-white absolute w-4 h-4 left-[10px] pointer-events-none"
        aria-hidden="true"
      >
        <path d="M12,17c-2.76,0-5-2.24-5-5s2.24-5,5-5,5,2.24,5,5-2.24,5-5,5ZM13,0h-2V5h2V0Zm0,19h-2v5h2v-5ZM5,11H0v2H5v-2Zm19,0h-5v2h5v-2Zm-2.81-6.78l-1.41-1.41-3.54,3.54,1.41,1.41,3.54-3.54ZM7.76,17.66l-1.41-1.41-3.54,3.54,1.41,1.41,3.54-3.54Zm0-11.31l-3.54-3.54-1.41,1.41,3.54,3.54,1.41-1.41Zm13.44,13.44l-3.54-3.54-1.41,1.41,3.54,3.54,1.41-1.41Z" />
      </motion.svg>
      <motion.svg
        initial={false}
        animate={{
          opacity: isDark ? 0.9 : 0.6,
          scale: isDark ? 1 : 0.9,
        }}
        transition={{ duration: 0.3 }}
        viewBox="0 0 24 24"
        className="fill-zinc-800 peer-checked:fill-white absolute w-4 h-4 right-[10px] pointer-events-none"
        aria-hidden="true"
      >
        <path d="M12.009,24A12.067,12.067,0,0,1,.075,10.725,12.121,12.121,0,0,1,10.1.152a13,13,0,0,1,5.03.206,2.5,2.5,0,0,1,1.8,1.8,2.47,2.47,0,0,1-.7,2.425c-4.559,4.168-4.165,10.645.807,14.412h0a2.5,2.5,0,0,1-.7,4.319A13.875,13.875,0,0,1,12.009,24Zm.074-22a10.776,10.776,0,0,0-1.675.127,10.1,10.1,0,0,0-8.344,8.8A9.928,9.928,0,0,0,4.581,18.7a10.473,10.473,0,0,0,11.093,2.734.5.5,0,0,0,.138-.856h0C9.883,16.1,9.417,8.087,14.865,3.124a.459.459,0,0,0,.127-.465.491.491,0,0,0-.356-.362A10.68,10.68,0,0,0,12.083,2ZM20.5,12a1,1,0,0,1-.97-.757l-.358-1.43L17.74,9.428a1,1,0,0,1,.035-1.94l1.4-.325.351-1.406a1,1,0,0,1,1.94,0l.355,1.418,1.418.355a1,1,0,0,1,0,1.94l-1.418.355-.355,1.418A1,1,0,0,1,20.5,12ZM16,14a1,1,0,0,0,2,0A1,1,0,0,0,16,14Zm6,4a1,1,0,0,0,2,0A1,1,0,0,0,22,18Z" />
      </motion.svg>

      <span className="sr-only">
        {isDark ? 'Dark mode active' : 'Light mode active'}
      </span>
    </label>
  );
}

export default ThemeToggle;
