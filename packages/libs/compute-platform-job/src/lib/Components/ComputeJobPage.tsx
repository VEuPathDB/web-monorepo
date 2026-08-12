import { useCallback, useEffect, useState } from 'react';

import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';
import { JobStatus } from '../Service/ServiceTypes';
import { useJobPolling } from '../Hooks/useJobPolling';

interface ComputeJobPageProps {
  jobId: string;
  api: SequenceRetrievalApi;
  paramsSummary?: string;
}

export function ComputeJobPage({
  jobId,
  api,
  paramsSummary,
}: ComputeJobPageProps) {
  const [status, setStatus] = useState<JobStatus>('queued');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [guideTreeContent, setGuideTreeContent] = useState<string | null>(null);

  const onPoll = useCallback(async () => {
    const job = await api.fetchJob(jobId);
    setStatus(job.status);
  }, [api, jobId]);

  useJobPolling({ status, onPoll });

  useEffect(() => {
    if (status !== 'complete') return;
    let cancelled = false;
    (async () => {
      const files = await api.fetchJobFiles(jobId);
      const output = await api.fetchJobFile(jobId, 'output');
      if (cancelled) return;
      setFileContent(output);
      if (files.includes('guidetree.dnd')) {
        const guideTree = await api.fetchJobFile(jobId, 'guidetree.dnd');
        if (!cancelled) setGuideTreeContent(guideTree);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, api, jobId]);

  return (
    <div className="ComputeJobPage">
      <h1>Running Compute Job</h1>
      {paramsSummary && <p className="ParamsSummary">{paramsSummary}</p>}
      {status === 'queued' || status === 'in-progress' ? (
        <p className="Status">Status: {status}</p>
      ) : null}
      {status === 'complete' && fileContent != null && (
        <div className="Result">
          <pre>{fileContent}</pre>
          {guideTreeContent != null && (
            <details>
              <summary>Guide tree</summary>
              <pre>{guideTreeContent}</pre>
            </details>
          )}
        </div>
      )}
      {status === 'failed' && (
        <p className="DeadEnd">
          This job failed. Please go back and resubmit your request.
        </p>
      )}
      {status === 'expired' && (
        <p className="DeadEnd">
          This job has expired. Please go back and resubmit your request.
        </p>
      )}
    </div>
  );
}
