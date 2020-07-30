import {
  Decoder,
  arrayOf,
  constant,
  nullValue,
  oneOf,
  record,
  string
} from 'wdk-client/Utils/Json';

import { ProteinType } from './clusterGraph';

export interface GenomeSourcesRow {
  core_peripheral: ProteinType;
  description: string | null;
  name: string;
  resource_name: string;
  resource_url: string;
  root_taxon: string;
  three_letter_abbrev: string;
}

export interface GenomeStatisticsRow {
  clustered_sequences: string;
  core_peripheral: ProteinType;
  groups: string;
  name: string;
  root_taxon: string;
  sequences: string;
  three_letter_abbrev: string;
}

export type GenomeSourcesRows = GenomeSourcesRow[];

export type GenomeStatisticsRows = GenomeStatisticsRow[];

const genomeSourcesRowDecoder: Decoder<GenomeSourcesRow> = record({
  core_peripheral: oneOf(constant('Core'), constant('Peripheral')),
  description: oneOf(string, nullValue),
  name: string,
  resource_name: string,
  resource_url: string,
  root_taxon: string,
  three_letter_abbrev: string
});

export const genomeSourcesRowsDecoder: Decoder<GenomeSourcesRows> =
  arrayOf(genomeSourcesRowDecoder);

const genomeStatisticsRowDecoder: Decoder<GenomeStatisticsRow> = record({
  clustered_sequences: string,
  core_peripheral: oneOf(constant('Core'), constant('Peripheral')),
  groups: string,
  name: string,
  root_taxon: string,
  sequences: string,
  three_letter_abbrev: string
});

export const genomeStatisticsRowsDecoder: Decoder<GenomeStatisticsRows> =
  arrayOf(genomeStatisticsRowDecoder);
