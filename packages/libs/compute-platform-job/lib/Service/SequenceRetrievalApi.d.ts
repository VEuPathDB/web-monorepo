import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import {
  FetchApiOptions,
  FetchClientWithCredentials,
} from '@veupathdb/http-utils';
import { JobResponse, SequenceType, SubmitJobRequest } from './ServiceTypes';
export declare class SequenceRetrievalApi extends FetchClientWithCredentials {
  constructor(options: FetchApiOptions, wdkService: WdkService);
  submitJob(
    sequenceType: SequenceType,
    request: SubmitJobRequest
  ): Promise<JobResponse>;
  fetchJob(jobId: string): Promise<JobResponse>;
  fetchJobFiles(jobId: string): Promise<string[]>;
  fetchJobFile(jobId: string, fileName: string): Promise<string>;
}
//# sourceMappingURL=SequenceRetrievalApi.d.ts.map
