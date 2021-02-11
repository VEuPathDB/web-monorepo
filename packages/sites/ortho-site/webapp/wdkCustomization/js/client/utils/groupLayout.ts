import {
  Decoder,
  Unpack,
  arrayOf,
  combine,
  constant,
  number,
  objectOf,
  oneOf,
  record,
  string
} from '@veupathdb/wdk-client/lib/Utils/Json';
import { EdgeType } from 'ortho-client/utils/clusterGraph';
import {
  TaxonEntries,
  TaxonEntry,
  taxonEntryDecoder,
  taxonEntriesDecoder
} from 'ortho-client/utils/taxons';

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
  description: string;
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

export const edgeTypeDecoder: Decoder<EdgeType> = oneOf(
  constant('O'),
  constant('C'),
  constant('P'),
  constant('L'),
  constant('M'),
  constant('N')
);

export const edgeEntryDecoder: Decoder<EdgeEntry> = record({
  E: string,
  Q: number,
  S: number,
  T: edgeTypeDecoder,
  queryId: string,
  score: number,
  subjectId: string
});

export const edgeEntriesDecoder: Decoder<EdgeEntries> = objectOf(edgeEntryDecoder);

export const nodeEntryDecoder: Decoder<NodeEntry> = record({
  x: string,
  y: string,
  i: number,
  id: string
});

export const nodeEntriesDecoder: Decoder<NodeEntries> = objectOf(nodeEntryDecoder);

export const ecNumberEntryDecoder: Decoder<EcNumberEntry> = record({
  code: string,
  color: string,
  count: number,
  description: string,
  index: number
});

export const geneEntryDecoder: Decoder<GeneEntry> = record({
  description: string,
  ecNumbers: arrayOf(string),
  length: number,
  pfamDomains: objectOf(arrayOf(number)),
  taxon: taxonEntryDecoder
});

export const pfamDomainEntryDecoder: Decoder<PfamDomainEntry> = record({
  accession: string,
  color: string,
  count: number,
  description: string,
  index: number,
  symbol: string
});

export const groupFieldDecoder: Decoder<GroupField> = record({
  ecNumbers: objectOf(ecNumberEntryDecoder),
  genes: objectOf(geneEntryDecoder),
  pfamDomains: objectOf(pfamDomainEntryDecoder)
});

export const groupLayoutDecoder: Decoder<GroupLayout> = record({
  edges: edgeEntriesDecoder,
  nodes: nodeEntriesDecoder,
  group: groupFieldDecoder,
  minEvalueExp: number,
  maxEvalueExp: number,
  size: number,
  taxonCounts: objectOf(number),
  taxons: taxonEntriesDecoder
});

export const groupLayoutResponseDecoder = oneOf(
  record({ layoutOffered: constant(false) }),
  combine(
    record({ layoutOffered: constant(true) }),
    groupLayoutDecoder
  )
);

export type GroupLayoutResponse = Unpack<typeof groupLayoutResponseDecoder>;
