# Authentication

Bayan Flow offers optional sign-in with Google. You can use all algorithm visualizations, the code panel, insight panel, and video export without an account.

## Sign in

When you choose **Sign in with Google**, a small popup opens for Google account selection. After you approve access, the popup closes and you stay on the same page (or are taken to the visualizer if you signed in from the landing page). Authentication is handled by Supabase Auth using OpenID Connect (OIDC). We receive your Google account email, display name, and profile photo URL to show your account in the app header and to create a minimal profile row in our database.

**Supabase redirect URL:** your project must allow `{origin}/auth/callback` (for example `https://bayanflow.com/auth/callback` and `http://localhost:5173/auth/callback` for local development).

## Data stored

- **Session tokens** are stored in your browser by the Supabase client library so you stay signed in across visits.
- **Profile row** (`email`, display name, avatar URL, provider, plan tier) is stored in Supabase PostgreSQL. See the [Privacy Policy](/privacy) for full details.

## Sign out

Use **Sign out** from the account menu in the header at any time. This clears the local session.

## Contact

For questions or feedback, email contact@bayanflow.com or open an issue at https://github.com/ayoub3bidi/bayan-flow
