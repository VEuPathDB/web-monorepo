// util to return a number with specific decimal points
export function numberDecimalPoint(
  value: number,
  decimalPoint: number
): number {
  return Number(
    Math.round(parseFloat(value + 'e' + decimalPoint)) + 'e-' + decimalPoint
  );
}
