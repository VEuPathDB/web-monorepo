import { numberDecimalPoint } from './number-decimal-point';

/**
 * Format a latitude/longitude value for display. Geo filters store the full
 * precision selected on the map; for display we round to 4 decimal places
 * (~11 m) so the value doesn't show a distractingly long string of digits.
 */
export function formatCoordinate(value: number): string {
  return String(numberDecimalPoint(value, 4));
}
