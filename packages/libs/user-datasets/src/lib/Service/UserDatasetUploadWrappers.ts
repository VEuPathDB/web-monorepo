import { partial } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import * as Decode from '@veupathdb/wdk-client/lib/Utils/Json';
import { appendUrlAndRethrow } from '@veupathdb/wdk-client/lib/Service/ServiceUtils';

import { NewUserDataset, UserDatasetUpload } from '../Utils/types';

export type UserDatasetUploadCompatibleWdkService = WdkService &
  {
    [Key in keyof UserDatasetUploadServiceWrappers]: ReturnType<
      UserDatasetUploadServiceWrappers[Key]
    >;
  };

type UserDatasetUploadServiceWrappers = ReturnType<
  typeof makeUserDatasetUploadServiceWrappers
>;

/*
 * The authentication method uses an 'Auth-Key' header, not the cookie like in WDK
 */
function fetchWithCredentials(
  serviceUrl: string,
  path: string,
  method: string,
  body: any,
  contentType?: string
) {
  const wdkCheckAuth =
    document.cookie.split('; ').find((x) => x.startsWith('wdk_check_auth=')) ||
    '';
  const authKey = wdkCheckAuth.replace('wdk_check_auth=', '');
  const authO = {
    'Auth-Key': authKey,
  };
  const contentTypeO: Record<string, string> =
    contentType != null ? { 'Content-Type': contentType } : {};
  return fetch(serviceUrl + path, {
    method: method.toUpperCase(),
    body: body,
    credentials: 'include',
    headers: new Headers(Object.assign({}, authO, contentTypeO)),
  }).catch(appendUrlAndRethrow(serviceUrl + path));
}

/*
 * The successful payload is decoded as a <Resource>, failure is a text that is acceptable to display
 *
 * The service communicates failures in JSON,
 * with 'message' and 'status' as keys
 * See doc: /api#type:err.ErrorResponse
 */
function fetchDecodedJsonOrThrowMessage<Resource>(
  serviceUrl: string,
  decoder: Decode.Decoder<Resource>,
  options: { path: string; method: string; body?: any }
): Promise<Resource> {
  let { method, path, body } = options;
  return fetchWithCredentials(
    serviceUrl,
    path,
    method,
    body,
    'application/json; charset=utf-8'
  )
    .then(async (response) => {
      const responseBody = await response.json();
      if (response.ok) {
        return responseBody;
      }
      console.log(response);

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
        Object.entries(responseBody.errors.byKey).map((p) => p[0] + ': ' + p[1])
      );

      throw errorLines.join('\n<br>\n');
    })
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
              Decode.field('byKey', Decode.objectOf(Decode.string))
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
type UserDatasetUploadWithStatusDetails = Decode.Unpack<
  typeof statusDetailDecoder
>;
type StatusDetails = UserDatasetUploadWithStatusDetails['statusDetails'];

function getErrorsFromStatusDetails(statusDetails: StatusDetails): string[] {
  let errorLines = [];

  if (statusDetails && statusDetails.errors && statusDetails.errors.general) {
    let line;
    for (line of statusDetails.errors.general) {
      errorLines.push(line);
    }
  }
  if (statusDetails && statusDetails.errors && statusDetails.errors.byKey) {
    let p;
    for (p of Object.entries(statusDetails.errors.byKey)) {
      errorLines.push(p[0] + ': ' + p[1]);
    }
  }
  return errorLines;
}

function userDatasetUploadFromStatusDetail(
  upload: UserDatasetUploadWithStatusDetails
): UserDatasetUpload {
  const { statusDetails, ...restUpload } = upload;
  return {
    ...restUpload,
    errors: getErrorsFromStatusDetails(statusDetails),
    // Could instead use utility functions and an enum for status values?
    isOngoing: !upload.status.match(/success|rejected|errored/),
    isCancellable: !!upload.status.match(/awaiting-upload/),
    isSuccessful: !!upload.status.match(/success/),
    isUserError: !!upload.status.match(/rejected/),
  };
}

function issueDeleteCommand(
  datasetImportUrl: string,
  jobId: string
): Promise<void> {
  return fetchWithCredentials(
    datasetImportUrl,
    '/user-datasets/' + jobId,
    'DELETE',
    undefined,
    'text/plain;'
  ).then((x) => {});
}

const DATASET_IMPORT_URL_KEY = 'datasetImportUrl';

export const makeUserDatasetUploadServiceWrappers = (
  datasetImportUrl: string
) => ({
  [DATASET_IMPORT_URL_KEY]: (wdkService: WdkService) => datasetImportUrl,
  addDataset: () => (newUserDataset: NewUserDataset): Promise<void> => {
    const metaBody = JSON.stringify({
      datasetName: newUserDataset.name,
      datasetType: newUserDataset.datasetType,
      description: newUserDataset.description,
      summary: newUserDataset.summary,
      projects: newUserDataset.projects,
      origin: 'direct-upload',
    });

    const fileBody = new FormData();

    if (newUserDataset.uploadMethod.type === 'file') {
      fileBody.append('uploadMethod', 'file');
      fileBody.append('file', newUserDataset.uploadMethod.file);
    } else {
      fileBody.append('uploadMethod', 'url');
      fileBody.append('url', newUserDataset.uploadMethod.url);
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
      ).then((response) => {})
    );
  },
  listStatusDetails: () => (): Promise<UserDatasetUpload[]> => {
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
  cancelOngoingUpload: () => (jobId: string): Promise<void> => {
    return issueDeleteCommand(datasetImportUrl, jobId);
  },
  clearMessages: () => (jobIds: string[]): Promise<void> => {
    return Promise.all(
      jobIds.map(partial(issueDeleteCommand, datasetImportUrl))
    ).then((x) => {});
  },
});

export function isUserDatasetUploadCompatibleWdkService(
  wdkService: WdkService
): wdkService is UserDatasetUploadCompatibleWdkService {
  return DATASET_IMPORT_URL_KEY in wdkService;
}

export const MISCONFIGURED_USER_DATASET_UPLOAD_SERVICE_ERROR_MESSAGE =
  'In order to use this feature, a UserDatasetUploadCompatibleWdkService must be configured.';
