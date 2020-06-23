import * as Decode from 'wdk-client/Utils/Json';

import { TaxonEntries, TaxonEntry, taxonEntryDecoder, taxonEntriesDecoder} from './taxons';

export interface GroupLayout {
  edges: unknown;
  nodes: unknown;
  group: GroupField;
  minEvalueExp: number;
  maxEvalueExp: number;
  size: number;
  taxonCounts: Record<string, number>;
  taxons: TaxonEntries;
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
  Decode.field('edges', Decode.ok),
  Decode.field('nodes', Decode.ok),
  Decode.field('group', groupFieldDecoder),
  Decode.field('minEvalueExp', Decode.number),
  Decode.field('maxEvalueExp', Decode.number),
  Decode.field('size', Decode.number),
  Decode.field('taxonCounts', Decode.objectOf(Decode.number)),
  Decode.field('taxons', taxonEntriesDecoder)
);
