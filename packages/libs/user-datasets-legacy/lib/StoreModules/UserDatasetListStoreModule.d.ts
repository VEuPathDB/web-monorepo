import { Action } from '../Actions/UserDatasetsActions';
import { UserDataset } from '../Utils/types';
export declare const key = 'userDatasetList';
type InitialState = {
  status: 'not-requested';
};
type LoadingState = {
  status: 'loading';
};
type ErrorState = {
  status: 'error';
  loadError: Error;
};
type ForbiddenState = {
  status: 'forbidden';
  loadError: Error;
};
type CompleteState = {
  status: 'complete';
  userDatasets: number[];
  userDatasetsById: Record<
    string,
    {
      isLoading: false;
      resource: UserDataset;
    }
  >;
  filterByProject: boolean;
};
export type State =
  | InitialState
  | LoadingState
  | ErrorState
  | ForbiddenState
  | CompleteState;
export declare function reduce(state: State | undefined, action: Action): State;
export {};
//# sourceMappingURL=UserDatasetListStoreModule.d.ts.map
