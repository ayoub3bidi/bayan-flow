/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useTranslation } from 'react-i18next';
import Container from '../ui/Container';

const PROOF_ITEM_KEYS = ['algorithms', 'locales', 'depth'];

/**
 * Honest product signals only — no fake logos or inflated metrics.
 * Mounted from LandingPage only when SHOW_LANDING_SOCIAL_PROOF is true.
 */
function SocialProofStrip() {
  const { t } = useTranslation();

  return (
    <section
      data-testid="social-proof-strip"
      className="relative py-10 md:py-12 border-y border-border/60"
      aria-label={t('landing.socialProof.ariaLabel')}
    >
      <Container>
        <ul className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 list-none m-0 p-0">
          {PROOF_ITEM_KEYS.map(key => (
            <li
              key={key}
              className="text-center text-sm md:text-base text-text-secondary"
            >
              <span className="block font-semibold text-text-primary mb-0.5">
                {t(`landing.socialProof.items.${key}.value`)}
              </span>
              <span>{t(`landing.socialProof.items.${key}.label`)}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export default SocialProofStrip;
