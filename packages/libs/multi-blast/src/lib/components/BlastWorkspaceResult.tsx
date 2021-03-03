import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';

import { uniq } from 'lodash';

import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import {
  useHitTypeDisplayNames,
  useTargetTypeTermAndWdkRecordType,
} from '../hooks/combinedResults';
import { useBlastCompatibleWdkService } from '../hooks/wdkServiceIntegration';
import {
  ErrorDetails,
  LongJobResponse,
  MultiQueryReportJson,
} from '../utils/ServiceTypes';
import { BlastApi } from '../utils/api';
import { dbToTargetName } from '../utils/combinedResults';
import { fetchOrganismToFilenameMaps } from '../utils/organisms';
import { reportToParamValues } from '../utils/params';
import { TargetMetadataByDataType } from '../utils/targetTypes';

import { blastWorkspaceCx } from './BlastWorkspace';
import { BlastRequestError } from './BlastRequestError';
import { ResultContainer } from './ResultContainer';
import { withBlastApi } from './withBlastApi';

import './BlastWorkspaceResult.scss';

interface Props {
  jobId: string;
  selectedResult?: SelectedResult;
}

export type SelectedResult =
  | { type: 'combined' }
  | { type: 'individual'; resultIndex: number };

const POLLING_INTERVAL = 3000;

export const BlastWorkspaceResult = withBlastApi(
  BlastWorkspaceResultWithLoadedApi
);

interface BlastResultWithLoadedApiProps extends Props {
  blastApi: BlastApi;
}

function BlastWorkspaceResultWithLoadedApi(
  props: BlastResultWithLoadedApiProps
) {
  useSetDocumentTitle(`BLAST Job ${props.jobId}`);

  const history = useHistory();

  const targetMetadataByDataType = useContext(TargetMetadataByDataType);

  const queryResult = usePromise(() => props.blastApi.fetchQuery(props.jobId), [
    props.blastApi,
    props.jobId,
  ]);

  const jobResult = usePromise(
    () => makeJobPollingPromise(props.blastApi, props.jobId),
    [props.blastApi, props.jobId]
  );

  const multiQueryReportResult = usePromise(
    async () =>
      jobResult.value?.status !== 'job-completed'
        ? undefined
        : props.blastApi.fetchSingleFileJsonReport(jobResult.value.job.id),
    [props.blastApi, jobResult.value?.status]
  );

  const queryCount = useMemo(() => {
    if (multiQueryReportResult.value == null) {
      return undefined;
    }

    if (multiQueryReportResult.value.status === 'ok') {
      const queryIds = multiQueryReportResult.value.value.BlastOutput2.map(
        ({ report }) => report.results.search.query_id
      );

      return uniq(queryIds).length;
    }
  }, [multiQueryReportResult]);

  const { targetTypeTerm, wdkRecordType } = useTargetTypeTermAndWdkRecordType(
    multiQueryReportResult.value == null ||
      multiQueryReportResult.value.status === 'error'
      ? undefined
      : multiQueryReportResult.value.value
  );

  const organismToFilenameMapsResult = useBlastCompatibleWdkService(
    async (wdkService) =>
      targetTypeTerm == null
        ? undefined
        : fetchOrganismToFilenameMaps(
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

  // FIXME: Handling the case where the job fails due to a 'queueing-error'
  return jobResult.value != null &&
    jobResult.value.status === 'request-error' ? (
    <BlastRequestError errorDetails={jobResult.value.details} />
  ) : queryResult.value != null && queryResult.value.status === 'error' ? (
    <BlastRequestError errorDetails={queryResult.value.details} />
  ) : multiQueryReportResult.value != null &&
    multiQueryReportResult.value.status === 'error' ? (
    <BlastRequestError errorDetails={multiQueryReportResult.value.details} />
  ) : props.selectedResult == null ||
    queryCount == null ||
    organismToFilenameMapsResult == null ||
    queryResult.value == null ||
    jobResult.value == null ||
    multiQueryReportResult.value == null ||
    targetTypeTerm == null ||
    wdkRecordType == null ? (
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
      jobDetails={jobResult.value.job}
      multiQueryReport={multiQueryReportResult.value.value}
      query={queryResult.value.value}
      queryCount={queryCount}
      selectedResult={props.selectedResult}
      targetTypeTerm={targetTypeTerm}
      wdkRecordType={wdkRecordType}
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

interface BlastSummaryProps {
  filesToOrganisms: Record<string, string>;
  jobDetails: LongJobResponse;
  multiQueryReport: MultiQueryReportJson;
  query: string;
  queryCount: number;
  selectedResult: SelectedResult;
  targetTypeTerm: string;
  wdkRecordType: string;
}

function BlastSummary({
  filesToOrganisms,
  jobDetails,
  multiQueryReport,
  query,
  queryCount,
  selectedResult,
  targetTypeTerm,
  wdkRecordType,
}: BlastSummaryProps) {
  const databases = useMemo(() => {
    const databasesEntries = multiQueryReport.BlastOutput2.flatMap(
      ({ report }) => report.search_target.db.split(' ').map(dbToTargetName)
    );

    return uniq(databasesEntries);
  }, [multiQueryReport]);

  const databasesStr = useMemo(() => databases.join(', '), [databases]);

  const {
    hitTypeDisplayName,
    hitTypeDisplayNamePlural,
  } = useHitTypeDisplayNames(wdkRecordType);

  const multiQueryParamValues = useMemo(
    () =>
      reportToParamValues(
        jobDetails,
        query,
        targetTypeTerm,
        databases,
        filesToOrganisms
      ),
    [databases, filesToOrganisms, jobDetails, targetTypeTerm, query]
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
                  state: multiQueryParamValues,
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
        combinedResult={multiQueryReport}
        filesToOrganisms={filesToOrganisms}
        hitTypeDisplayName={hitTypeDisplayName}
        hitTypeDisplayNamePlural={hitTypeDisplayNamePlural}
        jobId={jobDetails.id}
        lastSelectedIndividualResult={lastSelectedIndividualResult}
        multiQueryParamValues={multiQueryParamValues}
        selectedResult={selectedResult}
        targetTypeTerm={targetTypeTerm}
        wdkRecordType={wdkRecordType}
      />
    </div>
  );
}

type JobPollingResult = JobPollingSuccess | JobPollingError;

interface JobPollingSuccess {
  status: 'job-completed' | 'queueing-error';
  job: LongJobResponse;
}

interface JobPollingError {
  status: 'request-error';
  details: ErrorDetails;
}

async function makeJobPollingPromise(
  blastApi: BlastApi,
  jobId: string
): Promise<JobPollingResult> {
  const jobRequest = await blastApi.fetchJob(jobId);

  if (jobRequest.status === 'ok') {
    const job = jobRequest.value;

    if (job.status === 'completed' || job.status === 'errored') {
      return {
        status: job.status === 'completed' ? 'job-completed' : 'queueing-error',
        job,
      };
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

function waitForNextPoll() {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, POLLING_INTERVAL);
  });
}
