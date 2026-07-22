export type PublicationCitationResult =
  | { readonly status: 'not-found' }
  | {
      readonly status: 'error';
      readonly error: Error;
    }
  | {
      readonly status: 'success';
      readonly citation: string;
    };
