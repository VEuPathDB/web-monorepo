import { zipWith } from 'lodash';

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
} from '../Utils/types';

import { array, string, type } from 'io-ts';
import { submitAsForm } from '@veupathdb/wdk-client/lib/Utils/FormSubmitter';

export const VDI_SERVICE_BASE_URL = 'http://localhost:8080';
const VDI_SERVICE = '/vdi-datasets';

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
        name: newUserDatasetConfig.datasetType.replace('-', ''),
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
      // TODO: figure out how to pull this from userDataset type instead
      transformResponse: ioTransformer(type({ datasetID: string })),
    });
  };

  getUserDataset = (id: string) => {
    return this.fetch(
      createJsonRequest({
        path: `${VDI_SERVICE}/${id}`,
        method: 'GET',
        transformResponse: ioTransformer(userDatasetDetails),
      })
    );
  };

  // double-check the expected requestBody type for VDI
  updateUserDataset = (id: string, requestBody: UserDatasetMeta) => {
    return this.fetch(
      createJsonRequest({
        path: `${VDI_SERVICE}/${id}`,
        method: 'PATCH',
        body: requestBody,
        transformResponse: noContent,
      })
    );
  };

  removeUserDataset = (id: string) => {
    return this.fetch(
      createJsonRequest({
        path: `${VDI_SERVICE}/${id}`,
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

  // QUESTION: VDI has an option to GET upload files and data files. Should we tweak UI to provide both options?
  getUserDatasetFiles = async (datasetId: number | string) => {
    if (typeof datasetId !== 'number' && typeof datasetId !== 'string')
      throw new TypeError(
        `Can't build downloadUrl; invalid datasetId given (${datasetId}) [${typeof datasetId}]`
      );
    submitAsForm({
      method: 'GET',
      action: `${VDI_SERVICE_BASE_URL}${VDI_SERVICE}/${datasetId}/files/data`,
      inputs: {
        'Auth-Key': await this.findUserRequestAuthKey(),
      },
    });
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
