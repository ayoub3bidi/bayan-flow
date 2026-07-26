/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { getChromeTransition } from '../../motion/chromeMotion';

function AnimatedDots({ dots, colorClass, side }) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, margin: '-10%' });

  const staticDot = { opacity: 0.4, scale: 1 };
  const pulseDot = { opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] };

  return (
    <div ref={containerRef} className="absolute inset-0">
      {dots.map((dot, i) => (
        <motion.div
          key={`${side}-dot-${i}`}
          className={`absolute w-1 h-1 ${colorClass} rounded-full`}
          style={dot.style}
          animate={reduceMotion ? staticDot : isInView ? pulseDot : staticDot}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 3 + i * 0.5,
                  repeat: isInView ? Infinity : 0,
                  delay: i * (side === 'left' ? 0.3 : 0.4),
                }
          }
        />
      ))}
    </div>
  );
}

const LEFT_DOTS = [...Array(8)].map((_, i) => ({
  style: {
    left: `${20 + (i % 3) * 30}%`,
    top: `${10 + i * 12}%`,
  },
}));

const RIGHT_DOTS = [...Array(8)].map((_, i) => ({
  style: {
    right: `${20 + (i % 3) * 30}%`,
    top: `${15 + i * 12}%`,
  },
}));

function TechPattern() {
  const reduceMotion = useReducedMotion();
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const leftInView = useInView(leftRef, { once: true, margin: '-10%' });
  const rightInView = useInView(rightRef, { once: true, margin: '-10%' });

  const sideEnter = visible => ({
    initial: { opacity: reduceMotion ? 0.15 : 0, x: 0 },
    animate: { opacity: visible ? 0.15 : 0, x: 0 },
    transition: getChromeTransition(reduceMotion, 0.8),
  });

  return (
    <>
      {/* Left side pattern */}
      <motion.div
        ref={leftRef}
        {...sideEnter(leftInView || reduceMotion)}
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

        <AnimatedDots
          dots={LEFT_DOTS}
          colorClass="bg-theme-primary"
          side="left"
        />
      </motion.div>

      {/* Right side pattern */}
      <motion.div
        ref={rightRef}
        {...sideEnter(rightInView || reduceMotion)}
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

        <AnimatedDots dots={RIGHT_DOTS} colorClass="bg-accent" side="right" />
      </motion.div>
    </>
  );
}

export default TechPattern;
