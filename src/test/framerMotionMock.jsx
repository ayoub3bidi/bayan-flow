/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { vi } from 'vitest';

const MOTION_PROP_KEYS = new Set([
  'whileHover',
  'whileTap',
  'whileInView',
  'whileFocus',
  'whileDrag',
  'animate',
  'initial',
  'exit',
  'variants',
  'transition',
  'layout',
  'layoutId',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'onAnimationStart',
  'onAnimationComplete',
  'onUpdate',
  'custom',
  'inherit',
  'viewport',
  'onViewportEnter',
  'onViewportLeave',
]);

export function stripMotionProps(props) {
  const domProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (MOTION_PROP_KEYS.has(key) || key.startsWith('while')) {
      continue;
    }
    domProps[key] = value;
  }
  return domProps;
}

function createMotionComponent(tag) {
  return function MotionComponent({ children, ...props }) {
    const Tag = tag;
    return <Tag {...stripMotionProps(props)}>{children}</Tag>;
  };
}

const MOTION_TAGS = [
  'div',
  'button',
  'a',
  'span',
  'section',
  'article',
  'ul',
  'li',
  'ol',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'nav',
  'header',
  'footer',
  'main',
  'aside',
  'form',
  'input',
  'label',
  'svg',
  'path',
  'g',
  'circle',
  'rect',
  'line',
  'img',
  'video',
  'iframe',
];

export function createFramerMotionMock(overrides = {}) {
  const motion = {};
  for (const tag of MOTION_TAGS) {
    motion[tag] = createMotionComponent(tag);
  }

  return {
    motion: { ...motion, ...overrides.motion },
    AnimatePresence: ({ children }) => <>{children}</>,
    useInView: () => true,
    useAnimation: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    }),
    useMotionValue: initial => ({ get: () => initial, set: vi.fn() }),
    useTransform: () => ({ get: () => 0 }),
    ...overrides,
  };
}
