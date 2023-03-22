import * as userDatasetDetail from './UserDatasetDetailStoreModule';
import * as userDatasetList from './UserDatasetListStoreModule';
import * as userDatasetUpload from './UserDatasetUploadStoreModule';

type WdkStoreModules = typeof import('@veupathdb/wdk-client/lib/StoreModules').default;

export function wrapStoreModules(storeModules: WdkStoreModules) {
  return {
    ...storeModules,
    userDatasetDetail,
    userDatasetList,
    userDatasetUpload,
  };
}
