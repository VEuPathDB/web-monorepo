import React from 'react';

import { zipWith } from 'lodash';

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

export interface ProteomeSummaryRow extends CommonRowEntries {
  clustered_sequences: string;
  groups: string;
  sequences: string;
  description: string | null;
  resource_name: string;
  resource_url: string;
}

export type GenomeSourcesRows = GenomeSourcesRow[];

export type GenomeStatisticsRows = GenomeStatisticsRow[];

export type ProteomeSummaryRows = ProteomeSummaryRow[];

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

export const RELEASE_SUMMARY_COLUMNS: DataTableColumns<
  ProteomeSummaryRow,
  keyof ProteomeSummaryRow
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
  },
  clustered_sequences: {
    key: 'clustered_sequences',
    name: '# Clustered Sequences',
    sortable: true,
    makeOrder: ({ clustered_sequences }) => Number(clustered_sequences)
  },
  groups: {
    key: 'groups',
    name: '# Groups',
    sortable: true,
    makeOrder: ({ groups }) => Number(groups)
  },
  sequences: {
    key: 'sequences',
    name: '# Sequences',
    sortable: true,
    makeOrder: ({ sequences }) => Number(sequences)
  },
  resource_name: {
    key: 'resource_name',
    name: 'Resource',
    sortable: true
  },
  resource_url: {
    key: 'resource_url',
    name: 'URL',
    sortable: true
  },
  description: {
    key: 'description',
    name: 'Description',
    sortable: true,
    makeOrder: ({ description }) => description || '',
    makeSearchableString: description => description || 'N/A',
    renderCell: ({ value }) =>
      value ? value : <span className="EmptyDescription">N/A</span>
  }
};

export function makeReleaseSummaryRows(
  { species }: TaxonUiMetadata,
  genomeStatisticsRows: GenomeStatisticsRows,
  genomeSourcesRows: GenomeSourcesRows
): ProteomeSummaryRows {
  return zipWith(
    genomeStatisticsRows,
    genomeSourcesRows,
    (genomeStatisticsRow, genomeSummaryRow) => ({
      ...genomeStatisticsRow,
      ...genomeSummaryRow,
      root_taxon: species[genomeStatisticsRow.three_letter_abbrev].rootTaxon
    })
  );
}

export const RELEASE_SUMMARY_COLUMN_ORDER = [
  'root_taxon',
  'name',
  'core_peripheral',
  'three_letter_abbrev',
  'sequences',
  'clustered_sequences',
  'groups',
  'resource_name',
  'resource_url',
  'description'
] as const;
