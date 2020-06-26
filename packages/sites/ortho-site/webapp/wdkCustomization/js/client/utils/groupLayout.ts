import * as Decode from 'wdk-client/Utils/Json';

import { EdgeType } from './clusterGraph';
import { TaxonEntries, TaxonEntry, taxonEntryDecoder, taxonEntriesDecoder } from './taxons';

export interface GroupLayout {
  edges: EdgeEntries;
  nodes: NodeEntries;
  group: GroupField;
  minEvalueExp: number;
  maxEvalueExp: number;
  size: number;
  taxonCounts: Record<string, number>;
  taxons: TaxonEntries;
}

export type EdgeEntries = Record<string, EdgeEntry>;

export interface EdgeEntry {
  E: string;
  Q: number;
  S: number;
  T: EdgeType;
  queryId: string;
  score: number;
  subjectId: string;
}

export type NodeEntries = Record<string, NodeEntry>;

export interface NodeEntry {
  x: string;
  y: string;
  i: number;
  id: string;
}

export interface GroupField {
  ecNumbers: Record<string, EcNumberEntry>;
  genes: Record<string, GeneEntry>;
  pfamDomains: Record<string, PfamDomainEntry>;
}

export interface EcNumberEntry {
  code: string;
  color: string;
  count: number;
  index: number;
}

export interface GeneEntry {
  description: string;
  ecNumbers: string[];
  length: number;
  pfamDomains: Record<string, number[]>;
  taxon: TaxonEntry;
}

export interface PfamDomainEntry {
  accession: string;
  color: string;
  count: number;
  description: string;
  index: number;
  symbol: string;
}

export const edgeTypeDecoder: Decode.Decoder<EdgeType> = Decode.oneOf(
  Decode.constant('O'),
  Decode.constant('C'),
  Decode.constant('P'),
  Decode.constant('L'),
  Decode.constant('M'),
  Decode.constant('N')
);

export const edgeEntryDecoder: Decode.Decoder<EdgeEntry> = Decode.combine(
  Decode.field('E', Decode.string),
  Decode.field('Q', Decode.number),
  Decode.field('S', Decode.number),
  Decode.field('T', edgeTypeDecoder),
  Decode.field('queryId', Decode.string),
  Decode.field('score', Decode.number),
  Decode.field('subjectId', Decode.string)
);

export const edgeEntriesDecoder: Decode.Decoder<EdgeEntries> = Decode.objectOf(edgeEntryDecoder);

export const nodeEntryDecoder: Decode.Decoder<NodeEntry> = Decode.combine(
  Decode.field('x', Decode.string),
  Decode.field('y', Decode.string),
  Decode.field('i', Decode.number),
  Decode.field('id', Decode.string)
);

export const nodeEntriesDecoder: Decode.Decoder<NodeEntries> = Decode.objectOf(nodeEntryDecoder);

export const ecNumberEntryDecoder: Decode.Decoder<EcNumberEntry> = Decode.combine(
  Decode.field('code', Decode.string),
  Decode.field('color', Decode.string),
  Decode.field('count', Decode.number),
  Decode.field('index', Decode.number)
);

export const geneEntryDecoder: Decode.Decoder<GeneEntry> = Decode.combine(
  Decode.field('description', Decode.string),
  Decode.field('ecNumbers', Decode.arrayOf(Decode.string)),
  Decode.field('length', Decode.number),
  Decode.field('pfamDomains', Decode.objectOf(Decode.arrayOf(Decode.number))),
  Decode.field('taxon', taxonEntryDecoder)
);

export const pfamDomainEntryDecoder: Decode.Decoder<PfamDomainEntry> = Decode.combine(
  Decode.field('accession', Decode.string),
  Decode.field('color', Decode.string),
  Decode.field('count', Decode.number),
  Decode.field('description', Decode.string),
  Decode.field('index', Decode.number),
  Decode.field('symbol', Decode.string)
);

export const groupFieldDecoder: Decode.Decoder<GroupField> = Decode.combine(
  Decode.field('ecNumbers', Decode.objectOf(ecNumberEntryDecoder)),
  Decode.field('genes', Decode.objectOf(geneEntryDecoder)),
  Decode.field('pfamDomains', Decode.objectOf(pfamDomainEntryDecoder))
);

export const groupLayoutDecoder: Decode.Decoder<GroupLayout> = Decode.combine(
  Decode.field('edges', edgeEntriesDecoder),
  Decode.field('nodes', nodeEntriesDecoder),
  Decode.field('group', groupFieldDecoder),
  Decode.field('minEvalueExp', Decode.number),
  Decode.field('maxEvalueExp', Decode.number),
  Decode.field('size', Decode.number),
  Decode.field('taxonCounts', Decode.objectOf(Decode.number)),
  Decode.field('taxons', taxonEntriesDecoder)
);
