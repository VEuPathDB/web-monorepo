import React, { ReactElement, ReactNode } from 'react';
import { partialRight } from 'lodash';

import * as mesa from '@veupathdb/coreui/lib/components/Mesa/types';
import { ServiceConfig } from '@veupathdb/wdk-client/lib/Service/ServiceBase';
import Mesa from '@veupathdb/coreui/lib/components/Mesa/Ui/Mesa';
import { projectIdToDisplayName } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';

import { DatasetListEntry as Dataset, VdiServiceConfig } from '../../../../../Service';
import { projectId } from '../../../../../config';
import UserDatasetStatus from '../../../../../Components/UserDatasetStatus';
import * as util from '../../../../../Utils';

export interface MetadataImportTableProps {
  readonly baseUrl: string;
  readonly vdiConfig: VdiServiceConfig;
  readonly config: ServiceConfig;
  readonly dataNoun: util.DataNoun;
  readonly userId: number;
  readonly datasets: Dataset[];
  readonly arePublicDatasetsEnabled: boolean;
}

type TableColumn<K extends keyof Dataset> = mesa.MesaColumn<Dataset, K, Dataset[K]>;
type TableCellProps = mesa.CellProps<Dataset>;

interface TableRowProps {
  readonly row: Dataset;
  readonly index: number;
}

export function   MetadataImportTable(
  props: MetadataImportTableProps,
): ReactElement {
  return <Mesa state={makeMesaConfig(props)} />;
}


function makeMesaConfig(
  props: MetadataImportTableProps,
): mesa.MesaStateProps<Dataset> {
  return {
    rows: props.datasets,
    columns: makeTableColumns(props),
    options: makeTableOptions(),
  };
}

// region Columns

function makeTableColumns(props: MetadataImportTableProps): TableColumn<any>[] {
  const columns: TableColumn<any>[] = [
    column('name', 'Dataset Name', true),
    column('summary', 'Summary', false),
    column('type', 'Data Type', true, ({row}) => row.type.category),
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
  renderCell?: util.Function<TableCellProps, ReactNode>,
  getValue?: util.Function<TableRowProps, Dataset[K]>,
): mesa.MesaColumn<Dataset, K, Dataset[K]> {
  return { key, name, sortable, renderCell, getValue };
}

function renderProjects({ row }: TableCellProps): string {
  return row.installTargets.map(projectIdToDisplayName).join(', ');
}

function renderStatus(
  cell: TableCellProps,
  props: MetadataImportTableProps,
): ReactNode {
  return <UserDatasetStatus
    baseUrl={props.baseUrl}
    userDataset={cell.row}
    projectId={projectId}
    displayName={props.config.displayName}
    linkToDataset={false}
    useTooltip={true}
    dataNoun={props.dataNoun}
    vdiConfig={props.vdiConfig}
  />;
}

function renderUploader(
  { row }: TableCellProps,
  { userId }: MetadataImportTableProps,
): ReactNode {
  return row.owner.userId === userId
    ? <span className="faded">Me</span>
    : <span>{util.datasetUserFullName(row.owner)}</span>;
}

function renderShares(
  { row }: TableCellProps,
  props: MetadataImportTableProps,
): ReactNode {
  if (row.owner.userId !== props.userId) {
    return 'Me';
  }

  return util.isNonEmpty(row.shares)
    ? row.shares.map(util.datasetUserFullName).join(', ')
    : <span className="faded">N/A</span>;
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

function makeTableOptions(): mesa.MesaStateProps<Dataset>['options'] {
  return {
    editableColumns: false,
    showCount: false,
    toolbar: true,
    getRowId: row => row.datasetId,
  };
}

