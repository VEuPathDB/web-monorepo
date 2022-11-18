import { array, intersection, partial, string, type, TypeOf } from 'io-ts';
import { ioBlastConfig } from '../blast/blast-all';
import { ioJobStatus, ioQueryJobConfig, ioQueryJobUserMeta } from './common';

export const ioQueryJobListEntry = intersection([
  type({
    queryJobID: string,
    status: ioJobStatus,
    site: string,
    createdOn: string,
  }),
  partial({
    userMeta: ioQueryJobUserMeta,
  }),
]);

export const ioQueryJobListResponse = array(ioQueryJobListEntry);

export const ioQueryJobCreateRequest = intersection([
  type({
    jobConfig: ioQueryJobConfig,
    blastConfig: ioBlastConfig,
  }),
  partial({
    userMeta: ioQueryJobUserMeta,
  }),
]);

export const ioQueryJobCreateResponse = type({ queryJobID: string });

export type IOQueryJobListEntry = TypeOf<typeof ioQueryJobListEntry>;
export type IOQueryJobListResponse = TypeOf<typeof ioQueryJobListResponse>;
export type IOQueryJobCreateRequest = TypeOf<typeof ioQueryJobCreateRequest>;
export type IOQueryJobCreateResponse = TypeOf<typeof ioQueryJobCreateResponse>;
