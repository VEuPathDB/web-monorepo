import { delay } from '@veupathdb/wdk-client/lib/Utils/PromiseUtils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isEqual, omit } from 'lodash';
import { JobStatusReponse } from '../../api/ComputeClient';
import { useComputeClient, useStudyMetadata } from '../../hooks/workspace';
import { Analysis, NewAnalysis } from '../../types/analysis';
import { plugins } from './plugins';
import { Computation } from '../../types/visualization';

export type JobStatus = JobStatusReponse['status'] | 'requesting';

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

  // Use a state variable to track current dependencies
  const [jobStatusDeps, setJobStatusDeps] = useState(nextJobStatusDeps);

  // Conditonally update jobStatusDeps and clear current jobStatus if deps
  // changed. This keeps the job status in sync with the current deps.
  // See https://beta.reactjs.org/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  // for motivation.
  if (!isEqual(jobStatusDeps, nextJobStatusDeps)) {
    setJobStatusDeps(nextJobStatusDeps);
    setJobStatus(undefined);
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
  useEffect(() => {
    if (
      !jobStatusDeps.computeName ||
      !computePlugin.isConfigurationComplete(jobStatusDeps.config)
    )
      return;
    // Track if effect has been "cancelled"
    let cancelled = false;
    // start the loop
    loop();

    return function cleanup() {
      cancelled = true;
    };

    // Fetch the job status and update state
    async function updateJobStatus() {
      if (jobStatusDeps.computeName == null) return;
      const { status } = await computeClient.getJobStatus(
        jobStatusDeps.computeName,
        omit(jobStatusDeps, 'computeName')
      );
      if (!cancelled) setJobStatus(status);
    }

    // Start a loop to check if a job status should be requested every second
    async function loop() {
      while (!cancelled) {
        if (
          sharedJobStatusRef.current == null ||
          !isTerminalStatus(sharedJobStatusRef.current)
        ) {
          await updateJobStatus();
        }
        await delay(1000);
      }
    }
  }, [computeClient, computePlugin, jobStatusDeps]);

  const createJob = useCallback(async () => {
    if (!computePlugin.isConfigurationComplete(jobStatusDeps.config)) return;
    setJobStatus('requesting');
    if (jobStatusDeps.computeName == null) return;
    const { status } = await computeClient.createJob(
      jobStatusDeps.computeName,
      omit(jobStatusDeps, 'computeName')
    );
    setJobStatus(status);
  }, [computePlugin, computeClient, jobStatusDeps]);

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
