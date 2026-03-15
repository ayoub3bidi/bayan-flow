/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * A collapsible section used inside AlgorithmInsightPanel.
 *
 * @param {Object}    props
 * @param {string}    props.title     - Section heading text
 * @param {ReactNode} props.children  - Section body content
 * @param {boolean}   [props.defaultOpen=true] - Whether the section is open initially
 */
function AlgorithmInsightSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-panel-border rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-panel-hover hover:bg-panel-border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-primary tracking-wide uppercase">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-secondary flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 text-sm text-secondary leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AlgorithmInsightSection;
