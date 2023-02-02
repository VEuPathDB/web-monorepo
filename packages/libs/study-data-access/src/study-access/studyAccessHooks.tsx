import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  capitalize,
  isNil,
  negate,
  partition,
  zipWith
 } from 'lodash';

import { IconAlt, SingleSelect } from '@veupathdb/wdk-client/lib/Components';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { OverflowingTextCell } from '@veupathdb/wdk-client/lib/Views/Strategy/OverflowingTextCell';

import { ApprovalStatus, HistoryResult } from './EntityTypes';
import {
  StudyAccessApi,
} from './api';
import {
  UserPermissions,
  canAddEndUsers,
  canRemoveEndUsers,
  canUpdateApprovalStatus,
  canAddProviders,
  canRemoveProviders,
  canUpdateProviders,
  canUpdateStaff,
  permissionsResponseToUserPermissions,
  permittedApprovalStatusChanges,
  shouldDisplayEndUsersTable,
  shouldDisplayProvidersTable,
  shouldDisplayStaffTable,
  shouldDisplayHistoryTable,
} from './permission';
import { cx } from './components/StudyAccess';
import {
  Props as UserTableDialogProps,
  AccessDenialContent,
  AddUsersContent,
  ContentProps,
  UsersAddedContent
} from './components/UserTableDialog';
import {
  Props as UserTableSectionConfig
} from './components/UserTableSection';
import { fetchStudies, getStudyId } from '../shared/studies';
import { useWdkDependenciesWithStudyAccessApi } from '../shared/wdkDependencyHook';

interface BaseTableRow {
  userId: number;
  email: string;
}

interface StaffTableRow extends BaseTableRow {
  isOwner: boolean;
}

interface StaffTableFullRow extends StaffTableRow {
  name: string;
  staffId: number;
}

interface ProviderTableRow extends BaseTableRow {
  isManager: boolean;
}

interface ProviderTableFullRow extends ProviderTableRow {
  name: string;
  providerId: number;
}

interface EndUserTableRow extends BaseTableRow {
  name: string;
  startDate?: string;
  content: string;
  approvalStatus: ApprovalStatus;
  denialReason: string;
}

interface EndUserTableFullRow extends EndUserTableRow {
  purpose: string;
  researchQuestion: string;
  analysisPlan: string;
  disseminationPlan: string;
  priorAuth: string;
}

interface HistoryTableRow extends BaseTableRow {
  name: string;
  timestamp: HistoryResult['cause']['timestamp'];
  actionPerformer: string;
  changeDescription: string;
  content: string;
  approvalStatus: HistoryResult['row']['approvalStatus'];
  denialReason: NonNullable<HistoryResult['row']['denialReason']>;
  allowSelfEdits: boolean;
}

interface HistoryTableFullRow extends HistoryTableRow {
  action: HistoryResult['cause']['action'];
  purpose: NonNullable<HistoryResult['row']['purpose']>;
  researchQuestion: NonNullable<HistoryResult['row']['researchQuestion']>;
  analysisPlan: NonNullable<HistoryResult['row']['analysisPlan']>;
  disseminationPlan: NonNullable<HistoryResult['row']['disseminationPlan']>;
  priorAuth: NonNullable<HistoryResult['row']['priorAuth']>;
}

export type StaffTableSectionConfig = UserTableSectionConfig<StaffTableFullRow, keyof StaffTableRow>;
export type ProviderTableSectionConfig = UserTableSectionConfig<ProviderTableFullRow, keyof ProviderTableRow>;
export type EndUserTableSectionConfig = UserTableSectionConfig<EndUserTableFullRow, keyof EndUserTableRow>;
export type HistoryTableSectionConfig = UserTableSectionConfig<HistoryTableFullRow, keyof HistoryTableRow>;

export type OpenDialogConfig = UserTableDialogProps;

interface StaffTableUiState {
  isOwner: Record<number, boolean | undefined>;
}

interface ProviderTableUiState {
  isManager: Record<number, boolean | undefined>;
}

interface EndUserTableUiState {
  approvalStatus: Record<number, ApprovalStatus | undefined>;
  denialReason: Record<number, string | undefined>;
}

type StudyStatus =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'success', record: RecordInstance };

export function useStudy(datasetId: string): StudyStatus {
  const studies = useWdkService(fetchStudies, []);

  return useMemo(
    () => {
      if (studies == null) {
        return { status: 'loading' };
      }

      const study = studies.records.find(
        (study) => getStudyId(study) === datasetId
      );

      return study == null
        ? { status: 'not-found' }
        : { status: 'success', record: study };
    },
    [ datasetId, studies ]
  );
}

export function useStudyAccessApi() {
  return useWdkDependenciesWithStudyAccessApi().studyAccessApi;
}

export function useUserPermissions(fetchPermissions: StudyAccessApi['fetchPermissions']) {
  return usePromise(
    async () => {
      const permissionsResponse = await fetchPermissions();

      return permissionsResponseToUserPermissions(
        permissionsResponse
      );
    },
    [ fetchPermissions ]
  );
}

export function useTableUiState(activeDatasetId: string) {
  const initialStaffTableUiState: StaffTableUiState = {
    isOwner: {}
  };

  const initialProviderTableUiState: ProviderTableUiState = {
    isManager: {}
  };

  const initialEndUserTableUiState: EndUserTableUiState = {
    approvalStatus: {},
    denialReason: {}
  };

  const [ staffTableUiState, setStaffTableUiState ] = useState(initialStaffTableUiState);
  const [ providerTableUiState, setProviderTableUiState ] = useState(initialProviderTableUiState);
  const [ endUserTableUiState, setEndUserTableUiState ] = useState(initialEndUserTableUiState);

  useEffect(() => {
    setEndUserTableUiState(initialEndUserTableUiState);
    setProviderTableUiState(initialProviderTableUiState);
    setStaffTableUiState(initialStaffTableUiState);
  }, [ activeDatasetId ]);

  return {
    endUserTableUiState,
    providerTableUiState,
    staffTableUiState,
    setEndUserTableUiState,
    setProviderTableUiState,
    setStaffTableUiState
  };
}

export function useOpenDialogConfig() {
  const [ openDialogConfig, setOpenDialogConfig ] = useState<OpenDialogConfig | undefined>(undefined);

  const changeOpenDialogConfig = useCallback((newDialogContentProps: ContentProps | undefined) => {
    if (newDialogContentProps == null) {
      setOpenDialogConfig(undefined);
    } else if (newDialogContentProps.type === 'access-denial') {
      setOpenDialogConfig({
        title: 'Denying Access',
        onClose: () => {
          setOpenDialogConfig(undefined);
        },
        content: <AccessDenialContent {...newDialogContentProps} />
      });
    } else if (newDialogContentProps.type === 'add-users') {
      setOpenDialogConfig({
        title: `Adding ${capitalizeRole(newDialogContentProps.permissionNamePlural)}`,
        onClose: () => {
          setOpenDialogConfig(undefined);
        },
        content: <AddUsersContent {...newDialogContentProps} />
      });
    } else if (newDialogContentProps.type === 'users-added') {
      setOpenDialogConfig({
        title: `New ${capitalizeRole(newDialogContentProps.permissionNamePlural)}`,
        onClose: () => {
          setOpenDialogConfig(undefined);
        },
        content: <UsersAddedContent {...newDialogContentProps} />
      })
    }
  }, []);

  return {
    openDialogConfig,
    changeOpenDialogConfig
  };
}

export function useStaffTableSectionConfig(
  userId: number | undefined,
  userPermissions: UserPermissions | undefined,
  fetchStaffList: StudyAccessApi['fetchStaffList'],
  updateStaffEntry: StudyAccessApi['updateStaffEntry'],
  staffTableUiState: StaffTableUiState,
  setStaffTableUiState: (newState: StaffTableUiState) => void
): StaffTableSectionConfig {
  const { value, loading } = usePromise(
    fetchIfAllowed(
      userPermissions && shouldDisplayStaffTable(userPermissions),
      fetchStaffList
    ),
    [ userPermissions ]
  );

  const staffUpdateable = false;

  const {
    onIsOwnerChange
  } = useIsOwnerColumnConfig(
    updateStaffEntry,
    staffTableUiState,
    setStaffTableUiState
  );

  return useMemo(
    () => userId == null || value == null
      ? {
          status: 'loading'
        }
      : value.type === 'not-allowed'
      ? {
          status: 'unavailable'
        }
      : {
          status: 'success',
          title: 'Staff',
          value: {
            rows: value.result.data.map(({ user, staffId, isOwner }) => ({
              userId: user.userId,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              isOwner: staffTableUiState.isOwner[staffId] ?? isOwner,
              staffId
            })),
            columns: {
              userId: {
                key: 'userId',
                name: 'User ID',
                className: cx('--UserIdentityCell'),
                sortable: true,
                makeOrder: ({ name, userId }) => [name, userId],
                makeSearchableString: (_, { name, userId }) => `${name} ${userId} (${userId})`,
                renderCell: ({ row: { name, userId } }) => `${name} (${userId})`
              },
              email: {
                key: 'email',
                name: 'Email',
                className: cx('--EmailCell'),
                sortable: true
              },
              isOwner: {
                key: 'isOwner',
                name: 'Is Owner?',
                className: cx('--IsOwnerCell'),
                sortable: true,
                makeSearchableString: booleanToString,
                makeOrder: ({ isOwner }) => booleanToString(isOwner),
                renderCell: ({ value, row: { staffId, userId: wdkUserId } }) => {
                  return !staffUpdateable || wdkUserId === userId
                    ? booleanToString(value)
                    : <SingleSelect
                        items={BOOLEAN_SELECT_ITEMS}
                        value={booleanToString(value)}
                        onChange={(newValue) => {
                          onIsOwnerChange(
                            staffId,
                            stringToBoolean(newValue)
                          );
                        }}
                      />;
                }
              }
            },
            columnOrder: [ 'userId', 'email', 'isOwner' ],
            idGetter: ({ userId }) => userId,
            initialSort: { columnKey: 'userId', direction: 'asc' }
          }
        },
    [
      userId,
      value,
      staffUpdateable,
      staffTableUiState,
      onIsOwnerChange
    ]
  );
}

export function useProviderTableSectionConfig(
  userId: number | undefined,
  userPermissions: UserPermissions | undefined,
  fetchProviderList: StudyAccessApi['fetchProviderList'],
  createProviderEntry: StudyAccessApi['createProviderEntry'],
  updateProviderEntry: StudyAccessApi['updateProviderEntry'],
  deleteProviderEntry: StudyAccessApi['deleteProviderEntry'],
  activeDatasetId: string,
  providerTableUiState: ProviderTableUiState,
  setProvideTableUiState: (newState: ProviderTableUiState) => void,
  changeOpenDialogConfig: (newDialogContentProps: ContentProps | undefined) => void
): ProviderTableSectionConfig {
  const { value, loading, reload: reloadProvidersTable } = usePromiseWithReloadCallback(
    fetchIfAllowed(
      userPermissions && shouldDisplayProvidersTable(userPermissions, activeDatasetId),
      () => fetchProviderList(activeDatasetId)
    ),
    [ userPermissions, activeDatasetId ]
  );

  const providersAddable = userPermissions && canAddProviders(userPermissions, activeDatasetId);
  const providersRemovable = userPermissions && canRemoveProviders(userPermissions);
  const providersUpdateable = userPermissions && canUpdateProviders(userPermissions, activeDatasetId);

  const {
    onIsManagerChange
  } = useIsManagerColumnConfig(
    updateProviderEntry,
    providerTableUiState,
    setProvideTableUiState
  );

  return useMemo(
    () => userId == null || value == null
      ? {
          status: 'loading'
        }
      : value.type === 'not-allowed'
      ? {
          status: 'unavailable'
        }
      : {
          status: 'success',
          title: 'Study Team Members',
          value: {
            rows: value.result.data.map(({ user, providerId, isManager }) => ({
              userId: user.userId,
              providerId,
              name: `${user.firstName} ${user.lastName}`,
              email: `${user.email}`,
              isManager: providerTableUiState.isManager[providerId] ?? isManager
            })),
            columns: {
              userId: {
                key: 'userId',
                name: 'User ID',
                className: cx('--UserIdentityCell'),
                sortable: true,
                makeOrder: ({ name, userId }) => [name, userId],
                makeSearchableString: (_, { name, userId }) => `${name} ${userId} (${userId})`,
                renderCell: ({ row: { name, userId } }) => `${name} (${userId})`
              },
              email: {
                key: 'email',
                name: 'Email',
                className: cx('--EmailCell'),
                sortable: true
              },
              isManager: {
                key: 'isManager',
                name: 'Is Manager?',
                className: cx('--IsManagerCell'),
                sortable: true,
                makeSearchableString: booleanToString,
                makeOrder: ({ isManager }) => booleanToString(isManager),
                renderCell: ({ value, row: { providerId, userId: wdkUserId } }) => {
                  return !providersUpdateable || wdkUserId === userId
                    ? booleanToString(value)
                    : <SingleSelect
                        items={BOOLEAN_SELECT_ITEMS}
                        value={booleanToString(value)}
                        onChange={(newValue) => {
                          onIsManagerChange(
                            providerId,
                            stringToBoolean(newValue)
                          );
                        }}
                      />;
                }
              }
            },
            columnOrder: [ 'userId', 'email', 'isManager' ],
            idGetter: ({ userId }) => userId,
            initialSort: { columnKey: 'userId', direction: 'asc' },
            actions: makeProviderTableActions(
              activeDatasetId,
              createProviderEntry,
              deleteProviderEntry,
              changeOpenDialogConfig,
              reloadProvidersTable,
              providersAddable,
              providersRemovable
            )
          }
        },
    [
      userId,
      value,
      loading,
      providersAddable,
      providersRemovable,
      providersUpdateable,
      onIsManagerChange,
      providerTableUiState,
      reloadProvidersTable,
      changeOpenDialogConfig,
      createProviderEntry,
      deleteProviderEntry
    ]
  );
}

export function useEndUserTableSectionConfig(
  userId: number | undefined,
  userPermissions: UserPermissions | undefined,
  fetchEndUserList: StudyAccessApi['fetchEndUserList'],
  createEndUserEntry: StudyAccessApi['createEndUserEntry'],
  updateEndUserEntry: StudyAccessApi['updateEndUserEntry'],
  deleteEndUserEntry: StudyAccessApi['deleteEndUserEntry'],
  activeDatasetId: string,
  endUserTableUiState: EndUserTableUiState,
  setEndUserTableUiState: (newState: EndUserTableUiState) => void,
  changeOpenDialogConfig: (newDialogContentProps: ContentProps | undefined) => void
): EndUserTableSectionConfig {
  const { value, loading, reload: reloadEndUsersTable } = usePromiseWithReloadCallback(
    fetchIfAllowed(
      userPermissions && shouldDisplayEndUsersTable(userPermissions, activeDatasetId),
      () => fetchEndUserList(activeDatasetId)
    ),
    [ userPermissions, activeDatasetId ]
  );

  const endUsersAddable = userPermissions && canAddEndUsers(userPermissions, activeDatasetId);
  const endUsersRemovable = userPermissions && canRemoveEndUsers(userPermissions);

  const {
    approvalStatusEditable,
    onApprovalStatusChange
  } = useApprovalStatusColumnConfig(
    userPermissions,
    activeDatasetId,
    updateEndUserEntry,
    endUserTableUiState,
    setEndUserTableUiState,
    changeOpenDialogConfig
  );

  return useMemo(
    () => userId == null || value == null
      ? {
          status: 'loading'
        }
      : value.type === 'not-allowed'
      ? {
          status: 'unavailable'
        }
      : {
          status: 'success',
          title: 'End Users',
          value: {
            rows: value.result.data.map(({
              user,
              startDate,
              approvalStatus,
              purpose,
              researchQuestion,
              analysisPlan,
              disseminationPlan,
              denialReason = '',
              priorAuth,
            }) => ({
              userId: user.userId,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              startDate,
              approvalStatus: endUserTableUiState.approvalStatus[user.userId] ?? approvalStatus,
              content: makeContentSearchableSring(
                purpose,
                researchQuestion,
                analysisPlan,
                disseminationPlan,
                priorAuth,
              ),
              purpose: purpose ?? '',
              researchQuestion: researchQuestion ?? '',
              analysisPlan: analysisPlan ?? '',
              disseminationPlan: disseminationPlan ?? '',
              denialReason: endUserTableUiState.denialReason[user.userId] ?? denialReason,
              priorAuth: priorAuth ?? '',
            })),
            columns: {
              userId: {
                key: 'userId',
                name: 'User ID',
                className: cx('--UserIdCell'),
                sortable: true
              },
              name: {
                key: 'name',
                name: 'Name',
                className: cx('--NameCell'),
                sortable: true
              },
              email: {
                key: 'email',
                name: 'Email',
                className: cx('--EmailCell'),
                sortable: true
              },
              startDate: {
                key: 'startDate',
                name: 'Date Created',
                className: cx('--TimestampCell'),
                sortable: true,
                renderCell: ({ value }) => isoToUtcString(value),
                makeSearchableString: isoToUtcString
              },
              approvalStatus: {
                key: 'approvalStatus',
                name: 'Approval Status',
                className: cx('--ApprovalStatusCell'),
                sortable: true,
                renderCell: ({ value, row: { userId: wdkUserId, name } }) => {
                  return !approvalStatusEditable || wdkUserId === userId
                    ? makeApprovalStatusDisplayName(value)
                    : <SingleSelect
                        items={makeApprovalStatusSelectItems(value)}
                        value={value}
                        onChange={(newValue) => {
                          onApprovalStatusChange(
                            wdkUserId,
                            name,
                            activeDatasetId,
                            newValue as ApprovalStatus
                          );
                        }}
                      />;
                }
              },
              content: {
                key: 'content',
                name: 'Content',
                className: cx('--ContentCell'),
                sortable: false,
                width: '35em',
                renderCell: ({ row: { userId, purpose, researchQuestion, analysisPlan, disseminationPlan, priorAuth } }) => {
                  const textValue = makeContentDisplay(
                    purpose,
                    researchQuestion,
                    analysisPlan,
                    disseminationPlan,
                    priorAuth,
                  );

                  return <OverflowingTextCell key={userId} value={textValue} />;
                }
              },
              denialReason: {
                key: 'denialReason',
                name: 'Notes',
                className: cx('--NotesCell'),
                sortable: false,
                width: '15em',
                renderCell: ({ value, row: { userId } }) =>
                  <OverflowingTextCell key={userId} value={value} />
              }
            },
            columnOrder: [
              'userId',
              'name',
              'email',
              'startDate',
              'approvalStatus',
              'content',
              'denialReason',
            ],
            idGetter: ({ userId }) => userId,
            initialSort: { columnKey: 'startDate', direction: 'desc' },
            actions: makeEndUserTableActions(
              activeDatasetId,
              createEndUserEntry,
              deleteEndUserEntry,
              changeOpenDialogConfig,
              reloadEndUsersTable,
              endUsersAddable,
              endUsersRemovable
            )
          }
        },
    [
      value,
      loading,
      approvalStatusEditable,
      onApprovalStatusChange,
      endUserTableUiState,
      reloadEndUsersTable,
      activeDatasetId,
      endUsersAddable,
      endUsersRemovable,
      changeOpenDialogConfig,
      createEndUserEntry,
      deleteEndUserEntry
    ]
  );
}

export function useHistoryTableSectionConfig(
  userPermissions: UserPermissions | undefined,
  fetchHistory: StudyAccessApi['fetchHistory'],
  activeDatasetId: string
): HistoryTableSectionConfig {
  const { value, loading } = usePromise(
    fetchIfAllowed(
      userPermissions && shouldDisplayHistoryTable(userPermissions),
      fetchHistory
    ),
    [ userPermissions ]
  );

  return useMemo(
    () => value == null || loading
      ? {
          status: 'loading'
        }
      : value.type === 'not-allowed'
      ? {
          status: 'unavailable'
        }
      : {
          status: 'success',
          title: 'End User Table Updates',
          value: {
            rows: value.result.results
              .filter(({ row: { datasetPresenterID } }) => datasetPresenterID === activeDatasetId)
              .map(({ cause, row }) => ({
                userId: row.user.userID,
                name: `${row.user.firstName} ${row.user.lastName}`,
                email: row.user.email,
                timestamp: cause.timestamp,
                actionPerformer: `${cause.user.firstName} ${cause.user.lastName}`,
                action: cause.action,
                approvalStatus: row.approvalStatus,
                purpose: row.purpose ?? '',
                researchQuestion: row.researchQuestion ?? '',
                analysisPlan: row.analysisPlan ?? '',
                disseminationPlan: row.disseminationPlan ?? '',
                priorAuth: row.priorAuth ?? '',
                content: makeContentSearchableSring(
                  row.purpose,
                  row.researchQuestion,
                  row.analysisPlan,
                  row.disseminationPlan,
                  row.priorAuth
                ),
                denialReason: row.denialReason ?? '',
                allowSelfEdits: row.allowSelfEdits,
              }))
              .sort(({ timestamp: timestampA }, { timestamp: timestampB }) =>
                timestampA === timestampB
                  ? 0
                  : timestampA < timestampB
                  ? -1
                  : 1
              )
              .reduce(
                addChangeDescription,
                {
                  rowsWithChangeDescriptions: [],
                  lastRowsByEndUser: {}
                }
              )
              .rowsWithChangeDescriptions,
            columns: {
              userId: {
                key: 'userId',
                name: 'User ID',
                className: cx('--UserIdCell'),
                sortable: true
              },
              name: {
                key: 'name',
                name: 'Name',
                className: cx('--NameCell'),
                sortable: true
              },
              email: {
                key: 'email',
                name: 'Email',
                className: cx('--EmailCell'),
                sortable: true
              },
              timestamp: {
                key: 'timestamp',
                name: 'Date Of Action',
                className: cx('--TimestampCell'),
                sortable: true,
                renderCell: ({ value }) => isoToUtcString(value),
                makeSearchableString: isoToUtcString
              },
              actionPerformer: {
                key: 'actionPerformer',
                name: 'Who Performed Action',
                className: cx('--NameCell'),
                sortable: true,
              },
              changeDescription: {
                key: 'changeDescription',
                name: 'Action',
                className: cx('--ChangeDescriptionCell'),
                sortable: true,
                renderCell: ({ value }) => value.toLowerCase()
              },
              approvalStatus: {
                key: 'approvalStatus',
                name: 'Approval Status',
                className: cx('--ApprovalStatusCell'),
                sortable: true,
                renderCell: ({ value }) => value.toLowerCase()
              },
              content: {
                key: 'content',
                name: 'Content',
                className: cx('--ContentCell'),
                sortable: false,
                width: '35em',
                renderCell: ({ row }) => {
                  const textValue = makeContentDisplay(
                    row.purpose,
                    row.researchQuestion,
                    row.analysisPlan,
                    row.disseminationPlan,
                    row.priorAuth
                  );

                  return <OverflowingTextCell key={getHistoryTableRowId(row)} value={textValue} />;
                }
              },
              denialReason: {
                key: 'denialReason',
                name: 'Notes',
                className: cx('--NotesCell'),
                sortable: false,
                width: '15em',
                renderCell: ({ value, row }) =>
                  <OverflowingTextCell key={getHistoryTableRowId(row)} value={value} />
              },
              allowSelfEdits: {
                key: 'allowSelfEdits',
                name: 'Lock/Unlock',
                className: cx('--LockUnlockCell'),
                sortable: false,
                renderCell: ({ value }) => value ? 'unlocked' : 'locked'
              }
            },
            columnOrder: [
              'userId',
              'name',
              'email',
              'timestamp',
              'actionPerformer',
              'changeDescription',
              'approvalStatus',
              'denialReason',
              'content',
              'allowSelfEdits'
            ],
            idGetter: getHistoryTableRowId,
            initialSort: { columnKey: 'timestamp', direction: 'desc' }
          }
        },
    [ activeDatasetId, loading, value ]
  );
}

function useIsOwnerColumnConfig(
  updateStaffEntry: StudyAccessApi['updateStaffEntry'],
  staffTableUiState: StaffTableUiState,
  setStaffTableUiState: (newState: StaffTableUiState) => void
) {
  const onIsOwnerChange = useCallback(
    async (staffId: number, newIsOwner: boolean) => {
      const oldIsOwner = staffTableUiState.isOwner[staffId];

      updateUiStateOptimistically(
        () => {
          updateStaffIsOwnerUiState(
            staffTableUiState,
            setStaffTableUiState,
            staffId,
            newIsOwner
          );
        },
        async () => {
          updateStaffEntry(
            staffId,
            [
              {
                op: 'replace',
                path: '/isOwner',
                value: newIsOwner
              }
            ]
          );
        },
        () => {
          updateStaffIsOwnerUiState(
            staffTableUiState,
            setStaffTableUiState,
            staffId,
            oldIsOwner
          );
        }
      );
    },
    [
      updateStaffEntry,
      staffTableUiState,
      setStaffTableUiState
    ]
  );

  return {
    onIsOwnerChange
  };
}

function useIsManagerColumnConfig(
  updateProviderEntry: StudyAccessApi['updateProviderEntry'],
  providerTableUiState: ProviderTableUiState,
  setProviderTableUiState: (newState: ProviderTableUiState) => void
) {
  const onIsManagerChange = useCallback(
    async (providerId: number, newIsManager: boolean) => {
      const oldIsManager = providerTableUiState.isManager[providerId];

      updateUiStateOptimistically(
        () => {
          updateProviderIsManagerUiState(
            providerTableUiState,
            setProviderTableUiState,
            providerId,
            newIsManager
          );
        },
        async () => {
          updateProviderEntry(
            providerId,
            [
              {
                op: 'replace',
                path: '/isManager',
                value: newIsManager
              }
            ]
          );
        },
        () => {
          updateProviderIsManagerUiState(
            providerTableUiState,
            setProviderTableUiState,
            providerId,
            oldIsManager
          );
        }
      );
    },
    [
      updateProviderEntry,
      providerTableUiState,
      setProviderTableUiState
    ]
  );

  return {
    onIsManagerChange
  };
}

function useApprovalStatusColumnConfig(
  userPermissions: UserPermissions | undefined,
  activeDatasetId: string,
  updateEndUserEntry: StudyAccessApi['updateEndUserEntry'],
  endUserTableUiState: EndUserTableUiState,
  setEndUserTableUiState: (newState: EndUserTableUiState) => void,
  changeOpenDialogConfig: (newDialogContentProps: ContentProps | undefined) => void
) {
  const onApprovalStatusChange = useCallback(
    async (
      userId: number,
      userName: string,
      datasetId: string,
      newApprovalStatus: ApprovalStatus
    ) => {
      const oldApprovalStatus = endUserTableUiState.approvalStatus[userId];
      const oldDenialReason = endUserTableUiState.denialReason[userId];

      if (newApprovalStatus !== 'denied') {
        const denialReason = `${makeTimestampString()}: Status was changed to ${makeApprovalStatusDisplayName(newApprovalStatus)}.`;

        updateUiStateOptimistically(
          () => {
            updateEndUserApprovalStatusUiState(
              endUserTableUiState,
              setEndUserTableUiState,
              userId,
              newApprovalStatus,
              denialReason
            );
          },
          async () => {
            await updateEndUserEntry(
              userId,
              datasetId,
              [
                {
                  op: 'replace',
                  path: '/approvalStatus',
                  value: newApprovalStatus
                },
                {
                  op: 'replace',
                  path: '/denialReason',
                  value: denialReason
                }
              ]
            );
          },
          () => {
            updateEndUserApprovalStatusUiState(
              endUserTableUiState,
              setEndUserTableUiState,
              userId,
              oldApprovalStatus,
              oldDenialReason
            );
          }
        );
      } else {
        changeOpenDialogConfig({
          type: 'access-denial',
          userName,
          onSubmit: function(denialReason) {
            changeOpenDialogConfig(undefined);

            const fullDenialReason = `${makeTimestampString()}: Status was changed to ${makeApprovalStatusDisplayName('denied')}. Reason: ${denialReason}`;

            updateUiStateOptimistically(
              () => {
                updateEndUserApprovalStatusUiState(
                  endUserTableUiState,
                  setEndUserTableUiState,
                  userId,
                  newApprovalStatus,
                  fullDenialReason
                );
              },
              async () => {
                await updateEndUserEntry(
                  userId,
                  datasetId,
                  [
                    {
                      op: 'replace',
                      path: '/approvalStatus',
                      value: newApprovalStatus
                    },
                    {
                      op: 'replace',
                      path: '/denialReason',
                      value: fullDenialReason
                    }
                  ]
                );
              },
              () => {
                updateEndUserApprovalStatusUiState(
                  endUserTableUiState,
                  setEndUserTableUiState,
                  userId,
                  oldApprovalStatus,
                  oldDenialReason
                );
              }
            );
          }
        });
      }
    },
    [
      updateEndUserEntry,
      changeOpenDialogConfig,
      endUserTableUiState,
      setEndUserTableUiState
    ]
  );

  return {
    approvalStatusEditable: (
      userPermissions &&
      canUpdateApprovalStatus(userPermissions, activeDatasetId)
    ),
    onApprovalStatusChange
  };
}

interface TableAction<R> {
  selectionRequired: boolean;
  element: (selection: R[]) => JSX.Element;
  callback: (selection: R[]) => Promise<void>;
}

function makeProviderTableActions(
  activeDatasetId: string,
  createProviderEntry: StudyAccessApi['createProviderEntry'],
  deleteProviderEntry: StudyAccessApi['deleteProviderEntry'],
  changeOpenDialogConfig: (newDialogContentProps: ContentProps | undefined) => void,
  reloadProvidersTable: () => void,
  providersAddable: boolean | undefined,
  providersRemovable: boolean | undefined,
) {
  const addProviders = !providersAddable ? undefined : {
    element: (
      <button type="button" className="btn">
        <IconAlt fa="plus" />
        Add Providers
      </button>
    ),
    callback: () => {
      changeOpenDialogConfig({
        type: 'add-users',
        permissionNamePlural: 'providers',
        onSubmit: async (providerEmails: string[]) => {
          changeOpenDialogConfig(undefined);

          const addedUsers = await Promise.all(
            providerEmails.map(
              providerEmail => createProviderEntry({
                datasetId: activeDatasetId,
                email: providerEmail,
                isManager: false
              })
            )
          );

          const addedUsersWithEmails = zipWith(
            addedUsers,
            providerEmails,
            (addedUser, email) => ({
              ...addedUser,
              email
            })
          );

          const [ createdUsers, emailedUsers ] = partition(addedUsersWithEmails, ({ created }) => created);

          changeOpenDialogConfig({
            type: 'users-added',
            createdUsers: createdUsers.map(({ email }) => email),
            emailedUsers: emailedUsers.map(({ email }) => email),
            permissionName: 'provider',
            permissionNamePlural: 'providers',
            onConfirm: () => {
              changeOpenDialogConfig(undefined);
            }
          });

          reloadProvidersTable();
        }
      });
    }
  };

  const removeProviders = !providersRemovable ? undefined : {
    selectionRequired: true,
    element: (selection: ProviderTableFullRow[]) => (
      <button
        type="button"
        className="btn"
        disabled={selection.length === 0}
      >
        <IconAlt fa="trash" />
        Remove {selection.length === 1 ? 'Provider' : 'Providers'}
      </button>
    ),
    callback: async (selection: ProviderTableFullRow[]) => {
      await Promise.all(
        selection.map(({ providerId }) => deleteProviderEntry(providerId))
      );

      reloadProvidersTable();
    }
  }

  const availableActions = [
    addProviders,
    removeProviders
  ].filter(
    (action): action is TableAction<ProviderTableRow> => action != null
  );

  return availableActions.length === 0
    ? undefined
    : availableActions;
}

function makeEndUserTableActions(
  activeDatasetId: string,
  createEndUserEntry: StudyAccessApi['createEndUserEntry'],
  deleteEndUserEntry: StudyAccessApi['deleteEndUserEntry'],
  changeOpenDialogConfig: (newDialogContentProps: ContentProps | undefined) => void,
  reloadEndUsersTable: () => void,
  endUsersAddable: boolean | undefined,
  endUsersRemovable: boolean | undefined,
) {
  const addEndUsers = !endUsersAddable ? undefined : {
    selectionRequired: false,
    element: (
      <button type="button" className="btn">
        <IconAlt fa="plus" />
        Add End Users
      </button>
    ),
    callback: () => {
      changeOpenDialogConfig({
        type: 'add-users',
        permissionNamePlural: 'end users',
        onSubmit: async (endUserEmails: string[]) => {
          changeOpenDialogConfig(undefined);

          const addedUsers = await Promise.all(
            endUserEmails.map(
              endUserEmail => createEndUserEntry({
                datasetId: activeDatasetId,
                email: endUserEmail,
                purpose: '',
                researchQuestion: '',
                analysisPlan: '',
                disseminationPlan: '',
                approvalStatus: 'approved',
                startDate: new Date().toISOString(),
                priorAuth: '',
                restrictionLevel: 'public',
                duration: -1,
                denialReason: undefined
              })
            )
          );

          const addedUsersWithEmails = zipWith(
            addedUsers,
            endUserEmails,
            (addedUser, email) => ({
              ...addedUser,
              email
            })
          );

          const [ createdUsers, emailedUsers ] = partition(addedUsersWithEmails, ({ created }) => created);

          changeOpenDialogConfig({
            type: 'users-added',
            createdUsers: createdUsers.map(({ email }) => email),
            emailedUsers: emailedUsers.map(({ email }) => email),
            permissionName: 'end user',
            permissionNamePlural: 'end users',
            onConfirm: () => {
              changeOpenDialogConfig(undefined);
            }
          });

          reloadEndUsersTable();
        }
      });
    }
  };

  const removeEndUsers = !endUsersRemovable ? undefined : {
    selectionRequired: true,
    element: (selection: EndUserTableFullRow[]) => (
      <button
        type="button"
        className="btn"
        disabled={selection.length === 0}
      >
        <IconAlt fa="trash" />
        Remove {selection.length === 1 ? 'End User' : 'End Users'}
      </button>
    ),
    callback: async (selection: EndUserTableFullRow[]) => {
      await Promise.all(
        selection.map(({ userId }) => deleteEndUserEntry(userId, activeDatasetId))
      );

      reloadEndUsersTable();
    }
  };

  const availableActions = [
    addEndUsers,
    removeEndUsers
  ].filter(
    (action): action is TableAction<EndUserTableFullRow> => action != null
  );

  return availableActions.length === 0
    ? undefined
    : availableActions;
}

type ConditionalFetchResult<T> =
  | { type: 'not-allowed' }
  | { type: 'allowed', result: T };

function fetchIfAllowed<T>(allowed: boolean | undefined, factory: () => Promise<T>): () => Promise<ConditionalFetchResult<T>> {
  return async () => !allowed
    ? { type: 'not-allowed' }
    : { type: 'allowed', result: await factory() };
}

function usePromiseWithReloadCallback<T>(factory: () => Promise<T>, deps?: any[]) {
  const [ reloadTime, setReloadTime ] = useState(Date.now());

  const reload = useCallback(
    () => {
      setReloadTime(Date.now())
    },
    []
  );

  const fullDeps = useMemo(
    () => deps == null
      ? [ reloadTime ]
      : [ ...deps, reloadTime ],
    [ deps, reloadTime ]
  );

  const promiseStatus = usePromise(factory, fullDeps);

  return {
    ...promiseStatus,
    reload
  };
}

async function updateUiStateOptimistically(
  optimisticUiStateUpdate: () => void,
  serviceUpdateCb: () => Promise<void>,
  rollbackUiStateUpdate: () => void
) {
  // Update the UI state optimistically
  optimisticUiStateUpdate();

  try {
    // Try to update the backend
    await serviceUpdateCb();
  } catch (e) {
    // If the backend update fails, rollback the optimistic UI state
    // update and throw an error
    rollbackUiStateUpdate();

    throw e;
  }
}

function updateStaffIsOwnerUiState(
  staffTableUiState: StaffTableUiState,
  setStaffTableUiState: (newState: StaffTableUiState) => void,
  staffId: number,
  newIsOwner: boolean | undefined
) {
  setStaffTableUiState({
    ...staffTableUiState,
    isOwner: {
      ...staffTableUiState.isOwner,
      [staffId]: newIsOwner
    }
  });
}


function updateProviderIsManagerUiState(
  providerTableUiState: ProviderTableUiState,
  setProviderTableUiState: (newState: ProviderTableUiState) => void,
  providerId: number,
  newIsManager: boolean | undefined
) {
  setProviderTableUiState({
    ...providerTableUiState,
    isManager: {
      ...providerTableUiState.isManager,
      [providerId]: newIsManager
    }
  });
}

function updateEndUserApprovalStatusUiState(
  endUserTableUiState: EndUserTableUiState,
  setEndUserTableUiState: (newState: EndUserTableUiState) => void,
  userId: number,
  newApprovalStatus: ApprovalStatus | undefined,
  newDenialReason: string | undefined
) {
  setEndUserTableUiState({
    ...endUserTableUiState,
    approvalStatus: {
      ...endUserTableUiState.approvalStatus,
      [userId]: newApprovalStatus
    },
    denialReason: {
      ...endUserTableUiState.denialReason,
      [userId]: newDenialReason
    }
  });
}

function booleanToString(value: boolean) {
  return value === true ? 'Yes' : 'No';
}

function stringToBoolean(value: string) {
  return value === 'Yes';
}

const BOOLEAN_SELECT_ITEMS = [
  {
    value: booleanToString(true),
    display: booleanToString(true)
  },
  {
    value: booleanToString(false),
    display: booleanToString(false)
  }
];

function makeApprovalStatusSelectItems(oldApprovalStatus: ApprovalStatus) {
  return permittedApprovalStatusChanges(oldApprovalStatus).map(permittedStatus => ({
    value: permittedStatus,
    display: makeApprovalStatusDisplayName(permittedStatus)
  }));
}

function makeApprovalStatusDisplayName(approvalStatus: ApprovalStatus) {
  return capitalize(approvalStatus);
}

function makeTimestampString() {
  return dateToUtcString(new Date());
}

function isoToUtcString(value: string | undefined) {
  return value == null
    ? ''
    : dateToUtcString(new Date(value))
}

function dateToUtcString(date: Date) {
  return date.toUTCString().replace(/^[A-Z][a-z][a-z],\s/i, '');
}

function capitalizeRole(role: string) {
  return role.split(' ').map(capitalize).join(' ');
}

function makeContentSearchableSring(
  purpose: string | undefined,
  researchQuestion: string | undefined,
  analysisPlan: string | undefined,
  disseminationPlan: string | undefined,
  priorAuth: string | undefined,
) {
  return [
    purpose && 'Purpose:',
    purpose,
    researchQuestion && 'Research Question:',
    researchQuestion,
    analysisPlan && 'Analysis Plan:',
    analysisPlan,
    disseminationPlan && 'Dissemination Plan:',
    disseminationPlan,
    priorAuth && 'Prior Authorization:',
  ].filter(negate(isNil)).join('\0');
}

function makeContentDisplay(
  purpose: string,
  researchQuestion: string,
  analysisPlan: string,
  disseminationPlan: string,
  priorAuth: string,
) {
  const contentFields = zipWith(
    [ 'Purpose:', 'Research Question:', 'Analysis Plan:', 'Dissemination Plan:', 'Prior Authorization:'],
    [ purpose, researchQuestion, analysisPlan, disseminationPlan, priorAuth ],
    (heading, field) => {
      return field.length > 0
        ? `${heading}\n${field}`
        : undefined
    }
  );

  return contentFields.filter(negate(isNil)).join('\n\n');
}

function getHistoryTableRowId(row: HistoryTableFullRow) {
  return `${row.userId}-${row.timestamp}`
}

interface RowHistory {
  rowsWithChangeDescriptions: HistoryTableFullRow[];
  lastRowsByEndUser: Record<string, HistoryTableFullRow>;
}

function addChangeDescription(rowHistory: RowHistory, nextRow: Omit<HistoryTableFullRow, 'changeDescription'>) {
  const rowWithChangeDescription = {
    ...nextRow,
    changeDescription: nextRow.action !== 'UPDATE'
      ? nextRow.action
      : makeUpdateChangeDescription(
          nextRow,
          rowHistory.lastRowsByEndUser[nextRow.userId]
        )
  };

  rowHistory.rowsWithChangeDescriptions.push(rowWithChangeDescription);
  rowHistory.lastRowsByEndUser[nextRow.userId] = rowWithChangeDescription;

  return rowHistory;
}

const COLUMNS_TO_MONITOR_FOR_CHANGE = {
  'approvalStatus': 'approval status',
  'content': 'content',
  'denialReason': 'notes',
  'allowSelfEdits': 'lock/unlock'
} as const;

const COLUMNS_TO_MONITOR_FOR_CHANGE_KEYS =
  Object.keys(COLUMNS_TO_MONITOR_FOR_CHANGE) as (keyof typeof COLUMNS_TO_MONITOR_FOR_CHANGE)[];

function makeUpdateChangeDescription(nextRow: Omit<HistoryTableFullRow, 'changeDescription'>, prevRow?: HistoryTableFullRow) {
  const changedColumns = prevRow == null
    ? []
    : COLUMNS_TO_MONITOR_FOR_CHANGE_KEYS
      .filter(columnKey => prevRow[columnKey] !== nextRow[columnKey])
      .map(columnKey => COLUMNS_TO_MONITOR_FOR_CHANGE[columnKey]);

  return changedColumns.length === 0
    ? `update`
    : `update ${changedColumns.join(', ')}`;
}
