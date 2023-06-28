import { array, intersection, partial, string, type, TypeOf } from 'io-ts';
import { ioJobStatus, ioQueryJobConfig, ioQueryJobUserMeta } from './common';
import { ioBlastConfig } from '../blast/blast-all';

export const ioQueryJobDetails = intersection([
  type({
    queryJobID: string,
    status: ioJobStatus,
    jobConfig: ioQueryJobConfig,
    blastConfig: ioBlastConfig,
    createdOn: string,
  }),
  partial({
    userMeta: ioQueryJobUserMeta,
    subJobs: array(string),
  }),
]);

export const ioQueryJobPatchRequest = partial({ userMeta: ioQueryJobUserMeta });

export type IOQueryJobDetails = TypeOf<typeof ioQueryJobDetails>;
export type IOQueryJobPatchRequest = TypeOf<typeof ioQueryJobPatchRequest>;
