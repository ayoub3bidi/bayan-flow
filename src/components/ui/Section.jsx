/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

function Section({ children, className = '', id }) {
  return (
    <section id={id} className={`py-20 md:py-32 ${className}`}>
      {children}
    </section>
  );
}

export default Section;
