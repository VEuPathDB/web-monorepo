import { Action as RouteAction } from '@veupathdb/wdk-client/lib/Actions/RouterActions';
import { PreferenceUpdateAction } from '@veupathdb/wdk-client/lib/Actions/UserActions';
import { EmptyAction } from '@veupathdb/wdk-client/lib/Core/WdkMiddleware';
import { ServiceError } from '@veupathdb/wdk-client/lib/Service/ServiceError';
import { UserDatasetShareResponse } from '../Service/UserDatasetWrappers';
import { UserDataset, UserDatasetMeta } from '../Utils/types';
export type Action =
  | DetailErrorAction
  | DetailLoadingAction
  | DetailReceivedAction
  | DetailRemoveErrorAction
  | DetailRemoveSuccessAction
  | DetailRemovingAction
  | DetailUpdateErrorAction
  | DetailUpdateSuccessAction
  | DetailUpdatingAction
  | ListLoadingAction
  | ListErrorReceivedAction
  | ListReceivedAction
  | ProjectFilterAction
  | SharingDatasetAction
  | SharingSuccessAction;
export declare const LIST_LOADING = 'user-datasets/list-loading';
export type ListLoadingAction = {
  type: typeof LIST_LOADING;
};
export declare function listLoading(): ListLoadingAction;
export declare const LIST_RECEIVED = 'user-dataset/list-received';
export type ListReceivedAction = {
  type: typeof LIST_RECEIVED;
  payload: {
    userDatasets: UserDataset[];
    filterByProject: boolean;
  };
};
export declare function listReceived(
  userDatasets: UserDataset[],
  filterByProject: boolean
): ListReceivedAction;
export declare const LIST_ERROR_RECEIVED = 'user-dataset/list-error';
export type ListErrorReceivedAction = {
  type: typeof LIST_ERROR_RECEIVED;
  payload: {
    error: ServiceError;
  };
};
export declare function listErrorReceived(
  error: ServiceError
): ListErrorReceivedAction;
export declare const DETAIL_LOADING = 'user-datasets/detail-loading';
export type DetailLoadingAction = {
  type: typeof DETAIL_LOADING;
  payload: {
    id: number;
  };
};
export declare function detailLoading(id: number): DetailLoadingAction;
export declare const DETAIL_RECEIVED = 'user-datasets/detail-received';
export type DetailReceivedAction = {
  type: typeof DETAIL_RECEIVED;
  payload: {
    id: number;
    userDataset?: UserDataset;
  };
};
export declare function detailReceived(
  id: number,
  userDataset?: UserDataset
): DetailReceivedAction;
export declare const DETAIL_ERROR = 'user-datasets/detail-error';
export type DetailErrorAction = {
  type: typeof DETAIL_ERROR;
  payload: {
    error: ServiceError;
  };
};
export declare function detailError(error: ServiceError): DetailErrorAction;
export declare const DETAIL_UPDATING = 'user-dataests/detail-updating';
export type DetailUpdatingAction = {
  type: typeof DETAIL_UPDATING;
};
export declare function detailUpdating(): DetailUpdatingAction;
export declare const DETAIL_UPDATE_SUCCESS =
  'user-datasets/detail-update-success';
export type DetailUpdateSuccessAction = {
  type: typeof DETAIL_UPDATE_SUCCESS;
  payload: {
    userDataset: UserDataset;
  };
};
export declare function detailUpdateSuccess(
  userDataset: UserDataset
): DetailUpdateSuccessAction;
export declare const DETAIL_UPDATE_ERROR = 'user-datasets/detail-update-error';
export type DetailUpdateErrorAction = {
  type: typeof DETAIL_UPDATE_ERROR;
  payload: {
    error: ServiceError;
  };
};
export declare function detailUpdateError(
  error: ServiceError
): DetailUpdateErrorAction;
export declare const DETAIL_REMOVING = 'user-datasets/detail-removing';
export type DetailRemovingAction = {
  type: typeof DETAIL_REMOVING;
};
export declare function detailRemoving(): DetailRemovingAction;
export declare const DETAIL_REMOVE_SUCCESS =
  'user-datasets/detail-remove-success';
export type DetailRemoveSuccessAction = {
  type: typeof DETAIL_REMOVE_SUCCESS;
  payload: {
    userDataset: UserDataset;
  };
};
export declare function detailRemoveSuccess(
  userDataset: UserDataset
): DetailRemoveSuccessAction;
export declare const DETAIL_REMOVE_ERROR = 'user-datasets/detail-remove-error';
export type DetailRemoveErrorAction = {
  type: typeof DETAIL_REMOVE_ERROR;
  payload: {
    error: ServiceError;
  };
};
export declare function detailRemoveError(
  error: ServiceError
): DetailRemoveErrorAction;
export declare const SHARING_DATASET = 'user-datasets/sharing-dataset';
export type SharingDatasetAction = {
  type: typeof SHARING_DATASET;
  payload: {
    userDataset: UserDataset;
    recipients: string[];
  };
};
export declare function sharingDataset(
  userDataset: UserDataset,
  recipients: string[]
): SharingDatasetAction;
export declare const SHARING_SUCCESS = 'user-datasets/sharing-success';
export type SharingSuccessAction = {
  type: typeof SHARING_SUCCESS;
  payload: {
    response: UserDatasetShareResponse;
  };
};
export declare function sharingSuccess(
  response: UserDatasetShareResponse
): SharingSuccessAction;
export declare const SHARING_ERROR = 'user-datasets/sharing-error';
export type SharingErrorAction = {
  type: typeof SHARING_ERROR;
  payload: {
    error: Error;
  };
};
export declare function sharingError(error: Error): SharingErrorAction;
export declare const PROJECT_FILTER =
  'user-datasets/project-filter-preference-received';
export type ProjectFilterAction = {
  type: typeof PROJECT_FILTER;
  payload: {
    filterByProject: boolean;
  };
};
export declare function projectFilter(
  filterByProject: boolean
): ProjectFilterAction;
type ListAction =
  | ListLoadingAction
  | ListReceivedAction
  | ListErrorReceivedAction;
type DetailAction =
  | DetailLoadingAction
  | DetailReceivedAction
  | DetailErrorAction;
type UpdateAction =
  | DetailUpdatingAction
  | DetailUpdateSuccessAction
  | DetailUpdateErrorAction;
type RemovalAction =
  | DetailRemovingAction
  | DetailRemoveSuccessAction
  | DetailRemoveErrorAction;
type SharingAction =
  | SharingDatasetAction
  | SharingSuccessAction
  | SharingErrorAction;
export declare function loadUserDatasetList(): import('@veupathdb/wdk-client/lib/Core/WdkMiddleware').ActionThunk<
  ListAction,
  import('../Service/UserDatasetWrappers').UserDatasetCompatibleEpicDependencies
>;
export declare function loadUserDatasetDetail(
  id: number
): import('@veupathdb/wdk-client/lib/Core/WdkMiddleware').ActionThunk<
  DetailAction,
  import('../Service/UserDatasetWrappers').UserDatasetCompatibleEpicDependencies
>;
export declare function shareUserDatasets(
  userDatasetIds: number[],
  recipientUserIds: number[]
): import('@veupathdb/wdk-client/lib/Core/WdkMiddleware').ActionThunk<
  SharingAction,
  import('../Service/UserDatasetWrappers').UserDatasetCompatibleEpicDependencies
>;
export declare function unshareUserDatasets(
  userDatasetIds: number[],
  recipientUserIds: number[]
): import('@veupathdb/wdk-client/lib/Core/WdkMiddleware').ActionThunk<
  SharingAction,
  import('../Service/UserDatasetWrappers').UserDatasetCompatibleEpicDependencies
>;
export declare function updateUserDatasetDetail(
  userDataset: UserDataset,
  meta: UserDatasetMeta
): import('@veupathdb/wdk-client/lib/Core/WdkMiddleware').ActionThunk<
  UpdateAction,
  import('../Service/UserDatasetWrappers').UserDatasetCompatibleEpicDependencies
>;
export declare function removeUserDataset(
  userDataset: UserDataset,
  redirectTo?: string
): import('@veupathdb/wdk-client/lib/Core/WdkMiddleware').ActionThunk<
  RemovalAction | EmptyAction | RouteAction,
  import('../Service/UserDatasetWrappers').UserDatasetCompatibleEpicDependencies
>;
export declare function updateProjectFilter(
  filterByProject: boolean
): import('@veupathdb/wdk-client/lib/Core/WdkMiddleware').ActionThunk<
  ProjectFilterAction | PreferenceUpdateAction,
  import('../Service/UserDatasetWrappers').UserDatasetCompatibleEpicDependencies
>;
export {};
//# sourceMappingURL=UserDatasetsActions.d.ts.map
