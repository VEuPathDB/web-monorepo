import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { UserDataset, UserDatasetMeta } from 'wdk-client/Utils/WdkModel';

export type UserDatasetShareResponse = {
  [Key in 'add' | 'delete']: {
    [Key in string]: UserDataset['sharedWith']
  }
}


export default (base: ServiceBase) => {
  function getCurrentUserDatasets() {
    return base._fetchJson<UserDataset[]>('get', '/users/current/user-datasets?expandDetails=true');
  }

  function getUserDataset(id: number) {
    return base._fetchJson<UserDataset>('get', `/users/current/user-datasets/${id}`)
  }

  function updateUserDataset(id: number, meta: UserDatasetMeta) {
    return base._fetchJson<void>('put', `/users/current/user-datasets/${id}/meta`, JSON.stringify(meta));
  }

  function removeUserDataset(id: number) {
    return base._fetchJson<void>('delete', `/users/current/user-datasets/${id}`);
  }

  function editUserDatasetSharing(actionName: string, userDatasetIds: number[], recipientUserIds: number[]) {
    const acceptableActions = ['add', 'delete'];
    if (!actionName || !acceptableActions.includes(actionName))
      throw new TypeError(`editUserDatasetSharing: invalid action name given: "${actionName}"`);
    const delta = JSON.stringify({
      [actionName]: userDatasetIds
        .map(id => `${id}`)
        .reduce((output: object, datasetId: string) => {
          Object.defineProperty(output, datasetId, {
            value: recipientUserIds.map(id => `${id}`),
            enumerable: true
          });
          return output;
        }, {})
    });
    return base._fetchJson<UserDatasetShareResponse>('patch', '/users/current/user-dataset-sharing', delta);
  }

  return {
    getCurrentUserDatasets,
    getUserDataset,
    updateUserDataset,
    removeUserDataset,
    editUserDatasetSharing
  }

}    