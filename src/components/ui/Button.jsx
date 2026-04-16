/**
 * Copyright (c) 2025 Bayan Flow
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

  // Render CTA variant with modern professional design
  if (variant === 'cta') {
    const content = (
      <MotionComponent
        className="relative inline-flex h-12 active:scale-[0.98] transition-all duration-200 overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary/50 focus:ring-offset-2 focus:ring-offset-transparent group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onClick={onClick}
        {...props}
      >
        {/* Light mode: solid background | Dark mode: premium gradient */}
        <span className="absolute inset-0 bg-theme-primary shadow-lg group-hover:shadow-xl transition-shadow duration-200 dark:bg-gradient-to-br dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 dark:shadow-blue-500/25 dark:group-hover:shadow-blue-500/40" />

        {/* Border for clear button definition */}
        <span className="absolute inset-0 rounded-xl border-2 border-white/20 dark:border-white/30" />

        {/* Subtle inner glow - only on actual hover */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl dark:from-white/15 dark:via-white/20 dark:to-transparent" />

        {/* Shimmer effect - only on actual hover */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out rounded-xl dark:via-white/30" />

        {/* Button content */}
        <span className="relative inline-flex h-full w-full cursor-pointer items-center justify-center px-7 text-sm font-semibold text-white gap-2 antialiased">
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
