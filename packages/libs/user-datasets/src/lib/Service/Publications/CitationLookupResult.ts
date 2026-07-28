export type CitationLookupResult =
  | { readonly status: 'cancelled' }
  | { readonly status: 'not-found' }
  | {
      readonly status: 'error';
      readonly error: Error;
    }
  | {
      readonly status: 'success';
      readonly citation: string;
    };
