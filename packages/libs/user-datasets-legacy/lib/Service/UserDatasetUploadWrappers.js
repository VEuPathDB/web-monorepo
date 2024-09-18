var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
  };
import { partial } from 'lodash';
import * as Decode from '@veupathdb/wdk-client/lib/Utils/Json';
import { appendUrlAndRethrow } from '@veupathdb/wdk-client/lib/Service/ServiceUtils';
/*
 * The authentication method uses a header, not a cookie like in WDK
 */
function fetchWithCredentials(serviceUrl, path, method, body, contentType) {
  return __awaiter(this, void 0, void 0, function* () {
    const cookies = Object.fromEntries(
      document.cookie
        .split('; ')
        .map((entry) => entry.split(/=(.*)/).slice(0, 2))
    );
    let authO;
    if ('Authorization' in cookies) {
      authO = {
        Authorization: 'Bearer ' + cookies.Authorization,
      };
    } else {
      const authKeyValue = cookies.wdk_check_auth;
      if (authKeyValue == null) {
        throw new Error(
          `Tried to retrieve a non-existent WDK auth key for user.`
        );
      }
      authO = {
        'Auth-Key': authKeyValue,
      };
    }
    const contentTypeO =
      contentType != null ? { 'Content-Type': contentType } : {};
    return fetch(serviceUrl + path, {
      method: method.toUpperCase(),
      body: body,
      credentials: 'include',
      headers: new Headers(Object.assign({}, authO, contentTypeO)),
    }).catch(appendUrlAndRethrow(serviceUrl + path));
  });
}
/*
 * The successful payload is decoded as a <Resource>, failure is a text that is acceptable to display
 *
 * The service communicates failures in JSON,
 * with 'message' and 'status' as keys
 * See doc: /api#type:err.ErrorResponse
 */
function fetchDecodedJsonOrThrowMessage(serviceUrl, decoder, options) {
  let { method, path, body } = options;
  return fetchWithCredentials(
    serviceUrl,
    path,
    method,
    body,
    'application/json; charset=utf-8'
  )
    .then((response) =>
      __awaiter(this, void 0, void 0, function* () {
        const responseBody = yield response.json();
        if (response.ok) {
          return responseBody;
        }
        const message = responseBody.message;
        if (!message) {
          throw new Error('Unexpected error: ' + response.status);
        }
        if (response.status !== 422) {
          throw new Error(
            'Error type ' + responseBody.status + ': ' + responseBody.message
          );
        }
        let errorLines = [];
        errorLines.push('Validation failed:');
        if (responseBody.errors.general && responseBody.errors.general.length) {
          errorLines.push(...responseBody.errors.general);
        }
        errorLines.push(
          Object.entries(responseBody.errors.byKey).map(
            (p) => p[0] + ': ' + p[1]
          )
        );
        throw errorLines.join('\n<br>\n');
      })
    )
    .then((responseBody) => {
      const result = decoder(responseBody);
      if (result.status === 'ok') return result.value;
      let errorMessage = `Could not decode resource from ${options.path}:`;
      if (result.context) {
        errorMessage += `\n\n  Problem at _${result.context}:`;
      }
      errorMessage += `\n\n    Expected ${
        result.expected
      }, but got ${JSON.stringify(result.value)}.`;
      throw errorMessage;
    });
}
const statusDetailDecoder = Decode.combine(
  Decode.field('id', Decode.string),
  Decode.field('datasetId', Decode.optional(Decode.number)),
  Decode.field('datasetName', Decode.string),
  Decode.field('summary', Decode.string),
  Decode.field('projects', Decode.arrayOf(Decode.string)),
  Decode.field('status', Decode.string),
  Decode.field(
    'statusDetails',
    Decode.optional(
      Decode.combine(
        Decode.field(
          'errors',
          Decode.optional(
            Decode.combine(
              Decode.field('general', Decode.arrayOf(Decode.string)),
              Decode.field(
                'byKey',
                Decode.objectOf(Decode.arrayOf(Decode.string))
              )
            )
          )
        )
      )
    )
  ),
  Decode.field('stepPercent', Decode.optional(Decode.number)),
  Decode.field('started', Decode.string),
  Decode.field('finished', Decode.optional(Decode.string))
);
function getErrorsFromStatusDetails(statusDetails) {
  let errorLines = [];
  if (statusDetails && statusDetails.errors && statusDetails.errors.general) {
    for (let line of statusDetails.errors.general) {
      errorLines.push(line);
    }
  }
  if (statusDetails && statusDetails.errors && statusDetails.errors.byKey) {
    for (let p of Object.entries(statusDetails.errors.byKey)) {
      errorLines.push(p[0] + ': ' + p[1].join('; '));
    }
  }
  return errorLines;
}
function userDatasetUploadFromStatusDetail(upload) {
  const { statusDetails } = upload,
    restUpload = __rest(upload, ['statusDetails']);
  return Object.assign(Object.assign({}, restUpload), {
    errors: getErrorsFromStatusDetails(statusDetails),
    // Could instead use utility functions and an enum for status values?
    isOngoing: !upload.status.match(/success|rejected|errored/),
    isCancellable: !!upload.status.match(/awaiting-upload/),
    isSuccessful: !!upload.status.match(/success/),
    isUserError: !!upload.status.match(/rejected/),
  });
}
function issueDeleteCommand(datasetImportUrl, jobId) {
  return fetchWithCredentials(
    datasetImportUrl,
    '/user-datasets/' + jobId,
    'DELETE',
    undefined,
    'text/plain;'
  ).then((x) => {});
}
const DATASET_IMPORT_URL_KEY = 'datasetImportUrl';
export const makeUserDatasetUploadServiceWrappers = ({
  datasetImportUrl,
  fullWdkServiceUrl,
}) => ({
  [DATASET_IMPORT_URL_KEY]: (wdkService) => datasetImportUrl,
  addDataset: (wdkService) => (newUserDataset) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const metaBody = JSON.stringify({
        datasetName: newUserDataset.name,
        datasetType: newUserDataset.datasetType,
        description: newUserDataset.description,
        summary: newUserDataset.summary,
        projects: newUserDataset.projects,
        origin: 'direct-upload',
      });
      const fileBody = new FormData();
      const { uploadMethod } = newUserDataset;
      if (uploadMethod.type === 'file') {
        fileBody.append('uploadMethod', 'file');
        fileBody.append('file', uploadMethod.file);
      } else if (uploadMethod.type === 'url') {
        fileBody.append('uploadMethod', 'url');
        fileBody.append('url', uploadMethod.url);
      } else if (newUserDataset.uploadMethod.type === 'result') {
        const temporaryResultPath = yield wdkService.getTemporaryResultPath(
          uploadMethod.stepId,
          uploadMethod.reportName,
          uploadMethod.reportConfig
        );
        const temporaryResultUrl = `${fullWdkServiceUrl}${temporaryResultPath}`;
        fileBody.append('uploadMethod', 'url');
        fileBody.append('url', temporaryResultUrl);
      } else {
        throw new Error(
          `Tried to upload a dataset via an unrecognized upload method '${uploadMethod.type}'`
        );
      }
      return fetchDecodedJsonOrThrowMessage(
        datasetImportUrl,
        Decode.field('jobId', Decode.string),
        {
          path: '/user-datasets',
          method: 'POST',
          body: metaBody,
        }
      ).then(({ jobId }) =>
        fetchWithCredentials(
          datasetImportUrl,
          '/user-datasets/' + jobId,
          'POST',
          fileBody
        ).then((response) => {
          if (!response.ok) {
            return response.text().then((error) => {
              throw error;
            });
          }
          return;
        })
      );
    }),
  listStatusDetails: () => () => {
    return fetchDecodedJsonOrThrowMessage(
      datasetImportUrl,
      Decode.arrayOf(statusDetailDecoder),
      {
        path: '/user-datasets',
        method: 'GET',
      }
    ).then((uploads) => uploads.map(userDatasetUploadFromStatusDetail));
  },
  // Currently only works for jobs whose status is awaiting-upload
  cancelOngoingUpload: () => (jobId) => {
    return issueDeleteCommand(datasetImportUrl, jobId);
  },
  clearMessages: () => (jobIds) => {
    return Promise.all(
      jobIds.map(partial(issueDeleteCommand, datasetImportUrl))
    ).then((x) => {});
  },
  getSupportedDatasetTypes: () => (projectId) => {
    return fetchDecodedJsonOrThrowMessage(
      datasetImportUrl,
      Decode.arrayOf(Decode.string),
      {
        path: `/projects/${projectId}/datasetTypes`,
        method: 'GET',
      }
    );
  },
  getSupportedFileUploadTypes: () => (projectId, datasetType) => {
    return fetchDecodedJsonOrThrowMessage(
      datasetImportUrl,
      Decode.arrayOf(Decode.string),
      {
        path: `/projects/${projectId}/datasetTypes/${datasetType}/fileTypes`,
        method: 'GET',
      }
    );
  },
});
export function isUserDatasetUploadCompatibleWdkService(wdkService) {
  return DATASET_IMPORT_URL_KEY in wdkService;
}
export function assertIsUserDatasetUploadCompatibleWdkService(wdkService) {
  if (!isUserDatasetUploadCompatibleWdkService(wdkService)) {
    throw new Error(MISCONFIGURED_USER_DATASET_UPLOAD_SERVICE_ERROR_MESSAGE);
  }
}
export const MISCONFIGURED_USER_DATASET_UPLOAD_SERVICE_ERROR_MESSAGE =
  'In order to use this feature, a UserDatasetUploadCompatibleWdkService must be configured.';
//# sourceMappingURL=UserDatasetUploadWrappers.js.map
