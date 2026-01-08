import React from 'react';

import { add } from 'lodash';

import {
  Checkbox,
  IconAlt as Icon,
  Link,
  RealTimeSearchBox as SearchBox,
  SaveableTextEditor,
} from '@veupathdb/wdk-client/lib/Components';
import {
  Mesa,
  MesaState,
  Utils as MesaUtils,
} from '@veupathdb/coreui/lib/components/Mesa';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import { bytesToHuman } from '@veupathdb/wdk-client/lib/Utils/Converters';

import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import {
  DataNoun,
  DatasetListEntry,
  DatasetListShareUser,
  DatasetTypeOutput,
} from '../../Utils/types';

import UserDatasetEmptyState from '../EmptyState';
import SharingModal from '../Sharing/UserDatasetSharingModal';
import CommunityModal from '../Sharing/UserDatasetCommunityModal';
import UserDatasetStatus from '../UserDatasetStatus';
import { normalizePercentage, textCell } from '../UserDatasetUtils';

import '../UserDatasets.scss';
import './UserDatasetList.scss';
import { DateTime } from '../DateTime';

import { ThemedGrantAccessButton } from '../ThemedGrantAccessButton';
import { ThemedDeleteButton } from '../ThemedDeleteButton';
import { Public } from '@material-ui/icons';
import { Tooltip } from '@veupathdb/coreui';
import { updateDatasetListItem } from "../../Actions/UserDatasetsActions";
import { datasetUserFullName } from '../../Utils/formatting';

export interface DatasetListProps {
  baseUrl: string;
  user: User;
  location: any;
  projectId: string;
  projectName: string;
  userDatasets: DatasetListEntry[];
  filterByProject: boolean;
  shareUserDatasets: (
    userDatasetIds: string[],
    recipientUserIds: number[],
    context: 'datasetDetails' | 'datasetsList',
  ) => any;
  unshareUserDatasets: (
    userDatasetId: string,
    recipientUserId: number,
    context: 'datasetDetails' | 'datasetsList',
  ) => any;
  sharingModalOpen: boolean;
  sharingSuccess: (shareSuccessful: boolean | undefined) => any;
  sharingError: (shareError: Error | undefined) => any;
  updateSharingModalState: (isOpen: boolean) => any;
  sharingDatasetPending: boolean;
  shareSuccessful: boolean | undefined;
  shareError: Error | undefined;
  removeUserDataset: (dataset: DatasetListEntry) => any;
  updateDatasetListItem: typeof updateDatasetListItem;
  updateProjectFilter: (filterByProject: boolean) => any;
  quotaSize: number;
  dataNoun: DataNoun;
  enablePublicUserDatasets: boolean;
  communityModalOpen: boolean;
  updateCommunityModalVisibility: (visibility: boolean) => any;
  updateDatasetCommunityVisibility: (
    datasetIds: string[],
    isVisibleToCommunity: boolean,
    context: 'datasetDetails' | 'datasetsList',
  ) => any;
  updateDatasetCommunityVisibilityError: string | undefined;
  updateDatasetCommunityVisibilityPending: boolean;
  updateDatasetCommunityVisibilitySuccess: boolean;
}

interface State {
  selectedRows: Array<string>;
  uiState: { sort: MesaSortObject };
  searchTerm: string;
  editingCache: any;
}

interface MesaDataCellProps {
  row: DatasetListEntry;
  column: MesaColumn<DatasetListEntry>;
  rowIndex: number;
  columnIndex: number;
  inline?: boolean;
}

class UserDatasetList extends React.Component<DatasetListProps, State> {
  constructor(props: DatasetListProps) {
    super(props);
    this.state = {
      selectedRows: [],
      uiState: {
        sort: {
          columnKey: 'created',
          direction: 'asc',
        },
      },
      editingCache: {},
      searchTerm: '',
    };

    this.onRowSelect = this.onRowSelect.bind(this);
    this.onRowDeselect = this.onRowDeselect.bind(this);
    this.isRowSelected = this.isRowSelected.bind(this);
    this.onMultipleRowSelect = this.onMultipleRowSelect.bind(this);
    this.onMultipleRowDeselect = this.onMultipleRowDeselect.bind(this);

    this.onSort = this.onSort.bind(this);
    this.getColumns = this.getColumns.bind(this);
    this.isMyDataset = this.isMyDataset.bind(this);
    this.getEventHandlers = this.getEventHandlers.bind(this);
    this.filterAndSortRows = this.filterAndSortRows.bind(this);
    this.onSearchTermChange = this.onSearchTermChange.bind(this);
    this.onMetaAttributeSaveFactory =
      this.onMetaAttributeSaveFactory.bind(this);

    this.renderOwnerCell = this.renderOwnerCell.bind(this);
    this.renderStatusCell = this.renderStatusCell.bind(this);

    this.openSharingModal = this.openSharingModal.bind(this);
    this.closeSharingModal = this.closeSharingModal.bind(this);
    this.toggleProjectScope = this.toggleProjectScope.bind(this);
  }

  isRowSelected(row: DatasetListEntry): boolean {
    const id: string = row.datasetId;
    const { selectedRows } = this.state;
    return selectedRows.includes(id);
  }

  isMyDataset(dataset: DatasetListEntry): boolean {
    const { user } = this.props;
    return user.id === dataset.owner.userId;
  }

  onSearchTermChange(searchTerm: string) {
    this.setState({ searchTerm });
  }

  onMetaAttributeSaveFactory<K extends keyof DatasetListEntry>(dataset: DatasetListEntry, attrKey: K) {
    const { updateDatasetListItem } = this.props;
    return (value: DatasetListEntry[K]) =>
      updateDatasetListItem(dataset, { [attrKey]: value });
  }

  renderSharedWithCell(cellProps: MesaDataCellProps) {
    const dataset = cellProps.row;
    return !dataset.shares || !dataset.shares.length
      ? null
      : dataset.shares.map((share) => datasetUserFullName(share)).join(', ');
  }

  renderCommunityCell(cellProps: MesaDataCellProps) {
    const dataset = cellProps.row;
    const isPublic = dataset.visibility === 'public';
    if (!isPublic) return null;
    return (
      <Tooltip
        title={`This ${this.props.dataNoun.singular} is visible to the community.`}
      >
        <Public className="Community-visible" />
      </Tooltip>
    );
  }

  renderStatusCell(cellProps: MesaDataCellProps) {
    const { baseUrl, projectId, projectName, dataNoun } = this.props;
    return (
      <UserDatasetStatus
        baseUrl={baseUrl}
        linkToDataset={true}
        useTooltip={true}
        userDataset={cellProps.row}
        projectId={projectId}
        displayName={projectName}
        dataNoun={dataNoun}
      />
    );
  }

  renderOwnerCell(cellProps: MesaDataCellProps) {
    const row = cellProps.row;
    const { owner } = row;
    return this.isMyDataset(row) ? (
      <span className="faded">Me</span>
    ) : (
      <span>{datasetUserFullName(owner)}</span>
    );
  }

  getColumns(): any[] {
    const { baseUrl, user } = this.props;
    function isOwner(ownerId: number): boolean {
      return user.id === ownerId;
    }
    return [
      {
        key: 'name',
        sortable: true,
        name: 'Name / ID',
        helpText: '',
        renderCell: (cellProps: MesaDataCellProps) => {
          const dataset = cellProps.row;
          const saveName = this.onMetaAttributeSaveFactory(dataset, 'name');
          return (
            <SaveableTextEditor
              value={dataset.name}
              multiLine={true}
              rows={2}
              onSave={saveName}
              readOnly={!isOwner(dataset.owner.userId)}
              displayValue={(value: string) => (
                <React.Fragment>
                  <Link to={`${baseUrl}/${dataset.datasetId}`}>{value}</Link>
                  <br />
                  <span className="faded">({dataset.datasetId})</span>
                </React.Fragment>
              )}
            />
          );
        },
      },
      {
        key: 'summary',
        name: 'Summary',
        style: { maxWidth: '300px' },
        renderCell: (cellProps: MesaDataCellProps) => {
          const dataset = cellProps.row;
          const saveSummary = this.onMetaAttributeSaveFactory(
            dataset,
            'summary'
          );
          return (
            <div style={{ display: 'block', maxWidth: '100%' }}>
              <SaveableTextEditor
                rows={Math.max(
                  2,
                  Math.floor((dataset.summary?.length ?? 0) / 22)
                )}
                multiLine={true}
                onSave={saveSummary}
                value={dataset.summary ?? ''}
                readOnly={!isOwner(dataset.owner.userId)}
              />
            </div>
          );
        },
      },
      {
        key: 'type',
        name: 'Type',
        sortable: true,
        renderCell: textCell('type', (datasetType: DatasetTypeOutput) => {
          const { category, version } = datasetType;
          return (
            <span>
              {category} <span className="faded">({version})</span>
            </span>
          );
        }),
      },
      {
        key: 'projects',
        sortable: true,
        name: 'VEuPathDB Websites',
        renderCell(cellProps: MesaDataCellProps) {
          return cellProps.row.installTargets.join(', ');
        },
      },
      {
        key: 'status',
        className: 'StatusColumn',
        name: 'Status',
        style: { textAlign: 'center' },
        renderCell: this.renderStatusCell,
      },
      {
        key: 'owner',
        name: 'Owner',
        sortable: true,
        renderCell: this.renderOwnerCell,
      },
      {
        key: 'sharedWith',
        name: 'Shared With',
        sortable: true,
        renderCell: this.renderSharedWithCell,
      },
      ...(this.props.enablePublicUserDatasets
        ? [
            {
              key: 'visibility',
              name: 'Community',
              sortable: true,
              helpText: `Indicates if the ${this.props.dataNoun.singular} is visible to the community.`,
              style: { textAlign: 'center' },
              renderCell: this.renderCommunityCell.bind(this),
            },
          ]
        : []),
      {
        key: 'created',
        name: 'Created',
        sortable: true,
        renderCell: textCell('created', (created: number) => (
          <DateTime datetime={created} />
        )),
      },
      {
        key: 'fileCount',
        name: 'File Count',
        renderCell: textCell('fileCount', (count: number) => count),
      },
      {
        key: 'size',
        name: 'Size',
        sortable: true,
        renderCell: textCell('fileSizeTotal', (size: number) => bytesToHuman(size)),
      },
      // {
      //   key: 'percentQuotaUsed',
      //   name: 'Quota Usage',
      //   sortable: true,
      //   renderCell: textCell('percentQuotaUsed', (percent: number) =>
      //     percent || percent === 0 ? `${normalizePercentage(percent)}%` : null
      //   ),
      // },
    ].filter((column) => column);
  }

  onRowSelect(row: DatasetListEntry): void {
    const { selectedRows } = this.state;

    if (selectedRows.includes(row.datasetId))
      return;

    const newSelection = [ ...selectedRows, row.datasetId ];

    this.setState({ selectedRows: newSelection });
  }

  onRowDeselect(row: DatasetListEntry): void {
    const { selectedRows } = this.state;

    if (!selectedRows.includes(row.datasetId)) return;

    const newSelection = selectedRows.filter(selectedId => selectedId !== row.datasetId);

    this.setState({ selectedRows: newSelection });
  }

  onMultipleRowSelect(rows: DatasetListEntry[]): void {
    if (!rows.length)
      return;

    const { selectedRows } = this.state;

    const unselectedRows = rows
      .filter((dataset: DatasetListEntry) => !selectedRows.includes(dataset.datasetId))
      .map((dataset: DatasetListEntry) => dataset.datasetId);

    if (!unselectedRows.length)
      return;

    const newSelection = [ ...selectedRows, ...unselectedRows ];

    this.setState({ selectedRows: newSelection });
  }

  onMultipleRowDeselect(rows: DatasetListEntry[]): void {
    if (!rows.length)
      return;

    const { selectedRows } = this.state;

    const deselectedIds = rows.map(row => row.datasetId);
    const newSelection = selectedRows.filter(id => !deselectedIds.includes(id));

    this.setState({ selectedRows: newSelection });
  }

  onSort(column: MesaColumn<DatasetListEntry>, direction: string): void {
    const key = column.key;
    const { state } = this;
    const { setSortColumnKey, setSortDirection } = MesaState;
    const updatedState = setSortDirection(
      setSortColumnKey(state, key),
      direction
    );
    this.setState(updatedState);
  }

  getEventHandlers() {
    return {
      onSort: this.onSort,
      onRowSelect: this.onRowSelect,
      onRowDeselect: this.onRowDeselect,
      onMultipleRowSelect: this.onMultipleRowSelect,
      onMultipleRowDeselect: this.onMultipleRowDeselect,
    };
  }

  getTableActions() {
    const { isMyDataset } = this;
    const { dataNoun, enablePublicUserDatasets } =
      this.props;
    return [
      {
        callback: (_: DatasetListEntry[]) => {},
        element: (
          <ThemedGrantAccessButton
            buttonText={`Grant Access to ${dataNoun.plural}`}
            onPress={(grantType) => {
              switch (grantType) {
                case 'community':
                  this.props.updateCommunityModalVisibility(true);
                  break;
                case 'individual':
                  this.openSharingModal();
                  break;
              }
            }}
            enablePublicUserDatasets={enablePublicUserDatasets}
          />
        ),
        selectionRequired: true,
      },
      {
        callback: (userDatasets: DatasetListEntry[]) => {
          const [noun, pronoun] =
            userDatasets.length === 1
              ? [`this ${this.props.dataNoun.singular.toLowerCase()}`, 'it']
              : [`these ${this.props.dataNoun.plural.toLowerCase()}`, 'them'];

          const affectedUsers: DatasetListShareUser[] = userDatasets.reduce(

            (affectedUserList: DatasetListShareUser[], userDataset: DatasetListEntry) => {

              if (!isMyDataset(userDataset))
                return affectedUserList;

              if (!userDataset.shares || userDataset.shares.length)
                return affectedUserList;

              const newlyAffectedUsers = userDataset.shares.filter(
                (sharedWithUser: DatasetListShareUser) => {
                  return (
                    affectedUserList.find(
                      (affectedUser) =>
                        affectedUser.userId === sharedWithUser.userId
                    ) != null
                  );
                }
              );
              return [...affectedUserList, ...newlyAffectedUsers];
            },
            []
          );

          if (
            !window.confirm(
              `Are you sure you want to delete ${noun}? ` +
                (affectedUsers.length
                  ? `You have shared ${pronoun} with ${affectedUsers} users.`
                  : '')
            )
          )
            return;
          userDatasets.forEach((userDataset) => this.props.removeUserDataset(userDataset));
        },
        element: (
          <ThemedDeleteButton buttonText="Delete" onPress={() => null} />
        ),
        selectionRequired: true,
      },
    ];
  }

  getTableOptions() {
    const { isRowSelected, toggleProjectScope } = this;
    const { userDatasets, projectName, filterByProject, dataNoun } = this.props;
    const emptyMessage = !userDatasets.length ? (
      <p style={{ textAlign: 'center' }}>
        This page is empty because you do not have any{' '}
        {dataNoun.plural.toLowerCase()}.
      </p>
    ) : filterByProject ? (
      <React.Fragment>
        <p>
          You have no <b>{projectName}</b> data sets.
        </p>
        <br />
        <button
          className="btn btn-info"
          onClick={() => toggleProjectScope(false)}
        >
          Show All User {dataNoun.plural}
        </button>
      </React.Fragment>
    ) : (
      <React.Fragment>
        <p>Your search returned no results.</p>
        <br />
        <button
          type="button"
          className="btn"
          onClick={() => this.setState({ searchTerm: '' })}
        >
          Clear Search Query
        </button>
      </React.Fragment>
    );
    return {
      isRowSelected,
      showToolbar: true,
      renderEmptyState() {
        return (
          <React.Fragment>
            <UserDatasetEmptyState message={emptyMessage} />
          </React.Fragment>
        );
      },
    };
  }

  filterAndSortRows(rows: DatasetListEntry[]): DatasetListEntry[] {
    const { searchTerm, uiState } = this.state;
    const { projectName, filterByProject } = this.props;
    const sort: MesaSortObject = uiState.sort;

    if (filterByProject)
      rows = rows.filter((dataset) => dataset.installTargets.includes(projectName));

    if (searchTerm && searchTerm.length)
      return this.filterRowsBySearchTerm([...rows], searchTerm);

    if (sort.columnKey.length)
      return this.sortRowsByColumnKey([...rows], sort);

    return [ ...rows ];
  }

  filterRowsBySearchTerm(
    rows: DatasetListEntry[],
    searchTerm?: string
  ): DatasetListEntry[] {
    if (!searchTerm || !searchTerm.length) return rows;
    return rows.filter((dataset) => {
      const searchableRow = JSON.stringify(dataset).toLowerCase();
      return searchableRow.indexOf(searchTerm.toLowerCase()) !== -1;
    });
  }

  getColumnSortValueMapper(columnKey: string | null) {
    if (columnKey === null)
      return (data: any) => data;

    switch (columnKey) {
      case 'type':
        return (data: DatasetListEntry, _: number): string =>
          data.type.category.toLowerCase();

      case 'meta.name':
        return (data: DatasetListEntry) => data.name.toLowerCase();

      default:
        return (data: any, _: number) => typeof data[columnKey] !== 'undefined'
          ? data[columnKey]
          : null;
    }
  }

  /**
   * @returns A new, sorted copy of the input array.
   */
  sortRowsByColumnKey(
    rows: DatasetListEntry[],
    sort: MesaSortObject
  ): DatasetListEntry[] {
    const mappedValue = this.getColumnSortValueMapper(sort.columnKey);
    const sorted = [...rows].sort(MesaUtils.sortFactory(mappedValue));

    return sort.direction === 'asc' ? sorted : sorted.reverse();
  }

  closeSharingModal() {
    this.props.updateSharingModalState(false);
  }

  openSharingModal() {
    this.props.sharingSuccess(undefined);
    this.props.sharingError(undefined);
    this.props.updateSharingModalState(true);
  }

  toggleProjectScope(newValue: boolean) {
    this.props.updateProjectFilter(newValue);
  }

  render() {
    const { isRowSelected, toggleProjectScope } = this;
    const {
      userDatasets: rows,
      user,
      projectName,
      shareUserDatasets,
      unshareUserDatasets,
      filterByProject,
      quotaSize,
      dataNoun,
      sharingModalOpen,
      sharingDatasetPending,
      shareSuccessful,
      shareError,
      updateDatasetListItem,
      enablePublicUserDatasets,
      updateDatasetCommunityVisibility,
      updateCommunityModalVisibility,
      updateDatasetCommunityVisibilityError,
      updateDatasetCommunityVisibilityPending,
      updateDatasetCommunityVisibilitySuccess,
    } = this.props;
    const { uiState, selectedRows, searchTerm } = this.state;

    const selectedDatasets = rows.filter(isRowSelected);
    const columns = this.getColumns();
    const actions = this.getTableActions();
    const options = this.getTableOptions();
    const eventHandlers = this.getEventHandlers();
    const filteredRows = this.filterAndSortRows(rows);

    const tableState = {
      rows,
      columns,
      options,
      actions,
      filteredRows,
      selectedRows,
      eventHandlers,
      uiState: {
        ...uiState,
        emptinessCulprit: rows.length ? 'search' : null,
      },
    };

    const totalSize = rows
      .filter((ud) => ud.owner.userId === user.id)
      .map((ud) => ud.fileSizeTotal ?? 0)
      .reduce(add, 0);

    const totalPercent = totalSize / quotaSize;

    const offerProjectToggle = rows.some(({ installTargets }) =>
      installTargets.some((project) => project !== projectName)
    );

    return (
      <div className="UserDatasetList">
        <Mesa state={MesaState.create(tableState)}>
          <div className="stack">
            {rows.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {sharingModalOpen && selectedDatasets.length ? (
                  <SharingModal
                    user={user}
                    datasets={selectedDatasets}
                    deselectDataset={this.onRowDeselect}
                    shareUserDatasets={shareUserDatasets}
                    context="datasetsList"
                    unshareUserDatasets={unshareUserDatasets}
                    onClose={this.closeSharingModal}
                    dataNoun={dataNoun}
                    sharingDatasetPending={sharingDatasetPending}
                    shareSuccessful={shareSuccessful}
                    shareError={shareError}
                    updateUserDatasetDetail={updateDatasetListItem}
                  />
                ) : null}
                {this.props.communityModalOpen && enablePublicUserDatasets ? (
                  <CommunityModal
                    user={user}
                    datasets={selectedDatasets}
                    context="datasetsList"
                    onClose={() => updateCommunityModalVisibility(false)}
                    dataNoun={dataNoun}
                    updateDatasetCommunityVisibility={
                      updateDatasetCommunityVisibility
                    }
                    updatePending={updateDatasetCommunityVisibilityPending}
                    updateSuccessful={updateDatasetCommunityVisibilitySuccess}
                    updateError={updateDatasetCommunityVisibilityError}
                  />
                ) : null}
                <SearchBox
                  placeholderText={'Search ' + dataNoun.plural}
                  searchTerm={searchTerm}
                  onSearchTermChange={this.onSearchTermChange}
                />
                <div style={{ flex: '0 0 auto', padding: '0 10px' }}>
                  Showing {filteredRows.length} of {rows.length}{' '}
                  {rows.length === 1
                    ? dataNoun.singular.toLowerCase()
                    : dataNoun.plural.toLowerCase()}
                </div>
                {offerProjectToggle && (
                  <div
                    className="UserDatasetList-ProjectToggle"
                    style={{ flex: '0 0 auto', padding: '0 10px' }}
                  >
                    <Checkbox
                      value={filterByProject}
                      onChange={toggleProjectScope}
                    />{' '}
                    <div
                      onClick={() => toggleProjectScope(!filterByProject)}
                      style={{ display: 'inline-block' }}
                    >
                      Only show {dataNoun.plural.toLowerCase()} related to{' '}
                      <b>{projectName}</b>
                    </div>
                  </div>
                )}
                <div style={{ flex: '0 0 auto', padding: '0 10px' }}>
                  <Icon fa="info-circle" /> {bytesToHuman(totalSize)} (
                  {normalizePercentage(totalPercent)}%) of{' '}
                  {bytesToHuman(quotaSize)} used
                </div>
              </div>
            )}
          </div>
        </Mesa>
      </div>
    );
  }
}

export default UserDatasetList;
