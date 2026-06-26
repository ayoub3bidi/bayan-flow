/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

export const PRIVACY_POLICY_LAST_UPDATED = '2026-06-25';

export const PRIVACY_POLICY_SECTIONS = [
  {
    id: 'introduction',
    title: 'Introduction',
    paragraphs: [
      'Bayan Flow ("we", "us", "our") operates the educational web application at https://bayanflow.com (the "Service"). This Privacy Policy explains what information is processed when you use the Service and how we handle it.',
      'Bayan Flow is operated by Ayoub Abidi. Contact: contact@bayanflow.com.',
      'The Service does not require user accounts. We do not sell personal data.',
    ],
  },
  {
    id: 'data-we-process',
    title: 'Information We Process',
    paragraphs: [
      'We designed Bayan Flow to minimize data collection. Depending on how you use the Service, the following may apply:',
    ],
    list: [
      'Website analytics (Umami): We use Umami, a privacy-oriented analytics tool, on production and development deployments. A small inline script in the page selects the correct Umami website ID for each hostname. Umami collects aggregate usage metrics such as pages visited, referrer, browser type, and device type. Umami does not use advertising cookies. Umami may assign a hashed visitor identifier for counting unique visits; we treat this as pseudonymous data and disclose it for transparency. We do not use a cookie consent banner for Umami because it is configured for privacy-friendly, non-advertising analytics.',
      'Server logs (Cloudflare): Our hosting provider, Cloudflare Workers, automatically records standard edge access logs, which may include your IP address, browser user agent, requested URL, and timestamp. See Cloudflare’s privacy documentation at https://www.cloudflare.com/privacypolicy/.',
      'Local storage on your device: Preferences such as theme, language, sound settings, Python panel layout, custom Python test cases, swipe tutorial state, and full-screen mode are stored in your browser’s localStorage. This data stays on your device and is not transmitted to our servers.',
      'GitHub API: The header badge and footer may request public release metadata and repository statistics from GitHub (api.github.com). Those requests are made to GitHub and may expose standard network metadata such as your IP address and user agent to GitHub.',
      'Python execution (Pyodide): If you open the Python code panel and run code, the Service loads Pyodide and related packages from jsDelivr (cdn.jsdelivr.net). This happens only after you explicitly use that feature.',
      'YouTube videos: Embedded videos use a click-to-load facade. No YouTube content loads until you choose to play a video. After you click play, Google/YouTube may process data according to their own policies.',
    ],
  },
  {
    id: 'no-accounts',
    title: 'No User Accounts (Current Version)',
    paragraphs: [
      'The Service currently has no registration or login. We do not collect account credentials, profile information, or saved favorites on our servers.',
      'When account features are introduced in a future release, we will update this policy with an additional section describing account-related data.',
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
      'Your consent — when you choose to play an embedded YouTube video or run Python code in the browser, which loads third-party resources.',
    ],
  },
  {
    id: 'retention',
    title: 'Retention',
    paragraphs: [
      'Analytics data retention follows Umami’s configuration for our project.',
      'Server logs are retained according to Cloudflare’s policies.',
      'localStorage data remains on your device until you clear it through your browser settings.',
    ],
  },
  {
    id: 'sharing',
    title: 'Sharing and Processors',
    paragraphs: [
      'We do not sell personal data. We use service providers to host and measure the Service, including Cloudflare (hosting) and Umami (analytics). Third-party resources (GitHub, jsDelivr, YouTube/Google) are loaded only as described above.',
    ],
  },
  {
    id: 'rights',
    title: 'Your Rights and Contact',
    paragraphs: [
      'Depending on your location, you may have rights to access, rectify, erase, restrict, or object to certain processing, or to lodge a complaint with a supervisory authority.',
      'Because we do not operate user accounts, we may have limited ability to identify you from analytics or server logs alone. To exercise your rights or ask questions, email contact@bayanflow.com with enough detail for us to respond.',
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
