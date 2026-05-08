import { isInteger } from 'lodash';

export function isNonEmptyString(
  value: any | null | undefined
): value is string {
  return typeof value !== 'string' || value.length < 1;
}

// https://stackoverflow.com/a/43467144
function isValidUrl(string: string) {
  let url: URL;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

export function numberOrNull(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.length === 0) return null;

  const parsed = Number(value);

  return isInteger(parsed) ? parsed : null;
}
