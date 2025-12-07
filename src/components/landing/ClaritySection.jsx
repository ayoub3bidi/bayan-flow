/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Container from '../ui/Container';
import Section from '../ui/Section';

function ClaritySection() {
  const { t } = useTranslation();

  return (
    <Section>
      <Container>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text Content */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="landing-h2 text-text-primary mb-6">
              {t('landing.clarity.heading')}
            </h2>
            <p className="landing-body text-text-secondary">
              {t('landing.clarity.description')}
            </p>
          </motion.div>

          {/* Screenshot Placeholder with Floating Card Design */}
          <motion.div
            className="flex-1 w-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              {/* Glass morphism card */}
              <div className="relative bg-[var(--color-glass-bg)] backdrop-blur-lg border border-[var(--color-glass-border)] rounded-2xl p-8 shadow-2xl">
                {/* TODO: Replace with actual screenshot */}
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <p className="text-text-secondary text-sm">
                    Screenshot Placeholder
                  </p>
                </div>
              </div>

              {/* Floating accent elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-theme-primary/20 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 5,
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
