export const MAX_FLANK_NT = 10000;

/** Keeps digits only, and bounces anything over the maximum back to it. */
export function sanitizeFlankInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits !== '' && Number(digits) > MAX_FLANK_NT
    ? String(MAX_FLANK_NT)
    : digits;
}
