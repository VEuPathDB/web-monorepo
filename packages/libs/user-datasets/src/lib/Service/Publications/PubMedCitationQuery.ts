import { CitationLookupResult } from './CitationLookupResult';
import { isEmpty } from 'lodash';
import { CitationQuery } from './CitationQuery';
import { AbstractCitationQuery } from './AbstractCitationQuery';
import { endpoint as ServicePath } from '../../config';

export class PubMedCitationQuery
  extends AbstractCitationQuery
  implements CitationQuery
{
  // using a proxy service in the wdk to work around the lack of CORS headers
  // in the ncbi api responses
  private static readonly URL_ROOT =
    ServicePath + '/pubmed/citation';

  private static readonly PMID_PATTERN = /^\d+$/;

  protected override async runLookup(): Promise<CitationLookupResult> {
    const url =
      PubMedCitationQuery.URL_ROOT + '?pmid=' + encodeURIComponent(this.id);

    try {
      const response = await this.fetch(url);

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

      const befuddlingResponse = (): CitationLookupResult => {
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

  static extractPMID(value: string): string {
    return value.trim();
  }

  static resemblesPMID(value: string): boolean {
    return PubMedCitationQuery.PMID_PATTERN.test(value);
  }
}
