// util to return a number with specific decimal points
export function numberDecimalPoint(
  value: number,
  decimalPoint: number
): number {
  return Number.isInteger(value) ? value : Number(value.toFixed(decimalPoint));
}
