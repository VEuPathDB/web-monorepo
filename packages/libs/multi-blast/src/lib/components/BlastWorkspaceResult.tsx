import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';

import { uniq } from 'lodash';

import { IconAlt, Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { UnderConstruction } from './BlastWorkspace';
import { useBlastApi } from '../hooks/api';
import {
  useHitTypeDisplayName,
  useWdkRecordType,
} from '../hooks/combinedResults';
import { LongJobResponse, MultiQueryReportJson } from '../utils/ServiceTypes';
import { dbToTargetName } from '../utils/combinedResults';
import { fetchOrganismToFilenameMaps } from '../utils/organisms';

import { blastWorkspaceCx } from './BlastWorkspace';
import { CombinedBlastResult } from './CombinedBlastResult';

import './BlastWorkspaceResult.scss';

interface Props {
  jobId: string;
  subPath?: string;
}

type SelectedResult =
  | { type: 'combined' }
  | { type: 'individual'; resultIndex: number };

const POLLING_INTERVAL = 3000;

export function BlastWorkspaceResult(props: Props) {
  const history = useHistory();

  const selectedResult = useMemo(
    () =>
      props.subPath == null || props.subPath === ''
        ? undefined
        : ((props.subPath === 'combined'
            ? { type: 'combined' }
            : { type: 'individual', individualIndex: 1 }) as SelectedResult),
    [props.subPath]
  );

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
    if (queryCount != null && selectedResult == null) {
      const selectedResultPath = queryCount > 1 ? '/combined' : '/invididual/1';

      history.push(
        `/workspace/blast/result/${props.jobId}${selectedResultPath}`
      );
    }
  }, [history, props.jobId, queryCount, selectedResult]);

  return selectedResult == null ||
    queryCount == null ||
    organismToFilenameMapsResult == null ||
    queryResult.value == null ||
    jobResult.value == null ||
    multiQueryReportResult.value == null ? (
    <LoadingBlastResult {...props} />
  ) : (
    <BlastSummary
      filesToOrganisms={organismToFilenameMapsResult.filesToOrganisms}
      jobDetails={jobResult.value}
      multiQueryReport={multiQueryReportResult.value}
      query={queryResult.value}
      queryCount={queryCount}
      selectedResult={selectedResult}
    />
  );
}

function LoadingBlastResult(props: Props) {
  return (
    <div className={blastWorkspaceCx('Result', 'Loading')}>
      <h1>BLAST Job - pending</h1>
      <p className="JobId">
        <span className="InlineHeader">Job:</span> {props.jobId}
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

  const hitTypeDisplayName = useHitTypeDisplayName(wdkRecordType);

  return (
    <div className={blastWorkspaceCx('Result', 'Complete')}>
      <h1>BLAST Job - result</h1>
      <Link className="BackToAllJobs" to="/workspace/blast/all">
        &lt;&lt; All my BLAST Jobs
      </Link>
      <div className="ConfigDetails">
        <span className="InlineHeader">Job:</span>
        <span>{jobDetails.id}</span>
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
        <span className="InlineHeader">
          Query {queryCount === 1 ? 'Sequence' : 'Sequences'}:
        </span>
        <Query query={query} />
      </div>
      {queryCount > 1 && (
        <WorkspaceNavigation
          heading={null}
          routeBase={`/workspace/blast/result/${jobDetails.id}`}
          items={[
            {
              display: 'Combined',
              route: '/combined',
            },
            {
              display: (
                <>
                  <span className="QueryCount">{queryCount}</span> Individual
                  Results
                </>
              ),
              route: '/individual/1',
            },
          ]}
        />
      )}
      {selectedResult.type === 'combined' ? (
        <CombinedBlastResult
          combinedResult={multiQueryReport}
          filesToOrganisms={filesToOrganisms}
          hitTypeDisplayName={hitTypeDisplayName}
          wdkRecordType={wdkRecordType}
        />
      ) : (
        <UnderConstruction />
      )}
    </div>
  );
}

interface QueryProps {
  query: string;
}

function Query({ query }: QueryProps) {
  const lines = useMemo(() => query.split(/\r\n|\r|\n/), [query]);

  const [readMoreState, setReadMoreState] = useState<ReadMoreState>(
    initialReadMoreState(lines.length)
  );

  useEffect(() => {
    setReadMoreState(initialReadMoreState(lines.length));
  }, [lines]);

  const linesToDisplay = useMemo(
    () => (readMoreState !== 'collapsed' ? lines : lines.slice(0, 2)),
    [lines, readMoreState]
  );

  const toggleExpanded = useCallback(() => {
    if (readMoreState !== 'not-offered') {
      setReadMoreState(
        readMoreState === 'collapsed' ? 'expanded' : 'collapsed'
      );
    }
  }, [readMoreState]);

  return (
    <span className="QueryContainer">
      <div className="Query">
        {linesToDisplay.map((line, i) => (
          <Fragment key={i}>
            {line}
            {i < linesToDisplay.length - 1 && <br />}
          </Fragment>
        ))}
      </div>
      {readMoreState !== 'not-offered' && (
        <ReadMoreButton
          expanded={readMoreState === 'expanded'}
          onClick={toggleExpanded}
        />
      )}
    </span>
  );
}

type ReadMoreState = 'not-offered' | 'expanded' | 'collapsed';

function initialReadMoreState(nLines: number) {
  return nLines <= 2 ? 'not-offered' : 'collapsed';
}

interface ReadMoreButtonProps {
  expanded: boolean;
  onClick: () => void;
}

function ReadMoreButton({ expanded, onClick }: ReadMoreButtonProps) {
  return (
    <button onClick={onClick} type="button" className="ReadMore link">
      <IconAlt fa={expanded ? 'chevron-up' : 'chevron-down'} />{' '}
      {expanded ? 'Show Less' : 'Show More'}
    </button>
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
