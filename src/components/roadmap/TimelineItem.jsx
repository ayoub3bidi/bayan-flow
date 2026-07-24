/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Lightning, Sparkle } from '@phosphor-icons/react';
import YouTubeFacade from '../YouTubeFacade';
import { extractYoutubeVideoId } from '../../utils/youtubeVideoId';
import {
  marketingEnter,
  HOVER_SPRING,
  getChromeTransition,
  CHROME_DURATION_MARKETING,
  ENTER_Y,
} from '../../motion/chromeMotion';

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
  const reduceMotion = useReducedMotion();
  const isLeft = position === 'left';
  const slideX = isLeft ? -16 : 16;
  const enter = marketingEnter(reduceMotion, index * 0.05);

  // Status-based styling
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      badge: t('roadmap.status.completed'),
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      accentColor: 'bg-emerald-500',
      dotColor: 'bg-emerald-500',
      opacity: 'opacity-100',
      borderStyle: 'border-solid',
      glowColor: 'from-emerald-500 to-teal-500',
    },
    'in-progress': {
      icon: Lightning,
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
      icon: Sparkle,
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
  const youtubeVideoId = extractYoutubeVideoId(videoUrl);

  const itemInitial = reduceMotion
    ? { opacity: 1, y: 0, x: 0 }
    : { ...enter.initial, x: slideX };
  const itemWhileInView = reduceMotion
    ? { opacity: 1, y: 0, x: 0 }
    : { ...enter.whileInView, x: 0 };

  return (
    <motion.div
      className="relative grid md:grid-cols-2 gap-8 md:gap-12 mb-16 md:mb-20"
      initial={itemInitial}
      whileInView={itemWhileInView}
      viewport={{ once: true, margin: '-100px' }}
      transition={enter.transition}
    >
      {/* Content - Left side for left items, right side for right items */}
      <div className={`${isLeft ? 'md:col-start-1' : 'md:col-start-2'}`}>
        <motion.div
          className={`group relative bg-(--color-glass-bg) backdrop-blur-xl border ${config.borderStyle} border-white/10 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${config.opacity}`}
          whileHover={{
            y: -8,
            transition: HOVER_SPRING,
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
              transition={getChromeTransition(reduceMotion, 0.6)}
            />
          </div>

          {/* Pulsing animation for in-progress items */}
          {config.pulse && (
            <motion.div
              className={`absolute inset-0 rounded-2xl bg-linear-to-br ${config.glowColor} opacity-10`}
              animate={
                reduceMotion
                  ? { opacity: 0.1, scale: 1 }
                  : { opacity: [0.1, 0.2, 0.1], scale: [1, 1.02, 1] }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
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
                <StatusIcon weight="bold" className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{config.badge}</span>
              </div>
            </div>

            {/* Title with icon */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                className={`w-10 h-10 ${config.accentColor} rounded-xl flex items-center justify-center shadow-md`}
                initial={{ scale: reduceMotion ? 1 : 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={getChromeTransition(
                  reduceMotion,
                  CHROME_DURATION_MARKETING
                )}
                whileHover={{
                  scale: 1.1,
                  transition: HOVER_SPRING,
                }}
              >
                <StatusIcon weight="bold" className="w-5 h-5 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-text-primary">{title}</h3>
            </div>

            {/* Description */}
            <p className="text-text-secondary leading-relaxed mb-4">
              {description}
            </p>

            {/* Optional YouTube Embed */}
            {youtubeVideoId && (
              <motion.div
                className="relative w-full aspect-video rounded-lg overflow-hidden mt-4 shadow-lg"
                initial={{
                  opacity: reduceMotion ? 1 : 0,
                  y: reduceMotion ? 0 : ENTER_Y,
                }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={getChromeTransition(
                  reduceMotion,
                  CHROME_DURATION_MARKETING
                )}
              >
                <YouTubeFacade
                  videoId={youtubeVideoId}
                  title={title}
                  className="rounded-lg"
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Dot on the timeline - Always in the center on desktop */}
      <motion.div
        className={`hidden md:block absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 ${config.dotColor} rounded-full border-4 border-bg z-10 shadow-lg`}
        initial={{ scale: reduceMotion ? 1 : 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={getChromeTransition(
          reduceMotion,
          CHROME_DURATION_MARKETING
        )}
      >
        {/* Pulsing ring for in-progress */}
        {config.pulse && (
          <motion.div
            className={`absolute inset-0 ${config.dotColor} rounded-full`}
            animate={
              reduceMotion
                ? { scale: 1, opacity: 0.5 }
                : { scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          />
        )}
      </motion.div>
    </motion.div>
  );
}

export default TimelineItem;
