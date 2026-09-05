import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import {
  createJsonRequest,
  FetchApiOptions,
  FetchClientWithCredentials,
} from '@veupathdb/http-utils';

import { JobResponse, SequenceType, SubmitJobRequest } from './ServiceTypes';

const JOBS_PATH = '/jobs';

export class SequenceRetrievalApi extends FetchClientWithCredentials {
  constructor(options: FetchApiOptions, wdkService: WdkService) {
    super(options, wdkService);
  }

  submitJob(
    sequenceType: SequenceType,
    request: SubmitJobRequest
  ): Promise<JobResponse> {
    return this.fetch(
      createJsonRequest({
        path: `/sequences-async/${sequenceType}`,
        method: 'POST',
        body: request,
        transformResponse: async (body) => body as JobResponse,
      })
    );
  }

  fetchJob(jobId: string): Promise<JobResponse> {
    return this.fetch({
      path: `${JOBS_PATH}/${jobId}`,
      method: 'GET',
      transformResponse: async (body) => body as JobResponse,
    });
  }

  fetchJobFiles(jobId: string): Promise<string[]> {
    return this.fetch({
      path: `${JOBS_PATH}/${jobId}/files`,
      method: 'GET',
      transformResponse: async (body) => body as string[],
    });
  }

  fetchJobFile(jobId: string, fileName: string): Promise<string> {
    return this.fetch({
      path: `${JOBS_PATH}/${jobId}/files/${fileName}`,
      method: 'GET',
      transformResponse: async (body) => body as string,
    });
  }
}
