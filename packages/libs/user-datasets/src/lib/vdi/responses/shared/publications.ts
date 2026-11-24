import * as io from 'io-ts';

export const datasetPublicationType = io.union([
  io.literal('pmid'),
  io.literal('doi'),
]);
export type PublicationType = io.TypeOf<typeof datasetPublicationType>;

export const datasetPublication = io.intersection([
  io.type({
    identifier: io.string,
    citation: io.string,
  }),
  io.partial({
    type: datasetPublicationType,
    isPrimary: io.boolean,
  }),
]);
export type Publication = io.TypeOf<typeof datasetPublication>;
