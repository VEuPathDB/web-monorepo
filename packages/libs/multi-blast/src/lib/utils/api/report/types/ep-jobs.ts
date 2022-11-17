import { boolean, intersection, partial, string, type, TypeOf } from 'io-ts';
import { ioBlastFormatConfig } from '../blast/blast-config-format';
import { ioJobStatus, ioReportJobUserMeta } from './common';

export const ioReportJobCreateRequest = intersection([
  type({
    queryJobID: string,
  }),
  partial({
    blastConfig: ioBlastFormatConfig,
    addToUserCollection: boolean,
    userMeta: ioReportJobUserMeta,
  }),
]);

export const ioReportJobListEntry = intersection([
  type({
    reportJobID: string,
    queryJobID: string,
    status: ioJobStatus,
  }),
  partial({
    userMeta: ioReportJobUserMeta,
  }),
]);

export const ioReportJobCreateResponse = type({ reportJobID: string });

export type IOReportJobCreateRequest = TypeOf<typeof ioReportJobCreateRequest>;
export type IOReportJobListEntry = TypeOf<typeof ioReportJobListEntry>;
export type IOReportJobCreateResponse = TypeOf<
  typeof ioReportJobCreateResponse
>;
