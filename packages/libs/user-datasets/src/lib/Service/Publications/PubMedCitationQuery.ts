import { CitationLookupResult } from './CitationLookupResult';
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

      if (response.status !== 200) {
        return {
          status: 'error',
          error: new Error(
            'unexpected response status from ncbi: ' + response.status
          ),
        };
      }

      return { status: 'success', citation: await response.text() };
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
