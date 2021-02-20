import { Fragment, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';

import { uniq } from 'lodash';

import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { useBlastApi } from '../hooks/api';
import {
  useHitTypeDisplayNames,
  useWdkRecordType,
} from '../hooks/combinedResults';
import { LongJobResponse, MultiQueryReportJson } from '../utils/ServiceTypes';
import { dbToTargetName } from '../utils/combinedResults';
import { fetchOrganismToFilenameMaps } from '../utils/organisms';
import { reportToParamValues } from '../utils/params';

import { blastWorkspaceCx } from './BlastWorkspace';
import { ResultContainer } from './ResultContainer';

import './BlastWorkspaceResult.scss';

interface Props {
  jobId: string;
  selectedResult?: SelectedResult;
}

export type SelectedResult =
  | { type: 'combined' }
  | { type: 'individual'; resultIndex: number };

const POLLING_INTERVAL = 3000;

export function BlastWorkspaceResult(props: Props) {
  const history = useHistory();

  const api = useBlastApi();

  const organismToFilenameMapsResult = useWdkService(
    (wdkService) => fetchOrganismToFilenameMaps(wdkService),
    []
  );

  const queryResult = usePromise(() => api.fetchQuery(props.jobId), [
    api,
    props.jobId,
  ]);

  const jobResult = usePromise(() => makeJobPollingPromise(api, props.jobId), [
    api,
    props.jobId,
  ]);

  const multiQueryReportResult = usePromise(
    async () =>
      jobResult.value?.status !== 'completed'
        ? undefined
        : api.fetchSingleFileJsonReport(jobResult.value.id),
    [api, jobResult.value?.status]
  );

  const queryCount = useMemo(() => {
    if (multiQueryReportResult.value == null) {
      return undefined;
    }

    const queryIds = multiQueryReportResult.value.BlastOutput2.map(
      ({ report }) => report.results.search.query_id
    );

    return uniq(queryIds).length;
  }, [multiQueryReportResult]);

  useEffect(() => {
    if (queryCount != null && props.selectedResult == null) {
      const selectedResultPath = queryCount > 1 ? '/combined' : '/individual/1';

      history.replace(
        `/workspace/blast/result/${props.jobId}${selectedResultPath}`
      );
    }
  }, [history, props.jobId, queryCount, props.selectedResult]);

  return props.selectedResult == null ||
    queryCount == null ||
    organismToFilenameMapsResult == null ||
    queryResult.value == null ||
    jobResult.value == null ||
    multiQueryReportResult.value == null ? (
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
      jobDetails={jobResult.value}
      multiQueryReport={multiQueryReportResult.value}
      query={queryResult.value}
      queryCount={queryCount}
      selectedResult={props.selectedResult}
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
}

function BlastSummary({
  filesToOrganisms,
  jobDetails,
  multiQueryReport,
  query,
  queryCount,
  selectedResult,
}: BlastSummaryProps) {
  const databases = useMemo(() => {
    const databasesEntries = multiQueryReport.BlastOutput2.flatMap(
      ({ report }) => report.search_target.db.split(' ').map(dbToTargetName)
    );

    return uniq(databasesEntries);
  }, [multiQueryReport]);

  const databasesStr = useMemo(() => databases.join(', '), [databases]);

  const wdkRecordType = useWdkRecordType(multiQueryReport);

  const {
    hitTypeDisplayName,
    hitTypeDisplayNamePlural,
  } = useHitTypeDisplayNames(wdkRecordType);

  const multiQueryParamValues = useMemo(
    () => reportToParamValues(jobDetails, query, databases, filesToOrganisms),
    [databases, filesToOrganisms, jobDetails, query]
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
                  ? 1
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
        wdkRecordType={wdkRecordType}
      />
    </div>
  );
}

async function makeJobPollingPromise(
  api: ReturnType<typeof useBlastApi>,
  jobId: string
): Promise<LongJobResponse> {
  const job = await api.fetchJob(jobId);

  if (job.status === 'completed' || job.status === 'errored') {
    return job;
  }

  await waitForNextPoll();

  return makeJobPollingPromise(api, jobId);
}

function waitForNextPoll() {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, POLLING_INTERVAL);
  });
}
