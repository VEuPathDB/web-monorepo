import { useCallback, useEffect, useRef, useState } from 'react';
import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi';
import {
  JobResponse,
  JobStatus,
  SequenceType,
  SubmitJobRequest,
} from '@veupathdb/compute-platform-job/src/lib/Service/ServiceTypes';
import { useJobStatus } from '@veupathdb/compute-platform-job/src/lib/Hooks/useJobStatus';

type Submission =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'submitted'; jobId: string }
  | { kind: 'failed'; message: string };

interface JobOutput {
  jobId: string;
  newick?: string;
  error?: string;
}

export type GeneTreeJobPhase =
  | 'idle'
  | 'submitting'
  | 'running'
  | 'done'
  | 'error';

export interface GeneTreeJob {
  phase: GeneTreeJobPhase;
  /** While running: where the job is. */
  status: JobStatus | undefined;
  job: Partial<JobResponse>;
  newick: string | undefined;
  /** When phase is 'error': what went wrong. */
  error: string | undefined;
  /** Submits a new job, discarding whatever the previous one produced. */
  start: (request: SubmitJobRequest) => void;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Runs one gene-tree job at a time: submits it, follows its status until it
 * finishes, and fetches the resulting newick. Status lives only in this
 * hook's state, so it is gone when the component unmounts.
 */
export function useGeneTreeJob(
  api: SequenceRetrievalApi,
  sequenceType: SequenceType
): GeneTreeJob {
  const [submission, setSubmission] = useState<Submission>({ kind: 'idle' });
  const [output, setOutput] = useState<JobOutput>();
  // Lets a slow submission from an earlier start() be ignored.
  const latestStart = useRef(0);

  const jobId = submission.kind === 'submitted' ? submission.jobId : undefined;
  const { status, job } = useJobStatus({ api, jobId });

  const start = useCallback(
    (request: SubmitJobRequest) => {
      const thisStart = ++latestStart.current;
      setOutput(undefined);
      setSubmission({ kind: 'submitting' });
      api.submitJob(sequenceType, request).then(
        (submitted) =>
          thisStart === latestStart.current &&
          setSubmission({ kind: 'submitted', jobId: submitted.jobID }),
        (error) =>
          thisStart === latestStart.current &&
          setSubmission({ kind: 'failed', message: messageOf(error) })
      );
    },
    [api, sequenceType]
  );

  useEffect(() => {
    if (jobId == null || status !== 'complete') return;
    let cancelled = false;
    api.fetchJobFile(jobId, 'output').then(
      (newick) => !cancelled && setOutput({ jobId, newick }),
      (error) => !cancelled && setOutput({ jobId, error: messageOf(error) })
    );
    return () => {
      cancelled = true;
    };
  }, [api, jobId, status]);

  const thisJobsOutput = output?.jobId === jobId ? output : undefined;

  const { phase, error }: { phase: GeneTreeJobPhase; error?: string } =
    submission.kind === 'idle'
      ? { phase: 'idle' }
      : submission.kind === 'submitting'
      ? { phase: 'submitting' }
      : submission.kind === 'failed'
      ? { phase: 'error', error: submission.message }
      : status === 'failed' || status === 'expired'
      ? { phase: 'error', error: `The tree job ${status}.` }
      : thisJobsOutput?.error != null
      ? { phase: 'error', error: thisJobsOutput.error }
      : thisJobsOutput?.newick != null
      ? { phase: 'done' }
      : { phase: 'running' };

  return {
    phase,
    status,
    job,
    newick: thisJobsOutput?.newick,
    error,
    start,
  };
}
