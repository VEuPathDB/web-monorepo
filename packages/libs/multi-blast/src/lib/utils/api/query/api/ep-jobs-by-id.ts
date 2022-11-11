import { array, intersection, partial, string, type, TypeOf } from 'io-ts';
import { ioJobStatus, ioQueryJobConfig, ioQueryJobUserMeta } from './common';
import { ioBlastConfig } from '../blast/blast-all';

export const ioQueryJobDetails = intersection([
  type({
    queryJobID: string,
    status: ioJobStatus,
    jobConfig: ioQueryJobConfig,
    blastConfig: ioBlastConfig,
  }),
  partial({
    userMeta: ioQueryJobUserMeta,
    subJobs: array(string),
  }),
]);

export type IOQueryJobDetails = TypeOf<typeof ioQueryJobDetails>;
