import { FetchApiOptions, ioTransformer } from '@veupathdb/http-utils';
import { BlastCompatibleWdkService } from '../wdkServiceIntegration';
import { BlastSubClient } from './BlastSubClient';
import { string } from 'io-ts';
import { identity } from 'lodash';
import {
  IOQueryJobCreateRequest,
  ioQueryJobCreateResponse,
} from './query/api/ep-jobs';
import { ioQueryJobDetails } from './query/api/ep-jobs-by-id';
import { ioBulkStatusResponse } from './query/api/ep-statuses';
import { ioBlastTargetIndex } from './query/api/ep-targets';
import { IOGuestJobTransferRequest } from './query/api/ep-link-guest';

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

export class BlastQueryClient extends BlastSubClient {
  constructor(
    options: FetchApiOptions,
    wdkService: BlastCompatibleWdkService,
    reportError: (error: any) => void
  ) {
    super(options, wdkService, reportError);
  }
  createJob(request: IOQueryJobCreateRequest, query: string | File) {
    const reqBody = new FormData();
    reqBody.append('config', JSON.stringify(request));
    reqBody.append('query', query);

    return this.taggedFetch({
      path: QUERY_SVC_JOBS_PATH,
      method: 'POST',
      body: reqBody,
      transformResponse: ioTransformer(ioQueryJobCreateResponse),
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
    return this.taggedFetch({
      path: QUERY_SVC_STATUSES_PATH,
      method: 'POST',
      body: JSON.stringify(jobIDs),
      transformResponse: ioTransformer(ioBulkStatusResponse),
    });
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
    return this.taggedFetch({
      path: QUERY_SVC_LINK_GUEST_PATH,
      method: 'POST',
      body: JSON.stringify(request),
      transformResponse: identity,
    });
  }
}
