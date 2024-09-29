import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
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
import { bytesToHuman } from '@veupathdb/wdk-client/lib/Utils/Converters';
import UserDatasetEmptyState from '../EmptyState';
import SharingModal from '../Sharing/UserDatasetSharingModal';
import UserDatasetStatus from '../UserDatasetStatus';
import { normalizePercentage, textCell } from '../UserDatasetUtils';
import './UserDatasetList.scss';
import { DateTime } from '../DateTime';
import { ThemedGrantAccessButton } from '../ThemedGrantAccessButton';
import { ThemedDeleteButton } from '../ThemedDeleteButton';
class UserDatasetList extends React.Component {
  constructor(props) {
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
      sharingModalOpen: false,
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
  isRowSelected(row) {
    const id = row.id;
    const { selectedRows } = this.state;
    return selectedRows.includes(id);
  }
  isMyDataset(dataset) {
    const { user } = this.props;
    return user.id === dataset.ownerUserId;
  }
  onSearchTermChange(searchTerm) {
    this.setState({ searchTerm });
  }
  onMetaAttributeSaveFactory(dataset, attrKey) {
    const { meta } = dataset;
    const { updateUserDatasetDetail } = this.props;
    return (value) =>
      updateUserDatasetDetail(
        dataset,
        Object.assign(Object.assign({}, meta), { [attrKey]: value })
      );
  }
  renderSharedWithCell(cellProps) {
    const dataset = cellProps.row;
    return !dataset.sharedWith || !dataset.sharedWith.length
      ? null
      : dataset.sharedWith.map((share) => share.userDisplayName).join(', ');
  }
  renderStatusCell(cellProps) {
    const userDataset = cellProps.row;
    const { baseUrl, projectId, projectName } = this.props;
    return _jsx(UserDatasetStatus, {
      baseUrl: baseUrl,
      linkToDataset: true,
      useTooltip: true,
      userDataset: userDataset,
      projectId: projectId,
      displayName: projectName,
    });
  }
  renderOwnerCell(cellProps) {
    const row = cellProps.row;
    const { owner } = row;
    return this.isMyDataset(row)
      ? _jsx('span', Object.assign({ className: 'faded' }, { children: 'Me' }))
      : _jsx('span', { children: owner });
  }
  getColumns() {
    const { baseUrl, user } = this.props;
    function isOwner(ownerId) {
      return user.id === ownerId;
    }
    return [
      {
        key: 'meta.name',
        sortable: true,
        name: 'Name / ID',
        helpText: '',
        renderCell: (cellProps) => {
          const dataset = cellProps.row;
          const saveName = this.onMetaAttributeSaveFactory(dataset, 'name');
          return _jsx(SaveableTextEditor, {
            value: dataset.meta.name,
            multiLine: true,
            rows: 2,
            onSave: saveName,
            readOnly: !isOwner(dataset.ownerUserId),
            displayValue: (value) =>
              _jsxs(React.Fragment, {
                children: [
                  _jsx(
                    Link,
                    Object.assign(
                      { to: `${baseUrl}/${dataset.id}` },
                      { children: value }
                    )
                  ),
                  _jsx('br', {}),
                  _jsxs(
                    'span',
                    Object.assign(
                      { className: 'faded' },
                      { children: ['(', dataset.id, ')'] }
                    )
                  ),
                ],
              }),
          });
        },
      },
      {
        key: 'summary',
        name: 'Summary',
        style: { maxWidth: '300px' },
        renderCell: (cellProps) => {
          const dataset = cellProps.row;
          const saveSummary = this.onMetaAttributeSaveFactory(
            dataset,
            'summary'
          );
          return _jsx(
            'div',
            Object.assign(
              { style: { display: 'block', maxWidth: '100%' } },
              {
                children: _jsx(SaveableTextEditor, {
                  rows: Math.max(
                    2,
                    Math.floor(dataset.meta.summary.length / 22)
                  ),
                  multiLine: true,
                  onSave: saveSummary,
                  value: dataset.meta.summary,
                  readOnly: !isOwner(dataset.ownerUserId),
                }),
              }
            )
          );
        },
      },
      {
        key: 'type',
        name: 'Type',
        sortable: true,
        renderCell: textCell('type', (datasetType) => {
          const display = datasetType.display;
          const version = datasetType.version;
          return _jsxs('span', {
            children: [
              display,
              ' ',
              _jsxs(
                'span',
                Object.assign(
                  { className: 'faded' },
                  { children: ['(', version, ')'] }
                )
              ),
            ],
          });
        }),
      },
      {
        key: 'projects',
        sortable: true,
        name: 'VEuPathDB Websites',
        renderCell(cellProps) {
          const userDataset = cellProps.row;
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
      {
        key: 'created',
        name: 'Created',
        sortable: true,
        renderCell: textCell('created', (created) =>
          _jsx(DateTime, { datetime: created })
        ),
      },
      {
        key: 'datafiles',
        name: 'File Count',
        renderCell: textCell('datafiles', (files) => files.length),
      },
      {
        key: 'size',
        name: 'Size',
        sortable: true,
        renderCell: textCell('size', (size) => bytesToHuman(size)),
      },
      {
        key: 'percentQuotaUsed',
        name: 'Quota Usage',
        sortable: true,
        renderCell: textCell('percentQuotaUsed', (percent) =>
          percent ? `${normalizePercentage(percent)}%` : null
        ),
      },
    ].filter((column) => column);
  }
  onRowSelect(row) {
    const id = row.id;
    const { selectedRows } = this.state;
    if (selectedRows.includes(id)) return;
    const newSelection = [...selectedRows, id];
    this.setState({ selectedRows: newSelection });
  }
  onRowDeselect(row) {
    const id = row.id;
    const { selectedRows } = this.state;
    if (!selectedRows.includes(id)) return;
    const newSelection = selectedRows.filter((selectedId) => selectedId !== id);
    this.setState({ selectedRows: newSelection });
  }
  onMultipleRowSelect(rows) {
    if (!rows.length) return;
    const { selectedRows } = this.state;
    const unselectedRows = rows
      .filter((dataset) => !selectedRows.includes(dataset.id))
      .map((dataset) => dataset.id);
    if (!unselectedRows.length) return;
    const newSelection = [...selectedRows, ...unselectedRows];
    this.setState({ selectedRows: newSelection });
  }
  onMultipleRowDeselect(rows) {
    if (!rows.length) return;
    const { selectedRows } = this.state;
    const deselectedIds = rows.map((row) => row.id);
    const newSelection = selectedRows.filter(
      (id) => !deselectedIds.includes(id)
    );
    this.setState({ selectedRows: newSelection });
  }
  onSort(column, direction) {
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
    const { removeUserDataset, dataNoun } = this.props;
    return [
      {
        callback: (rows) => {
          this.openSharingModal();
        },
        element: _jsx(ThemedGrantAccessButton, {
          buttonText: `Grant Access to ${dataNoun.plural}`,
          onPress: () => null,
        }),
        selectionRequired: true,
      },
      {
        callback: (userDatasets) => {
          const [noun, pronoun] =
            userDatasets.length === 1
              ? [`this ${this.props.dataNoun.singular.toLowerCase()}`, 'it']
              : [`these ${this.props.dataNoun.plural.toLowerCase()}`, 'them'];
          const affectedUsers = userDatasets.reduce(
            (affectedUserList, userDataset) => {
              if (!isMyDataset(userDataset)) return affectedUserList;
              if (!userDataset.sharedWith || userDataset.sharedWith.length)
                return affectedUserList;
              const newlyAffectedUsers = userDataset.sharedWith.filter(
                (sharedWithUser) => {
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
        element: _jsx(ThemedDeleteButton, {
          buttonText: 'Delete',
          onPress: () => null,
        }),
        selectionRequired: true,
      },
    ];
  }
  getTableOptions() {
    const { isRowSelected, toggleProjectScope } = this;
    const { userDatasets, projectName, filterByProject, dataNoun } = this.props;
    const emptyMessage = !userDatasets.length
      ? _jsxs(
          'p',
          Object.assign(
            { style: { textAlign: 'center' } },
            {
              children: [
                'This page is empty because you do not have any',
                ' ',
                dataNoun.plural.toLowerCase(),
                '.',
              ],
            }
          )
        )
      : filterByProject
      ? _jsxs(React.Fragment, {
          children: [
            _jsxs('p', {
              children: [
                'You have no ',
                _jsx('b', { children: projectName }),
                ' data sets.',
              ],
            }),
            _jsx('br', {}),
            _jsxs(
              'button',
              Object.assign(
                {
                  className: 'btn btn-info',
                  onClick: () => toggleProjectScope(false),
                },
                { children: ['Show All User ', dataNoun.plural] }
              )
            ),
          ],
        })
      : _jsxs(React.Fragment, {
          children: [
            _jsx('p', { children: 'Your search returned no results.' }),
            _jsx('br', {}),
            _jsx(
              'button',
              Object.assign(
                {
                  type: 'button',
                  className: 'btn',
                  onClick: () => this.setState({ searchTerm: '' }),
                },
                { children: 'Clear Search Query' }
              )
            ),
          ],
        });
    return {
      isRowSelected,
      showToolbar: true,
      renderEmptyState() {
        return _jsx(React.Fragment, {
          children: _jsx(UserDatasetEmptyState, { message: emptyMessage }),
        });
      },
    };
  }
  filterAndSortRows(rows) {
    const { searchTerm, uiState } = this.state;
    const { projectName, filterByProject } = this.props;
    const sort = uiState.sort;
    if (filterByProject)
      rows = rows.filter((dataset) => dataset.projects.includes(projectName));
    if (searchTerm && searchTerm.length)
      rows = this.filterRowsBySearchTerm([...rows], searchTerm);
    if (sort.columnKey.length) rows = this.sortRowsByColumnKey([...rows], sort);
    return [...rows];
  }
  filterRowsBySearchTerm(rows, searchTerm) {
    if (!searchTerm || !searchTerm.length) return rows;
    return rows.filter((dataset) => {
      const searchableRow = JSON.stringify(dataset).toLowerCase();
      return searchableRow.indexOf(searchTerm.toLowerCase()) !== -1;
    });
  }
  getColumnSortValueMapper(columnKey) {
    if (columnKey === null) return (data) => data;
    switch (columnKey) {
      case 'type':
        return (data, index) => data.type.display.toLowerCase();
      case 'meta.name':
        return (data) => data.meta.name.toLowerCase();
      default:
        return (data, index) => {
          return typeof data[columnKey] !== 'undefined'
            ? data[columnKey]
            : null;
        };
    }
  }
  sortRowsByColumnKey(rows, sort) {
    const direction = sort.direction;
    const columnKey = sort.columnKey;
    const mappedValue = this.getColumnSortValueMapper(columnKey);
    const sorted = [...rows].sort(MesaUtils.sortFactory(mappedValue));
    return direction === 'asc' ? sorted : sorted.reverse();
  }
  closeSharingModal() {
    const sharingModalOpen = false;
    this.setState({ sharingModalOpen });
  }
  openSharingModal() {
    const sharingModalOpen = true;
    this.setState({ sharingModalOpen });
  }
  toggleProjectScope(newValue) {
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
    } = this.props;
    const { uiState, selectedRows, searchTerm, sharingModalOpen } = this.state;
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
      uiState: Object.assign(Object.assign({}, uiState), {
        emptinessCulprit: userDatasets.length ? 'search' : null,
      }),
    };
    const totalSize = userDatasets
      .filter((ud) => ud.ownerUserId === user.id)
      .map((ud) => ud.size)
      .reduce(add, 0);
    const totalPercent = totalSize / quotaSize;
    const offerProjectToggle = userDatasets.some(({ projects }) =>
      projects.some((project) => project !== projectName)
    );
    return _jsx(
      'div',
      Object.assign(
        { className: 'UserDatasetList' },
        {
          children: _jsx(
            Mesa,
            Object.assign(
              { state: MesaState.create(tableState) },
              {
                children: _jsx(
                  'div',
                  Object.assign(
                    { className: 'stack' },
                    {
                      children:
                        userDatasets.length > 0 &&
                        _jsxs(
                          'div',
                          Object.assign(
                            {
                              style: { display: 'flex', alignItems: 'center' },
                            },
                            {
                              children: [
                                sharingModalOpen && selectedDatasets.length
                                  ? _jsx(SharingModal, {
                                      user: user,
                                      datasets: selectedDatasets,
                                      deselectDataset: this.onRowDeselect,
                                      shareUserDatasets: shareUserDatasets,
                                      unshareUserDatasets: unshareUserDatasets,
                                      onClose: this.closeSharingModal,
                                      dataNoun: dataNoun,
                                    })
                                  : null,
                                _jsx(SearchBox, {
                                  placeholderText: 'Search ' + dataNoun.plural,
                                  searchTerm: searchTerm,
                                  onSearchTermChange: this.onSearchTermChange,
                                }),
                                _jsxs(
                                  'div',
                                  Object.assign(
                                    {
                                      style: {
                                        flex: '0 0 auto',
                                        padding: '0 10px',
                                      },
                                    },
                                    {
                                      children: [
                                        'Showing ',
                                        filteredRows.length,
                                        ' of ',
                                        rows.length,
                                        ' ',
                                        rows.length === 1
                                          ? dataNoun.singular.toLowerCase()
                                          : dataNoun.plural.toLowerCase(),
                                      ],
                                    }
                                  )
                                ),
                                offerProjectToggle &&
                                  _jsxs(
                                    'div',
                                    Object.assign(
                                      {
                                        className:
                                          'UserDatasetList-ProjectToggle',
                                        style: {
                                          flex: '0 0 auto',
                                          padding: '0 10px',
                                        },
                                      },
                                      {
                                        children: [
                                          _jsx(Checkbox, {
                                            value: filterByProject,
                                            onChange: toggleProjectScope,
                                          }),
                                          ' ',
                                          _jsxs(
                                            'div',
                                            Object.assign(
                                              {
                                                onClick: () =>
                                                  toggleProjectScope(
                                                    !filterByProject
                                                  ),
                                                style: {
                                                  display: 'inline-block',
                                                },
                                              },
                                              {
                                                children: [
                                                  'Only show ',
                                                  dataNoun.plural.toLowerCase(),
                                                  ' related to',
                                                  ' ',
                                                  _jsx('b', {
                                                    children: projectName,
                                                  }),
                                                ],
                                              }
                                            )
                                          ),
                                        ],
                                      }
                                    )
                                  ),
                                _jsxs(
                                  'div',
                                  Object.assign(
                                    {
                                      style: {
                                        flex: '0 0 auto',
                                        padding: '0 10px',
                                      },
                                    },
                                    {
                                      children: [
                                        _jsx(Icon, { fa: 'info-circle' }),
                                        ' ',
                                        bytesToHuman(totalSize),
                                        ' (',
                                        normalizePercentage(totalPercent),
                                        '%) of',
                                        ' ',
                                        bytesToHuman(quotaSize),
                                        ' used',
                                      ],
                                    }
                                  )
                                ),
                              ],
                            }
                          )
                        ),
                    }
                  )
                ),
              }
            )
          ),
        }
      )
    );
  }
}
export default UserDatasetList;
//# sourceMappingURL=UserDatasetList.js.map
