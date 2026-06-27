# Authentication

Bayan Flow offers optional sign-in with Google. You can use all algorithm visualizations, the code panel, insight panel, and video export without an account.

## Sign in

When you visit the site while signed into Google in your browser, a **Google One Tap** prompt may appear automatically so you can sign in with one click. You can also use the **Sign in with Google** control in the header at any time.

Sign-in uses [Google Identity Services](https://developers.google.com/identity) on **bayanflow.com** — Google shows our domain, not a third-party auth host. After you choose an account, Bayan Flow receives an ID token and creates a Supabase session. We store your Google account email, display name, and profile photo URL to show your account in the app and to maintain a minimal profile row in our database.

**Google Cloud setup (required):** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → your **Web application** OAuth client → **Authorized JavaScript origins**, add every origin where the app runs (scheme + host + port, no trailing slash):

| Environment | Authorized JavaScript origin |
|-------------|------------------------------|
| Local dev (Vite default) | `http://localhost:5173` |
| Dev deploy | `https://dev.bayanflow.com` |
| Production | `https://bayanflow.com` |

The `VITE_GOOGLE_WEB_CLIENT_ID` in `.env.local` must match this same Web client. Redirect URIs are **not** required for One Tap or the header sign-in button. If sign-in fails with `origin_mismatch` or `403` on `accounts.google.com/gsi/`, the current browser origin is missing from that list — open DevTools and compare `window.location.origin` to the Console entries exactly.

**Supabase:** Authentication → Providers → Google — use the same Web Client ID and Client Secret from that OAuth client.

**Browser:** Chrome may block FedCM / third-party sign-in for a site. If One Tap fails, use the header **Sign in with Google** button, or re-enable third-party sign-in via the icon left of the address bar → Site settings.

## Data stored

- **Session tokens** are stored in your browser by the Supabase client library so you stay signed in across visits.
- **Profile row** (`email`, display name, avatar URL, provider, plan tier) is stored in Supabase PostgreSQL. See the [Privacy Policy](/privacy) for full details.

## Sign out

Use **Sign out** from the account menu in the header at any time. This clears the local session and disables Google automatic sign-in for this browser until you sign in again.

## Contact

For questions or feedback, email contact@bayanflow.com or open an issue at https://github.com/ayoub3bidi/bayan-flow
