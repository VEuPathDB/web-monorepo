import { flowRight, mapValues, omit, partial } from 'lodash';

import {
  arrayOf,
  decodeOrElse,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import {
  ApiRequestCreator,
  ApiRequestHandler,
  ApiRequestsObject,
  createFetchApiRequestHandler,
  createJsonRequest,
  standardTransformer,
} from '@veupathdb/web-common/lib/util/api';

import {
  ApiResult,
  ErrorDetails,
  IoBlastConfig,
  ReportConfig,
  createJobResponse,
  createReportResponse,
  errorDetails,
  longJobResponse,
  longReportResponse,
  multiQueryReportJson,
  shortJobResponse,
  shortReportResponse,
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
const REPORTS_PATH = '/reports';

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
    maxResultSize: number = 0,
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
      maxResultSize,
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
  rerunJob: function (jobId: string) {
    return {
      path: `${JOBS_PATH}/${jobId}`,
      method: 'POST',
      transformResponse: noContent,
    };
  },
  fetchReportEntities: function () {
    return {
      path: REPORTS_PATH,
      method: 'GET',
      transformResponse: standardTransformer(arrayOf(shortReportResponse)),
    };
  },
  createReport: function (jobId: string, reportConfig: ReportConfig) {
    return createJsonRequest({
      path: REPORTS_PATH,
      method: 'POST',
      body: {
        jobId,
        ...reportConfig,
      },
      transformResponse: standardTransformer(createReportResponse),
    });
  },
  fetchReport: function (reportId: string) {
    return {
      path: `${REPORTS_PATH}/${reportId}`,
      method: 'GET',
      transformResponse: standardTransformer(longReportResponse),
    };
  },
  rerunReport: function (reportId: string) {
    return {
      path: `${REPORTS_PATH}/${reportId}`,
      method: 'POST',
      transformResponse: noContent,
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

async function noContent(body: unknown) {
  return null;
}

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

export async function apiErrorHandler<T>(
  reportError: (error: any) => void,
  apiRequest: Promise<T>
): Promise<ApiResult<T, ErrorDetails>> {
  try {
    return {
      status: 'ok',
      value: await apiRequest,
    };
  } catch (error) {
    if (
      typeof error === 'object' &&
      error != null &&
      typeof error.message === 'string'
    ) {
      const decodedErrorDetails = decodeOrElse(
        errorDetails,
        {
          status: 'unknown',
          message: error,
        },
        error.message.replace(/^[^{]*(\{.*\})[^}]*$/, '$1')
      );

      if (decodedErrorDetails.status !== 'invalid-input') {
        reportError(error);
      }

      return {
        status: 'error',
        details: decodedErrorDetails,
      };
    } else {
      throw error;
    }
  }
}

export type BlastApi = BoundBlastApiRequestsObject<typeof apiRequests>;

export type BoundBlastApiRequestsObject<T extends ApiRequestsObject> = {
  [P in keyof T]: T[P] extends ApiRequestCreator<infer A, infer B>
    ? (...args: B) => Promise<ApiResult<A, ErrorDetails>>
    : never;
};

export function bindBlastApiRequestCreators<T extends ApiRequestsObject>(
  requestCreators: T,
  successHandler: ApiRequestHandler,
  reportError: (error: any) => void
): BoundBlastApiRequestsObject<T> {
  const errorHandler = partial(apiErrorHandler, reportError);

  return mapValues(requestCreators, (requestCreator) =>
    flowRight(errorHandler, successHandler, requestCreator)
  ) as BoundBlastApiRequestsObject<T>;
}
