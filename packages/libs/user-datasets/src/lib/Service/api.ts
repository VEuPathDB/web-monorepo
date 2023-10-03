import { zipWith } from 'lodash';

import {
  createJsonRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';

import {
  UserDatasetVDI,
  userDataset,
  UserDatasetMeta,
  NewUserDatasetRequest,
  NewUserDataset,
} from '../Utils/types';

import { array, type, TypeOf, string } from 'io-ts';

const VDI_SERVICE = '/vdi-datasets';
const CURRENT_USER_DATASET_PATH = `/users/current/${VDI_SERVICE}`;

export class UserDatasetApi extends FetchClientWithCredentials {
  getCurrentUserDatasets = (
    projectId?: string,
    ownership?: string,
    offset?: number,
    limit?: number,
    sortField?: string,
    sortOrder?: string
  ) => {
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
        path: `${CURRENT_USER_DATASET_PATH}${queryString}`,
        method: 'GET',
        transformResponse: ioTransformer(array(userDataset)),
      })
    );
  };

  addDataset = (newUserDatasetConfig: NewUserDataset) => {
    const { uploadMethod, ...remainingConfig } = newUserDatasetConfig;

    const fileBody = new FormData();
    if (uploadMethod.type === 'file') {
      fileBody.append('uploadMethod', 'file');
      fileBody.append('file', uploadMethod.file);
    } else if (uploadMethod.type === 'url') {
      fileBody.append('uploadMethod', 'url');
      fileBody.append('url', uploadMethod.url);
    } else {
      throw new Error(
        `Tried to upload a dataset via an unrecognized upload method '${uploadMethod.type}'`
      );
    }

    const requestBody: NewUserDatasetRequest = {
      meta: {
        ...remainingConfig,
        datasetType: {
          name: newUserDatasetConfig.datasetType,
          version: '1.0',
        },
        dependencies: [],
        origin: 'direct-upload',
      },
      ...(uploadMethod.type === 'file'
        ? { file: uploadMethod.file }
        : { url: uploadMethod.url }),
    };

    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: VDI_SERVICE,
        body: requestBody,
        // TODO: figure out how to pull this from userDataset type instead
        transformResponse: ioTransformer(type({ datasetID: string })),
      })
    );
  };

  getUserDataset = (id: string) => {
    return this.fetch(
      createJsonRequest({
        path: `${CURRENT_USER_DATASET_PATH}/${id}`,
        method: 'GET',
        transformResponse: ioTransformer(userDataset),
      })
    );
  };

  // double-check the expected requestBody type for VDI
  updateUserDataset = (id: string, requestBody: UserDatasetMeta) => {
    return this.fetch(
      createJsonRequest({
        path: `${CURRENT_USER_DATASET_PATH}/${id}`,
        method: 'PATCH',
        body: requestBody,
        transformResponse: noContent,
      })
    );
  };

  removeUserDataset = (id: string) => {
    return this.fetch(
      createJsonRequest({
        path: `${CURRENT_USER_DATASET_PATH}/${id}`,
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
