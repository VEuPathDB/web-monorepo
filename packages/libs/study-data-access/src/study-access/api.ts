import { zipWith } from 'lodash';

import {
  createJsonRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';
import {
  ApprovalStatus,
  EndUserCreateRequest,
  EndUserPatch,
  DatasetProviderCreateRequest,
  DatasetProviderPatch,
  NewStaffRequest,
  StaffPatch,
  datasetProviderList,
  datasetProviderCreateResponse,
  endUser,
  endUserCreateResponse,
  endUserList,
  historyResponse,
  newStaffResponse,
  permissionsResponse,
  staffList,
} from './EntityTypes';

import { stubbedPerDataset } from './permission';

// API  defined in https://veupathdb.github.io/service-dataset-access/api.html
const STAFF_PATH = '/staff';
const PROVIDERS_PATH = '/dataset-providers';
const END_USERS_PATH = '/dataset-end-users';
const PERMISSIONS_PATH = '/permissions';
const HISTORY_PATH = '/history';

export class StudyAccessApi extends FetchClientWithCredentials {
  fetchStaffList = (limit?: number, offset?: number) => {
    const queryString = makeQueryString(['limit', 'offset'], [limit, offset]);

    return this.fetch(
      createJsonRequest({
        path: `${STAFF_PATH}${queryString}`,
        method: 'GET',
        transformResponse: ioTransformer(staffList),
      })
    );
  };

  createStaffEntry = (requestBody: NewStaffRequest) => {
    return this.fetch(
      createJsonRequest({
        path: STAFF_PATH,
        method: 'POST',
        body: requestBody,
        transformResponse: ioTransformer(newStaffResponse),
      })
    );
  };

  updateStaffEntry = (staffId: number, requestBody: StaffPatch) => {
    return this.fetch(
      createJsonRequest({
        path: `${STAFF_PATH}/${staffId}`,
        method: 'PATCH',
        body: requestBody,
        transformResponse: noContent,
      })
    );
  };

  deleteStaffEntry = (staffId: number) => {
    return this.fetch({
      path: `${STAFF_PATH}/${staffId}`,
      method: 'DELETE',
      transformResponse: noContent,
    });
  };

  fetchProviderList = (datasetId: string, limit?: number, offset?: number) => {
    const queryString = makeQueryString(
      ['datasetId', 'limit', 'offset'],
      [datasetId, limit, offset]
    );

    return this.fetch({
      path: `${PROVIDERS_PATH}${queryString}`,
      method: 'GET',
      transformResponse: ioTransformer(datasetProviderList),
    });
  };

  createProviderEntry = (requestBody: DatasetProviderCreateRequest) => {
    return this.fetch(
      createJsonRequest({
        path: PROVIDERS_PATH,
        method: 'POST',
        body: requestBody,
        transformResponse: ioTransformer(datasetProviderCreateResponse),
      })
    );
  };

  updateProviderEntry = (
    providerId: number,
    requestBody: DatasetProviderPatch
  ) => {
    return this.fetch(
      createJsonRequest({
        path: `${PROVIDERS_PATH}/${providerId}`,
        method: 'PATCH',
        body: requestBody,
        transformResponse: noContent,
      })
    );
  };

  deleteProviderEntry = (providerId: number) => {
    return this.fetch({
      path: `${PROVIDERS_PATH}/${providerId}`,
      method: 'DELETE',
      transformResponse: noContent,
    });
  };

  fetchEndUserList = (
    datasetId: string,
    limit?: number,
    offset?: number,
    approval?: ApprovalStatus
  ) => {
    const queryString = makeQueryString(
      ['datasetId', 'limit', 'offset', 'approval'],
      [datasetId, limit, offset, approval]
    );

    return this.fetch({
      path: `${END_USERS_PATH}${queryString}`,
      method: 'GET',
      transformResponse: ioTransformer(endUserList),
    });
  };

  createEndUserEntry = (requestBody: EndUserCreateRequest) => {
    return this.fetch(
      createJsonRequest({
        path: END_USERS_PATH,
        method: 'POST',
        body: requestBody,
        transformResponse: ioTransformer(endUserCreateResponse),
      })
    );
  };

  fetchEndUserEntry = (wdkUserId: number, datasetId: string) => {
    const endUserId = makeEndUserId(wdkUserId, datasetId);

    return this.fetch({
      path: `${END_USERS_PATH}/${endUserId}`,
      method: 'GET',
      transformResponse: ioTransformer(endUser),
    });
  };

  updateEndUserEntry = (
    wdkUserId: number,
    datasetId: string,
    requestBody: EndUserPatch
  ) => {
    const endUserId = makeEndUserId(wdkUserId, datasetId);

    return this.fetch(
      createJsonRequest({
        path: `${END_USERS_PATH}/${endUserId}`,
        method: 'PATCH',
        body: requestBody,
        transformResponse: noContent,
      })
    );
  };

  deleteEndUserEntry = (wdkUserId: number, datasetId: string) => {
    const endUserId = makeEndUserId(wdkUserId, datasetId);

    return this.fetch({
      path: `${END_USERS_PATH}/${endUserId}`,
      method: 'DELETE',
      transformResponse: noContent,
    });
  };

  fetchPermissions = () => {
    return this.fetch({
      path: PERMISSIONS_PATH,
      method: 'GET',
      transformResponse: ioTransformer(permissionsResponse),
    });
  };

  fetchHistory = () => {
    return this.fetch({
      path: HISTORY_PATH,
      method: 'GET',
      transformResponse: ioTransformer(historyResponse),
    });
  };
}

async function noContent(body: unknown) {
  return null;
}

function makeEndUserId(wdkUserId: number, datasetId: string) {
  return `${wdkUserId}-${datasetId}`;
}

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

// For legacy sites
export class StubbedStudyAccessApi extends StudyAccessApi {
  fetchPermissions = async () => {
    return {
      perDataset: stubbedPerDataset,
    };
  };
}
