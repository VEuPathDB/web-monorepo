import {
  array,
  boolean,
  intersection,
  literal,
  partial,
  string,
  type,
  TypeOf,
  union,
} from 'io-ts';

export const ioJobStatus = union([
  literal('queued'),
  literal('in-progress'),
  literal('complete'),
  literal('failed'),
  literal('expired'),
]);

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
