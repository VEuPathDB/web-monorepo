import { CitationQuery } from './CitationQuery';
import { DatasetPublicationType } from '../Model';
import { PubMedCitationQuery } from './PubMedCitationQuery';
import { CitationLookupResult } from './CitationLookupResult';
import { DOICitationQuery } from './DOICitationQuery';

export type { CitationLookupResult } from './CitationLookupResult';

let activeQuery: CitationQuery | null = null;

export async function lookupCitation(
  id: string,
  type: DatasetPublicationType
): Promise<CitationLookupResult> {
  if (activeQuery) {
    activeQuery.abort();
  }

  const query = (activeQuery =
    type === 'pmid' ? new PubMedCitationQuery(id) : new DOICitationQuery(id));

  const result = await query.start();

  if (activeQuery === query) {
    activeQuery = null;
  }

  return result;
}

export function resemblesPublicationId(
  id: string,
  type: DatasetPublicationType
): boolean {
  return type === 'pmid'
    ? PubMedCitationQuery.resemblesPMID(id)
    : DOICitationQuery.resemblesDOI(id);
}
