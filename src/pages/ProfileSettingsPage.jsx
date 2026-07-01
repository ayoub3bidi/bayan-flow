/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from '@phosphor-icons/react';
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

function ProfileSettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const isRTLDirection = isRTL(i18n.language);
  const BackIcon = isRTLDirection ? ArrowRight : ArrowLeft;

  const [displayName, setDisplayName] = useState('');
  const [avatarPreference, setAvatarPreference] = useState(
    /** @type {'google' | 'generated'} */ ('google')
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(
    /** @type {string | null} */ (null)
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
      setErrorMessage('');
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
          setErrorMessage(t('profile.error'));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
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
    setErrorMessage('');
    setShowSaved(false);

    try {
      await updateProfile(user.id, {
        displayName,
        avatarPreference,
      });
      await refreshProfile();
      setShowSaved(true);
      window.setTimeout(() => setShowSaved(false), 3000);
    } catch {
      setErrorMessage(t('profile.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />

      <main className="flex-1 pt-20 sm:pt-24 pb-12">
        <Container className="max-w-xl">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-8"
          >
            <BackIcon size={16} weight="bold" aria-hidden="true" />
            {t('common.back')}
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            {t('profile.title')}
          </h1>
          <p className="text-sm text-text-secondary mb-8">{email}</p>

          {isLoadingProfile ? (
            <p className="text-sm text-text-secondary">
              {t('profile.loading')}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
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

              <fieldset>
                <legend className="block text-sm font-medium text-text-primary mb-3">
                  {t('profile.avatarTitle')}
                </legend>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  role="radiogroup"
                  aria-label={t('profile.avatarTitle')}
                >
                  {[
                    {
                      value: 'google',
                      label: t('profile.avatarGoogle'),
                      preview: googlePreview.src,
                    },
                    {
                      value: 'generated',
                      label: t('profile.avatarGenerated'),
                      preview: generatedPreview.src,
                    },
                  ].map(option => {
                    const isSelected = avatarPreference === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setAvatarPreference(option.value)}
                        className={`flex flex-col items-center gap-3 rounded-xl border p-4 text-sm font-medium transition-colors cursor-pointer touch-manipulation ${
                          isSelected
                            ? 'border-accent-primary bg-accent-primary/10 text-text-primary'
                            : 'border-interactive-border bg-interactive-bg text-text-secondary hover:border-border-hover hover:text-text-primary'
                        }`}
                      >
                        <img
                          src={option.preview}
                          alt=""
                          aria-hidden="true"
                          referrerPolicy="no-referrer"
                          className="h-20 w-20 rounded-full border border-(--color-glass-border) object-cover bg-surface-elevated"
                        />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {errorMessage && (
                <p
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}

              {showSaved && (
                <p
                  className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400"
                  role="status"
                >
                  <CheckCircle size={18} weight="fill" aria-hidden="true" />
                  {t('profile.saved')}
                </p>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-lg bg-theme-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-theme-primary-hover disabled:opacity-60 disabled:cursor-not-allowed min-h-11"
              >
                {isSaving ? t('profile.saving') : t('profile.save')}
              </button>
            </form>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default ProfileSettingsPage;
