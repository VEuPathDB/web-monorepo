import { useCallback, useEffect, useRef, useState } from 'react';
import { JobStatusReponse } from '../../api/ComputeClient';
import { useComputeClient, useStudyMetadata } from '../../hooks/workspace';
import { Analysis, NewAnalysis } from '../../types/analysis';
import { Computation } from '../../types/visualization';

type JobStatus = JobStatusReponse['status'];

/**
 * Polls the compute service for the status of a compute's job
 */
export function useComputeJobStatus(
  analysis: Analysis | NewAnalysis,
  computation: Computation,
  computeName?: string
) {
  const [jobStatus, setJobStatus] = useState<JobStatus>();
  const computeClient = useComputeClient();
  const studyMetadata = useStudyMetadata();
  const sharedStatusRef = useRef<JobStatus>();

  useEffect(() => {
    let timerId: number;
    let cancelled = false;
    setJobStatus((sharedStatusRef.current = undefined));

    async function getJobStatus() {
      if (computeName == null) return;
      if (
        sharedStatusRef.current == null ||
        !isTerminalStatus(sharedStatusRef.current)
      ) {
        const { status } = await computeClient.getJobStatus(computeName, {
          config: fixConfig(computation.descriptor.configuration),
          derivedVariables: analysis.descriptor.derivedVariables,
          filters: analysis.descriptor.subset.descriptor,
          studyId: studyMetadata.id,
        });
        if (!cancelled) setJobStatus((sharedStatusRef.current = status));
      }
      if (!cancelled) setTimeout(getJobStatus, 1000);
    }

    getJobStatus();

    return () => {
      clearTimeout(timerId);
      cancelled = true;
    };
  }, [
    analysis.descriptor.derivedVariables,
    analysis.descriptor.subset.descriptor,
    computation.descriptor.configuration,
    computeClient,
    computeName,
    studyMetadata.id,
  ]);

  const createJob = useCallback(async () => {
    if (computeName == null) return;
    const { status } = await computeClient.createJob(computeName, {
      config: fixConfig(computation.descriptor.configuration),
      derivedVariables: analysis.descriptor.derivedVariables,
      filters: analysis.descriptor.subset.descriptor,
      studyId: studyMetadata.id,
    });
    setJobStatus((sharedStatusRef.current = status));
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

function fixConfig(config: any) {
  const { name, ...rest } = config;
  return rest;
}

/**
 * Check if a status terminal
 * @param status
 * @returns
 */
function isTerminalStatus(status: JobStatus) {
  switch (status) {
    // case 'no-such-job':
    case 'in-progress':
    case 'queued':
      return false;
  }
  return true;
}
