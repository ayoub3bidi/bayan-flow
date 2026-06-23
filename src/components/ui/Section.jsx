/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

function Section({ children, className = '' }) {
  return (
    <section className={`py-20 md:py-32 ${className}`}>{children}</section>
  );
}

export default Section;
