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
  UserDataset,
  UserDatasetMeta_UI,
  UserDatasetShare,
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

interface Props {
  baseUrl: string;
  user: User;
  location: any;
  projectId: string;
  projectName: string;
  userDatasets: UserDataset[];
  filterByProject: boolean;
  shareUserDatasets: (
    userDatasetIds: string[],
    recipientUserIds: number[],
    context: 'datasetDetails' | 'datasetsList'
  ) => any;
  unshareUserDatasets: (
    userDatasetId: string,
    recipientUserId: number,
    context: 'datasetDetails' | 'datasetsList'
  ) => any;
  sharingModalOpen: boolean;
  sharingSuccess: (shareSuccessful: boolean | undefined) => any;
  sharingError: (shareError: Error | undefined) => any;
  updateSharingModalState: (isOpen: boolean) => any;
  sharingDatasetPending: boolean;
  shareSuccessful: boolean | undefined;
  shareError: Error | undefined;
  removeUserDataset: (dataset: UserDataset) => any;
  updateUserDatasetDetail: (
    userDataset: UserDataset,
    meta: UserDatasetMeta_UI
  ) => any;
  updateProjectFilter: (filterByProject: boolean) => any;
  quotaSize: number;
  dataNoun: DataNoun;
  enablePublicUserDatasets: boolean;
  communityModalOpen: boolean;
  updateCommunityModalVisibility: (visibility: boolean) => any;
  updateDatasetCommunityVisibility: (
    datasetIds: string[],
    isVisibleToCommunity: boolean,
    context: 'datasetDetails' | 'datasetsList'
  ) => any;
  updateDatasetCommunityVisibilityError: string | undefined;
  updateDatasetCommunityVisibilityPending: boolean;
  updateDatasetCommunityVisibilitySuccess: boolean;
}

interface State {
  selectedRows: Array<number | string>;
  uiState: { sort: MesaSortObject };
  searchTerm: string;
  editingCache: any;
}

interface MesaDataCellProps {
  row: UserDataset;
  column: MesaColumn<UserDataset>;
  rowIndex: number;
  columnIndex: number;
  inline?: boolean;
}

class UserDatasetList extends React.Component<Props, State> {
  constructor(props: Props) {
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

  isRowSelected(row: UserDataset): boolean {
    const id: string = row.id;
    const { selectedRows } = this.state;
    return selectedRows.includes(id);
  }

  isMyDataset(dataset: UserDataset): boolean {
    const { user } = this.props;
    return user.id === dataset.ownerUserId;
  }

  onSearchTermChange(searchTerm: string) {
    this.setState({ searchTerm });
  }

  onMetaAttributeSaveFactory(dataset: UserDataset, attrKey: string) {
    const { meta } = dataset;
    const { updateUserDatasetDetail } = this.props;
    return (value: string) =>
      updateUserDatasetDetail(dataset, { ...meta, [attrKey]: value });
  }

  renderSharedWithCell(cellProps: MesaDataCellProps) {
    const dataset: UserDataset = cellProps.row;
    return !dataset.sharedWith || !dataset.sharedWith.length
      ? null
      : dataset.sharedWith.map((share) => share.userDisplayName).join(', ');
  }

  renderCommunityCell(cellProps: MesaDataCellProps) {
    const dataset: UserDataset = cellProps.row;
    const isPublic = dataset.meta.visibility === 'public';
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
    const userDataset: UserDataset = cellProps.row;
    const { baseUrl, projectId, projectName, dataNoun } = this.props;
    return (
      <UserDatasetStatus
        baseUrl={baseUrl}
        linkToDataset={true}
        useTooltip={true}
        userDataset={userDataset}
        projectId={projectId}
        displayName={projectName}
        dataNoun={dataNoun}
      />
    );
  }

  renderOwnerCell(cellProps: MesaDataCellProps) {
    const row: UserDataset = cellProps.row;
    const { owner } = row;
    return this.isMyDataset(row) ? (
      <span className="faded">Me</span>
    ) : (
      <span>{owner}</span>
    );
  }

  getColumns(): any[] {
    const { baseUrl, user } = this.props;
    function isOwner(ownerId: number): boolean {
      return user.id === ownerId;
    }
    return [
      {
        key: 'meta.name',
        sortable: true,
        name: 'Name / ID',
        helpText: '',
        renderCell: (cellProps: MesaDataCellProps) => {
          const dataset: UserDataset = cellProps.row;
          const saveName = this.onMetaAttributeSaveFactory(dataset, 'name');
          return (
            <SaveableTextEditor
              value={dataset.meta.name}
              multiLine={true}
              rows={2}
              onSave={saveName}
              readOnly={!isOwner(dataset.ownerUserId)}
              displayValue={(value: string) => (
                <React.Fragment>
                  <Link to={`${baseUrl}/${dataset.id}`}>{value}</Link>
                  <br />
                  <span className="faded">({dataset.id})</span>
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
          const dataset: UserDataset = cellProps.row;
          const saveSummary = this.onMetaAttributeSaveFactory(
            dataset,
            'summary'
          );
          return (
            <div style={{ display: 'block', maxWidth: '100%' }}>
              <SaveableTextEditor
                rows={Math.max(
                  2,
                  Math.floor((dataset.meta.summary?.length ?? 0) / 22)
                )}
                multiLine={true}
                onSave={saveSummary}
                value={dataset.meta.summary ?? ''}
                readOnly={!isOwner(dataset.ownerUserId)}
              />
            </div>
          );
        },
      },
      {
        key: 'type',
        name: 'Type',
        sortable: true,
        renderCell: textCell('type', (datasetType: any) => {
          const display: string = datasetType.display;
          const version: string = datasetType.version;
          return (
            <span>
              {display} <span className="faded">({version})</span>
            </span>
          );
        }),
      },
      {
        key: 'projects',
        sortable: true,
        name: 'VEuPathDB Websites',
        renderCell(cellProps: MesaDataCellProps) {
          const userDataset: UserDataset = cellProps.row;
          const { projects } = userDataset;
          return projects.join(', ');
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
        renderCell: textCell('size', (size: number) => bytesToHuman(size)),
      },
      {
        key: 'percentQuotaUsed',
        name: 'Quota Usage',
        sortable: true,
        renderCell: textCell('percentQuotaUsed', (percent: number) =>
          percent || percent === 0 ? `${normalizePercentage(percent)}%` : null
        ),
      },
    ].filter((column) => column);
  }

  onRowSelect(row: UserDataset): void {
    const id: number | string = row.id;
    const { selectedRows } = this.state;
    if (selectedRows.includes(id)) return;
    const newSelection: Array<number | string> = [...selectedRows, id];
    this.setState({ selectedRows: newSelection });
  }

  onRowDeselect(row: UserDataset): void {
    const id: number | string = row.id;
    const { selectedRows } = this.state;
    if (!selectedRows.includes(id)) return;
    const newSelection: Array<number | string> = selectedRows.filter(
      (selectedId) => selectedId !== id
    );
    this.setState({ selectedRows: newSelection });
  }

  onMultipleRowSelect(rows: UserDataset[]): void {
    if (!rows.length) return;
    const { selectedRows } = this.state;
    const unselectedRows = rows
      .filter((dataset: UserDataset) => !selectedRows.includes(dataset.id))
      .map((dataset: UserDataset) => dataset.id);
    if (!unselectedRows.length) return;
    const newSelection: Array<number | string> = [
      ...selectedRows,
      ...unselectedRows,
    ];
    this.setState({ selectedRows: newSelection });
  }

  onMultipleRowDeselect(rows: UserDataset[]): void {
    if (!rows.length) return;
    const { selectedRows } = this.state;
    const deselectedIds: Array<number | string> = rows.map(
      (row: UserDataset) => row.id
    );
    const newSelection = selectedRows.filter(
      (id) => !deselectedIds.includes(id)
    );
    this.setState({ selectedRows: newSelection });
  }

  onSort(column: MesaColumn<UserDataset>, direction: string): void {
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
    const { removeUserDataset, dataNoun, enablePublicUserDatasets } =
      this.props;
    return [
      {
        callback: (rows: UserDataset[]) => {},
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
        callback: (userDatasets: UserDataset[]) => {
          const [noun, pronoun] =
            userDatasets.length === 1
              ? [`this ${this.props.dataNoun.singular.toLowerCase()}`, 'it']
              : [`these ${this.props.dataNoun.plural.toLowerCase()}`, 'them'];

          const affectedUsers: UserDatasetShare[] = userDatasets.reduce(
            (
              affectedUserList: UserDatasetShare[],
              userDataset: UserDataset
            ) => {
              if (!isMyDataset(userDataset)) return affectedUserList;
              if (!userDataset.sharedWith || userDataset.sharedWith.length)
                return affectedUserList;
              const newlyAffectedUsers = userDataset.sharedWith.filter(
                (sharedWithUser: UserDatasetShare) => {
                  return (
                    affectedUserList.find(
                      (affectedUser) =>
                        affectedUser.user === sharedWithUser.user
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
          userDatasets.forEach((userDataset) => removeUserDataset(userDataset));
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

  filterAndSortRows(rows: UserDataset[]): UserDataset[] {
    const { searchTerm, uiState } = this.state;
    const { projectName, filterByProject } = this.props;
    const sort: MesaSortObject = uiState.sort;
    if (filterByProject)
      rows = rows.filter((dataset) => dataset.projects.includes(projectName));
    if (searchTerm && searchTerm.length)
      rows = this.filterRowsBySearchTerm([...rows], searchTerm);
    if (sort.columnKey.length) rows = this.sortRowsByColumnKey([...rows], sort);
    return [...rows];
  }

  filterRowsBySearchTerm(
    rows: UserDataset[],
    searchTerm?: string
  ): UserDataset[] {
    if (!searchTerm || !searchTerm.length) return rows;
    return rows.filter((dataset: UserDataset) => {
      const searchableRow: string = JSON.stringify(dataset).toLowerCase();
      return searchableRow.indexOf(searchTerm.toLowerCase()) !== -1;
    });
  }

  getColumnSortValueMapper(columnKey: string | null) {
    if (columnKey === null) return (data: any) => data;
    switch (columnKey) {
      case 'type':
        return (data: UserDataset, index: number): string =>
          data.type.display.toLowerCase();
      case 'meta.name':
        return (data: UserDataset) => data.meta.name.toLowerCase();
      default:
        return (data: any, index: number) => {
          return typeof data[columnKey] !== 'undefined'
            ? data[columnKey]
            : null;
        };
    }
  }

  sortRowsByColumnKey(
    rows: UserDataset[],
    sort: MesaSortObject
  ): UserDataset[] {
    const direction: string = sort.direction;
    const columnKey: string = sort.columnKey;
    const mappedValue = this.getColumnSortValueMapper(columnKey);
    const sorted = [...rows].sort(MesaUtils.sortFactory(mappedValue));
    return direction === 'asc' ? sorted : sorted.reverse();
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
      userDatasets,
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
      updateUserDatasetDetail,
      enablePublicUserDatasets,
      updateDatasetCommunityVisibility,
      updateCommunityModalVisibility,
      updateDatasetCommunityVisibilityError,
      updateDatasetCommunityVisibilityPending,
      updateDatasetCommunityVisibilitySuccess,
    } = this.props;
    const { uiState, selectedRows, searchTerm } = this.state;

    const rows = userDatasets;
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
        emptinessCulprit: userDatasets.length ? 'search' : null,
      },
    };

    const totalSize = userDatasets
      .filter((ud) => ud.ownerUserId === user.id)
      .map((ud) => ud.size ?? 0)
      .reduce(add, 0);

    const totalPercent = totalSize / quotaSize;

    const offerProjectToggle = userDatasets.some(({ projects }) =>
      projects.some((project) => project !== projectName)
    );

    return (
      <div className="UserDatasetList">
        <Mesa state={MesaState.create(tableState)}>
          <div className="stack">
            {userDatasets.length > 0 && (
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
                    updateUserDatasetDetail={updateUserDatasetDetail}
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
