/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { Children, cloneElement, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const POSITION_CLASSES = {
  bottom: {
    center: 'top-full mt-2 left-1/2 -translate-x-1/2',
    start: 'top-full mt-2 start-0',
    end: 'top-full mt-2 end-0',
  },
  top: {
    center: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    start: 'bottom-full mb-2 start-0',
    end: 'bottom-full mb-2 end-0',
  },
};

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {React.ReactElement} props.children
 * @param {'top' | 'bottom'} [props.side]
 * @param {'start' | 'center' | 'end'} [props.align]
 * @param {number} [props.delay]
 */
function Tooltip({
  label,
  children,
  side = 'bottom',
  align = 'center',
  delay = 300,
}) {
  const tooltipId = useId();
  const showTimeoutRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  const clearShowTimeout = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  };

  const show = (immediate = false) => {
    clearShowTimeout();
    if (immediate || delay <= 0) {
      setVisible(true);
      return;
    }
    showTimeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearShowTimeout();
    setVisible(false);
  };

  const child = Children.only(children);
  const motionOffset = side === 'bottom' ? -6 : 6;

  return (
    <span className="relative inline-flex">
      {cloneElement(child, {
        onMouseEnter: event => {
          child.props.onMouseEnter?.(event);
          show(false);
        },
        onMouseLeave: event => {
          child.props.onMouseLeave?.(event);
          hide();
        },
        onFocus: event => {
          child.props.onFocus?.(event);
          show(true);
        },
        onBlur: event => {
          child.props.onBlur?.(event);
          hide();
        },
        'aria-describedby': visible
          ? tooltipId
          : child.props['aria-describedby'],
      })}

      <AnimatePresence>
        {visible && (
          <motion.span
            id={tooltipId}
            role="tooltip"
            initial={
              reduceMotion
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: motionOffset, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: motionOffset, scale: 0.96 }
            }
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-none absolute z-[100] max-w-xs whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-lg border border-white/10 bg-zinc-900/95 text-white backdrop-blur-sm dark:bg-zinc-100/95 dark:text-zinc-900 dark:border-zinc-900/10 ${POSITION_CLASSES[side][align]}`}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export default Tooltip;
