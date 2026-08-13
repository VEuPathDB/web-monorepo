import { useCallback, useEffect, useState } from 'react';

import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';
import { JobStatus } from '../Service/ServiceTypes';
import { useJobPolling } from '../Hooks/useJobPolling';

interface ComputeJobPageProps {
  jobId: string;
  api: SequenceRetrievalApi;
  paramsSummary?: string;
  /** The MsaFormat value the job was submitted with, e.g. 'clustal_dnd'. */
  format?: string;
}

// The /files/{name} endpoint always returns Content-Type: text/plain
// regardless of the actual content, so an HTML-producing format (only
// clustal_dnd today) needs its real MIME type set client-side via a Blob —
// otherwise the browser renders/downloads it as plain text instead of HTML.
const HTML_MSA_FORMATS = new Set(['clustal_dnd']);

function getResultMimeType(format: string | undefined): string {
  return format != null && HTML_MSA_FORMATS.has(format)
    ? 'text/html'
    : 'text/plain';
}

export function ComputeJobPage({
  jobId,
  api,
  paramsSummary,
  format,
}: ComputeJobPageProps) {
  const [status, setStatus] = useState<JobStatus>('queued');

  const onPoll = useCallback(async () => {
    const job = await api.fetchJob(jobId);
    setStatus(job.status);
  }, [api, jobId]);

  useJobPolling({ status, onPoll });

  useEffect(() => {
    if (status !== 'complete') return;
    let cancelled = false;
    (async () => {
      const output = await api.fetchJobFile(jobId, 'output');
      if (cancelled) return;
      // The 'output' file is already the complete document for every
      // format — for clustal_dnd it includes the guide tree as its own
      // section (<hr><h4>Guide Tree...) — no separate file to fetch/concat.
      //
      // This page's whole purpose from here is to hand off to the real
      // result — replace it in place (no dead "Running Compute Job" tab
      // left behind) rather than rendering the result inline.
      const blobUrl = URL.createObjectURL(
        new Blob([output], { type: getResultMimeType(format) })
      );
      window.location.replace(blobUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, [status, api, jobId, format]);

  return (
    <div className="ComputeJobPage">
      <h1>Running Compute Job</h1>
      {paramsSummary && <p className="ParamsSummary">{paramsSummary}</p>}
      {status === 'queued' || status === 'in-progress' ? (
        <p className="Status">Status: {status}</p>
      ) : null}
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
