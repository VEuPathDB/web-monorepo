import { SetDatasetStateAction } from './fetch-dataset';
import { SetSearchStateAction } from './fetch-searches';
import { SetCommunityStateAction } from './set-public';

export type Action =
  | SetDatasetStateAction
  | SetSearchStateAction
  | SetCommunityStateAction
  ;

export {
  fetchDataset,
  setDatasetFetchState,
  DatasetFetchStatus,
  type DatasetFetchState,
} from './fetch-dataset';

export {
  fetchSearches,
  setSearchFetchState,
  DatasetSearchesFetchStatus,
  type DatasetSearchesFetchState,
} from './fetch-searches';

export {
  setCommunityUpdateState,
  type CommunityUpdateActionState,
} from './set-public';
