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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Glass morphism card */}
              <div className="relative bg-[var(--color-glass-bg)] backdrop-blur-xl p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10 dark:border-white/5 h-full overflow-hidden">
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Animated border glow */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />

                <div className="relative">
                  {/* Gradient Icon Background */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${mode.gradient} mb-6 shadow-lg`}>
                    <mode.icon className="w-8 h-8 text-white" />
                  </div>

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
