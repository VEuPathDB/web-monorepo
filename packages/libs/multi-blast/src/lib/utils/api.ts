import { arrayOf, string } from '@veupathdb/wdk-client/lib/Utils/Json';
import {
  BoundApiRequestsObject,
  createFetchApiRequestHandler,
  createJsonRequest,
  standardTransformer,
} from '@veupathdb/web-common/lib/util/api';

import {
  IoBlastConfig,
  createJobResponse,
  longJobResponse,
  multiQueryReportJson,
  shortJobResponse,
} from './ServiceTypes';

export function createBlastRequestHandler(
  baseBlastUrl: string,
  fetchApi?: Window['fetch']
) {
  const wdkCheckAuth =
    document.cookie.split('; ').find((x) => x.startsWith('wdk_check_auth=')) ??
    '';
  const authKey = wdkCheckAuth.replace('wdk_check_auth=', '');

  return createFetchApiRequestHandler({
    baseUrl: baseBlastUrl,
    init: {
      headers: {
        'Auth-Key': authKey,
      },
    },
    fetchApi,
  });
}

const JOBS_PATH = '/jobs';

export const apiRequests = {
  // FIXME: Should be jobs be filterable by site?
  fetchJobList: function () {
    return {
      path: JOBS_PATH,
      method: 'GET',
      transformResponse: standardTransformer(arrayOf(shortJobResponse)),
    };
  },
  createJob: function (
    site: string,
    targets: { organism: string; target: string }[],
    config: IoBlastConfig
  ) {
    return createJsonRequest({
      path: JOBS_PATH,
      method: 'POST',
      body: {
        site,
        targets,
        config,
      },
      transformResponse: standardTransformer(createJobResponse),
    });
  },
  fetchJob: function (jobId: string) {
    return {
      path: `${JOBS_PATH}/${jobId}`,
      method: 'GET',
      transformResponse: standardTransformer(longJobResponse),
    };
  },
  fetchSingleFileJsonReport: function (jobId: string) {
    return {
      path: `${JOBS_PATH}/${jobId}/report?format=15&zip=false&inline=true`,
      method: 'GET',
      transformResponse: standardTransformer(multiQueryReportJson),
    };
  },
  fetchQuery: function (jobId: string) {
    return {
      path: `${JOBS_PATH}/${jobId}/query?download=false`,
      method: 'GET',
      transformResponse: standardTransformer(string),
    };
  },
};

export type BlastApi = BoundApiRequestsObject<typeof apiRequests>;
