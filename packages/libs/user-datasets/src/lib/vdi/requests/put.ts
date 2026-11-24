import { DatasetPatchRequest } from './patches';

export interface DatasetPutDetails extends DatasetPatchRequest {
  origin: string;
  revisionNote: string;
}

export type ShareReceiptAction = 'accept' | 'reject';
