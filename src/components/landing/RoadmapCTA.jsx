/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import Section from '../ui/Section';

function RoadmapCTA() {
  const { t } = useTranslation();

  return (
    <Section className="relative overflow-hidden">
      {/* Gradient transition to footer background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-glass-bg)]/30 to-[var(--color-glass-bg)] pointer-events-none" />
      
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
          className="relative overflow-hidden"
        >
          {/* Background Gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-theme-primary/10 via-accent/5 to-transparent rounded-3xl"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{ backgroundSize: '200% 200%' }}
          />
          
          {/* Decorative Elements */}
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-theme-primary/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Content */}
          <div className="relative px-8 py-12 md:px-12 md:py-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-theme-primary/10 text-theme-primary rounded-full text-sm font-semibold mb-6"
            >
              <Sparkles size={16} />
              {t('landing.roadmapCTA.badge')}
            </motion.div>

            <h2 className="landing-h2 text-text-primary mb-4">
              {t('landing.roadmapCTA.heading')}
            </h2>
            <p className="landing-body text-text-secondary max-w-2xl mx-auto mb-8">
              {t('landing.roadmapCTA.description')}
            </p>

            <Link to="/roadmap">
              <motion.button
                className="relative inline-flex items-center gap-2 px-8 py-4 bg-theme-primary hover:bg-theme-primary-hover text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative">{t('landing.roadmapCTA.button')}</span>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}

export default RoadmapCTA;
