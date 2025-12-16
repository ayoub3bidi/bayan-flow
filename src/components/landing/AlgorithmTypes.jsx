/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, Route } from 'lucide-react';
import Container from '../ui/Container';
import Section from '../ui/Section';

function AlgorithmTypes() {
  const { t } = useTranslation();

  const modes = [
    {
      icon: ArrowUpDown,
      title: t('landing.algorithmTypes.sorting.title'),
      description: t('landing.algorithmTypes.sorting.description'),
      algorithms: t('landing.algorithmTypes.sorting.algorithms'),
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    },
    {
      icon: Route,
      title: t('landing.algorithmTypes.pathfinding.title'),
      description: t('landing.algorithmTypes.pathfinding.description'),
      algorithms: t('landing.algorithmTypes.pathfinding.algorithms'),
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
    },
  ];

  return (
    <Section className="relative overflow-hidden">
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="landing-h2 text-text-primary mb-4">
            {t('landing.algorithmTypes.heading')}
          </h2>
          <p className="landing-body text-text-secondary max-w-2xl mx-auto">
            {t('landing.algorithmTypes.subheading')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {modes.map((mode, index) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
              whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                type: 'spring',
                stiffness: 100,
              }}
              whileHover={{
                scale: 1.02,
                transition: { type: 'spring', stiffness: 300 },
              }}
              className="group relative"
              style={{ perspective: '1000px' }}
            >
              {/* Glass morphism card */}
              <div className="relative bg-(--color-glass-bg) backdrop-blur-xl p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10 dark:border-white/5 h-full overflow-hidden">
                {/* Gradient glow on hover */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${mode.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Animated border glow */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-linear-to-br ${mode.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`}
                />

                <div className="relative">
                  {/* Gradient Icon Background with rotation */}
                  <motion.div
                    className={`inline-flex p-4 rounded-2xl bg-linear-to-br ${mode.gradient} mb-6 shadow-lg`}
                    whileHover={{
                      rotate: [0, -10, 10, -5, 5, 0],
                      scale: 1.1,
                      transition: { duration: 0.5 },
                    }}
                  >
                    <mode.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    {mode.title}
                  </h3>
                  <p className="text-text-secondary mb-4 leading-relaxed">
                    {mode.description}
                  </p>

                  {/* Algorithms */}
                  <div className="pt-4 border-t border-white/10 dark:border-white/5">
                    <p className="text-sm font-semibold text-text-secondary mb-2">
                      {t('landing.algorithmTypes.available')}
                    </p>
                    <p className="text-sm text-text-primary">
                      {mode.algorithms}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default AlgorithmTypes;
