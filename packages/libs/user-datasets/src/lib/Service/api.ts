import { zipWith } from 'lodash';

import {
  createJsonRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';

import { UserDatasetVDI, userDataset, UserDatasetMeta } from '../Utils/types';

import { array } from 'io-ts';

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
