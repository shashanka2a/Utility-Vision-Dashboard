/** Loose UUID v4-style match for project IDs in URLs and legacy bad data */
export function isUuidLike(s: string | null | undefined): boolean {
  if (!s || typeof s !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());
}
