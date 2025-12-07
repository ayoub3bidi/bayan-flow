/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';

function TimelineItem({ date, title, description, videoUrl, position, index }) {
  const isLeft = position === 'left';

  return (
    <motion.div
      className="relative grid md:grid-cols-2 gap-8 md:gap-12 mb-16 md:mb-20"
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Content - Left side for left items, right side for right items */}
      <div className={`${isLeft ? 'md:col-start-1 md:text-right' : 'md:col-start-2'}`}>
        <div className="bg-surface-elevated border border-border rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
          {/* Date Label */}
          <div className="inline-flex items-center px-3 py-1 bg-theme-primary-light rounded-full mb-4">
            <span className="text-sm font-semibold text-theme-primary">
              {date}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-text-primary mb-3">
            {title}
          </h3>

          {/* Description */}
          <p className="text-text-secondary leading-relaxed mb-4">
            {description}
          </p>

          {/* Optional YouTube Embed */}
          {videoUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mt-4">
              <iframe
                src={videoUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Dot on the timeline - Always in the center on desktop */}
      <div className={`hidden md:block absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-theme-primary rounded-full border-4 border-bg z-10`} />
    </motion.div>
  );
}

export default TimelineItem;
