/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share, CopySimple, Check, X } from '@phosphor-icons/react';
import { SiX } from 'react-icons/si';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  fadeOverlayTransition,
  modalPanelInitial,
  modalPanelAnimate,
  modalPanelExit,
  modalPanelTransition,
} from '../motion/chromeMotion';
import { generateShareCaption } from '../utils/shareCaption';

/**
 * Modal shown after video download offering to share on social media.
 * Displays an editable smart caption + platform share buttons.
 *
 * @param {boolean} open
 * @param {string} algorithmName - Display name of the algorithm (e.g. "Bubble Sort")
 * @param {Blob | null} videoBlob
 * @param {string} videoFileName
 * @param {Function} onClose - Close without sharing
 * @param {Function} onShare - Called with { platform, text } after share
 */
function ShareExportModal({
  open,
  algorithmName,
  videoBlob,
  videoFileName,
  onClose,
  onShare,
}) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const shareData = generateShareCaption(algorithmName);
  const [caption, setCaption] = useState(shareData.fullShareText);
  const [copied, setCopied] = useState(false);

  const handleNativeShare = async () => {
    if (!videoBlob) return;
    const file = new File([videoBlob], videoFileName, { type: 'video/mp4' });
    const sharePayload = {
      title: shareData.title,
      text: caption,
      files: [file],
    };

    if (navigator.share && navigator.canShare?.(sharePayload)) {
      try {
        await navigator.share(sharePayload);
        onShare?.({ platform: 'native', text: caption });
        return;
      } catch {
        // User cancelled or share failed
        return;
      }
    }
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onShare?.({ platform: 'twitter', text: caption });
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      onShare?.({ platform: 'clipboard', text: caption });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' && !!navigator.share && !!videoBlob;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeOverlayTransition(reduceMotion)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
          aria-describedby="share-modal-desc"
        >
          <motion.div
            className="relative bg-surface rounded-xl shadow-2xl w-full max-w-lg p-6"
            initial={modalPanelInitial(reduceMotion)}
            animate={modalPanelAnimate()}
            exit={modalPanelExit(reduceMotion)}
            transition={modalPanelTransition(reduceMotion)}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-full text-text-secondary hover:text-text-primary transition-colors"
              aria-label={t('shareExport.close')}
            >
              <X size={20} weight="bold" aria-hidden="true" />
            </button>

            <h2
              id="share-modal-title"
              className="text-lg font-bold text-text-primary mb-1"
            >
              {t('shareExport.title')}
            </h2>
            <p
              id="share-modal-desc"
              className="text-sm text-text-secondary mb-4"
            >
              {t('shareExport.description')}
            </p>

            <label
              htmlFor="share-caption"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              {t('shareExport.captionLabel')}
            </label>
            <textarea
              id="share-caption"
              rows={8}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />

            <div className="flex flex-wrap gap-2 mt-4">
              {canNativeShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium text-sm transition-colors"
                  aria-label={t('shareExport.shareNative')}
                >
                  <Share size={16} weight="bold" aria-hidden="true" />
                  {t('shareExport.shareNative')}
                </button>
              )}
              <button
                type="button"
                onClick={handleTwitterShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-500/5 dark:hover:bg-gray-500/10 text-text-primary font-medium text-sm transition-colors"
                aria-label={t('shareExport.shareOnX')}
              >
                <SiX className="w-4 h-4" aria-hidden="true" />
                {t('shareExport.shareOnX')}
              </button>
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:bg-teal-500/5 dark:hover:bg-teal-500/10 text-text-primary font-medium text-sm transition-colors"
                aria-label={t('shareExport.copyCaption')}
              >
                {copied ? (
                  <Check
                    size={16}
                    weight="bold"
                    aria-hidden="true"
                    className="text-teal-500"
                  />
                ) : (
                  <CopySimple size={16} weight="bold" aria-hidden="true" />
                )}
                {copied
                  ? t('shareExport.copied')
                  : t('shareExport.copyCaption')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ShareExportModal;
