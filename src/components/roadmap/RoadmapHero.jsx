/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import Container from '../ui/Container';
import { isProductionMainBranch } from '../../utils/deployContext';
import { marketingEnter, getChromeTransition } from '../../motion/chromeMotion';

function RoadmapHero() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
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
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={getChromeTransition(reduceMotion, 0.4)}
        >
          {/* Title with gradient text effect */}
          <motion.h1
            className="landing-h1 text-text-primary mb-6"
            {...marketingEnter(reduceMotion, 0.2)}
            style={{
              textShadow: '0 0 40px rgba(43, 127, 255, 0.3)',
            }}
          >
            {t('roadmap.hero.title')}
          </motion.h1>

          {/* Subtitle with stagger animation */}
          <motion.p
            className="landing-body text-text-secondary"
            {...marketingEnter(reduceMotion, 0.4)}
          >
            {t('roadmap.hero.subtitle')}
          </motion.p>

          {/* Dev version and feedback note — production (main) only */}
          {showDevFeedbackNote && (
            <motion.p
              className="landing-body text-text-secondary text-sm mt-4"
              {...marketingEnter(reduceMotion, 0.5)}
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
