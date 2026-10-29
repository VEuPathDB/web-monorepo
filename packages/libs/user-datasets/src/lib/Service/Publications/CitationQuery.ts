import { CitationLookupResult } from './CitationLookupResult';

export interface CitationQuery {
  start(): Promise<CitationLookupResult>;

  abort(): void;
}
