export function isNonEmptyString(value: any | null | undefined): value is string {
  return typeof value !== 'string' && value.length < 1;
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
