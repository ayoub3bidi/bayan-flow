/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleLogo } from '@phosphor-icons/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { trackSignInClicked } from '../services/analyticsEvents';
import {
  fadeOverlayTransition,
  modalPanelInitial,
  modalPanelAnimate,
  modalPanelExit,
  modalPanelTransition,
} from '../motion/chromeMotion';

const LEGACY_FEATURES = new Set([
  'code',
  'insight',
  'export',
  'sound',
  'fullscreen',
]);

function SignInPromptModal({ feature, isOpen, onClose, metadata = {} }) {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState(false);
  const featureLabel = t(`featureGate.${feature}`, {
    defaultValue: feature,
    ...metadata,
  });
  const isLegacyFeature = LEGACY_FEATURES.has(feature);
  const modalTitle = isLegacyFeature
    ? t('featureGate.title', { feature: featureLabel })
    : featureLabel;
  const modalDescription = isLegacyFeature
    ? t('featureGate.description', { feature: featureLabel })
    : t(`featureGate.${feature}_description`, {
        defaultValue: '',
        ...metadata,
      });
  const dialogRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) {
      setSignInError(false);
      setIsSigningIn(false);
      return;
    }

    const prevFocus = document.activeElement;
    dialogRef.current?.querySelector('button')?.focus();

    return () => {
      if (prevFocus && typeof prevFocus.focus === 'function') {
        prevFocus.focus();
      }
    };
  }, [isOpen]);

  const handleSignIn = async () => {
    trackSignInClicked('modal');
    setIsSigningIn(true);
    setSignInError(false);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setSignInError(true);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dialogRef}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeOverlayTransition(reduceMotion)}
          onClick={onClose}
          onKeyDown={e => e.key === 'Escape' && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
          tabIndex={-1}
        >
          <motion.div
            className="bg-surface rounded-2xl shadow-2xl max-w-md w-full p-8"
            initial={modalPanelInitial(reduceMotion)}
            animate={modalPanelAnimate()}
            exit={modalPanelExit(reduceMotion)}
            transition={modalPanelTransition(reduceMotion)}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              {modalTitle}
            </h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              {modalDescription}
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-xl border border-gray-300 font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <GoogleLogo size={22} weight="bold" />
                {t('featureGate.signIn')}
              </button>

              {signInError ? (
                <p
                  className="text-center text-sm text-text-secondary"
                  role="alert"
                >
                  {t('accessBan.signInUnavailable')}
                </p>
              ) : null}

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
