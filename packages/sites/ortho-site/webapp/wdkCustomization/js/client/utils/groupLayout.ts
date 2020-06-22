import * as Decode from 'wdk-client/Utils/Json';

export interface GroupLayout {
  edges: unknown;
  nodes: unknown;
  group: unknown;
  minEValueExp: unknown;
  maxEValueExp: unknown;
  size: unknown;
  taxonCounts: unknown;
  taxons: unknown;
}

export const groupLayoutDecoder: Decode.Decoder<GroupLayout> = Decode.combine(
  Decode.field('edges', Decode.ok),
  Decode.field('nodes', Decode.ok),
  Decode.field('group', Decode.ok),
  Decode.field('minEValueExp', Decode.ok),
  Decode.field('maxEValueExp', Decode.ok),
  Decode.field('size', Decode.ok),
  Decode.field('taxonCounts', Decode.ok),
  Decode.field('taxons', Decode.ok)
);
