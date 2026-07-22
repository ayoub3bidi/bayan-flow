/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Bell,
  Plugs,
  X,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Container from '@/components/ui/Container';
import { useAuth } from '@/hooks/useAuth';
import { getProfile, updateProfile } from '@/services/profileService';
import { deleteAccount } from '@/services/authService';
import {
  getMetadataAvatarUrl,
  resolveUserAvatar,
} from '@/utils/resolveUserAvatar';
import { isRTL } from '@/utils/rtlManager';

/**
 * @param {import('@supabase/supabase-js').User} user
 * @returns {string}
 */
function getDefaultDisplayName(user) {
  const metadata = user.user_metadata ?? {};
  const fromMetadata = metadata.full_name ?? metadata.name;
  if (typeof fromMetadata === 'string' && fromMetadata.trim()) {
    return fromMetadata.trim();
  }
  return '';
}

const SETTINGS_TABS = [
  { key: 'profile', icon: null },
  { key: 'notifications', icon: Bell, disabled: true },
  { key: 'connections', icon: Plugs, disabled: true },
];

function ProfileSettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const isRTLDirection = isRTL(i18n.language);
  const BackIcon = isRTLDirection ? ArrowRight : ArrowLeft;
  const [activeTab, setActiveTab] = useState('profile');

  const [displayName, setDisplayName] = useState('');
  const [avatarPreference, setAvatarPreference] = useState(
    /** @type {'google' | 'generated'} */ ('google')
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success');
  const hasLoadedRef = useRef(false);
  const toastTimeoutRef = useRef(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(
    /** @type {string | null} */ (null)
  );
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastType(type);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const autoSaveAvatar = useCallback(
    async (preference, previousPreference) => {
      if (!user) {
        return;
      }
      try {
        await updateProfile(user.id, { avatarPreference: preference });
        await refreshProfile();
        showToast(t('profile.saved'));
      } catch {
        setAvatarPreference(previousPreference);
        showToast(t('profile.error'), 'error');
      }
    },
    [user, refreshProfile, showToast, t]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const row = await getProfile(user.id);
        if (cancelled) {
          return;
        }

        const savedName = row?.display_name?.trim() ?? '';
        setDisplayName(savedName || getDefaultDisplayName(user));
        setAvatarPreference(
          row?.avatar_preference === 'generated' ? 'generated' : 'google'
        );
        setProfileAvatarUrl(row?.avatar_url ?? null);
      } catch {
        if (!cancelled) {
          showToast(t('profile.error'), 'error');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
          hasLoadedRef.current = true;
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, t, showToast]);

  const email = user?.email ?? '';
  const metadataUrl = getMetadataAvatarUrl(user);

  const googlePreview = useMemo(
    () =>
      resolveUserAvatar({
        metadataUrl,
        profileUrl: profileAvatarUrl,
        email,
        size: 80,
        avatarPreference: 'google',
      }),
    [metadataUrl, profileAvatarUrl, email]
  );

  const generatedPreview = useMemo(
    () =>
      resolveUserAvatar({
        email,
        size: 80,
        avatarPreference: 'generated',
      }),
    [email]
  );

  const handleSubmit = async event => {
    event.preventDefault();
    if (!user || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile(user.id, {
        displayName,
        avatarPreference,
      });
      await refreshProfile();
      showToast(t('profile.saved'));
    } catch {
      showToast(t('profile.error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !user ||
      isDeletingAccount ||
      deleteConfirmText.trim().toLowerCase() !== user.email?.toLowerCase()
    ) {
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      showToast(t('profile.deleteAccountSuccess'));
      window.setTimeout(() => {
        window.location.href = '/';
      }, 800);
    } catch {
      showToast(t('profile.deleteAccountError'), 'error');
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />

      <main className="flex-1 pt-20 sm:pt-24 pb-120">
        <Container className="max-w-4xl">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-8"
          >
            <BackIcon size={16} weight="bold" aria-hidden="true" />
            {t('common.back')}
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary ml-2 mb-3">
            {t('settings.title')}
          </h1>

          <div
            className="flex gap-1 border-b border-interactive-border"
            role="tablist"
            aria-label={t('settings.title')}
          >
            {SETTINGS_TABS.map(tab => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <div key={tab.key} className="relative group">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-disabled={tab.disabled}
                    disabled={tab.disabled}
                    onClick={() => !tab.disabled && setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap touch-manipulation ${
                      isActive
                        ? 'border-accent-primary text-accent-primary'
                        : tab.disabled
                          ? 'border-transparent text-text-secondary/30 cursor-not-allowed opacity-40'
                          : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-hover cursor-pointer'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        size={16}
                        weight={isActive ? 'fill' : 'regular'}
                        aria-hidden="true"
                      />
                    )}
                    {t(`settings_tabs.${tab.key}`)}
                  </button>
                  {tab.disabled && (
                    <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-lg border border-white/10 bg-zinc-900/95 text-white backdrop-blur-sm dark:bg-zinc-100/95 dark:text-zinc-900 dark:border-zinc-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {t('common.coming_soon')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {isLoadingProfile ? (
            <div
              className="flex flex-col items-center gap-6 mt-6 animate-pulse"
              aria-hidden="true"
            >
              <div className="h-32 w-32 rounded-full bg-interactive-bg" />
              <div className="flex items-center gap-3 w-full max-w-sm mx-auto">
                <div className="h-4 flex-1 rounded bg-interactive-bg" />
                <div className="h-7 w-12 shrink-0 rounded-full bg-interactive-bg" />
                <div className="h-4 flex-1 rounded bg-interactive-bg" />
              </div>
              <div className="mx-20 w-full border-t border-interactive-border/10" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="h-[3.25rem] rounded-lg bg-interactive-bg" />
                <div className="h-[3.25rem] rounded-lg bg-interactive-bg" />
              </div>
              <div className="w-full">
                <div className="h-[5.5rem] rounded-lg bg-interactive-bg" />
              </div>
              <div className="flex justify-end w-full">
                <div className="h-11 w-32 rounded-lg bg-interactive-bg" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center gap-4 mt-6">
                <img
                  src={
                    avatarPreference === 'generated'
                      ? generatedPreview.src
                      : googlePreview.src
                  }
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="h-32 w-32 rounded-full border-2 border-(--color-glass-border) object-cover bg-surface-elevated shadow-md"
                />

                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center w-full max-w-sm mx-auto">
                  <span
                    className={`text-sm font-medium transition-colors text-end ${
                      avatarPreference === 'generated'
                        ? 'text-text-primary'
                        : 'text-text-secondary'
                    }`}
                  >
                    {t('profile.avatarGenerated')}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={avatarPreference === 'google'}
                    aria-label={t('profile.avatarTitle')}
                    onClick={() => {
                      const prev = avatarPreference;
                      const next = prev === 'google' ? 'generated' : 'google';
                      setAvatarPreference(next);
                      if (hasLoadedRef.current) {
                        autoSaveAvatar(next, prev);
                      }
                    }}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:ring-offset-2 focus:ring-offset-bg ${
                      avatarPreference === 'google'
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : 'bg-purple-500 dark:bg-purple-400'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                        avatarPreference === 'google'
                          ? 'ltr:translate-x-5 rtl:-translate-x-5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      avatarPreference === 'google'
                        ? 'text-text-primary'
                        : 'text-text-secondary'
                    }`}
                  >
                    {t('profile.avatarGoogle')}
                  </span>
                </div>
                <p className="text-xs text-text-secondary/40 dark:text-text-secondary/30 text-center opacity-70">
                  {t('profile.avatarCustomizationComingSoon')}
                </p>
              </div>

              <div className="mx-20 border-t border-gray-300/60 dark:border-gray-600/60" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="profile-display-name"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    {t('profile.displayName')}
                  </label>
                  <input
                    id="profile-display-name"
                    type="text"
                    value={displayName}
                    onChange={event => setDisplayName(event.target.value)}
                    maxLength={100}
                    autoComplete="name"
                    placeholder={t('profile.displayNamePlaceholder')}
                    className="w-full rounded-lg border border-interactive-border bg-interactive-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    {t('profile.email')}
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    disabled
                    readOnly
                    className="w-full rounded-lg border border-interactive-border bg-surface-elevated px-4 py-3 text-sm text-text-secondary cursor-not-allowed opacity-70"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-description"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  {t('profile.description')}
                </label>
                <textarea
                  id="profile-description"
                  rows={3}
                  disabled
                  readOnly
                  placeholder={t('profile.descriptionPlaceholder')}
                  className="w-full rounded-lg border border-interactive-border bg-surface-elevated px-4 py-3 text-sm text-text-secondary cursor-not-allowed opacity-70 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-lg bg-theme-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-theme-primary-hover disabled:opacity-60 disabled:cursor-not-allowed min-h-11 cursor-pointer"
                >
                  <span className="grid justify-items-center">
                    <span
                      className={`col-start-1 row-start-1 ${
                        isSaving ? 'invisible' : ''
                      }`}
                    >
                      {t('profile.save')}
                    </span>
                    <span
                      className={`col-start-1 row-start-1 ${
                        isSaving ? '' : 'invisible'
                      }`}
                    >
                      {t('profile.saving')}
                    </span>
                  </span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'profile' && user && (
            <section className="mt-10 pt-8 border-t border-red-200 dark:border-red-900/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {t('profile.dangerZoneTitle')}
                  </h2>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    {t('profile.dangerZoneDescription')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="shrink-0 inline-flex items-center justify-center rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 px-5 py-3 text-sm font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60 min-h-11 cursor-pointer"
                >
                  {t('profile.deleteAccount')}
                </button>
              </div>

              <AnimatePresence>
                {showDeleteModal && (
                  <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    onKeyDown={e =>
                      e.key === 'Escape' &&
                      (() => {
                        setShowDeleteModal(false);
                        setDeleteConfirmText('');
                      })()
                    }
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('profile.deleteAccount')}
                    tabIndex={-1}
                  >
                    <motion.div
                      className="bg-surface rounded-2xl shadow-2xl max-w-md w-full p-8"
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                      }}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    >
                      <h2 className="text-xl font-bold text-text-primary mb-3">
                        {t('profile.deleteAccount')}
                      </h2>
                      <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                        {t('profile.dangerZoneDescription')}
                      </p>

                      <label
                        htmlFor="delete-account-confirm-modal"
                        className="block text-sm font-medium text-text-primary mb-2"
                      >
                        {t('profile.deleteAccountConfirmLabel')}
                      </label>
                      <input
                        id="delete-account-confirm-modal"
                        type="text"
                        value={deleteConfirmText}
                        onChange={event =>
                          setDeleteConfirmText(event.target.value)
                        }
                        placeholder={user.email}
                        className="w-full rounded-lg border border-red-200 dark:border-red-800 bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-red-400/40 mb-6"
                        autoComplete="off"
                      />

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteModal(false);
                            setDeleteConfirmText('');
                          }}
                          className="flex-1 inline-flex items-center justify-center rounded-lg border border-interactive-border bg-surface px-5 py-3 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-elevated min-h-11"
                        >
                          {t('common.cancel')}
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          disabled={
                            isDeletingAccount ||
                            deleteConfirmText.trim().toLowerCase() !==
                              user.email?.toLowerCase()
                          }
                          className="flex-1 inline-flex items-center justify-center rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 px-5 py-3 text-sm font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60 disabled:opacity-50 disabled:cursor-not-allowed min-h-11"
                        >
                          {isDeletingAccount
                            ? t('profile.deleteAccountInProgress')
                            : t('profile.deleteAccount')}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          )}

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed bottom-20 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
                  toastType === 'success'
                    ? 'border-emerald-200 bg-bg text-emerald-600 dark:border-emerald-700/50 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'border-red-200 bg-bg text-red-600 dark:border-red-700/50 dark:bg-red-950/60 dark:text-red-300'
                }`}
              >
                {toastType === 'success' ? (
                  <CheckCircle size={18} weight="fill" className="shrink-0" />
                ) : (
                  <X size={18} weight="fill" className="shrink-0" />
                )}
                {toast}
                <button
                  type="button"
                  onClick={() => {
                    setToast(null);
                    if (toastTimeoutRef.current) {
                      clearTimeout(toastTimeoutRef.current);
                    }
                  }}
                  className={`ml-1 shrink-0 rounded p-0.5 ${
                    toastType === 'success'
                      ? 'text-emerald-500/60 hover:text-emerald-600 dark:text-emerald-400/60 dark:hover:text-emerald-200'
                      : 'text-red-500/60 hover:text-red-600 dark:text-red-400/60 dark:hover:text-red-200'
                  }`}
                  aria-label={t('common.close')}
                >
                  <X size={14} weight="bold" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default ProfileSettingsPage;
