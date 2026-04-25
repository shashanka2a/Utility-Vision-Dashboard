/** Client-only session for built-in demo superuser (no Supabase user). */
const STORAGE_KEY = 'uv_demo_superuser_v1';

export const DEMO_SUPERUSER_USERNAME = 'admin';
export const DEMO_SUPERUSER_PASSWORD = 'Demo@2026';

/** Set `NEXT_PUBLIC_ENABLE_DEMO_SUPERUSER=false` in production to turn this off. */
export function isDemoSuperuserFeatureEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_SUPERUSER !== 'false';
}

export function isDemoSuperuserCredential(usernameOrEmail: string, password: string): boolean {
  if (!isDemoSuperuserFeatureEnabled()) return false;
  const u = usernameOrEmail.trim().toLowerCase();
  return u === DEMO_SUPERUSER_USERNAME.toLowerCase() && password === DEMO_SUPERUSER_PASSWORD;
}

export function setDemoSuperuserSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, '1');
}

export function clearDemoSuperuserSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function isDemoSuperuserSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY) === '1';
}
