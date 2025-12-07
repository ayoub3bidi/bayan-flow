/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import Container from '../ui/Container';
import TimelineItem from './TimelineItem';

function Timeline({ items }) {
  return (
    <section className="relative py-20 bg-surface">
      <Container>
        {/* Vertical Timeline Spine */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-theme-primary via-accent to-theme-primary opacity-30" />

        {/* Timeline Items */}
        <div className="relative">
          {items.map((item, index) => (
            <TimelineItem
              key={index}
              {...item}
              position={index % 2 === 0 ? 'left' : 'right'}
              index={index}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Timeline;
