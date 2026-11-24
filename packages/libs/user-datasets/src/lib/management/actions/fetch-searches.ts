import { InferAction, makeActionCreator } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { identity } from 'lodash';
import { getUserDatasetSearches } from '../../Service/Datasets/getUserDatasetSearches';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';

export enum DatasetSearchesFetchStatus {
  NotStarted,
  Pending,
  Success,
  Error,
}

export type DatasetSearchesFetchState =
  | { readonly status: (
    | DatasetSearchesFetchStatus.NotStarted
    | DatasetSearchesFetchStatus.Pending
    | DatasetSearchesFetchStatus.Error
    ) }
  | {
    readonly status: DatasetSearchesFetchStatus.Success;
    readonly searches: ReadonlyArray<Question>;
  }
  ;

export const setSearchFetchState = makeActionCreator(
  'ud/management/searches',
  identity<DatasetSearchesFetchState>,
);

export type SetSearchStateAction = InferAction<typeof setSearchFetchState>;

export const setFetchSearchesPending = () =>
  setSearchFetchState({ status: DatasetSearchesFetchStatus.Pending });
export const setFetchSearchesError = () =>
  setSearchFetchState({ status: DatasetSearchesFetchStatus.Error });
export const setFetchSearchesSuccess = (searches: ReadonlyArray<Question>) =>
  setSearchFetchState({ status: DatasetSearchesFetchStatus.Success, searches });

export const fetchSearches = (datasetType: string) => [
  setFetchSearchesPending(),
  async ({ wdkService }: EpicDependencies) => {
    try {
      return setFetchSearchesSuccess(await getUserDatasetSearches(wdkService, datasetType));
    } catch (e) {
      return setFetchSearchesError();
    }
  }
];