import { Action } from '../../Actions/UserDatasetsActions';
import { UserDataset } from '../../Utils/types';
type State = Record<
  string,
  {
    isLoading: boolean;
    resource?: UserDataset;
  }
>;
export default function reduce(state: State | undefined, action: Action): State;
export {};
//# sourceMappingURL=UserDatasetSharingReducer.d.ts.map
