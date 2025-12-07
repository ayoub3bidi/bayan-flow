/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sliders, Code, Volume2, Maximize } from 'lucide-react';
import Container from '../ui/Container';
import Section from '../ui/Section';

function Features() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Sliders,
      title: t('landing.features.customization.title'),
      description: t('landing.features.customization.description'),
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Code,
      title: t('landing.features.pythonCode.title'),
      description: t('landing.features.pythonCode.description'),
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Volume2,
      title: t('landing.features.sound.title'),
      description: t('landing.features.sound.description'),
      gradient: 'from-rose-500 to-pink-500',
      // badge: t('landing.features.sound.badge'),
    },
    {
      icon: Maximize,
      title: t('landing.features.fullscreen.title'),
      description: t('landing.features.fullscreen.description'),
      gradient: 'from-indigo-500 to-purple-500',
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
            {t('landing.features.heading')}
          </h2>
          <p className="landing-body text-text-secondary max-w-2xl mx-auto">
            {t('landing.features.subheading')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Glass morphism card */}
              <div className="relative bg-[var(--color-glass-bg)] backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 dark:border-white/5 h-full overflow-hidden">
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Animated border glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300 -z-10`} />

                <div className="relative">
                  {/* Icon with gradient */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title with optional badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-text-primary">
                      {feature.title}
                    </h3>
                    {feature.badge && (
                      <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded-full">
                        {feature.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default Features;
