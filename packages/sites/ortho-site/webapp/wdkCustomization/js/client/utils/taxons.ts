import {
  Decoder,
  boolean,
  lazy,
  number,
  objectOf,
  record,
  string
} from 'wdk-client/Utils/Json';

export interface TaxonEntry {
  abbrev: string;
  children: Record<string, TaxonEntry>;
  commonName: string;
  id: number;
  name: string;
  sortIndex: number;
  species: boolean;
}

export type TaxonEntries = Record<string, TaxonEntry>;

export const taxonEntryDecoder: Decoder<TaxonEntry> = record({
  abbrev: string,
  children: lazy(() => objectOf(taxonEntryDecoder)),
  commonName: string,
  id: number,
  name: string,
  sortIndex: number,
  species: boolean
});

export const taxonEntriesDecoder: Decoder<TaxonEntries> = objectOf(taxonEntryDecoder);
