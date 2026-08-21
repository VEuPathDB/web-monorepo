import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { orderBy, partialRight } from 'lodash';

import * as mesa from '@veupathdb/coreui/lib/components/Mesa/types';
import Mesa from '@veupathdb/coreui/lib/components/Mesa/Ui/Mesa';
import { MesaSortObject } from '@veupathdb/coreui/lib/components/Mesa/types';
import { projectIdToDisplayName } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';

import {
  DatasetId,
  DatasetListEntry as Dataset,
  VdiServiceConfig
} from '../../../../../Service';
import { projectId } from '../../../../../config';
import * as util from '../../../../../Utils';
import { ifDefined, Nullable, Possible, SimpleState } from '../../../../../Utils';

// FIXME: help text values are to be shared with all tables having these columns
const DatasetColumns = {
  DatasetName: [
    'name',
    'Dataset Name',
    '',
  ],
  DatasetID: [
    'datasetId',
    'VEuPathDB ID',
    'A stable, unique identifier assigned by VEuPathDB and that be used to'
    + ' reference or cite this dataset.',
  ],
  Summary: [
    'summary',
    'Summary',
    'A short description of the dataset.'
  ],
  Category: [
    'type',
    'Category',
    'Dataset classification, according to the biological characteristics and'
    + ' structure of the data it contains.',
  ],
  Project: [
    'installTargets',
    'VEuPathDB Project',
    'VEuPathDB component website (ex: PlasmoDB, FungiDB, ToxoDB, etc.) where'
    + ' the dataset was integrated.',
  ],
  Uploader: [
    'owner',
    'Uploaded By',
    'The person or organization who uploaded this dataset through the User'
    + 'Datasets workflow.'
  ],
  Shares: [
    'shares',
    'Shared With',
    'Names of collaborators the owner has explicitly invited to discover,'
    + ' explore, and download this dataset.'
  ],
  Visibility: [
    'visibility',
    'Visibility',
    'Public datasets can be discovered and explored by the research community.'
    + ' Private datasets can only be discovered and explored by the uploader'
    + ' and collaborators the uploader has explicitly invited.'
  ],
  Version: [
    'created',
    'Version & Date',
    'The date and version of the dataset as it currently appears.'
  ],
} as const;


export interface MetadataImportTableProps {
  readonly siteDisplayName: string;
  readonly baseUrl: string;
  readonly vdiConfig: VdiServiceConfig;
  readonly dataNoun: util.DataNoun;
  readonly userId: number;
  readonly datasets: Dataset[];
  readonly publicDatasetsEnabled: boolean;

  readonly selection: SimpleState<Possible<DatasetId>>;
}

type TableColumn<K extends keyof Dataset> =
  mesa.MesaColumn<Dataset, K, Dataset[K]>;

type TableCellProps = mesa.CellProps<Dataset>;

interface TableRowProps {
  readonly row: Dataset;
  readonly index: number;
}

export function DatasetSelectionTable(
  props: MetadataImportTableProps
): ReactElement {
  const [filterString, setFilterString] = useState<Nullable<string>>(null);
  const [filteredDatasets, setFilteredDatasets] = useState(props.datasets);
  const [onlyMyDatasets, setOnlyMyDatasets] = useState(false);
  const [onlyThisSite, setOnlyThisSite] = useState(false);
  const [sortBy, setSortBy] = useState<MesaSortObject<keyof Dataset>>({
    columnKey: 'created',
    direction: 'desc'
  });

  useEffect(() => {
    let filtered = filterDatasets(props.datasets, {
      query: filterString,
      excludePublic: onlyMyDatasets,
      excludeOtherSites: onlyThisSite,
      userId: props.userId,
    });

    filtered = sortDatasets(filtered, sortBy);

    setFilteredDatasets(filtered);
  }, [
    filterString,
    onlyMyDatasets,
    onlyThisSite,
    sortBy,
    props.userId,
    props.datasets,
  ])

  return (
    <Mesa
      state={{
        rows: props.datasets,
        filteredRows: filteredDatasets,
        columns: makeTableColumns(props),
        uiState: {
          searchQuery: filterString ?? '',
          sort: sortBy,
        },
        options: {
          editableColumns: false,
          toolbar: true,
          hideSelectAll: true,
          getRowId: (row) => row.datasetId,
          isRowSelected: (row) => row.datasetId === props.selection.get(),
        },
        eventHandlers: {
          onRowSelect: it => props.selection.set(it.datasetId),
          onRowDeselect: _ => props.selection.set(undefined),
          onSearch: setFilterString,
          onSort: ({ key: columnKey }, direction) => setSortBy({ columnKey, direction }),
        },
        actions: [
          { element: onlyMyDatasetsToggle(onlyMyDatasets, setOnlyMyDatasets) },
          { element: onlyThisSiteToggle(onlyThisSite, setOnlyThisSite, props.siteDisplayName) },
        ],
      }}
    >
      {
        // Bizarrely, the Mesa component's `children` property is used as either
        // the toolbar or action bar content depending on undocumented
        // combinations of options and handlers above.
        //
        // In this case, the toolbar is enabled which will lead to the row-count
        // element being shown as part of the toolbar and not the action bar.
        rowCounts(props.datasets.length, filteredDatasets.length)
      }
    </Mesa>
  );
}

// region Columns

function makeTableColumns(props: MetadataImportTableProps): TableColumn<any>[] {
  const columns: TableColumn<any>[] = [
    column(DatasetColumns.DatasetName, true),
    column(DatasetColumns.DatasetID, false),
    column(DatasetColumns.Summary, false),
    column(DatasetColumns.Category, true, ({ row }) => row.type.category),
    column(DatasetColumns.Project, true, renderProjects),
    column(DatasetColumns.Uploader, true, partialRight(renderUploader, props)),
    column(DatasetColumns.Shares, false, partialRight(renderShares, props)),
  ];

  if (props.publicDatasetsEnabled) {
    columns.push(column(DatasetColumns.Visibility, true, renderVisibility));
  }

  columns.push(column(DatasetColumns.Version, true, renderVersion));

  return columns;
}

function column<K extends keyof Dataset>(
  [ key, name, helpText ]: readonly [K, string, string],
  sortable: boolean,
  renderCell: util.Function<TableCellProps, ReactNode> = defaultColumn(key),
  getValue?: util.Function<TableRowProps, Dataset[K]>
): mesa.MesaColumn<Dataset, K, Dataset[K]> {
  return {
    key,
    name,
    helpText,
    sortable,
    renderCell,
    getValue,
    className: key,
  };
}

function defaultColumn(
  key: keyof Dataset
): util.Function<TableCellProps, string> {
  return ({ row }) => String(row[key]);
}

function renderProjects({ row }: TableCellProps): string {
  return row.installTargets.map(projectIdToDisplayName).join(', ');
}

function renderUploader(
  { row }: TableCellProps,
  { userId }: MetadataImportTableProps
): ReactNode {
  return row.owner.userId === userId ? (
    <span className="faded">Me</span>
  ) : (
    <span>{util.datasetUserFullName(row.owner)}</span>
  );
}

function renderShares(
  { row }: TableCellProps,
  props: MetadataImportTableProps
): ReactNode {
  if (row.owner.userId !== props.userId) {
    return 'Me';
  }

  return util.isNonEmpty(row.shares) ? (
    row.shares.map(util.datasetUserFullName).join(', ')
  ) : (
    <span className="faded">N/A</span>
  );
}

function renderVisibility({ row: { visibility } }: TableCellProps): string {
  return visibility === 'public' ? 'Public' : 'Private';
}

const VersionPattern = /^\w+\.(\d+)$/;
function renderVersion({ row }: TableCellProps): string {
  let version = '1';

  const idMatch = VersionPattern.exec(row.datasetId);
  if (Array.isArray(idMatch) && idMatch.length === 2) {
    version = idMatch[1];
  }

  return `v${version}, ${row.created.substring(0, 10)}`;
}

// endregion Columns

// region Sorting

function sortDatasets(rows: readonly Dataset[], by: MesaSortObject<keyof Dataset>): Dataset[] {
  const valueFn: util.Function<Dataset, any> = (row) => {
    switch (by.columnKey) {
      case 'type':
        return row.type.category;
      case 'installTargets':
        return row.installTargets.join(' ');
      case 'owner':
        return (row.owner.firstName + ' ' + row.owner.lastName).toLowerCase();
      default:
        return row[by.columnKey];
    }
  };

  return orderBy(rows, valueFn, by.direction);
}

// endregion Sorting

// region Toolbar

interface FilterOptions {
  readonly query: Nullable<string>;
  readonly excludePublic: boolean;
  readonly excludeOtherSites: boolean;
  readonly userId: number;
}

function filterDatasets(
  datasets: readonly Dataset[],
  filters: FilterOptions
): Dataset[] {
  const out: Dataset[] = [];

  for (const dataset of datasets) {
    // If we have a query string, but that query string does not match the
    // dataset row, then exclude the dataset.
    if (filters.query && !matchesQuery(dataset, filters.query)) {
      continue;
    }

    // If we are excluding other sites, and the dataset does not target the
    // current site, then exclude the dataset.
    if (filters.excludeOtherSites) {
      if (!dataset.installTargets.includes(projectId)) {
        continue;
      }
    }

    // If we are excluding datasets that are only available because they are
    // public, AND the dataset is public, AND the dataset is not otherwise
    // visible to the user, then exclude the dataset.
    if (filters.excludePublic && dataset.visibility === 'public') {
      if (!isAlwaysVisibleTo(dataset, filters.userId)) {
        continue;
      }
    }

    out.push(dataset);
  }

  return out;
}

function matchesQuery(dataset: Dataset, query: string): boolean {
  return dataset.datasetId === query
    || dataset.name.indexOf(query) > -1;
}

function isAlwaysVisibleTo(dataset: Dataset, userId: number): boolean {
  return (
    dataset.owner.userId === userId ||
    (Array.isArray(dataset.shares) &&
      dataset.shares.some((it) => it.userId === userId))
  );
}

function rowCounts(total: number, current: number): ReactElement {
  return <span className="row-count">Showing {current} of {total} datasets</span>;
}

function onlyMyDatasetsToggle(
  value: boolean,
  setValue: util.Consumer<boolean>
): ReactElement {
  return (
    <>
      <input
        id="meta-import-modal-omdt"
        type="checkbox"
        checked={value}
        onChange={(e) => ifDefined(e.target?.checked, setValue)}
      />{' '}
      <label htmlFor="meta-import-modal-omdt">
        Only show datasets owned by or shared with me
      </label>
    </>
  );
}

function onlyThisSiteToggle(
  value: boolean,
  setValue: util.Consumer<boolean>,
  siteName: string,
): ReactElement {
  return <>
    <input
      id="meta-import-modal-otst"
      type="checkbox"
      checked={value}
      onChange={(e) => ifDefined(e.target?.checked, setValue)}
    />{' '}
    <label htmlFor="meta-import-modal-otst">
      Only show datasets uploaded to <strong>{siteName}</strong>
    </label>
  </>;
}

// endregion Toolbar