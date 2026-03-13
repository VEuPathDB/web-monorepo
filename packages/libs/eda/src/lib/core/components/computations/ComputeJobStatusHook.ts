import { delay } from '@veupathdb/wdk-client/lib/Utils/PromiseUtils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isEqual, omit } from 'lodash';
import { JobStatusReponse } from '../../api/ComputeClient';
import { useComputeClient, useStudyMetadata } from '../../hooks/workspace';
import { Analysis, NewAnalysis } from '../../types/analysis';
import { plugins } from './plugins';
import { Computation } from '../../types/visualization';
import { useDebounce } from '../../hooks/debouncing';
import { useDeepValue } from '../../hooks/immutability';

export type JobStatus = JobStatusReponse['status'] | 'requesting';

const MAX_RETRIES = 3;

/**
 * Polls the compute service for the status of a compute's job.
 */
export function useComputeJobStatus(
  analysis: Analysis | NewAnalysis,
  computation: Computation,
  computeName?: string
) {
  const computeClient = useComputeClient();
  const studyMetadata = useStudyMetadata();
  const computePlugin = plugins[computation.descriptor.type];

  // Status that is exposed to hook consumer
  const [jobStatus, _setJobStatus] = useState<JobStatus>();

  // Mutable ref used to shadow jobStatus state value.
  // This is used in the loop function below, to avoid
  // using it as a useEffect dependency
  const sharedJobStatusRef = useRef<JobStatus>();

  // When stable deps diverge from debounced deps we are in the debounce window.
  // This ref lets the still-running loop break out instead of polling with stale
  // deps, while allowing consumers to see undefined status immediately.
  const depsStaleRef = useRef(false);

  // Update jobStatus state and ref
  function setJobStatus(status?: JobStatus) {
    _setJobStatus((sharedJobStatusRef.current = status));
  }

  // Gather dependencies needed for requesting the job status
  const nextJobStatusDeps = {
    config: computation.descriptor.configuration,
    derivedVariables: analysis.descriptor.derivedVariables,
    filters: analysis.descriptor.subset.descriptor,
    studyId: studyMetadata.id,
    computeName,
  };

  // Stabilise deps so useDebounce only reacts to genuine deep changes.
  const stableJobStatusDeps = useDeepValue(nextJobStatusDeps);
  const debouncedJobStatusDeps = useDebounce(stableJobStatusDeps, 2000);

  // While the debounce is in flight, clear jobStatus immediately so consumers
  // don't act on a stale "complete" status with new filter/config values.
  // The depsStaleRef prevents the still-running loop from polling with stale deps.
  if (!isEqual(stableJobStatusDeps, debouncedJobStatusDeps)) {
    if (!depsStaleRef.current) {
      depsStaleRef.current = true;
      setJobStatus(undefined);
    }
  }

  // The callback passed to this useEffect will start a loop that will request
  // the status of a compute job. The loop will continue to run until either
  // its dependencies change, or the consuming component is unmounted.
  //
  // A new job status is requested only if the current job status is not a
  // terminal status (see `isTerminalStatus` function).
  //
  // A mutable ref is used for checking the job status so that the `useState`
  // `jobStatus` variable does not need to be included as a dependency.
  //
  // Transient errors (e.g. backend 500s) are retried up to MAX_RETRIES times
  // with exponential backoff before the error is rethrown to the caller.
  useEffect(() => {
    if (
      !debouncedJobStatusDeps.computeName ||
      !computePlugin.isConfigurationComplete(debouncedJobStatusDeps.config)
    )
      return;
    // Debounced deps have settled — mark as no longer stale and start fresh.
    depsStaleRef.current = false;
    setJobStatus(undefined);
    // Track if effect has been "cancelled"
    let cancelled = false;
    // start the loop
    loop();

    return function cleanup() {
      cancelled = true;
    };

    // Fetch the job status and update state
    async function updateJobStatus() {
      if (debouncedJobStatusDeps.computeName == null) return;
      const { status } = await computeClient.getJobStatus(
        debouncedJobStatusDeps.computeName,
        omit(debouncedJobStatusDeps, 'computeName')
      );
      if (!cancelled) setJobStatus(status);
    }

    // Start a loop to check if a job status should be requested every second.
    // Consecutive errors are retried with exponential backoff; after
    // MAX_RETRIES failures the error is rethrown so React's error boundary
    // can surface it to the user.
    async function loop() {
      let consecutiveErrors = 0;
      while (!cancelled) {
        // Break out if deps have changed since this loop started; the next
        // effect invocation will start a fresh loop with the correct deps.
        if (depsStaleRef.current) break;
        if (
          sharedJobStatusRef.current == null ||
          !isTerminalStatus(sharedJobStatusRef.current)
        ) {
          try {
            await updateJobStatus();
            consecutiveErrors = 0;
          } catch (e) {
            consecutiveErrors++;
            if (consecutiveErrors >= MAX_RETRIES) throw e;
            // Exponential backoff: 1 s, 2 s, 4 s, …
            await delay(1000 * Math.pow(2, consecutiveErrors - 1));
            continue;
          }
        }
        await delay(1000);
      }
    }
  }, [computeClient, computePlugin, debouncedJobStatusDeps]);

  const createJob = useCallback(async () => {
    if (!computePlugin.isConfigurationComplete(debouncedJobStatusDeps.config))
      return;
    setJobStatus('requesting');
    if (debouncedJobStatusDeps.computeName == null) return;
    const { status } = await computeClient.createJob(
      debouncedJobStatusDeps.computeName,
      omit(debouncedJobStatusDeps, 'computeName')
    );
    setJobStatus(status);
  }, [computePlugin, computeClient, debouncedJobStatusDeps]);

  return { computation, jobStatus, createJob };
}

/**
 * Check if a status terminal
 */
export function isTerminalStatus(status: JobStatus) {
  switch (status) {
    case 'complete':
    case 'expired':
    case 'failed':
    case 'no-such-job':
    case 'requesting':
      return true;
    default:
      return false;
  }
}
