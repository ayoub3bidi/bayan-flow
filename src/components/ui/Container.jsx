/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

function Container({ children, className = '' }) {
  return (
    <div className={`max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

export default Container;
