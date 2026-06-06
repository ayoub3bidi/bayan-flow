/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import Container from '../ui/Container';
import { isProductionMainBranch } from '../../utils/deployContext';

function RoadmapHero() {
  const { t } = useTranslation();
  const showDevFeedbackNote = isProductionMainBranch();

  return (
    <section
      data-testid="roadmap-hero"
      className="relative py-20 md:py-32 bg-bg overflow-hidden"
    >
      {/* Radial gradient background - matching landing page */}
      <div className="absolute inset-0 radial-gradient-animated" />

      <Container className="relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Title with gradient text effect */}
          <motion.h1
            className="landing-h1 text-text-primary mb-6"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.2 },
              y: { duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 },
              scale: { duration: 0.8, delay: 0.2 },
            }}
            style={{
              textShadow: '0 0 40px rgba(43, 127, 255, 0.3)',
            }}
          >
            {t('roadmap.hero.title')}
          </motion.h1>

          {/* Subtitle with stagger animation */}
          <motion.p
            className="landing-body text-text-secondary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              type: 'spring',
              stiffness: 100,
            }}
          >
            {t('roadmap.hero.subtitle')}
          </motion.p>

          {/* Dev version and feedback note — production (main) only */}
          {showDevFeedbackNote && (
            <motion.p
              className="landing-body text-text-secondary text-sm mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.5,
                type: 'spring',
                stiffness: 100,
              }}
            >
              <Trans
                i18nKey="roadmap.hero.devNote"
                components={[
                  <a
                    key="dev"
                    href="https://dev.bayanflow.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b82f6] dark:text-[#60a5fa] hover:underline font-medium"
                  />,
                  <a
                    key="github"
                    href="https://github.com/ayoub3bidi/bayan-flow/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b82f6] dark:text-[#60a5fa] hover:underline font-medium"
                  />,
                ]}
              />
            </motion.p>
          )}
        </motion.div>
      </Container>
    </section>
  );
}

export default RoadmapHero;
