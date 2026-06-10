export function isNonEmptyString(
  value: any | null | undefined
): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isNonBlankString(value: any | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}