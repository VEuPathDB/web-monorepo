// util to return a number with specific decimal points
export function numberDecimalPoint(
  value: number,
  decimalPoint: number
): number {
  return Number(value.toFixed(decimalPoint));
}
