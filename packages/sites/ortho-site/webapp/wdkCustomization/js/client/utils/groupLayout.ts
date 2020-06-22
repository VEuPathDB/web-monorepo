import * as Decode from 'wdk-client/Utils/Json';

export interface GroupLayout {
  edges: unknown;
  nodes: unknown;
  group: unknown;
  minEValueExp: number;
  maxEValueExp: number;
  size: number;
  taxonCounts: Record<string, number>;
  taxons: unknown;
}

export const groupLayoutDecoder: Decode.Decoder<GroupLayout> = Decode.combine(
  Decode.field('edges', Decode.ok),
  Decode.field('nodes', Decode.ok),
  Decode.field('group', Decode.ok),
  Decode.field('minEValueExp', Decode.number),
  Decode.field('maxEValueExp', Decode.number),
  Decode.field('size', Decode.number),
  Decode.field('taxonCounts', Decode.objectOf(Decode.number)),
  Decode.field('taxons', Decode.ok)
);
