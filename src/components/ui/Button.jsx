/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Button({
  children,
  variant = 'primary',
  to,
  href,
  onClick,
  className = '',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-base transition-all duration-200 min-h-touch';

  const variants = {
    primary:
      'bg-theme-primary hover:bg-theme-primary-hover text-white shadow-lg hover:shadow-xl',
    secondary:
      'bg-surface hover:bg-surface-elevated text-text-primary border-2 border-border-hover',
    ghost: 'bg-transparent hover:bg-surface-elevated text-text-primary',
    cta: 'relative bg-transparent p-0 overflow-visible shadow-none', // Special handling for CTA
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  const MotionComponent = motion.button;

  // Render CTA variant with animated border
  if (variant === 'cta') {
    const content = (
      <MotionComponent
        className="relative inline-flex h-12 active:scale-95 transition-transform overflow-hidden rounded-lg p-px focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onClick={onClick}
        {...props}
      >
        {/* Spinning gradient border */}
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#2b7fff_0%,#0ea5e9_50%,#2b7fff_100%)]" />

        {/* Button content */}
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 dark:bg-slate-950 px-7 text-sm font-medium text-white backdrop-blur-3xl gap-2">
          {children}
        </span>
      </MotionComponent>
    );

    if (to) {
      return <Link to={to}>{content}</Link>;
    }
    if (href) {
      return <a href={href}>{content}</a>;
    }
    return content;
  }

  // Render standard variants
  if (to) {
    return (
      <Link to={to}>
        <MotionComponent
          className={classes}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          {...props}
        >
          {children}
        </MotionComponent>
      </Link>
    );
  }

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <MotionComponent
      className={classes}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

export default Button;
