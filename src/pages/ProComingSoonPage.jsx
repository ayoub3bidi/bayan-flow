/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Columns,
  Export,
  PlusCircle,
  Presentation,
  Sliders,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import DocumentTitle from '@/components/DocumentTitle';
import { useAuth } from '@/hooks/useAuth';
import { parseWaitlistSource } from '@/constants/waitlist';
import {
  getWaitlistPublicCount,
  joinWaitlist,
  readStoredWaitlistEmail,
} from '@/services/waitlistService';

const FEATURE_ITEMS = [
  { key: 'customInput', Icon: Sliders },
  { key: 'comparison', Icon: Columns },
  { key: 'export', Icon: Export },
  { key: 'presentation', Icon: Presentation },
];

const PRO_SORT_BAR_HEIGHTS = [40, 65, 30, 80, 50, 70];
const WAITLIST_COUNT_THRESHOLD = 50;

function AbstractSortingAnimation() {
  return (
    <div className="flex items-end justify-center gap-3 rounded-2xl border border-border bg-surface py-8 shadow-sm">
      {PRO_SORT_BAR_HEIGHTS.map((height, index) => (
        <div
          key={`sort-bar-${index}`}
          className={`pro-sorting-tile-${index + 1} pro-sorting-tile rounded-lg border-2 shadow-lg`}
          style={{ width: '48px', height: `${height}px` }}
          aria-hidden
        />
      ))}
    </div>
  );
}

function ProComingSoonPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();

  const source = parseWaitlistSource(searchParams.get('source'));

  const defaultEmail = (() => {
    const profileEmail = profile?.email || user?.email;
    if (profileEmail) return profileEmail;
    return readStoredWaitlistEmail() ?? '';
  })();

  const [email, setEmail] = useState(defaultEmail);
  const [submitState, setSubmitState] = useState('idle');
  const [position, setPosition] = useState(null);
  const [errorKey, setErrorKey] = useState(null);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    setEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    getWaitlistPublicCount().then(count => {
      if (count >= WAITLIST_COUNT_THRESHOLD) {
        setWaitlistCount(count);
      }
    });
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    setErrorKey(null);
    setSubmitState('submitting');

    const result = await joinWaitlist(email, {
      userId: user?.id ?? null,
      source,
    });

    if (result.status === 'joined') {
      setPosition(result.position ?? null);
      setSubmitState('success');
      return;
    }

    if (result.status === 'already_joined') {
      setSubmitState('already_joined');
      return;
    }

    if (result.status === 'invalid_email') {
      setErrorKey('pro.errors.invalidEmail');
    } else if (result.status === 'unavailable') {
      setErrorKey('pro.errors.unavailable');
    } else {
      setErrorKey('pro.errors.generic');
    }

    setSubmitState('idle');
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col overflow-x-hidden">
      <DocumentTitle titleKey="pro.pageTitle" />

      <div className="fixed inset-0 bg-linear-to-b from-bg via-bg to-surface-elevated pointer-events-none" />

      <Header />

      <Section className="relative z-10 flex-1 pt-28 pb-20 md:pt-36 md:pb-28 lg:pb-32">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] lg:gap-12">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left rtl:lg:text-right">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-theme-primary">
                {t('pro.eyebrow')}
              </p>
              <h1 className="text-3xl font-bold leading-tight text-text-primary sm:text-4xl md:text-5xl">
                {t('pro.headline')}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-text-secondary sm:text-lg">
                {t('pro.subheadline')}
              </p>
            </div>

            <div className="mx-auto w-full max-w-md self-center lg:mx-0">
              <AbstractSortingAnimation />
            </div>
          </div>

          <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] lg:gap-12">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                {t('pro.featuresHeading')}
              </h2>
              <ul className="mt-5 space-y-4">
                {FEATURE_ITEMS.map(feature => {
                  const FeatureIcon = feature.Icon;
                  return (
                    <li key={feature.key} className="flex items-start gap-3">
                      <span
                        className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg bg-theme-primary/10 text-theme-primary"
                        aria-hidden
                      >
                        <FeatureIcon size={20} weight="bold" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-text-primary">
                          {t(`pro.features.${feature.key}.title`)}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-text-secondary">
                          {t(`pro.features.${feature.key}.body`)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-5 flex items-start gap-3 border-t border-border pt-4">
                <span
                  className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-theme-primary"
                  aria-hidden
                >
                  <PlusCircle size={20} weight="bold" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-text-primary">
                    {t('pro.featuresMore.title')}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-text-secondary">
                    {t('pro.featuresMore.body')}
                  </span>
                </span>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md lg:mx-0">
              {submitState === 'success' ? (
                <div
                  className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm"
                  role="status"
                >
                  <h2 className="text-xl font-semibold text-text-primary">
                    {t('pro.success.title')}
                  </h2>
                  {/* TODO: Bring back this position statement when we have many people on the waitlist */}
                  {/* {position != null && position > 0 ? (
                    <p className="mt-2 text-text-secondary">
                      {t('pro.success.position', { position })}
                    </p>
                  ) : null} */}
                  <p className="mt-3 text-text-secondary">
                    {t('pro.success.nextStep', { email })}
                  </p>
                  <div className="mt-6">
                    <Button to="/app" variant="primary">
                      {t('pro.success.backToApp')}
                    </Button>
                  </div>
                </div>
              ) : submitState === 'already_joined' ? (
                <div
                  className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm"
                  role="status"
                >
                  <h2 className="text-xl font-semibold text-text-primary">
                    {t('pro.alreadyJoined.title')}
                  </h2>
                  <p className="mt-3 text-text-secondary">
                    {t('pro.alreadyJoined.body')}
                  </p>
                  <div className="mt-6">
                    <Button to="/app" variant="secondary">
                      {t('pro.success.backToApp')}
                    </Button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
                  noValidate
                >
                  <div className="mb-5">
                    <h2 className="text-xl font-semibold text-text-primary">
                      {t('pro.form.title')}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {t('pro.form.helper')}
                    </p>
                  </div>
                  <label
                    htmlFor="pro-waitlist-email"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    {t('pro.form.emailLabel')}
                  </label>
                  <input
                    id="pro-waitlist-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder={t('pro.form.emailPlaceholder')}
                    aria-describedby={
                      errorKey ? 'pro-waitlist-email-error' : undefined
                    }
                    className="w-full rounded-lg border border-border-hover bg-bg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                    disabled={submitState === 'submitting'}
                  />
                  {errorKey ? (
                    <p
                      id="pro-waitlist-email-error"
                      className="mt-2 text-sm text-(--color-error)"
                      role="alert"
                    >
                      {t(errorKey)}
                    </p>
                  ) : null}
                  <Button
                    type="submit"
                    variant="primary"
                    className="mt-4 w-full"
                    disabled={submitState === 'submitting'}
                  >
                    {submitState === 'submitting'
                      ? t('pro.form.submitting')
                      : t('pro.form.submit')}
                  </Button>
                  {waitlistCount > 0 ? (
                    <p className="mt-3 text-center text-xs leading-relaxed text-text-secondary">
                      {t('pro.waitlistCount', { count: waitlistCount })}
                    </p>
                  ) : (
                    <p className="mt-3 text-center text-xs leading-relaxed text-text-secondary">
                      {t('pro.form.privacy')}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <div className="relative z-10 mt-10 md:mt-14 lg:mt-16">
        <Footer />
      </div>
    </div>
  );
}

export default ProComingSoonPage;
