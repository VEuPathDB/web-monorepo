import {
  arrayOf,
  number,
  objectOf,
  record,
} from '@veupathdb/wdk-client/lib/Utils/Json';
const userIdsByEmailDecoder = record({
  results: arrayOf(objectOf(number)),
});
export const userDatasetsServiceWrappers = {
  getCurrentUserDatasets: (wdkService) => () =>
    wdkService._fetchJson(
      'get',
      '/users/current/user-datasets?expandDetails=true'
    ),
  getUserDataset: (wdkService) => (id) =>
    wdkService._fetchJson('get', `/users/current/user-datasets/${id}`),
  updateUserDataset: (wdkService) => (id, meta) =>
    wdkService._fetchJson(
      'put',
      `/users/current/user-datasets/${id}/meta`,
      JSON.stringify(meta)
    ),
  removeUserDataset: (wdkService) => (id) =>
    wdkService._fetchJson('delete', `/users/current/user-datasets/${id}`),
  editUserDatasetSharing:
    (wdkService) => (actionName, userDatasetIds, recipientUserIds) => {
      const acceptableActions = ['add', 'delete'];
      if (!actionName || !acceptableActions.includes(actionName))
        throw new TypeError(
          `editUserDatasetSharing: invalid action name given: "${actionName}"`
        );
      const delta = JSON.stringify({
        [actionName]: userDatasetIds
          .map((id) => `${id}`)
          .reduce((output, datasetId) => {
            Object.defineProperty(output, datasetId, {
              value: recipientUserIds.map((id) => `${id}`),
              enumerable: true,
            });
            return output;
          }, {}),
      });
      return wdkService._fetchJson(
        'patch',
        '/users/current/user-dataset-sharing',
        delta
      );
    },
  getUserDatasetDownloadUrl: (wdkService) => (datasetId, filename) => {
    if (typeof datasetId !== 'number')
      throw new TypeError(
        `Can't build downloadUrl; invalid datasetId given (${datasetId}) [${typeof datasetId}]`
      );
    if (typeof filename !== 'string')
      throw new TypeError(
        `Can't build downloadUrl; invalid filename given (${filename}) [${typeof filename}]`
      );
    return `${wdkService.serviceUrl}/users/current/user-datasets/${datasetId}/user-datafiles/${filename}`;
  },
  getUserIdsByEmail: (wdkService) => (emails) => {
    return wdkService.sendRequest(userIdsByEmailDecoder, {
      path: '/user-id-query',
      method: 'POST',
      body: JSON.stringify({
        emails,
      }),
    });
  },
};
export function isUserDatasetsCompatibleWdkService(wdkService) {
  return Object.keys(userDatasetsServiceWrappers).every(
    (userDatasetsServiceWrapperKey) =>
      userDatasetsServiceWrapperKey in wdkService
  );
}
export function assertIsUserDatasetCompatibleWdkService(wdkService) {
  if (!isUserDatasetsCompatibleWdkService(wdkService)) {
    throw new Error(MISCONFIGURED_USER_DATASET_SERVICE_ERROR_MESSAGE);
  }
}
export const MISCONFIGURED_USER_DATASET_SERVICE_ERROR_MESSAGE =
  'In order to use this feature, a UserDatasetsCompatibleWdkService must be configured.';
export function validateUserDatasetCompatibleThunk(thunk) {
  return (wdkDependencies) => {
    assertIsUserDatasetCompatibleWdkService(wdkDependencies.wdkService);
    return thunk(wdkDependencies);
  };
}
//# sourceMappingURL=UserDatasetWrappers.js.map
