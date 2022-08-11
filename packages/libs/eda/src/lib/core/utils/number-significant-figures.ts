// util to return a number with specific decimal points
export function numberSignificantFigures(
  value: number,
  precision: number
): number {
  return Number.isInteger(value) ? value : Number(value.toPrecision(precision));
}
