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
  NewUserDataset,
  userDatasetDetails,
  userQuotaMetadata,
  userDatasetFileListing,
  datasetIdType,
} from '../Utils/types';

import { array } from 'io-ts';
import { submitAsForm } from '@veupathdb/wdk-client/lib/Utils/FormSubmitter';

export const VDI_SERVICE_BASE_URL = 'http://localhost:8080';
const VDI_SERVICE = '/vdi-datasets';

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
        path: `${VDI_SERVICE}${queryString}`,
        method: 'GET',
        transformResponse: ioTransformer(array(userDataset)),
      })
    );
  };

  addDataset = (newUserDatasetConfig: NewUserDataset) => {
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

    return this.fetch({
      method: 'POST',
      path: VDI_SERVICE,
      body: fileBody,
      transformResponse: ioTransformer(datasetIdType),
    });
  };

  getUserDataset = (datasetId: string) => {
    return this.fetch(
      createJsonRequest({
        path: `${VDI_SERVICE}/${datasetId}`,
        method: 'GET',
        transformResponse: ioTransformer(userDatasetDetails),
      })
    );
  };

  updateUserDataset = (datasetId: string, requestBody: UserDatasetMeta) => {
    return this.fetch(
      createJsonRequest({
        path: `${VDI_SERVICE}/${datasetId}`,
        method: 'PATCH',
        body: requestBody,
        transformResponse: noContent,
      })
    );
  };

  removeUserDataset = (datasetId: string) => {
    return this.fetch(
      createJsonRequest({
        path: `${VDI_SERVICE}/${datasetId}`,
        method: 'DELETE',
        transformResponse: noContent,
      })
    );
  };

  getCommunityDatasets = () => {
    return this.fetch(
      createJsonRequest({
        path: `${VDI_SERVICE}/community`,
        method: 'GET',
        transformResponse: ioTransformer(array(userDataset)),
      })
    );
  };

  getUserDatasetFileListing = (datasetId: string) => {
    return this.fetch(
      createJsonRequest({
        path: `${VDI_SERVICE}/${datasetId}/files`,
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
      action: `${VDI_SERVICE_BASE_URL}${VDI_SERVICE}/${datasetId}/files/${zipFileType}`,
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
        path: `${VDI_SERVICE}/${userDatasetId}/shares/${recipientUserId}/offer`,
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
