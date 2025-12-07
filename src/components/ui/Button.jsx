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
  const baseClasses = 'inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-base transition-all duration-200 min-h-touch';
  
  const variants = {
    primary: 'bg-theme-primary hover:bg-theme-primary-hover text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-surface hover:bg-surface-elevated text-text-primary border-2 border-border-hover',
    ghost: 'bg-transparent hover:bg-surface-elevated text-text-primary',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${className}`;
  
  const MotionComponent = motion.button;
  
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
