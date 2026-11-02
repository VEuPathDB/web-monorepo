import { useCallback, useState } from 'react';

import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';
import { JobResponse, JobStatus } from '../Service/ServiceTypes';
import { useJobPolling } from './useJobPolling';

interface UseJobStatusOptions {
  api: SequenceRetrievalApi;
  /** The job to follow; nothing is fetched while this is undefined. */
  jobId: string | undefined;
}

interface JobState {
  jobId: string;
  status: JobStatus;
  job: Partial<JobResponse>;
}

/**
 * Follows a job's status by polling it until it reaches a terminal state.
 * A job is assumed 'queued' until the first poll says otherwise; `status`
 * is undefined only while there is no job id.
 */
export function useJobStatus({ api, jobId }: UseJobStatusOptions): {
  status: JobStatus | undefined;
  job: Partial<JobResponse>;
} {
  const [state, setState] = useState<JobState>();

  // State left over from a previous job id is ignored rather than cleared.
  const current: JobState | undefined =
    jobId == null
      ? undefined
      : state?.jobId === jobId
      ? state
      : { jobId, status: 'queued', job: {} };

  const onPoll = useCallback(async () => {
    if (jobId == null) return;
    const job = await api.fetchJob(jobId);
    setState({ jobId, status: job.status, job });
  }, [api, jobId]);

  // With no job there is nothing to follow, which polling treats as terminal.
  useJobPolling({ status: current?.status ?? 'complete', onPoll });

  return { status: current?.status, job: current?.job ?? {} };
}
