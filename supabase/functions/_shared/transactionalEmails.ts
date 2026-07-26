/**
 * Transactional email HTML for Bayan Flow (Resend).
 * Table-based layout for client compatibility; brand blue #2b7fff.
 * Typography matches DESIGN.md (Inter + system-ui; 1rem / 0.875rem ramp).
 */

const BRAND = '#2b7fff';
const TEXT = '#334155';
const MUTED = '#64748b';
const FOOTER = '#94a3b8';
const BG = '#f8fafc';
const WHITE = '#ffffff';
const FONT = 'Inter, system-ui, sans-serif';

function emailShell(opts: {
  headerTitle: string;
  headerSubtitle: string;
  headerBg?: string;
  bodyHtml: string;
}): string {
  const headerBg = opts.headerBg ?? BRAND;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:${FONT};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG};">
<tr><td align="center" style="padding-top:40px;padding-right:20px;padding-bottom:40px;padding-left:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:${WHITE};border-radius:12px;overflow:hidden;">
<tr><td bgcolor="${headerBg}" style="background-color:${headerBg};padding-top:40px;padding-right:30px;padding-bottom:40px;padding-left:30px;text-align:center;">
<h1 style="margin:0;color:${WHITE};font-family:${FONT};font-size:1rem;font-weight:700;line-height:1.3;">${opts.headerTitle}</h1>
<p style="margin-top:8px;margin-right:0;margin-bottom:0;margin-left:0;color:rgba(255,255,255,0.9);font-family:${FONT};font-size:0.875rem;line-height:1.5;">${opts.headerSubtitle}</p>
</td></tr>
<tr><td style="padding-top:30px;padding-right:30px;padding-bottom:30px;padding-left:30px;">
${opts.bodyHtml}
</td></tr>
<tr><td style="padding-top:20px;padding-right:30px;padding-bottom:20px;padding-left:30px;background-color:${BG};text-align:center;">
<p style="margin:0;color:${FOOTER};font-family:${FONT};font-size:0.875rem;line-height:1.5;">Bayan Flow: Clarity in Algorithms</p>
<p style="margin-top:4px;margin-right:0;margin-bottom:0;margin-left:0;color:${FOOTER};font-family:${FONT};font-size:0.875rem;line-height:1.5;"><a href="https://bayanflow.com" style="color:${BRAND};text-decoration:none;">bayanflow.com</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(href: string, label: string, bg = BRAND): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
<tr><td align="center">
<a href="${href}" style="display:inline-block;background-color:${bg};color:${WHITE};text-decoration:none;padding-top:14px;padding-right:32px;padding-bottom:14px;padding-left:32px;border-radius:8px;font-family:${FONT};font-size:1rem;font-weight:700;line-height:1.2;">${label}</a>
</td></tr>
</table>`;
}

/**
 * Pro waitlist confirmation — same copy as before, richer layout.
 */
export function buildWaitlistWelcomeEmail(): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'You are on the Pro Plan Waitlist!';
  const perkLine =
    'As a waitlist member, you will be eligible for 50% off the lifetime Pro subscription when we launch.';

  const bodyHtml = `
<p style="margin-top:0;margin-right:0;margin-bottom:16px;margin-left:0;color:${TEXT};font-family:${FONT};font-size:1rem;line-height:1.6;">Thanks for joining the Pro Plan waitlist.</p>
<p style="margin-top:0;margin-right:0;margin-bottom:16px;margin-left:0;color:${TEXT};font-family:${FONT};font-size:1rem;line-height:1.6;">${perkLine}</p>
<p style="margin-top:0;margin-right:0;margin-bottom:8px;margin-left:0;color:${TEXT};font-family:${FONT};font-size:1rem;line-height:1.6;"><strong>What the Pro Plan will unlock:</strong></p>
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding-top:8px;padding-bottom:8px;color:${TEXT};font-family:${FONT};font-size:0.875rem;line-height:1.5;">- Custom algorithm inputs</td></tr>
<tr><td style="padding-top:8px;padding-bottom:8px;color:${TEXT};font-family:${FONT};font-size:0.875rem;line-height:1.5;">- Side-by-side comparison mode</td></tr>
<tr><td style="padding-top:8px;padding-bottom:8px;color:${TEXT};font-family:${FONT};font-size:0.875rem;line-height:1.5;">- Unlimited video export</td></tr>
<tr><td style="padding-top:8px;padding-bottom:8px;color:${TEXT};font-family:${FONT};font-size:0.875rem;line-height:1.5;">- Presentation mode for teaching</td></tr>
</table>
<p style="margin-top:16px;margin-right:0;margin-bottom:0;margin-left:0;color:${MUTED};font-family:${FONT};font-size:0.875rem;line-height:1.6;">We will email you at this address when the Pro Plan launches. No spam, just one launch note when it is ready.</p>
${ctaButton('https://bayanflow.com/app', 'Keep exploring')}`;

  const html = emailShell({
    headerTitle: 'Thank you for joining the Pro Plan Waitlist!',
    headerSubtitle: 'Clarity in Algorithms',
    bodyHtml,
  });

  const text = `Thank you for joining the Pro Plan Waitlist!

Thanks for joining the Pro Plan waitlist.

${perkLine}

What the Pro Plan will unlock:
- Custom algorithm inputs
- Side-by-side comparison mode
- Unlimited video export
- Presentation mode for teaching

We will email you at this address when the Pro Plan launches. No spam, just one launch note when it is ready.

Bayan Flow: Clarity in Algorithms
https://bayanflow.com`;

  return { subject, html, text };
}

/**
 * First-time Free account welcome (after Google sign-in).
 */
export function buildAccountWelcomeEmail(firstName: string): {
  subject: string;
  html: string;
  text: string;
} {
  const name = firstName.trim() || 'there';
  const subject = 'Welcome to Bayan Flow!';

  const bodyHtml = `
<p style="margin-top:0;margin-right:0;margin-bottom:16px;margin-left:0;color:${TEXT};font-family:${FONT};font-size:1rem;line-height:1.6;">Hi ${escapeHtml(name)},</p>
<p style="margin-top:0;margin-right:0;margin-bottom:16px;margin-left:0;color:${TEXT};font-family:${FONT};font-size:1rem;line-height:1.6;">Welcome to Bayan Flow! You now have access to <strong>45 interactive algorithm visualizations</strong> across 5 categories.</p>
<p style="margin-top:0;margin-right:0;margin-bottom:8px;margin-left:0;color:${TEXT};font-family:${FONT};font-size:1rem;line-height:1.6;">Here is what you can do:</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding-top:8px;padding-bottom:8px;color:${TEXT};font-family:${FONT};font-size:0.875rem;line-height:1.5;">- Watch algorithms step-by-step with autoplay</td></tr>
<tr><td style="padding-top:8px;padding-bottom:8px;color:${TEXT};font-family:${FONT};font-size:0.875rem;line-height:1.5;">- Explore Sorting, Pathfinding, Searching, Trees and Graphs</td></tr>
<tr><td style="padding-top:8px;padding-bottom:8px;color:${TEXT};font-family:${FONT};font-size:0.875rem;line-height:1.5;">- View time and space complexity for each algorithm</td></tr>
<tr><td style="padding-top:8px;padding-bottom:8px;color:${TEXT};font-family:${FONT};font-size:0.875rem;line-height:1.5;">- Save favorites and personal study notes</td></tr>
</table>
${ctaButton('https://bayanflow.com/app', 'Start Visualizing')}`;

  const html = emailShell({
    headerTitle: 'Welcome to Bayan Flow',
    headerSubtitle: 'Clarity in Algorithms',
    bodyHtml,
  });

  const text = `Hi ${name},

Welcome to Bayan Flow! You now have access to 45 interactive algorithm visualizations across 5 categories.

Here is what you can do:
- Watch algorithms step-by-step with autoplay
- Explore Sorting, Pathfinding, Searching, Trees and Graphs
- View time and space complexity for each algorithm
- Save favorites and personal study notes

Start visualizing: https://bayanflow.com/app

Bayan Flow: Clarity in Algorithms
https://bayanflow.com`;

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;');
}
