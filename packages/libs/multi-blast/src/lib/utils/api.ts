import { arrayOf, string } from '@veupathdb/wdk-client/lib/Utils/Json';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import {
  BoundApiRequestsObject,
  createFetchApiRequestHandler,
  createJsonRequest,
  standardTransformer,
} from '@veupathdb/web-common/lib/util/api';

import { omit } from 'lodash';

import {
  IoBlastConfig,
  createJobResponse,
  longJobResponse,
  multiQueryReportJson,
  shortJobResponse,
} from './ServiceTypes';

export function createBlastRequestHandler(
  baseBlastUrl: string,
  user: User,
  fetchApi?: Window['fetch']
) {
  return createFetchApiRequestHandler({
    baseUrl: baseBlastUrl,
    init: {
      headers: {
        'Auth-Key': getAuthKey(user),
      },
    },
    fetchApi,
  });
}

const JOBS_PATH = '/jobs';

export const apiRequests = {
  fetchJobEntities: function () {
    return {
      path: JOBS_PATH,
      method: 'GET',
      transformResponse: standardTransformer(arrayOf(shortJobResponse)),
    };
  },
  createJob: function (
    site: string,
    targets: { organism: string; target: string }[],
    query: string | File,
    config: IoBlastConfig,
    description?: string
  ) {
    const requestProperties = {
      site,
      targets,
      config:
        query instanceof File
          ? omit(config, 'query')
          : {
              ...config,
              query,
            },
      description,
    };

    if (query instanceof File) {
      const requestBody = new FormData();

      requestBody.append('properties', JSON.stringify(requestProperties));

      requestBody.append('query', query);

      return {
        path: JOBS_PATH,
        method: 'POST',
        body: requestBody,
        transformResponse: standardTransformer(createJobResponse),
      };
    } else {
      return createJsonRequest({
        path: JOBS_PATH,
        method: 'POST',
        body: requestProperties,
        transformResponse: standardTransformer(createJobResponse),
      });
    }
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
      path: `${JOBS_PATH}/${jobId}/report?format=single-file-json&zip=false&inline=true`,
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

// FIXME: Update createRequestHandler to accommodate responses
// with "attachment" Content-Disposition
export function createJobContentDownloader(user: User) {
  return async function downloadJobContent(
    contentUrl: string,
    filename: string
  ) {
    const response = await fetch(contentUrl, {
      headers: { 'Auth-Key': getAuthKey(user) },
    });

    const blob = await response.blob();

    // Adapted from https://stackoverflow.com/a/42274086
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
    a.click();
    a.remove(); //afterwards we remove the element again
  };
}

function getAuthKey(user: User) {
  if (user.isGuest) {
    return `${user.id}`;
  }

  const wdkCheckAuth =
    document.cookie.split('; ').find((x) => x.startsWith('wdk_check_auth=')) ??
    '';
  const authKey = wdkCheckAuth.replace('wdk_check_auth=', '');

  return authKey;
}
