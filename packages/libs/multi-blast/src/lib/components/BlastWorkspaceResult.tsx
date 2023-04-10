import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';

import {
  Error as ErrorPage,
  Link,
  Loading,
} from '@veupathdb/wdk-client/lib/Components';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

import { useBlastApi } from '../hooks/api';
import {
  useHitTypeDisplayNames,
  useTargetTypeTermAndWdkRecordType,
} from '../hooks/combinedResults';
import { useBlastCompatibleWdkService } from '../hooks/wdkServiceIntegration';
import { IndividualQuery, SelectedResult } from '../utils/CommonTypes';
import {
  ApiResult,
  ApiResultError,
  ApiResultSuccess,
  ErrorDetails,
  multiQueryReportJson,
  MultiQueryReportJson,
} from '../utils/ServiceTypes';
import { fetchOrganismToFilenameMaps } from '../utils/organisms';
import { reportToParamValues } from '../utils/params';
import { TargetMetadataByDataType } from '../utils/targetTypes';

import { blastWorkspaceCx } from './BlastWorkspace';
import { BlastRequestError } from './BlastRequestError';
import { ResultContainer } from './ResultContainer';

import './BlastWorkspaceResult.scss';
import { BlastReportClient } from '../utils/api/BlastReportClient';
import { IOBlastOutFormat } from '../utils/api/report/blast/blast-config-format';
import { IOReportJobDetails } from '../utils/api/report/types/ep-job-by-id';
import { BlastQueryClient } from '../utils/api/BlastQueryClient';
import { IOQueryJobDetails } from '../utils/api/query/types/ep-jobs-by-id';
import { IOJobTarget } from '../utils/api/query/types/common';
import { ioTransformer } from '@veupathdb/http-utils';

interface Props {
  jobId: string;
  selectedResult?: SelectedResult;
}

const POLLING_INTERVAL = 3000;

export function BlastWorkspaceResult(props: Props) {
  useSetDocumentTitle(`BLAST Job ${props.jobId}`);

  const blastApi = useBlastApi();

  const [queryResultState, setQueryResultState] = useState<
    ApiResult<string, ErrorDetails>
  >();

  useEffect(
    () =>
      Task.fromPromise(() => blastApi.queryAPI.fetchJobQuery(props.jobId)).run(
        setQueryResultState
      ),
    [blastApi, props.jobId]
  );

  const [jobResultState, setJobResultState] = useState<QueryJobPollingState>({
    status: 'job-pending',
    jobId: props.jobId,
  });

  useEffect(() => {
    if (
      jobResultState.status !== 'job-pending' &&
      jobResultState.jobId === props.jobId
    ) {
      return;
    }

    return Task.fromPromise(() =>
      makeQueryJobPollingPromise(blastApi.queryAPI, props.jobId)
    ).run(setJobResultState);
  }, [blastApi, props.jobId, jobResultState]);

  const [
    reportResultState,
    setReportResultState,
  ] = useState<ReportJobPollingState>({
    status: 'report-pending',
    jobId: props.jobId,
  });

  useEffect(() => {
    if (
      jobResultState.status !== 'job-completed' ||
      (reportResultState.status !== 'report-pending' &&
        reportResultState.jobId === props.jobId)
    ) {
      return;
    }

    return Task.fromPromise(() =>
      makeReportPollingPromise(
        blastApi.reportAPI,
        props.jobId,
        'single-file-blast-json'
      )
    ).run(setReportResultState);
  }, [blastApi, props.jobId, jobResultState, reportResultState]);

  const [multiQueryReportState, setMultiQueryReportState] = useState<
    ApiResult<MultiQueryReportJson, ErrorDetails>
  >();

  useEffect(
    () =>
      Task.fromPromise(async () =>
        reportResultState?.status !== 'report-completed'
          ? undefined
          : blastApi.reportAPI.fetchJobFileAs(
              reportResultState.report.reportJobID,
              'report.json',
              (res) =>
                ioTransformer(multiQueryReportJson)(JSON.parse(res as any))
            )
      ).run(setMultiQueryReportState),
    [blastApi, reportResultState]
  );

  const [
    individualQueriesResultState,
    setIndividualQueriesResultState,
  ] = useState<ApiResult<IndividualQuery[], ErrorDetails>>();

  useEffect(
    () =>
      Task.fromPromise(async () => {
        if (jobResultState.status !== 'job-completed') {
          return undefined;
        }

        const childJobIds = jobResultState.job?.subJobs;
        const subJobIds =
          childJobIds == null || childJobIds.length === 0
            ? [jobResultState.job.queryJobID]
            : childJobIds;

        const queryResults = await Promise.all(
          subJobIds.map((id) =>
            blastApi.queryAPI.fetchJobQuery(id).then((queryResult) =>
              queryResult.status === 'error'
                ? queryResult
                : {
                    status: 'ok',
                    value: {
                      jobId: id,
                      query: queryResult.value,
                    },
                  }
            )
          )
        );

        const invalidQueryResult = queryResults.find(
          ({ status }) => status === 'error'
        );

        return invalidQueryResult != null
          ? (invalidQueryResult as ApiResultError<ErrorDetails>)
          : ({
              status: 'ok',
              value: (queryResults as {
                status: 'ok';
                value: IndividualQuery;
              }[]).map((queryResult) => queryResult.value),
            } as ApiResultSuccess<IndividualQuery[]>);
      }).run(setIndividualQueriesResultState),
    [blastApi, jobResultState]
  );

  return jobResultState.status === 'request-error' ? (
    <BlastRequestError errorDetails={jobResultState.details} />
  ) : jobResultState.status === 'queueing-error' ? (
    <ErrorPage
      message={
        <code>
          {jobResultState.errorMessage ?? 'We were unable to queue your job.'}
        </code>
      }
    />
  ) : queryResultState != null && queryResultState.status === 'error' ? (
    <BlastRequestError errorDetails={queryResultState.details} />
  ) : reportResultState != null &&
    reportResultState.status === 'request-error' ? (
    <BlastRequestError errorDetails={reportResultState.details} />
  ) : reportResultState != null &&
    reportResultState.status === 'queueing-error' ? (
    <ErrorPage message="We were unable to queue your combined results report." />
  ) : individualQueriesResultState != null &&
    individualQueriesResultState.status === 'error' ? (
    <BlastRequestError errorDetails={individualQueriesResultState.details} />
  ) : queryResultState == null ||
    jobResultState.status === 'job-pending' ||
    reportResultState.status === 'report-pending' ||
    individualQueriesResultState == null ? (
    <LoadingBlastResult {...props} />
  ) : (
    <CompleteBlastResult
      {...props}
      individualQueries={individualQueriesResultState.value}
      jobDetails={jobResultState.job}
      query={queryResultState.value}
      multiQueryReportResult={multiQueryReportState}
    />
  );
}

function LoadingBlastResult(props: Props) {
  return (
    <div className={blastWorkspaceCx('Result', 'Loading')}>
      <h1>BLAST Job - pending</h1>
      <p className="JobId">
        <span className="InlineHeader">Job Id:</span> {props.jobId}
      </p>
      <Loading>
        <div className="Caption">
          <p className="Status">
            <span className="InlineHeader">Status:</span> running
          </p>
          <p className="Instructions">
            This job could take some time to run. You may leave this page and
            access the result from your{' '}
            <Link to="/workspace/blast/all">jobs list</Link> later, or{' '}
            <Link to="/workspace/blast/new">submit another BLAST job</Link>{' '}
            while you wait.
          </p>
        </div>
      </Loading>
    </div>
  );
}

export type MultiQueryReportResult = ApiResult<
  MultiQueryReportJson,
  ErrorDetails
>;

interface CompleteBlastResultProps extends Props {
  individualQueries: IndividualQuery[];
  jobDetails: IOQueryJobDetails;
  multiQueryReportResult?: MultiQueryReportResult;
  query: string;
}

function CompleteBlastResult(props: CompleteBlastResultProps) {
  const history = useHistory();

  const targetMetadataByDataType = useContext(TargetMetadataByDataType);

  const queryCount = props.individualQueries.length;

  const targets = props.jobDetails.jobConfig.targets;

  const { targetTypeTerm, wdkRecordType } = useTargetTypeTermAndWdkRecordType(
    targets
  );

  const organismToFilenameMapsResult = useBlastCompatibleWdkService(
    async (wdkService) =>
      fetchOrganismToFilenameMaps(
        wdkService,
        targetTypeTerm,
        targetMetadataByDataType
      ),
    [targetMetadataByDataType, targetTypeTerm]
  );

  useEffect(() => {
    if (queryCount != null && props.selectedResult == null) {
      const selectedResultPath = queryCount > 1 ? '/combined' : '/individual/1';

      history.replace(
        `/workspace/blast/result/${props.jobId}${selectedResultPath}`
      );
    }
  }, [history, props.jobId, queryCount, props.selectedResult]);

  return props.selectedResult == null ||
    organismToFilenameMapsResult == null ? (
    <LoadingBlastResult {...props} />
  ) : props.selectedResult.type === 'combined' && queryCount === 1 ? (
    <NotFoundController />
  ) : props.selectedResult.type === 'individual' &&
    (props.selectedResult.resultIndex === 0 ||
      props.selectedResult.resultIndex > queryCount) ? (
    <NotFoundController />
  ) : (
    <BlastSummary
      filesToOrganisms={organismToFilenameMapsResult.filesToOrganisms}
      jobDetails={props.jobDetails}
      targets={targets}
      multiQueryReportResult={props.multiQueryReportResult}
      query={props.query}
      individualQueries={props.individualQueries}
      selectedResult={props.selectedResult}
      targetTypeTerm={targetTypeTerm}
      wdkRecordType={wdkRecordType}
    />
  );
}

interface BlastSummaryProps {
  filesToOrganisms: Record<string, string>;
  jobDetails: IOQueryJobDetails;
  targets: IOJobTarget[];
  multiQueryReportResult?: MultiQueryReportResult;
  query: string;
  individualQueries: IndividualQuery[];
  selectedResult: SelectedResult;
  targetTypeTerm: string;
  wdkRecordType: string;
}

function BlastSummary({
  filesToOrganisms,
  jobDetails,
  targets,
  multiQueryReportResult,
  query,
  individualQueries,
  selectedResult,
  targetTypeTerm,
  wdkRecordType,
}: BlastSummaryProps) {
  const queryCount = individualQueries.length;

  const databases = useMemo(
    () => targets.map(({ targetDisplayName: target }) => target),
    [targets]
  );

  const databasesStr = useMemo(() => databases.join(', '), [databases]);

  const {
    hitTypeDisplayName,
    hitTypeDisplayNamePlural,
  } = useHitTypeDisplayNames(wdkRecordType, targetTypeTerm);

  const multiQueryParamValues = useMemo(
    () =>
      reportToParamValues(
        jobDetails,
        query,
        targetTypeTerm,
        targets,
        filesToOrganisms
      ),
    [targets, filesToOrganisms, jobDetails, targetTypeTerm, query]
  );

  const [
    lastSelectedIndividualResult,
    setLastSelectedIndividualResult,
  ] = useState(
    selectedResult.type === 'combined' ? 1 : selectedResult.resultIndex
  );

  useEffect(() => {
    if (selectedResult.type === 'individual') {
      setLastSelectedIndividualResult(selectedResult.resultIndex);
    }
  }, [selectedResult]);

  return (
    <div className={blastWorkspaceCx('Result', 'Complete')}>
      <h1>BLAST Job - result</h1>
      <Link className="BackToAllJobs" to="/workspace/blast/all">
        &lt;&lt; All my BLAST Jobs
      </Link>
      <div className="ConfigDetailsContainer">
        <div className="ConfigDetails">
          <span className="InlineHeader">Job Id:</span>
          <span className="JobId">
            {jobDetails.queryJobID}
            {multiQueryParamValues && (
              <Link
                className="EditJob"
                to={{
                  pathname: '/workspace/blast/new',
                  state: {
                    parameterValues: multiQueryParamValues,
                  },
                }}
              >
                Revise and rerun
              </Link>
            )}
          </span>
          {jobDetails.userMeta?.summary != null && (
            <Fragment>
              <span className="InlineHeader">Description:</span>
              <span>{jobDetails.userMeta.summary}</span>
            </Fragment>
          )}
          <span className="InlineHeader">Program:</span>
          <span>
            {
              /* Try and show the specific task that was selected, if possible.
                If not possible, fall back to just showing the tool.
                (Big "or" block as Most blastConfig types don't have a 'task'
                property) */
              jobDetails.blastConfig.tool === 'deltablast' ||
              jobDetails.blastConfig.tool === 'psiblast' ||
              jobDetails.blastConfig.tool === 'rpsblast' ||
              jobDetails.blastConfig.tool === 'rpstblastn' ||
              jobDetails.blastConfig.tool === 'tblastx' ||
              jobDetails.blastConfig.task == null
                ? jobDetails.blastConfig.tool
                : jobDetails.blastConfig.task
            }
          </span>
          <span className="InlineHeader">Target Type:</span>
          <span>{hitTypeDisplayName}</span>
          <span className="InlineHeader">
            {databases.length > 1 ? 'Databases' : 'Database'}:
          </span>
          <span>{databasesStr}</span>
        </div>
      </div>
      {queryCount > 1 && (
        <WorkspaceNavigation
          heading={null}
          routeBase={`/workspace/blast/result/${jobDetails.queryJobID}`}
          items={[
            {
              display: 'Combined Result',
              route: '/combined',
            },
            {
              display: 'Individual Results',
              route: `/individual/${
                selectedResult.type === 'combined'
                  ? lastSelectedIndividualResult
                  : selectedResult.resultIndex
              }`,
            },
          ]}
        />
      )}
      <ResultContainer
        multiQueryReportResult={multiQueryReportResult}
        filesToOrganisms={filesToOrganisms}
        hitTypeDisplayName={hitTypeDisplayName}
        hitTypeDisplayNamePlural={hitTypeDisplayNamePlural}
        jobId={jobDetails.queryJobID}
        lastSelectedIndividualResult={lastSelectedIndividualResult}
        multiQueryParamValues={multiQueryParamValues}
        individualQueries={individualQueries}
        selectedResult={selectedResult}
        targetTypeTerm={targetTypeTerm}
        wdkRecordType={wdkRecordType}
      />
    </div>
  );
}

type QueryJobPollingState =
  | QueryJobPollingInProgress
  | QueryJobPollingSuccess
  | QueryJobPollingQueueingError
  | QueryJobPollingRequestError;

interface JobPollingBase {
  jobId: string;
}

interface QueryJobPollingInProgress extends JobPollingBase {
  status: 'job-pending';
}

interface QueryJobPollingSuccess extends JobPollingBase {
  status: 'job-completed';
  job: IOQueryJobDetails;
}

interface QueryJobPollingQueueingError extends JobPollingBase {
  status: 'queueing-error';
  job: IOQueryJobDetails;
  errorMessage?: string;
}

interface QueryJobPollingRequestError extends JobPollingBase {
  status: 'request-error';
  details: ErrorDetails;
}

async function makeQueryJobPollingPromise(
  blastApi: BlastQueryClient,
  jobId: string
): Promise<QueryJobPollingState> {
  const jobRequest = await blastApi.fetchJob(jobId);

  if (jobRequest.status === 'ok') {
    const job = jobRequest.value;

    if (job.status === 'complete') {
      return {
        status: 'job-completed',
        jobId,
        job,
      };
    }

    if (job.status === 'failed') {
      const queueingErrorMessageRequest = await blastApi.fetchJobStdErr(
        job.queryJobID
      );

      return {
        status: 'queueing-error',
        jobId,
        job,
        errorMessage:
          queueingErrorMessageRequest.status === 'ok'
            ? queueingErrorMessageRequest.value
            : undefined,
      };
    }

    if (job.status === 'expired') {
      await blastApi.rerunJob(job.queryJobID);
    }

    await waitForNextPoll();

    return {
      status: 'job-pending',
      jobId: job.queryJobID,
    };
  } else {
    return {
      ...jobRequest,
      jobId,
      status: 'request-error',
    };
  }
}

export type ReportJobPollingState =
  | ReportJobPollingInProgress
  | ReportJobPollingSuccess
  | ReportJobPollingError;

interface ReportPollingBase {
  jobId: string;
  reportId?: string;
}

interface ReportJobPollingInProgress extends ReportPollingBase {
  status: 'report-pending';
}

interface ReportJobPollingSuccess extends ReportPollingBase {
  status: 'report-completed' | 'queueing-error';
  report: IOReportJobDetails;
}

interface ReportJobPollingError extends ReportPollingBase {
  status: 'request-error';
  details: ErrorDetails;
}

export async function makeReportPollingPromise(
  blastApi: BlastReportClient,
  queryJobID: string,
  format: IOBlastOutFormat,
  reportId?: string
): Promise<ReportJobPollingState> {
  if (reportId == null) {
    const reportRequest = await blastApi.createJob({
      queryJobID,
      blastConfig: { formatType: format },
      addToUserCollection: true,
    });

    if (reportRequest.status === 'ok') {
      return makeReportPollingPromise(
        blastApi,
        queryJobID,
        format,
        reportRequest.value.reportJobID
      );
    } else {
      return {
        ...reportRequest,
        jobId: queryJobID,
        status: 'request-error',
      };
    }
  }

  const reportRequest = await blastApi.fetchJob(reportId);

  if (reportRequest.status === 'ok') {
    const report = reportRequest.value;

    if (report.status === 'complete' || report.status === 'failed') {
      return {
        status:
          report.status === 'complete' ? 'report-completed' : 'queueing-error',
        jobId: queryJobID,
        report,
      };
    }

    if (report.status === 'expired') {
      await blastApi.rerunJob(report.reportJobID);
    }

    await waitForNextPoll();

    return {
      status: 'report-pending',
      jobId: queryJobID,
      reportId,
    };
  } else {
    return {
      ...reportRequest,
      jobId: queryJobID,
      reportId,
      status: 'request-error',
    };
  }
}

function waitForNextPoll() {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, POLLING_INTERVAL);
  });
}
