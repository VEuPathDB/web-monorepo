import * as userDatasetDetail from './UserDatasetDetailStoreModule';
import * as userDatasetList from './UserDatasetListStoreModule';
import * as userDatasetUpload from './UserDatasetUploadStoreModule';
export function wrapStoreModules(storeModules) {
  return Object.assign(Object.assign({}, storeModules), {
    userDatasetDetail,
    userDatasetList,
    userDatasetUpload,
  });
}
//# sourceMappingURL=index.js.map
