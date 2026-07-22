import * as userDatasetDetail from './UserDatasetDetailStoreModule';
import * as userDatasetList from './UserDatasetListStoreModule';
import * as userDatasetUpload from './UserDatasetUploadStoreModule';

export type {
  BadUpload,
  DatasetFormState,
} from './UserDatasetUploadStoreModule';

type WdkStoreModules =
  typeof import('@veupathdb/wdk-client/lib/StoreModules').default;

export function wrapStoreModules(storeModules: WdkStoreModules) {
  return {
    ...storeModules,
    userDatasetDetail,
    userDatasetList,
    userDatasetUpload,
  };
}

export { type ClientSideUploadFormState } from './UserDatasetUploadStoreModule';
