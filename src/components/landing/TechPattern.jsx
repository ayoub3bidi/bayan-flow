/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function TechPattern() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in pattern after a short delay
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Left side pattern */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: isVisible ? 0.15 : 0, x: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="fixed left-0 top-0 w-96 h-full pointer-events-none z-0 overflow-hidden"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="tech-grid-left"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-theme-primary"
              />
            </pattern>
            <linearGradient id="fade-left" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#tech-grid-left)"
            opacity="0.6"
            mask="url(#fade-mask-left)"
          />
          <rect
            width="100%"
            height="100%"
            fill="url(#fade-left)"
            className="text-theme-primary"
          />
        </svg>

        {/* Animated dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`left-dot-${i}`}
            className="absolute w-1 h-1 bg-theme-primary rounded-full"
            style={{
              left: `${20 + (i % 3) * 30}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* Right side pattern */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: isVisible ? 0.15 : 0, x: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="fixed right-0 top-0 w-96 h-full pointer-events-none z-0 overflow-hidden"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="tech-grid-right"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-accent"
              />
            </pattern>
            <linearGradient id="fade-right" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#tech-grid-right)"
            opacity="0.6"
          />
          <rect
            width="100%"
            height="100%"
            fill="url(#fade-right)"
            className="text-accent"
          />
        </svg>

        {/* Animated dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`right-dot-${i}`}
            className="absolute w-1 h-1 bg-accent rounded-full"
            style={{
              right: `${20 + (i % 3) * 30}%`,
              top: `${15 + i * 12}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </motion.div>
    </>
  );
}

export default TechPattern;
