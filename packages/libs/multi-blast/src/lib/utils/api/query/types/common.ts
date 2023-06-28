import {
  array,
  boolean,
  intersection,
  keyof,
  partial,
  string,
  type,
  TypeOf,
} from 'io-ts';

export const ioJobStatus = keyof({
  queued: null,
  'in-progress': null,
  complete: null,
  failed: null,
  expired: null,
});

export const ioJobTarget = type({
  targetDisplayName: string,
  targetFile: string,
});

export const ioQueryJobUserMeta = partial({
  summary: string,
  description: string,
});

export const ioQueryJobConfig = intersection([
  type({
    site: string,
    targets: array(ioJobTarget),
  }),
  partial({
    query: string,
    addToUserCollection: boolean,
  }),
]);

export type IOJobStatus = TypeOf<typeof ioJobStatus>;
export type IOJobTarget = TypeOf<typeof ioJobTarget>;
export type IOQueryJobUserMeta = TypeOf<typeof ioQueryJobUserMeta>;
export type IOQueryJobConfig = TypeOf<typeof ioQueryJobConfig>;
