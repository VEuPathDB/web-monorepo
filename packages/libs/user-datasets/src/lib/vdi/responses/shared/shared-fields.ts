import * as io from 'io-ts';

export const StringArray = io.readonlyArray(io.string);

export const datasetTypeOutput = io.type({
  name: io.string,
  version: io.string,
  category: io.string,
});

export const datasetVisibility = io.union([
  io.literal('private'),
  io.literal('protected'),
  io.literal('public'),
  io.literal('controlled'),
]);

const datasetIdType = io.string;

export const partialUser = io.intersection([
  io.type({ userId: io.number }),
  io.partial({
    firstName: io.string,
    lastName: io.string,
    email: io.string,
    affiliation: io.string,
  }),
]);

export type DatasetId = io.TypeOf<typeof datasetIdType>;
export type Visibility = io.TypeOf<typeof datasetVisibility>;
export type DatasetType = io.TypeOf<typeof datasetTypeOutput>;
export type DatasetUser = io.TypeOf<typeof partialUser>;
