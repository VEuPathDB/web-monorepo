import {
  createJsonRequest,
  FetchApiOptions,
  ioTransformer,
} from '@veupathdb/http-utils';
import { BlastCompatibleWdkService } from '../wdkServiceIntegration';
import { BlastSubClient } from './BlastSubClient';
import { array, string } from 'io-ts';
import { identity } from 'lodash';
import {
  IOQueryJobCreateRequest,
  ioQueryJobCreateResponse,
  ioQueryJobListEntry,
} from './query/types/ep-jobs';
import {
  ioQueryJobDetails,
  IOQueryJobPatchRequest,
} from './query/types/ep-jobs-by-id';
import { ioBulkStatusResponse } from './query/types/ep-statuses';
import { ioBlastTargetIndex } from './query/types/ep-targets';
import { IOGuestJobTransferRequest } from './query/types/ep-link-guest';

// // //
//
//   Query Service Paths
//
// // //

const QUERY_SVC_PATH_BASE = '/query';
const QUERY_SVC_JOBS_PATH = `${QUERY_SVC_PATH_BASE}/jobs`;
const QUERY_SVC_STATUSES_PATH = `${QUERY_SVC_PATH_BASE}/statuses`;
const QUERY_SVC_TARGETS_PATH = `${QUERY_SVC_PATH_BASE}/targets`;
const QUERY_SVC_LINK_GUEST_PATH = `${QUERY_SVC_PATH_BASE}/link-guest`;

const newQueryJobsPath = (site?: string) =>
  site === undefined
    ? QUERY_SVC_JOBS_PATH
    : `${QUERY_SVC_JOBS_PATH}?site=${site}`;

const newQueryJobPath = (jobID: string, saveJob?: boolean) =>
  saveJob === undefined
    ? `${QUERY_SVC_JOBS_PATH}/${jobID}`
    : `${QUERY_SVC_JOBS_PATH}/${jobID}?save_job=${saveJob}`;

const newQueryJobErrorPath = (jobID: string, download: boolean = false) =>
  `${QUERY_SVC_JOBS_PATH}/${jobID}/stderr?download=${download}`;

const newQueryJobQueryPath = (jobID: string, download: boolean) =>
  `${QUERY_SVC_JOBS_PATH}/${jobID}/query?download=${download}`;

const newQueryJobResultPath = (jobID: string, download: boolean = false) =>
  `${QUERY_SVC_JOBS_PATH}/${jobID}/result?download=${download}`;

// // //
//
//   Service Client Implementation
//
// // //

/**
 * Multi-Blast Query Service REST API Client
 *
 * Provides functions for interacting with the Multi-Blast query service API.
 */
export class BlastQueryClient extends BlastSubClient {
  constructor(
    options: FetchApiOptions,
    wdkService: BlastCompatibleWdkService,
    reportError: (error: any) => void
  ) {
    super(options, wdkService, reportError);
  }

  //  /jobs

  /**
   * Creates a new Multi-Blast query job.
   *
   * @param request Details about the job to create.
   *
   * @param query Query text or file.
   *
   * @return An API response of either an error or the job creation result.
   */
  createJob(request: IOQueryJobCreateRequest, query: string | File) {
    const reqBody = new FormData();
    reqBody.append('config', JSON.stringify(request));
    reqBody.append('query', query);

    return this.taggedFetch({
      path: newQueryJobsPath(),
      method: 'POST',
      body: reqBody,
      transformResponse: ioTransformer(ioQueryJobCreateResponse),
    });
  }

  /**
   * Lists the jobs linked to the current client user.
   *
   * Optionally the list of jobs may be filtered by the target site.
   *
   * @param site Optional site name to filter the results by.
   *
   * @return An API response of either an error or the job list result.
   */
  listJobs(site?: string) {
    return this.taggedFetch({
      path: newQueryJobsPath(site),
      method: 'GET',
      transformResponse: ioTransformer(array(ioQueryJobListEntry)),
    });
  }

  //  /jobs/{job-id}

  fetchJob(jobID: string, saveJob: boolean = true) {
    return this.taggedFetch({
      path: newQueryJobPath(jobID, saveJob),
      method: 'GET',
      transformResponse: ioTransformer(ioQueryJobDetails),
    });
  }

  rerunJob(jobID: string) {
    return this.taggedFetch({
      path: newQueryJobPath(jobID),
      method: 'POST',
      transformResponse: identity,
    });
  }

  deleteJob(jobID: string) {
    return this.taggedFetch({
      path: newQueryJobPath(jobID),
      method: 'DELETE',
      transformResponse: identity,
    });
  }

  updateJob(jobID: string, request: IOQueryJobPatchRequest) {
    return this.taggedFetch(
      createJsonRequest({
        path: newQueryJobPath(jobID),
        method: 'PATCH',
        body: request,
        transformResponse: identity,
      })
    );
  }

  //  /jobs/{job-id}/query

  fetchJobQuery(jobID: string) {
    return this.taggedFetch({
      path: newQueryJobQueryPath(jobID, false),
      method: 'GET',
      transformResponse: ioTransformer(string),
    });
  }

  downloadJobQuery(jobID: string) {
    return this.taggedFetch({
      path: newQueryJobQueryPath(jobID, true),
      method: 'GET',
      transformResponse: identity,
    });
  }

  //  /jobs/{job-id}/stderr

  fetchJobStdErr(jobID: string) {
    return this.taggedFetch({
      path: newQueryJobErrorPath(jobID, false),
      method: 'GET',
      transformResponse: ioTransformer(string),
    });
  }

  downloadJobStdErr(jobID: string) {
    return this.taggedFetch({
      path: newQueryJobErrorPath(jobID, true),
      method: 'GET',
      transformResponse: identity,
    });
  }

  //  /jobs/{job-id}/result

  fetchJobResult(jobID: string) {
    return this.taggedFetch({
      path: newQueryJobResultPath(jobID, false),
      method: 'GET',
      transformResponse: ioTransformer(string),
    });
  }

  downloadJobResult(jobID: string) {
    return this.taggedFetch({
      path: newQueryJobResultPath(jobID, true),
      method: 'GET',
      transformResponse: identity,
    });
  }

  //  /statuses

  fetchJobStatuses(jobIDs: string[]) {
    return this.taggedFetch(
      createJsonRequest({
        path: QUERY_SVC_STATUSES_PATH,
        method: 'POST',
        body: JSON.stringify(jobIDs),
        transformResponse: ioTransformer(ioBulkStatusResponse),
      })
    );
  }

  //  /targets

  fetchBlastableTargets() {
    return this.taggedFetch({
      path: QUERY_SVC_TARGETS_PATH,
      method: 'GET',
      transformResponse: ioTransformer(ioBlastTargetIndex),
    });
  }

  //  /link-guest

  linkGuest(request: IOGuestJobTransferRequest) {
    return this.taggedFetch(
      createJsonRequest({
        path: QUERY_SVC_LINK_GUEST_PATH,
        method: 'POST',
        body: JSON.stringify(request),
        transformResponse: identity,
      })
    );
  }
}
