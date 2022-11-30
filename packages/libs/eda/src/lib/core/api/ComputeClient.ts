import * as t from 'io-ts';
import {
  createJsonRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';
import { DerivedVariable } from '../types/analysis';
import { Filter } from '../types/filter';

interface ComputeSpec {
  studyId: string;
  filters?: Filter[];
  derivedVariables: DerivedVariable[];
  config: unknown;
}

export type JobStatusReponse = t.TypeOf<typeof JobStatusReponse>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const JobStatusReponse = t.type({
  jobID: t.string,
  status: t.keyof({
    'no-such-job': null,
    queued: null,
    'in-progress': null,
    complete: null,
    failed: null,
    expired: null,
  }),
});

export class ComputeClient extends FetchClientWithCredentials {
  /**
   * Creates a job for a given compute plugin and spec, if one
   * does not already exists, and returns a job status record.
   *
   * @param computeName Name of compute plugin
   * @param computeSpec Properties of compute job
   * @returns {Promise<JobStatusReponse>}
   */
  getJobStatus(
    computeName: string,
    computeSpec: ComputeSpec
  ): Promise<JobStatusReponse> {
    return this.postJobStatus(computeName, computeSpec, false);
  }
  createJob(
    computeName: string,
    computeSpec: ComputeSpec
  ): Promise<JobStatusReponse> {
    return this.postJobStatus(computeName, computeSpec, true);
  }
  private postJobStatus(
    computeName: string,
    computeSpec: ComputeSpec,
    autostart: boolean
  ): Promise<JobStatusReponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: `/computes/${computeName}?autostart=${autostart}`,
        body: computeSpec,
        transformResponse: ioTransformer(JobStatusReponse),
      })
    );
  }
}
