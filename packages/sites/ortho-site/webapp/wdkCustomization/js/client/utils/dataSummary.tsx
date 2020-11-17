import React from 'react';

import {
  Unpack,
  arrayOf,
  constant,
  nullValue,
  oneOf,
  record,
  string
} from 'wdk-client/Utils/Json';

import { DataTableColumns } from 'ortho-client/utils/dataTables';
import { TaxonUiMetadata } from 'ortho-client/utils/taxons';

const proteomeSummaryRowDecoder = record({
  clustered_sequences: string,
  core_peripheral: oneOf(constant('Core'), constant('Peripheral')),
  description: oneOf(string, nullValue),
  groups: string,
  name: string,
  resource_name: string,
  resource_url: string,
  sequences: string,
  root_taxon: string,
  three_letter_abbrev: string
});

type ProteomeSummaryRow = Unpack<typeof proteomeSummaryRowDecoder>;

export const proteomeSummaryRowsDecoder = arrayOf(proteomeSummaryRowDecoder);

export type ProteomeSummaryRows = Unpack<typeof proteomeSummaryRowsDecoder>;

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
  proteomeSummaryRows: ProteomeSummaryRows
): ProteomeSummaryRows {
  return proteomeSummaryRows.map(
    proteomeSummaryRow => ({
      ...proteomeSummaryRow,
      root_taxon: species[proteomeSummaryRow.three_letter_abbrev].rootTaxon
    })
  );
}

export const RELEASE_SUMMARY_COLUMN_ORDER = [
  'root_taxon',
  'name',
  'core_peripheral',
  'three_letter_abbrev',
  'resource_name',
  'resource_url',
  'description',
  'sequences',
  'clustered_sequences',
  'groups'
] as const;
