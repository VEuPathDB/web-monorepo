import { zipWith } from 'lodash';

import {
  BoundApiRequestsObject,
  createFetchApiRequestHandler,
  createJsonRequest,
  standardTransformer
} from 'ebrc-client/util/api';
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
  newStaffResponse,
  permissionsResponse,
  staffList
} from 'ebrc-client/StudyAccess/EntityTypes';

// FIXME: This should be configurable
export const STUDY_ACCESS_SERVICE_URL = '/dataset-access';

// API  defined in https://veupathdb.github.io/service-dataset-access/api.html
const STAFF_PATH = '/staff';
const PROVIDERS_PATH = '/dataset-providers';
const END_USERS_PATH = '/dataset-end-users';
const PERMISSIONS_PATH = '/permissions';

export function createStudyAccessRequestHandler(
  baseStudyAccessUrl: string,
  fetchApi?: Window['fetch']
) {
  // FIXME: DRY this up
  const wdkCheckAuth = document.cookie.split('; ').find(x => x.startsWith('wdk_check_auth=')) ?? '';
  const authKey = wdkCheckAuth.replace('wdk_check_auth=', '');

  return createFetchApiRequestHandler({
    baseUrl: baseStudyAccessUrl,
    init: {
      headers: {
        'Auth-Key': authKey
      }
    },
    fetchApi
  });
}

export const apiRequests = {
  fetchStaffList: function(limit?: number, offset?: number) {
    const queryString = makeQueryString(
      ['limit', 'offset'],
      [limit, offset]
    );

    return {
      path: `${STAFF_PATH}${queryString}`,
      method: 'GET',
      transformResponse: standardTransformer(staffList)
    };
  },
  createStaffEntry: function(requestBody: NewStaffRequest) {
    return createJsonRequest({
      path: STAFF_PATH,
      method: 'POST',
      body: requestBody,
      transformResponse: standardTransformer(newStaffResponse)
    });
  },
  updateStaffEntry: function(staffId: number, requestBody: StaffPatch) {
    return createJsonRequest({
      path: `${STAFF_PATH}/${staffId}`,
      method: 'PATCH',
      body: requestBody,
      transformResponse: noContent
    });
  },
  deleteStaffEntry: function(staffId: number) {
    return {
      path: `${STAFF_PATH}/${staffId}`,
      method: 'DELETE',
      transformResponse: noContent
    };
  },
  fetchProviderList: function(datasetId: string, limit?: number, offset?: number) {
    const queryString = makeQueryString(
      ['datasetId', 'limit', 'offset'],
      [datasetId, limit, offset]
    );

    return {
      path: `${PROVIDERS_PATH}${queryString}`,
      method: 'GET',
      transformResponse: standardTransformer(datasetProviderList)
    };
  },
  createProviderEntry: function(requestBody: DatasetProviderCreateRequest) {
    return createJsonRequest({
      path: PROVIDERS_PATH,
      method: 'POST',
      body: requestBody,
      transformResponse: standardTransformer(datasetProviderCreateResponse)
    })
  },
  updateProviderEntry: function(providerId: number, requestBody: DatasetProviderPatch) {
    return createJsonRequest({
      path: `${PROVIDERS_PATH}/${providerId}`,
      method: 'PATCH',
      body: requestBody,
      transformResponse: noContent
    });
  },
  deleteProviderEntry: function(providerId: number) {
    return {
      path: `${PROVIDERS_PATH}/${providerId}`,
      method: 'DELETE',
      transformResponse: noContent
    };
  },
  fetchEndUserList: function(datasetId: string, limit?: number, offset?: number, approval?: ApprovalStatus) {
    const queryString = makeQueryString(
      ['datasetId', 'limit', 'offset', 'approval'],
      [datasetId, limit, offset, approval]
    );

    return {
      path: `${END_USERS_PATH}${queryString}`,
      method: 'GET',
      transformResponse: standardTransformer(endUserList)
    };
  },
  createEndUserEntry: function(requestBody: EndUserCreateRequest) {
    return createJsonRequest({
      path: END_USERS_PATH,
      method: 'POST',
      body: requestBody,
      transformResponse: standardTransformer(endUserCreateResponse)
    });
  },
  fetchEndUserEntry: function(wdkUserId: number, datasetId: string) {
    const endUserId = makeEndUserId(
      wdkUserId,
      datasetId
    );

    return {
      path: `${END_USERS_PATH}/${wdkUserId}-${endUserId}`,
      method: 'GET',
      transformResponse: standardTransformer(endUser)
    };
  },
  updateEndUserEntry: function(wdkUserId: number, datasetId: string, requestBody: EndUserPatch) {
    const endUserId = makeEndUserId(
      wdkUserId,
      datasetId
    );

    return createJsonRequest({
      path: `${END_USERS_PATH}/${endUserId}`,
      method: 'PATCH',
      body: requestBody,
      transformResponse: noContent
    });
  },
  deleteEndUserEntry: function(wdkUserId: number, datasetId: string) {
    const endUserId = makeEndUserId(
      wdkUserId,
      datasetId
    );

    return {
      path: `${END_USERS_PATH}/${endUserId}`,
      method: 'DELETE',
      transformResponse: noContent
    };
  },
  fetchPermissions: function() {
    return {
      path: PERMISSIONS_PATH,
      method: 'GET',
      transformResponse: standardTransformer(permissionsResponse)
    };
  }
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
  const queryParams = zipWith(
    paramNames,
    paramValues,
    (name, value) => value == null
      ? undefined
      : `${name}=${encodeURIComponent(value)}`
  );

  const nonNullParams = queryParams.filter(
    (param): param is string => param != null
  );

  return nonNullParams.length === 0
    ? ''
    : `?${nonNullParams.join('&')}`;
}

export type StudyAccessApi = BoundApiRequestsObject<typeof apiRequests>;
