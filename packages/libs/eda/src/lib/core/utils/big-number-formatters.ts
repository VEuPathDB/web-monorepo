/**
 * if arg is over 9999 return 'k version' e.g., 223832 -> 234k otherwise return original number as a string
 */
export function kFormatter(num: number): string {
  return Math.abs(num) > 9999
    ? (Math.sign(num) * (Math.abs(num) / 1000)).toFixed(0) + 'k'
    : String(num);
}

/**
 * M is the S.I. abbreviation for million,
 * and, to be honest, it looks clearer than 'm'
 */
export function mFormatter(num: number): string {
  return Math.abs(num) > 999999
    ? (Math.sign(num) * (Math.abs(num) / 1000000)).toFixed(1) + 'M'
    : num.toLocaleString(undefined, { useGrouping: true });
}
