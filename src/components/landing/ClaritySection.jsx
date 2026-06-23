/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import YouTubeFacade from '../YouTubeFacade';

const Container = ({ children }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
);

const Section = ({ children }) => (
  <section className="py-16 md:py-24">{children}</section>
);

function ClaritySection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  useInView(sectionRef, { once: true, margin: '-100px' });

  const YOUTUBE_VIDEO_ID = 'ZwcT68ZRD0U';
  const videoTitle = t('landing.clarity.videoTitle', {
    defaultValue: 'Product Demo Video',
  });

  return (
    <Section>
      <Container>
        <div
          className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
          ref={sectionRef}
        >
          <motion.div
            className="lg:w-2/5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('landing.clarity.heading') || 'Crystal Clear Insights'}
            </h2>
            <p className="text-lg text-text-secondary">
              {t('landing.clarity.description') ||
                'Experience unparalleled clarity in your workflow'}
            </p>
          </motion.div>

          <motion.div
            className="lg:w-3/5 w-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative group">
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 opacity-75 blur-xl group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative bg-gray-900 rounded-3xl p-1">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                    <YouTubeFacade
                      videoId={YOUTUBE_VIDEO_ID}
                      title={videoTitle}
                      embedParams="modestbranding=1"
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              <motion.div
                className="absolute -top-8 -right-8 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl pointer-events-none"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.5,
                }}
              />
              <motion.div
                className="absolute top-1/2 -right-12 w-24 h-24 bg-pink-500/30 rounded-full blur-3xl pointer-events-none"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.25, 0.55, 0.25],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 3,
                }}
              />

              <motion.div
                className="absolute -top-4 left-1/4 w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  y: [-10, 10, -10],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute -bottom-2 right-1/3 w-3 h-3 bg-purple-400 rounded-full"
                animate={{
                  y: [10, -10, 10],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}

export default ClaritySection;
