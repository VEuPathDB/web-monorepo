import { CitationLookupResult } from './CitationLookupResult';
import { isEmpty } from 'lodash';
import { CitationQuery } from './CitationQuery';
import { AbstractCitationQuery } from './AbstractCitationQuery';

export class PubMedCitationQuery
  extends AbstractCitationQuery
  implements CitationQuery
{
  // NOTE: the slash in between 'pubmed' and the query params is included
  // intentionally to avoid redirects.
  private static readonly NCBI_URL_ROOT =
    'https://pmc.ncbi.nlm.nih.gov/api/ctxp/v1/pubmed/?format=citation';

  private static readonly PMID_PATTERN = /^\d+$/;

  protected override async runLookup(): Promise<CitationLookupResult> {
    const url =
      PubMedCitationQuery.NCBI_URL_ROOT + '&id=' + encodeURIComponent(this.id);

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

  static resemblesPMID(value: string): boolean {
    return PubMedCitationQuery.PMID_PATTERN.test(value);
  }
}
