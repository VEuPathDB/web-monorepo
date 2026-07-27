import { CitationLookupResult } from './CitationLookupResult';
import { CitationQuery } from './CitationQuery';

export abstract class AbstractCitationQuery implements CitationQuery {
  protected readonly id: string;
  protected controller?: AbortController;

  constructor(id: string) {
    this.id = id;
  }

  async start(): Promise<CitationLookupResult> {
    if (this.controller != null) {
      throw new Error(
        'illegal state: attempted to reuse active citation query'
      );
    }

    this.controller = new AbortController();

    const res = await this.runLookup();
    return this.controller.signal.aborted ? { status: 'cancelled' } : res;
  }

  abort(): void {
    this.controller?.abort();
  }

  protected async fetch(
    url: string,
    init: RequestInit = {}
  ): Promise<Response> {
    return window.fetch(url, { ...init, signal: this.controller!.signal });
  }

  protected abstract runLookup(): Promise<CitationLookupResult>;
}
