/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import Container from '../ui/Container';
import TimelineItem from './TimelineItem';
import { roadmapData } from '../../data/roadmapData';

function Timeline() {
  return (
    <section className="relative py-20 bg-surface overflow-visible">
      {/* Simple Vertical Timeline Line - starts from first item, fades to dots */}
      <div
        className="hidden md:block absolute left-1/2 transform -translate-x-1/2 pointer-events-none z-0"
        style={{ top: '140px', bottom: '180px', width: '2px' }}
      >
        {/* Animated line that draws in */}
        <motion.div
          className="absolute inset-0 w-0.5 bg-linear-to-b from-blue-500 via-purple-500 to-transparent opacity-40"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ transformOrigin: 'top' }}
        />
        {/* Subtle glow effect */}
        <motion.div
          className="absolute inset-0 w-0.5 bg-linear-to-b from-blue-400 via-purple-400 to-transparent blur-sm"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <Container>
        {/* Timeline Items */}
        <div className="relative">
          {roadmapData.map((item, index) => (
            <TimelineItem
              key={item.id}
              {...item}
              position={index % 2 === 0 ? 'left' : 'right'}
              index={index}
            />
          ))}
        </div>

        {/* Animated "Future" Dots at the End */}
        <motion.div
          className="relative flex justify-center items-center h-32 mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-linear-to-br from-blue-500 to-purple-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <motion.p
            className="absolute -bottom-6 text-sm text-text-tertiary italic"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            The journey continues...
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}

export default Timeline;
