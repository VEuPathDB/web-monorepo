/** Above this estimate a job only runs after the user confirms. */
export const WARN_JOB_SECONDS = 30;
/** Above this estimate a job is not run; the user has to remove sequences. */
export const MAX_JOB_SECONDS = 10 * 60;

/**
 * Predicted seconds for the tree job (MAFFT, then FastTree) on `n` sequences
 * whose longest is `maxLength` residues. A power-law fit to logged service
 * runtimes, so only an estimate.
 */
export function estimateTreeSeconds(n: number, maxLength: number): number {
  if (n <= 0 || maxLength <= 0) return 0;
  const fasttree = Math.exp(-8.229) * n ** 1.165 * maxLength ** 0.849;
  const mafft = Math.exp(-12.453) * n ** 0.618 * maxLength ** 1.47;
  return fasttree + mafft;
}

/** Seconds as m:ss. */
export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const ss = String(total % 60).padStart(2, '0');
  return `${Math.floor(total / 60)}:${ss}`;
}

/**
 * Predicted seconds for a Clustal Omega protein alignment of `n` sequences
 * whose longest is `maxLength` residues. A preliminary power-law fit.
 */
export function estimateMsaSeconds(n: number, maxLength: number): number {
  if (n <= 0 || maxLength <= 0) return 0;
  return Math.exp(-9.235) * n ** 1.016 * maxLength ** 0.931;
}
