import { zipWith } from 'lodash';

import {
  arrayOf,
  number,
  objectOf,
  record,
} from '@veupathdb/wdk-client/lib/Utils/Json';

import {
  createJsonRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';

import {
  userDataset,
  UserDatasetMeta,
  NewUserDatasetMeta,
  userDatasetDetails,
  userQuotaMetadata,
  userDatasetFileListing,
  datasetIdType,
} from '../Utils/types';

import { array } from 'io-ts';
import { submitAsForm } from '@veupathdb/wdk-client/lib/Utils/FormSubmitter';
import { FormSubmission } from '../Components/UploadForm';
import { makeNewUserDatasetConfig } from '../Utils/upload-user-dataset';

const userIdsByEmailDecoder = record({
  results: arrayOf(objectOf(number)),
});

export class UserDatasetApi extends FetchClientWithCredentials {
  getCurrentUserDatasets = (
    projectId?: string,
    ownership?: string,
    offset?: number,
    limit?: number,
    sortField?: string,
    sortOrder?: string
  ) => {
    // TODO: wire up to allow query params
    const queryString = makeQueryString(
      [
        'project_id',
        'ownership',
        'offset',
        'limit',
        'sort_field',
        'sort_order',
      ],
      [projectId, ownership, offset, limit, sortField, sortOrder]
    );
    return this.fetch(
      createJsonRequest({
        path: '/vdi-datasets' + queryString,
        method: 'GET',
        transformResponse: ioTransformer(array(userDataset)),
      })
    );
  };

  addUserDataset = async (
    formSubmission: FormSubmission,
    dispatchUploadProgress?: (progress: number | null) => void,
    dispatchPageRedirect?: (datasetId: typeof datasetIdType) => void
  ) => {
    const newUserDatasetConfig = await makeNewUserDatasetConfig(
      this.wdkService,
      formSubmission
    );
    const { uploadMethod, ...remainingConfig } = newUserDatasetConfig;

    const meta: NewUserDatasetMeta = {
      ...remainingConfig,
      datasetType: {
        name: newUserDatasetConfig.datasetType,
        version: '1.0',
      },
      dependencies: [],
      origin: 'direct-upload',
    };

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      const progress = Math.floor((e.loaded / e.total) * 100);
      dispatchUploadProgress && dispatchUploadProgress(progress);
    });

    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        try {
          const response = JSON.parse(xhr.response);
          dispatchUploadProgress && dispatchUploadProgress(null);
          dispatchPageRedirect && dispatchPageRedirect(response.datasetId);
        } catch (error) {
          dispatchUploadProgress && dispatchUploadProgress(null);
          console.error(error);
        }
      }
    });

    const fileBody = new FormData();

    fileBody.append('meta', JSON.stringify(meta));

    if (uploadMethod.type === 'file') {
      fileBody.append('file', uploadMethod.file);
    } else if (uploadMethod.type === 'url') {
      fileBody.append('url', uploadMethod.url);
    } else {
      throw new Error(
        `Tried to upload a dataset via an unrecognized upload method '${uploadMethod.type}'`
      );
    }

    const authKey = await this.findUserRequestAuthKey();
    const vdiServiceUrl = this.baseUrl;

    xhr.open('POST', `${vdiServiceUrl}/vdi-datasets`, true);
    xhr.setRequestHeader('Auth-Key', authKey);
    xhr.send(fileBody);
  };

  getUserDataset = (datasetId: string) => {
    return this.fetch(
      createJsonRequest({
        path: `/vdi-datasets/${datasetId}`,
        method: 'GET',
        transformResponse: ioTransformer(userDatasetDetails),
      })
    );
  };

  updateUserDataset = (datasetId: string, requestBody: UserDatasetMeta) => {
    return this.fetch(
      createJsonRequest({
        path: `/vdi-datasets/${datasetId}`,
        method: 'PATCH',
        body: requestBody,
        transformResponse: noContent,
      })
    );
  };

  removeUserDataset = (datasetId: string) => {
    return this.fetch(
      createJsonRequest({
        path: `/vdi-datasets/${datasetId}`,
        method: 'DELETE',
        transformResponse: noContent,
      })
    );
  };

  getCommunityDatasets = () => {
    return this.fetch(
      createJsonRequest({
        path: `/vdi-datasets/community`,
        method: 'GET',
        transformResponse: ioTransformer(array(userDataset)),
      })
    );
  };

  getUserDatasetFileListing = (datasetId: string) => {
    return this.fetch(
      createJsonRequest({
        path: `/vdi-datasets/${datasetId}/files`,
        method: 'GET',
        transformResponse: ioTransformer(userDatasetFileListing),
      })
    );
  };

  getUserDatasetFiles = async (
    datasetId: string,
    zipFileType: 'upload' | 'data'
  ) => {
    if (typeof datasetId !== 'string')
      throw new TypeError(
        `Can't build downloadUrl; invalid datasetId given (${datasetId}) [${typeof datasetId}]`
      );
    submitAsForm({
      method: 'GET',
      action: `${this.baseUrl}/vdi-datasets/${datasetId}/files/${zipFileType}`,
      inputs: {
        'Auth-Key': await this.findUserRequestAuthKey(),
      },
    });
  };

  editUserDatasetSharing = (
    actionName: string,
    userDatasetId: string,
    recipientUserId: number
  ) => {
    const acceptableActions = ['grant', 'revoke'];
    if (!actionName || !acceptableActions.includes(actionName))
      throw new TypeError(
        `editUserDatasetSharing: invalid action name given: "${actionName}"`
      );
    return this.fetch(
      createJsonRequest({
        path: `/vdi-datasets/${userDatasetId}/shares/${recipientUserId}/offer`,
        method: 'PUT',
        body: { action: actionName },
        transformResponse: noContent,
      })
    );
  };

  getUserIdsByEmail = (emails: string[]) => {
    return this.wdkService.sendRequest(userIdsByEmailDecoder, {
      path: '/user-id-query',
      method: 'POST',
      body: JSON.stringify({
        emails,
      }),
    });
  };

  getUserQuotaMetadata = () => {
    return this.fetch(
      createJsonRequest({
        path: `/vdi-users/self/meta`,
        method: 'GET',
        transformResponse: ioTransformer(userQuotaMetadata),
      })
    );
  };
}

// TODO: copied from study-data-access's api => move to a different package's util functions
function makeQueryString(
  paramNames: string[],
  paramValues: (string | number | boolean | null | undefined)[]
) {
  const queryParams = zipWith(paramNames, paramValues, (name, value) =>
    value == null ? undefined : `${name}=${encodeURIComponent(value)}`
  );

  const nonNullParams = queryParams.filter(
    (param): param is string => param != null
  );

  return nonNullParams.length === 0 ? '' : `?${nonNullParams.join('&')}`;
}

// QUESTION: also copied from study-data-access's api; move to a different package's util functions?
async function noContent(body: unknown) {
  return null;
}
