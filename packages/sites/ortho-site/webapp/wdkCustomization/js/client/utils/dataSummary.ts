import {
  Decoder,
  arrayOf,
  constant,
  nullValue,
  oneOf,
  record,
  string
} from 'wdk-client/Utils/Json';

import { ProteinType } from 'ortho-client/utils/clusterGraph';
import { DataTableColumns } from 'ortho-client/utils/dataTables';
import { TaxonUiMetadata } from 'ortho-client/utils/taxons';

interface CommonRowEntries {
  core_peripheral: ProteinType;
  name: string;
  root_taxon: string;
  three_letter_abbrev: string;
}

export interface GenomeSourcesRow extends CommonRowEntries {
  description: string | null;
  resource_name: string;
  resource_url: string;
}

export interface GenomeStatisticsRow extends CommonRowEntries {
  clustered_sequences: string;
  groups: string;
  sequences: string;
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

export const COMMON_RELEASE_SUMMARY_COLUMNS: DataTableColumns<
  CommonRowEntries,
  keyof CommonRowEntries
> = {
  core_peripheral: {
    key: 'core_peripheral',
    name: 'Core/Peripheral',
    sortable: true
  },
  name: {
    key: 'name',
    name: 'Name',
    sortable: true
  },
  root_taxon: {
    key: 'root_taxon',
    name: 'Category',
    sortable: true
  },
  three_letter_abbrev: {
    key: 'three_letter_abbrev',
    name: 'Abbreviation',
    sortable: true
  }
};

export function makeDataTableRows<R extends CommonRowEntries>(
  { species }: TaxonUiMetadata,
  rows: R[]
): R[] {
  return rows.map(
    row => ({
      ...row,
      root_taxon: species[row.three_letter_abbrev].rootTaxon
    })
  );
}
