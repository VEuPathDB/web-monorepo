import * as Decode from 'wdk-client/Utils/Json';

import { TaxonEntries, taxonEntriesDecoder } from './taxons';

export interface GroupLayout {
  edges: unknown;
  nodes: unknown;
  group: unknown;
  minEvalueExp: number;
  maxEvalueExp: number;
  size: number;
  taxonCounts: Record<string, number>;
  taxons: TaxonEntries;
}

export const groupLayoutDecoder: Decode.Decoder<GroupLayout> = Decode.combine(
  Decode.field('edges', Decode.ok),
  Decode.field('nodes', Decode.ok),
  Decode.field('group', Decode.ok),
  Decode.field('minEvalueExp', Decode.number),
  Decode.field('maxEvalueExp', Decode.number),
  Decode.field('size', Decode.number),
  Decode.field('taxonCounts', Decode.objectOf(Decode.number)),
  Decode.field('taxons', taxonEntriesDecoder)
);
