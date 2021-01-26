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
  // FIXME: Remove this hardcoding once the discrepancies between the organism names + target types
  // of the BLAST service and GenesByMultiBlast question parameters have been resolved
  createJob: function (
    site: string = 'PlasmoDB',
    organisms: string = 'Pfalciparum3D7',
    targetType: string = 'Pfalciparum3D7Genome',
    config: IoBlastConfig
  ) {
    return createJsonRequest({
      path: JOBS_PATH,
      method: 'POST',
      body: {
        site,
        organism: organisms,
        'target-type': targetType,
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
  fetchQuery: function (jobId: string) {
    return {
      path: `${JOBS_PATH}/${jobId}/query?download=false`,
      method: 'GET',
      transformResponse: standardTransformer(string),
    };
  },
};

export type BlastApi = BoundApiRequestsObject<typeof apiRequests>;
