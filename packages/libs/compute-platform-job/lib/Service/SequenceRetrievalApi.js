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
import {
  createJsonRequest,
  FetchClientWithCredentials,
} from '@veupathdb/http-utils';
const JOBS_PATH = '/jobs';
export class SequenceRetrievalApi extends FetchClientWithCredentials {
  constructor(options, wdkService) {
    super(options, wdkService);
  }
  submitJob(sequenceType, request) {
    return this.fetch(
      createJsonRequest({
        path: `/sequences-async/${sequenceType}`,
        method: 'POST',
        body: request,
        transformResponse: (body) =>
          __awaiter(this, void 0, void 0, function* () {
            return body;
          }),
      })
    );
  }
  fetchJob(jobId) {
    return this.fetch({
      path: `${JOBS_PATH}/${jobId}`,
      method: 'GET',
      transformResponse: (body) =>
        __awaiter(this, void 0, void 0, function* () {
          return body;
        }),
    });
  }
  fetchJobFiles(jobId) {
    return this.fetch({
      path: `${JOBS_PATH}/${jobId}/files`,
      method: 'GET',
      transformResponse: (body) =>
        __awaiter(this, void 0, void 0, function* () {
          return body;
        }),
    });
  }
  fetchJobFile(jobId, fileName) {
    return this.fetch({
      path: `${JOBS_PATH}/${jobId}/files/${fileName}`,
      method: 'GET',
      transformResponse: (body) =>
        __awaiter(this, void 0, void 0, function* () {
          return body;
        }),
    });
  }
}
//# sourceMappingURL=SequenceRetrievalApi.js.map
