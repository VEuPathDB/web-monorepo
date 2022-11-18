import {
  ApiRequest,
  FetchApiOptions,
  FetchClientWithCredentials,
} from '@veupathdb/http-utils';
import { BlastCompatibleWdkService } from '../wdkServiceIntegration';
import { ApiResult, errorDetails, ErrorDetails } from '../ServiceTypes';
import { isLeft, map } from 'fp-ts/Either';

export class BlastSubClient extends FetchClientWithCredentials {
  constructor(
    options: FetchApiOptions,
    protected readonly wdkService: BlastCompatibleWdkService,
    protected reportError: (error: any) => void
  ) {
    super(options, wdkService);
  }

  async taggedFetch<T>(
    apiRequest: ApiRequest<T>
  ): Promise<ApiResult<T, ErrorDetails>> {
    try {
      return {
        status: 'ok',
        value: await super.fetch(apiRequest),
      };
    } catch (error: any) {
      if (
        typeof error === 'object' &&
        error != null &&
        typeof error.message === 'string'
      ) {
        try {
          const errorDetailsJson = JSON.parse(
            error.message.replace(/^[^{]*(\{.*\})[^}]*$/, '$1')
          );

          const decodedErrorDetails = map(transformTooLargeError)(
            errorDetails.decode(errorDetailsJson)
          );

          if (
            isLeft(decodedErrorDetails) ||
            (decodedErrorDetails.right.status !== 'invalid-input' &&
              decodedErrorDetails.right.status !== 'too-large')
          ) {
            this.reportError(error);
          }

          return isLeft(decodedErrorDetails)
            ? {
                status: 'error',
                details: {
                  status: 'unknown',
                  message: error.message,
                },
              }
            : {
                status: 'error',
                details: decodedErrorDetails.right,
              };
        } catch {
          this.reportError(error);

          return {
            status: 'error',
            details: {
              status: 'unknown',
              message: error.message,
            },
          };
        }
      } else {
        throw error;
      }
    }
  }
}

function transformTooLargeError(errorDetails: ErrorDetails): ErrorDetails {
  return errorDetails.status === 'too-large' ||
    (errorDetails.status === 'bad-request' &&
      errorDetails.message ===
        'Requested report is larger than the specified max content size.')
    ? { ...errorDetails, status: 'too-large' }
    : errorDetails;
}
