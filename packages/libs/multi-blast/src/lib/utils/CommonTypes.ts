export type SelectedResult =
  | { type: 'combined' }
  | { type: 'individual'; resultIndex: number };

export interface IndividualQuery {
  defline: string;
  jobId: string;
  query: string;
}
