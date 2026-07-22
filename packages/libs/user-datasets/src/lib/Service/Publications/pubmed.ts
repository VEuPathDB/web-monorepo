import { PublicationCitationResult } from './model';
import { isEmpty } from 'lodash';

const NCBI_URL_ROOT =
  'https://pmc.ncbi.nlm.nih.gov/api/ctxp/v1/pubmed?format=citation';

const PMID_PATTERN = /^\d{3,}$/;

export async function lookupPubMedCitation(
  pmid: string
): Promise<PublicationCitationResult> {
  const url = NCBI_URL_ROOT + '&id=' + encodeURIComponent(pmid);

  try {
    const response = await window.fetch(url);

    // NCBI citation API returns 400s for completely invalid PMID values.
    if (response.status === 400) {
      return { status: 'not-found' };
    }

    if (response.status !== 200) {
      return {
        status: 'error',
        error: new Error(
          'unexpected response status from ncbi: ' + response.status
        ),
      };
    }

    const body = await response.json();

    const befuddlingResponse = (): PublicationCitationResult => {
      const error = new Error('unexpected response body from ncbi');
      console.error(error, body);
      return { status: 'error', error };
    };

    if (typeof body !== 'object') {
      return befuddlingResponse();
    }

    // NCBI citation API returns an empty array instead of a 404 for ID misses.
    if (Array.isArray(body)) {
      if (isEmpty(body)) {
        return { status: 'not-found' };
      }

      return befuddlingResponse();
    }

    return typeof body.mla === 'object' && typeof body.mla.orig === 'string'
      ? { status: 'success', citation: body.mla.orig }
      : befuddlingResponse();
  } catch (e: any) {
    return {
      status: 'error',
      error: e instanceof Error ? e : new Error(String(e)),
    };
  }
}

export function resemblesPMID(value: string): boolean {
  return PMID_PATTERN.test(value);
}
