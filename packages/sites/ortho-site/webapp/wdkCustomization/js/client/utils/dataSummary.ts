import {
  Decoder,
  arrayOf,
  constant,
  nullValue,
  oneOf,
  record,
  string
} from 'wdk-client/Utils/Json';

export interface GenomeSourcesRow {
  core_peripheral: 'Core' | 'Peripheral';
  description: string | null;
  name: string;
  resource_name: string;
  resource_url: string;
  root_taxon: string;
  three_letter_abbrev: string;
}

export type GenomeSourcesRows = GenomeSourcesRow[];

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
