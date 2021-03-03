import React from 'react';

import {
  Unpack,
  arrayOf,
  constant,
  nullValue,
  oneOf,
  record,
  string
} from '@veupathdb/wdk-client/lib/Utils/Json';

import { DataTableColumns } from 'ortho-client/utils/dataTables';
import { TaxonUiMetadata } from 'ortho-client/utils/taxons';

const proteomeSummaryRowDecoder = record({
  clustered_sequences: string,
  core_peripheral: oneOf(constant('Core'), constant('Peripheral')),
  resource_version: oneOf(string, nullValue),
  groups: string,
  name: string,
  resource_name: string,
  resource_url: string,
  sequences: string,
  root_taxon: string,
  three_letter_abbrev: string,
  most_recent: string
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
    helpText: 'There are 150 Core species whose proteomes were used to form the initial core groups. The remaining species on the site are Peripheral species. The Peripheral proteins were mapped into core groups if they met sequence similarity thresholds. Proteins that did not map into core groups were collected and used to form Residual groups.',
    sortable: true
  },
  name: {
    key: 'name',
    name: 'Name',
    helpText: 'Genus, species and strain name',
    sortable: true
  },
  root_taxon: {
    key: 'root_taxon',
    name: 'Category',
    helpText: 'The taxonomic category of the organism. ALVE: Alveolata, AMOE: Amoeba, ARCH: Archaea, EUGL: Euglenozoa, FUNG: Fungi, META: Metazoa, OBAC: Other Bacteria, OEUK: Other Eukaryota, PROT: Proteobacteria, VIRI: Viridiplantae',
    sortable: true
  },
  three_letter_abbrev: {
    key: 'three_letter_abbrev',
    name: 'Abbreviation',
    helpText: 'Usually, this a four-letter abbreviation for this organism at OrthoMCL. Sometimes, the name follows the format abcd-old, in which case it is a core organism that also has an updated proteome which has been added to OrthoMCL as a peripheral organism. The updated name in this case is abcd.',
    sortable: true
  },
  clustered_sequences: {
    key: 'clustered_sequences',
    name: '# Grouped Sequences',
    helpText: 'Number of proteins that are part of an ortholog group. A protein would not be part of a group if it was poor quality (e.g., several stop codons or very few amino acids).',
    sortable: true,
    makeOrder: ({ clustered_sequences }) => Number(clustered_sequences)
  },
  groups: {
    key: 'groups',
    name: '# Groups',
    helpText: 'Number of ortholog groups in which the organism proteins are found.',
    sortable: true,
    makeOrder: ({ groups }) => Number(groups)
  },
  sequences: {
    key: 'sequences',
    name: '# Sequences',
    helpText: 'Number of proteins in the organism that have been processed by OrthoMCL. This will depend on whether the gene was structurally annotated to encode a protein.',
    sortable: true,
    makeOrder: ({ sequences }) => Number(sequences)
  },
  resource_name: {
    key: 'resource_name',
    name: 'Resource',
    helpText: 'The source of the organism proteome.',
    sortable: true
  },
  resource_url: {
    key: 'resource_url',
    name: 'URL',
    helpText: 'The URL of the site from which the organism proteome was obtained.',
    sortable: true
  },
  most_recent: {
    key: 'most_recent',
    name: 'Most recent version',
    sortable: true,
    helpText: 'Type most_recent in the search box to show only the most recent version.',
  },
  resource_version: {
    key: 'resource_version',
    name: 'Proteome version',
    sortable: true,
    makeOrder: ({ resource_version }) => resource_version || '',
    makeSearchableString: resource_version => resource_version || 'N/A',
    renderCell: ({ value }) =>
      value ? value : <span className="EmptyResourceVersion">N/A</span>
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
  'resource_version',
  'most_recent',
  'sequences',
  'clustered_sequences',
  'groups'
] as const;
