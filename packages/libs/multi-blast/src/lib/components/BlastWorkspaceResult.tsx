import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';

import {
  Error as ErrorPage,
  Link,
  Loading,
} from '@veupathdb/wdk-client/lib/Components';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
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
  IoBlastFormat,
  LongJobResponse,
  LongReportResponse,
  MultiQueryReportJson,
  Target,
} from '../utils/ServiceTypes';
import { BlastApi } from '../utils/api';
import { fetchOrganismToFilenameMaps } from '../utils/organisms';
import { reportToParamValues } from '../utils/params';
import { TargetMetadataByDataType } from '../utils/targetTypes';

import { blastWorkspaceCx } from './BlastWorkspace';
import { BlastRequestError } from './BlastRequestError';
import { ResultContainer } from './ResultContainer';

import './BlastWorkspaceResult.scss';

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
      Task.fromPromise(() => blastApi.fetchQuery(props.jobId)).run(
        setQueryResultState
      ),
    [blastApi, props.jobId]
  );

  const [jobResultState, setJobResultState] = useState<JobPollingState>({
    status: 'job-running',
  });

  useEffect(
    () =>
      Task.fromPromise(() => makeJobPollingPromise(blastApi, props.jobId)).run(
        setJobResultState
      ),
    [blastApi, props.jobId]
  );

  const [
    reportResultState,
    setReportResultState,
  ] = useState<ReportPollingState>();

  useEffect(
    () =>
      Task.fromPromise(async () =>
        jobResultState.status !== 'job-completed'
          ? undefined
          : makeReportPollingPromise(
              blastApi,
              jobResultState.job.id,
              'single-file-json'
            )
      ).run(setReportResultState),
    [blastApi, jobResultState]
  );

  const [multiQueryReportState, setMultiQueryReportState] = useState<
    ApiResult<MultiQueryReportJson, ErrorDetails>
  >();

  useEffect(
    () =>
      Task.fromPromise(async () =>
        reportResultState?.status !== 'report-completed'
          ? undefined
          : blastApi.fetchSingleFileJsonReport(
              reportResultState.report.reportID
            )
      ).run(setMultiQueryReportState),
    [blastApi, reportResultState]
  );

  const individualQueriesResult = usePromise(async () => {
    if (jobResultState.status !== 'job-completed') {
      return undefined;
    }

    const childJobIds = jobResultState.job?.childJobs?.map(({ id }) => id);

    const subJobIds =
      childJobIds == null || childJobIds.length === 0
        ? [jobResultState.job.id]
        : childJobIds;

    const queryResults = await Promise.all(
      subJobIds.map((id) =>
        blastApi.fetchQuery(id).then((queryResult) =>
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
  }, [jobResultState]);

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
  ) : individualQueriesResult.value != null &&
    individualQueriesResult.value.status === 'error' ? (
    <BlastRequestError errorDetails={individualQueriesResult.value.details} />
  ) : queryResultState == null ||
    jobResultState.status === 'job-running' ||
    reportResultState == null ||
    individualQueriesResult.value == null ? (
    <LoadingBlastResult {...props} />
  ) : (
    <CompleteBlastResult
      {...props}
      individualQueries={individualQueriesResult.value.value}
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

export type MultiQueryReportResult =
  | ApiResult<MultiQueryReportJson, ErrorDetails>
  | undefined;

interface CompleteBlastResultProps extends Props {
  individualQueries: IndividualQuery[];
  jobDetails: LongJobResponse;
  multiQueryReportResult?: MultiQueryReportResult;
  query: string;
}

function CompleteBlastResult(props: CompleteBlastResultProps) {
  const history = useHistory();

  const targetMetadataByDataType = useContext(TargetMetadataByDataType);

  const queryCount = props.individualQueries.length;

  const targets = props.jobDetails.targets;

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
  jobDetails: LongJobResponse;
  targets: Target[];
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

  const databases = useMemo(() => targets.map(({ target }) => target), [
    targets,
  ]);

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
            {jobDetails.id}
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
          {jobDetails.description != null && (
            <Fragment>
              <span className="InlineHeader">Description:</span>
              <span>{jobDetails.description}</span>
            </Fragment>
          )}
          <span className="InlineHeader">Program:</span>
          <span>
            {jobDetails.config.tool === 'tblastx' ||
            jobDetails.config.task == null
              ? jobDetails.config.tool
              : jobDetails.config.task}
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
          routeBase={`/workspace/blast/result/${jobDetails.id}`}
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
        jobId={jobDetails.id}
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

type JobPollingState =
  | JobPollingInProgress
  | JobPollingSuccess
  | JobPollingQueueingError
  | JobPollingRequestError;

interface JobPollingInProgress {
  status: 'job-running';
}

interface JobPollingSuccess {
  status: 'job-completed';
  job: LongJobResponse;
}

interface JobPollingQueueingError {
  status: 'queueing-error';
  job: LongJobResponse;
  errorMessage?: string;
}

interface JobPollingRequestError {
  status: 'request-error';
  details: ErrorDetails;
}

async function makeJobPollingPromise(
  blastApi: BlastApi,
  jobId: string
): Promise<JobPollingState> {
  const jobRequest = await blastApi.fetchJob(jobId);

  if (jobRequest.status === 'ok') {
    const job = jobRequest.value;

    if (job.status === 'completed') {
      return {
        status: 'job-completed',
        job,
      };
    }

    if (job.status === 'errored') {
      const queueingErrorMessageRequest = await blastApi.fetchJobQueueError(
        job.id
      );

      return {
        status: 'queueing-error',
        job,
        errorMessage:
          queueingErrorMessageRequest.status === 'ok'
            ? queueingErrorMessageRequest.value
            : undefined,
      };
    }

    if (job.status === 'expired') {
      await blastApi.rerunJob(job.id);
    }

    await waitForNextPoll();

    return makeJobPollingPromise(blastApi, jobId);
  } else {
    return {
      ...jobRequest,
      status: 'request-error',
    };
  }
}

type ReportPollingState =
  | ReportPollingInProgress
  | ReportPollingSuccess
  | ReportPollingError;

interface ReportPollingInProgress {
  status: 'report-running';
}

interface ReportPollingSuccess {
  status: 'report-completed' | 'queueing-error';
  report: LongReportResponse;
}

interface ReportPollingError {
  status: 'request-error';
  details: ErrorDetails;
}

export async function makeReportPollingPromise(
  blastApi: BlastApi,
  jobId: string,
  format: IoBlastFormat,
  reportId?: string
): Promise<ReportPollingState> {
  if (reportId == null) {
    const reportRequest = await blastApi.createReport(jobId, {
      format,
    });

    if (reportRequest.status === 'ok') {
      return makeReportPollingPromise(
        blastApi,
        jobId,
        'single-file-json',
        reportRequest.value.reportID
      );
    } else {
      return {
        ...reportRequest,
        status: 'request-error',
      };
    }
  }

  const reportRequest = await blastApi.fetchReport(reportId);

  if (reportRequest.status === 'ok') {
    const report = reportRequest.value;

    if (report.status === 'completed' || report.status === 'errored') {
      return {
        status:
          report.status === 'completed' ? 'report-completed' : 'queueing-error',
        report,
      };
    }

    if (report.status === 'expired') {
      await blastApi.rerunReport(report.reportID);
    }

    await waitForNextPoll();

    return makeReportPollingPromise(
      blastApi,
      jobId,
      'single-file-json',
      report.reportID
    );
  } else {
    return {
      ...reportRequest,
      status: 'request-error',
    };
  }
}

function waitForNextPoll() {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, POLLING_INTERVAL);
  });
}
