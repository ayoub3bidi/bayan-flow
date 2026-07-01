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

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastType(type);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const autoSaveAvatar = useCallback(
    async preference => {
      if (!user) {
        return;
      }
      try {
        await updateProfile(user.id, { avatarPreference: preference });
        await refreshProfile();
        showToast(t('profile.saved'));
      } catch {
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
  }, [user, t]);

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

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />

      <main className="flex-1 pt-20 sm:pt-24 pb-20">
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
            <p className="text-sm text-text-secondary">
              {t('profile.loading')}
            </p>
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

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-medium transition-colors ${
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
                      const next =
                        avatarPreference === 'google' ? 'generated' : 'google';
                      setAvatarPreference(next);
                      if (hasLoadedRef.current) {
                        autoSaveAvatar(next);
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
                          ? 'translate-x-5'
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
              </div>

              <div className="mx-12 border-t border-interactive-border/20" />

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
                  className="inline-flex items-center justify-center rounded-lg bg-theme-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-theme-primary-hover disabled:opacity-60 disabled:cursor-not-allowed min-h-11 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  {isSaving ? t('profile.saving') : t('profile.save')}
                </button>
              </div>
            </form>
          )}

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
                  toastType === 'success'
                    ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
                    : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
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
                      ? 'text-green-600/60 hover:text-green-800 dark:text-green-400/60 dark:hover:text-green-200'
                      : 'text-red-600/60 hover:text-red-800 dark:text-red-400/60 dark:hover:text-red-200'
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
