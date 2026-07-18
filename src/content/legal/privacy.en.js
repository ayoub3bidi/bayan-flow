/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

export const PRIVACY_POLICY_LAST_UPDATED = '2026-07-10';

export const PRIVACY_POLICY_SECTIONS = [
  {
    id: 'introduction',
    title: 'Introduction',
    paragraphs: [
      'Bayan Flow ("we", "us", "our") operates the educational web application at https://bayanflow.com (the "Service"). This Privacy Policy explains what information is processed when you use the Service and how we handle it.',
      'Bayan Flow is operated by Ayoub Abidi. Contact: contact@bayanflow.com.',
      'Sign-in is optional. We do not sell personal data.',
    ],
  },
  {
    id: 'data-we-process',
    title: 'Information We Process',
    paragraphs: [
      'We designed Bayan Flow to minimize data collection. Depending on how you use the Service, the following may apply:',
    ],
    list: [
      'Website analytics (PostHog): We use PostHog, a privacy-oriented analytics and product platform, on production and development deployments. PostHog collects aggregate usage metrics such as pages visited, referrer, browser type, device type, and user interactions with features like algorithm visualizations. PostHog uses a first-party proxy (e.bayanflow.com) to avoid ad-blocker interference. PostHog may assign a distinct visitor identifier; we treat this as pseudonymous data and disclose it for transparency. Session replay is enabled to help us understand and improve the user experience; text and media inputs are masked for privacy. We do not use a cookie consent banner for PostHog because it is configured for privacy-friendly, non-advertising analytics.',
      'Server logs (Cloudflare): Our hosting provider, Cloudflare Workers, automatically records standard edge access logs, which may include your IP address, browser user agent, requested URL, and timestamp. See Cloudflare’s privacy documentation at https://www.cloudflare.com/privacypolicy/.',
      'Local storage on your device: Preferences such as theme, language, sound settings, Python panel layout, custom Python test cases, swipe tutorial state, and full-screen mode are stored in your browser’s localStorage. This data stays on your device and is not transmitted to our servers.',
      'GitHub API: The header badge and footer may request public release metadata and repository statistics from GitHub (api.github.com). Those requests are made to GitHub and may expose standard network metadata such as your IP address and user agent to GitHub.',
      'Python execution (Pyodide): If you open the Python code panel and run code, the Service loads Pyodide and related packages from jsDelivr (cdn.jsdelivr.net). This happens only after you explicitly use that feature.',
      'YouTube videos: Embedded videos use a click-to-load facade. No YouTube content loads until you choose to play a video. After you click play, Google/YouTube may process data according to their own policies.',
      'Optional Google sign-in (Supabase Auth): If you choose to sign in with Google, Supabase processes the OAuth flow and we receive your email address, display name, profile photo URL, and authentication provider. A profile row is stored in Supabase PostgreSQL. Session tokens are stored locally in your browser by the Supabase client so you remain signed in. Signed-in features include favorite algorithms (up to 20 slots on the free tier) and personal study notes you write in the app; this data is stored in Supabase PostgreSQL and linked to your account. For abuse prevention, we may store your IP address at first sign-up and a last-activity timestamp when you use signed-in visualizations. You can sign out at any time from the account menu.',
    ],
  },
  {
    id: 'accounts',
    title: 'Optional User Accounts',
    paragraphs: [
      'You can use Bayan Flow without signing in. Core algorithm visualizations and playback controls remain available without an account.',
      'Some additional free features — including the interactive code panel, algorithm insight and notes panels, favorite algorithms, video export, sound effects, and fullscreen mode — require signing in with Google. When you sign in, we process the account data described above. We do not offer email/password registration.',
    ],
  },
  {
    id: 'legal-bases',
    title: 'Why We Process Data',
    paragraphs: [
      'Where applicable under privacy laws such as the GDPR, we rely on:',
    ],
    list: [
      'Legitimate interests — to operate, secure, and improve the Service (for example, hosting logs and privacy-friendly analytics).',
      'Your consent — when you choose to play an embedded YouTube video, run Python code in the browser, or sign in with Google.',
    ],
  },
  {
    id: 'retention',
    title: 'Retention',
    paragraphs: [
      'Analytics data retention follows PostHog’s configuration for our project.',
      'Server logs are retained according to Cloudflare’s policies.',
      'Sign-up IP addresses on user profiles are retained for up to 90 days, then anonymized. Signup audit events used for rate limiting are deleted after 7 days. When you delete your account, sign-up IP data and related audit rows are removed.',
      'localStorage data remains on your device until you clear it through your browser settings.',
    ],
  },
  {
    id: 'sharing',
    title: 'Sharing and Processors',
    paragraphs: [
      'We do not sell personal data. We use service providers to host and measure the Service, including Cloudflare (hosting), PostHog (analytics and product insights), and Supabase (optional authentication and profile storage). Third-party resources (GitHub, jsDelivr, YouTube/Google) are loaded only as described above.',
    ],
  },
  {
    id: 'rights',
    title: 'Your Rights and Contact',
    paragraphs: [
      'Depending on your location, you may have rights to access, rectify, erase, restrict, or object to certain processing, or to lodge a complaint with a supervisory authority.',
      'If you have a signed-in account, you can delete your account at any time from Profile Settings (/settings/profile), which permanently removes your profile, favorites, and study notes from Supabase. You can also email contact@bayanflow.com for assistance. For other requests, email contact@bayanflow.com with enough detail for us to respond.',
    ],
  },
  {
    id: 'children',
    title: 'Children',
    paragraphs: [
      'Bayan Flow is an educational tool for learners of computer science. It is not directed at children under 13, and we do not knowingly collect personal information from children.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. The "Last updated" date at the top reflects the latest revision. Material changes will be posted on this page.',
    ],
  },
];
