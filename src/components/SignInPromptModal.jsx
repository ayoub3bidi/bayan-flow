/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useTranslation } from 'react-i18next';
import { GoogleLogo } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

function SignInPromptModal({ feature, isOpen, onClose }) {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const featureLabel = t(`featureGate.${feature}`, { defaultValue: feature });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={t('featureGate.title', { feature: featureLabel })}
        >
          <motion.div
            className="bg-surface rounded-2xl shadow-2xl max-w-md w-full p-8"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              {t('featureGate.title', { feature: featureLabel })}
            </h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              {t('featureGate.description', { feature: featureLabel })}
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-xl border border-gray-300 font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98]"
              >
                <GoogleLogo size={22} weight="bold" />
                {t('featureGate.signIn')}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full px-6 py-3 text-text-secondary hover:text-text-primary rounded-xl font-medium transition-all duration-200 hover:bg-surface-elevated active:scale-[0.98]"
              >
                {t('featureGate.dismiss')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SignInPromptModal;
