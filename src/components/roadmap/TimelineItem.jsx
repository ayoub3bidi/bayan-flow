/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Zap, Sparkles } from 'lucide-react';

function TimelineItem({
  date,
  title,
  description,
  videoUrl,
  status,
  position,
  index,
}) {
  const { t } = useTranslation();
  const isLeft = position === 'left';

  // Status-based styling
  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      badge: t('roadmap.status.completed'),
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      accentColor: 'bg-emerald-500',
      dotColor: 'bg-emerald-500',
      opacity: 'opacity-100',
      borderStyle: 'border-solid',
      glowColor: 'from-emerald-500 to-teal-500',
    },
    'in-progress': {
      icon: Zap,
      badge: t('roadmap.status.inProgress'),
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      accentColor: 'bg-amber-500',
      dotColor: 'bg-amber-500',
      opacity: 'opacity-100',
      borderStyle: 'border-solid',
      glowColor: 'from-amber-500 to-orange-500',
      pulse: true,
    },
    planned: {
      icon: Sparkles,
      badge: t('roadmap.status.planned'),
      badgeColor: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      accentColor: 'bg-sky-500',
      dotColor: 'bg-sky-500/60',
      opacity: 'opacity-60',
      borderStyle: 'border-dashed',
      glowColor: 'from-sky-500 to-blue-500',
    },
  };

  const config = statusConfig[status] || statusConfig.planned;
  const StatusIcon = config.icon;

  return (
    <motion.div
      className="relative grid md:grid-cols-2 gap-8 md:gap-12 mb-16 md:mb-20"
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Content - Left side for left items, right side for right items */}
      <div className={`${isLeft ? 'md:col-start-1' : 'md:col-start-2'}`}>
        <motion.div
          className={`group relative bg-(--color-glass-bg) backdrop-blur-xl border ${config.borderStyle} border-white/10 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${config.opacity}`}
          whileHover={{
            y: -8,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
          }}
        >
          {/* Gradient glow on hover */}
          <div
            className={`absolute inset-0 bg-linear-to-br ${config.glowColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
          />

          {/* Animated border glow */}
          <div
            className={`absolute inset-0 rounded-2xl bg-linear-to-br ${config.glowColor} opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300 -z-10`}
          />

          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          </div>

          {/* Pulsing animation for in-progress items */}
          {config.pulse && (
            <motion.div
              className={`absolute inset-0 rounded-2xl bg-linear-to-br ${config.glowColor} opacity-10`}
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          <div className="relative">
            {/* Date Label with Status Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center px-3 py-1 bg-theme-primary-light rounded-full">
                <span className="text-sm font-semibold text-theme-primary">
                  {date}
                </span>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.badgeColor}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{config.badge}</span>
              </div>
            </div>

            {/* Title with animated icon */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                className={`w-10 h-10 ${config.accentColor} rounded-xl flex items-center justify-center shadow-md`}
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: index * 0.1 + 0.2,
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -10, 10, -10, 0],
                  transition: { duration: 0.5 },
                }}
              >
                <StatusIcon className="w-5 h-5 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-text-primary">{title}</h3>
            </div>

            {/* Description */}
            <p className="text-text-secondary leading-relaxed mb-4">
              {description}
            </p>

            {/* Optional YouTube Embed */}
            {videoUrl && (
              <motion.div
                className="relative w-full aspect-video rounded-lg overflow-hidden mt-4 shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <iframe
                  src={videoUrl}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Dot on the timeline - Always in the center on desktop */}
      <motion.div
        className={`hidden md:block absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 ${config.dotColor} rounded-full border-4 border-bg z-10 shadow-lg`}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
          delay: index * 0.1,
        }}
      >
        {/* Pulsing ring for in-progress */}
        {config.pulse && (
          <motion.div
            className={`absolute inset-0 ${config.dotColor} rounded-full`}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

export default TimelineItem;
