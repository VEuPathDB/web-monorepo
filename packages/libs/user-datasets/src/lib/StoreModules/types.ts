import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

import { State as UserDatasetDetailState } from './UserDatasetDetailStoreModule';
import { State as UserDatasetListState } from './UserDatasetListStoreModule';
import { State as UserDatasetUploadState } from './UserDatasetUploadStoreModule';

export interface StateSlice extends RootState {
  userDatasetDetail: UserDatasetDetailState;
  userDatasetList: UserDatasetListState;
  userDatasetUpload: UserDatasetUploadState;
}
