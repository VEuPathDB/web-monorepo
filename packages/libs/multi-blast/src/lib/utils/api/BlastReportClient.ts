import {
  createJsonRequest,
  FetchApiOptions,
  ioTransformer,
} from '@veupathdb/http-utils';
import { BlastCompatibleWdkService } from '../wdkServiceIntegration';
import { BlastSubClient } from './BlastSubClient';
import {
  IOReportJobCreateRequest,
  ioReportJobCreateResponse,
  ioReportJobListEntry,
} from './report/types/ep-jobs';
import { array, string } from 'io-ts';
import { identity } from 'lodash';
import {
  ioReportJobDetails,
  IOReportJobPatchRequest,
} from './report/types/ep-job-by-id';
import { ioFileEntry } from './report/types/ep-job-file-list';
import { ioBulkStatusResponse } from './report/types/ep-statuses';
import { IOGuestJobTransferRequest } from './report/types/ep-link-guest';

// // //
//
//  Report Service Paths
//
// // //

const REPORT_SVC_PATH_BASE = '/report';
const REPORT_SVC_JOBS_PATH = `${REPORT_SVC_PATH_BASE}/jobs`;
const REPORT_SVC_STATUSES_PATH = `${REPORT_SVC_PATH_BASE}/statuses`;
const REPORT_SVC_LINK_GUEST_PATH = `${REPORT_SVC_PATH_BASE}/link-guest`;

const newReportJobsPath = (queryJobID?: string) =>
  queryJobID === undefined
    ? REPORT_SVC_JOBS_PATH
    : `${REPORT_SVC_JOBS_PATH}?query_job_id=${queryJobID}`;

const newReportJobPath = (jobID: string, saveJob?: boolean) =>
  saveJob === undefined
    ? `${REPORT_SVC_JOBS_PATH}/${jobID}`
    : `${REPORT_SVC_JOBS_PATH}/${jobID}?save_job=${saveJob}`;

const newReportJobErrorPath = (jobID: string, download: boolean) =>
  `${REPORT_SVC_JOBS_PATH}/${jobID}/stderr?download=${download}`;

const newReportJobFileListPath = (jobID: string) =>
  `${REPORT_SVC_JOBS_PATH}/${jobID}/files`;

const newReportJobFilePath = (
  jobID: string,
  fileName: string,
  download: boolean
) => `${REPORT_SVC_JOBS_PATH}/${jobID}/files/${fileName}?download=${download}`;

// // //
//
//   Service Client Implementation
//
// // //

export class BlastReportClient extends BlastSubClient {
  constructor(
    options: FetchApiOptions,
    wdkService: BlastCompatibleWdkService,
    reportError: (error: any) => void
  ) {
    super(options, wdkService, reportError);
  }

  //  /jobs

  createJob(request: IOReportJobCreateRequest) {
    return this.taggedFetch(
      createJsonRequest({
        path: newReportJobsPath(),
        method: 'POST',
        body: request,
        transformResponse: ioTransformer(ioReportJobCreateResponse),
      })
    );
  }

  listJobs(queryJobID?: string) {
    return this.taggedFetch({
      path: newReportJobsPath(queryJobID),
      method: 'GET',
      transformResponse: ioTransformer(array(ioReportJobListEntry)),
    });
  }

  //  /jobs/{job-id}

  deleteJob(jobID: string) {
    return this.taggedFetch({
      path: newReportJobPath(jobID),
      method: 'DELETE',
      transformResponse: identity,
    });
  }

  fetchJob(jobID: string, saveJob: boolean = true) {
    return this.taggedFetch({
      path: newReportJobPath(jobID, saveJob),
      method: 'GET',
      transformResponse: ioTransformer(ioReportJobDetails),
    });
  }

  rerunJob(jobID: string) {
    return this.taggedFetch({
      path: newReportJobPath(jobID),
      method: 'POST',
      transformResponse: identity,
    });
  }

  updateJob(jobID: string, request: IOReportJobPatchRequest) {
    return this.taggedFetch(
      createJsonRequest({
        path: newReportJobPath(jobID),
        method: 'PATCH',
        body: request,
        transformResponse: identity,
      })
    );
  }

  //  /jobs/{job-id}/files

  listJobFiles(jobID: string) {
    return this.taggedFetch({
      path: newReportJobFileListPath(jobID),
      method: 'GET',
      transformResponse: ioTransformer(array(ioFileEntry)),
    });
  }

  //  /jobs/{job-id}/files/{filename}

  fetchJobFile(jobID: string, fileName: string) {
    return this.fetchJobFileAs(jobID, fileName, identity);
  }

  fetchJobFileAs<A>(
    jobID: string,
    fileName: string,
    transform: (res: unknown) => Promise<A>
  ) {
    return this.taggedFetch({
      path: newReportJobFilePath(jobID, fileName, false),
      method: 'GET',
      transformResponse: transform,
    });
  }

  downloadJobFile(jobID: string, fileName: string) {
    return this.taggedFetch({
      path: newReportJobFilePath(jobID, fileName, true),
      method: 'GET',
      transformResponse: identity,
    });
  }

  //  /jobs/{job-id}/stderr

  fetchJobStdErr(jobID: string) {
    return this.taggedFetch({
      path: newReportJobErrorPath(jobID, false),
      method: 'GET',
      transformResponse: ioTransformer(string),
    });
  }

  downloadJobStdErr(jobID: string) {
    return this.taggedFetch({
      path: newReportJobErrorPath(jobID, true),
      method: 'GET',
      transformResponse: identity,
    });
  }

  //  /statuses

  fetchJobStatuses(jobIDs: string[]) {
    return this.taggedFetch(
      createJsonRequest({
        path: REPORT_SVC_STATUSES_PATH,
        method: 'POST',
        body: jobIDs,
        transformResponse: ioTransformer(ioBulkStatusResponse),
      })
    );
  }

  //  /link-guest

  linkGuest(request: IOGuestJobTransferRequest) {
    return this.taggedFetch(
      createJsonRequest({
        path: REPORT_SVC_LINK_GUEST_PATH,
        method: 'POST',
        body: request,
        transformResponse: identity,
      })
    );
  }
}
