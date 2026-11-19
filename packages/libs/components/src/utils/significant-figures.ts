/**
 * Format a numeric value for display with a fixed number of significant figures,
 * switching to scientific notation for very small or very large magnitudes.
 *
 *   formatSignificantFigures('0.000012345678') -> '1.23e-5'
 *   formatSignificantFigures('0.0123456')      -> '0.0123'
 *   formatSignificantFigures('-2.34567')       -> '-2.35'
 *
 * Display only: callers should keep the original value for sorting, downloads and
 * tooltips. Returns undefined for anything that is not a non-integer number, so the
 * caller can show the original value unchanged.
 */
export function formatSignificantFigures(
  value: unknown,
  significantFigures = 3
): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || Number.isInteger(number)) return undefined;
  const magnitude = Math.abs(number);
  return magnitude < 1e-3 || magnitude >= 1e6
    ? number.toExponential(significantFigures - 1)
    : String(Number(number.toPrecision(significantFigures)));
}
