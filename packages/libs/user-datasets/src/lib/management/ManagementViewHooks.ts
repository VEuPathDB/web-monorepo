import Lodash from 'lodash';

import * as Redux from 'react-redux';

import * as Store from './ManagementViewStore';
import * as Utils from '../Utils';
import * as VDI from '../Service/Model';

import {
  DatasetFetchState,
  DatasetFetchStatus,
  DatasetSearchesFetchState,
  DatasetSearchesFetchStatus
} from './actions';


type Selector<T> = Utils.Func<Store.State, T>;
type MgmtSelector<T> = Utils.Func<Store.ManagementViewState, T>;


export const useReduxState = <T>(fn: Selector<T>): T =>
  Redux.useSelector(fn, Lodash.isEqual);

export const useManagementViewState = <T>(fn: MgmtSelector<T>): T =>
  useReduxState(({ managementView = {} }) => fn(managementView));

export const useCommunityUpdateState = () =>
  useManagementViewState(({ communityUpdateState } ) => communityUpdateState);

export const useDatasetFetchState = (): DatasetFetchState =>
  useManagementViewState(({ datasetFetchState }) =>
    datasetFetchState ?? { status: DatasetFetchStatus.NotStarted });
export const useFetchedDataset = (): Utils.Possible<VDI.DatasetGetResponseBody> =>
  useManagementViewState(({ datasetFetchState }) =>
    Utils.ifDefined(
      datasetFetchState,
      it => it.status === DatasetFetchStatus.Success ? it.dataset : undefined,
    ))

export const useDatasetSearchFetchState = (): DatasetSearchesFetchState =>
  useManagementViewState(({ datasetSearchesState }) =>
    datasetSearchesState ?? { status: DatasetSearchesFetchStatus.NotStarted });