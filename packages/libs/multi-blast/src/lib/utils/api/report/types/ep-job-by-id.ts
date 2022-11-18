import { intersection, partial, string, type, TypeOf } from 'io-ts';
import { ioJobStatus, ioReportJobUserMeta } from './common';
import { ioBlastFormatConfig } from '../blast/blast-config-format';

export const ioReportJobPatchRequest = partial({
  userMeta: ioReportJobUserMeta,
});

export const ioReportJobDetails = intersection([
  type({
    reportJobID: string,
    queryJobID: string,
    status: ioJobStatus,
    blastConfig: ioBlastFormatConfig,
  }),
  partial({
    userMeta: ioReportJobUserMeta,
  }),
]);

export type IOReportJobPatchRequest = TypeOf<typeof ioReportJobPatchRequest>;
export type IOReportJobDetails = TypeOf<typeof ioReportJobDetails>;
