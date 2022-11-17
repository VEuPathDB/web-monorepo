import { record, string, TypeOf } from 'io-ts';
import { ioJobStatus } from './common';

export const ioBulkStatusResponse = record(string, ioJobStatus);

export type IOBulkStatusResponse = TypeOf<typeof ioBulkStatusResponse>;
