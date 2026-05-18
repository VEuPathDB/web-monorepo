export function isNonEmptyString(
  value: any | null | undefined
): value is string {
  return typeof value !== 'string' || value.length < 1;
}
