import { get } from 'lodash';

import { transitionToInternalPage } from '../../Core/ActionCreators/RouterActionCreators';
import { PreferenceUpdateAction, updateUserPreference } from '../User/UserActionCreators';
import { ActionThunk, EmptyAction, emptyAction } from '../../Utils/ActionCreatorUtils';
import { UserDataset, UserDatasetMeta } from '../../Utils/WdkModel';
import { ServiceError, UserDatasetShareResponse } from '../../Utils/WdkService';

export type ListLoadingAction = {
  type: 'user-datasets/list-loading'
}

export type ListReceivedAction = {
  type: 'user-datasets/list-received',
  payload: {
    userDatasets: UserDataset[],
    filterByProject: boolean;
  }
}

export type ListErrorReceivedAction = {
  type: 'user-datasets/list-error',
  payload: {
    error: ServiceError
  }
}

export type DetailLoading = {
  type: 'user-datasets/detail-loading',
  payload: {
    id: number
  }
}

export type DetailReceivedAction = {
  type: 'user-datasets/detail-received',
  payload: {
    id: number,
    userDataset?: UserDataset
  }
}

export type DetailErrorAction = {
  type: 'user-datasets/detail-error',
  payload: {
    error: ServiceError
  }
}

export type DetailUpdatingAction = {
  type: 'user-datasets/detail-updating'
}

export type DetailUpdateSuccessAction = {
  type: 'user-datasets/detail-update-success',
  payload: {
    userDataset: UserDataset
  }
}

export type DetailUpdateErrorAction = {
  type: 'user-datasets/detail-update-error',
  payload: {
    error: ServiceError
  }
}

export type DetailRemovingAction = {
  type: 'user-datasets/detail-removing'
}

export type DetailRemoveSuccessAction = {
  type: 'user-datasets/detail-remove-success',
  payload: {
    userDataset: UserDataset
  }
}

export type DetailRemoveErrorAction = {
  type: 'user-datasets/detail-remove-error',
  payload: {
    error: ServiceError
  }
}

export type SharingDatasetAction = {
  type: 'user-datasets/sharing-dataset',
  payload: {
    userDataset: UserDataset,
    recipients: string[]
  }
}

export type SharingSuccessAction = {
  type: 'user-datasets/sharing-success',
  payload: {
    response: UserDatasetShareResponse
  }
}

export type SharingErrorAction = {
  type: 'user-datasets/sharing-error',
  payload: {
    error: Error
  }
}

export type ProjectFilterAction = {
  type: 'user-datasets/project-filter-preference-received',
  payload: {
    filterByProject: boolean
  }
}

type ListAction = ListLoadingAction|ListReceivedAction|ListErrorReceivedAction;
type DetailAction = DetailLoading|DetailReceivedAction|DetailErrorAction;
type UpdateAction = DetailUpdatingAction|DetailUpdateSuccessAction|DetailUpdateErrorAction;
type RemovalAction = DetailRemovingAction|DetailRemoveSuccessAction|DetailRemoveErrorAction;
type SharingAction = SharingDatasetAction|SharingSuccessAction|SharingErrorAction;

const FILTER_BY_PROJECT_PREF = 'userDatasets.filterByProject';

export function loadUserDatasetList(): ActionThunk<ListAction> {
  return ({ wdkService }) => [
    <ListLoadingAction>{ type: 'user-datasets/list-loading' },
    Promise.all([
      wdkService.getCurrentUserPreferences()
        .then(
          preferences => get(preferences.global, FILTER_BY_PROJECT_PREF, 'false') !== 'false',
          // ignore error and default to false
          () => false
        ),
      wdkService.getCurrentUserDatasets()
    ])
      .then(
      ([ filterByProject, userDatasets ]) => (<ListReceivedAction>{ type: 'user-datasets/list-received', payload: { userDatasets, filterByProject } }),
      (error: ServiceError) => (<ListErrorReceivedAction>{ type: 'user-datasets/list-error', payload: { error } })
    )
  ];
}

export function loadUserDatasetDetail(id: number): ActionThunk<DetailAction> {
  return ({ wdkService }) => [
    <DetailLoading>{ type: 'user-datasets/detail-loading', payload: { id } },
    wdkService.getUserDataset(id).then(
      userDataset => (<DetailReceivedAction>{ type: 'user-datasets/detail-received', payload: { id, userDataset } }),
      (error: ServiceError) => error.status === 404
        ? <DetailReceivedAction>{ type: 'user-datasets/detail-received', payload: { id, userDataset: undefined } }
        : <DetailErrorAction>{ type: 'user-datasets/detail-error', payload: { error } }
    )
  ];
}

export function shareUserDatasets (userDatasetIds: number[], recipientUserIds: number[]): ActionThunk<SharingAction> {
  return ({ wdkService }) => {
    return wdkService.editUserDatasetSharing('add', userDatasetIds, recipientUserIds)
      .then(response =>
        (<SharingSuccessAction>{
          type: 'user-datasets/sharing-success',
          payload: { response }
        })
      )
      .catch(
        (error: ServiceError) => (<SharingErrorAction>{ type: 'user-datasets/sharing-error', payload: { error } })
      )
  };
}

export function unshareUserDatasets (userDatasetIds: number[], recipientUserIds: number[]): ActionThunk<SharingAction> {
  return ({ wdkService }) => {
    return wdkService.editUserDatasetSharing('delete', userDatasetIds, recipientUserIds)
      .then(
        response => (<SharingSuccessAction>{
          type: 'user-datasets/sharing-success',
          payload: { response }
        })
      )
      .catch(
        (error: ServiceError) => (<SharingErrorAction>{ type: 'user-datasets/sharing-error', payload: { error } })
      )
  };
}

export function updateUserDatasetDetail(userDataset: UserDataset, meta: UserDatasetMeta): ActionThunk<UpdateAction> {
  return ({ wdkService }) => [
    <DetailUpdatingAction>{ type: 'user-datasets/detail-updating' },
    wdkService.updateUserDataset(userDataset.id, meta).then(
      () => (<DetailUpdateSuccessAction>{ type: 'user-datasets/detail-update-success', payload: { userDataset: { ...userDataset, meta } } } as UpdateAction),
      (error: ServiceError) => (<DetailUpdateErrorAction>{ type: 'user-datasets/detail-update-error', payload: { error } })
    )
  ]
}

export function removeUserDataset (userDataset: UserDataset, redirectTo?: string): ActionThunk<RemovalAction|EmptyAction> {
  return ({ wdkService }) => [
    <DetailRemovingAction>{ type: 'user-datasets/detail-removing' },
    wdkService.removeUserDataset(userDataset.id)
      .then(
        () => [
          <DetailRemoveSuccessAction>{ type: 'user-datasets/detail-remove-success', payload: { userDataset } } as RemovalAction,
          (typeof redirectTo === 'string' ? transitionToInternalPage(redirectTo) : emptyAction)
        ],
        (error: ServiceError) => (<DetailRemoveErrorAction>{ type: 'user-datasets/detail-remove-error', payload: { error } })
      )
  ];
}

export function updateProjectFilter (filterByProject: boolean): ActionThunk<PreferenceUpdateAction|ProjectFilterAction> {
  return () => [
    updateUserPreference('global', FILTER_BY_PROJECT_PREF, JSON.stringify(filterByProject)),
    projectFilterPreferenceReceived(filterByProject)
  ];
}

function projectFilterPreferenceReceived(filterByProject: boolean): ProjectFilterAction {
  return { type: 'user-datasets/project-filter-preference-received', payload: { filterByProject } };
}
