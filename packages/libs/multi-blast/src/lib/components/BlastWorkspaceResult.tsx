import { useMemo } from 'react';

import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';

import { LongJobResponse, MultiQueryReportJson } from '../utils/ServiceTypes';
import { useBlastApi } from '../utils/hooks';

import { blastWorkspaceCx } from './BlastWorkspace';
import { CombinedBlastResult } from './CombinedBlastResult';

import './BlastWorkspaceResult.scss';

interface Props {
  jobId: string;
}

const POLLING_INTERVAL = 3000;

export function BlastWorkspaceResult(props: Props) {
  const api = useBlastApi();

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

  return jobResult.value == null || multiQueryReportResult.value == null ? (
    <LoadingBlastResult {...props} />
  ) : (
    <BlastSummary
      jobDetails={jobResult.value}
      multiQueryReport={multiQueryReportResult.value}
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
  jobDetails: LongJobResponse;
  multiQueryReport: MultiQueryReportJson;
}

function BlastSummary({ jobDetails, multiQueryReport }: BlastSummaryProps) {
  const databases = useMemo(
    () =>
      multiQueryReport.BlastOutput2.map(({ report }) =>
        report.search_target.db.replace(/[\s\S]*\//, '')
      ),
    [multiQueryReport]
  );

  const databasesStr = useMemo(() => databases.join(', '), [databases]);

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
        <span className="InlineHeader">
          {databases.length > 1 ? 'Databases' : 'Database'}:
        </span>
        <span>{databasesStr}</span>
      </div>
      <CombinedBlastResult combinedResult={multiQueryReport} />
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
