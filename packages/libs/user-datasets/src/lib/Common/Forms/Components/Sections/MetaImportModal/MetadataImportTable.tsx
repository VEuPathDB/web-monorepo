import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { partialRight } from 'lodash';

import * as mesa from '@veupathdb/coreui/lib/components/Mesa/types';
import Mesa from '@veupathdb/coreui/lib/components/Mesa/Ui/Mesa';
import { projectIdToDisplayName } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';

import {
  DatasetId,
  DatasetListEntry as Dataset,
  VdiServiceConfig
} from '../../../../../Service';
import { projectId } from '../../../../../config';
import UserDatasetStatus from '../../../../../Components/UserDatasetStatus';
import * as util from '../../../../../Utils';
import { Consumer, ifDefined, Nullable, Possible } from '../../../../../Utils';

export interface MetadataImportTableProps {
  readonly siteDisplayName: string;
  readonly baseUrl: string;
  readonly vdiConfig: VdiServiceConfig;
  readonly dataNoun: util.DataNoun;
  readonly userId: number;
  readonly datasets: Dataset[];
  readonly arePublicDatasetsEnabled: boolean;

  readonly selection: Possible<DatasetId>;
  readonly setSelection: Consumer<Possible<string>>;
}

type TableColumn<K extends keyof Dataset> = mesa.MesaColumn<
  Dataset,
  K,
  Dataset[K]
>;
type TableCellProps = mesa.CellProps<Dataset>;

interface TableRowProps {
  readonly row: Dataset;
  readonly index: number;
}

export function MetadataImportTable(
  props: MetadataImportTableProps
): ReactElement {
  const [filterString, setFilterString] = useState<Nullable<string>>(null);
  const [filteredDatasets, setFilteredDatasets] = useState(props.datasets);
  const [onlyMyDatasets, setOnlyMyDatasets] = useState(false);
  const [onlyThisSite, setOnlyThisSite] = useState(false);

  useEffect(() => {
    setFilteredDatasets(filterDatasets(props.datasets, {
      query: filterString,
      excludePublic: onlyMyDatasets,
      excludeOtherSites: onlyThisSite,
      userId: props.userId,
    }));
  }, [ filterString, onlyMyDatasets, onlyThisSite, props.userId, props.datasets ])

  return (
    <Mesa
      state={{
        rows: props.datasets,
        filteredRows: filteredDatasets,
        columns: makeTableColumns(props),
        uiState: {
          searchQuery: filterString ?? '',
        },
        options: {
          editableColumns: false,
          showCount: false,
          toolbar: true,
          hideSelectAll: true,
          getRowId: (row) => row.datasetId,
          isRowSelected: (row) => row.datasetId === props.selection,
        },
        eventHandlers: {
          onRowSelect: it => props.setSelection(it.datasetId),
          onRowDeselect: _ => props.setSelection(undefined),
          onSearch: setFilterString,
        },
        actions: [
          { element: onlyMyDatasetsToggle(onlyMyDatasets, setOnlyMyDatasets) },
          { element: onlyThisSiteToggle(onlyThisSite, setOnlyThisSite, props.siteDisplayName) },
        ],
      }}
    />
  );
}

// region Columns

function makeTableColumns(props: MetadataImportTableProps): TableColumn<any>[] {
  const columns: TableColumn<any>[] = [
    column('name', 'Dataset Name', true),
    column('summary', 'Summary', false),
    column('type', 'Data Type', true, ({ row }) => row.type.category),
    column('installTargets', 'VEuPathDB Project', true, renderProjects),
    column('status', 'Status', true, partialRight(renderStatus, props)),
    column('owner', 'Uploaded By', true, partialRight(renderUploader, props)),
    column('shares', 'Shared With', true, partialRight(renderShares, props)),
  ];

  if (props.arePublicDatasetsEnabled) {
    columns.push(column('visibility', 'Visibility', true, renderVisibility));
  }

  columns.push(column('created', 'Version & Date', true, renderVersion));

  return columns;
}

function column<K extends keyof Dataset>(
  key: K,
  name: string,
  sortable: boolean,
  renderCell: util.Function<TableCellProps, ReactNode> = defaultColumn(key),
  getValue?: util.Function<TableRowProps, Dataset[K]>
): mesa.MesaColumn<Dataset, K, Dataset[K]> {
  return { key, name, sortable, renderCell, getValue };
}

function defaultColumn(
  key: keyof Dataset
): util.Function<TableCellProps, string> {
  return ({ row }) => String(row[key]);
}

function renderProjects({ row }: TableCellProps): string {
  return row.installTargets.map(projectIdToDisplayName).join(', ');
}

function renderStatus(
  cell: TableCellProps,
  props: MetadataImportTableProps
): ReactNode {
  return (
    <UserDatasetStatus
      baseUrl={props.baseUrl}
      userDataset={cell.row}
      projectId={projectId}
      displayName={projectIdToDisplayName(projectId)!}
      linkToDataset={false}
      useTooltip={true}
      dataNoun={props.dataNoun}
      vdiConfig={props.vdiConfig}
    />
  );
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
    // If we have a query string, but that query string is not in the dataset
    // name, then exclude the dataset.
    if (filters.query && dataset.name.indexOf(filters.query) === -1) continue;

    // If we are excluding other sites, and the dataset does not target the
    // current site, then exclude the dataset.
    if (filters.excludeOtherSites) {
      if (!dataset.installTargets.includes(projectId)) continue;
    }

    // If we are excluding datasets that are only available because they are
    // public, AND the dataset is public, AND the dataset is not otherwise
    // visible to the user, then exclude the dataset.
    if (filters.excludePublic && dataset.visibility === 'public') {
      if (!isAlwaysVisibleTo(dataset, filters.userId)) continue;
    }

    out.push(dataset);
  }

  return out;
}

function isAlwaysVisibleTo(dataset: Dataset, userId: number): boolean {
  return (
    dataset.owner.userId === userId ||
    (Array.isArray(dataset.shares) &&
      dataset.shares.some((it) => it.userId === userId))
  );
}

function onlyMyDatasetsToggle(
  value: boolean,
  setValue: Consumer<boolean>
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
  setValue: Consumer<boolean>,
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