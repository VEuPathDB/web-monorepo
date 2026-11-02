import { useEffect, useState } from 'react';

// Deep import, not the @veupathdb/wdk-client/lib/Components barrel — see
// ComputeJobPage.
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';

import { JobResponse, JobStatus } from '../Service/ServiceTypes';
import { formatDuration } from '../Utils/formatDuration';

import './ComputeJobPage.scss';

interface JobStatusLineProps {
  status: JobStatus;
  job: Partial<JobResponse>;
  /** The caller's prediction of the run time, shown beside the status. */
  estimatedSeconds?: number;
}

/**
 * Time since `sinceIso`, ticking every second on its own timer so it keeps
 * moving between polls. Compares the browser's clock to the server's
 * timestamp, which is close enough; a clock running behind is clamped to 0.
 */
function Elapsed({ sinceIso }: { sinceIso: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      {formatDuration(Math.floor((now - new Date(sinceIso).getTime()) / 1000))}
    </>
  );
}

/**
 * One line (spinner + text) saying where a not-yet-finished job is: its
 * queue position, or how long it has been queued or running. Renders nothing for a
 * finished job; the caller decides what a result or a failure looks like.
 */
export function JobStatusLine({
  status,
  job,
  estimatedSeconds,
}: JobStatusLineProps) {
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
        <i>
          {' '}
          (Queued for <Elapsed sinceIso={job.created} />)
        </i>
      )}
      {status === 'in-progress' && 'In progress.'}
      {status === 'in-progress' && job.started != null && (
        <i>
          {' '}
          (Running for <Elapsed sinceIso={job.started} />)
        </i>
      )}
      {status === 'in-progress' && estimatedSeconds != null && (
        <i> Estimated: {formatDuration(estimatedSeconds)}</i>
      )}
    </p>
  );
}
