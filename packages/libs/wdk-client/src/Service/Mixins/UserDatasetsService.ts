import { ServiceBaseClass } from 'wdk-client/Service/ServiceBase';
import { UserDataset, UserDatasetMeta } from 'wdk-client/Utils/WdkModel';

export type UserDatasetShareResponse = {
    [Key in 'add' | 'delete']: {
      [Key in string]: UserDataset['sharedWith']
    }
  }
  

export default (base: ServiceBaseClass) => class UserDatasetsService extends base {
    getCurrentUserDatasets() {
        return this._fetchJson<UserDataset[]>('get', '/users/current/user-datasets?expandDetails=true');
      }
    
      getUserDataset(id: number) {
        return this._fetchJson<UserDataset>('get', `/users/current/user-datasets/${id}`)
      }
    
      updateUserDataset(id: number, meta: UserDatasetMeta) {
        return this._fetchJson<void>('put', `/users/current/user-datasets/${id}/meta`, JSON.stringify(meta));
      }
    
      removeUserDataset(id: number) {
        return this._fetchJson<void>('delete', `/users/current/user-datasets/${id}`);
      }

      editUserDatasetSharing (actionName: string, userDatasetIds: number[], recipientUserIds: number[]) {
        const acceptableActions = [ 'add', 'delete' ];
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
        return this._fetchJson<UserDatasetShareResponse>('patch', '/users/current/user-dataset-sharing', delta);
      }
    
    
}    