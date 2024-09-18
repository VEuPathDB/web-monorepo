import { ServiceError } from '@veupathdb/wdk-client/lib/Service/ServiceError';
import { Action } from '../Actions/UserDatasetsActions';
import { UserDataset } from '../Utils/types';
export declare const key = 'userDatasetDetail';
/**
 * If isLoading is false, and resource is undefined,
 * then assume the user dataset does not exist
 */
export type UserDatasetEntry = {
  isLoading: boolean;
  resource?: UserDataset;
};
export interface State {
  userDatasetsById: {
    [key: string]: UserDatasetEntry;
  };
  userDatasetUpdating: boolean;
  userDatasetLoading: boolean;
  userDatasetRemoving: boolean;
  loadError?: ServiceError;
  updateError?: ServiceError;
  removalError?: ServiceError;
}
/**
 * Stores a map of userDatasets by id. By not storing the current userDataset,
 * we avoid race conditions where the DATASET_DETAIL_RECEIVED actions are
 * dispatched in a different order than the corresponding action creators are
 * invoked.
 */
export declare function reduce(state: State | undefined, action: Action): State;
//# sourceMappingURL=UserDatasetDetailStoreModule.d.ts.map
