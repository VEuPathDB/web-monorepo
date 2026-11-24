import { validateVdiCompatibleThunk } from '../../../Service';
import { InferAction, makeActionCreator } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { identity } from 'lodash';
import { DatasetId } from '../../../vdi';
import { DatasetDetails } from '../../../vdi/responses';

export enum DatasetFetchStatus {
  NotStarted,
  Pending,
  Success,
  NotFound,
  Error,
}

export type DatasetFetchState =
  | { readonly status: (
    | DatasetFetchStatus.NotStarted
    | DatasetFetchStatus.Pending
    | DatasetFetchStatus.NotFound
    | DatasetFetchStatus.Error
  ) }
  | {
    readonly status: DatasetFetchStatus.Success;
    readonly dataset: DatasetDetails;
  }
  ;

export const setDatasetFetchState = makeActionCreator(
  "ud/managment/dataset",
  identity<DatasetFetchState>,
);

export const setDatasetFetchPending = () =>
  setDatasetFetchState({ status: DatasetFetchStatus.Pending });
export const setDatasetFetchNotFound = () =>
  setDatasetFetchState({ status: DatasetFetchStatus.NotFound });
export const setDatasetFetchSuccess = (dataset: DatasetDetails) =>
  setDatasetFetchState({ status: DatasetFetchStatus.Success, dataset });
export const setDatasetFetchError = () =>
  setDatasetFetchState({ status: DatasetFetchStatus.Error });

export type SetDatasetStateAction = InferAction<typeof setDatasetFetchState>;

export const fetchDataset = (datasetId: DatasetId) => [
  setDatasetFetchPending(),
  validateVdiCompatibleThunk(async ({ wdkService: { vdi } }) => {
    const result = await vdi.getDatasetDetails(datasetId);

    // If the status field exists as a string, then it was an error response.
    //
    // The dataset details object also has a field named "status", but that field
    // is an object.
    if (typeof result.status === 'string') {
      return result.status === 'not-found'
        ? setDatasetFetchNotFound()
        : setDatasetFetchError();
    }

    return setDatasetFetchSuccess(result);
  }),
];
