/**
 * Canonical public origin for auth redirects (Supabase redirect_to) and invite emails.
 *
 * Priority:
 * 1. APP_BASE_URL — set on Vercel to your canonical site (recommended for auth).
 * 2. NEXT_PUBLIC_APP_URL — must match at build time for client; fine for API if set.
 * 3. Vercel runtime — VERCEL_URL is always set on Vercel (https://…hostname).
 * 4. Request URL — local `npm run dev` when none of the above apply.
 *
 * If invites are sent from your laptop without APP_BASE_URL / NEXT_PUBLIC_APP_URL,
 * step 4 becomes http://localhost:3000 and email links will redirect there.
 */
export function getPublicAppBaseUrl(request: Request): string {
  const explicit =
    process.env.APP_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  if (process.env.VERCEL === '1' && process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.replace(/\/$/, '');
    return host.startsWith('http') ? host : `https://${host}`;
  }

  return new URL(request.url).origin;
}
