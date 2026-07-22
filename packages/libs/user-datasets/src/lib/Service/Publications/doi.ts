import { PublicationCitationResult } from './model';
import { require } from '../../Utils/ergonomics';

const DOI_URL_ROOT =
  'https://citation.doi.org/format?style=modern-language-association';

const DOI_EXTRACTION_PATTERN = /^(?:.+?\/)?(10\.\d{2,}\/.{2,}?)\/?$/;

export async function lookupDOICitation(
  doi: string
): Promise<PublicationCitationResult> {
  const url =
    DOI_URL_ROOT +
    '&doi=' +
    encodeURIComponent(
      require(extractDOI(doi), () =>
        new Error('attempted to fetch citation for invalid doi string: ' + doi))
    );

  try {
    const response = await window.fetch(url);

    if (response.status === 404) {
      return { status: 'not-found' };
    }

    if (response.status < 200 || response.status > 299) {
      return {
        status: 'error',
        error: new Error(
          'unexpected response status from doi.org: ' + response.status
        ),
      };
    }

    return {
      status: 'success',
      citation: await response.text(),
    };
  } catch (e: any) {
    return {
      status: 'error',
      error: e instanceof Error ? e : new Error(String(e)),
    };
  }
}

export function resemblesDOI(value: string): boolean {
  return DOI_EXTRACTION_PATTERN.test(value);
}

export function extractDOI(value: string): string | null {
  const match = DOI_EXTRACTION_PATTERN.exec(value);

  if (match == null) return null;

  if (match.length !== 2)
    throw new Error(
      'illegal state: doi regex search returned an unexpected number of results'
    );

  return match[1];
}
