import { DatasetListEntry } from '../../../vdi/responses';
import { InferAction, makeActionCreator } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { identity } from 'lodash';
import { validateVdiCompatibleThunk } from '../../../vdi/utils/wdk-wrapping';
import { ifDefined } from '../../../Utils';
import { isNonErrorResponse } from '../../../vdi/utils/response-helpers';

export enum FetchStatus {
  NotStarted,
  Pending,
  Success,
  Error,
}

export type FetchState =
  | { readonly fetchStatus: (
    | FetchStatus.NotStarted
    | FetchStatus.Pending
    | FetchStatus.Error
  ) }
  | {
    readonly fetchStatus: FetchStatus.Success;
    readonly datasets: ReadonlyArray<DatasetListEntry>;
  }
  ;

export const setFetchState = makeActionCreator("ud/list/fetch", identity<FetchState>);

export type FetchAction = InferAction<typeof setFetchState>;

export const setFetchPending = () =>
  setFetchState({ fetchStatus: FetchStatus.Pending });
export const setFetchSuccess = (datasets: ReadonlyArray<DatasetListEntry>) =>
  setFetchState({ fetchStatus: FetchStatus.Success, datasets });
export const setFetchError = () =>
  setFetchState({ fetchStatus: FetchStatus.Pending });
export const clearFetchStatus = () =>
  setFetchState({ fetchStatus: FetchStatus.NotStarted });

export const fetchDatasetList = (projectFilter?: string) => [
  setFetchPending(),
  validateVdiCompatibleThunk(async ({ wdkService: { vdi } }) => {
    try {
      const result = await vdi.getDatasetList(ifDefined(projectFilter, it => ({ install_target: it })));

      return isNonErrorResponse(result)
        ? setFetchSuccess(result)
        : setFetchError();
    } catch (e) {
      return setFetchError();
    }
  }),
];
