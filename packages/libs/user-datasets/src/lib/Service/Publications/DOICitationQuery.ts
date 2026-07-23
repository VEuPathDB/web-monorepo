import { CitationLookupResult } from './CitationLookupResult';
import { requireValue } from '../../Utils/ergonomics';
import { CitationQuery } from './CitationQuery';
import { AbstractCitationQuery } from './AbstractCitationQuery';

export class DOICitationQuery
  extends AbstractCitationQuery
  implements CitationQuery
{
  private static readonly DOI_URL_ROOT =
    'https://citation.doi.org/format?style=modern-language-association';

  private static readonly DOI_EXTRACTION_PATTERN =
    /^(?:.+?\/)?(10\.\d{2,}\/.{2,}?)\/?$/;

  protected override async runLookup(): Promise<CitationLookupResult> {
    const url =
      DOICitationQuery.DOI_URL_ROOT +
      '&doi=' +
      encodeURIComponent(
        requireValue(
          DOICitationQuery.extractDOI(this.id),
          () =>
            new Error(
              'attempted to fetch citation for invalid doi string: ' + this.id
            )
        )
      );

    try {
      const response = await this.fetch(url);

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

  static extractDOI(value: string): string | null {
    const match = DOICitationQuery.DOI_EXTRACTION_PATTERN.exec(value);

    if (match == null) return null;

    if (match.length !== 2)
      throw new Error(
        'illegal state: doi regex search returned an unexpected number of results'
      );

    return match[1];
  }

  static resemblesDOI(value: string): boolean {
    return DOICitationQuery.DOI_EXTRACTION_PATTERN.test(value);
  }
}
