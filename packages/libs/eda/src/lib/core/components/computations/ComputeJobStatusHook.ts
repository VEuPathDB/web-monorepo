import { delay } from '@veupathdb/wdk-client/lib/Utils/PromiseUtils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { JobStatusReponse } from '../../api/ComputeClient';
import { useComputeClient, useStudyMetadata } from '../../hooks/workspace';
import { Analysis, NewAnalysis } from '../../types/analysis';
import { Computation } from '../../types/visualization';
import { plugins } from './plugins';

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
  const sharedStatusRef = useRef<JobStatus>();

  // Update jobStatus state and ref
  function setJobStatus(status?: JobStatus) {
    _setJobStatus((sharedStatusRef.current = status));
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
    // Track if effect has been "cancelled"
    let cancelled = false;
    // Clear existing job status
    setJobStatus(undefined);
    // start the loop
    loop();

    return function cleanup() {
      cancelled = true;
    };

    // Fetch the job status and update state
    async function updateJobStatus() {
      if (
        computeName == null ||
        !computePlugin.isConfigurationValid(
          computation.descriptor.configuration
        )
      )
        return;
      const { status } = await computeClient.getJobStatus(computeName, {
        config: computation.descriptor.configuration,
        derivedVariables: analysis.descriptor.derivedVariables,
        filters: analysis.descriptor.subset.descriptor,
        studyId: studyMetadata.id,
      });
      if (!cancelled) setJobStatus(status);
    }

    // Start a loop to check if a job status should be requested every second
    async function loop() {
      while (!cancelled) {
        if (
          sharedStatusRef.current == null ||
          !isTerminalStatus(sharedStatusRef.current)
        ) {
          await updateJobStatus();
        }
        await delay(1000);
      }
    }
  }, [
    analysis.descriptor.derivedVariables,
    analysis.descriptor.subset.descriptor,
    computation.descriptor.configuration,
    computeClient,
    computeName,
    studyMetadata.id,
  ]);

  const createJob = useCallback(async () => {
    if (
      computeName == null ||
      !computePlugin.isConfigurationValid(computation.descriptor.configuration)
    )
      return;
    setJobStatus('requesting');
    const { status } = await computeClient.createJob(computeName, {
      config: computation.descriptor.configuration,
      derivedVariables: analysis.descriptor.derivedVariables,
      filters: analysis.descriptor.subset.descriptor,
      studyId: studyMetadata.id,
    });
    setJobStatus(status);
  }, [
    analysis.descriptor.derivedVariables,
    analysis.descriptor.subset.descriptor,
    computation.descriptor.configuration,
    computeName,
    computeClient,
    studyMetadata.id,
  ]);

  return { jobStatus, createJob };
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
