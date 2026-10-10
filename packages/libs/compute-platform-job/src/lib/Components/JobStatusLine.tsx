// Deep import, not the @veupathdb/wdk-client/lib/Components barrel — see
// ComputeJobPage.
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';

import { JobResponse, JobStatus } from '../Service/ServiceTypes';

import './ComputeJobPage.scss';

interface JobStatusLineProps {
  status: JobStatus;
  job: Partial<JobResponse>;
}

function formatLocalTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString();
}

/**
 * One line (spinner + text) saying where a not-yet-finished job is: its
 * queue position, or when it started running. Renders nothing for a
 * finished job; the caller decides what a result or a failure looks like.
 */
export function JobStatusLine({ status, job }: JobStatusLineProps) {
  if (status !== 'queued' && status !== 'in-progress') return null;

  return (
    <p className="Status">
      <Icon
        className="ComputeJobPage-StatusIcon"
        fa="circle-o-notch"
        style={{ marginRight: '0.3em' }}
      />
      {status === 'queued' &&
        (job.queuePosition != null
          ? `Position ${job.queuePosition} in queue.`
          : 'Queued.')}
      {status === 'queued' && job.created != null && (
        <i> (Queued at {formatLocalTime(job.created)})</i>
      )}
      {status === 'in-progress' && 'In progress.'}
      {status === 'in-progress' && job.started != null && (
        <i>(Started running at {formatLocalTime(job.started)})</i>
      )}
    </p>
  );
}
