export type SelectedResult =
  | { type: 'combined' }
  | { type: 'individual'; resultIndex: number };

export interface IndividualQuery {
  jobId: string;
  query: string;
}
